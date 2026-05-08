import { Router } from "express";
import jwt from "jsonwebtoken";
import { db, teachersTable } from "@workspace/db";
import { eq, ne } from "drizzle-orm";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? "faculty-desk-jwt-secret-2026";

function verifyToken(token: string): { id: number; name: string; email: string; role: string } {
  return jwt.verify(token, JWT_SECRET) as { id: number; name: string; email: string; role: string };
}

function requireAdmin(req: any, res: any): { id: number; name: string; email: string; role: string } | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Not authenticated" });
    return null;
  }
  try {
    const user = verifyToken(auth.slice(7));
    if (user.role !== "admin") {
      res.status(403).json({ message: "Forbidden" });
      return null;
    }
    return user;
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
    return null;
  }
}

router.get("/teachers", async (req, res) => {
  const user = requireAdmin(req, res);
  if (!user) return;

  const teachers = await db
    .select({
      id: teachersTable.id,
      name: teachersTable.name,
      email: teachersTable.email,
      createdAt: teachersTable.createdAt,
    })
    .from(teachersTable)
    .where(ne(teachersTable.role, "admin"))
    .orderBy(teachersTable.createdAt);

  res.json({ teachers });
});

router.delete("/teachers/:id", async (req, res) => {
  const user = requireAdmin(req, res);
  if (!user) return;

  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ message: "Invalid teacher ID" });
    return;
  }

  const [target] = await db
    .select()
    .from(teachersTable)
    .where(eq(teachersTable.id, id));

  if (!target) {
    res.status(404).json({ message: "Teacher not found" });
    return;
  }

  if (target.role === "admin") {
    res.status(403).json({ message: "Cannot delete admin accounts" });
    return;
  }

  await db.delete(teachersTable).where(eq(teachersTable.id, id));
  res.json({ message: "Teacher account deleted" });
});

export default router;
