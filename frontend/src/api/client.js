// Thin fetch wrapper for the Express backend (backend/src/routes/*).
// Not used yet — the app currently runs on the local store in src/store/HmisStore.jsx.
// When the backend is ready, call these from the store actions instead of mutating local state.

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export async function request(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);
  return data;
}
