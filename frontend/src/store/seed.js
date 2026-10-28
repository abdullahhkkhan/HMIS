// Demo data used until the backend is connected.
// Everything is generated relative to "now" so the queues always look live.

import { VISIT_STATUS } from "../utils/constants";

// Keeps "today" demo visits inside today even right after midnight.
const minsAgo = (m) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const sinceMidnight = (Date.now() - start) / 60000;
  const scaled = sinceMidnight < 200 ? (m / 200) * (sinceMidnight - 1) : m;
  return new Date(Date.now() - Math.max(0, scaled) * 60000).toISOString();
};
const daysAgo = (d, hour = 10, minute = 0) => {
  const dt = new Date();
  dt.setDate(dt.getDate() - d);
  dt.setHours(hour, minute, 0, 0);
  return dt.toISOString();
};
const daysFromNow = (d) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  return dt.toISOString().slice(0, 10);
};

export const SEED_USERS = [
  { id: "u1", name: "Abdullah Khan", username: "admin", password: "admin123", role: "admin", department: "", active: true },
  { id: "u2", name: "Nadia Hussain", username: "reception", password: "reception123", role: "registration", department: "", active: true },
  { id: "u3", name: "Dr. Ali Raza", username: "drali", password: "doctor123", role: "doctor", department: "General Physician", active: true },
  { id: "u4", name: "Dr. Sara Malik", username: "drsara", password: "doctor123", role: "doctor", department: "General Physician", active: true },
  { id: "u5", name: "Dr. Kamran Shah", username: "drkamran", password: "doctor123", role: "doctor", department: "Dermatology", active: true },
  { id: "u6", name: "Dr. Hina Farooq", username: "drhina", password: "doctor123", role: "doctor", department: "Gynaecology", active: true },
  { id: "u7", name: "Dr. Usman Tariq", username: "drusman", password: "doctor123", role: "doctor", department: "Eye", active: true },
  { id: "u8", name: "Bilal Ahmed", username: "pharmacy", password: "pharmacy123", role: "dispensary", department: "", active: true },
];

const SEED_MEDICINES = [
  { id: "m1", name: "Paracetamol", strength: "500mg", form: "Tablet", category: "Analgesic", stock: 640, reorderLevel: 100, batch: "PCM-2411", expiry: daysFromNow(420) },
  { id: "m2", name: "Ibuprofen", strength: "400mg", form: "Tablet", category: "Analgesic", stock: 210, reorderLevel: 60, batch: "IBU-2408", expiry: daysFromNow(300) },
  { id: "m3", name: "Amoxicillin", strength: "500mg", form: "Capsule", category: "Antibiotic", stock: 18, reorderLevel: 50, batch: "AMX-2402", expiry: daysFromNow(150) },
  { id: "m4", name: "Azithromycin", strength: "250mg", form: "Tablet", category: "Antibiotic", stock: 72, reorderLevel: 30, batch: "AZI-2405", expiry: daysFromNow(40) },
  { id: "m5", name: "Cetirizine", strength: "10mg", form: "Tablet", category: "Antihistamine", stock: 300, reorderLevel: 60, batch: "CTZ-2409", expiry: daysFromNow(510) },
  { id: "m6", name: "Omeprazole", strength: "20mg", form: "Capsule", category: "Antacid", stock: 0, reorderLevel: 50, batch: "OMP-2401", expiry: daysFromNow(200) },
  { id: "m7", name: "Metformin", strength: "500mg", form: "Tablet", category: "Antidiabetic", stock: 450, reorderLevel: 100, batch: "MET-2410", expiry: daysFromNow(380) },
  { id: "m8", name: "Amlodipine", strength: "5mg", form: "Tablet", category: "Antihypertensive", stock: 260, reorderLevel: 60, batch: "AML-2407", expiry: daysFromNow(330) },
  { id: "m9", name: "Cough Syrup (Dextromethorphan)", strength: "120ml", form: "Syrup", category: "Other", stock: 24, reorderLevel: 20, batch: "CSY-2406", expiry: daysFromNow(25) },
  { id: "m10", name: "ORS", strength: "20.5g", form: "Sachet", category: "Supplement", stock: 180, reorderLevel: 50, batch: "ORS-2410", expiry: daysFromNow(600) },
  { id: "m11", name: "Hydrocortisone", strength: "1%", form: "Cream", category: "Dermatological", stock: 35, reorderLevel: 15, batch: "HYC-2404", expiry: daysFromNow(240) },
  { id: "m12", name: "Chloramphenicol", strength: "0.5%", form: "Drops", category: "Ophthalmic", stock: 12, reorderLevel: 15, batch: "CHL-2403", expiry: daysFromNow(90) },
  { id: "m13", name: "Folic Acid", strength: "5mg", form: "Tablet", category: "Supplement", stock: 520, reorderLevel: 80, batch: "FOL-2409", expiry: daysFromNow(700) },
  { id: "m14", name: "Ferrous Sulphate", strength: "200mg", form: "Tablet", category: "Supplement", stock: 140, reorderLevel: 60, batch: "FES-2408", expiry: daysFromNow(460) },
];

