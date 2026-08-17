// src/pages/PatientRegistrationPage.jsx
import React, { useMemo, useState } from "react";
import {
  IoCheckmarkCircle,
  IoPersonAdd,
  IoCall,
  IoLocationSharp,
  IoDocumentText,
  IoRefresh,
  IoAlertCircle,
} from "react-icons/io5";
import { FaUserDoctor } from "react-icons/fa6";
import { MdOutlinePriorityHigh } from "react-icons/md";

/* -------------------- Static options (wire to API later) -------------------- */

const DOCTORS = ["Dr. Ahmed", "Dr. Sara", "Dr. Kamran"];
const DEPARTMENTS = ["Cardiology", "Orthopedics", "Neurology", "General"];
const PATIENT_TYPES = [
  { value: "Zakat", style: "bg-emerald-700/50 text-emerald-300 ring-1 ring-emerald-500/30" },
  { value: "Welfare", style: "bg-blue-700/50 text-blue-300 ring-1 ring-blue-500/30" },
  { value: "Private", style: "bg-amber-700/50 text-amber-300 ring-1 ring-amber-500/30" },
  { value: "Angio", style: "bg-rose-700/50 text-rose-300 ring-1 ring-rose-500/30" },
];

const PRIORITIES = [
  { value: "Urgent", style: "bg-rose-700/50 text-rose-300 ring-1 ring-rose-500/30" },
  { value: "Normal", style: "bg-blue-700/50 text-blue-300 ring-1 ring-blue-500/30" },
  { value: "Low", style: "bg-gray-700/50 text-gray-300 ring-1 ring-gray-500/30" },
];

const avatarPalette = [
  "from-blue-500 to-indigo-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-fuchsia-500 to-pink-500",
  "from-cyan-500 to-sky-500",
  "from-violet-500 to-purple-500",
];

const EMPTY_FORM = {
  name: "",
  age: "",
  gender: "",
  contact: "",
  address: "",
  cnic: "",
  guardian: "",
  doctor: "",
  department: "",
  type: "",
  priority: "",
  notes: "",
};

const initials = (name) =>
  name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const formatCnic = (raw) => {
  const digits = raw.replace(/\D/g, "").slice(0, 13);
  const parts = [digits.slice(0, 5), digits.slice(5, 12), digits.slice(12, 13)];
  return parts.filter(Boolean).join("-");
};

/* -------------------- Small shared UI -------------------- */

