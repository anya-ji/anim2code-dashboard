"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PageJumper({ totalPages }: { totalPages: number }) {
  const router = useRouter();
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const n = parseInt(value, 10);
    if (!isNaN(n) && n >= 1 && n <= totalPages) {
      router.push(`/?page=${n}`);
      setValue("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
      <span className="text-xs text-zinc-400">go to</span>
      <input
        type="number"
        min={1}
        max={totalPages}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="page"
        className="w-16 px-2 py-1.5 text-xs border border-zinc-300 rounded bg-white text-zinc-900 placeholder-zinc-300 focus:outline-none focus:border-zinc-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </form>
  );
}
