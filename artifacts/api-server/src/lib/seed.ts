import bcrypt from "bcryptjs";
import { db, teachersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

export async function seedDefaultAdmin(): Promise<void> {
  try {
    const [existing] = await db
      .select()
      .from(teachersTable)
      .where(eq(teachersTable.email, "admin@facultydesk.com"));

    if (!existing) {
      const passwordHash = await bcrypt.hash("Admin1234", 10);
      await db.insert(teachersTable).values({
        name: "Admin",
        email: "admin@facultydesk.com",
        passwordHash,
        role: "admin",
      });
      logger.info("Default admin account created: admin@facultydesk.com / Admin1234");
    } else if (existing.role !== "admin") {
      await db
        .update(teachersTable)
        .set({ role: "admin" })
        .where(eq(teachersTable.email, "admin@facultydesk.com"));
      logger.info("Default admin account role corrected to admin");
    }
  } catch (err) {
    logger.error({ err }, "Failed to seed default admin");
  }
}
