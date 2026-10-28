import React, { useEffect } from "react";
import { IoClose } from "react-icons/io5";

export default function Modal({ open, title, subtitle, onClose, children, footer, size = "md" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  const widths = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-5xl" };

  return (
    <div
      className="fixed inset-0 z-[150] flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${widths[size]} my-8 bg-slate-800 rounded-xl border border-white/10 shadow-2xl flex flex-col max-h-[calc(100vh-4rem)]`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-white/10">
          <div>
            <h3 className="font-semibold text-slate-100">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer -mr-1 p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/5"
            aria-label="Close"
          >
            <IoClose className="text-xl" />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 px-5 py-3 border-t border-white/10 bg-slate-900/30 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
