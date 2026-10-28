import React from "react";
import Avatar from "./Avatar";
import { PatientTypeBadge, PriorityBadge, StatusBadge } from "./Badge";
import { formatMrNo, formatToken, formatTime } from "../../utils/format";

// Compact patient + visit summary shown at the top of clinical pages.
export default function PatientBanner({ patient, visit, doctor, right }) {
  if (!patient) return null;
  const items = [
    ["MR #", formatMrNo(patient.mrNo)],
    ["Age / Gender", `${patient.age}y · ${patient.gender}`],
    ["Contact", patient.contact],
    visit && ["Token", `${formatToken(visit.token)} · ${formatTime(visit.createdAt)}`],
    visit && ["Doctor", doctor?.name || "—"],
  ].filter(Boolean);

  return (
    <div className="bg-slate-800/80 rounded-xl border border-white/[0.07] p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center gap-4">
      <div className="flex items-center gap-3 min-w-0 lg:w-72 lg:shrink-0">
        <Avatar name={patient.name} size="lg" />
        <div className="min-w-0">
          <p className="text-lg font-semibold text-white truncate">{patient.name}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            <PatientTypeBadge type={patient.type} />
            {visit && <PriorityBadge priority={visit.priority} />}
            {visit && <StatusBadge status={visit.status} />}
          </div>
        </div>
      </div>
      <dl className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-x-6 gap-y-2 text-sm flex-1">
        {items.map(([k, v]) => (
          <div key={k} className="min-w-0">
            <dt className="text-xs text-slate-500">{k}</dt>
            <dd className="text-slate-100 truncate">{v}</dd>
          </div>
        ))}
      </dl>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}
