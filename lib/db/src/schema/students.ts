import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const studentsTable = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  yearLevel: text("year_level"),
  block: text("block").notNull().default("TBD"),
  course: text("course").notNull().default("TBD"),
  room: text("room").notNull().default("TBD"),
  date: text("date").notNull().default(""),
  time: text("time").notNull().default("N/A"),
  status: text("status").notNull().default("N/A"),
  remarks: text("remarks").notNull().default("N/A"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStudentSchema = createInsertSchema(studentsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof studentsTable.$inferSelect;
