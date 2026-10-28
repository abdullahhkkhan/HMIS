// Admin: correct a patient's details, referred doctor or prescribed medicines
// by selecting the patient from the list.
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoPerson, IoMedkit, IoTrashOutline } from "react-icons/io5";
import { FaUserDoctor } from "react-icons/fa6";
import { useHmis } from "../../store/HmisStore";
import { DEPARTMENTS, PATIENT_TYPES, PRIORITIES, VISIT_STATUS } from "../../utils/constants";
import { formatCnic, formatMrNo, formatPhone, formatToken } from "../../utils/format";
import { Button, Modal, StatusBadge, useToast } from "../../components/ui";
import { ChoiceGroup, Field, Input, Select, Textarea } from "../../components/forms/Field";
import PrescriptionEditor, { validatePrescription } from "../../components/forms/PrescriptionEditor";

const TABS = [
  { key: "patient", label: "Patient Details", icon: IoPerson },
  { key: "referral", label: "Referred Doctor", icon: FaUserDoctor },
  { key: "medicines", label: "Medicines", icon: IoMedkit },
];

export default function EditVisitModal({ visit, onClose }) {
  const { patientById, doctors, db, medicineById, updatePatient, updateVisit, cancelVisit } = useHmis();
  const toast = useToast();
  const navigate = useNavigate();
  const patient = patientById[visit.patientId];

  const [tab, setTab] = useState("patient");
  const [p, setP] = useState({ ...patient });
  const [v, setV] = useState({
    department: visit.department,
    doctorId: visit.doctorId,
    priority: visit.priority,
    complaint: visit.complaint || "",
  });
  const [rx, setRx] = useState(visit.prescriptions || []);
  const [errors, setErrors] = useState({});
  const [confirmCancel, setConfirmCancel] = useState(false);

  const closed = [VISIT_STATUS.COMPLETED, VISIT_STATUS.CANCELLED].includes(visit.status);
  const deptDoctors = doctors.filter((d) => d.department === v.department);

  const savePatient = () => {
    const e = {};
    if (!p.name.trim()) e.name = "Required";
    if (!p.age || p.age < 0 || p.age > 120) e.age = "Enter a valid age";
    if (p.contact.replace(/\D/g, "").length !== 11) e.contact = "11-digit mobile number";
    if (p.cnic && p.cnic.replace(/\D/g, "").length !== 13) e.cnic = "13 digits";
    setErrors(e);
    if (Object.keys(e).length) return;
    updatePatient(patient.id, { ...p, name: p.name.trim(), age: Number(p.age) });
    toast("Patient details updated");
  };

  const saveReferral = () => {
    if (!v.doctorId) {
      setErrors({ doctorId: "Select a doctor" });
      return;
    }
    const changedDoctor = v.doctorId !== visit.doctorId;
    updateVisit(visit.id, {
      ...v,
      ...(changedDoctor
        ? {
            referrals: [
              ...(visit.referrals || []),
              { fromDoctorId: visit.doctorId, toDoctorId: v.doctorId, department: v.department, note: "Changed by admin", at: new Date().toISOString() },
            ],
          }
        : {}),
    });
    toast(changedDoctor ? `Referred to ${db.users.find((u) => u.id === v.doctorId)?.name}` : "Visit updated");
  };

  const saveMedicines = () => {
    const errs = validatePrescription(rx);
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast("Complete or remove the highlighted medicines", "error");
      return;
    }
    updateVisit(visit.id, { prescriptions: rx.map((r) => ({ ...r, qty: Number(r.qty), duration: Number(r.duration) })) });
    toast("Prescribed medicines updated");
  };

  const footer = closed ? (
    <Button variant="secondary" onClick={onClose}>Close</Button>
  ) : (
    <>
      {confirmCancel ? (
        <div className="mr-auto flex items-center gap-2 text-sm">
          <span className="text-rose-300">Remove from queue?</span>
          <Button size="sm" variant="danger" onClick={() => { cancelVisit(visit.id, "Cancelled by admin"); toast("Visit cancelled", "info"); onClose(); }}>
            Yes, cancel visit
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirmCancel(false)}>No</Button>
        </div>
      ) : (
        <Button variant="danger-ghost" icon={IoTrashOutline} className="mr-auto" onClick={() => setConfirmCancel(true)}>
          Cancel Visit
        </Button>
      )}
      <Button variant="ghost" onClick={onClose}>Close</Button>
      <Button onClick={tab === "patient" ? savePatient : tab === "referral" ? saveReferral : saveMedicines}>
        Save {TABS.find((t) => t.key === tab).label}
      </Button>
    </>
  );

  return (
    <Modal
      open
      size="lg"
      onClose={onClose}
      title={patient.name}
      subtitle={`${formatMrNo(patient.mrNo)} · ${formatToken(visit.token)} · ${visit.department}`}
      footer={footer}
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex gap-1 p-1 rounded-lg bg-slate-900/60 ring-1 ring-white/5 overflow-x-auto">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => { setTab(key); setErrors({}); }}
              className={`cursor-pointer flex items-center gap-1.5 h-8 px-3 rounded-md text-sm whitespace-nowrap ${
                tab === key ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon /> {label}
            </button>
          ))}
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <StatusBadge status={visit.status} />
          <Button size="xs" variant="ghost" onClick={() => navigate(`/patient-history/${visit.id}`)}>Open history →</Button>
        </div>
      </div>

      {tab === "patient" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Patient Name" required error={errors.name}>
            <Input value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} error={errors.name} />
          </Field>
          <Field label="Father / Husband Name">
            <Input value={p.guardian || ""} onChange={(e) => setP({ ...p, guardian: e.target.value })} />
          </Field>
          <Field label="Age" required error={errors.age}>
            <Input type="number" value={p.age} onChange={(e) => setP({ ...p, age: e.target.value })} suffix="years" error={errors.age} />
          </Field>
          <Field label="Gender">
            <ChoiceGroup options={["Male", "Female", "Other"]} value={p.gender} onChange={(g) => setP({ ...p, gender: g })} />
          </Field>
          <Field label="Contact Number" required error={errors.contact}>
            <Input value={p.contact} onChange={(e) => setP({ ...p, contact: formatPhone(e.target.value) })} error={errors.contact} />
          </Field>
          <Field label="CNIC / B-Form" error={errors.cnic}>
            <Input value={p.cnic || ""} onChange={(e) => setP({ ...p, cnic: formatCnic(e.target.value) })} error={errors.cnic} />
          </Field>
          <Field label="Patient Type" className="sm:col-span-2">
            <ChoiceGroup options={PATIENT_TYPES} value={p.type} onChange={(t) => setP({ ...p, type: t })} />
          </Field>
          <Field label="Address" className="sm:col-span-2">
            <Input value={p.address || ""} onChange={(e) => setP({ ...p, address: e.target.value })} />
          </Field>
        </div>
      )}

      {tab === "referral" &&
        (closed ? (
          <p className="text-sm text-slate-400">This visit is {visit.status}; the referral can no longer be changed.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Department">
              <Select value={v.department} onChange={(e) => setV({ ...v, department: e.target.value, doctorId: "" })}>
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </Select>
            </Field>
            <Field label="Referred Doctor" required error={errors.doctorId}>
              <Select value={v.doctorId} onChange={(e) => { setV({ ...v, doctorId: e.target.value }); setErrors({}); }} error={errors.doctorId}>
                <option value="">Select doctor</option>
                {deptDoctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
            </Field>
            <Field label="Priority" className="sm:col-span-2">
              <ChoiceGroup options={PRIORITIES} value={v.priority} onChange={(x) => setV({ ...v, priority: x })} />
            </Field>
            <Field label="Chief Complaint" className="sm:col-span-2">
              <Textarea rows={2} value={v.complaint} onChange={(e) => setV({ ...v, complaint: e.target.value })} />
            </Field>
            {(visit.referrals || []).length > 0 && (
              <div className="sm:col-span-2 text-xs text-slate-400 space-y-1">
                <p className="uppercase tracking-wide text-slate-500">Referral history</p>
                {visit.referrals.map((r, i) => (
                  <p key={i}>
                    {db.users.find((u) => u.id === r.fromDoctorId)?.name} → {db.users.find((u) => u.id === r.toDoctorId)?.name}
                    {r.note ? ` · ${r.note}` : ""}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}

      {tab === "medicines" && (
        <>
          {!closed && visit.status === VISIT_STATUS.WAITING && (
            <p className="text-xs text-slate-500 mb-3">The doctor hasn't seen this patient yet. Medicines added here will appear in the doctor's Medicine Suggestion module.</p>
          )}
          <PrescriptionEditor
            rows={rx}
            onChange={setRx}
            medicines={db.medicines}
            medicineById={medicineById}
            errors={errors}
            readOnly={closed}
          />
        </>
      )}
    </Modal>
  );
}
