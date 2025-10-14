// backend/routes/userRoutes.js
import { Router } from "express";
import {
  createUser,
  listUsers,
  getUserById,
  updateUserPoints,
  login,
  deleteUser,
} from "../controllers/userController.js";

const router = Router();

// CRUD-ish
router.post("/", createUser);                 // register
router.get("/", listUsers);                   // list
router.get("/:id", getUserById);              // read
router.patch("/:id/points", updateUserPoints);// update points
router.post("/login", login);                 // login demo
router.delete("/:id", deleteUser);            // delete

export default router;