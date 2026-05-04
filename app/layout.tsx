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
        <header className="border-b border-zinc-200 bg-white px-6 py-4">
          <span className="text-sm font-semibold tracking-widest text-zinc-500 uppercase">
            animation2code benchmark
          </span>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
