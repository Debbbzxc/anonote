import { Router } from "express";
import rateLimit from "express-rate-limit";
import { register, login, logout } from "../controllers/auth-controller.js";
import { authMiddleware } from "../middleware/auth-middleware.js";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", authMiddleware, logout);

export default router;
