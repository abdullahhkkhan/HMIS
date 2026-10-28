// Registration page — register a new patient (MR# generated) or open a new
// visit for a returning patient, then issue a token to a doctor's queue.
import React, { useMemo, useState } from "react";
import {
  IoPersonAdd,
  IoSearch,
  IoRefresh,
  IoPrintOutline,
  IoCheckmarkCircle,
  IoPerson,
  IoTicketOutline,
  IoRepeat,
} from "react-icons/io5";
import { FaUserDoctor } from "react-icons/fa6";
import { useHmis } from "../../store/HmisStore";
import { DEPARTMENTS, PATIENT_TYPES, PRIORITIES, VISIT_STATUS } from "../../utils/constants";
import { formatCnic, formatMrNo, formatPhone, formatTime, formatToken, formatDate } from "../../utils/format";
import {
  Avatar,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Modal,
  PageHeader,
  PatientTypeBadge,
  StatusBadge,
  useToast,
} from "../../components/ui";
import { ChoiceGroup, Field, Input, Select, Textarea } from "../../components/forms/Field";

const EMPTY_PATIENT = {
  name: "",
  guardian: "",
  age: "",
  gender: "",
  cnic: "",
  contact: "",
  type: "",
  address: "",
};

const EMPTY_VISIT = { department: "General Physician", doctorId: "", priority: "Normal", complaint: "" };

const PRIORITY_TONE = {
  Emergency: "bg-rose-500/20 text-rose-200 ring-rose-400/50",
  Urgent: "bg-amber-500/20 text-amber-200 ring-amber-400/50",
  Normal: "bg-blue-500/20 text-blue-200 ring-blue-400/50",
};

function printTokenSlip({ patient, visit, doctor }) {
  const w = window.open("", "_blank", "width=380,height=560");
  if (!w) return;
  w.document.write(`<!doctype html><html><head><title>Token ${formatToken(visit.token)}</title>
  <style>body{font-family:Arial,sans-serif;padding:16px;color:#111}h1{font-size:16px;margin:0}
  .t{font-size:44px;font-weight:700;text-align:center;margin:12px 0;letter-spacing:2px}
  table{width:100%;font-size:13px;border-collapse:collapse}td{padding:4px 0;vertical-align:top}td:first-child{color:#555;width:42%}
  .c{text-align:center}.m{font-size:11px;color:#666;margin-top:14px;text-align:center}hr{border:0;border-top:1px dashed #999;margin:10px 0}</style>
  </head><body><div class="c"><h1>Hospital Management Information System</h1><div style="font-size:12px;color:#555">OPD Token</div></div>
  <div class="t">${formatToken(visit.token)}</div><hr/>
  <table><tr><td>MR #</td><td><b>${formatMrNo(patient.mrNo)}</b></td></tr>
  <tr><td>Patient</td><td>${patient.name}</td></tr><tr><td>Age / Gender</td><td>${patient.age}y / ${patient.gender}</td></tr>
  <tr><td>Department</td><td>${visit.department}</td></tr><tr><td>Doctor</td><td>${doctor?.name || "-"}</td></tr>
  <tr><td>Priority</td><td>${visit.priority}</td></tr><tr><td>Date</td><td>${formatDate(visit.createdAt)} ${formatTime(visit.createdAt)}</td></tr></table>
  <hr/><div class="m">Please wait for your token to be called.</div>
  <script>window.onload=function(){window.print()}</script></body></html>`);
  w.document.close();
}

