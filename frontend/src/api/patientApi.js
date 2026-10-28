import { request } from "./client";

// patientRoutes.js — Patient model (MR# from Counter model)
export const searchPatients = (q, token) => request(`/patients?search=${encodeURIComponent(q)}`, { token });
export const registerPatient = (patient, visit, token) => request("/patients", { method: "POST", body: { patient, visit }, token });
export const updatePatient = (id, patch, token) => request(`/patients/${id}`, { method: "PATCH", body: patch, token });
export const getPatientHistory = (id, token) => request(`/patients/${id}/visits`, { token });
