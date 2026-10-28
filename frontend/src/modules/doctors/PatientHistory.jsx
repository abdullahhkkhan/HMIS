// Patient History — the doctor's consultation workspace.
//
// Three modules must be completed for every visit:
//   1. Patient Vitals   2. Health Details   3. Medicine Suggestion
// The visit stays "Pending" until all three are saved. Only then can the
// doctor "Confirm Visit", which sends it to the Dispensary (or completes it
// when no medicines are needed). Previous visits are shown alongside.
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  IoPulse,
  IoDocumentText,
  IoCheckmarkCircle,
  IoSearch,
  IoArrowBack,
  IoTimeOutline,
  IoSaveOutline,
  IoShareSocialOutline,
  IoLockClosed,
} from "react-icons/io5";
import { FaPills } from "react-icons/fa6";
import { LuHistory } from "react-icons/lu";
import { useHmis } from "../../store/HmisStore";
import { DEPARTMENTS, VISIT_MODULES, VISIT_STATUS } from "../../utils/constants";
import { formatMrNo, formatToken, formatWait } from "../../utils/format";
import { byQueueOrder, queueFor } from "../../utils/visits";
import {
  Avatar,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Modal,
  PageHeader,
  PatientBanner,
  PatientTypeBadge,
  PriorityBadge,
  StatusBadge,
  useToast,
} from "../../components/ui";
import { Field, Input, Select, Textarea } from "../../components/forms/Field";
import { validatePrescription } from "../../components/forms/PrescriptionEditor";
import VitalsForm, { EMPTY_VITALS, validateVitals } from "./VitalsForm";
import HealthDetailsForm, { EMPTY_HEALTH, validateHealth } from "./HealthDetailsForm";
import MedicineSuggestion from "./MedicineSuggestion";
import VisitTimeline, { AllergyAlert, knownAllergies } from "./VisitTimeline";

const MODULE_ICONS = { vitals: IoPulse, health: IoDocumentText, medicines: FaPills };

/* =====================================================================
   Workspace for one visit
   ===================================================================== */