const SEED_PATIENTS = [
  { name: "Muhammad Asif", guardian: "Abdul Rehman", age: 46, gender: "Male", contact: "0300-1234567", cnic: "42101-1234567-1", type: "Zakat", address: "House 12, Block B, Gulshan-e-Iqbal, Karachi" },
  { name: "Ayesha Siddiqui", guardian: "Imran Siddiqui", age: 31, gender: "Female", contact: "0321-7654321", cnic: "42201-7654321-2", type: "Private", address: "Flat 4, Clifton Block 5, Karachi" },
  { name: "Zainab Bibi", guardian: "Ghulam Nabi", age: 58, gender: "Female", contact: "0333-1122334", cnic: "42301-1122334-4", type: "Welfare", address: "Korangi No. 3, Karachi" },
  { name: "Hamza Iqbal", guardian: "Iqbal Hussain", age: 9, gender: "Male", contact: "0345-9988776", cnic: "", type: "Zakat", address: "Landhi, Karachi" },
  { name: "Fatima Noor", guardian: "Noor Muhammad", age: 26, gender: "Female", contact: "0312-5566778", cnic: "42101-5566778-6", type: "Private", address: "North Nazimabad Block H, Karachi" },
  { name: "Rashid Mehmood", guardian: "Mehmood Ali", age: 63, gender: "Male", contact: "0301-4433221", cnic: "42101-4433221-1", type: "Welfare", address: "Malir Cantt, Karachi" },
  { name: "Sana Javed", guardian: "Javed Akhtar", age: 34, gender: "Female", contact: "0322-1010101", cnic: "42201-1010101-0", type: "Staff", address: "PECHS Block 2, Karachi" },
  { name: "Imran Qureshi", guardian: "Saleem Qureshi", age: 41, gender: "Male", contact: "0336-2020202", cnic: "42101-2020202-3", type: "Private", address: "DHA Phase 6, Karachi" },
  { name: "Khadija Parveen", guardian: "Aslam Parvez", age: 72, gender: "Female", contact: "0300-3030303", cnic: "42301-3030303-2", type: "Zakat", address: "Liaquatabad No. 10, Karachi" },
  { name: "Usama Farooq", guardian: "Farooq Ahmed", age: 19, gender: "Male", contact: "0315-4040404", cnic: "42101-4040404-5", type: "Welfare", address: "Orangi Town Sector 11, Karachi" },
  { name: "Mariam Ali", guardian: "Ali Hassan", age: 29, gender: "Female", contact: "0342-5050505", cnic: "42201-5050505-4", type: "Private", address: "Gulistan-e-Johar Block 15, Karachi" },
  { name: "Tariq Jameel", guardian: "Jameel Ahmed", age: 52, gender: "Male", contact: "0331-6060606", cnic: "42101-6060606-7", type: "Zakat", address: "Saddar, Karachi" },
];

