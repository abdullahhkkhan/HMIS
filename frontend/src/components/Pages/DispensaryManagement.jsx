// src/pages/DispensaryManagement.jsx
import React, { useMemo, useState } from "react";
import {
  IoCheckmarkCircle,
  IoAddCircle,
  IoAlertCircle,
  IoSearch,
  IoTrash,
  IoWarning,
  IoTimeOutline,
} from "react-icons/io5";
import { FaPills } from "react-icons/fa6";

/* -------------------- Helpers -------------------- */

const LOW_STOCK_THRESHOLD = 20;
const EXPIRY_WARNING_DAYS = 60;

const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const expiryBadge = (dateStr) => {
  const days = daysUntil(dateStr);
  if (days === null) return null;
  if (days < 0) return { label: "Expired", style: "bg-rose-700/50 text-rose-300 ring-1 ring-rose-500/30" };
  if (days <= EXPIRY_WARNING_DAYS)
    return { label: `${days}d left`, style: "bg-amber-700/50 text-amber-300 ring-1 ring-amber-500/30" };
  return null;
};

const stockBadge = (qty) => {
  const n = Number(qty);
  if (n <= 0) return { label: "Out of stock", style: "bg-rose-700/50 text-rose-300 ring-1 ring-rose-500/30" };
  if (n <= LOW_STOCK_THRESHOLD) return { label: "Low stock", style: "bg-amber-700/50 text-amber-300 ring-1 ring-amber-500/30" };
  return { label: "In stock", style: "bg-emerald-700/50 text-emerald-300 ring-1 ring-emerald-500/30" };
};

const EMPTY_FORM = { name: "", category: "", strength: "", quantity: "", expiry: "" };

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