function Toast({ message, onClose }) {
  React.useEffect(() => {
    const t = setTimeout(onClose, 2800);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-2 bg-[#1f293f] border border-emerald-500/30 text-white px-4 py-3 rounded-xl shadow-2xl animate-[fadeIn_0.2s_ease-out]">
      <IoCheckmarkCircle className="text-emerald-400 text-lg shrink-0" />
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

const PatientRegistrationPage = () => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [recent, setRecent] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === "cnic" ? formatCnic(value) : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const next = {};
    if (!formData.name.trim()) next.name = "Full name is required";
    if (!formData.age) next.age = "Age is required";
    else if (Number(formData.age) <= 0 || Number(formData.age) > 130)
      next.age = "Enter a realistic age";
    if (!formData.gender) next.gender = "Select a gender";
    if (!formData.priority) next.priority = "Select a priority";
    if (!formData.contact.trim()) next.contact = "Contact number is required";
    else if (!/^[0-9+\-\s]{7,15}$/.test(formData.contact))
      next.contact = "Enter a valid phone number";
    if (formData.cnic && formData.cnic.replace(/\D/g, "").length !== 13)
      next.cnic = "CNIC must be 13 digits";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast("Please fix the highlighted fields");
      return;
    }
    setSubmitting(true);
    // Simulate a brief save — swap for the real API call.
    setTimeout(() => {
      const registered = { ...formData, id: Date.now() };
      console.log("Patient Registered:", registered);
      setRecent((prev) => [registered, ...prev].slice(0, 5));
      showToast(`${formData.name} registered successfully`);
      setFormData(EMPTY_FORM);
      setErrors({});
      setSubmitting(false);
    }, 500);
  };

  const handleReset = () => {
    setFormData(EMPTY_FORM);
    setErrors({});
  };

  const showToast = (message) => setToast(message);

  const previewInitials = useMemo(
    () => (formData.name.trim() ? initials(formData.name) : "?"),
    [formData.name]
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 pt-40">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Patient Registration</h1>
          <p className="text-sm text-gray-400">HMIS &gt; Patient Registration</p>
        </div>
        <div className="hidden sm:flex items-center gap-3 bg-[#1f293f] border border-white/5 rounded-xl px-4 py-2.5">
          <div
            className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarPalette[0]} flex items-center justify-center text-xs font-semibold shrink-0`}
          >
            {previewInitials}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-medium">{formData.name.trim() || "New patient"}</p>
            <p className="text-xs text-gray-500">
              {formData.department || "No department"} · {formData.priority || "No priority"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="lg:col-span-2 bg-[#1f293f] p-6 rounded-2xl shadow-lg border border-white/5 space-y-8"
        >
          {/* Personal Info */}
          <section>
            <SectionHeader icon={IoPersonAdd} title="Personal Information" subtitle="Who is being registered" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Full Name" required error={errors.name}>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Ayesha Malik"
                  className={`${inputBase} ${errors.name ? inputErr : inputOk}`}
                />
              </Field>

              <Field label="Age" required error={errors.age}>
                <input
                  type="number"
                  name="age"
                  min="0"
                  max="130"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="e.g. 34"
                  className={`${inputBase} ${errors.age ? inputErr : inputOk}`}
                />
              </Field>

              <Field label="Gender" required error={errors.gender}>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`${inputBase} ${errors.gender ? inputErr : inputOk} cursor-pointer`}
                >
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </Field>

              <Field label="CNIC" error={errors.cnic}>
                <input
                  type="text"
                  name="cnic"
                  value={formData.cnic}
                  onChange={handleChange}
                  placeholder="42101-1234567-1"
                  maxLength={15}
                  className={`${inputBase} ${errors.cnic ? inputErr : inputOk}`}
                />
              </Field>

              <div className="md:col-span-2">
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Priority <span className="text-rose-400">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRIORITIES.map(({ value, style }) => (
                    <button
                      type="button"
                      key={value}
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, priority: value }));
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.priority;
                          return next;
                        });
                      }}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ring-1 cursor-pointer ${
                        formData.priority === value
                          ? style + " ring-offset-1 ring-offset-[#1f293f]"
                          : "bg-gray-900/40 text-gray-400 ring-gray-700 hover:text-gray-200"
                      }`}
                    >
                      {value === "Urgent" && <MdOutlinePriorityHigh />}
                      {value}
                    </button>
                  ))}
                </div>
                {errors.priority && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-400">
                    <IoAlertCircle className="shrink-0" /> {errors.priority}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Contact & Guardian */}
          <section>
            <SectionHeader icon={IoCall} title="Contact & Guardian" subtitle="How to reach the patient" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Contact Number" required error={errors.contact}>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="03xx-xxxxxxx"
                  className={`${inputBase} ${errors.contact ? inputErr : inputOk}`}
                />
              </Field>

              <Field label="Guardian Name">
                <input
                  type="text"
                  name="guardian"
                  value={formData.guardian}
                  onChange={handleChange}
                  placeholder="Optional"
                  className={`${inputBase} ${inputOk}`}
                />
              </Field>
            </div>
          </section>

          {/* Doctor & Department */}
          <section>
            <SectionHeader icon={FaUserDoctor} title="Care Assignment" subtitle="Route the patient to the right team" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Referred Doctor">
                <select
                  name="doctor"
                  value={formData.doctor}
                  onChange={handleChange}
                  className={`${inputBase} ${inputOk} cursor-pointer`}
                >
                  <option value="">Select Doctor</option>
                  {DOCTORS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </Field>

              <Field label="Department">
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`${inputBase} ${inputOk} cursor-pointer`}
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </Field>

              <div className="md:col-span-2">
                <label className="block mb-2 text-sm font-medium text-gray-300">Patient Type</label>
                <div className="flex flex-wrap gap-2">
                  {PATIENT_TYPES.map(({ value, style }) => (
                    <button
                      type="button"
                      key={value}
                      onClick={() => setFormData((prev) => ({ ...prev, type: value }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ring-1 cursor-pointer ${
                        formData.type === value
                          ? style + " ring-offset-1 ring-offset-[#1f293f]"
                          : "bg-gray-900/40 text-gray-400 ring-gray-700 hover:text-gray-200"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Address & Notes */}
          <section>
            <SectionHeader icon={IoLocationSharp} title="Address & Notes" subtitle="Anything else worth recording" />
            <div className="space-y-4">
              <Field label="Address">
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={2}
                  placeholder="House / street / city"
                  className={`${inputBase} ${inputOk} resize-none`}
                />
              </Field>

              <Field label="Notes">
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Allergies, referrals, anything the front desk should flag"
                  className={`${inputBase} ${inputOk} resize-none`}
                />
              </Field>
            </div>
          </section>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-800">
            <button
              type="button"
              onClick={handleReset}
              className="cursor-pointer flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition"
            >
              <IoRefresh /> Clear form
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="cursor-pointer flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-sm font-medium transition"
            >
              {submitting ? "Registering..." : "Register Patient"}
            </button>
          </div>
        </form>

        {/* Sidebar: recently registered */}
        <div className="bg-[#1f293f] p-6 rounded-2xl shadow-lg border border-white/5 h-fit">
          <h2 className="text-sm font-semibold text-gray-100 mb-1">Recently Registered</h2>
          <p className="text-xs text-gray-500 mb-4">This session only</p>

          {recent.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              No patients registered yet.
            </div>
          ) : (
            <ul className="space-y-3">
              {recent.map((p, i) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 bg-gray-900/40 border border-white/5 rounded-xl p-3"
                >
                  <div
                    className={`w-9 h-9 shrink-0 rounded-full bg-gradient-to-br ${avatarPalette[i % avatarPalette.length]} flex items-center justify-center text-xs font-semibold`}
                  >
                    {initials(p.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {p.department || "No dept"} {p.doctor && `· ${p.doctor}`}
                    </p>
                  </div>
                  {p.type && (
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded-md bg-gray-800 text-gray-300 shrink-0">
                      {p.type}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default PatientRegistrationPage;