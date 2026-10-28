import React from "react";

export default function PageHeader({ title, crumbs = [], description, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
      <div>
        {crumbs.length > 0 && (
          <p className="text-xs text-slate-500 mb-1">
            {["HMIS", ...crumbs].join("  /  ")}
          </p>
        )}
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">{title}</h1>
        {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