const DIAGNOSES = [
  { complaint: "Fever and body aches for 3 days", diagnosis: "Viral fever", meds: [["m1", "1 tab", "TDS", 5], ["m10", "1 sachet", "BD", 3]] },
  { complaint: "Sore throat, cough", diagnosis: "Upper respiratory tract infection", meds: [["m4", "1 tab", "OD", 3], ["m9", "10 ml", "TDS", 5]] },
  { complaint: "Burning in stomach after meals", diagnosis: "Gastritis", meds: [["m6", "1 cap", "OD", 14]] },
  { complaint: "Follow-up: blood sugar", diagnosis: "Type 2 diabetes mellitus — controlled", meds: [["m7", "1 tab", "BD", 30]] },
  { complaint: "Headache, high BP at home", diagnosis: "Essential hypertension", meds: [["m8", "1 tab", "OD", 30], ["m1", "1 tab", "SOS", 5]] },
  { complaint: "Sneezing, runny nose", diagnosis: "Allergic rhinitis", meds: [["m5", "1 tab", "HS", 7]] },
  { complaint: "Weakness, dizziness", diagnosis: "Iron deficiency anaemia", meds: [["m14", "1 tab", "OD", 30], ["m13", "1 tab", "OD", 30]] },
];

const FREQ_PER_DAY = { OD: 1, BD: 2, TDS: 3, QID: 4, HS: 1, SOS: 1 };

function buildPrescription(meds, medicines) {
  return meds.map(([medicineId, dose, frequency, duration], i) => {
    const m = medicines.find((x) => x.id === medicineId);
    const qty = m.form === "Syrup" || m.form === "Cream" || m.form === "Drops" ? 1 : FREQ_PER_DAY[frequency] * duration;
    return {
      id: `rx${i}`,
      medicineId,
      name: m.name,
      strength: m.strength,
      form: m.form,
      dose,
      frequency,
      duration,
      qty,
      instructions: "After meal",
    };
  });
}

function vitalsFor(p, seed) {
  const elderly = p.age > 50;
  return {
    bpSys: String((elderly ? 135 : 118) + (seed % 12)),
    bpDia: String((elderly ? 86 : 76) + (seed % 6)),
    pulse: String(72 + (seed % 15)),
    temp: String((98.4 + (seed % 4) * 0.4).toFixed(1)),
    spo2: String(96 + (seed % 4)),
    weight: String(p.age < 14 ? 28 : 58 + (seed % 25)),
    height: String(p.age < 14 ? 132 : 155 + (seed % 22)),
    sugar: String(elderly ? 140 + (seed % 40) : 95 + (seed % 20)),
  };
}

