import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const teachersTable = pgTable("teachers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("teacher"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Teacher = typeof teachersTable.$inferSelect;
