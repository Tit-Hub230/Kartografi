import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Login from "./pages/login";
import Register from "./pages/Register";
import Quiz from "./pages/Quiz";
import Profile from "./pages/Profile";
import "./leaflet-icons-fix";
import "./styles/layout.css";
import "./styles/styles.css";

function Protected({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <div className="app-shell">
      <NavBar />
      <Routes>
        <Route path="/"element={<Protected><Home /></Protected>}/>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/quiz" element={<Protected> <Quiz/> </Protected>}/>
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
      </Routes>
    </div>
  );
}