import { Router } from "express";
import { db, studentsTable } from "@workspace/db";
import { eq, ilike, and, or, sql } from "drizzle-orm";
import {
  ListStudentsQueryParams,
  CreateStudentBody,
  GetStudentParams,
  UpdateStudentParams,
  UpdateStudentBody,
  DeleteStudentParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const parsed = ListStudentsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid query parameters" });
    return;
  }
  const { search, status, remarks } = parsed.data;

  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(studentsTable.name, `%${search}%`),
        ilike(studentsTable.block, `%${search}%`),
        ilike(studentsTable.course, `%${search}%`),
        ilike(studentsTable.room, `%${search}%`),
      ),
    );
  }
  if (status) {
    conditions.push(eq(studentsTable.status, status));
  }
  if (remarks) {
    conditions.push(ilike(studentsTable.remarks, `%${remarks}%`));
  }

  const students =
    conditions.length > 0
      ? await db
          .select()
          .from(studentsTable)
          .where(and(...conditions))
      : await db.select().from(studentsTable);

  res.json(
    students.map((s) => ({
      ...s,
      yearLevel: s.yearLevel ?? undefined,
      email: s.email ?? undefined,
      phone: s.phone ?? undefined,
    })),
  );
});

router.post("/", async (req, res) => {
  const parsed = CreateStudentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid body" });
    return;
  }

  const now = new Date();
  const autoTime = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const providedTime = parsed.data.time?.trim();
  const chosenStatus = parsed.data.status ?? "N/A";
  let timeValue: string;
  if (providedTime && providedTime.length > 0) {
    timeValue = providedTime;
  } else if (chosenStatus === "IN") {
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
      room: parsed.data.room ?? "TBD",
      time: timeValue,
      status: chosenStatus,
      remarks: parsed.data.remarks ?? "NEWLY REGISTERED",
    })
    .returning();

  res.status(201).json({
    ...created,
    yearLevel: created.yearLevel ?? undefined,
    email: created.email ?? undefined,
    phone: created.phone ?? undefined,
  });
});

router.get("/stats/summary", async (_req, res) => {
  const [result] = await db
    .select({
      total: sql<number>`count(*)::int`,
      present: sql<number>`sum(case when remarks = 'PRESENT' then 1 else 0 end)::int`,
      absent: sql<number>`sum(case when remarks = 'ABSENT' then 1 else 0 end)::int`,
      late: sql<number>`sum(case when remarks = 'LATE' then 1 else 0 end)::int`,
    })
    .from(studentsTable);

  res.json({
    total: result.total ?? 0,
    present: result.present ?? 0,
    absent: result.absent ?? 0,
    late: result.late ?? 0,
  });
});

router.get("/:id", async (req, res) => {
  const parsed = GetStudentParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }

  const [student] = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.id, parsed.data.id));

  if (!student) {
    res.status(404).json({ message: "Student not found" });
    return;
  }

  res.json({
    ...student,
    yearLevel: student.yearLevel ?? undefined,
    email: student.email ?? undefined,
    phone: student.phone ?? undefined,
  });
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

  const existing = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.id, paramsParsed.data.id));

  if (!existing.length) {
    res.status(404).json({ message: "Student not found" });
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
  if (data.room !== undefined) updateValues.room = data.room;
  if (data.remarks !== undefined) updateValues.remarks = data.remarks;
  if (data.status !== undefined) updateValues.status = data.status;

  // Time: if explicitly provided, use it. Otherwise if status changes,
  // set N/A for OUT, keep existing for IN (admin can edit time manually).
  if (data.time !== undefined) {
    updateValues.time = data.time.trim() || "N/A";
  }

  const [updated] = await db
    .update(studentsTable)
    .set(updateValues)
    .where(eq(studentsTable.id, paramsParsed.data.id))
    .returning();

  res.json({
    ...updated,
    yearLevel: updated.yearLevel ?? undefined,
    email: updated.email ?? undefined,
    phone: updated.phone ?? undefined,
  });
});

router.delete("/:id", async (req, res) => {
  const parsed = DeleteStudentParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }

  const existing = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.id, parsed.data.id));

  if (!existing.length) {
    res.status(404).json({ message: "Student not found" });
    return;
  }

  await db.delete(studentsTable).where(eq(studentsTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
