"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

export function CodeViewer({ html, css }: { html?: string; css?: string }) {
  const [tab, setTab] = useState<"html" | "css">("html");

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex border-b border-zinc-200">
        {(["html", "css"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs uppercase tracking-wider transition-colors ${
              tab === t
                ? "text-zinc-900 border-b-2 border-zinc-900"
                : "text-zinc-400 hover:text-zinc-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto">
        <SyntaxHighlighter
          language={tab}
          style={oneLight}
          customStyle={{
            margin: 0,
            borderRadius: 0,
            fontSize: "12px",
            height: "100%",
            background: "#ffffff",
          }}
          showLineNumbers
          lineNumberStyle={{ color: "#d4d4d8", minWidth: "2.5em" }}
        >
          {(tab === "html" ? html : css) ?? ""}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
