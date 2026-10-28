// Editable list of prescribed medicines. Used by the doctor's Medicine
// Suggestion module and by Admin when correcting a prescription.
import React from "react";
import { IoAdd, IoTrash, IoAlertCircle } from "react-icons/io5";
import { FREQUENCIES, MEAL_INSTRUCTIONS } from "../../utils/constants";
import { inputClass } from "./Field";
import Button from "../ui/Button";

const COUNTABLE_FORMS = ["Tablet", "Capsule", "Sachet"];

export const emptyRx = () => ({
  id: Math.random().toString(36).slice(2, 9),
  medicineId: "",
  name: "",
  strength: "",
  form: "",
  dose: "",
  frequency: "BD",
  duration: "",
  qty: "",
  qtyManual: false,
  instructions: "After meal",
});

export const suggestQty = (row) => {
  if (!row.form) return "";
  if (!COUNTABLE_FORMS.includes(row.form)) return 1;
  const perDay = FREQUENCIES.find((f) => f.value === row.frequency)?.perDay || 0;
  const days = parseInt(row.duration, 10) || 0;
  return perDay * days || "";
};

const unitFor = (form) => (COUNTABLE_FORMS.includes(form) ? `${form.toLowerCase()}s` : "units");

// Validates required fields. Returns { [rowId]: message }.
export function validatePrescription(rows) {
  const errs = {};
  rows.forEach((r) => {
    if (!r.medicineId) errs[r.id] = "Select a medicine or remove this row";
    else if (!r.duration || Number(r.duration) <= 0) errs[r.id] = "Enter duration in days";
    else if (!r.qty || Number(r.qty) <= 0) errs[r.id] = "Enter quantity";
  });
  return errs;
}

export default function PrescriptionEditor({ rows, onChange, medicines, medicineById, errors = {}, readOnly = false }) {
  const update = (id, patch) => {
    onChange(
      rows.map((r) => {
        if (r.id !== id) return r;
        let next = { ...r, ...patch };
        if (patch.medicineId !== undefined) {
          const m = medicineById[patch.medicineId];
          next = { ...next, name: m?.name || "", strength: m?.strength || "", form: m?.form || "", qtyManual: false };
          if (!next.dose && m) next.dose = COUNTABLE_FORMS.includes(m.form) ? `1 ${m.form === "Sachet" ? "sachet" : m.form === "Capsule" ? "cap" : "tab"}` : "";
        }
        if (patch.qty !== undefined) next.qtyManual = true;
        if (!next.qtyManual) next.qty = suggestQty(next);
        return next;
      })
    );
  };

  const remove = (id) => onChange(rows.filter((r) => r.id !== id));
  const add = () => onChange([...rows, emptyRx()]);

  if (readOnly) {
    return rows.length === 0 ? (
      <p className="text-sm text-slate-500">No medicines prescribed.</p>
    ) : (
      <ul className="divide-y divide-white/5 rounded-lg ring-1 ring-white/10">
        {rows.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm">
            <span className="text-slate-100 font-medium">
              {r.name} <span className="text-slate-400 font-normal">{r.strength}</span>
            </span>
            <span className="text-slate-400">
              {r.dose} · {r.frequency} · {r.duration} days · {r.instructions} · <b className="text-slate-200">Qty {r.qty}</b>
            </span>
          </li>
        ))}
      </ul>
    );
  }

  const cell = (err) => `${inputClass(err)} h-9`;

  return (
    <div>
      {rows.length > 0 && (
        <div className="hidden lg:grid grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,1.2fr)_2rem] gap-2 px-3 pb-2 text-[11px] uppercase tracking-wide text-slate-500">
          <span>Medicine</span>
          <span>Dose</span>
          <span>Frequency</span>
          <span>Days</span>
          <span>Qty</span>
          <span>Instructions</span>
          <span />
        </div>
      )}
      <div className="space-y-2">
        {rows.map((r, idx) => {
          const m = medicineById[r.medicineId];
          const err = errors[r.id];
          return (
            <div key={r.id}>
              <div
                className={`grid grid-cols-2 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,1.2fr)_2rem] gap-2 items-center p-3 rounded-lg bg-slate-900/40 ring-1 ring-inset ${
                  err ? "ring-rose-500/40" : "ring-white/5"
                }`}
              >
                <select
                  aria-label={`Medicine ${idx + 1}`}
                  value={r.medicineId}
                  onChange={(e) => update(r.id, { medicineId: e.target.value })}
                  className={`${cell(err && !r.medicineId)} col-span-2 lg:col-span-1`}
                >
                  <option value="">Select medicine</option>
                  {medicines.map((med) => (
                    <option key={med.id} value={med.id} disabled={med.stock === 0 && med.id !== r.medicineId}>
                      {med.name} {med.strength} ({med.form}) — {med.stock === 0 ? "out of stock" : `${med.stock} in stock`}
                    </option>
                  ))}
                </select>
                <input
                  aria-label="Dose"
                  value={r.dose}
                  onChange={(e) => update(r.id, { dose: e.target.value })}
                  placeholder="1 tab / 5 ml"
                  className={cell()}
                />
                <select aria-label="Frequency" value={r.frequency} onChange={(e) => update(r.id, { frequency: e.target.value })} className={cell()}>
                  {FREQUENCIES.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
                <input
                  aria-label="Duration in days"
                  type="number"
                  min="1"
                  value={r.duration}
                  onChange={(e) => update(r.id, { duration: e.target.value })}
                  placeholder="Days"
                  className={cell(err && !r.duration)}
                />
                <input
                  aria-label="Quantity"
                  type="number"
                  min="1"
                  value={r.qty}
                  onChange={(e) => update(r.id, { qty: e.target.value })}
                  placeholder="Qty"
                  title={r.form ? `Quantity in ${unitFor(r.form)}` : ""}
                  className={cell(err && !r.qty)}
                />
                <select aria-label="Instructions" value={r.instructions} onChange={(e) => update(r.id, { instructions: e.target.value })} className={cell()}>
                  {MEAL_INSTRUCTIONS.map((i) => <option key={i}>{i}</option>)}
                </select>
                <button
                  type="button"
                  onClick={() => remove(r.id)}
                  title="Remove medicine"
                  aria-label="Remove medicine"
                  className="cursor-pointer justify-self-end lg:justify-self-center w-8 h-8 flex items-center justify-center rounded-md text-slate-500 hover:text-rose-300 hover:bg-rose-500/10"
                >
                  <IoTrash />
                </button>
              </div>
              {err ? (
                <p className="mt-1 ml-1 flex items-center gap-1 text-xs text-rose-400">
                  <IoAlertCircle className="shrink-0" /> {err}
                </p>
              ) : (
                m &&
                r.qty > 0 &&
                (Number(r.qty) > m.stock ? (
                  <p className="mt-1 ml-1 text-xs text-amber-400">
                    Only {m.stock} in stock — dispensary will issue a partial quantity
                  </p>
                ) : (
                  <p className="mt-1 ml-1 text-xs text-slate-500">
                    {m.stock} in stock · {m.stock - Number(r.qty)} left after issue
                  </p>
                ))
              )}
            </div>
          );
        })}
      </div>
      <Button variant="secondary" size="sm" icon={IoAdd} onClick={add} className="mt-3">
        Add Medicine
      </Button>
    </div>
  );
}
