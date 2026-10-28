// Waiting Patients / Patient List — one page, three views:
//   Doctor      → own queue (waiting + pending), "Seen today"
//   Dispensary  → visits waiting for medicines, "Issued today"
//   Admin       → every visit for a date, with edit (patient, doctor, medicines)
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoSearch, IoPeople, IoTimeOutline, IoAlertCircle, IoCheckmarkDone, IoMedkit, IoCreateOutline } from "react-icons/io5";
import { LuClipboardList } from "react-icons/lu";
import { useHmis } from "../../store/HmisStore";
import { DEPARTMENTS, VISIT_MODULES, VISIT_STATUS, VISIT_STATUS_LABELS } from "../../utils/constants";
import { formatMrNo, formatTime, formatToken, formatWait, isSameDay, isToday } from "../../utils/format";
import { byQueueOrder, modulesDone } from "../../utils/visits";
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  PageHeader,
  PriorityBadge,
  StatCard,
  StatusBadge,
} from "../../components/ui";
import { Input, Select } from "../../components/forms/Field";
import EditVisitModal from "./EditVisitModal";

const todayInput = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function ModuleProgress({ visit }) {
  const done = modulesDone(visit);
  return (
    <div className="flex items-center gap-1.5 mt-1" title={VISIT_MODULES.map((m) => `${m.label}: ${visit.modules?.[m.key] ? "done" : "pending"}`).join("\n")}>
      {VISIT_MODULES.map((m) => (
        <span key={m.key} className={`h-1 w-4 rounded-full ${visit.modules?.[m.key] ? "bg-orange-400" : "bg-slate-600"}`} />
      ))}
      <span className="text-[11px] text-slate-500">{done}/{VISIT_MODULES.length}</span>
    </div>
  );
}

