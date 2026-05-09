import React, { useState } from "react";
import { useListStudents, useGetStudentSummary, useCreateStudent } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Search, Loader2, Plus, User, Filter, Calendar, Check, X, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type DateFilter = "ALL" | "today" | "week" | "month";

function getTodayPH(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
}

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

const STATUS_OPTIONS = [
  "Present",
  "Absent",
  "Absent with post on GCR",
  "Late",
  "Late with post on GCR",
];

const DATE_FILTERS: { value: DateFilter; label: string }[] = [
  { value: "ALL", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

export default function AdminDashboard() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState<DateFilter>("ALL");
  const [addOpen, setAddOpen] = useState(false);
  const { data: summary } = useGetStudentSummary();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const todayPH = getTodayPH();

  const { data: students, isLoading } = useListStudents({
    search: search || undefined,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    dateFilter: dateFilter === "ALL" ? undefined : (dateFilter as any),
  });

  const createStudent = useCreateStudent();

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = (formData.get("name") as string).trim();
    if (!name) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    const block = (formData.get("block") as string | null)?.trim() || "TBD";
    const room = (formData.get("room") as string | null)?.trim() || "TBD";
    const subject = (formData.get("subject") as string | null)?.trim() || "TBD";
    const courseCode = (formData.get("courseCode") as string | null)?.trim() || "TBD";
    const date = (formData.get("date") as string | null)?.trim() || todayPH;
    const time = (formData.get("time") as string | null)?.trim() || "N/A";
    const status = (formData.get("status") as string | null)?.trim() || "Present";
    const remarks = (formData.get("remarks") as string | null)?.trim() || "";
    createStudent.mutate(
      { data: { name, block, room, course: subject, courseCode, date, time, status: status as any, remarks } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/students"] });
          queryClient.invalidateQueries({ queryKey: ["/api/students/stats/summary"] });
          setAddOpen(false);
          (e.target as HTMLFormElement).reset();
          toast({ title: "Teacher record added successfully" });
        },
        onError: (err) => toast({ title: "Failed to add record", description: err?.message || "Invalid data", variant: "destructive" }),
      },
    );
  };

  const summaryDate = (summary as any)?.date;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-500 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Teachers Dashboard</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Today's attendance summary — counts reset each day automatically.
          {summaryDate && (
            <span className="ml-1 font-medium text-slate-600">
              ({formatDateDisplay(summaryDate)})
            </span>
          )}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Today</span>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{summary?.total ?? 0}</div>
        </div>
        <div className="bg-emerald-50/60 rounded-xl border border-emerald-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Present</span>
            <Check className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-emerald-700">{summary?.present ?? 0}</div>
        </div>
        <div className="bg-rose-50/60 rounded-xl border border-rose-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-600">Absent</span>
            <X className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-3xl font-bold text-rose-700">{summary?.absent ?? 0}</div>
        </div>
        <div className="bg-amber-50/60 rounded-xl border border-amber-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">Late</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-amber-700">{summary?.late ?? 0}</div>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Search + Status filter row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, subject, block..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white border-slate-200"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[210px] bg-white border-slate-200">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setAddOpen(true)} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Add Record
          </Button>
        </div>

        {/* Date filter pills */}
        <div className="px-5 py-2.5 border-b border-slate-100 flex items-center gap-1.5 bg-white">
          <Calendar className="h-3.5 w-3.5 text-slate-400 mr-1 shrink-0" />
          {DATE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setDateFilter(f.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                dateFilter === f.value
                  ? "bg-primary text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-slate-600 w-10">#</TableHead>
                <TableHead className="font-semibold text-slate-600">Name</TableHead>
                <TableHead className="font-semibold text-slate-600">Block</TableHead>
                <TableHead className="font-semibold text-slate-600">Subject</TableHead>
                <TableHead className="font-semibold text-slate-600">Course Code</TableHead>
                <TableHead className="font-semibold text-slate-600">Date</TableHead>
                <TableHead className="font-semibold text-slate-600">Time</TableHead>
                <TableHead className="font-semibold text-slate-600">Status</TableHead>
                <TableHead className="font-semibold text-slate-600">Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-slate-400">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                    Loading records...
                  </TableCell>
                </TableRow>
              ) : !students?.length ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-slate-400">
                    <User className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    {search || statusFilter !== "ALL" || dateFilter !== "ALL"
                      ? "No records match your filters."
                      : "No records yet."}
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student, idx) => (
                  <TableRow key={student.id} className="hover:bg-slate-50/60">
                    <TableCell className="text-slate-400 text-sm">{idx + 1}</TableCell>
                    <TableCell className="font-medium text-slate-800">{student.name}</TableCell>
                    <TableCell className="text-slate-600">{student.block}</TableCell>
                    <TableCell className="text-slate-600">{student.course}</TableCell>
                    <TableCell className="text-slate-600 font-mono text-xs uppercase">{student.courseCode || "—"}</TableCell>
                    <TableCell className="text-slate-500 whitespace-nowrap text-sm">{formatDateDisplay(student.date)}</TableCell>
                    <TableCell className="text-slate-600 whitespace-nowrap">{student.time}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        /^present/i.test(student.status ?? "")
                          ? "bg-emerald-100 text-emerald-700"
                          : /^absent/i.test(student.status ?? "")
                          ? "bg-rose-100 text-rose-700"
                          : /^late/i.test(student.status ?? "")
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {student.status || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-600">{student.remarks || "—"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add record dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleAdd}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Add Attendance Record
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="add-name">Full Name <span className="text-rose-500">*</span></Label>
                <Input id="add-name" name="name" placeholder="e.g. Juan dela Cruz" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label htmlFor="add-block">Block</Label><Input id="add-block" name="block" placeholder="e.g. 4.2 BSIT" /></div>
                <div className="grid gap-2"><Label htmlFor="add-room">Room</Label><Input id="add-room" name="room" placeholder="e.g. 403" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label htmlFor="add-subject">Subject</Label><Input id="add-subject" name="subject" placeholder="e.g. Mathematics" /></div>
                <div className="grid gap-2"><Label htmlFor="add-course-code">Course Code</Label><Input id="add-course-code" name="courseCode" placeholder="e.g. MATH101" /></div>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select name="status" defaultValue="Present">
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label htmlFor="add-date">Date</Label><Input id="add-date" name="date" type="date" defaultValue={todayPH} max={todayPH} /></div>
                <div className="grid gap-2"><Label htmlFor="add-time">Time</Label><Input id="add-time" name="time" placeholder="e.g. 9:00 AM" /></div>
              </div>
              <div className="grid gap-2"><Label htmlFor="add-remarks">Remarks</Label><Input id="add-remarks" name="remarks" placeholder="Optional remarks" /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createStudent.isPending}>
                {createStudent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Record
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
