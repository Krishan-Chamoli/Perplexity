import express from "express";
import {
  registerValidator,
  loginValidator,
} from "../validators/authValidators.js";
import {
  registerUser,
  loginUser,
  getProfile,
  validateEmail,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerValidator, registerUser);

router.post("/login", loginValidator, loginUser);

router.get("/profile", authMiddleware, getProfile);

router.get("/validate-email", validateEmail);

export default router;
