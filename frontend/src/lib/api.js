// src/lib/api.js
const BASE = import.meta.env.VITE_API_URL; // e.g., http://localhost:5000

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const isJSON = res.headers.get("content-type")?.includes("application/json");
  const data = isJSON ? await res.json() : await res.text();
  if (!res.ok) {
    const message = (isJSON && data?.message) || res.statusText || "Request failed";
    throw new Error(message);
  }
  return data;
}

export const api = {
  register: (body) => request("/api/users", { method: "POST", body: JSON.stringify(body) }),
  login:    (body) => request("/api/users/login", { method: "POST", body: JSON.stringify(body) }),
};