import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

app.use((req, res, next) => {
  const origin = req.headers.origin;
  // Log what we see
  console.log(`[CORS] ${req.method} ${req.url}  Origin: ${origin || "(none)"}`);

  // Allow your dev origins (localhost + 127.0.0.1). For quick test, you can just use "*".
  const allowed = new Set([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ]);
  const allowOrigin = origin && allowed.has(origin) ? origin : "*";

  res.header("Access-Control-Allow-Origin", allowOrigin);
  res.header("Vary", "Origin"); // important when not using "*"
  res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  // set this only if you actually use cookies:
  // res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    // Preflight should end here with 204 and the headers above
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());

// routes
app.use("/api/users", userRoutes);
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// db + server
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/kartografi";
const PORT = process.env.PORT || 5000;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => console.log(`🚀 Backend listening on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });