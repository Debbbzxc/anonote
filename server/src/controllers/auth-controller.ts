import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/user.js";
import { JWT_SECRET } from "../config/auth.js";
import { tokenBlacklist } from "../lib/token-blacklist.js";

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = "24h";

export async function register(req: Request, res: Response) {
  const { username, password } = req.body;
  if (typeof username !== "string" || typeof password !== "string") {
    res.status(400).json({ error: "Username and password must be strings" });
    return;
  }
  if (!username || !password) {
    res.status(400).json({ error: "Username and password required" });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }

  try {
    const existing = await User.findOne({ username: username.toLowerCase() });
    if (existing) {
      res.status(409).json({ error: "Username already taken" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const salt = crypto.randomBytes(16).toString("hex");

    const user = await User.create({
      username: username.toLowerCase(),
      password: hashedPassword,
      salt,
    });

    const token = jwt.sign(
      { userId: user._id.toString(), username: user.username, jti: crypto.randomUUID() },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    res.status(201).json({ token, userId: user._id.toString(), username: user.username, salt: user.salt });
  } catch (err) {
    console.error("Registration failed:", err);
    res.status(500).json({ error: "Registration failed" });
  }
}

export async function login(req: Request, res: Response) {
  const { username, password } = req.body;
  if (typeof username !== "string" || typeof password !== "string") {
    res.status(400).json({ error: "Username and password must be strings" });
    return;
  }
  if (!username || !password) {
    res.status(400).json({ error: "Username and password required" });
    return;
  }

  try {
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { userId: user._id.toString(), username: user.username, jti: crypto.randomUUID() },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    res.json({ token, userId: user._id.toString(), username: user.username, salt: user.salt });
  } catch (err) {
    console.error("Login failed:", err);
    res.status(500).json({ error: "Login failed" });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const user = req.user!;
    tokenBlacklist.add(user.jti, user.exp!);
    res.json({ message: "Logged out" });
  } catch (err) {
    console.error("Logout failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
