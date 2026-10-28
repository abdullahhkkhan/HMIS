// Shared HMIS constants: roles, departments, statuses, clinical option lists.

export const ROLES = {
  ADMIN: "admin",
  REGISTRATION: "registration",
  DOCTOR: "doctor",
  DISPENSARY: "dispensary",
};

export const ROLE_LABELS = {
  admin: "Admin",
  registration: "Registration",
  doctor: "Doctor",
  dispensary: "Dispensary",
};

// Where each role lands after login.
export const ROLE_HOME = {
  admin: "/dashboard",
  registration: "/registration",
  doctor: "/patients",
  dispensary: "/patients",
};

export const DEPARTMENTS = [
  "General Physician",
  "Dermatology",
  "Eye",
  "Gynaecology",
];

export const PATIENT_TYPES = ["Zakat", "Welfare", "Private", "Staff"];

export const PRIORITIES = ["Emergency", "Urgent", "Normal"];

export const PRIORITY_RANK = { Emergency: 0, Urgent: 1, Normal: 2 };

// Visit lifecycle
//   waiting          → registered, waiting for doctor
//   pending          → doctor has opened the visit but not finished all modules
//   at_dispensary    → doctor confirmed the visit, medicines to be issued
//   completed        → medicines issued (or visit confirmed with no medicines)
//   cancelled        → removed from queue by admin
export const VISIT_STATUS = {
  WAITING: "waiting",
  PENDING: "pending",
  AT_DISPENSARY: "at_dispensary",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const VISIT_STATUS_LABELS = {
  waiting: "Waiting",
  pending: "Pending",
  at_dispensary: "At Dispensary",
  completed: "Completed",
  cancelled: "Cancelled",
};

// Modules a doctor must complete before a visit can be confirmed.
export const VISIT_MODULES = [
  { key: "vitals", label: "Patient Vitals" },
  { key: "health", label: "Health Details" },
  { key: "medicines", label: "Medicine Suggestion" },
];

export const FREQUENCIES = [
  { value: "OD", label: "OD · 1×/day", perDay: 1 },
  { value: "BD", label: "BD · 2×/day", perDay: 2 },
  { value: "TDS", label: "TDS · 3×/day", perDay: 3 },
  { value: "QID", label: "QID · 4×/day", perDay: 4 },
  { value: "HS", label: "HS · bedtime", perDay: 1 },
  { value: "SOS", label: "SOS · if needed", perDay: 1 },
];

export const MEAL_INSTRUCTIONS = ["After meal", "Before meal", "With meal", "Empty stomach"];

export const MEDICINE_FORMS = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Suspension",
  "Injection",
  "Drops",
  "Cream",
  "Ointment",
  "Inhaler",
  "Sachet",
];

export const MEDICINE_CATEGORIES = [
  "Analgesic",
  "Antibiotic",
  "Antihistamine",
  "Antacid",
  "Antidiabetic",
  "Antihypertensive",
  "Dermatological",
  "Ophthalmic",
  "Supplement",
  "Other",
];

export const LOW_STOCK_DEFAULT = 20;
export const EXPIRY_WARNING_DAYS = 60;
