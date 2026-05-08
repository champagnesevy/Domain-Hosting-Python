import bcrypt from "bcryptjs";
import { db, teachersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

export async function seedDefaultAdmin(): Promise<void> {
  try {
    const existing = await db
      .select()
      .from(teachersTable)
      .where(eq(teachersTable.email, "admin@facultydesk.com"));
    if (existing.length === 0) {
      const passwordHash = await bcrypt.hash("Admin1234", 10);
      await db.insert(teachersTable).values({
        name: "Admin",
        email: "admin@facultydesk.com",
        passwordHash,
      });
      logger.info("Default admin account created: admin@facultydesk.com / Admin1234");
    }
  } catch (err) {
    logger.error({ err }, "Failed to seed default admin");
  }
}
