"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

type Tab = "html" | "css" | "js";

export function CodeViewer({
  html,
  css,
  js,
}: {
  html?: string;
  css?: string;
  js?: string;
}) {
  const tabs: Tab[] = [
    ...(html ? (["html"] as Tab[]) : []),
    ...(css ? (["css"] as Tab[]) : []),
    ...(js ? (["js"] as Tab[]) : []),
  ];

  const [tab, setTab] = useState<Tab>(tabs[0] ?? "html");

  const content = tab === "html" ? html : tab === "css" ? css : js;
  const language = tab === "js" ? "javascript" : tab;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex border-b border-zinc-200">
        {tabs.map((t) => (
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
          language={language}
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
          {content ?? ""}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
