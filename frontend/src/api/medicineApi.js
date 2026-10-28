import { request } from "./client";

// medicineRoutes.js — Medicine model
export const getMedicines = (token) => request("/medicines", { token });
export const addMedicine = (med, token) => request("/medicines", { method: "POST", body: med, token });
export const updateMedicine = (id, patch, token) => request(`/medicines/${id}`, { method: "PATCH", body: patch, token });
export const deleteMedicine = (id, token) => request(`/medicines/${id}`, { method: "DELETE", token });
