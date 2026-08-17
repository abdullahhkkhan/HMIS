// src/components/waitingPatients/WaitingPatients.jsx

import React, { useEffect, useMemo, useState } from "react";
import { IoClose, IoCheckmarkCircle, IoSearch } from "react-icons/io5";
import { MdOutlinePriorityHigh } from "react-icons/md";
import { FaUserDoctor } from "react-icons/fa6";
import { LuTimer } from "react-icons/lu";

/* -------------------- Mock data (replace with API data) -------------------- */

const DEPARTMENTS = ["General", "Cardiology", "Orthopedics", "Pediatrics", "Dental", "Radiology"];
const PRIORITIES = ["Urgent", "Normal", "Low"];

const INITIAL_QUEUE = [
  { id: 1, name: "Ali Khan", age: 32, gender: "Male", reason: "Chest pain", department: "Cardiology", priority: "Urgent", waitingSince: 6, doctor: "Dr. Fatima Raza" },
  { id: 2, name: "Sara Ahmed", age: 27, gender: "Female", reason: "Flu symptoms", department: "General", priority: "Normal", waitingSince: 22, doctor: "Dr. Bilal Shaikh" },
  { id: 3, name: "Usman Tariq", age: 45, gender: "Male", reason: "Follow-up: fracture", department: "Orthopedics", priority: "Normal", waitingSince: 14, doctor: "Dr. Hina Farooq" },
  { id: 4, name: "Maryam Noor", age: 8, gender: "Female", reason: "Fever, vomiting", department: "Pediatrics", priority: "Urgent", waitingSince: 4, doctor: "Dr. Ayesha Malik" },
  { id: 5, name: "James Raphael", age: 51, gender: "Male", reason: "Routine X-ray review", department: "Radiology", priority: "Low", waitingSince: 35, doctor: "Dr. Kamran Ali" },
  { id: 6, name: "Fatima Zohra", age: 29, gender: "Female", reason: "Tooth extraction", department: "Dental", priority: "Low", waitingSince: 18, doctor: "Dr. Waqas Hussain" },
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

const priorityStyles = {
  Urgent: "bg-rose-700/50 text-rose-300 ring-1 ring-rose-500/30",
  Normal: "bg-blue-700/50 text-blue-300 ring-1 ring-blue-500/30",
  Low: "bg-gray-700/50 text-gray-300 ring-1 ring-gray-500/30",
};

const priorityRank = { Urgent: 0, Normal: 1, Low: 2 };

/* -------------------- Small shared UI -------------------- */

function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2600);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-2 bg-[#1f293f] border border-emerald-500/30 text-white px-4 py-3 rounded-xl shadow-2xl">
      <IoCheckmarkCircle className="text-emerald-400 text-lg shrink-0" />
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

/* -------------------- Main component -------------------- */

const WaitingPatients = () => {
  const [queue, setQueue] = useState(INITIAL_QUEUE);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [toast, setToast] = useState(null);
  const [calledIn, setCalledIn] = useState([]);

  const showToast = (message) => setToast(message);

  const handleSelect = (patient) => {
    setSelectedPatient(patient);
    setOpen(true);
  };

  const handleCallIn = (patient) => {
    setQueue((prev) => prev.filter((p) => p.id !== patient.id));
    setCalledIn((prev) => [...prev, patient.id]);
    showToast(`${patient.name} called in to ${patient.doctor}`);
    setOpen(false);
  };

  const handleRemove = (patient) => {
    setQueue((prev) => prev.filter((p) => p.id !== patient.id));
    showToast(`${patient.name} removed from the queue`);
    setOpen(false);
  };

  const filteredQueue = useMemo(() => {
    return queue
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      .filter((p) => departmentFilter === "All" || p.department === departmentFilter)
      .filter((p) => priorityFilter === "All" || p.priority === priorityFilter)
      .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
  }, [queue, search, departmentFilter, priorityFilter]);

  const urgentCount = queue.filter((p) => p.priority === "Urgent").length;
  const avgWait = queue.length
    ? Math.round(queue.reduce((sum, p) => sum + p.waitingSince, 0) / queue.length)
    : 0;

  return (
    <div className="p-6 bg-[#0f172a] min-h-screen text-white pt-40">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Waiting Patients</h1>
          <p className="text-sm text-gray-400">HMIS &gt; Waiting Patients</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="In Queue" value={queue.length} />
        <StatCard label="Urgent Cases" value={urgentCount} accent={urgentCount > 0 ? "text-rose-400" : ""} />
        <StatCard label="Avg. Wait Time" value={`${avgWait} min`} />
        <StatCard label="Called In Today" value={calledIn.length} accent="text-emerald-400" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient by name..."
            className="w-full bg-[#1f293f] border border-white/5 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="bg-[#1f293f] border border-white/5 rounded-lg px-3 py-2 text-sm focus:outline-none cursor-pointer"
        >
          <option value="All">All Departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="bg-[#1f293f] border border-white/5 rounded-lg px-3 py-2 text-sm focus:outline-none cursor-pointer"
        >
          <option value="All">All Priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#1f293f] shadow rounded-2xl overflow-hidden border border-white/5">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#141b2d] text-gray-300">
            <tr>
              <th className="p-3 text-sm font-medium">Patient</th>
              <th className="p-3 text-sm font-medium">Age / Gender</th>
              <th className="p-3 text-sm font-medium">Reason</th>
              <th className="p-3 text-sm font-medium">Department</th>
              <th className="p-3 text-sm font-medium">Priority</th>
              <th className="p-3 text-sm font-medium">Waiting</th>
              <th className="p-3 text-sm font-medium text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredQueue.map((patient, i) => (
              <tr
                key={patient.id}
                className="border-b border-gray-800 hover:bg-[#24324a] transition cursor-pointer"
                onClick={() => handleSelect(patient)}
              >
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 shrink-0 rounded-full bg-gradient-to-br ${avatarPalette[i % avatarPalette.length]} flex items-center justify-center text-[11px] font-semibold`}
                    >
                      {initials(patient.name)}
                    </div>
                    <span className="font-medium">{patient.name}</span>
                  </div>
                </td>
                <td className="p-3 text-gray-300">{patient.age} / {patient.gender}</td>
                <td className="p-3 text-gray-300">{patient.reason}</td>
                <td className="p-3 text-gray-300">{patient.department}</td>
                <td className="p-3">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${priorityStyles[patient.priority]}`}>
                    {patient.priority === "Urgent" && <MdOutlinePriorityHigh />}
                    {patient.priority}
                  </span>
                </td>
                <td className="p-3 text-gray-300">
                  <span className="inline-flex items-center gap-1 text-sm">
                    <LuTimer className="text-gray-500" /> {patient.waitingSince} min
                  </span>
                </td>
                <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-center gap-2">
                    <button
                      className="cursor-pointer px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 transition text-xs font-medium"
                      onClick={() => handleSelect(patient)}
                    >
                      View
                    </button>
                    <button
                      className="cursor-pointer px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition text-xs font-medium"
                      onClick={() => handleCallIn(patient)}
                    >
                      Call In
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredQueue.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  {queue.length === 0
                    ? "The queue is empty 🎉"
                    : "No patients match your search or filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {open && selectedPatient && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[150] px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-[#1f293f] p-6 rounded-2xl shadow-2xl w-full max-w-md border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-700 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarPalette[selectedPatient.id % avatarPalette.length]} flex items-center justify-center text-sm font-semibold`}
                >
                  {initials(selectedPatient.name)}
                </div>
                <div>
                  <h2 className="text-lg font-semibold leading-tight">{selectedPatient.name}</h2>
                  <p className="text-xs text-gray-400">{selectedPatient.age} yrs · {selectedPatient.gender}</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <IoClose className="text-xl" />
              </button>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Reason for visit</span>
                <span>{selectedPatient.reason}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Department</span>
                <span>{selectedPatient.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Priority</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityStyles[selectedPatient.priority]}`}>
                  {selectedPatient.priority}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Waiting since</span>
                <span>{selectedPatient.waitingSince} min ago</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Assigned doctor</span>
                <span className="flex items-center gap-1"><FaUserDoctor className="text-gray-500" /> {selectedPatient.doctor}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                className="cursor-pointer px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 transition text-sm"
                onClick={() => handleRemove(selectedPatient)}
              >
                Remove
              </button>
              <button
                className="cursor-pointer px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition text-sm"
                onClick={() => handleCallIn(selectedPatient)}
              >
                Call In
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default WaitingPatients;