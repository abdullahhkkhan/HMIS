// src/pages/UserManagement.jsx
import React, { useMemo, useState } from "react";
import {
  IoCheckmarkCircle,
  IoPersonAdd,
  IoBusiness,
  IoLockClosed,
  IoAlertCircle,
  IoEye,
  IoEyeOff,
  IoWarning,
} from "react-icons/io5";

/* -------------------- Static options -------------------- */

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "doctor", label: "Doctor" },
  { value: "nurse", label: "Nurse" },
  { value: "receptionist", label: "Receptionist" },
  { value: "pharmacist", label: "Pharmacist" },
];

const roleBadgeStyle = {
  admin: "bg-rose-700/50 text-rose-300 ring-1 ring-rose-500/30",
  doctor: "bg-blue-700/50 text-blue-300 ring-1 ring-blue-500/30",
  nurse: "bg-emerald-700/50 text-emerald-300 ring-1 ring-emerald-500/30",
  receptionist: "bg-amber-700/50 text-amber-300 ring-1 ring-amber-500/30",
  pharmacist: "bg-violet-700/50 text-violet-300 ring-1 ring-violet-500/30",
};

const EMPTY_FORM = {
  role: "",
  organization: "",
  email: "",
  password: "",
  confirmPassword: "",
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

/* -------------------- Password strength -------------------- */

function passwordStrength(pw) {
  if (!pw) return { score: 0, label: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["Weak", "Weak", "Fair", "Good", "Strong"];
  const colors = ["bg-rose-500", "bg-rose-500", "bg-amber-500", "bg-blue-500", "bg-emerald-500"];
  return { score, label: labels[score], color: colors[score] };
}

/* -------------------- Main component -------------------- */

const UserManagement = () => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const showToast = (message, tone = "success") => setToast({ message, tone });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const strength = useMemo(() => passwordStrength(formData.password), [formData.password]);

  const validate = () => {
    const next = {};
    if (!formData.role) next.role = "Select a role";
    if (!formData.password) next.password = "Password is required";
    else if (formData.password.length < 8) next.password = "Use at least 8 characters";
    if (!formData.confirmPassword) next.confirmPassword = "Confirm the password";
    else if (formData.password !== formData.confirmPassword)
      next.confirmPassword = "Passwords do not match";
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email))
      next.email = "Enter a valid email address";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast("Please fix the highlighted fields", "error");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      console.log("New User Created:", formData);
      // 🔑 API call for user creation goes here
      showToast(`User created with role "${formData.role}"`);
      setFormData(EMPTY_FORM);
      setShowPassword(false);
      setShowConfirm(false);
      setSaving(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 pt-40">
      {/* Header */}
      <div className="max-w-xl mx-auto flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">User Management</h1>
          <p className="text-sm text-gray-400">HMIS &gt; User Management</p>
        </div>
        {formData.role && (
          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${roleBadgeStyle[formData.role]}`}>
            {ROLES.find((r) => r.value === formData.role)?.label}
          </span>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-xl mx-auto bg-[#1f293f] p-6 rounded-2xl shadow-lg border border-white/5 space-y-8"
      >
        {/* Role & Organization */}
        <section>
          <SectionHeader icon={IoPersonAdd} title="Account Details" subtitle="Who this login belongs to" />
          <div className="space-y-4">
            <Field label="User Role" required error={errors.role}>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`${inputBase} ${errors.role ? inputErr : inputOk} cursor-pointer`}
              >
                <option value="">-- Select Role --</option>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Organization Name">
              <div className="relative">
                <IoBusiness className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  placeholder="Enter organization name"
                  className={`${inputBase} ${inputOk} pl-9`}
                />
              </div>
            </Field>

            <Field label="Email (Optional)" error={errors.email}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className={`${inputBase} ${errors.email ? inputErr : inputOk}`}
              />
            </Field>
          </div>
        </section>

        {/* Security */}
        <section>
          <SectionHeader icon={IoLockClosed} title="Security" subtitle="Set the login credentials" />
          <div className="space-y-4">
            <Field label="Password" required error={errors.password}>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className={`${inputBase} ${errors.password ? inputErr : inputOk} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  tabIndex={-1}
                >
                  {showPassword ? <IoEyeOff /> : <IoEye />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          i < strength.score ? strength.color : "bg-gray-700"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 w-10 text-right">{strength.label}</span>
                </div>
              )}
            </Field>

            <Field label="Confirm Password" required error={errors.confirmPassword}>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className={`${inputBase} ${errors.confirmPassword ? inputErr : inputOk} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  tabIndex={-1}
                >
                  {showConfirm ? <IoEyeOff /> : <IoEye />}
                </button>
              </div>
            </Field>
          </div>
        </section>

        <button
          type="submit"
          disabled={saving}
          className="cursor-pointer w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold transition-all shadow-lg"
        >
          {saving ? "Creating..." : "Create User"}
        </button>
      </form>

      {toast && (
        <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default UserManagement;