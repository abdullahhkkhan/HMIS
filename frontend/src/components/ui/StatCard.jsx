import React from "react";

const ACCENTS = {
  blue: "text-blue-300 bg-blue-500/15",
  amber: "text-amber-300 bg-amber-500/15",
  orange: "text-orange-300 bg-orange-500/15",
  sky: "text-sky-300 bg-sky-500/15",
  emerald: "text-emerald-300 bg-emerald-500/15",
  rose: "text-rose-300 bg-rose-500/15",
  violet: "text-violet-300 bg-violet-500/15",
};

export default function StatCard({ label, value, hint, icon: Icon, accent = "blue", onClick, active }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={`text-left bg-slate-800/80 rounded-xl border p-4 transition-colors ${
        active ? "border-blue-500/60 ring-1 ring-blue-500/40" : "border-white/[0.07]"
      } ${onClick ? "cursor-pointer hover:border-white/20" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        {Icon && (
          <span className={`w-7 h-7 rounded-md flex items-center justify-center ${ACCENTS[accent]}`}>
            <Icon className="text-sm" />
          </span>
        )}
      </div>
      <p className="text-2xl font-semibold mt-2 tabular-nums text-white">{value}</p>
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </Tag>
  );
}
