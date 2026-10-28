import { IoHome, IoPersonAdd, IoMedkit, IoSettings } from "react-icons/io5";
import { LuHistory, LuClipboardList } from "react-icons/lu";
import { FaPills } from "react-icons/fa6";

// Single source of truth for which role can open which page (pages.txt).
export const PAGES = {
  dashboard: { to: "/dashboard", label: "Dashboard", icon: IoHome, roles: ["admin"] },
  registration: { to: "/registration", label: "Registration", icon: IoPersonAdd, roles: ["admin", "registration"] },
  patients: {
    to: "/patients",
    label: { admin: "Patient List", doctor: "Waiting Patients", dispensary: "Waiting Patients" },
    icon: LuClipboardList,
    roles: ["admin", "doctor", "dispensary"],
    badge: true,
  },
  history: { to: "/patient-history", label: "Patient History", icon: LuHistory, roles: ["admin", "doctor"] },
  dispensary: { to: "/dispensary", label: "Dispensary", icon: IoMedkit, roles: ["admin", "dispensary"] },
  medicines: { to: "/medicines", label: "Medicines", icon: FaPills, roles: ["admin"] },
  users: { to: "/users", label: "User Management", icon: IoSettings, roles: ["admin"] },
};

export const navFor = (role) =>
  Object.entries(PAGES)
    .filter(([, p]) => p.roles.includes(role))
    .map(([key, p]) => ({
      key,
      ...p,
      label: typeof p.label === "string" ? p.label : p.label[role],
    }));

