import React, { useState, useEffect } from "react";
import {
  useListStudents,
  useGetStudentSummary,
  useUpdateStudent,
  useGetStudent,
  useCreateStudent,
  useDeleteStudent,
  getListStudentsQueryKey,
  getGetStudentSummaryQueryKey,
  getGetStudentQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Search, Loader2, BookOpen, Clock, X, Check, Filter, Users, Plus, Printer, Download, Calendar, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Student, ListStudentsStatus, UpdateStudentRequestStatus } from "@workspace/api-client-react";

type DateFilter = "ALL" | "today" | "week" | "month";

function getTodayPH(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
}

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "—";
  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return dateStr;
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ListStudentsStatus | "ALL">("ALL");
  const [dateFilter, setDateFilter] = useState<DateFilter>("ALL");
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const todayPH = getTodayPH();

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "dashboard-print-styles";
    style.textContent = `@media print { aside, .no-print { display: none !important; } body, html { background: white !important; } .print-table-container { box-shadow: none !important; border: 1px solid #e2e8f0 !important; } @page { margin: 1.5cm; } }`;
    document.head.appendChild(style);
    return () => document.getElementById("dashboard-print-styles")?.remove();
  }, []);

  const { data: students, isLoading: isLoadingStudents } = useListStudents({
    search: search || undefined,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    dateFilter: dateFilter === "ALL" ? undefined : (dateFilter as any),
  });
  const { data: summary, isLoading: isLoadingSummary } = useGetStudentSummary();
  const { data: studentDetails } = useGetStudent(editingStudent?.id || 0, { query: { enabled: !!editingStudent?.id, queryKey: getGetStudentQueryKey(editingStudent?.id || 0) } });
  const updateStudent = useUpdateStudent();
  const createStudent = useCreateStudent();
  const deleteStudent = useDeleteStudent();

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingStudent) return;
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      block: formData.get("block") as string,
      course: formData.get("course") as string,
      room: formData.get("room") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      status: formData.get("status") as UpdateStudentRequestStatus,
      remarks: formData.get("remarks") as string,
    };
    updateStudent.mutate({ id: editingStudent.id, data }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetStudentSummaryQueryKey() }); setEditingStudent(null); toast({ title: "Record updated successfully" }); }, onError: () => toast({ title: "Failed to update record", variant: "destructive" }) });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteStudent.mutate(
      { id: deleteTarget.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStudentSummaryQueryKey() });
          if (editingStudent?.id === deleteTarget.id) setEditingStudent(null);
          if (viewingStudent?.id === deleteTarget.id) setViewingStudent(null);
          setDeleteTarget(null);
          toast({ title: "Teacher deleted successfully" });
        },
        onError: () => toast({ title: "Failed to delete teacher", variant: "destructive" }),
      },
    );
  };

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = (formData.get("name") as string).trim();
    const block = (formData.get("block") as string).trim();
    const room = (formData.get("room") as string).trim();
    const subject = (formData.get("subject") as string).trim();
    const courseCode = (formData.get("courseCode") as string).trim();
    const date = (formData.get("date") as string).trim();
    const time = (formData.get("time") as string).trim();
    const remarks = (formData.get("remarks") as string).trim();
    const status = (formData.get("status") as string).trim();
    if (!name) { toast({ title: "Full name is required", variant: "destructive" }); return; }
    createStudent.mutate({ data: { name, block: block || "TBD", room: room || "TBD", course: subject || "TBD", courseCode: courseCode || "TBD", date: date || todayPH, time: time || "N/A", status: (status || "N/A") as any, remarks: remarks || "—" } }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() }); queryClient.invalidateQueries({ queryKey: getGetStudentSummaryQueryKey() }); setAddOpen(false); (e.target as HTMLFormElement).reset(); toast({ title: "Teacher added successfully" }); }, onError: () => toast({ title: "Failed to add teacher", variant: "destructive" }) });
  };

  const handleExportCSV = () => {
    if (!students?.length) { toast({ title: "No records to export", variant: "destructive" }); return; }
    const headers = ["#", "Name", "Block", "Subject", "Course Code", "Room", "Date", "Time", "Status", "Remarks"];
    const rows = students.map((s, i) => [i + 1, `"${s.name.replace(/"/g, '""')}"`, s.block, s.course, s.courseCode, s.room, s.date || "—", s.time, s.status, s.remarks]);
    downloadFile(`attendance_${todayPH}.csv`, [headers.join(","), ...rows.map((r) => r.join(","))].join("\n"), "text/csv");
  };

  const statusOptions = ["Present", "Absent", "Absent with post on GCR", "Late", "Late with post on GCR"];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      <div className="no-print">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Overview</h1>
        <p className="text-slate-500 mt-1 text-sm md:text-base">Today's attendance summary and active records.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 no-print">
        <Card className="border-slate-200 shadow-sm"><CardHeader className="flex flex-row items-center justify-between pb-2 pt-6"><CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Teachers</CardTitle><Users className="h-4 w-4 text-slate-400" /></CardHeader><CardContent><div className="text-3xl font-bold text-slate-900">{isLoadingSummary ? <Loader2 className="h-6 w-6 animate-spin text-slate-300" /> : summary?.total || 0}</div></CardContent></Card>
        <Card className="border-emerald-100 bg-emerald-50/50 shadow-sm"><CardHeader className="flex flex-row items-center justify-between pb-2 pt-6"><CardTitle className="text-sm font-semibold text-emerald-700 uppercase tracking-wider">Present</CardTitle><Check className="h-4 w-4 text-emerald-600" /></CardHeader><CardContent><div className="text-3xl font-bold text-emerald-700">{isLoadingSummary ? <Loader2 className="h-6 w-6 animate-spin text-emerald-200" /> : summary?.present || 0}</div></CardContent></Card>
        <Card className="border-rose-100 bg-rose-50/50 shadow-sm"><CardHeader className="flex flex-row items-center justify-between pb-2 pt-6"><CardTitle className="text-sm font-semibold text-rose-700 uppercase tracking-wider">Absent</CardTitle><X className="h-4 w-4 text-rose-600" /></CardHeader><CardContent><div className="text-3xl font-bold text-rose-700">{isLoadingSummary ? <Loader2 className="h-6 w-6 animate-spin text-rose-200" /> : summary?.absent || 0}</div></CardContent></Card>
        <Card className="border-amber-100 bg-amber-50/50 shadow-sm"><CardHeader className="flex flex-row items-center justify-between pb-2 pt-6"><CardTitle className="text-sm font-semibold text-amber-700 uppercase tracking-wider">Late</CardTitle><Clock className="h-4 w-4 text-amber-600" /></CardHeader><CardContent><div className="text-3xl font-bold text-amber-700">{isLoadingSummary ? <Loader2 className="h-6 w-6 animate-spin text-amber-200" /> : summary?.late || 0}</div></CardContent></Card>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print-table-container">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-50/50 no-print">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search by name, course..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 border-slate-200 bg-white" />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap justify-end">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="w-[240px] border-slate-200 bg-white"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  {statusOptions.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 border-slate-200 text-slate-600 hover:text-slate-900 bg-white" onClick={handleExportCSV}><Download className="h-4 w-4" /><span className="hidden sm:inline">Export CSV</span></Button>
            <Button variant="outline" size="sm" className="gap-1.5 border-slate-200 text-slate-600 hover:text-slate-900 bg-white" onClick={() => window.print()}><Printer className="h-4 w-4" /><span className="hidden sm:inline">Print</span></Button>
            <Button onClick={() => setAddOpen(true)} size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"><Plus className="h-4 w-4" /><span className="hidden sm:inline">Add Teacher</span><span className="inline sm:hidden">Add</span></Button>
          </div>
        </div>
        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-1.5 bg-white no-print">
          <Calendar className="h-3.5 w-3.5 text-slate-400 mr-1" />
          {(["ALL", "today", "week", "month"] as DateFilter[]).map((f) => (
            <button key={f} onClick={() => setDateFilter(f)} className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${dateFilter === f ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"}`}>
              {f === "ALL" ? "All Time" : f === "today" ? "Today" : f === "week" ? "This Week" : "This Month"}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-slate-600 h-12">Name</TableHead>
                <TableHead className="font-semibold text-slate-600 h-12">Block</TableHead>
                <TableHead className="font-semibold text-slate-600 h-12">Subject</TableHead>
                <TableHead className="font-semibold text-slate-600 h-12">Course Code</TableHead>
                <TableHead className="font-semibold text-slate-600 h-12">Room</TableHead>
                <TableHead className="font-semibold text-slate-600 h-12">Date</TableHead>
                <TableHead className="font-semibold text-slate-600 h-12">Time</TableHead>
                <TableHead className="font-semibold text-slate-600 h-12">Status</TableHead>
                <TableHead className="font-semibold text-slate-600 h-12">Remarks</TableHead>
                <TableHead className="font-semibold text-slate-600 h-12 no-print">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingStudents ? (
                <TableRow><TableCell colSpan={10} className="h-32 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
              ) : students?.length === 0 ? (
                <TableRow><TableCell colSpan={10} className="h-32 text-center text-slate-500">No records found.</TableCell></TableRow>
              ) : (
                students?.map((student, i) => (
                  <TableRow key={student.id} className="group hover:bg-slate-50/50 transition-colors animate-in fade-in fill-mode-both" style={{ animationDelay: `${i * 50}ms` }}>
                    <TableCell className="font-medium text-slate-900"><button className="text-left hover:text-blue-600 hover:underline transition-colors focus:outline-none" onClick={() => setViewingStudent(student)}>{student.name}</button></TableCell>
                    <TableCell className="text-slate-600">{student.block}</TableCell>
                    <TableCell className="text-slate-600"><div className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 text-slate-400 no-print" />{student.course}</div></TableCell>
                    <TableCell className="text-slate-600 font-mono text-xs uppercase">{student.courseCode || "—"}</TableCell>
                    <TableCell className="text-slate-600">{student.room}</TableCell>
                    <TableCell className="text-slate-500 whitespace-nowrap text-sm">{formatDateDisplay(student.date)}</TableCell>
                    <TableCell className="text-slate-600 whitespace-nowrap">{student.time}</TableCell>
                    <TableCell>{student.status}</TableCell>
                    <TableCell>{student.remarks}</TableCell>
                    <TableCell className="no-print">
                      <div className="flex items-center gap-1">
                        <Button type="button" variant="ghost" size="icon" onClick={() => setEditingStudent(student)}><Edit2 className="h-4 w-4" /></Button>
                        <Button type="button" variant="ghost" size="icon" onClick={() => setDeleteTarget(student)}><Trash2 className="h-4 w-4 text-rose-600" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleAdd}>
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-slate-900">Add Teacher</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label htmlFor="add-name">Full Name <span className="text-rose-500">*</span></Label><Input id="add-name" name="name" placeholder="e.g. Juan dela Cruz" required /></div>
              <div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><Label htmlFor="add-block">Block</Label><Input id="add-block" name="block" placeholder="e.g. 4.2 BSIT" /></div><div className="grid gap-2"><Label htmlFor="add-room">Room</Label><Input id="add-room" name="room" placeholder="e.g. 403" /></div></div>
              <div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><Label htmlFor="add-subject">Subject</Label><Input id="add-subject" name="subject" placeholder="e.g. Mathematics" /></div><div className="grid gap-2"><Label htmlFor="add-course-code">Course Code</Label><Input id="add-course-code" name="courseCode" placeholder="e.g. MATH101" /></div></div>
              <div className="grid gap-2"><Label htmlFor="add-status">Status</Label><Select name="status"><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger><SelectContent>{statusOptions.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><Label htmlFor="add-date">Date</Label><Input id="add-date" name="date" type="date" defaultValue={todayPH} max={todayPH} /></div><div className="grid gap-2"><Label htmlFor="add-time">Time</Label><Input id="add-time" name="time" placeholder="e.g. 9:00 AM" /></div></div>
              <div className="grid gap-2"><Label htmlFor="add-remarks">Remarks</Label><Input id="add-remarks" name="remarks" placeholder="Optional remarks" /></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button type="submit" disabled={createStudent.isPending}>{createStudent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Add Teacher</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-slate-900">Edit Teacher</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label htmlFor="edit-name">Full Name</Label><Input id="edit-name" name="name" defaultValue={studentDetails?.name || editingStudent?.name || ""} /></div>
              <div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><Label htmlFor="edit-block">Block</Label><Input id="edit-block" name="block" defaultValue={studentDetails?.block || editingStudent?.block || ""} /></div><div className="grid gap-2"><Label htmlFor="edit-room">Room</Label><Input id="edit-room" name="room" defaultValue={studentDetails?.room || editingStudent?.room || ""} /></div></div>
              <div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><Label htmlFor="edit-subject">Subject</Label><Input id="edit-subject" name="course" defaultValue={studentDetails?.course || editingStudent?.course || ""} /></div><div className="grid gap-2"><Label htmlFor="edit-course-code">Course Code</Label><Input id="edit-course-code" name="courseCode" defaultValue={studentDetails?.courseCode || editingStudent?.courseCode || ""} /></div></div>
              <div className="grid gap-2"><Label htmlFor="edit-status">Status</Label><Select name="status" defaultValue={(studentDetails?.status || editingStudent?.status || "N/A") as string}><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger><SelectContent>{statusOptions.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><Label htmlFor="edit-date">Date</Label><Input id="edit-date" name="date" type="date" defaultValue={studentDetails?.date || editingStudent?.date || todayPH} max={todayPH} /></div><div className="grid gap-2"><Label htmlFor="edit-time">Time</Label><Input id="edit-time" name="time" defaultValue={studentDetails?.time || editingStudent?.time || ""} /></div></div>
              <div className="grid gap-2"><Label htmlFor="edit-remarks">Remarks</Label><Input id="edit-remarks" name="remarks" defaultValue={studentDetails?.remarks || editingStudent?.remarks || ""} /></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setEditingStudent(null)}>Cancel</Button><Button type="submit" disabled={updateStudent.isPending}>{updateStudent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Changes</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900">Delete Teacher</DialogTitle>
          </DialogHeader>
          <div className="py-3 text-sm text-slate-600">
            Are you sure you want to delete {deleteTarget?.name || "this teacher"}?
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleteStudent.isPending}>
              {deleteStudent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
