import React from "react";
import { VISIT_STATUS_LABELS, ROLE_LABELS } from "../../utils/constants";

const TONES = {
  slate: "bg-slate-500/15 text-slate-300 ring-slate-400/20",
  blue: "bg-blue-500/15 text-blue-300 ring-blue-400/25",
  sky: "bg-sky-500/15 text-sky-300 ring-sky-400/25",
  emerald: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/25",
  amber: "bg-amber-500/15 text-amber-300 ring-amber-400/25",
  orange: "bg-orange-500/15 text-orange-300 ring-orange-400/25",
  rose: "bg-rose-500/15 text-rose-300 ring-rose-400/25",
  violet: "bg-violet-500/15 text-violet-300 ring-violet-400/25",
};

export default function Badge({ tone = "slate", className = "", children, dot = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset whitespace-nowrap ${TONES[tone]} ${className}`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

const STATUS_TONE = {
  waiting: "amber",
  pending: "orange",
  at_dispensary: "sky",
  completed: "emerald",
  cancelled: "slate",
};

export function StatusBadge({ status }) {
  return (
    <Badge tone={STATUS_TONE[status]} dot>
      {VISIT_STATUS_LABELS[status] || status}
    </Badge>
  );
}

const PRIORITY_TONE = { Emergency: "rose", Urgent: "amber", Normal: "slate" };

export function PriorityBadge({ priority }) {
  return <Badge tone={PRIORITY_TONE[priority] || "slate"}>{priority}</Badge>;
}

const ROLE_TONE = { admin: "rose", registration: "amber", doctor: "blue", dispensary: "violet" };

export function RoleBadge({ role }) {
  return <Badge tone={ROLE_TONE[role] || "slate"}>{ROLE_LABELS[role] || role}</Badge>;
}

const TYPE_TONE = { Zakat: "emerald", Welfare: "sky", Private: "amber", Staff: "violet" };

export function PatientTypeBadge({ type }) {
  if (!type) return null;
  return <Badge tone={TYPE_TONE[type] || "slate"}>{type}</Badge>;
}
