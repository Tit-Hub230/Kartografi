// src/lib/api.js
const BASE = (import.meta.env.VITE_API_URL || "http://localhost:5050").replace(/\/+$/, ""); // normalize trailing slash

async function request(path, options = {}) {
  const url = path.startsWith("/") ? `${BASE}${path}` : `${BASE}/${path}`;
  const res = await fetch(url, {
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
  register: (body) => request("/api/users", { method: "POST",credentials:"include", body: JSON.stringify(body) }),
  login:    (body) => request("/api/users/login", { method: "POST", credentials:"include", body: JSON.stringify(body) }),
};
