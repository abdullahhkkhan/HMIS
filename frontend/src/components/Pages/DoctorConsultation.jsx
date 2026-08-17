// src/pages/DoctorConsultation.jsx
import React, { useMemo, useState } from "react";
import {
  IoCheckmarkCircle,
  IoDocumentText,
  IoAlertCircle,
  IoTrash,
  IoAdd,
  IoWarning,
  IoBandage,
} from "react-icons/io5";
import { FaUserDoctor, FaPills } from "react-icons/fa6";

/* -------------------- Static options (wire to API later) -------------------- */

const DOCTORS = ["Dr. Ali", "Dr. Sara", "Dr. Kamran"];

// Example list of medicines from DB — replace with a real fetch.
const MEDICINE_LIST = [
  { _id: 1, name: "Paracetamol", quantity: 100 },
  { _id: 2, name: "Amoxicillin", quantity: 0 },
  { _id: 3, name: "Cough Syrup", quantity: 50 },
];

const EMPTY_MED = { medicine: "", dosage: "", perDay: "", duration: "", quantity: "" };

const EMPTY_FORM = {
  symptoms: "",
  diagnosis: "",
  notes: "",
  referredDoctor: "",
  confirmVisit: false,
};

/* -------------------- Small shared UI -------------------- */

function Toast({ message, tone = "success", onClose }) {
  React.useEffect(() => {
    const t = setTimeout(onClose, 2800);
    return () => clearTimeout(t);
  }, [onClose]);

  const isError = tone === "error";
  return (
    <div
      className={`fixed bottom-6 right-6 z-[200] flex items-center gap-2 bg-[#1f293f] border px-4 py-3 rounded-xl shadow-2xl ${
        isError ? "border-rose-500/30" : "border-emerald-500/30"
      }`}
    >
      {isError ? (
        <IoWarning className="text-rose-400 text-lg shrink-0" />
      ) : (
        <IoCheckmarkCircle className="text-emerald-400 text-lg shrink-0" />
      )}
      <span className="text-sm">{message}</span>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
        <Icon className="text-base" />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-gray-100">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium text-gray-300">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-rose-400">
          <IoAlertCircle className="shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

const inputBase =
  "w-full p-2.5 rounded-lg bg-gray-900/60 border text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 transition-colors";
const inputOk = "border-gray-700 focus:ring-blue-500 focus:border-blue-500";
const inputErr = "border-rose-500/60 focus:ring-rose-500 focus:border-rose-500";

/* -------------------- Main component -------------------- */

const DoctorConsultation = () => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [medications, setMedications] = useState([{ ...EMPTY_MED }]);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  const showToast = (message, tone = "success") => setToast({ message, tone });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const addMedication = () => {
    setMedications((prev) => [...prev, { ...EMPTY_MED }]);
  };

  const removeMedication = (index) => {
    setMedications((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMedication = (index, field, value) => {
    setMedications((prev) => {
      const updated = prev.map((m) => ({ ...m }));
      updated[index][field] = value;

      const { dosage, perDay, duration } = updated[index];
      if (dosage && perDay && duration) {
        const qty = (parseInt(perDay) || 0) * (parseInt(duration) || 0);
        updated[index].quantity = qty > 0 ? String(qty) : "";
      } else {
        updated[index].quantity = "";
      }
      return updated;
    });
  };

  const stockFor = (name) => MEDICINE_LIST.find((m) => m.name === name);

  const validate = () => {
    const next = {};
    if (!formData.symptoms.trim()) next.symptoms = "Symptoms are required";
    if (!formData.diagnosis.trim()) next.diagnosis = "Diagnosis is required";

    medications.forEach((med, i) => {
      const touched = med.medicine || med.dosage || med.perDay || med.duration;
      if (!touched) return;
      if (!med.medicine) {
        next[`med-${i}`] = "Select a medicine or remove this row";
        return;
      }
      const stock = stockFor(med.medicine);
      if (stock && Number(med.quantity) > stock.quantity) {
        next[`med-${i}`] = `Only ${stock.quantity} in stock`;
      }
    });

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast("Please fix the highlighted fields", "error");
      return;
    }
    const cleanMeds = medications.filter((m) => m.medicine);
    setSaving(true);
    setTimeout(() => {
      console.log("Consultation Data:", { ...formData, medications: cleanMeds });
      showToast("Consultation saved");
      setSaving(false);
    }, 500);
  };

  const totalMedicines = useMemo(
    () => medications.filter((m) => m.medicine).length,
    [medications]
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 pt-40">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Doctor Consultation</h1>
          <p className="text-sm text-gray-400">HMIS &gt; Doctor Consultation</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-[#1f293f] p-6 rounded-2xl shadow-lg border border-white/5 space-y-8"
      >
        {/* Symptoms & Diagnosis */}
        <section>
          <SectionHeader icon={IoBandage} title="Assessment" subtitle="What the patient presented with" />
          <div className="space-y-4">
            <Field label="Symptoms" required error={errors.symptoms}>
              <textarea
                name="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
                rows={3}
                placeholder="Enter patient symptoms..."
                className={`${inputBase} ${errors.symptoms ? inputErr : inputOk} resize-none`}
              />
            </Field>

            <Field label="Diagnosis" required error={errors.diagnosis}>
              <textarea
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                rows={3}
                placeholder="Enter diagnosis..."
                className={`${inputBase} ${errors.diagnosis ? inputErr : inputOk} resize-none`}
              />
            </Field>
          </div>
        </section>

        {/* Prescription */}
        <section>
          <SectionHeader icon={FaPills} title="Prescribed Medicines" subtitle={`${totalMedicines} added`} />

          <div className="space-y-3">
            {medications.map((med, index) => {
              const stock = stockFor(med.medicine);
              const rowError = errors[`med-${index}`];
              return (
                <div key={index}>
                  <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_0.8fr_1fr_1fr_auto] gap-3 bg-gray-900/40 p-4 rounded-xl border border-white/5 items-center">
                    <select
                      value={med.medicine}
                      onChange={(e) => updateMedication(index, "medicine", e.target.value)}
                      className={`${inputBase} ${rowError ? inputErr : inputOk} cursor-pointer`}
                    >
                      <option value="">Select Medicine</option>
                      {MEDICINE_LIST.map((m) => (
                        <option key={m._id} value={m.name} disabled={m.quantity === 0}>
                          {m.name} {m.quantity === 0 ? "(Out of stock)" : `(${m.quantity} available)`}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Dosage (e.g. 500mg)"
                      value={med.dosage}
                      onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                      className={`${inputBase} ${inputOk}`}
                    />

                    <input
                      type="number"
                      min="0"
                      placeholder="Per day"
                      value={med.perDay}
                      onChange={(e) => updateMedication(index, "perDay", e.target.value)}
                      className={`${inputBase} ${inputOk}`}
                    />

                    <input
                      type="number"
                      min="0"
                      placeholder="Duration (days)"
                      value={med.duration}
                      onChange={(e) => updateMedication(index, "duration", e.target.value)}
                      className={`${inputBase} ${inputOk}`}
                    />

                    <input
                      type="text"
                      readOnly
                      value={med.quantity}
                      placeholder="Quantity"
                      className={`${inputBase} bg-gray-800/60 border-gray-700 text-gray-400 cursor-not-allowed`}
                    />

                    <button
                      type="button"
                      onClick={() => removeMedication(index)}
                      disabled={medications.length === 1}
                      title="Remove medicine"
                      className="cursor-pointer justify-self-center p-2 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <IoTrash />
                    </button>
                  </div>
                  {rowError && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-400">
                      <IoAlertCircle className="shrink-0" /> {rowError}
                    </p>
                  )}
                  {!rowError && stock && Number(med.quantity) > 0 && (
                    <p className="mt-1.5 text-xs text-gray-500">
                      {stock.quantity} in stock — leaves {Math.max(stock.quantity - Number(med.quantity), 0)} after this prescription
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={addMedication}
            className="cursor-pointer mt-3 flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium text-white transition"
          >
            <IoAdd /> Add Medicine
          </button>
        </section>

        {/* Notes */}
        <section>
          <SectionHeader icon={IoDocumentText} title="Additional Notes" subtitle="Anything else worth recording" />
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Enter notes..."
            className={`${inputBase} ${inputOk} resize-none`}
          />
        </section>

        {/* Refer & Confirm */}
        <section>
          <SectionHeader icon={FaUserDoctor} title="Referral & Sign-off" subtitle="Wrap up this consultation" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <Field label="Refer to Other Doctor">
              <select
                name="referredDoctor"
                value={formData.referredDoctor}
                onChange={handleChange}
                className={`${inputBase} ${inputOk} cursor-pointer`}
              >
                <option value="">Select Doctor</option>
                {DOCTORS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </Field>

            <label className="flex items-center gap-3 cursor-pointer select-none pb-2.5">
              <input
                type="checkbox"
                name="confirmVisit"
                checked={formData.confirmVisit}
                onChange={handleChange}
                className="cursor-pointer h-5 w-5 rounded bg-gray-900 border-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
              />
              <span className="text-sm text-gray-300">Confirm visit completed</span>
            </label>
          </div>
        </section>

        <button
          type="submit"
          disabled={saving}
          className="cursor-pointer w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition"
        >
          {saving ? "Saving..." : "Save Consultation"}
        </button>
      </form>

      {toast && (
        <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default DoctorConsultation;