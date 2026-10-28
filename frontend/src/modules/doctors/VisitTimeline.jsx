// Previous visits for a patient — the "history" the doctor reviews.
import React, { useState } from "react";
import { IoChevronDown, IoWarning } from "react-icons/io5";
import { useHmis } from "../../store/HmisStore";
import { formatDate, formatTime } from "../../utils/format";
import { bmi } from "../../utils/visits";
import { StatusBadge } from "../../components/ui";

export function knownAllergies(visits) {
  const set = new Set();
  visits.forEach((v) => {
    const a = v.health?.allergies?.trim();
    if (a && !/^(none|nil|no|nkda|none known)\.?$/i.test(a)) set.add(a);
  });
  return [...set];
}

function VitalsLine({ v }) {
  if (!v) return <span className="text-slate-500">Not recorded</span>;
  const parts = [
    v.bpSys && `BP ${v.bpSys}/${v.bpDia}`,
    v.pulse && `Pulse ${v.pulse}`,
    v.temp && `Temp ${v.temp}°F`,
    v.spo2 && `SpO₂ ${v.spo2}%`,
    v.sugar && `Sugar ${v.sugar}`,
    v.weight && `Wt ${v.weight}kg`,
    bmi(v.weight, v.height) && `BMI ${bmi(v.weight, v.height)}`,
  ].filter(Boolean);
  return <span>{parts.join(" · ")}</span>;
}

export default function VisitTimeline({ visits, emptyText = "No previous visits recorded." }) {
  const { userById } = useHmis();
  const [open, setOpen] = useState(visits[0]?.id);

  if (visits.length === 0) return <p className="text-sm text-slate-500 px-5 pb-5">{emptyText}</p>;

  return (
    <ol className="relative px-5 pb-5">
      {visits.map((v, i) => {
        const expanded = open === v.id;
        return (
          <li key={v.id} className="relative pl-6 pb-4 last:pb-0">
            {i < visits.length - 1 && <span className="absolute left-[7px] top-4 bottom-0 w-px bg-white/10" />}
            <span className={`absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 ${expanded ? "border-blue-400 bg-blue-500/30" : "border-slate-600 bg-slate-800"}`} />
            <button onClick={() => setOpen(expanded ? null : v.id)} className="cursor-pointer w-full text-left flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-100">{v.health?.diagnosis || v.complaint || "Visit"}</p>
                <p className="text-xs text-slate-500">
                  {formatDate(v.createdAt)} · {formatTime(v.createdAt)} · {userById[v.doctorId]?.name}
                </p>
              </div>
              <IoChevronDown className={`mt-1 shrink-0 text-slate-500 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>
            {expanded && (
              <div className="mt-3 text-xs space-y-2.5 rounded-lg bg-slate-900/50 ring-1 ring-white/5 p-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">{v.department}</span>
                  <StatusBadge status={v.status} />
                </div>
                <div>
                  <p className="text-slate-500 uppercase tracking-wide text-[10px] mb-0.5">Vitals</p>
                  <p className="text-slate-300"><VitalsLine v={v.vitals} /></p>
                </div>
                {v.health && (
                  <div className="space-y-1.5">
                    <p className="text-slate-500 uppercase tracking-wide text-[10px]">Health details</p>
                    {[
                      ["Complaints", v.health.complaints],
                      ["History", v.health.history],
                      ["Allergies", v.health.allergies],
                      ["Examination", v.health.examination],
                      ["Advice", v.health.advice],
                      ["Follow-up", v.health.followUp && formatDate(v.health.followUp)],
                    ]
                      .filter(([, x]) => x)
                      .map(([k, x]) => (
                        <p key={k} className="text-slate-300">
                          <span className="text-slate-500">{k}: </span>
                          {x}
                        </p>
                      ))}
                  </div>
                )}
                <div>
                  <p className="text-slate-500 uppercase tracking-wide text-[10px] mb-1">Medicines</p>
                  {(v.prescriptions || []).length === 0 ? (
                    <p className="text-slate-500">None prescribed</p>
                  ) : (
                    <ul className="space-y-0.5">
                      {v.prescriptions.map((rx) => (
                        <li key={rx.id} className="text-slate-300">
                          {rx.name} {rx.strength} — {rx.dose} {rx.frequency} × {rx.duration}d
                          <span className="text-slate-500"> (qty {rx.qty})</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function AllergyAlert({ allergies }) {
  if (!allergies.length) return null;
  return (
    <div className="flex items-start gap-2 rounded-lg bg-rose-500/10 ring-1 ring-inset ring-rose-500/30 text-rose-200 text-sm px-4 py-2.5">
      <IoWarning className="mt-0.5 shrink-0 text-rose-400" />
      <span>
        <b>Allergy alert:</b> {allergies.join(", ")}
      </span>
    </div>
  );
}
