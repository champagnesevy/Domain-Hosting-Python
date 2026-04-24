import React, { useState } from "react";
import {
  useListStudents,
  useGetStudentSummary,
  useCreateStudent,
  useUpdateStudent,
  useGetStudent,
  getListStudentsQueryKey,
  getGetStudentQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Search, Edit2, Loader2, Plus, User, X, Check, GraduationCap, BookOpen, Clock, Calendar, Filter, Users, Printer, Download, Eye, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Student } from "@workspace/api-client-react/src/generated/api.schemas";

/** Returns today's date as YYYY-MM-DD in Philippine time (UTC+8) */
function getTodayPH(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
}

export default function AdminDashboard() {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const { data: summary } = useGetStudentSummary();

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const todayPH = getTodayPH();

  const { data: students, isLoading } = useListStudents({
    search: search || undefined,
  });

  const { data: studentDetails, isLoading: isLoadingDetails } = useGetStudent(
    editingStudent?.id || 0,
    {
      query: {
        enabled: !!editingStudent?.id,
        queryKey: getGetStudentQueryKey(editingStudent?.id || 0),
      },
    },
  );

  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();

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
    const date = (formData.get("date") as string | null)?.trim() || todayPH;
    const time = (formData.get("time") as string | null)?.trim() || "N/A";
    const remarks = (formData.get("remarks") as string | null)?.trim() || "—";

    createStudent.mutate(
      {
        data: {
          name,
          block,
          room,
          course: subject,
          date,
          time,
          status: "N/A",
          remarks,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
          setAddOpen(false);
          (e.target as HTMLFormElement).reset();
          toast({ title: "Teacher added successfully" });
        },
        onError: () => {
          toast({ title: "Failed to add student", variant: "destructive" });
        },
      },
    );
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingStudent) return;
    const formData = new FormData(e.currentTarget);
    const name = (formData.get("name") as string).trim();
    if (!name) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    updateStudent.mutate(
      { id: editingStudent.id, data: { name } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
          setEditingStudent(null);
          toast({ title: "Name updated successfully" });
        },
        onError: () => {
          toast({ title: "Failed to update name", variant: "destructive" });
        },
      },
    );
  };

  return (
    <div className="p-8 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Teachers Dashboard
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Add new teachers and review their attendance records.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Teachers</div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{summary?.total || 0}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Present</div>
          <div className="text-3xl font-bold text-emerald-700 mt-2">{summary?.present || 0}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-rose-600">Absent</div>
          <div className="text-3xl font-bold text-rose-700 mt-2">{summary?.absent || 0}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-600">Late</div>
          <div className="text-3xl font-bold text-amber-700 mt-2">{summary?.late || 0}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={() => setAddOpen(true)} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Add Teacher
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
              <TableHead className="font-semibold text-slate-600">#</TableHead>
              <TableHead className="font-semibold text-slate-600">Name</TableHead>
              <TableHead className="font-semibold text-slate-600">Block</TableHead>
              <TableHead className="font-semibold text-slate-600">Subject</TableHead>
              <TableHead className="font-semibold text-slate-600">Date</TableHead>
              <TableHead className="font-semibold text-slate-600">Time</TableHead>
              <TableHead className="font-semibold text-slate-600">Status</TableHead>
              <TableHead className="font-semibold text-slate-600">Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-slate-400">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                  Loading teachers...
                </TableCell>
              </TableRow>
            ) : !students?.length ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-slate-400">
                  <User className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  {search ? "No teachers match your search." : "No teachers found. Add one to get started."}
                </TableCell>
              </TableRow>
            ) : (
              students.map((student, idx) => (
                <TableRow key={student.id} className="hover:bg-slate-50/60">
                  <TableCell className="text-slate-400 text-sm w-12">{idx + 1}</TableCell>
                  <TableCell className="font-medium text-slate-800">{student.name}</TableCell>
                  <TableCell className="text-slate-600">{student.block}</TableCell>
                  <TableCell className="text-slate-600">{student.course}</TableCell>
                  <TableCell className="text-slate-600">{student.date || "—"}</TableCell>
                  <TableCell className="text-slate-600">{student.time || "—"}</TableCell>
                  <TableCell className="text-slate-600">{student.status || "—"}</TableCell>
                  <TableCell className="text-slate-600">{student.remarks || "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Teacher Dialog */}
      <Dialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); }}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleAdd}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Add Teacher
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="add-name">Full Name <span className="text-rose-500">*</span></Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="add-name"
                    name="name"
                    placeholder="e.g. Juan dela Cruz"
                    className="pl-9"
                    autoFocus
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="add-block">Block</Label>
                  <Input id="add-block" name="block" placeholder="e.g. 4.2 BSIT" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-room">Room</Label>
                  <Input id="add-room" name="room" placeholder="e.g. 403" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-subject">Subject</Label>
                <Input id="add-subject" name="subject" placeholder="e.g. Mathematics" />
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
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setAddOpen(false); }}
                disabled={createStudent.isPending}
              >
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button type="submit" disabled={createStudent.isPending} className="gap-2">
                {createStudent.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Add Teacher
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
