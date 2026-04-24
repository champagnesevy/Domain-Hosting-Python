import React, { useState, useEffect } from "react";
import { 
  useListStudents, 
  useGetStudentSummary, 
  useUpdateStudent,
  useGetStudent,
  useCreateStudent,
  getListStudentsQueryKey,
  getGetStudentSummaryQueryKey,
  getGetStudentQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Search, Edit2, Loader2, BookOpen, Clock, X, Check, Filter, Users, Plus, Printer, Download, Calendar, Eye, Phone, Mail, GraduationCap, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Student, ListStudentsStatus, UpdateStudentRequestStatus } from "@workspace/api-client-react/src/generated/api.schemas";

type DateFilter = "ALL" | "today" | "week" | "month";

/** Returns today's date as YYYY-MM-DD in Philippine time (UTC+8) */
function getTodayPH(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
}

/** Formats a YYYY-MM-DD string to a human-readable PH date */
function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "—";
  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return dateStr;
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

/** Download a string as a file */
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
  const [addRemarks, setAddRemarks] = useState("");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const todayPH = getTodayPH();

  // Inject print styles
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "dashboard-print-styles";
    style.textContent = `
      @media print {
        aside, .no-print { display: none !important; }
        body, html { background: white !important; }
        .print-table-container { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
        @page { margin: 1.5cm; }
      }
    `;
    document.head.appendChild(style);
    return () => { document.getElementById("dashboard-print-styles")?.remove(); };
  }, []);

  const { data: students, isLoading: isLoadingStudents } = useListStudents({
    search: search || undefined,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    dateFilter: dateFilter === "ALL" ? undefined : (dateFilter as any),
  });

  const { data: summary, isLoading: isLoadingSummary } = useGetStudentSummary();

  const { data: studentDetails, isLoading: isLoadingDetails } = useGetStudent(
    editingStudent?.id || 0,
    { query: { enabled: !!editingStudent?.id, queryKey: getGetStudentQueryKey(editingStudent?.id || 0) } }
  );

  const updateStudent = useUpdateStudent();
  const createStudent = useCreateStudent();

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
    updateStudent.mutate({ id: editingStudent.id, data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStudentSummaryQueryKey() });
        setEditingStudent(null);
        toast({ title: "Record updated successfully" });
      },
      onError: () => {
        toast({ title: "Failed to update record", variant: "destructive" });
      }
    });
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

    if (!name) {
      toast({ title: "Full name is required", variant: "destructive" });
      return;
    }

    createStudent.mutate({
      data: {
        name,
        block: block || "TBD",
        room: room || "TBD",
        course: subject || "TBD",
        courseCode: courseCode || "TBD",
        date: date || todayPH,
        time: time || "N/A",
        status: "N/A",
        remarks: remarks || "—",
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStudentSummaryQueryKey() });
        setAddOpen(false);
        setAddRemarks("");
        (e.target as HTMLFormElement).reset();
        toast({ title: "Student added successfully" });
      },
      onError: () => {
        toast({ title: "Failed to add student", variant: "destructive" });
      }
    });
  };

  const handleExportCSV = () => {
    if (!students?.length) {
      toast({ title: "No records to export", variant: "destructive" });
      return;
    }
    const headers = ["#", "Name", "Block", "Course", "Room", "Date", "Time", "Status", "Remarks"];
    const rows = students.map((s, i) => [
      i + 1,
      `"${s.name.replace(/"/g, '""')}"`,
      s.block,
      s.course,
      s.room,
      s.date || "—",
      s.time,
      s.status,
      s.remarks,
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const date = todayPH;
    downloadFile(`attendance_${date}.csv`, csv, "text/csv");
    toast({ title: "CSV exported successfully" });
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "IN":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none px-2 py-0.5">IN</Badge>;
      case "OUT":
        return <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-200 border-none px-2 py-0.5">OUT</Badge>;
      default:
        return <Badge variant="secondary" className="px-2 py-0.5 bg-slate-100 text-slate-600 hover:bg-slate-200">N/A</Badge>;
    }
  };

  const getRemarksBadge = (remarks: string) => {
    const r = remarks.toUpperCase();
    if (r.includes("PRESENT")) return <span className="text-emerald-600 font-medium text-xs uppercase tracking-wider">{remarks}</span>;
    if (r.includes("ABSENT")) return <span className="text-rose-600 font-medium text-xs uppercase tracking-wider">{remarks}</span>;
    if (r.includes("LATE")) return <span className="text-amber-600 font-medium text-xs uppercase tracking-wider">{remarks}</span>;
    return <span className="text-slate-500 font-medium text-xs uppercase tracking-wider">{remarks}</span>;
  };

  const dateFilterLabels: Record<DateFilter, string> = {
    ALL: "All Time",
    today: "Today",
    week: "This Week",
    month: "This Month",
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="no-print">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Overview</h1>
        <p className="text-slate-500 mt-1 text-sm md:text-base">Today's attendance summary and active records.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 no-print">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6">
            <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Teachers</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {isLoadingSummary ? <Loader2 className="h-6 w-6 animate-spin text-slate-300" /> : summary?.total || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-emerald-100 bg-emerald-50/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6">
            <CardTitle className="text-sm font-semibold text-emerald-700 uppercase tracking-wider">Present</CardTitle>
            <Check className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-700">
              {isLoadingSummary ? <Loader2 className="h-6 w-6 animate-spin text-emerald-200" /> : summary?.present || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-100 bg-rose-50/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6">
            <CardTitle className="text-sm font-semibold text-rose-700 uppercase tracking-wider">Absent</CardTitle>
            <X className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-rose-700">
              {isLoadingSummary ? <Loader2 className="h-6 w-6 animate-spin text-rose-200" /> : summary?.absent || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-100 bg-amber-50/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6">
            <CardTitle className="text-sm font-semibold text-amber-700 uppercase tracking-wider">Late</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-700">
              {isLoadingSummary ? <Loader2 className="h-6 w-6 animate-spin text-amber-200" /> : summary?.late || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print-table-container">
        {/* Toolbar row 1: search + status + action buttons */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-50/50 no-print">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by name, course..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-slate-200 bg-white"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap justify-end">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="w-[130px] border-slate-200 bg-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="IN">In</SelectItem>
                  <SelectItem value="OUT">Out</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-slate-200 text-slate-600 hover:text-slate-900 bg-white"
              onClick={handleExportCSV}
              title="Export CSV"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-slate-200 text-slate-600 hover:text-slate-900 bg-white"
              onClick={handlePrint}
              title="Print"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Print</span>
            </Button>
            <Button
              onClick={() => setAddOpen(true)}
              size="sm"
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Teacher</span>
              <span className="inline sm:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* Toolbar row 2: date filter tabs */}
        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-1.5 bg-white no-print">
          <Calendar className="h-3.5 w-3.5 text-slate-400 mr-1" />
          {(["ALL", "today", "week", "month"] as DateFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setDateFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                dateFilter === f
                  ? "bg-primary text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              {dateFilterLabels[f]}
            </button>
          ))}
          {dateFilter !== "ALL" && (
            <span className="ml-2 text-[11px] text-slate-400">
              Showing {students?.length ?? 0} record{students?.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Print header — only visible when printing */}
        <div className="hidden print:block px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Faculty Desk — Attendance Records</h2>
          <p className="text-sm text-slate-500">
            Printed: {new Date().toLocaleString("en-PH", { timeZone: "Asia/Manila" })}
            {dateFilter !== "ALL" ? ` · Filter: ${dateFilterLabels[dateFilter]}` : ""}
            {statusFilter !== "ALL" ? ` · Status: ${statusFilter}` : ""}
          </p>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingStudents ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-32 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : students?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-32 text-center text-slate-500">
                    No records found.
                  </TableCell>
                </TableRow>
              ) : (
                students?.map((student, i) => (
                  <TableRow key={student.id} className="group hover:bg-slate-50/50 transition-colors animate-in fade-in fill-mode-both" style={{ animationDelay: `${i * 50}ms` }}>
                    <TableCell className="font-medium text-slate-900">
                      <button
                        className="text-left hover:text-blue-600 hover:underline transition-colors focus:outline-none"
                        onClick={() => setViewingStudent(student)}
                      >
                        {student.name}
                      </button>
                    </TableCell>
                    <TableCell className="text-slate-600">{student.block}</TableCell>
                  <TableCell className="text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-slate-400 no-print" />
                        {student.course}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 font-mono text-xs uppercase">{student.courseCode || "—"}</TableCell>
                    <TableCell className="text-slate-600">{student.room}</TableCell>
                    <TableCell className="text-slate-500 whitespace-nowrap text-sm">
                      {formatDateDisplay(student.date)}
                    </TableCell>
                    <TableCell className="text-slate-600 whitespace-nowrap">{student.time}</TableCell>
                    <TableCell>{getStatusBadge(student.status)}</TableCell>
                    <TableCell>{getRemarksBadge(student.remarks)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {students && students.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400 no-print">
            {students.length} record{students.length !== 1 ? "s" : ""} shown
          </div>
        )}
      </div>

      {/* Add Teacher Dialog */}
      <Dialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (!open) setAddRemarks(""); }}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleAdd}>
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-slate-900">Add Teacher</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="add-name">Full Name <span className="text-rose-500">*</span></Label>
                <Input id="add-name" name="name" placeholder="e.g. Juan dela Cruz" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="add-block">Block</Label>
                  <Input id="add-block" name="block" placeholder="e.g. 4.2 BSIT" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-room">Room Number</Label>
                  <Input id="add-room" name="room" placeholder="e.g. 403" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="add-subject">Subject</Label>
                  <Input id="add-subject" name="subject" placeholder="e.g. Mathematics" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-course-code">Course Code</Label>
                  <Input id="add-course-code" name="courseCode" placeholder="e.g. MATH101" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="add-date">Date</Label>
                  <Input 
                    id="add-date" 
                    name="date" 
                    type="date" 
                    defaultValue={todayPH}
                    max={todayPH}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-time">Time</Label>
                  <Input id="add-time" name="time" placeholder="e.g. 9:00 AM" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-remarks">Remarks</Label>
                <Input id="add-remarks" name="remarks" placeholder="Optional remarks" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setAddOpen(false); setAddRemarks("PRESENT"); }}>
                Cancel
              </Button>
              <Button type="submit" disabled={createStudent.isPending}>
                {createStudent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Teacher
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle>Edit Record</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={studentDetails?.name ?? editingStudent?.name} required disabled={isLoadingDetails} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="block">Block</Label>
                  <Input id="block" name="block" defaultValue={studentDetails?.block ?? editingStudent?.block} required disabled={isLoadingDetails} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="course">Course</Label>
                  <Input id="course" name="course" defaultValue={studentDetails?.course ?? editingStudent?.course} required disabled={isLoadingDetails} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="room">Room</Label>
                <Input id="room" name="room" defaultValue={studentDetails?.room ?? editingStudent?.room} required disabled={isLoadingDetails} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input 
                    id="date" 
                    name="date" 
                    type="date" 
                    max={todayPH}
                    defaultValue={studentDetails?.date ?? editingStudent?.date ?? todayPH}
                    disabled={isLoadingDetails}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" name="time" placeholder="e.g. 9:00 AM" defaultValue={studentDetails?.time ?? editingStudent?.time} disabled={isLoadingDetails} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={studentDetails?.status ?? editingStudent?.status} disabled={isLoadingDetails}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IN">In</SelectItem>
                      <SelectItem value="OUT">Out</SelectItem>
                      <SelectItem value="N/A">N/A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Select name="remarks" defaultValue={studentDetails?.remarks ?? editingStudent?.remarks} disabled={isLoadingDetails}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select remarks" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRESENT">PRESENT</SelectItem>
                      <SelectItem value="ABSENT">ABSENT</SelectItem>
                      <SelectItem value="LATE">LATE</SelectItem>
                      <SelectItem value="NEWLY REGISTERED">NEWLY REGISTERED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingStudent(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateStudent.isPending}>
                {updateStudent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Student Detail Dialog */}
      <Dialog open={!!viewingStudent} onOpenChange={(o) => !o && setViewingStudent(null)}>
        <DialogContent className="max-w-lg w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              Student Profile
            </DialogTitle>
          </DialogHeader>
          {viewingStudent && (
            <div className="space-y-5">
              {/* Name */}
              <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
                <div className="text-xs font-medium text-blue-400 uppercase tracking-wide mb-0.5">Full Name</div>
                <div className="text-lg font-semibold text-blue-900">{viewingStudent.name}</div>
                {viewingStudent.yearLevel && (
                  <div className="text-sm text-blue-600 mt-0.5 font-medium">{viewingStudent.yearLevel}</div>
                )}
              </div>

              {/* Contact info */}
              {(viewingStudent.email || viewingStudent.phone) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {viewingStudent.email && (
                    <div className="flex items-start gap-2.5 rounded-md border border-slate-200 px-3 py-2.5">
                      <Mail className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Email</div>
                        <div className="text-sm text-slate-700 break-all">{viewingStudent.email}</div>
                      </div>
                    </div>
                  )}
                  {viewingStudent.phone && (
                    <div className="flex items-start gap-2.5 rounded-md border border-slate-200 px-3 py-2.5">
                      <Phone className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Phone</div>
                        <div className="text-sm text-slate-700">{viewingStudent.phone}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Attendance record */}
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  Attendance Record
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { label: "Block", value: viewingStudent.block },
                    { label: "Course", value: viewingStudent.course },
                    { label: "Room", value: viewingStudent.room },
                    { label: "Date", value: viewingStudent.date ? new Date(viewingStudent.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—" },
                    { label: "Time", value: viewingStudent.time || "—" },
                    { label: "Status", value: viewingStudent.status || "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-md bg-slate-50 border border-slate-200 px-3 py-2">
                      <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">{label}</div>
                      <div className="text-sm font-medium text-slate-700 mt-0.5">{value || "—"}</div>
                    </div>
                  ))}
                </div>
                {viewingStudent.remarks && (
                  <div className="mt-2 rounded-md bg-slate-50 border border-slate-200 px-3 py-2">
                    <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mb-0.5">Remarks</div>
                    <div className={`text-sm font-semibold ${
                      viewingStudent.remarks === "PRESENT" ? "text-green-600"
                      : viewingStudent.remarks === "ABSENT" ? "text-red-600"
                      : viewingStudent.remarks === "LATE" ? "text-amber-600"
                      : "text-slate-600"
                    }`}>{viewingStudent.remarks}</div>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingStudent(null)}>Close</Button>
            <Button onClick={() => { if (viewingStudent) { setEditingStudent(viewingStudent); setViewingStudent(null); } }}>
              <Edit2 className="h-4 w-4 mr-2" /> Edit Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
