import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, teachersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getDailyPin } from "../lib/pin";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? "faculty-desk-jwt-secret-2026";

function signToken(teacher: { id: number; name: string; email: string; role: string }) {
  return jwt.sign(
    { id: teacher.id, name: teacher.name, email: teacher.email, role: teacher.role },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
}

function verifyToken(token: string): { id: number; name: string; email: string; role: string } {
  return jwt.verify(token, JWT_SECRET) as { id: number; name: string; email: string; role: string };
}

router.post("/auth/register", async (req, res) => {
  const { name, email, password } = req.body as { name?: string; email?: string; password?: string };
  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    res.status(400).json({ message: "Name, email, and password are required" });
    return;
  }
  const existing = await db
    .select()
    .from(teachersTable)
    .where(eq(teachersTable.email, email.toLowerCase().trim()));
  if (existing.length > 0) {
    res.status(409).json({ message: "An account with that email already exists" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const [teacher] = await db
    .insert(teachersTable)
    .values({ name: name.trim(), email: email.toLowerCase().trim(), passwordHash, role: "teacher" })
    .returning();
  const token = signToken(teacher);
  res.status(201).json({ token, teacher: { id: teacher.id, name: teacher.name, email: teacher.email } });
});

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email?.trim() || !password?.trim()) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }
  const [teacher] = await db
    .select()
    .from(teachersTable)
    .where(eq(teachersTable.email, email.toLowerCase().trim()));
  if (!teacher || teacher.role !== "admin") {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }
  const valid = await bcrypt.compare(password, teacher.passwordHash);
  if (!valid) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }
  const token = signToken(teacher);
  res.json({ token, teacher: { id: teacher.id, name: teacher.name, email: teacher.email } });
});

router.post("/auth/login-teacher", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email?.trim() || !password?.trim()) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }
  const [teacher] = await db
    .select()
    .from(teachersTable)
    .where(eq(teachersTable.email, email.toLowerCase().trim()));
  if (!teacher || teacher.role !== "teacher") {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }
  const valid = await bcrypt.compare(password, teacher.passwordHash);
  if (!valid) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }
  const token = signToken(teacher);
  res.json({ token, teacher: { id: teacher.id, name: teacher.name, email: teacher.email } });
});

router.get("/auth/me", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  try {
    const user = verifyToken(auth.slice(7));
    res.json({ user });
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

router.get("/pin/today", (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  try {
    verifyToken(auth.slice(7));
    res.json({ pin: getDailyPin() });
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

router.post("/verify-pin", (req, res) => {
  const { pin } = req.body as { pin?: string };
  if (!pin?.trim()) {
    res.status(400).json({ valid: false, message: "PIN is required" });
    return;
  }
  if (pin.trim() === getDailyPin()) {
    res.json({ valid: true });
  } else {
    res.status(401).json({ valid: false, message: "Incorrect PIN" });
  }
});

export default router;
