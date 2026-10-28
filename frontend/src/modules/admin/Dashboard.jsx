// Admin Dashboard — today's OPD flow, last 7 days trend, stock alerts.
import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { IoPersonAdd, IoPeople, IoTimeOutline, IoMedkit, IoCheckmarkDone, IoWarning, IoTrendingUp } from "react-icons/io5";
import { FaUserDoctor } from "react-icons/fa6";
import { useHmis } from "../../store/HmisStore";
import { DEPARTMENTS, PATIENT_TYPES, VISIT_STATUS } from "../../utils/constants";
import { formatMrNo, formatTime, formatToken, isSameDay, isToday, daysUntil } from "../../utils/format";
import { Avatar, Button, Card, CardHeader, EmptyState, PageHeader, StatCard, StatusBadge } from "../../components/ui";

const SERIES = "#3b82f6";

function ChartTooltip({ active, payload, label, unit = "visits" }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-slate-900 ring-1 ring-white/10 px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400">{label}</p>
      <p className="text-slate-100 font-medium tabular-nums">
        {payload[0].value} {unit}
      </p>
    </div>
  );
}

function HBar({ label, value, max, sub }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-100 tabular-nums font-medium">
          {value}
          {sub && <span className="text-slate-500 font-normal"> {sub}</span>}
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-700/60 overflow-hidden">
        <div className="h-full rounded-full bg-blue-500" style={{ width: `${max ? (value / max) * 100 : 0}%` }} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { db, todaysVisits, patientById, userById, doctors } = useHmis();
  const navigate = useNavigate();

  const s = useMemo(() => {
    const by = (st) => todaysVisits.filter((v) => v.status === st).length;
    return {
      registered: todaysVisits.length,
      newPatients: db.patients.filter((p) => isToday(p.registeredAt)).length,
      waiting: db.visits.filter((v) => v.status === VISIT_STATUS.WAITING).length,
      pending: db.visits.filter((v) => v.status === VISIT_STATUS.PENDING).length,
      dispensary: db.visits.filter((v) => v.status === VISIT_STATUS.AT_DISPENSARY).length,
      completed: by(VISIT_STATUS.COMPLETED),
    };
  }, [db, todaysVisits]);

  const trend = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        label: i === 6 ? "Today" : d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" }),
        visits: db.visits.filter((v) => v.status !== VISIT_STATUS.CANCELLED && isSameDay(v.createdAt, d)).length,
      };
    });
  }, [db.visits]);
  const weekTotal = trend.reduce((a, b) => a + b.visits, 0);

  const byDept = DEPARTMENTS.map((d) => ({ label: d, value: todaysVisits.filter((v) => v.department === d).length }));
  const byType = PATIENT_TYPES.map((t) => ({
    label: t,
    value: todaysVisits.filter((v) => patientById[v.patientId]?.type === t).length,
  }));
  const deptMax = Math.max(...byDept.map((d) => d.value), 1);
  const typeMax = Math.max(...byType.map((d) => d.value), 1);

  const doctorLoad = doctors
    .map((d) => ({
      ...d,
      queue: db.visits.filter((v) => v.doctorId === d.id && [VISIT_STATUS.WAITING, VISIT_STATUS.PENDING].includes(v.status)).length,
      seen: todaysVisits.filter((v) => v.doctorId === d.id && v.consultedAt).length,
    }))
    .sort((a, b) => b.queue - a.queue);

  const stockAlerts = db.medicines
    .filter((m) => m.stock <= m.reorderLevel || (daysUntil(m.expiry) ?? 999) <= 60)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 6);

  const recent = [...todaysVisits].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);

  return (
    <>
      <PageHeader
        title="Dashboard"
        crumbs={["Dashboard"]}
        description={new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        actions={
          <Button icon={IoPersonAdd} onClick={() => navigate("/registration")}>
            Register Patient
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        <StatCard label="Visits Today" value={s.registered} hint={`${s.newPatients} new patient(s)`} icon={IoTrendingUp} />
        <StatCard label="Waiting" value={s.waiting} hint="for a doctor" icon={IoPeople} accent="amber" onClick={() => navigate("/patients")} />
        <StatCard label="Pending" value={s.pending} hint="modules incomplete" icon={IoTimeOutline} accent="orange" onClick={() => navigate("/patients")} />
        <StatCard label="At Dispensary" value={s.dispensary} hint="awaiting medicines" icon={IoMedkit} accent="sky" onClick={() => navigate("/dispensary")} />
        <StatCard label="Completed" value={s.completed} hint="today" icon={IoCheckmarkDone} accent="emerald" />
        <StatCard
          label="Stock Alerts"
          value={stockAlerts.length}
          hint="low, out or expiring"
          icon={IoWarning}
          accent="rose"
          onClick={() => navigate("/medicines")}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <Card className="xl:col-span-2 p-5">
          <CardHeader icon={IoTrendingUp} title="OPD Visits — Last 7 Days" subtitle={`${weekTotal} visits this week`} className="mb-4" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barCategoryGap="28%">
                <CartesianGrid vertical={false} stroke="#334155" strokeOpacity={0.5} />
                <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
                <Bar dataKey="visits" fill={SERIES} radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <CardHeader icon={FaUserDoctor} title="Doctor Workload" subtitle="Current queue · seen today" className="mb-4" />
          <ul className="space-y-3">
            {doctorLoad.map((d) => (
              <li key={d.id} className="flex items-center gap-3">
                <Avatar name={d.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-100 truncate">{d.name}</p>
                  <p className="text-xs text-slate-500">{d.department}</p>
                </div>
                <div className="text-right text-xs tabular-nums">
                  <p className={d.queue > 3 ? "text-amber-300" : "text-slate-200"}>{d.queue} in queue</p>
                  <p className="text-slate-500">{d.seen} seen</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="p-5">
          <CardHeader title="Today by Department" subtitle="Visits registered" className="mb-4" />
          <div className="space-y-4">
            {byDept.map((d) => <HBar key={d.label} {...d} max={deptMax} />)}
          </div>
        </Card>
        <Card className="p-5">
          <CardHeader title="Today by Patient Type" subtitle="Funding / category" className="mb-4" />
          <div className="space-y-4">
            {byType.map((d) => (
              <HBar
                key={d.label}
                {...d}
                max={typeMax}
                sub={s.registered ? `· ${Math.round((d.value / s.registered) * 100)}%` : ""}
              />
            ))}
          </div>
        </Card>
        <Card>
          <div className="p-5 pb-3">
            <CardHeader
              icon={IoWarning}
              title="Stock Alerts"
              subtitle="Reorder or replace soon"
              action={<Link to="/medicines" className="text-xs text-blue-400 hover:text-blue-300">Manage →</Link>}
            />
          </div>
          {stockAlerts.length === 0 ? (
            <EmptyState title="All medicines are stocked" />
          ) : (
            <ul className="divide-y divide-white/5">
              {stockAlerts.map((m) => {
                const d = daysUntil(m.expiry);
                return (
                  <li key={m.id} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm">
                    <div className="min-w-0">
                      <p className="text-slate-100 truncate">{m.name} <span className="text-slate-500">{m.strength}</span></p>
                      <p className="text-xs text-slate-500">
                        {d !== null && d <= 60 ? (d < 0 ? "Expired" : `Expires in ${d} days`) : `Reorder at ${m.reorderLevel}`}
                      </p>
                    </div>
                    <span className={`tabular-nums text-sm font-medium ${m.stock === 0 ? "text-rose-400" : m.stock <= m.reorderLevel ? "text-amber-300" : "text-slate-300"}`}>
                      {m.stock === 0 ? "Out" : m.stock}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <div className="p-5 pb-3">
          <CardHeader
            title="Latest Registrations"
            subtitle="Today"
            action={<Link to="/patients" className="text-xs text-blue-400 hover:text-blue-300">Patient List →</Link>}
          />
        </div>
        {recent.length === 0 ? (
          <EmptyState title="No visits yet today" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400 bg-slate-900/40">
                  <th className="px-5 py-2.5 font-medium">Token</th>
                  <th className="px-5 py-2.5 font-medium">Patient</th>
                  <th className="px-5 py-2.5 font-medium hidden md:table-cell">Doctor</th>
                  <th className="px-5 py-2.5 font-medium hidden sm:table-cell">Time</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recent.map((v) => {
                  const p = patientById[v.patientId];
                  return (
                    <tr key={v.id}>
                      <td className="px-5 py-2.5 font-mono text-xs text-slate-400">{formatToken(v.token)}</td>
                      <td className="px-5 py-2.5">
                        <p className="text-slate-100">{p?.name}</p>
                        <p className="text-xs text-slate-500">{formatMrNo(p?.mrNo)}</p>
                      </td>
                      <td className="px-5 py-2.5 text-slate-300 hidden md:table-cell">{userById[v.doctorId]?.name}</td>
                      <td className="px-5 py-2.5 text-slate-400 hidden sm:table-cell tabular-nums">{formatTime(v.createdAt)}</td>
                      <td className="px-5 py-2.5"><StatusBadge status={v.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
