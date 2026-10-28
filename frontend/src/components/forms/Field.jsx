import React from "react";
import { IoAlertCircle } from "react-icons/io5";

export const inputClass = (error) =>
  `w-full h-10 px-3 rounded-lg bg-slate-900/60 border text-sm text-slate-100 placeholder:text-slate-500
   focus:outline-none focus:ring-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed
   ${error ? "border-rose-500/70 focus:ring-rose-500/40" : "border-slate-700 focus:border-blue-500 focus:ring-blue-500/30"}`;

export function Field({ label, required, error, hint, className = "", children, htmlFor }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="block mb-1.5 text-[13px] font-medium text-slate-300">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-400">
          <IoAlertCircle className="shrink-0" /> {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}

export const Input = React.forwardRef(function Input({ error, className = "", suffix, ...props }, ref) {
  if (suffix) {
    return (
      <div className="relative">
        <input ref={ref} className={`${inputClass(error)} pr-14 ${className}`} {...props} />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 pointer-events-none">
          {suffix}
        </span>
      </div>
    );
  }
  return <input ref={ref} className={`${inputClass(error)} ${className}`} {...props} />;
});

export function Select({ error, className = "", children, ...props }) {
  return (
    <select className={`${inputClass(error)} cursor-pointer pr-8 ${className}`} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ error, className = "", rows = 3, ...props }) {
  return (
    <textarea
      rows={rows}
      className={`${inputClass(error)} h-auto py-2 resize-y min-h-[2.5rem] ${className}`}
      {...props}
    />
  );
}

// Segmented single-choice buttons (priority, gender, patient type …)
export function ChoiceGroup({ options, value, onChange, error, getTone }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const v = typeof opt === "string" ? opt : opt.value;
        const label = typeof opt === "string" ? opt : opt.label;
        const active = value === v;
        return (
          <button
            type="button"
            key={v}
            onClick={() => onChange(v)}
            aria-pressed={active}
            className={`cursor-pointer h-9 px-3.5 rounded-lg text-sm font-medium ring-1 ring-inset transition-colors ${
              active
                ? getTone?.(v) || "bg-blue-500/20 text-blue-200 ring-blue-400/50"
                : `bg-slate-900/50 text-slate-400 hover:text-slate-200 ${error ? "ring-rose-500/60" : "ring-slate-700"}`
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