function VisitWorkspace({ visit }) {
  const { db, currentUser, patientById, userById, doctors, saveVisitModule, markVisitPending, confirmVisit, referVisit } = useHmis();
  const toast = useToast();
  const navigate = useNavigate();
  const patient = patientById[visit.patientId];

  const editable =
    [VISIT_STATUS.WAITING, VISIT_STATUS.PENDING].includes(visit.status) &&
    (currentUser.role === "admin" || visit.doctorId === currentUser.id);

  // Drafts live here so switching between modules never loses typed data.
  const [vitals, setVitals] = useState(visit.vitals || EMPTY_VITALS);
  const [health, setHealth] = useState(visit.health || { ...EMPTY_HEALTH, complaints: visit.complaint || "" });
  const [rx, setRx] = useState(visit.prescriptions || []);
  const [noMeds, setNoMeds] = useState(!!visit.modules?.medicines && (visit.prescriptions || []).length === 0);
  const [active, setActive] = useState(() => VISIT_MODULES.find((m) => !visit.modules?.[m.key])?.key || "vitals");
  const [errors, setErrors] = useState({});
  const [referOpen, setReferOpen] = useState(false);

  const saved = visit.modules || {};
  const doneCount = VISIT_MODULES.filter((m) => saved[m.key]).length;
  const allDone = doneCount === VISIT_MODULES.length;

  const cleanRx = () => (noMeds ? [] : rx.map((r) => ({ ...r, qty: Number(r.qty), duration: Number(r.duration) })));
  const drafts = { vitals, health, medicines: cleanRx() };
  const savedValue = { vitals: visit.vitals || EMPTY_VITALS, health: visit.health, medicines: visit.prescriptions || [] };
  const isDirty = (key) => JSON.stringify(drafts[key]) !== JSON.stringify(savedValue[key]) || (key === "medicines" && !saved.medicines && noMeds);

  const previousVisits = useMemo(
    () =>
      db.visits
        .filter((v) => v.patientId === patient.id && v.id !== visit.id && v.status !== VISIT_STATUS.CANCELLED)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [db.visits, patient.id, visit.id]
  );
  const allergies = knownAllergies([...previousVisits, { health }]);

  // Opening a waiting visit puts the patient "in consultation".
  useEffect(() => {
    if (editable && visit.status === VISIT_STATUS.WAITING && currentUser.role === "doctor") markVisitPending(visit.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visit.id]);

  const validators = {
    vitals: () => validateVitals(vitals),
    health: () => validateHealth(health),
    medicines: () => {
      if (noMeds) return {};
      if (rx.length === 0) return { _form: "Add at least one medicine, or tick “No medicines required”" };
      return validatePrescription(rx);
    },
  };

  const saveModule = (key) => {
    const errs = validators[key]();
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast(errs._form || "Please fix the highlighted fields", "error");
      return false;
    }
    saveVisitModule(visit.id, key, key === "medicines" ? cleanRx() : drafts[key]);
    return true;
  };

  const saveAndNext = () => {
    if (!saveModule(active)) return;
    const label = VISIT_MODULES.find((m) => m.key === active).label;
    const nextKey = VISIT_MODULES.find((m) => m.key !== active && !saved[m.key])?.key;
    toast(`${label} saved`);
    if (nextKey) setActive(nextKey);
  };

  // Saves whatever is valid and leaves the visit pending.
  const saveAsPending = () => {
    let count = 0;
    VISIT_MODULES.forEach(({ key }) => {
      if (!isDirty(key)) return;
      if (Object.keys(validators[key]()).length === 0) {
        saveVisitModule(visit.id, key, key === "medicines" ? cleanRx() : drafts[key]);
        count++;
      }
    });
    markVisitPending(visit.id);
    toast(`${patient.name} saved as pending${count ? ` (${count} module${count > 1 ? "s" : ""} updated)` : ""}`, "info");
    navigate("/patients");
  };

  const handleConfirm = () => {
    // Every module must be visited/saved (and still valid) before confirming.
    for (const { key, label } of VISIT_MODULES) {
      const errs = validators[key]();
      if (!saved[key] || Object.keys(errs).length) {
        setActive(key);
        setErrors(errs);
        toast(saved[key] ? `Fix ${label} before confirming` : `Complete and save ${label} first`, "error");
        return;
      }
    }
    const result = confirmVisit(visit.id, { vitals, health, prescriptions: cleanRx() });
    toast(
      result === VISIT_STATUS.AT_DISPENSARY
        ? `Visit confirmed — ${patient.name} sent to the dispensary`
        : `Visit confirmed and completed for ${patient.name}`
    );
    navigate(currentUser.role === "doctor" ? "/patients" : "/patient-history");
  };

  const handleRefer = ({ doctorId, department, note }) => {
    // Keep anything already entered so the next doctor sees it.
    VISIT_MODULES.forEach(({ key }) => {
      if (isDirty(key) && Object.keys(validators[key]()).length === 0)
        saveVisitModule(visit.id, key, key === "medicines" ? cleanRx() : drafts[key]);
    });
    referVisit(visit.id, doctorId, department, note);
    toast(`${patient.name} referred to ${userById[doctorId]?.name}`);
    setReferOpen(false);
    navigate(currentUser.role === "doctor" ? "/patients" : "/patient-history");
  };

  const ActiveForm = {
    vitals: <VitalsForm value={vitals} onChange={setVitals} errors={errors} readOnly={!editable} />,
    health: <HealthDetailsForm value={health} onChange={setHealth} errors={errors} readOnly={!editable} />,
    medicines: (
      <MedicineSuggestion
        rows={rx}
        onChange={(r) => { setRx(r); setErrors({}); }}
        noMeds={noMeds}
        onNoMedsChange={(x) => { setNoMeds(x); setErrors({}); }}
        errors={errors}
        readOnly={!editable}
      />
    ),
  }[active];

  const activeMeta = VISIT_MODULES.find((m) => m.key === active);
  const activeIndex = VISIT_MODULES.findIndex((m) => m.key === active);

  return (
    <>
      <div className="flex items-center justify-between gap-3 mb-4">
        <Link to={currentUser.role === "doctor" ? "/patients" : "/patient-history"} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
          <IoArrowBack /> {currentUser.role === "doctor" ? "Waiting Patients" : "Patient History"}
        </Link>
        {visit.status === VISIT_STATUS.PENDING && (
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <IoTimeOutline /> waiting {formatWait(visit.createdAt)}
          </span>
        )}
      </div>

      <div className="space-y-4">
        <PatientBanner patient={patient} visit={visit} doctor={userById[visit.doctorId]} />
        <AllergyAlert allergies={allergies} />
        {visit.complaint && (
          <p className="text-sm text-slate-400">
            <span className="text-slate-500">Reason at registration:</span> {visit.complaint}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        <div className="xl:col-span-2 space-y-4">
          {/* Module navigation */}
          <div className="grid grid-cols-3 gap-2" role="tablist">
            {VISIT_MODULES.map((m, i) => {
              const Icon = MODULE_ICONS[m.key];
              const isActive = active === m.key;
              const done = saved[m.key];
              const dirty = editable && done && isDirty(m.key);
              return (
                <button
                  key={m.key}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => { setActive(m.key); setErrors({}); }}
                  className={`cursor-pointer text-left rounded-xl p-3 sm:p-4 ring-1 ring-inset transition-colors ${
                    isActive ? "bg-slate-800 ring-blue-500/60" : "bg-slate-800/50 ring-white/[0.07] hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${done ? "bg-emerald-500/15 text-emerald-300" : isActive ? "bg-blue-500/15 text-blue-300" : "bg-slate-700/60 text-slate-400"}`}>
                      {done ? <IoCheckmarkCircle /> : <Icon />}
                    </span>
                    <span className="text-[11px] text-slate-500 hidden sm:block">Step {i + 1}</span>
                  </div>
                  <p className={`mt-2 text-sm font-medium ${isActive ? "text-white" : "text-slate-300"}`}>{m.label}</p>
                  <p className={`text-xs ${dirty ? "text-amber-400" : done ? "text-emerald-400" : "text-slate-500"}`}>
                    {dirty ? "Unsaved changes" : done ? "Saved" : "Not done"}
                  </p>
                </button>
              );
            })}
          </div>

          <Card className="p-5">
            <CardHeader
              icon={MODULE_ICONS[active]}
              title={activeMeta.label}
              subtitle={editable ? `Module ${activeIndex + 1} of ${VISIT_MODULES.length}` : "Read only"}
              className="mb-5"
              action={!editable && <IoLockClosed className="text-slate-500" title="Read only" />}
            />
            {errors._form && (
              <p className="mb-4 text-sm text-rose-300 bg-rose-500/10 rounded-lg px-3 py-2">{errors._form}</p>
            )}
            {ActiveForm}
            {editable && (
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-white/10">
                {activeIndex > 0 && (
                  <Button variant="ghost" onClick={() => { setActive(VISIT_MODULES[activeIndex - 1].key); setErrors({}); }}>
                    Back
                  </Button>
                )}
                <Button variant="secondary" icon={IoSaveOutline} onClick={saveAndNext}>
                  {VISIT_MODULES.some((m) => m.key !== active && !saved[m.key]) ? "Save & Next" : `Save ${activeMeta.label}`}
                </Button>
              </div>
            )}
          </Card>

          {/* Visit actions */}
          {editable ? (
            <Card className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {VISIT_MODULES.map((m) => (
                    <span key={m.key} className={`h-1.5 w-7 rounded-full ${saved[m.key] ? "bg-emerald-400" : "bg-slate-600"}`} />
                  ))}
                </div>
                <p className="text-sm text-slate-300">
                  <b className="text-white tabular-nums">{doneCount}/{VISIT_MODULES.length}</b> modules done
                  {!allDone && <span className="text-slate-500"> — visit stays pending</span>}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" icon={IoShareSocialOutline} onClick={() => setReferOpen(true)}>Refer</Button>
                <Button variant="secondary" onClick={saveAsPending}>Save as Pending</Button>
                <Button
                  variant="success"
                  icon={IoCheckmarkCircle}
                  onClick={handleConfirm}
                  disabled={!allDone}
                  title={allDone ? "" : `Save ${VISIT_MODULES.filter((m) => !saved[m.key]).map((m) => m.label).join(", ")} first`}
                >
                  Confirm Visit
                </Button>
              </div>
            </Card>
          ) : (
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <IoLockClosed />
              {[VISIT_STATUS.WAITING, VISIT_STATUS.PENDING].includes(visit.status)
                ? `This visit is assigned to ${userById[visit.doctorId]?.name}.`
                : "This visit has been confirmed and can no longer be edited."}
            </p>
          )}
        </div>

        <Card className="h-fit">
          <div className="p-5 pb-4">
            <CardHeader icon={LuHistory} title="Previous Visits" subtitle={`${previousVisits.length} on record since ${formatMrNo(patient.mrNo)} was registered`} />
          </div>
          <VisitTimeline visits={previousVisits} emptyText="First visit — no previous history." />
        </Card>
      </div>

      <ReferModal
        open={referOpen}
        onClose={() => setReferOpen(false)}
        doctors={doctors.filter((d) => d.id !== visit.doctorId)}
        onSubmit={handleRefer}
      />
    </>
  );
}

function ReferModal({ open, onClose, doctors, onSubmit }) {
  const [department, setDepartment] = useState("General Physician");
  const [doctorId, setDoctorId] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const options = doctors.filter((d) => d.department === department);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title="Refer to another doctor"
      subtitle="The patient moves to that doctor's waiting list. Saved modules are kept."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => (doctorId ? onSubmit({ doctorId, department, note }) : setError("Select a doctor"))}>Refer Patient</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Department">
          <Select value={department} onChange={(e) => { setDepartment(e.target.value); setDoctorId(""); }}>
            {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
          </Select>
        </Field>
        <Field label="Doctor" required error={error}>
          <Select value={doctorId} onChange={(e) => { setDoctorId(e.target.value); setError(""); }} error={error}>
            <option value="">{options.length ? "Select doctor" : "No other doctor in this department"}</option>
            {options.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
        </Field>
        <Field label="Referral Note">
          <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason for referral" />
        </Field>
      </div>
    </Modal>
  );
}

/* =====================================================================
   No visit selected — pick from queue or search any patient's history
   ===================================================================== */

function HistoryLookup() {
  const { db, currentUser, patientById, userById } = useHmis();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const viewPatient = params.get("patient") ? patientById[params.get("patient")] : null;
  const myQueue = useMemo(
    () => (currentUser.role === "doctor" ? queueFor(currentUser, db.visits).sort(byQueueOrder) : []),
    [currentUser, db.visits]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return db.patients
      .filter((p) =>
        [p.name, formatMrNo(p.mrNo), p.contact, p.cnic].join(" ").toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [query, db.patients]);

  const patientVisits = viewPatient
    ? db.visits
        .filter((v) => v.patientId === viewPatient.id && v.status !== VISIT_STATUS.CANCELLED)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : [];
  const openVisit = patientVisits.find((v) => [VISIT_STATUS.WAITING, VISIT_STATUS.PENDING].includes(v.status));

  return (
    <>
      <PageHeader
        title="Patient History"
        crumbs={["Patient History"]}
        description={
          currentUser.role === "doctor"
            ? "Start a visit from your queue, or look up any patient's previous visits."
            : "Look up any patient's vitals, health details and medicines across visits."
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card className="p-5">
            <CardHeader icon={IoSearch} title="Find Patient" subtitle="MR #, name, mobile or CNIC" className="mb-4" />
            <div className="relative">
              <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search patients…" className="pl-9" />
            </div>
            {query.trim().length >= 2 && (
              <ul className="mt-3 divide-y divide-white/5 rounded-lg ring-1 ring-white/10 overflow-hidden">
                {results.length === 0 && <li className="p-4 text-sm text-slate-500">No patient found.</li>}
                {results.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => { setParams({ patient: p.id }); setQuery(""); }}
                      className="cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/[0.04]"
                    >
                      <Avatar name={p.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-slate-100 truncate">{p.name}</p>
                        <p className="text-xs text-slate-500">{formatMrNo(p.mrNo)} · {p.age}y {p.gender}</p>
                      </div>
                      <PatientTypeBadge type={p.type} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {currentUser.role === "doctor" && (
            <Card>
              <div className="p-5 pb-3">
                <CardHeader icon={IoTimeOutline} title="Your Queue" subtitle={`${myQueue.length} waiting or pending`} />
              </div>
              {myQueue.length === 0 ? (
                <EmptyState title="Queue is empty">New patients appear when registration refers them to you.</EmptyState>
              ) : (
                <ul className="divide-y divide-white/5">
                  {myQueue.map((v) => {
                    const p = patientById[v.patientId];
                    return (
                      <li key={v.id}>
                        <button
                          onClick={() => navigate(`/patient-history/${v.id}`)}
                          className="cursor-pointer w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-white/[0.03]"
                        >
                          <span className="font-mono text-xs text-slate-400 w-12">{formatToken(v.token)}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-slate-100 truncate">{p.name}</p>
                            <p className="text-xs text-slate-500 truncate">{v.complaint || "—"}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <PriorityBadge priority={v.priority} />
                            <StatusBadge status={v.status} />
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          )}
        </div>

        <div className="xl:col-span-2">
          {viewPatient ? (
            <div className="space-y-4">
              <PatientBanner
                patient={viewPatient}
                right={
                  openVisit && (currentUser.role === "admin" || openVisit.doctorId === currentUser.id) ? (
                    <Button size="sm" onClick={() => navigate(`/patient-history/${openVisit.id}`)}>Open current visit</Button>
                  ) : null
                }
              />
              <AllergyAlert allergies={knownAllergies(patientVisits)} />
              <Card>
                <div className="p-5 pb-4">
                  <CardHeader
                    icon={LuHistory}
                    title="Visit History"
                    subtitle={`${patientVisits.length} visit(s) · last seen by ${userById[patientVisits[0]?.doctorId]?.name || "—"}`}
                  />
                </div>
                <VisitTimeline visits={patientVisits} />
              </Card>
            </div>
          ) : (
            <Card>
              <EmptyState icon={LuHistory} title="Select a patient">
                Search for a patient to see their vitals, health details and medicines from every visit
                {currentUser.role === "doctor" ? ", or start a visit from your queue." : "."}
              </EmptyState>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

export default function PatientHistory() {
  const { visitId } = useParams();
  const { db } = useHmis();

  if (!visitId) return <HistoryLookup />;
  const visit = db.visits.find((v) => v.id === visitId);
  if (!visit) {
    return (
      <Card>
        <EmptyState icon={LuHistory} title="Visit not found" action={<Link to="/patient-history" className="text-blue-400 text-sm">Back to Patient History</Link>}>
          It may have been cancelled or the link is out of date.
        </EmptyState>
      </Card>
    );
  }
  return <VisitWorkspace key={visit.id} visit={visit} />;
}
