import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { IoClose, IoCheckmarkCircle } from "react-icons/io5";
import { FiMapPin } from "react-icons/fi";
import { MdOutlineWallet, MdOutlinePendingActions, MdOutlineLocalHospital } from "react-icons/md";

/* -------------------- Static / mock data -------------------- */

const BAR_DATA_BY_PERIOD = {
  Day: [
    { label: "6am", blue: 2, white: 1 },
    { label: "9am", blue: 4, white: 3 },
    { label: "12pm", blue: 6, white: 5 },
    { label: "3pm", blue: 5, white: 4 },
    { label: "6pm", blue: 7, white: 6 },
    { label: "9pm", blue: 3, white: 2 },
  ],
  Week: [
    { label: "Mon", blue: 5, white: 4 },
    { label: "Tue", blue: 6, white: 5 },
    { label: "Wed", blue: 4, white: 3 },
    { label: "Thu", blue: 7, white: 5 },
    { label: "Fri", blue: 6, white: 4 },
    { label: "Sat", blue: 3, white: 2 },
    { label: "Sun", blue: 2, white: 2 },
  ],
  Month: [
    { label: "Week 1", blue: 18, white: 14 },
    { label: "Week 2", blue: 22, white: 17 },
    { label: "Week 3", blue: 20, white: 15 },
    { label: "Week 4", blue: 24, white: 18 },
  ],
  Year: [
    { label: "Jan", blue: 5, white: 5 },
    { label: "Feb", blue: 7, white: 6 },
    { label: "Mar", blue: 7, white: 4 },
    { label: "Apr", blue: 6, white: 5 },
    { label: "May", blue: 7, white: 6 },
    { label: "Jun", blue: 5, white: 4 },
    { label: "Jul", blue: 7, white: 3 },
    { label: "Aug", blue: 6, white: 5 },
    { label: "Sep", blue: 7, white: 4 },
    { label: "Oct", blue: 6, white: 4 },
    { label: "Nov", blue: 6, white: 4 },
    { label: "Dec", blue: 7, white: 3 },
  ],
};

const STAT_SCALE_BY_PERIOD = { Day: 0.05, Week: 0.25, Month: 0.6, Year: 1 };
const BASE_STATS = { earnings: 2354, toBePaid: 1598, admitted: 120 };

const LINE_DATA_BY_RANGE = {
  Today: [
    { name: "6am", value: 5 },
    { name: "9am", value: 12 },
    { name: "12pm", value: 20 },
    { name: "3pm", value: 15 },
    { name: "6pm", value: 25 },
    { name: "9pm", value: 18 },
  ],
  "This Week": [
    { name: "Mon", value: 20 },
    { name: "Tue", value: 40 },
    { name: "Wed", value: 30 },
    { name: "Thu", value: 50 },
    { name: "Fri", value: 40 },
    { name: "Sat", value: 35 },
    { name: "Sun", value: 20 },
  ],
  "This Month": [
    { name: "Wk 1", value: 80 },
    { name: "Wk 2", value: 95 },
    { name: "Wk 3", value: 110 },
    { name: "Wk 4", value: 120 },
  ],
};

const INITIAL_PATIENTS = [
  { name: "Ali Khan", reason: "General Checkup", time: "3 days ago" },
  { name: "Sara Ahmed", reason: "Flu Symptoms", time: "1 day ago" },
  { name: "John Doe", reason: "Follow-up", time: "Today" },
  { name: "James Raphael", reason: "X-ray Review", time: "3 days ago" },
  { name: "Maryam Noor", reason: "Dental", time: "1 day ago" },
  { name: "Usman Ali", reason: "New Admission", time: "Today" },
];

const INITIAL_MEDICINES = [
  { name: "Paracetamol", sold: 120, stock: 50 },
  { name: "Amoxicillin", sold: 90, stock: 30 },
  { name: "Ibuprofen", sold: 150, stock: 70 },
  { name: "Vitamin C", sold: 200, stock: 100 },
  { name: "Cough Syrup", sold: 85, stock: 40 },
];

const CAMPS = [
  { place: "Karachi", percent: 75 },
  { place: "Lahore", percent: 55 },
  { place: "Islamabad", percent: 85 },
];

const FUNDING_SOURCES = [
  { name: "Zakat", patients: "1.2k", percent: "+40%", color: "text-emerald-400" },
  { name: "Angio", patients: "850", percent: "+25%", color: "text-emerald-400" },
  { name: "Private", patients: "2.3k", percent: "-15%", color: "text-rose-400" },
  { name: "Welfare", patients: "1.9k", percent: "+35%", color: "text-emerald-400" },
  { name: "Insurance", patients: "1.4k", percent: "+20%", color: "text-emerald-400" },
];