function StatCard({ label, value, accent }) {
  return (
    <div className="bg-[#1f293f] rounded-2xl p-4 shadow border border-white/5">
      <p className="text-sm text-gray-400">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${accent || ""}`}>{value}</p>
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
  "w-full px-3 py-2 rounded-lg bg-gray-900/60 border text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 transition-colors";
const inputOk = "border-gray-700 focus:ring-blue-500 focus:border-blue-500";
const inputErr = "border-rose-500/60 focus:ring-rose-500 focus:border-rose-500";

/* -------------------- Main component -------------------- */

const DispensaryManagement = () => {
  const [medicines, setMedicines] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");

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

  const validate = () => {
    const next = {};
    if (!formData.name.trim()) next.name = "Medicine name is required";
    if (!formData.quantity) next.quantity = "Quantity is required";
    else if (Number(formData.quantity) < 0) next.quantity = "Quantity can't be negative";
    if (formData.expiry && daysUntil(formData.expiry) < 0)
      next.expiry = "Expiry date is in the past";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast("Please fix the highlighted fields", "error");
      return;
    }
    setMedicines((prev) => [{ ...formData, id: Date.now() }, ...prev]);
    showToast(`${formData.name} added to dispensary`);
    setFormData(EMPTY_FORM);
    setErrors({});
  };

  const handleRemove = (id, name) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
    showToast(`${name} removed`);
  };

  const filtered = useMemo(
    () => medicines.filter((m) => m.name.toLowerCase().includes(search.toLowerCase())),
    [medicines, search]
  );

  const lowStockCount = medicines.filter((m) => Number(m.quantity) <= LOW_STOCK_THRESHOLD).length;
  const expiringCount = medicines.filter((m) => {
    const d = daysUntil(m.expiry);
    return d !== null && d <= EXPIRY_WARNING_DAYS;
  }).length;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 pt-40">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Dispensary Management</h1>
          <p className="text-sm text-gray-400">HMIS &gt; Dispensary</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Medicines" value={medicines.length} />
          <StatCard
            label="Low / Out of Stock"
            value={lowStockCount}
            accent={lowStockCount > 0 ? "text-amber-400" : ""}
          />
          <StatCard
            label="Expiring Soon"
            value={expiringCount}
            accent={expiringCount > 0 ? "text-rose-400" : ""}
          />
          <StatCard label="Categories" value={new Set(medicines.map((m) => m.category).filter(Boolean)).size} />
        </div>

        {/* Form Section */}
        <div className="bg-[#1f293f] p-6 rounded-2xl shadow-lg border border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
              <IoAddCircle className="text-base" />
            </div>
            <h2 className="text-sm font-semibold text-gray-100">Add Medicine to Dispensary</h2>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Field label="Medicine Name" required error={errors.name}>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Paracetamol"
                className={`${inputBase} ${errors.name ? inputErr : inputOk}`}
              />
            </Field>

            <Field label="Category">
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g. Painkiller, Antibiotic"
                className={`${inputBase} ${inputOk}`}
              />
            </Field>

            <Field label="Strength">
              <input
                type="text"
                name="strength"
                value={formData.strength}
                onChange={handleChange}
                placeholder="e.g. 500mg, 10ml"
                className={`${inputBase} ${inputOk}`}
              />
            </Field>

            <Field label="Quantity" required error={errors.quantity}>
              <input
                type="number"
                name="quantity"
                min="0"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="e.g. 100"
                className={`${inputBase} ${errors.quantity ? inputErr : inputOk}`}
              />
            </Field>

            <Field label="Expiry Date" error={errors.expiry}>
              <input
                type="date"
                name="expiry"
                value={formData.expiry}
                onChange={handleChange}
                className={`${inputBase} ${errors.expiry ? inputErr : inputOk}`}
              />
            </Field>

            <div className="lg:col-span-3">
              <button
                type="submit"
                className="cursor-pointer w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-lg"
              >
                Add Medicine
              </button>
            </div>
          </form>
        </div>

        {/* Medicines List */}
        <div className="bg-[#1f293f] rounded-2xl shadow-lg border border-white/5 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                <FaPills className="text-base" />
              </div>
              <h2 className="text-sm font-semibold text-gray-100">Dispensary Medicines</h2>
            </div>
            <div className="relative sm:w-64">
              <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search medicines..."
                className="w-full bg-gray-900/60 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {medicines.length === 0 ? (
            <p className="text-gray-500 text-sm px-6 pb-8">No medicines added yet.</p>
          ) : filtered.length === 0 ? (
            <p className="text-gray-500 text-sm px-6 pb-8">No medicines match your search.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-[#141b2d] text-gray-300">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium">Name</th>
                    <th className="p-3 text-left text-sm font-medium">Category</th>
                    <th className="p-3 text-left text-sm font-medium">Strength</th>
                    <th className="p-3 text-left text-sm font-medium">Quantity</th>
                    <th className="p-3 text-left text-sm font-medium">Expiry</th>
                    <th className="p-3 text-left text-sm font-medium">Status</th>
                    <th className="p-3 text-center text-sm font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((med) => {
                    const stock = stockBadge(med.quantity);
                    const expiry = expiryBadge(med.expiry);
                    return (
                      <tr key={med.id} className="border-b border-gray-800 hover:bg-[#24324a] transition">
                        <td className="p-3 text-gray-100 font-medium">{med.name}</td>
                        <td className="p-3 text-gray-300">{med.category || "-"}</td>
                        <td className="p-3 text-gray-300">{med.strength || "-"}</td>
                        <td className="p-3 text-gray-300">{med.quantity}</td>
                        <td className="p-3 text-gray-300">
                          {med.expiry ? (
                            <span className="inline-flex items-center gap-1 text-sm">
                              <IoTimeOutline className="text-gray-500" /> {med.expiry}
                            </span>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1.5">
                            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${stock.style}`}>
                              {stock.label}
                            </span>
                            {expiry && (
                              <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${expiry.style}`}>
                                {expiry.label}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleRemove(med.id, med.name)}
                            title="Remove medicine"
                            className="cursor-pointer p-2 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          >
                            <IoTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default DispensaryManagement;