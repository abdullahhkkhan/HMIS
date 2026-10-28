// Module 1 — Patient Vitals
import React from "react";
import { Field, Input } from "../../components/forms/Field";
import { Badge } from "../../components/ui";
import { bmi, vitalFlags } from "../../utils/visits";

export const EMPTY_VITALS = { bpSys: "", bpDia: "", pulse: "", temp: "", spo2: "", weight: "", height: "", sugar: "" };

const RANGES = {
  bpSys: [50, 260, "Systolic"],
  bpDia: [30, 160, "Diastolic"],
  pulse: [20, 220, "Pulse"],
  temp: [90, 110, "Temperature"],
  spo2: [50, 100, "SpO₂"],
  weight: [0.5, 300, "Weight"],
  height: [30, 250, "Height"],
  sugar: [20, 700, "Blood sugar"],
};

export function validateVitals(v) {
  const errs = {};
  const filled = Object.values(v || {}).some((x) => String(x || "").trim());
  if (!filled) errs._form = "Record at least one vital sign (e.g. blood pressure, pulse or temperature)";
  Object.entries(RANGES).forEach(([k, [min, max, label]]) => {
    if (v?.[k] === "" || v?.[k] == null) return;
    const n = Number(v[k]);
    if (Number.isNaN(n) || n < min || n > max) errs[k] = `${label} should be ${min}–${max}`;
  });
  if ((v?.bpSys && !v?.bpDia) || (!v?.bpSys && v?.bpDia)) errs.bpSys = "Enter both systolic and diastolic";
  return errs;
}

function Flag({ text }) {
  if (!text) return null;
  return <Badge tone={text === "Low" ? "sky" : "rose"} className="ml-2">{text}</Badge>;
}

export default function VitalsForm({ value, onChange, errors = {}, readOnly }) {
  const v = value || EMPTY_VITALS;
  const flags = vitalFlags(v);
  const set = (k) => (e) => onChange({ ...v, [k]: e.target.value.replace(/[^\d.]/g, "") });
  const bmiVal = bmi(v.weight, v.height);
  const num = { inputMode: "decimal", disabled: readOnly };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Field
        label={<>Blood Pressure <Flag text={flags.bp} /></>}
        error={errors.bpSys || errors.bpDia}
        className="sm:col-span-2 lg:col-span-2"
      >
        <div className="flex items-center gap-2">
          <Input {...num} value={v.bpSys} onChange={set("bpSys")} placeholder="120" error={errors.bpSys} aria-label="Systolic" />
          <span className="text-slate-500">/</span>
          <Input {...num} value={v.bpDia} onChange={set("bpDia")} placeholder="80" suffix="mmHg" error={errors.bpDia} aria-label="Diastolic" />
        </div>
      </Field>
      <Field label={<>Pulse <Flag text={flags.pulse} /></>} error={errors.pulse}>
        <Input {...num} value={v.pulse} onChange={set("pulse")} placeholder="72" suffix="bpm" error={errors.pulse} />
      </Field>
      <Field label={<>Temperature <Flag text={flags.temp} /></>} error={errors.temp}>
        <Input {...num} value={v.temp} onChange={set("temp")} placeholder="98.6" suffix="°F" error={errors.temp} />
      </Field>
      <Field label={<>SpO₂ <Flag text={flags.spo2} /></>} error={errors.spo2}>
        <Input {...num} value={v.spo2} onChange={set("spo2")} placeholder="98" suffix="%" error={errors.spo2} />
      </Field>
      <Field label={<>Blood Sugar (Random) <Flag text={flags.sugar} /></>} error={errors.sugar}>
        <Input {...num} value={v.sugar} onChange={set("sugar")} placeholder="110" suffix="mg/dL" error={errors.sugar} />
      </Field>
      <Field label="Weight" error={errors.weight}>
        <Input {...num} value={v.weight} onChange={set("weight")} placeholder="65" suffix="kg" error={errors.weight} />
      </Field>
      <Field label="Height" error={errors.height}>
        <Input {...num} value={v.height} onChange={set("height")} placeholder="168" suffix="cm" error={errors.height} />
      </Field>
      <div className="sm:col-span-2 lg:col-span-4 flex items-center gap-2 text-sm text-slate-400">
        <span>BMI:</span>
        <span className="text-slate-100 font-medium tabular-nums">{bmiVal || "—"}</span>
        {bmiVal && (
          <Badge tone={bmiVal < 18.5 ? "sky" : bmiVal < 25 ? "emerald" : bmiVal < 30 ? "amber" : "rose"}>
            {bmiVal < 18.5 ? "Underweight" : bmiVal < 25 ? "Normal" : bmiVal < 30 ? "Overweight" : "Obese"}
          </Badge>
        )}
      </div>
    </div>
  );
}
