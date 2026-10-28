// Formatting helpers (MR#, tokens, dates, names).

export const formatMrNo = (n) => `MR-${String(n).padStart(6, "0")}`;

export const formatToken = (n) => `T-${String(n).padStart(3, "0")}`;

export const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .filter((p) => p && !/^dr\.?$/i.test(p))
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

export const formatCnic = (raw = "") => {
  const digits = raw.replace(/\D/g, "").slice(0, 13);
  return [digits.slice(0, 5), digits.slice(5, 12), digits.slice(12, 13)]
    .filter(Boolean)
    .join("-");
};

export const formatPhone = (raw = "") => {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  return digits.length > 4 ? `${digits.slice(0, 4)}-${digits.slice(4)}` : digits;
};

export const isSameDay = (a, b) => {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
};

export const isToday = (d) => isSameDay(d, new Date());

export const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

export const formatTime = (d) =>
  d
    ? new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    : "—";

export const formatDateTime = (d) => (d ? `${formatDate(d)}, ${formatTime(d)}` : "—");

export const minutesSince = (d) => Math.max(0, Math.round((Date.now() - new Date(d)) / 60000));

export const formatWait = (d) => {
  const m = minutesSince(d);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
};

export const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date(new Date().toDateString());
  return Math.ceil(diff / 86400000);
};

export const ageLabel = (p) => (p ? `${p.age}y · ${p.gender}` : "");
