import Link from "next/link";
import { notFound } from "next/navigation";
import { adminDb } from "@/lib/firebase-admin";
import type { Animation } from "@/types/animation";
import { CodeViewer } from "./CodeViewer";

async function getAnimation(id: string): Promise<Animation | null> {
  const doc = await adminDb.collection("animations").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as Animation;
}

export default async function AnimationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const anim = await getAnimation(id);
  if (!anim) notFound();

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-57px)]">
      {/* Left: video + meta */}
      <div className="lg:w-2/5 flex flex-col p-6 gap-4 border-b lg:border-b-0 lg:border-r border-zinc-200 bg-white">
        <Link
          href="/"
          className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors w-fit"
        >
          ← back
        </Link>

        <div className="aspect-[4/3] bg-zinc-100 rounded overflow-hidden border border-zinc-200">
          <video
            src={anim.videoUrl}
            controls
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-contain"
          />
        </div>

        <div>
          <h1 className="text-sm font-semibold text-zinc-800 leading-snug">
            {anim.title}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide font-medium ${
                anim.animationType === "css"
                  ? "bg-blue-100 text-blue-700"
                  : anim.animationType === "js"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-zinc-100 text-zinc-500"
              }`}
            >
              {anim.animationType}
            </span>
            {anim.durationS > 0 && (
              <span className="text-xs text-zinc-400">{anim.durationS}s</span>
            )}
            {anim.url && (
              <a
                href={anim.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                CodePen ↗
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Right: code viewer */}
      <div className="flex-1 overflow-hidden">
        <CodeViewer html={anim.html} css={anim.css} />
      </div>
    </div>
  );
}
