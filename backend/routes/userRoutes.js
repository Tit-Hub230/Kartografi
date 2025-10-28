// backend/routes/userRoutes.js
import { Router } from "express";
import {
  createUser,
  listUsers,
  getUserById,
  updateUserPoints,
  login,
  deleteUser,updateUserBasics, changePassword,
  updateSloHighScore, getSloHighScore, getLeaderboard, getSloLeaderboard, getQuizLeaderboard
} from "../controllers/userController.js";

const router = Router();

// backend/routes/userRoutes.js
router.get("/leaderboard", getLeaderboard);
router.get("/sloLeaderboard", getSloLeaderboard);
router.get("/quizLeaderboard", getQuizLeaderboard);
router.get("/me/slo_highscore", getSloHighScore);
router.post("/me/slo_highscore", updateSloHighScore);



router.post("/", createUser);
router.get("/", listUsers);
router.post("/login", login);
router.get("/:id", getUserById);
router.patch("/:id/points", updateUserPoints);
router.delete("/:id", deleteUser);


// NEW (corrected)
router.patch("/:id", updateUserBasics);
router.post("/:id/password", changePassword);

export default router;