import { Link, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import MapLeaflet from "./components/MapLeaflet";
import Login from "./pages/login";
import Register from "./pages/Register";
import "./leaflet-icons-fix";

function Protected({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: 16 }}>
      <header style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <Link to="/" style={{ fontWeight: 700 }}>Kartografi</Link>
        <nav style={{ display: "flex", gap: 10 }}>
          <Link to="/">Map</Link>
        </nav>
        <div style={{ marginLeft: "auto" }}>
          {user ? (
            <>
              <span style={{ marginRight: 8 }}>hi, {user.username}</span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ marginRight: 8 }}>Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <Protected>
              <MapLeaflet />
            </Protected>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}