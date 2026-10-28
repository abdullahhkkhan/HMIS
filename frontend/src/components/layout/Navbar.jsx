import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { IoChevronDown, IoLogOutOutline, IoRefresh, IoCalendarClearOutline } from "react-icons/io5";
import logo from "../../assets/images/hmis_logo_mark.png";
import { useHmis } from "../../store/HmisStore";
import { navFor } from "../../routes/navConfig";
import { queueFor } from "../../utils/visits";
import { Avatar, RoleBadge, useToast } from "../ui";
import { ROLE_LABELS } from "../../utils/constants";

function useOutsideClick(ref, onClose, active) {
  useEffect(() => {
    if (!active) return;
    const handler = (e) => ref.current && !ref.current.contains(e.target) && onClose();
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", onKey);
    };
  }, [ref, onClose, active]);
}

function MiniCalendar() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const monthLabel = viewDate.toLocaleString("en-US", { month: "long", year: "numeric" });
  const firstDayIndex = viewDate.getDay();
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const cells = [...Array(firstDayIndex).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const isToday = (d) =>
    d === today.getDate() && viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear();
  const change = (delta) => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1));

  return (
    <div className="absolute right-0 top-11 w-72 rounded-xl bg-slate-800 text-slate-100 shadow-2xl ring-1 ring-white/10 p-4 z-50">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => change(-1)} className="cursor-pointer w-7 h-7 rounded-full hover:bg-white/5" aria-label="Previous month">‹</button>
        <span className="text-sm font-semibold">{monthLabel}</span>
        <button onClick={() => change(1)} className="cursor-pointer w-7 h-7 rounded-full hover:bg-white/5" aria-label="Next month">›</button>
      </div>
      <div className="grid grid-cols-7 text-center text-[11px] font-medium text-slate-500 mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-sm">
        {cells.map((day, i) => (
          <span
            key={i}
            className={`h-8 w-8 mx-auto flex items-center justify-center rounded-full ${
              day && isToday(day) ? "bg-blue-600 text-white font-semibold" : "text-slate-300"
            }`}
          >
            {day ?? ""}
          </span>
        ))}
      </div>
    </div>
  );
}

function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="hidden md:block text-right leading-tight">
      <p className="text-sm text-slate-200 tabular-nums">
        {now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
      </p>
      <p className="text-[11px] text-slate-500">
        {now.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
      </p>
    </div>
  );
}

export default function Navbar() {
  const { currentUser, logout, db, resetDemoData } = useHmis();
  const toast = useToast();
  const navigate = useNavigate();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const calRef = useRef(null);
  const menuRef = useRef(null);
  useOutsideClick(calRef, () => setCalendarOpen(false), calendarOpen);
  useOutsideClick(menuRef, () => setMenuOpen(false), menuOpen);

  const links = useMemo(() => navFor(currentUser?.role), [currentUser]);
  const queueCount = useMemo(() => queueFor(currentUser, db.visits).length, [currentUser, db.visits]);

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 shadow-lg shadow-black/20">
      <div className="bg-[#111827] border-b border-white/5">
        <div className="max-w-[1440px] mx-auto flex h-14 px-4 sm:px-6 lg:px-8 items-center justify-between gap-4">
          <NavLink to="/" className="flex items-center gap-2.5 min-w-0">
            <img src={logo} alt="" className="w-9 h-9 object-contain" />
            <div className="leading-tight min-w-0">
              <p className="text-[15px] font-semibold tracking-tight text-white">HMIS</p>
              <p className="hidden sm:block text-[11px] text-slate-400 truncate">Hospital Management Information System</p>
            </div>
          </NavLink>

          <div className="flex items-center gap-3 sm:gap-5">
            <Clock />
            <div className="relative" ref={calRef}>
              <button
                onClick={() => setCalendarOpen((o) => !o)}
                className={`cursor-pointer w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-colors ${
                  calendarOpen ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
                title="Calendar"
                aria-expanded={calendarOpen}
              >
                <IoCalendarClearOutline />
              </button>
              {calendarOpen && <MiniCalendar />}
            </div>

            <div className="w-px h-7 bg-white/10" />

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="cursor-pointer flex items-center gap-2.5 rounded-lg pl-1 pr-2 py-1 hover:bg-white/5"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                <Avatar name={currentUser.name} size="sm" />
                <span className="hidden sm:block text-left leading-tight">
                  <span className="block text-sm text-slate-100">{currentUser.name}</span>
                  <span className="block text-[11px] text-slate-400">{ROLE_LABELS[currentUser.role]}</span>
                </span>
                <IoChevronDown className={`text-xs text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
              </button>
              {menuOpen && (
                <div role="menu" className="absolute right-0 top-12 w-64 rounded-xl bg-slate-800 ring-1 ring-white/10 shadow-2xl p-1.5 z-50">
                  <div className="px-3 py-2.5 border-b border-white/10 mb-1">
                    <p className="text-sm font-medium text-white">{currentUser.name}</p>
                    <p className="text-xs text-slate-400 mb-2">@{currentUser.username}{currentUser.department ? ` · ${currentUser.department}` : ""}</p>
                    <RoleBadge role={currentUser.role} />
                  </div>
                  {currentUser.role === "admin" && (
                    <button
                      role="menuitem"
                      onClick={() => {
                        resetDemoData();
                        setMenuOpen(false);
                        toast("Demo data has been reset", "info");
                      }}
                      className="cursor-pointer w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                    >
                      <IoRefresh /> Reset demo data
                    </button>
                  )}
                  <button
                    role="menuitem"
                    onClick={handleLogout}
                    className="cursor-pointer w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-rose-300 hover:bg-rose-500/10"
                  >
                    <IoLogOutOutline /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <nav className="bg-[#172033]/95 backdrop-blur border-b border-white/5">
        <div className="max-w-[1440px] mx-auto px-2 sm:px-4 lg:px-6 flex gap-1 overflow-x-auto [scrollbar-width:none]">
          {links.map(({ key, to, label, icon: Icon, badge }) => (
            <NavLink
              key={key}
              to={to}
              className={({ isActive }) =>
                `relative flex items-center gap-2 px-3 h-12 text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive ? "text-white" : "text-slate-400 hover:text-slate-200"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="text-base" />
                  <span>{label}</span>
                  {badge && queueCount > 0 && (
                    <span className="min-w-5 h-5 px-1.5 rounded-full bg-blue-500/25 text-blue-200 text-[11px] font-semibold flex items-center justify-center tabular-nums">
                      {queueCount}
                    </span>
                  )}
                  <span
                    className={`absolute left-2 right-2 bottom-0 h-0.5 rounded-full bg-blue-500 transition-opacity ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}