export default function PatientList() {
  const { db, currentUser, patientById, userById } = useHmis();
  const navigate = useNavigate();
  const role = currentUser.role;

  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All");
  const [date, setDate] = useState(todayInput());
  const [editing, setEditing] = useState(null);

  const tabs = useMemo(() => {
    if (role === "doctor")
      return [
        { key: "queue", label: "In Queue" },
        { key: "seen", label: "Seen Today" },
      ];
    if (role === "dispensary")
      return [
        { key: "queue", label: "To Dispense" },
        { key: "issued", label: "Issued Today" },
      ];
    return [
      { key: "active", label: "Active" },
      ...Object.values(VISIT_STATUS).map((s) => ({ key: s, label: VISIT_STATUS_LABELS[s] })),
      { key: "all", label: "All" },
    ];
  }, [role]);
  const [tab, setTab] = useState(tabs[0].key);

  // Base set for the role (before tab / search filtering)
  const base = useMemo(() => {
    if (role === "doctor") return db.visits.filter((v) => v.doctorId === currentUser.id);
    if (role === "dispensary") return db.visits;
    const [y, m, d] = date.split("-").map(Number);
    const day = new Date(y, m - 1, d);
    // Open visits from earlier days stay visible on today's list so nothing gets lost.
    const showCarryOver = date === todayInput();
    return db.visits.filter(
      (v) =>
        isSameDay(v.createdAt, day) ||
        (showCarryOver && [VISIT_STATUS.WAITING, VISIT_STATUS.PENDING, VISIT_STATUS.AT_DISPENSARY].includes(v.status))
    );
  }, [db.visits, role, currentUser.id, date]);

  const inTab = (v, key) => {
    if (role === "doctor") {
      if (key === "queue") return [VISIT_STATUS.WAITING, VISIT_STATUS.PENDING].includes(v.status);
      return isToday(v.consultedAt || v.createdAt) && [VISIT_STATUS.AT_DISPENSARY, VISIT_STATUS.COMPLETED].includes(v.status) && v.consultedAt;
    }
    if (role === "dispensary") {
      if (key === "queue") return v.status === VISIT_STATUS.AT_DISPENSARY;
      return v.status === VISIT_STATUS.COMPLETED && v.dispensedAt && isToday(v.dispensedAt);
    }
    if (key === "all") return true;
    if (key === "active") return [VISIT_STATUS.WAITING, VISIT_STATUS.PENDING, VISIT_STATUS.AT_DISPENSARY].includes(v.status);
    return v.status === key;
  };

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return base
      .filter((v) => inTab(v, tab))
      .filter((v) => dept === "All" || v.department === dept)
      .filter((v) => {
        if (!q) return true;
        const p = patientById[v.patientId];
        return [p?.name, formatMrNo(p?.mrNo), formatToken(v.token), p?.contact, userById[v.doctorId]?.name]
          .join(" ")
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) =>
        ["queue", "active", "waiting", "pending", "at_dispensary"].includes(tab)
          ? byQueueOrder(a, b)
          : new Date(b.dispensedAt || b.consultedAt || b.createdAt) - new Date(a.dispensedAt || a.consultedAt || a.createdAt)
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, tab, dept, search, patientById, userById]);

  const count = (key) => base.filter((v) => inTab(v, key)).length;

  /* ---------- stats per role ---------- */
  const stats = useMemo(() => {
    const queue = base.filter((v) => inTab(v, tabs[0].key));
    const avgWait = queue.length
      ? formatWait(new Date(Date.now() - (queue.reduce((s, v) => s + (Date.now() - new Date(v.createdAt)), 0) / queue.length)))
      : "0 min";
    if (role === "doctor") {
      return [
        { label: "Waiting", value: queue.filter((v) => v.status === "waiting").length, icon: IoPeople, accent: "amber" },
        { label: "Pending", value: queue.filter((v) => v.status === "pending").length, icon: IoTimeOutline, accent: "orange", hint: "modules incomplete" },
        { label: "Emergency / Urgent", value: queue.filter((v) => v.priority !== "Normal").length, icon: IoAlertCircle, accent: "rose" },
        { label: "Seen Today", value: count("seen"), icon: IoCheckmarkDone, accent: "emerald" },
      ];
    }
    if (role === "dispensary") {
      return [
        { label: "To Dispense", value: queue.length, icon: IoMedkit, accent: "sky" },
        { label: "Medicines to Issue", value: queue.reduce((s, v) => s + (v.prescriptions?.length || 0), 0), icon: LuClipboardList, accent: "violet" },
        { label: "Avg. Wait", value: avgWait, icon: IoTimeOutline, accent: "amber" },
        { label: "Issued Today", value: count("issued"), icon: IoCheckmarkDone, accent: "emerald" },
      ];
    }
    return [
      { label: "Waiting", value: count("waiting"), icon: IoPeople, accent: "amber", tab: "waiting" },
      { label: "Pending", value: count("pending"), icon: IoTimeOutline, accent: "orange", tab: "pending" },
      { label: "At Dispensary", value: count("at_dispensary"), icon: IoMedkit, accent: "sky", tab: "at_dispensary" },
      { label: "Completed", value: count("completed"), icon: IoCheckmarkDone, accent: "emerald", tab: "completed" },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, role]);

  const openRow = (v) => {
    if (role === "admin") return setEditing(v);
    if (role === "doctor") return navigate(`/patient-history/${v.id}`);
    if (role === "dispensary") return navigate(`/dispensary/${v.id}`);
  };

  const actionFor = (v) => {
    if (role === "doctor") {
      if (tab === "seen") return <Button size="xs" variant="secondary" onClick={() => openRow(v)}>View</Button>;
      return (
        <Button size="xs" variant={v.status === "pending" ? "secondary" : "primary"} onClick={() => openRow(v)}>
          {v.status === "pending" ? "Continue" : "Start Visit"}
        </Button>
      );
    }
    if (role === "dispensary") {
      return tab === "queue" ? (
        <Button size="xs" onClick={() => openRow(v)}>Dispense</Button>
      ) : (
        <Button size="xs" variant="secondary" onClick={() => openRow(v)}>View</Button>
      );
    }
    return (
      <Button size="xs" variant="secondary" icon={IoCreateOutline} onClick={() => openRow(v)}>
        Edit
      </Button>
    );
  };

  const title = role === "admin" ? "Patient List" : "Waiting Patients";
  const description =
    role === "doctor"
      ? `Patients referred to ${currentUser.name}. Emergency and urgent cases are listed first.`
      : role === "dispensary"
      ? "Patients whose visit is confirmed and are waiting for medicines."
      : "Select a patient to change their details, referred doctor or prescribed medicines.";

  const editingVisit = editing && db.visits.find((x) => x.id === editing.id);

  return (
    <>
      <PageHeader title={title} crumbs={[title]} description={description} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <StatCard
            key={s.label}
            {...s}
            onClick={s.tab ? () => setTab(tab === s.tab ? "active" : s.tab) : undefined}
            active={s.tab && tab === s.tab}
          />
        ))}
      </div>

      <Card>
        <div className="p-4 flex flex-col gap-3 border-b border-white/10">
          <div className="flex gap-1 overflow-x-auto -mx-1 px-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`cursor-pointer shrink-0 flex items-center gap-2 h-8 px-3 rounded-md text-sm font-medium transition-colors ${
                  tab === t.key ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {t.label}
                <span className={`text-[11px] tabular-nums px-1.5 rounded ${tab === t.key ? "bg-slate-600" : "bg-slate-800"}`}>
                  {count(t.key)}
                </span>
              </button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, MR #, token, mobile…" className="pl-9" />
            </div>
            {role !== "doctor" && (
              <Select value={dept} onChange={(e) => setDept(e.target.value)} className="sm:w-52">
                <option value="All">All departments</option>
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </Select>
            )}
            {role === "admin" && (
              <Input type="date" value={date} max={todayInput()} onChange={(e) => setDate(e.target.value || todayInput())} className="sm:w-44" />
            )}
          </div>
        </div>

        {rows.length === 0 ? (
          <EmptyState icon={IoPeople} title={search || dept !== "All" ? "No patients match your filters" : "No patients here"}>
            {role === "doctor" && tab === "queue" && "New patients appear here as soon as registration refers them to you."}
            {role === "dispensary" && tab === "queue" && "Patients appear here once the doctor confirms their visit."}
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400 bg-slate-900/40">
                  <th className="px-4 py-3 font-medium w-20">Token</th>
                  <th className="px-4 py-3 font-medium">Patient</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">
                    {role === "dispensary" ? "Diagnosis" : "Complaint"}
                  </th>
                  {role !== "doctor" && <th className="px-4 py-3 font-medium hidden lg:table-cell">Doctor</th>}
                  <th className="px-4 py-3 font-medium">Priority</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">
                    {["queue", "active", "waiting", "pending", "at_dispensary"].includes(tab) ? "Waiting" : "Time"}
                  </th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.map((v) => {
                  const p = patientById[v.patientId];
                  const isActive = [VISIT_STATUS.WAITING, VISIT_STATUS.PENDING, VISIT_STATUS.AT_DISPENSARY].includes(v.status);
                  return (
                    <tr
                      key={v.id}
                      onClick={() => openRow(v)}
                      className={`cursor-pointer hover:bg-white/[0.03] ${v.priority === "Emergency" && isActive ? "bg-rose-500/[0.06]" : ""}`}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-slate-300">{formatToken(v.token)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-[180px]">
                          <Avatar name={p?.name} size="sm" />
                          <div className="min-w-0">
                            <p className="font-medium text-slate-100 truncate">{p?.name}</p>
                            <p className="text-xs text-slate-500">
                              {formatMrNo(p?.mrNo)} · {p?.age}y {p?.gender?.[0]}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300 hidden md:table-cell max-w-[260px]">
                        <p className="truncate">
                          {role === "dispensary" ? v.health?.diagnosis || "—" : v.complaint || <span className="text-slate-600">—</span>}
                        </p>
                        {role === "dispensary" && (
                          <p className="text-xs text-slate-500">{v.prescriptions?.length || 0} medicine(s)</p>
                        )}
                      </td>
                      {role !== "doctor" && (
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <p className="text-slate-200">{userById[v.doctorId]?.name}</p>
                          <p className="text-xs text-slate-500">{v.department}</p>
                        </td>
                      )}
                      <td className="px-4 py-3"><PriorityBadge priority={v.priority} /></td>
                      <td className="px-4 py-3">
                        <StatusBadge status={v.status} />
                        {v.status === VISIT_STATUS.PENDING && <ModuleProgress visit={v} />}
                      </td>
                      <td className="px-4 py-3 text-slate-400 hidden sm:table-cell whitespace-nowrap tabular-nums">
                        {isActive ? formatWait(v.createdAt) : formatTime(v.dispensedAt || v.consultedAt || v.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        {actionFor(v)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {editingVisit && <EditVisitModal visit={editingVisit} onClose={() => setEditing(null)} />}
    </>
  );
}