const PATIENT_DETAILS = [
  { id: "#1001", name: "Ali Khan", type: "Zakat", bill: "$0", status: "Active" },
  { id: "#1002", name: "Sara Ahmed", type: "Private", bill: "$450", status: "Pending" },
  { id: "#1003", name: "John Doe", type: "Welfare", bill: "$120", status: "Active" },
  { id: "#1004", name: "Fatima Noor", type: "Angio", bill: "$300", status: "Pending" },
  { id: "#1005", name: "Omar Farooq", type: "Insurance", bill: "$600", status: "Active" },
];

const initials = (name) =>
  name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

const avatarPalette = [
  "from-blue-500 to-indigo-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-fuchsia-500 to-pink-500",
  "from-cyan-500 to-sky-500",
  "from-violet-500 to-purple-500",
];

/* -------------------- Small shared UI -------------------- */

function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2600);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-2 bg-[#1e293b] border border-emerald-500/30 text-white px-4 py-3 rounded-xl shadow-2xl animate-[fadeIn_0.2s_ease-out]">
      <IoCheckmarkCircle className="text-emerald-400 text-lg shrink-0" />
      <span className="text-sm">{message}</span>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-[#1e293b] w-full max-w-md rounded-2xl shadow-2xl border border-white/10 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <IoClose className="text-xl" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title }) {
  return (
    <div className="mb-4">
      {eyebrow && (
        <p className="text-[11px] uppercase tracking-wider text-blue-400 font-semibold mb-0.5">
          {eyebrow}
        </p>
      )}
      <h2 className="font-semibold text-lg">{title}</h2>
    </div>
  );
}

/* -------------------- Dashboard -------------------- */

export default function Dashboard() {
  const [period, setPeriod] = useState("Year");
  const [statRange, setStatRange] = useState("This Week");
  const [patients, setPatients] = useState(INITIAL_PATIENTS);
  const [medicines, setMedicines] = useState(INITIAL_MEDICINES);
  const [selectedCamp, setSelectedCamp] = useState(CAMPS[0]);
  const [fundingFilter, setFundingFilter] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message) => setToast(message);

  const scale = STAT_SCALE_BY_PERIOD[period];
  const earnings = Math.round(BASE_STATS.earnings * scale).toLocaleString();
  const toBePaid = Math.round(BASE_STATS.toBePaid * scale).toLocaleString();
  const admitted = Math.max(1, Math.round(BASE_STATS.admitted * scale));

  const lineData = LINE_DATA_BY_RANGE[statRange];
  const latestValue = lineData[lineData.length - 1].value;

  const filteredPatientDetails = fundingFilter
    ? PATIENT_DETAILS.filter((p) => p.type === fundingFilter)
    : PATIENT_DETAILS;

  const handleSeenPatient = (name) => {
    setPatients((prev) => prev.filter((p) => p.name !== name));
    showToast(`${name} moved to consultation`);
  };

  const handleDispense = (name) => {
    setMedicines((prev) =>
      prev.map((m) =>
        m.name === name && m.stock > 0
          ? { ...m, stock: m.stock - 1, sold: m.sold + 1 }
          : m
      )
    );
    showToast(`1 unit of ${name} dispensed`);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 pt-40">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .card-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .card-lift:hover { transform: translateY(-2px); box-shadow: 0 12px 24px -12px rgba(0,0,0,0.5); }
      `}</style>

      {/* Header */}
      <div className="flex justify-between items-center mb-6 lg:px-20">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-400">HMIS &gt; Dashboard</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:px-20">
        {/* Left Column */}
        <div className="col-span-2 bg-[#1e293b] rounded-2xl p-4 shadow-lg card-lift border border-white/5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Quick Summary</h2>
            <div className="flex gap-1 text-sm bg-[#0f172a] rounded-lg p-1">
              {["Day", "Week", "Month", "Year"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    period === p
                      ? "bg-blue-600 text-white shadow"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Chart + Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Bar Chart */}
            <div className="md:col-span-3 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={BAR_DATA_BY_PERIOD[period]}>
                  <XAxis dataKey="label" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }}
                  />
                  <Bar dataKey="blue" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="white" stackId="a" fill="#f1f5f9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <div className="bg-[#0f172a] p-4 rounded-xl shadow border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <MdOutlineWallet className="text-blue-400" />
                  <p className="text-2xl font-bold">${earnings}</p>
                </div>
                <p className="text-gray-400 text-sm">Total Earnings</p>
                <button
                  onClick={() => showToast(`Withdrawal of $${earnings} requested`)}
                  className="text-blue-400 text-sm hover:text-blue-300 transition-colors"
                >
                  Withdraw →
                </button>
              </div>
              <div className="bg-[#0f172a] p-4 rounded-xl shadow border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <MdOutlinePendingActions className="text-amber-400" />
                  <p className="text-2xl font-bold">${toBePaid}</p>
                </div>
                <p className="text-gray-400 text-sm">To Be Paid</p>
                <button
                  onClick={() => showToast(`Payment of $${toBePaid} initiated`)}
                  className="text-blue-400 text-sm hover:text-blue-300 transition-colors"
                >
                  Pay →
                </button>
              </div>
              <div className="bg-[#0f172a] p-4 rounded-xl shadow border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <MdOutlineLocalHospital className="text-emerald-400" />
                  <p className="text-2xl font-bold">{admitted}</p>
                </div>
                <p className="text-gray-400 text-sm">Admitted Patients</p>
                <button
                  onClick={() =>
                    setSelectedPatient({
                      id: "—",
                      name: "Admitted patients",
                      type: "—",
                      bill: "—",
                      status: `${admitted} currently admitted`,
                    })
                  }
                  className="text-blue-400 text-sm hover:text-blue-300 transition-colors"
                >
                  View →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Appointments */}
          <div className="bg-[#1e293b] p-6 rounded-2xl shadow card-lift border border-white/5">
            <p className="text-sm text-gray-400">Appointments</p>
            <p className="text-3xl font-bold mt-2">58</p>
            <p className="text-xs text-gray-400 mt-1">70% Completed</p>
            <div className="w-full bg-gray-700 h-2 rounded mt-2 overflow-hidden">
              <div className="bg-blue-500 h-2 rounded" style={{ width: "70%" }}></div>
            </div>
          </div>

          {/* Patients */}
          <div className="bg-[#1e293b] p-6 rounded-2xl shadow card-lift border border-white/5">
            <p className="text-sm text-gray-400">Total Patients Registered</p>
            <p className="text-3xl font-bold mt-2">1360</p>
            <p className="text-xs text-gray-400 mt-1">80% Growth</p>
            <div className="w-full bg-gray-700 h-2 rounded mt-2 overflow-hidden">
              <div className="bg-emerald-500 h-2 rounded" style={{ width: "80%" }}></div>
            </div>
          </div>

          {/* Patient Statistics */}
          <div className="bg-[#1e293b] p-6 rounded-2xl shadow card-lift border border-white/5">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-400">Patient Statistics</p>
              <select
                value={statRange}
                onChange={(e) => setStatRange(e.target.value)}
                className="bg-[#334155] text-sm rounded px-2 py-1 focus:outline-none cursor-pointer"
              >
                <option>Today</option>
                <option>This Week</option>
                <option>This Month</option>
              </select>
            </div>
            <p className="text-3xl font-bold mt-2">+{latestValue} New</p>
            <div className="h-32 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8 }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* 2nd Component */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 lg:px-20">
        {/* Column 1: Waiting Patients */}
        <div className="bg-[#1e293b] rounded-2xl p-6 shadow card-lift border border-white/5">
          <SectionHeader title="Waiting Patients" eyebrow={`${patients.length} in queue`} />
          <div className="space-y-1">
            {patients.length === 0 && (
              <p className="text-sm text-gray-500 py-6 text-center">Queue is empty 🎉</p>
            )}
            {patients.map((p, i) => (
              <div
                key={p.name}
                className="flex items-center justify-between gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-[#0f172a] transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 shrink-0 rounded-full bg-gradient-to-br ${avatarPalette[i % avatarPalette.length]} flex items-center justify-center text-[11px] font-semibold`}
                  >
                    {initials(p.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{p.name}</p>
                    <p className="text-sm text-gray-400 truncate">{p.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-blue-400">{p.time}</span>
                  <button
                    onClick={() => handleSeenPatient(p.name)}
                    title="Mark as seen"
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-emerald-400 transition-all"
                  >
                    <IoCheckmarkCircle className="text-lg" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Goal + Medicines */}
        <div className="flex flex-col gap-6">
          {/* Earnings Goal */}
          <div className="bg-[#1e293b] rounded-2xl p-6 shadow card-lift border border-white/5">
            <SectionHeader title="Earning Goal" />
            <div className="grid grid-cols-2 gap-6 items-center">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 mb-2">
                  <CircularProgressbar
                    value={60}
                    styles={buildStyles({ pathColor: "#3b82f6", trailColor: "#0f172a", textColor: "#fff" })}
                    text="60%"
                  />
                </div>
                <p className="text-xs text-gray-400">Total Earning</p>
                <p className="font-semibold">USD 13,545.65</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 mb-2">
                  <CircularProgressbar
                    value={85}
                    styles={buildStyles({ pathColor: "#22c55e", trailColor: "#0f172a", textColor: "#fff" })}
                    text="85%"
                  />
                </div>
                <p className="text-xs text-gray-400">Earning Goal</p>
                <p className="font-semibold">USD 84,265.45</p>
              </div>
            </div>
          </div>

          {/* Medicines Slider */}
          <div className="bg-[#1e293b] rounded-2xl p-6 shadow card-lift border border-white/5">
            <SectionHeader title="Dispensary Medicines" />
            <Swiper spaceBetween={20} slidesPerView={1}>
              {medicines.map((med) => (
                <SwiperSlide key={med.name}>
                  <div className="bg-[#0f172a] rounded-xl p-4 flex flex-col items-center shadow border border-white/5">
                    <p className="font-semibold text-blue-400">{med.name}</p>
                    <div className="flex gap-6 mt-4">
                      <div className="text-center">
                        <p className="text-lg font-bold">{med.sold}</p>
                        <p className="text-xs text-gray-400">Sold</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-lg font-bold ${med.stock === 0 ? "text-rose-400" : ""}`}>
                          {med.stock}
                        </p>
                        <p className="text-xs text-gray-400">Stock</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDispense(med.name)}
                      disabled={med.stock === 0}
                      className="bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors text-white text-sm px-4 py-1 mt-4 rounded-lg"
                    >
                      {med.stock === 0 ? "Out of stock" : "Dispense"}
                    </button>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {/* Column 3: Camps Map */}
        <div className="bg-[#1e293b] rounded-2xl p-6 shadow card-lift border border-white/5">
          <SectionHeader title="Camps by Location" />
          <div className="bg-[#0f172a] h-48 rounded-xl flex flex-col items-center justify-center text-gray-400 border border-white/5">
            <FiMapPin className="text-3xl text-blue-400 mb-2" />
            <p className="text-sm">{selectedCamp.place}</p>
            <p className="text-xs text-gray-500">{selectedCamp.percent}% capacity</p>
          </div>
          <div className="mt-6 space-y-4">
            {CAMPS.map((c) => (
              <button
                key={c.place}
                onClick={() => setSelectedCamp(c)}
                className={`w-full text-left rounded-lg -mx-1 px-1 py-1 transition-colors ${
                  selectedCamp.place === c.place ? "bg-blue-500/10" : "hover:bg-white/5"
                }`}
              >
                <p className="flex justify-between text-sm mb-1">
                  <span className={selectedCamp.place === c.place ? "text-white font-medium" : ""}>
                    {c.place}
                  </span>
                  <span>{c.percent}%</span>
                </p>
                <div className="w-full bg-gray-700 h-2 rounded overflow-hidden">
                  <div className="bg-blue-500 h-2 rounded" style={{ width: `${c.percent}%` }}></div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3rd Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 lg:px-20">
        {/* Left - Patients by Funding */}
        <div className="bg-[#1e293b] rounded-2xl shadow card-lift border border-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Patients by Funding Source</h2>
            {fundingFilter && (
              <button
                onClick={() => setFundingFilter(null)}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                Clear filter <IoClose />
              </button>
            )}
          </div>
          <div className="space-y-2">
            {FUNDING_SOURCES.map((src) => (
              <button
                key={src.name}
                onClick={() => setFundingFilter(fundingFilter === src.name ? null : src.name)}
                className={`w-full flex justify-between items-center p-3 rounded-lg transition-colors ${
                  fundingFilter === src.name ? "bg-blue-500/15 ring-1 ring-blue-500/40" : "hover:bg-[#334155]"
                }`}
              >
                <div className="text-left">
                  <p className="font-medium">{src.name}</p>
                  <p className="text-sm text-gray-400">{src.patients} Patients</p>
                </div>
                <span className={`text-sm font-semibold ${src.color}`}>{src.percent}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right - Patient Details */}
        <div className="bg-[#1e293b] rounded-2xl shadow card-lift border border-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Patient Details</h2>
            {fundingFilter && (
              <span className="text-xs text-gray-400">
                Showing {filteredPatientDetails.length} of {PATIENT_DETAILS.length}
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-gray-400 border-b border-gray-700">
                <tr>
                  <th className="py-2 px-3">ID</th>
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Bill</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatientDetails.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedPatient(p)}
                    className="border-b border-gray-800 hover:bg-[#0f172a] cursor-pointer transition-colors"
                  >
                    <td className="py-2 px-3">{p.id}</td>
                    <td className="py-2 px-3">{p.name}</td>
                    <td className="py-2 px-3">{p.type}</td>
                    <td className="py-2 px-3">{p.bill}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-medium ${
                          p.status === "Active"
                            ? "bg-emerald-700/60 text-emerald-300"
                            : "bg-blue-700/60 text-blue-300"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredPatientDetails.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500">
                      No patients match this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Patient detail modal */}
      {selectedPatient && (
        <Modal title={selectedPatient.name} onClose={() => setSelectedPatient(null)}>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Patient ID</span>
              <span>{selectedPatient.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Funding Type</span>
              <span>{selectedPatient.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Outstanding Bill</span>
              <span>{selectedPatient.bill}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status</span>
              <span>{selectedPatient.status}</span>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}