import { request } from "./client";

// doctorRoutes.js — DoctorVisit model
export const getQueue = (params, token) => request(`/visits?${new URLSearchParams(params)}`, { token });
export const createVisit = (patientId, visit, token) => request("/visits", { method: "POST", body: { patientId, ...visit }, token });
export const saveVisitModule = (visitId, module, data, token) =>
  request(`/visits/${visitId}/${module}`, { method: "PUT", body: data, token });
export const confirmVisit = (visitId, token) => request(`/visits/${visitId}/confirm`, { method: "POST", token });
export const referVisit = (visitId, body, token) => request(`/visits/${visitId}/refer`, { method: "POST", body, token });
