import React from "react";

export default function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-slate-700/50 text-slate-400 flex items-center justify-center mb-3">
          <Icon className="text-xl" />
        </div>
      )}
      <p className="font-medium text-slate-200">{title}</p>
      {children && <p className="text-sm text-slate-500 mt-1 max-w-sm">{children}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