export function buildSeed() {
  const medicines = SEED_MEDICINES.map((m) => ({ ...m }));
  const patients = SEED_PATIENTS.map((p, i) => ({
    ...p,
    id: `p${i + 1}`,
    mrNo: i + 1,
    registeredAt: daysAgo(40 - i * 3, 9, 15),
  }));

  const doctorsGP = ["u3", "u4"];
  const visits = [];
  let vid = 1;

  const completedVisit = (patient, day, hour, seed, doctorId) => {
    const dx = DIAGNOSES[seed % DIAGNOSES.length];
    const createdAt = daysAgo(day, hour, (seed * 7) % 50);
    const prescriptions = buildPrescription(dx.meds, medicines);
    return {
      id: `v${vid++}`,
      patientId: patient.id,
      token: 0,
      doctorId,
      department: "General Physician",
      priority: "Normal",
      complaint: dx.complaint,
      status: VISIT_STATUS.COMPLETED,
      createdAt,
      createdBy: "u2",
      modules: { vitals: true, health: true, medicines: true },
      vitals: vitalsFor(patient, seed),
      health: {
        complaints: dx.complaint,
        history: patient.age > 50 ? "Known hypertensive for 5 years" : "No significant past history",
        allergies: seed % 5 === 0 ? "Penicillin" : "None known",
        examination: "Chest clear, abdomen soft, non-tender",
        diagnosis: dx.diagnosis,
        advice: "Plenty of fluids, rest, follow up if symptoms persist",
        followUp: "",
      },
      prescriptions,
      referrals: [],
      consultedAt: new Date(new Date(createdAt).getTime() + 35 * 60000).toISOString(),
      dispensed: prescriptions.map((rx) => ({ medicineId: rx.medicineId, name: rx.name, qty: rx.qty })),
      dispensedAt: new Date(new Date(createdAt).getTime() + 55 * 60000).toISOString(),
      dispensedBy: "u8",
    };
  };

  // Past 6 days of completed OPD visits (history + dashboard trend)
  const perDay = [6, 9, 7, 11, 8, 5];
  perDay.forEach((count, idx) => {
    const day = idx + 1;
    for (let k = 0; k < count; k++) {
      const seed = day * 13 + k * 5;
      const patient = patients[seed % patients.length];
      visits.push(completedVisit(patient, day, 9 + (k % 7), seed, doctorsGP[k % 2]));
    }
  });

  // Today's visits, in every stage of the workflow
  const todayPlan = [
    { p: 0, doctor: "u3", status: "completed", priority: "Normal", mins: 190, dx: 0 },
    { p: 4, doctor: "u4", status: "completed", priority: "Normal", mins: 170, dx: 5 },
    { p: 6, doctor: "u3", status: "completed", priority: "Normal", mins: 150, dx: 2 },
    { p: 2, doctor: "u3", status: "at_dispensary", priority: "Normal", mins: 95, dx: 4 },
    { p: 7, doctor: "u4", status: "at_dispensary", priority: "Urgent", mins: 80, dx: 1 },
    { p: 5, doctor: "u3", status: "pending", priority: "Normal", mins: 55, complaint: "Chest tightness on exertion" },
    { p: 3, doctor: "u3", status: "waiting", priority: "Urgent", mins: 34, complaint: "High fever since last night, vomiting" },
    { p: 9, doctor: "u3", status: "waiting", priority: "Normal", mins: 26, complaint: "Pain in right knee for 2 weeks" },
    { p: 8, doctor: "u3", status: "waiting", priority: "Emergency", mins: 8, complaint: "Shortness of breath" },
    { p: 10, doctor: "u4", status: "waiting", priority: "Normal", mins: 21, complaint: "Skin rash on arms" },
    { p: 11, doctor: "u4", status: "waiting", priority: "Normal", mins: 12, complaint: "Routine BP check" },
    { p: 1, doctor: "u6", status: "waiting", priority: "Normal", mins: 18, complaint: "Antenatal check-up", department: "Gynaecology" },
  ];

  // Tokens are issued in arrival order
  [...todayPlan].sort((a, b) => b.mins - a.mins).forEach((t, i) => {
    const patient = patients[t.p];
    const createdAt = minsAgo(t.mins);
    const base = {
      id: `v${vid++}`,
      patientId: patient.id,
      token: i + 1,
      doctorId: t.doctor,
      department: t.department || "General Physician",
      priority: t.priority,
      createdAt,
      createdBy: "u2",
      referrals: [],
      prescriptions: [],
      dispensed: [],
      vitals: null,
      health: null,
    };
    if (t.status === "waiting") {
      visits.push({ ...base, complaint: t.complaint, status: "waiting", modules: { vitals: false, health: false, medicines: false } });
    } else if (t.status === "pending") {
      visits.push({
        ...base,
        complaint: t.complaint,
        status: "pending",
        startedAt: minsAgo(t.mins - 15),
        modules: { vitals: true, health: false, medicines: false },
        vitals: vitalsFor(patient, 7),
      });
    } else {
      const full = completedVisit(patient, 0, 9, t.dx + 3, t.doctor);
      const prescriptions = buildPrescription(DIAGNOSES[t.dx].meds, medicines);
      visits.push({
        ...full,
        ...base,
        complaint: DIAGNOSES[t.dx].complaint,
        status: t.status,
        modules: { vitals: true, health: true, medicines: true },
        vitals: full.vitals,
        health: { ...full.health, complaints: DIAGNOSES[t.dx].complaint, diagnosis: DIAGNOSES[t.dx].diagnosis },
        prescriptions,
        consultedAt: minsAgo(t.mins - 30),
        dispensed: t.status === "completed" ? prescriptions.map((rx) => ({ medicineId: rx.medicineId, name: rx.name, qty: rx.qty })) : [],
        dispensedAt: t.status === "completed" ? minsAgo(t.mins - 50) : null,
        dispensedBy: t.status === "completed" ? "u8" : null,
      });
    }
  });

  return {
    version: 1,
    counters: { mrNo: patients.length, tokenDate: new Date().toDateString(), token: todayPlan.length },
    users: SEED_USERS.map((u) => ({ ...u })),
    medicines,
    patients,
    visits,
  };
}
