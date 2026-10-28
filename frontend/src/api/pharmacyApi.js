import { request } from "./client";

// pharmacyRoutes.js — PharmacyVisit model
export const getDispensaryQueue = (token) => request("/pharmacy/queue", { token });
export const dispense = (visitId, items, token) => request(`/pharmacy/${visitId}/dispense`, { method: "POST", body: { items }, token });
