import { Router } from "express";
import { db, studentsTable } from "@workspace/db";
import { eq, ilike, and, or, sql, gte } from "drizzle-orm";
import {
  ListStudentsQueryParams,
  CreateStudentBody,
  GetStudentParams,
  UpdateStudentParams,
  UpdateStudentBody,
  DeleteStudentParams,
} from "@workspace/api-zod";

const router = Router();

function getTodayPH(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
}

function getDateOffsetPH(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
}

function getFirstOfMonthPH(): string {
  const d = new Date();
  const phStr = d.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
  return phStr.slice(0, 7) + "-01";
}

function serialize(t: typeof studentsTable.$inferSelect) {
  return {
    ...t,
    yearLevel: t.yearLevel ?? undefined,
    email: t.email ?? undefined,
    phone: t.phone ?? undefined,
  };
}

router.get("/", async (req, res) => {
  const parsed = ListStudentsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid query parameters" });
    return;
  }
  const { search, status, remarks, dateFilter } = parsed.data;
  const conditions = [];
  if (search) {
    conditions.push(
      or(
        ilike(studentsTable.name, `%${search}%`),
        ilike(studentsTable.block, `%${search}%`),
        ilike(studentsTable.course, `%${search}%`),
        ilike(studentsTable.courseCode, `%${search}%`),
        ilike(studentsTable.room, `%${search}%`),
      ),
    );
  }
  if (status) conditions.push(eq(studentsTable.status, status));
  if (remarks) conditions.push(ilike(studentsTable.remarks, `%${remarks}%`));
  if (dateFilter === "today") conditions.push(eq(studentsTable.date, getTodayPH()));
  else if (dateFilter === "week") conditions.push(gte(studentsTable.date, getDateOffsetPH(-6)));
  else if (dateFilter === "month") conditions.push(gte(studentsTable.date, getFirstOfMonthPH()));

  const teachers =
    conditions.length > 0
      ? await db.select().from(studentsTable).where(and(...conditions))
      : await db.select().from(studentsTable);

  res.json(teachers.map(serialize));
});

router.post("/", async (req, res) => {
  const parsed = CreateStudentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid body" });
    return;
  }

  const todayPH = getTodayPH();
  const now = new Date();
  const autoTime = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Manila",
  });

  const providedTime = parsed.data.time?.trim();
  const providedDate = parsed.data.date?.trim();
  const chosenStatus = parsed.data.status ?? "N/A";

  let timeValue: string;
  if (providedTime && providedTime.length > 0) {
    timeValue = providedTime;
  } else if (/^(present|late|in)/i.test(chosenStatus)) {
    timeValue = autoTime;
  } else {
    timeValue = "N/A";
  }

  const [created] = await db
    .insert(studentsTable)
    .values({
      name: parsed.data.name,
      email: parsed.data.email ?? null,
      phone: parsed.data.phone ?? null,
      yearLevel: parsed.data.yearLevel ?? null,
      block: parsed.data.block ?? "TBD",
      course: parsed.data.course ?? "TBD",
      courseCode: parsed.data.courseCode ?? "TBD",
      room: parsed.data.room ?? "TBD",
      date: providedDate && providedDate.length > 0 ? providedDate : todayPH,
      time: timeValue,
      status: chosenStatus,
      remarks: parsed.data.remarks,
    })
    .returning();

  res.status(201).json(serialize(created));
});

router.get("/stats/summary", async (_req, res) => {
  const today = getTodayPH();
  const [result] = await db
    .select({
      total: sql<number>`count(*)::int`,
      present: sql<number>`sum(case when status ILIKE 'present%' then 1 else 0 end)::int`,
      absent: sql<number>`sum(case when status ILIKE 'absent%' then 1 else 0 end)::int`,
      late: sql<number>`sum(case when status ILIKE 'late%' then 1 else 0 end)::int`,
    })
    .from(studentsTable)
    .where(eq(studentsTable.date, today));

  res.json({
    total: result.total ?? 0,
    present: result.present ?? 0,
    absent: result.absent ?? 0,
    late: result.late ?? 0,
    date: today,
  });
});

router.get("/:id", async (req, res) => {
  const parsed = GetStudentParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }
  const [teacher] = await db.select().from(studentsTable).where(eq(studentsTable.id, parsed.data.id));
  if (!teacher) {
    res.status(404).json({ message: "Teacher not found" });
    return;
  }
  res.json(serialize(teacher));
});

router.put("/:id", async (req, res) => {
  const paramsParsed = UpdateStudentParams.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }
  const bodyParsed = UpdateStudentBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ message: "Invalid body" });
    return;
  }
  const existing = await db.select().from(studentsTable).where(eq(studentsTable.id, paramsParsed.data.id));
  if (!existing.length) {
    res.status(404).json({ message: "Teacher not found" });
    return;
  }
  const data = bodyParsed.data;
  const updateValues: Record<string, unknown> = {};
  if (data.name !== undefined) updateValues.name = data.name;
  if (data.email !== undefined) updateValues.email = data.email;
  if (data.phone !== undefined) updateValues.phone = data.phone;
  if (data.yearLevel !== undefined) updateValues.yearLevel = data.yearLevel;
  if (data.block !== undefined) updateValues.block = data.block;
  if (data.course !== undefined) updateValues.course = data.course;
  if (data.courseCode !== undefined) updateValues.courseCode = data.courseCode;
  if (data.room !== undefined) updateValues.room = data.room;
  if (data.remarks !== undefined) updateValues.remarks = data.remarks;
  if (data.status !== undefined) updateValues.status = data.status;
  if (data.time !== undefined) updateValues.time = data.time.trim() || "N/A";
  if (data.date !== undefined) {
    const d = data.date.trim();
    if (d) updateValues.date = d;
  }
  const [updated] = await db
    .update(studentsTable)
    .set(updateValues)
    .where(eq(studentsTable.id, paramsParsed.data.id))
    .returning();
  res.json(serialize(updated));
});

router.delete("/:id", async (req, res) => {
  const parsed = DeleteStudentParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }
  const existing = await db.select().from(studentsTable).where(eq(studentsTable.id, parsed.data.id));
  if (!existing.length) {
    res.status(404).json({ message: "Teacher not found" });
    return;
  }
  await db.delete(studentsTable).where(eq(studentsTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
