// Dispensary — issue the medicines prescribed in the doctor's Medicine
// Suggestion module, deduct stock and complete the visit.
import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { IoArrowBack, IoCheckmarkCircle, IoMedkit, IoPrintOutline, IoWarning, IoTimeOutline } from "react-icons/io5";
import { FaPills } from "react-icons/fa6";
import { useHmis } from "../../store/HmisStore";
import { VISIT_STATUS } from "../../utils/constants";
import { formatDateTime, formatMrNo, formatToken, formatWait } from "../../utils/format";
import { byQueueOrder } from "../../utils/visits";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Modal,
  PageHeader,
  PatientBanner,
  PriorityBadge,
  useToast,
} from "../../components/ui";
import { inputClass } from "../../components/forms/Field";
import { AllergyAlert, knownAllergies } from "../doctors/VisitTimeline";

function QueueList({ activeId }) {
  const { db, patientById, userById } = useHmis();
  const navigate = useNavigate();
  const queue = db.visits.filter((v) => v.status === VISIT_STATUS.AT_DISPENSARY).sort(byQueueOrder);

  return (
    <Card className="h-fit">
      <div className="p-5 pb-3">
        <CardHeader icon={IoTimeOutline} title="Dispensary Queue" subtitle={`${queue.length} waiting for medicines`} />
      </div>
      {queue.length === 0 ? (
        <EmptyState title="No one is waiting">Patients appear here once the doctor confirms their visit.</EmptyState>
      ) : (
        <ul className="divide-y divide-white/5">
          {queue.map((v) => {
            const p = patientById[v.patientId];
            return (
              <li key={v.id}>
                <button
                  onClick={() => navigate(`/dispensary/${v.id}`)}
                  className={`cursor-pointer w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${
                    activeId === v.id ? "bg-blue-500/10 shadow-[inset_3px_0_0] shadow-blue-500" : "hover:bg-white/[0.03]"
                  }`}
                >
                  <span className="font-mono text-xs text-slate-400 w-12">{formatToken(v.token)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-100 truncate">{p?.name}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {v.prescriptions.length} medicine(s) · {userById[v.doctorId]?.name}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <PriorityBadge priority={v.priority} />
                    <span className="text-[11px] text-slate-500 tabular-nums">{formatWait(v.consultedAt || v.createdAt)}</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

function printPrescription({ patient, visit, doctor, items }) {
  const w = window.open("", "_blank", "width=720,height=800");
  if (!w) return;
  const rows = items
    .map(
      (it, i) =>
        `<tr><td>${i + 1}</td><td><b>${it.name}</b> ${it.strength || ""}</td><td>${it.dose || ""}</td><td>${it.frequency}</td><td>${it.duration} days</td><td>${it.instructions || ""}</td><td style="text-align:right">${it.issue}</td></tr>`
    )
    .join("");
  w.document.write(`<!doctype html><html><head><title>Prescription ${formatMrNo(patient.mrNo)}</title>
  <style>body{font-family:Arial,sans-serif;color:#111;padding:24px;font-size:13px}h1{font-size:18px;margin:0}
  .muted{color:#555}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border-bottom:1px solid #ddd;padding:6px 4px;text-align:left}
  th{font-size:11px;text-transform:uppercase;color:#555}.grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;margin-top:12px}</style></head>
  <body><h1>Hospital Management Information System</h1><div class="muted">Prescription &amp; Dispensing Slip</div>
  <div class="grid"><div>MR #: <b>${formatMrNo(patient.mrNo)}</b></div><div>Token: ${formatToken(visit.token)}</div>
  <div>Patient: <b>${patient.name}</b> (${patient.age}y ${patient.gender})</div><div>Doctor: ${doctor?.name || "-"}</div>
  <div>Diagnosis: ${visit.health?.diagnosis || "-"}</div><div>Date: ${formatDateTime(visit.dispensedAt || new Date())}</div></div>
  <table><thead><tr><th>#</th><th>Medicine</th><th>Dose</th><th>Freq</th><th>Duration</th><th>Instructions</th><th style="text-align:right">Qty</th></tr></thead><tbody>${rows}</tbody></table>
  ${visit.health?.advice ? `<p><b>Advice:</b> ${visit.health.advice}</p>` : ""}
  <script>window.onload=function(){window.print()}</script></body></html>`);
  w.document.close();
}

function DispenseWorkspace({ visit }) {
  const { db, patientById, userById, medicineById, dispenseVisit, currentUser } = useHmis();
  const toast = useToast();
  const navigate = useNavigate();
  const patient = patientById[visit.patientId];
  const done = visit.status === VISIT_STATUS.COMPLETED;
  const canIssue = visit.status === VISIT_STATUS.AT_DISPENSARY;

  const [qty, setQty] = useState(() =>
    Object.fromEntries(
      visit.prescriptions.map((rx) => {
        const stock = medicineById[rx.medicineId]?.stock ?? 0;
        const issued = visit.dispensed?.find((d) => d.medicineId === rx.medicineId)?.qty;
        return [rx.id, String(done ? issued ?? 0 : Math.min(rx.qty, stock))];
      })
    )
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  const items = visit.prescriptions.map((rx) => {
    const med = medicineById[rx.medicineId];
    const stock = med?.stock ?? 0;
    const issue = Number(qty[rx.id]) || 0;
    let state = "full";
    if (!med) state = "missing";
    else if (stock === 0 && !done) state = "out";
    else if (issue < rx.qty) state = "partial";
    const error = !done && med && issue > stock ? `Only ${stock} in stock` : !done && issue < 0 ? "Invalid" : null;
    return { ...rx, med, stock, issue, state, error };
  });

  const hasErrors = items.some((i) => i.error);
  const totalIssue = items.reduce((s, i) => s + i.issue, 0);
  const partialCount = items.filter((i) => i.state !== "full").length;
  const allergies = knownAllergies(db.visits.filter((v) => v.patientId === patient.id));

  const issue = () => {
    dispenseVisit(
      visit.id,
      items.map((i) => ({ medicineId: i.medicineId, name: i.name, qty: i.issue, prescribed: i.qty }))
    );
    setConfirmOpen(false);
    toast(`Medicines issued to ${patient.name} — visit completed`);
    navigate(currentUser.role === "dispensary" ? "/dispensary" : "/patients");
  };

  const STATE_BADGE = {
    full: <Badge tone="emerald">Full</Badge>,
    partial: <Badge tone="amber">Partial</Badge>,
    out: <Badge tone="rose">Out of stock</Badge>,
    missing: <Badge tone="slate">Not in inventory</Badge>,
  };

  return (
    <div className="space-y-4">
      <Link to="/dispensary" className="xl:hidden inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
        <IoArrowBack /> Dispensary Queue
      </Link>
      <PatientBanner patient={patient} visit={visit} doctor={userById[visit.doctorId]} />
      <AllergyAlert allergies={allergies} />

      <Card>
        <div className="p-5 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <CardHeader
            icon={FaPills}
            title={done ? "Issued Medicines" : "Prescribed Medicines"}
            subtitle={
              <>
                Diagnosis: <span className="text-slate-300">{visit.health?.diagnosis || "—"}</span>
              </>
            }
          />
          <Button
            variant="ghost"
            size="sm"
            icon={IoPrintOutline}
            onClick={() => printPrescription({ patient, visit, doctor: userById[visit.doctorId], items })}
          >
            Print Slip
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400 bg-slate-900/40">
                <th className="px-5 py-3 font-medium">Medicine</th>
                <th className="px-5 py-3 font-medium">Directions</th>
                <th className="px-5 py-3 font-medium text-right">Prescribed</th>
                {!done && <th className="px-5 py-3 font-medium text-right">In Stock</th>}
                <th className="px-5 py-3 font-medium w-32">{done ? "Issued" : "Issue Qty"}</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.map((it) => (
                <tr key={it.id} className="align-top">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-100">{it.name}</p>
                    <p className="text-xs text-slate-500">{it.strength} · {it.form}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-300">
                    {it.dose} · {it.frequency} · {it.duration} days
                    <p className="text-xs text-slate-500">{it.instructions}</p>
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-slate-200">{it.qty}</td>
                  {!done && (
                    <td className={`px-5 py-3 text-right tabular-nums ${it.stock === 0 ? "text-rose-400" : it.stock < it.qty ? "text-amber-400" : "text-slate-300"}`}>
                      {it.stock}
                    </td>
                  )}
                  <td className="px-5 py-3">
                    {done ? (
                      <span className="tabular-nums text-slate-100">{it.issue}</span>
                    ) : (
                      <>
                        <input
                          type="number"
                          min="0"
                          max={it.stock}
                          aria-label={`Quantity of ${it.name} to issue`}
                          value={qty[it.id]}
                          disabled={!canIssue || !it.med || it.stock === 0}
                          onChange={(e) => setQty((q) => ({ ...q, [it.id]: e.target.value.replace(/\D/g, "") }))}
                          className={`${inputClass(it.error)} h-9 w-24 text-right tabular-nums`}
                        />
                        {it.error && <p className="text-xs text-rose-400 mt-1">{it.error}</p>}
                      </>
                    )}
                  </td>
                  <td className="px-5 py-3">{STATE_BADGE[it.state]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 sm:px-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {done ? (
            <p className="text-sm text-emerald-300 flex items-center gap-2">
              <IoCheckmarkCircle /> Issued {formatDateTime(visit.dispensedAt)} by {userById[visit.dispensedBy]?.name || "—"}
            </p>
          ) : (
            <p className="text-sm text-slate-400">
              {partialCount > 0 ? (
                <span className="text-amber-300 flex items-center gap-1.5">
                  <IoWarning /> {partialCount} item(s) will be issued partially or not at all.
                </span>
              ) : (
                "All items are available in full."
              )}
            </p>
          )}
          {canIssue && (
            <Button variant="success" icon={IoMedkit} onClick={() => setConfirmOpen(true)} disabled={hasErrors || totalIssue === 0}>
              Issue Medicines
            </Button>
          )}
        </div>
      </Card>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        size="sm"
        title="Issue medicines?"
        subtitle={`${patient.name} · ${formatMrNo(patient.mrNo)}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button variant="success" onClick={issue}>Confirm & Complete Visit</Button>
          </>
        }
      >
        <ul className="text-sm divide-y divide-white/5 rounded-lg ring-1 ring-white/10">
          {items.map((it) => (
            <li key={it.id} className="flex justify-between px-4 py-2">
              <span className="text-slate-200">{it.name} {it.strength}</span>
              <span className={`tabular-nums ${it.issue < it.qty ? "text-amber-300" : "text-slate-100"}`}>
                {it.issue} / {it.qty}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-slate-500 mt-3">Stock will be deducted and the visit marked completed.</p>
      </Modal>
    </div>
  );
}

export default function DispenseMedicine() {
  const { visitId } = useParams();
  const { db } = useHmis();
  const visit = visitId ? db.visits.find((v) => v.id === visitId) : null;

  return (
    <>
      <PageHeader title="Dispensary" crumbs={["Dispensary"]} description="Issue prescribed medicines and complete the patient's visit." />
      <div className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-6">
        <div className="order-2 xl:order-1">
          <QueueList activeId={visitId} />
        </div>
        <div className="order-1 xl:order-2 min-w-0">
          {visit && visit.prescriptions?.length > 0 ? (
            <DispenseWorkspace key={visit.id} visit={visit} />
          ) : (
            <Card>
              <EmptyState icon={IoMedkit} title={visitId ? "Nothing to dispense for this visit" : "Select a patient"}>
                {visitId
                  ? "This visit has no prescribed medicines or could not be found."
                  : "Choose a patient from the dispensary queue to issue their medicines."}
              </EmptyState>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
