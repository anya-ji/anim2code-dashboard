import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "animation2code benchmark",
  description: "Animation-to-code benchmark dataset browser",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-50 text-zinc-900 min-h-screen font-mono">
        <header className="border-b border-zinc-200 bg-white px-6 py-3 flex items-center justify-between gap-4">
          <span className="text-sm font-semibold tracking-widest text-zinc-500 uppercase">
            animation2code benchmark
          </span>
          <span className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
          For best compatibility, please view this dashboard in a Chrome browser.
          </span>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
