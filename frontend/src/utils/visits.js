import { PRIORITY_RANK, VISIT_MODULES, VISIT_STATUS } from "./constants";
import { isToday } from "./format";

export const ACTIVE_STATUSES = [VISIT_STATUS.WAITING, VISIT_STATUS.PENDING, VISIT_STATUS.AT_DISPENSARY];

// Which visits show up in a role's "Waiting Patients" queue.
export function queueFor(user, visits) {
  if (!user) return [];
  if (user.role === "doctor") {
    return visits.filter(
      (v) => v.doctorId === user.id && [VISIT_STATUS.WAITING, VISIT_STATUS.PENDING].includes(v.status)
    );
  }
  if (user.role === "dispensary") {
    return visits.filter((v) => v.status === VISIT_STATUS.AT_DISPENSARY);
  }
  if (user.role === "admin") {
    return visits.filter((v) => ACTIVE_STATUSES.includes(v.status));
  }
  return [];
}

export const byQueueOrder = (a, b) =>
  (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9) ||
  new Date(a.createdAt) - new Date(b.createdAt);

export const modulesDone = (visit) => VISIT_MODULES.filter((m) => visit?.modules?.[m.key]).length;

export const allModulesDone = (visit) => modulesDone(visit) === VISIT_MODULES.length;

export const todays = (visits) => visits.filter((v) => isToday(v.createdAt));

export const bmi = (weightKg, heightCm) => {
  const w = parseFloat(weightKg);
  const h = parseFloat(heightCm) / 100;
  if (!w || !h) return null;
  return (w / (h * h)).toFixed(1);
};

// Simple flags so abnormal vitals stand out to the doctor.
export function vitalFlags(v = {}) {
  const f = {};
  const n = (x) => parseFloat(x);
  if (n(v.bpSys) >= 140 || n(v.bpDia) >= 90) f.bp = "High";
  else if (n(v.bpSys) && n(v.bpSys) < 90) f.bp = "Low";
  if (n(v.pulse) > 100) f.pulse = "High";
  else if (n(v.pulse) && n(v.pulse) < 60) f.pulse = "Low";
  if (n(v.temp) >= 100.4) f.temp = "Fever";
  if (n(v.spo2) && n(v.spo2) < 94) f.spo2 = "Low";
  if (n(v.sugar) >= 200) f.sugar = "High";
  else if (n(v.sugar) && n(v.sugar) < 70) f.sugar = "Low";
  return f;
}
