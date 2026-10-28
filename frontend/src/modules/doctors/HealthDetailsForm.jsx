// Module 2 — Patient Health Details (history, examination, diagnosis)
import React from "react";
import { Field, Input, Textarea } from "../../components/forms/Field";

export const EMPTY_HEALTH = { complaints: "", history: "", allergies: "", examination: "", diagnosis: "", advice: "", followUp: "" };

export function validateHealth(h) {
  const errs = {};
  if (!h?.complaints?.trim()) errs.complaints = "Presenting complaints are required";
  if (!h?.diagnosis?.trim()) errs.diagnosis = "Diagnosis is required";
  return errs;
}

export default function HealthDetailsForm({ value, onChange, errors = {}, readOnly }) {
  const h = value || EMPTY_HEALTH;
  const set = (k) => (e) => onChange({ ...h, [k]: e.target.value });
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Presenting Complaints" required error={errors.complaints} className="md:col-span-2">
        <Textarea rows={2} value={h.complaints} onChange={set("complaints")} placeholder="e.g. Fever for 3 days with body aches" error={errors.complaints} disabled={readOnly} />
      </Field>
      <Field label="Past Medical History">
        <Textarea rows={2} value={h.history} onChange={set("history")} placeholder="e.g. Hypertensive for 5 years, on amlodipine" disabled={readOnly} />
      </Field>
      <Field label="Drug Allergies">
        <Textarea rows={2} value={h.allergies} onChange={set("allergies")} placeholder="e.g. Penicillin — or 'None known'" disabled={readOnly} />
      </Field>
      <Field label="Examination Findings" className="md:col-span-2">
        <Textarea rows={2} value={h.examination} onChange={set("examination")} placeholder="e.g. Throat congested, chest clear" disabled={readOnly} />
      </Field>
      <Field label="Diagnosis" required error={errors.diagnosis} className="md:col-span-2">
        <Input value={h.diagnosis} onChange={set("diagnosis")} placeholder="e.g. Upper respiratory tract infection" error={errors.diagnosis} disabled={readOnly} />
      </Field>
      <Field label="Advice / Instructions">
        <Textarea rows={2} value={h.advice} onChange={set("advice")} placeholder="e.g. Plenty of fluids, rest for 3 days" disabled={readOnly} />
      </Field>
      <Field label="Follow-up Date">
        <Input type="date" min={today} value={h.followUp} onChange={set("followUp")} disabled={readOnly} />
      </Field>
    </div>
  );
}
