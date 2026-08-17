// src/pages/DispensaryIssue.jsx
import React, { useState } from "react";
import {
  IoCheckmarkCircle,
  IoPerson,
  IoAlertCircle,
  IoWarning,
} from "react-icons/io5";
import { FaPills } from "react-icons/fa6";

/* -------------------- Example data (replace with API data) -------------------- */

const PATIENTS = [
  { id: "P-101", name: "John Doe", age: 40, gender: "Male" },
  { id: "P-102", name: "Sara Ali", age: 29, gender: "Female" },
];

// These come from PatientHistory / doctor consultation
const PRESCRIPTIONS = {
  "P-101": [
    { medicine: "Paracetamol", dosage: "500mg", perDay: "2x", days: 5 },
    { medicine: "Cough Syrup", dosage: "10ml", perDay: "3x", days: 7 },
  ],
  "P-102": [{ medicine: "Amoxicillin", dosage: "250mg", perDay: "2x", days: 10 }],
};

// Stock in dispensary
const MEDICINES_LIST = [
  { id: 1, name: "Paracetamol", strength: "500mg", available: 50 },
  { id: 2, name: "Amoxicillin", strength: "250mg", available: 0 },
  { id: 3, name: "Cough Syrup", strength: "10ml", available: 20 },
];

const avatarPalette = [
  "from-blue-500 to-indigo-500",
  "from-emerald-500 to-teal-500",
];

const initials = (name) =>
  name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();

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

const stockStyle = {
  ok: "bg-emerald-700/50 text-emerald-300 ring-1 ring-emerald-500/30",
  out: "bg-rose-700/50 text-rose-300 ring-1 ring-rose-500/30",
  missing: "bg-gray-700/50 text-gray-300 ring-1 ring-gray-500/30",
};

/* -------------------- Main component -------------------- */

