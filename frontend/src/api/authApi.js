import { request } from "./client";

// authRoutes.js
export const login = (username, password) => request("/auth/login", { method: "POST", body: { username, password } });
export const getUsers = (token) => request("/auth/users", { token });
export const registerUser = (user, token) => request("/auth/register", { method: "POST", body: user, token });
export const updateUser = (id, patch, token) => request(`/auth/users/${id}`, { method: "PATCH", body: patch, token });