export default function NewPatientForm() {
  const { db, doctors, todaysVisits, patientById, userById, registerPatient, createVisit } = useHmis();
  const toast = useToast();

  const [mode, setMode] = useState("new"); // new | returning
  const [patient, setPatient] = useState(EMPTY_PATIENT);
  const [visit, setVisit] = useState(EMPTY_VISIT);
  const [errors, setErrors] = useState({});
  const [query, setQuery] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [issued, setIssued] = useState(null);

  const selectedPatient = selectedPatientId ? patientById[selectedPatientId] : null;

  // Doctors in the selected department, with their current queue length.
  const deptDoctors = useMemo(
    () =>
      doctors
        .filter((d) => d.department === visit.department)
        .map((d) => ({
          ...d,
          queue: db.visits.filter(
            (v) => v.doctorId === d.id && [VISIT_STATUS.WAITING, VISIT_STATUS.PENDING].includes(v.status)
          ).length,
        })),
    [doctors, db.visits, visit.department]
  );

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const digits = q.replace(/\D/g, "");
    return db.patients
      .filter((p) => {
        if (p.name.toLowerCase().includes(q)) return true;
        if (formatMrNo(p.mrNo).toLowerCase().includes(q)) return true;
        if (digits.length >= 3 && (p.contact.replace(/\D/g, "").includes(digits) || (p.cnic || "").replace(/\D/g, "").includes(digits)))
          return true;
        return /^\d+$/.test(q) && String(p.mrNo) === String(Number(q));
      })
      .slice(0, 6);
  }, [query, db.patients]);

  const clearError = (name) => setErrors((p) => ({ ...p, [name]: undefined }));

  const setP = (name, value) => {
    const formatted = name === "cnic" ? formatCnic(value) : name === "contact" ? formatPhone(value) : value;
    setPatient((p) => ({ ...p, [name]: formatted }));
    clearError(name);
  };

  const setV = (name, value) => {
    setVisit((v) => ({ ...v, [name]: value, ...(name === "department" ? { doctorId: "" } : {}) }));
    clearError(name);
  };

  const validate = () => {
    const next = {};
    if (mode === "new") {
      if (!patient.name.trim()) next.name = "Patient name is required";
      if (!patient.age) next.age = "Age is required";
      else if (Number(patient.age) < 0 || Number(patient.age) > 120) next.age = "Enter an age between 0 and 120";
      if (!patient.gender) next.gender = "Select gender";
      if (!patient.contact) next.contact = "Contact number is required";
      else if (patient.contact.replace(/\D/g, "").length !== 11) next.contact = "Enter an 11-digit mobile number (03xx-xxxxxxx)";
      if (patient.cnic && patient.cnic.replace(/\D/g, "").length !== 13) next.cnic = "CNIC must be 13 digits";
      if (patient.cnic && db.patients.some((p) => p.cnic === patient.cnic))
        next.cnic = "A patient with this CNIC already exists — use Returning Patient";
      if (!patient.type) next.type = "Select patient type";
    } else if (!selectedPatient) {
      next.search = "Search and select a patient first";
    }
    if (!visit.department) next.department = "Select department";
    if (!visit.doctorId) next.doctorId = "Select the doctor to refer to";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast("Please complete the highlighted fields", "error");
      return;
    }
    if (mode === "new") {
      const data = { ...patient, name: patient.name.trim(), age: Number(patient.age) };
      const res = registerPatient(data, visit);
      setIssued({ patient: res.patient, visit: res.visit, isNew: true });
    } else {
      const v = createVisit(selectedPatient.id, visit);
      setIssued({ patient: selectedPatient, visit: v, isNew: false });
    }
  };

  const resetAll = () => {
    setPatient(EMPTY_PATIENT);
    setVisit(EMPTY_VISIT);
    setErrors({});
    setQuery("");
    setSelectedPatientId(null);
  };

  const finish = () => {
    setIssued(null);
    resetAll();
  };

  const todaysTokens = [...todaysVisits].sort((a, b) => b.token - a.token);
  const activeVisitForSelected =
    selectedPatient &&
    db.visits.find(
      (v) => v.patientId === selectedPatient.id && [VISIT_STATUS.WAITING, VISIT_STATUS.PENDING, VISIT_STATUS.AT_DISPENSARY].includes(v.status)
    );

  return (
    <>
      <PageHeader
        title="Patient Registration"
        crumbs={["Registration"]}
        description="Register the patient and issue a token to the referred doctor."
        actions={
          <div className="inline-flex p-1 rounded-lg bg-slate-800 ring-1 ring-white/10">
            {[
              { k: "new", label: "New Patient", icon: IoPersonAdd },
              { k: "returning", label: "Returning Patient", icon: IoRepeat },
            ].map(({ k, label, icon: Icon }) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setMode(k);
                  setErrors({});
                }}
                className={`cursor-pointer flex items-center gap-1.5 h-8 px-3 rounded-md text-sm font-medium transition-colors ${
                  mode === k ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon /> {label}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} noValidate className="xl:col-span-2 space-y-6">
          {mode === "new" ? (
            <Card className="p-5">
              <CardHeader icon={IoPerson} title="Patient Information" subtitle="A new MR number is generated on save" className="mb-5" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Patient Name" required error={errors.name}>
                  <Input value={patient.name} onChange={(e) => setP("name", e.target.value)} placeholder="e.g. Muhammad Asif" error={errors.name} autoFocus />
                </Field>
                <Field label="Father / Husband Name" error={errors.guardian}>
                  <Input value={patient.guardian} onChange={(e) => setP("guardian", e.target.value)} placeholder="e.g. Abdul Rehman" />
                </Field>
                <Field label="Age" required error={errors.age}>
                  <Input type="number" min="0" max="120" value={patient.age} onChange={(e) => setP("age", e.target.value)} placeholder="e.g. 34" suffix="years" error={errors.age} />
                </Field>
                <Field label="Gender" required error={errors.gender}>
                  <ChoiceGroup options={["Male", "Female", "Other"]} value={patient.gender} onChange={(v) => setP("gender", v)} error={errors.gender} />
                </Field>
                <Field label="Contact Number" required error={errors.contact}>
                  <Input inputMode="numeric" value={patient.contact} onChange={(e) => setP("contact", e.target.value)} placeholder="03xx-xxxxxxx" error={errors.contact} />
                </Field>
                <Field label="CNIC / B-Form" error={errors.cnic} hint="Optional for children">
                  <Input inputMode="numeric" value={patient.cnic} onChange={(e) => setP("cnic", e.target.value)} placeholder="42101-1234567-1" error={errors.cnic} />
                </Field>
                <Field label="Patient Type" required error={errors.type} className="md:col-span-2">
                  <ChoiceGroup options={PATIENT_TYPES} value={patient.type} onChange={(v) => setP("type", v)} error={errors.type} />
                </Field>
                <Field label="Address" className="md:col-span-2">
                  <Input value={patient.address} onChange={(e) => setP("address", e.target.value)} placeholder="House / street / area, city" />
                </Field>
              </div>
            </Card>
          ) : (
            <Card className="p-5">
              <CardHeader icon={IoSearch} title="Find Patient" subtitle="Search by MR #, name, mobile number or CNIC" className="mb-4" />
              <Field error={errors.search}>
                <div className="relative">
                  <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <Input
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      clearError("search");
                    }}
                    placeholder="e.g. MR-000004, 0300-1234567, Asif"
                    className="pl-9"
                    autoFocus
                    error={errors.search}
                  />
                </div>
              </Field>

              {query.trim().length >= 2 && !selectedPatient && (
                <div className="mt-3 rounded-lg border border-white/10 divide-y divide-white/5 overflow-hidden">
                  {searchResults.length === 0 ? (
                    <p className="text-sm text-slate-500 p-4">
                      No patient found.{" "}
                      <button type="button" className="cursor-pointer text-blue-400 hover:underline" onClick={() => setMode("new")}>
                        Register as new patient
                      </button>
                    </p>
                  ) : (
                    searchResults.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setSelectedPatientId(p.id)}
                        className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.04]"
                      >
                        <Avatar name={p.name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-100 truncate">{p.name}</p>
                          <p className="text-xs text-slate-500 truncate">
                            {formatMrNo(p.mrNo)} · {p.age}y {p.gender} · {p.contact}
                          </p>
                        </div>
                        <PatientTypeBadge type={p.type} />
                      </button>
                    ))
                  )}
                </div>
              )}

              {selectedPatient && (
                <div className="mt-4 rounded-lg bg-slate-900/50 ring-1 ring-blue-500/30 p-4">
                  <div className="flex items-start gap-3">
                    <Avatar name={selectedPatient.name} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-white">{selectedPatient.name}</p>
                        <PatientTypeBadge type={selectedPatient.type} />
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatMrNo(selectedPatient.mrNo)} · {selectedPatient.age}y {selectedPatient.gender} · {selectedPatient.contact}
                        {selectedPatient.guardian && ` · S/D/W of ${selectedPatient.guardian}`}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {db.visits.filter((v) => v.patientId === selectedPatient.id).length} previous visit(s) · registered{" "}
                        {formatDate(selectedPatient.registeredAt)}
                      </p>
                    </div>
                    <Button size="xs" variant="ghost" onClick={() => setSelectedPatientId(null)}>
                      Change
                    </Button>
                  </div>
                  {activeVisitForSelected && (
                    <p className="mt-3 text-xs text-amber-300 bg-amber-500/10 rounded-md px-3 py-2">
                      This patient already has an open visit today ({formatToken(activeVisitForSelected.token)},{" "}
                      {userById[activeVisitForSelected.doctorId]?.name}).
                    </p>
                  )}
                </div>
              )}
            </Card>
          )}

          <Card className="p-5">
            <CardHeader icon={FaUserDoctor} title="Visit & Referral" subtitle="Which doctor's queue this token goes to" className="mb-5" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Department" required error={errors.department}>
                <Select value={visit.department} onChange={(e) => setV("department", e.target.value)} error={errors.department}>
                  {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                </Select>
              </Field>
              <Field label="Referred Doctor" required error={errors.doctorId}>
                <Select value={visit.doctorId} onChange={(e) => setV("doctorId", e.target.value)} error={errors.doctorId}>
                  <option value="">{deptDoctors.length ? "Select doctor" : "No doctor available"}</option>
                  {deptDoctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.queue} in queue
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Priority" required className="md:col-span-2">
                <ChoiceGroup options={PRIORITIES} value={visit.priority} onChange={(v) => setV("priority", v)} getTone={(v) => PRIORITY_TONE[v]} />
              </Field>
              <Field label="Chief Complaint / Reason for Visit" className="md:col-span-2">
                <Textarea rows={2} value={visit.complaint} onChange={(e) => setV("complaint", e.target.value)} placeholder="e.g. Fever for 3 days" />
              </Field>
            </div>
          </Card>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
            <Button variant="ghost" icon={IoRefresh} onClick={resetAll}>Clear</Button>
            <Button type="submit" size="lg" icon={IoTicketOutline}>
              {mode === "new" ? "Register & Issue Token" : "Issue Token"}
            </Button>
          </div>
        </form>

        <Card className="h-fit xl:sticky xl:top-32">
          <div className="p-5 pb-3">
            <CardHeader icon={IoTicketOutline} title="Today's Tokens" subtitle={`${todaysTokens.length} issued today`} />
          </div>
          {todaysTokens.length === 0 ? (
            <EmptyState title="No tokens yet">Registered patients will appear here.</EmptyState>
          ) : (
            <ul className="divide-y divide-white/5 max-h-[560px] overflow-y-auto">
              {todaysTokens.map((v) => {
                const p = patientById[v.patientId];
                return (
                  <li key={v.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="w-14 shrink-0 font-mono text-xs text-slate-400">{formatToken(v.token)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-100 truncate">{p?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{userById[v.doctorId]?.name} · {formatTime(v.createdAt)}</p>
                    </div>
                    <StatusBadge status={v.status} />
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <Modal
        open={!!issued}
        onClose={finish}
        size="sm"
        title={issued?.isNew ? "Patient registered" : "Token issued"}
        footer={
          <>
            <Button
              variant="secondary"
              icon={IoPrintOutline}
              onClick={() => printTokenSlip({ ...issued, doctor: userById[issued.visit.doctorId] })}
            >
              Print Slip
            </Button>
            <Button onClick={finish}>Register Next</Button>
          </>
        }
      >
        {issued && (
          <div className="text-center">
            <IoCheckmarkCircle className="text-emerald-400 text-4xl mx-auto mb-2" />
            <p className="text-xs uppercase tracking-wide text-slate-400">Token</p>
            <p className="text-4xl font-semibold tabular-nums text-white my-1">{formatToken(issued.visit.token)}</p>
            <div className="mt-4 text-sm rounded-lg bg-slate-900/50 divide-y divide-white/5 text-left">
              {[
                ["MR #", formatMrNo(issued.patient.mrNo)],
                ["Patient", issued.patient.name],
                ["Doctor", userById[issued.visit.doctorId]?.name],
                ["Department", issued.visit.department],
                ["Priority", issued.visit.priority],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between px-4 py-2">
                  <span className="text-slate-400">{k}</span>
                  <span className="text-slate-100 font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
