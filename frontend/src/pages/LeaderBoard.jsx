import { useEffect, useState } from "react";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBoard, setActiveBoard] = useState("slo"); // default board

  const endpoints = {
    slo: "http://localhost:5050/api/users/sloLeaderboard",
    quiz: "http://localhost:5050/api/users/quizLeaderboard",
    countries: "http://localhost:5050/api/users/leaderboard",
  };

  const fetchLeaderboard = (board) => {
    setLoading(true);
    fetch(endpoints[board], {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setLeaders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(`Error fetching ${board} leaderboard:`, err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLeaderboard(activeBoard);
  }, [activeBoard]);

  if (loading) return <p>Loading leaderboard...</p>;

  const getRankStyle = (idx) => {
    if (idx === 0) return { background: "#b4a24562" }; // gold
    if (idx === 1) return { background: "#c0c0c071" }; // silver
    if (idx === 2) return { background: "#cd803277" }; // bronze
    return { background: idx % 2 === 0 ? "#f9f9f9" : "#eef1f5" };
  };

  return (
    <div style={{ maxWidth: 900, margin: "30px auto", textAlign: "center", fontFamily: "'Segoe UI', sans-serif" }}>
      <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: 20, color: "#0077ff" }}>🏆 Leaderboards</h2>

      {/* Button group */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 25, gap: 10 }}>
        {["slo", "quiz", "countries"].map((b) => (
          <button
            key={b}
            onClick={() => setActiveBoard(b)}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: activeBoard === b ? "2px solid #0077ff" : "1px solid #ccc",
              background: activeBoard === b ? "#0077ff" : "#f4f4f4",
              color: activeBoard === b ? "#fff" : "#333",
              cursor: "pointer",
              fontWeight: 600,
              transition: "0.2s all",
            }}
          >
            {b === "slo" ? "SLO" : b === "quiz" ? "Quiz" : "Countries"}
          </button>
        ))}
      </div>

      {/* Leaderboard table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#fff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <thead style={{ background: "#0077ff", color: "#fff" }}>
          <tr>
            <th style={{ padding: "14px 12px" }}>#</th>
            <th style={{ padding: "14px 12px" }}>Player</th>
            <th style={{ padding: "14px 12px" }}>Score</th>
          </tr>
        </thead>
        <tbody>
          {leaders.map((u, idx) => (
            <tr
              key={u._id}
              style={{
                ...getRankStyle(idx),
                borderBottom: "1px solid #ddd",
                transition: "0.2s all",
              }}
            >
              <td style={{ padding: "12px", fontWeight: idx < 3 ? 700 : 500 }}>{idx + 1}</td>
              <td style={{ padding: "12px" }}>{u.username}</td>
              <td style={{ padding: "12px", fontWeight: 600 }}>
                {activeBoard === "slo"
                  ? u.slo_points ?? 0
                  : activeBoard === "quiz"
                  ? u.quiz_points ?? 0
                  : u.slo_points ?? 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
