// Central client-side store for HMIS data (patients, visits, medicines, users).
//
// Until the Express/MongoDB backend is ready, data lives in localStorage so the
// whole registration → doctor → dispensary workflow works end-to-end in the
// browser. Each action below maps 1:1 to an endpoint in src/api/*, so wiring the
// backend later means swapping the body of an action for an API call.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { buildSeed } from "./seed";
import { VISIT_MODULES, VISIT_STATUS } from "../utils/constants";
import { isToday } from "../utils/format";

const STORAGE_KEY = "hmis-db-v1";
const SESSION_KEY = "hmis-session-v1";

const uid = (prefix) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const nowIso = () => new Date().toISOString();

function loadDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore corrupt storage */
  }
  return buildSeed();
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const HmisContext = createContext(null);

export function HmisProvider({ children }) {
  const [db, setDb] = useState(loadDb);
  const [sessionUserId, setSessionUserId] = useState(() => loadSession()?.userId || null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch {
      /* storage full / disabled */
    }
  }, [db]);

  useEffect(() => {
    try {
      if (sessionUserId) localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: sessionUserId }));
      else localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }, [sessionUserId]);

  const currentUser = useMemo(
    () => db.users.find((u) => u.id === sessionUserId && u.active) || null,
    [db.users, sessionUserId]
  );

  /* ---------------- helpers ---------------- */

  const patchVisit = useCallback((visitId, fn) => {
    setDb((prev) => ({
      ...prev,
      visits: prev.visits.map((v) => (v.id === visitId ? { ...v, ...fn(v) } : v)),
    }));
  }, []);

  /* ---------------- auth ---------------- */

  const login = useCallback(
    (username, password) => {
      const user = db.users.find(
        (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
      );
      if (!user) return { ok: false, error: "Incorrect username or password" };
      if (!user.active) return { ok: false, error: "This account has been deactivated. Contact the admin." };
      setSessionUserId(user.id);
      return { ok: true, user };
    },
    [db.users]
  );

  const logout = useCallback(() => setSessionUserId(null), []);

  /* ---------------- patients & visits ---------------- */

  // Registers a new patient (MR# generated) and opens a visit token in one step.
  const registerPatient = useCallback(
    (patientData, visitData) => {
      const mrNo = db.counters.mrNo + 1;
      const patient = { ...patientData, id: uid("p"), mrNo, registeredAt: nowIso() };
      const { visit, counters } = makeVisit(db, patient.id, visitData, currentUser?.id);
      setDb((prev) => ({
        ...prev,
        counters: { ...counters, mrNo },
        patients: [patient, ...prev.patients],
        visits: [visit, ...prev.visits],
      }));
      return { patient, visit };
    },
    [db, currentUser]
  );

  // New visit for an already-registered patient (returning patient).
  const createVisit = useCallback(
    (patientId, visitData) => {
      const { visit, counters } = makeVisit(db, patientId, visitData, currentUser?.id);
      setDb((prev) => ({ ...prev, counters: { ...prev.counters, ...counters, mrNo: prev.counters.mrNo }, visits: [visit, ...prev.visits] }));
      return visit;
    },
    [db, currentUser]
  );

  const updatePatient = useCallback((patientId, patch) => {
    setDb((prev) => ({
      ...prev,
      patients: prev.patients.map((p) => (p.id === patientId ? { ...p, ...patch } : p)),
    }));
  }, []);

  const updateVisit = useCallback((visitId, patch) => patchVisit(visitId, () => patch), [patchVisit]);

  // Saves one doctor module (vitals / health / medicines). The visit stays
  // "pending" until every module has been saved at least once.
  const saveVisitModule = useCallback(
    (visitId, moduleKey, data) => {
      patchVisit(visitId, (v) => {
        const field = moduleKey === "medicines" ? "prescriptions" : moduleKey;
        return {
          [field]: data,
          modules: { ...v.modules, [moduleKey]: true },
          status: v.status === VISIT_STATUS.WAITING ? VISIT_STATUS.PENDING : v.status,
          startedAt: v.startedAt || nowIso(),
          updatedBy: currentUser?.id,
        };
      });
    },
    [patchVisit, currentUser]
  );

  const markVisitPending = useCallback(
    (visitId) =>
      patchVisit(visitId, (v) =>
        v.status === VISIT_STATUS.WAITING ? { status: VISIT_STATUS.PENDING, startedAt: nowIso() } : {}
      ),
    [patchVisit]
  );

  // Saves all three modules and closes the doctor's part of the visit.
  // → "at_dispensary" when medicines were prescribed, otherwise "completed".
  const confirmVisit = useCallback(
    (visitId, { vitals, health, prescriptions }) => {
      const result = prescriptions.length > 0 ? VISIT_STATUS.AT_DISPENSARY : VISIT_STATUS.COMPLETED;
      patchVisit(visitId, (v) => ({
        vitals,
        health,
        prescriptions,
        modules: VISIT_MODULES.reduce((acc, m) => ({ ...acc, [m.key]: true }), {}),
        status: result,
        startedAt: v.startedAt || nowIso(),
        consultedAt: nowIso(),
        consultedBy: currentUser?.id,
      }));
      return result;
    },
    [patchVisit, currentUser]
  );

  const referVisit = useCallback(
    (visitId, doctorId, department, note) => {
      patchVisit(visitId, (v) => ({
        doctorId,
        department,
        status: VISIT_STATUS.WAITING,
        referrals: [
          ...(v.referrals || []),
          { fromDoctorId: v.doctorId, toDoctorId: doctorId, department, note, at: nowIso(), by: currentUser?.id },
        ],
      }));
    },
    [patchVisit, currentUser]
  );

  const cancelVisit = useCallback(
    (visitId, reason) =>
      patchVisit(visitId, () => ({ status: VISIT_STATUS.CANCELLED, cancelReason: reason, cancelledAt: nowIso() })),
    [patchVisit]
  );

  // Issues medicines: deducts stock and completes the visit.
  const dispenseVisit = useCallback(
    (visitId, items) => {
      setDb((prev) => {
        const qtyById = {};
        items.forEach((it) => {
          if (it.qty > 0) qtyById[it.medicineId] = (qtyById[it.medicineId] || 0) + it.qty;
        });
        return {
          ...prev,
          medicines: prev.medicines.map((m) =>
            qtyById[m.id] ? { ...m, stock: Math.max(0, m.stock - qtyById[m.id]) } : m
          ),
          visits: prev.visits.map((v) =>
            v.id === visitId
              ? {
                  ...v,
                  status: VISIT_STATUS.COMPLETED,
                  dispensed: items.filter((it) => it.qty > 0),
                  dispensedAt: nowIso(),
                  dispensedBy: currentUser?.id,
                }
              : v
          ),
        };
      });
    },
    [currentUser]
  );

  /* ---------------- medicines ---------------- */

  const addMedicine = useCallback((data) => {
    const med = { ...data, id: uid("m") };
    setDb((prev) => ({ ...prev, medicines: [med, ...prev.medicines] }));
    return med;
  }, []);

  const updateMedicine = useCallback((id, patch) => {
    setDb((prev) => ({
      ...prev,
      medicines: prev.medicines.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));
  }, []);

  const deleteMedicine = useCallback((id) => {
    setDb((prev) => ({ ...prev, medicines: prev.medicines.filter((m) => m.id !== id) }));
  }, []);

  /* ---------------- users ---------------- */

  const addUser = useCallback((data) => {
    const user = { ...data, id: uid("u"), active: true };
    setDb((prev) => ({ ...prev, users: [...prev.users, user] }));
    return user;
  }, []);

  const updateUser = useCallback((id, patch) => {
    setDb((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    }));
  }, []);

  const resetDemoData = useCallback(() => {
    const fresh = buildSeed();
    setDb(fresh);
  }, []);

  /* ---------------- lookups ---------------- */

  const lookups = useMemo(() => {
    const patientById = Object.fromEntries(db.patients.map((p) => [p.id, p]));
    const userById = Object.fromEntries(db.users.map((u) => [u.id, u]));
    const medicineById = Object.fromEntries(db.medicines.map((m) => [m.id, m]));
    const doctors = db.users.filter((u) => u.role === "doctor" && u.active);
    const todaysVisits = db.visits.filter((v) => isToday(v.createdAt));
    return { patientById, userById, medicineById, doctors, todaysVisits };
  }, [db]);

  const value = {
    db,
    ...lookups,
    currentUser,
    login,
    logout,
    registerPatient,
    createVisit,
    updatePatient,
    updateVisit,
    saveVisitModule,
    markVisitPending,
    confirmVisit,
    referVisit,
    cancelVisit,
    dispenseVisit,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    addUser,
    updateUser,
    resetDemoData,
  };

  return <HmisContext.Provider value={value}>{children}</HmisContext.Provider>;
}

function makeVisit(db, patientId, visitData, userId) {
  const todayKey = new Date().toDateString();
  const token = db.counters.tokenDate === todayKey ? db.counters.token + 1 : 1;
  const visit = {
    id: uid("v"),
    patientId,
    token,
    doctorId: visitData.doctorId,
    department: visitData.department,
    priority: visitData.priority || "Normal",
    complaint: visitData.complaint || "",
    status: VISIT_STATUS.WAITING,
    createdAt: nowIso(),
    createdBy: userId,
    modules: { vitals: false, health: false, medicines: false },
    vitals: null,
    health: null,
    prescriptions: [],
    referrals: [],
    dispensed: [],
  };
  return { visit, counters: { ...db.counters, tokenDate: todayKey, token } };
}

export function useHmis() {
  const ctx = useContext(HmisContext);
  if (!ctx) throw new Error("useHmis must be used inside <HmisProvider>");
  return ctx;
}
