import React from "react";

const VARIANTS = {
  primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-900/30",
  success: "bg-emerald-600 hover:bg-emerald-500 text-white",
  danger: "bg-rose-600 hover:bg-rose-500 text-white",
  secondary: "bg-slate-700/70 hover:bg-slate-700 text-slate-100 ring-1 ring-inset ring-white/10",
  ghost: "text-slate-300 hover:text-white hover:bg-white/5",
  "danger-ghost": "text-slate-400 hover:text-rose-300 hover:bg-rose-500/10",
};

const SIZES = {
  xs: "h-7 px-2.5 text-xs gap-1",
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-[15px] gap-2",
  icon: "h-8 w-8 justify-center",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  icon: Icon,
  loading = false,
  children,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        Icon && <Icon className="shrink-0 text-[1.05em]" />
      )}
      {children}
    </button>
  );
}
