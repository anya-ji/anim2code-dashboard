import Link from "next/link";
import { adminDb } from "@/lib/firebase-admin";
import { FieldPath } from "firebase-admin/firestore";
import { PageJumper } from "./PageJumper";

const PAGE_SIZE = 15;

type AnimationSummary = {
  id: string;
  title: string;
  animationType: string;
  durationS: number;
  videoUrl: string;
};

async function getPage(page: number): Promise<{ items: AnimationSummary[]; total: number }> {
  const offset = (page - 1) * PAGE_SIZE;

  const [snap, countSnap] = await Promise.all([
    adminDb
      .collection("animations")
      .orderBy(FieldPath.documentId())
      .select("title", "animationType", "durationS", "videoUrl")
      .offset(offset)
      .limit(PAGE_SIZE)
      .get(),
    adminDb.collection("animations").count().get(),
  ]);

  const items = snap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<AnimationSummary, "id">),
  }));
  const total = countSnap.data().count;

  return { items, total };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const { items, total } = await getPage(page);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="px-6 py-6">
      {/* Count + legend */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-zinc-400">
          {start}–{end} of {total}
        </p>
        <div className="flex items-center gap-3 text-[10px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase font-medium">css</span>
            CSS-based animation
          </span>
          <span className="flex items-center gap-1.5">
            <span className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded uppercase font-medium">js</span>
            JS-based animation
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {items.map((anim) => (
          <Link key={anim.id} href={`/${anim.id}`} className="group block">
            <div className="aspect-[4/3] bg-zinc-100 rounded overflow-hidden border border-zinc-200 group-hover:border-zinc-400 transition-colors">
              <video
                src={anim.videoUrl}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-contain"
              />
            </div>
            <div className="mt-2 px-0.5">
              <p className="text-xs text-zinc-700 truncate leading-tight">
                {anim.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
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
                  <span className="text-[10px] text-zinc-400">
                    {anim.durationS}s
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-3 mt-10">
        {page > 1 ? (
          <Link
            href={`/?page=${page - 1}`}
            className="px-3 py-1.5 text-xs border border-zinc-300 rounded hover:bg-zinc-100 transition-colors"
          >
            ← Previous
          </Link>
        ) : (
          <span className="px-3 py-1.5 text-xs text-zinc-300 border border-zinc-200 rounded cursor-not-allowed">
            ← Previous
          </span>
        )}
        <span className="text-xs text-zinc-500">
          {page} / {totalPages}
        </span>
        <PageJumper totalPages={totalPages} />
        {page < totalPages ? (
          <Link
            href={`/?page=${page + 1}`}
            className="px-3 py-1.5 text-xs border border-zinc-300 rounded hover:bg-zinc-100 transition-colors"
          >
            Next →
          </Link>
        ) : (
          <span className="px-3 py-1.5 text-xs text-zinc-300 border border-zinc-200 rounded cursor-not-allowed">
            Next →
          </span>
        )}
      </div>
    </div>
  );
}
