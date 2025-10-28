import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes.js";
import cityRoutes from "./routes/cityRoute.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import cookieParser from "cookie-parser";


dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());


app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true, // required if you keep credentials: 'include' on the client
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
}));



app.use(express.json());

// routes
app.use("/api/users", userRoutes);
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/cities", cityRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// db + server
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/kartografi";
const PORT = process.env.PORT || 5050;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => console.log(`🚀 Backend listening on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });