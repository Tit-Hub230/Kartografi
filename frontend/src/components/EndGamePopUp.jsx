export default function EndGameModal({ score, rounds, onRestart, highScore }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "30px 40px",
          maxWidth: "400px",
          textAlign: "center",
          boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
        }}
      >
        <h2 style={{ marginBottom: 16 }}>🎉 Game Over!</h2>
        <p style={{ fontSize: "1.2rem", marginBottom: 24 }}>
          You scored <strong>{score}</strong> out of {rounds * 10} points
        </p>
        <p>Your high score: 🏆 <strong>{highScore}</strong></p>
        <button
          onClick={onRestart}
          style={{
            padding: "10px 20px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
