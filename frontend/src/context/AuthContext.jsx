// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("kartografi:user");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  function saveUser(u) {
    setUser(u);
    localStorage.setItem("kartografi:user", JSON.stringify(u));
  }
  function logout() {
    setUser(null);
    localStorage.removeItem("kartografi:user");
  }

  async function register({ username, password, points = 0 }) {
    const u = await api.register({ username, password, points });
    saveUser(u);
    return u;
  }

  async function login({ username, password }) {
    const u = await api.login({ username, password });
    saveUser(u);
    return u;
  }

  const value = useMemo(() => ({ user, login, register, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}