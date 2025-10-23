// backend/routes/userRoutes.js
import { Router } from "express";
import {
  createUser,
  listUsers,
  getUserById,
  updateUserPoints,
  login,
  deleteUser,updateUserBasics, changePassword
} from "../controllers/userController.js";

const router = Router();

// backend/routes/userRoutes.js
router.post("/", createUser);
router.get("/", listUsers);
router.get("/:id", getUserById);
router.patch("/:id/points", updateUserPoints);
router.post("/login", login);
router.delete("/:id", deleteUser);

// NEW (corrected)
router.patch("/:id", updateUserBasics);
router.post("/:id/password", changePassword);

export default router;