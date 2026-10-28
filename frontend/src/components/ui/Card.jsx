import React from "react";

export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`bg-slate-800/80 rounded-xl border border-white/[0.07] shadow-lg shadow-black/10 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ icon: Icon, title, subtitle, action, className = "" }) {
  return (
    <div className={`flex items-start justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-300 flex items-center justify-center shrink-0">
            <Icon className="text-base" />
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-slate-100 leading-tight">{title}</h2>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