const DispensaryIssue = () => {
  const [selectedPatient, setSelectedPatient] = useState("");
  const [issueData, setIssueData] = useState([]);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const showToast = (message, tone = "success") => setToast({ message, tone });

  const patient = PATIENTS.find((p) => p.id === selectedPatient);

  const handleSelectPatient = (patientId) => {
    setSelectedPatient(patientId);
    setErrors({});
    setIssueData(
      PRESCRIPTIONS[patientId]?.map((med) => ({ ...med, quantity: "" })) || []
    );
  };

  const handleUpdateQuantity = (index, value) => {
    setIssueData((prev) => {
      const updated = prev.map((m) => ({ ...m }));
      updated[index].quantity = value;
      return updated;
    });
    if (errors[index]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    }
  };

  const stockFor = (med) =>
    MEDICINES_LIST.find((m) => m.name === med.medicine && m.strength === med.dosage);

  const validate = () => {
    const next = {};
    let anyIssued = false;
    issueData.forEach((med, i) => {
      const stock = stockFor(med);
      if (!med.quantity) return;
      anyIssued = true;
      const qty = Number(med.quantity);
      if (qty <= 0) next[i] = "Enter a quantity greater than 0";
      else if (!stock) next[i] = "Not available in dispensary";
      else if (qty > stock.available) next[i] = `Only ${stock.available} available`;
    });
    if (!anyIssued) next.general = "Enter a quantity for at least one medicine";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast(errors.general || "Please fix the highlighted fields", "error");
      return;
    }
    const toIssue = issueData.filter((m) => m.quantity);
    setSubmitting(true);
    setTimeout(() => {
      console.log("Issued Medicines:", { patient: selectedPatient, medicines: toIssue });
      showToast(`Medicines issued to ${patient?.name}`);
      setIssueData((prev) => prev.map((m) => ({ ...m, quantity: "" })));
      setSubmitting(false);
    }, 500);
  };

  const readyCount = issueData.filter((m) => m.quantity).length;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 pt-40">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Dispensary — Issue Medicines</h1>
          <p className="text-sm text-gray-400">HMIS &gt; Dispensary &gt; Issue</p>
        </div>

        {/* Patient Selection */}
        <div className="bg-[#1f293f] p-6 rounded-2xl shadow-lg border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
              <IoPerson className="text-base" />
            </div>
            <h2 className="text-sm font-semibold text-gray-100">Select Patient</h2>
          </div>
          <select
            value={selectedPatient}
            onChange={(e) => handleSelectPatient(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-gray-900/60 text-gray-100 border border-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">-- Choose Patient --</option>
            {PATIENTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (ID: {p.id}, {p.age}y, {p.gender})
              </option>
            ))}
          </select>

          {patient && (
            <div className="mt-4 flex items-center gap-3 bg-gray-900/40 border border-white/5 rounded-xl p-3">
              <div
                className={`w-9 h-9 shrink-0 rounded-full bg-gradient-to-br ${avatarPalette[0]} flex items-center justify-center text-xs font-semibold`}
              >
                {initials(patient.name)}
              </div>
              <div className="text-sm">
                <p className="font-medium">{patient.name}</p>
                <p className="text-xs text-gray-500">
                  {patient.id} · {patient.age}y · {patient.gender}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Prescription / Issue Form */}
        {selectedPatient && (
          <form
            onSubmit={handleSubmit}
            className="bg-[#1f293f] p-6 rounded-2xl shadow-lg border border-white/5 space-y-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                <FaPills className="text-base" />
              </div>
              <h2 className="text-sm font-semibold text-gray-100">Prescribed Medicines</h2>
            </div>

            {issueData.length === 0 ? (
              <p className="text-gray-500 text-sm">No prescription found for this patient.</p>
            ) : (
              <div className="space-y-3">
                {issueData.map((med, index) => {
                  const stock = stockFor(med);
                  const status = !stock ? "missing" : stock.available === 0 ? "out" : "ok";
                  const rowError = errors[index];
                  return (
                    <div key={index}>
                      <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr_1fr] gap-4 items-center bg-gray-900/40 p-4 rounded-xl border border-white/5">
                        <div>
                          <p className="font-medium text-white">{med.medicine}</p>
                          <p className="text-sm text-gray-500">
                            {med.dosage} · {med.perDay} · {med.days} days
                          </p>
                        </div>

                        <span className={`w-fit px-2.5 py-1 rounded-lg text-xs font-medium ${stockStyle[status]}`}>
                          {status === "missing"
                            ? "Not in dispensary"
                            : status === "out"
                            ? "Out of stock"
                            : `${stock.available} available`}
                        </span>

                        <input
                          type="number"
                          min="1"
                          value={med.quantity}
                          onChange={(e) => handleUpdateQuantity(index, e.target.value)}
                          placeholder="Qty to issue"
                          disabled={!stock || stock.available === 0}
                          className={`p-2.5 rounded-lg bg-gray-900/60 border text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 disabled:opacity-40 disabled:cursor-not-allowed ${
                            rowError
                              ? "border-rose-500/60 focus:ring-rose-500"
                              : "border-gray-700 focus:ring-blue-500"
                          }`}
                        />
                      </div>
                      {rowError && (
                        <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-400">
                          <IoAlertCircle className="shrink-0" /> {rowError}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {errors.general && (
              <p className="flex items-center gap-1 text-xs text-rose-400">
                <IoAlertCircle className="shrink-0" /> {errors.general}
              </p>
            )}

            {issueData.length > 0 && (
              <button
                type="submit"
                disabled={submitting}
                className="cursor-pointer w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition"
              >
                {submitting
                  ? "Issuing..."
                  : readyCount > 0
                  ? `Issue ${readyCount} Medicine${readyCount === 1 ? "" : "s"}`
                  : "Issue Medicines"}
              </button>
            )}
          </form>
        )}
      </div>

      {toast && (
        <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default DispensaryIssue;