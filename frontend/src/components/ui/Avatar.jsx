import React from "react";
import { initials } from "../../utils/format";

const PALETTE = [
  "bg-blue-500/20 text-blue-200",
  "bg-emerald-500/20 text-emerald-200",
  "bg-amber-500/20 text-amber-200",
  "bg-fuchsia-500/20 text-fuchsia-200",
  "bg-cyan-500/20 text-cyan-200",
  "bg-violet-500/20 text-violet-200",
];

const hash = (s = "") => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

export default function Avatar({ name, size = "md" }) {
  const sizes = { sm: "w-7 h-7 text-[10px]", md: "w-9 h-9 text-xs", lg: "w-12 h-12 text-sm" };
  return (
    <div
      className={`${sizes[size]} ${PALETTE[hash(name) % PALETTE.length]} shrink-0 rounded-full flex items-center justify-center font-semibold ring-1 ring-inset ring-white/10`}
    >
      {initials(name)}
    </div>
  );
}
