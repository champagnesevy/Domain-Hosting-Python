import React, { useState } from "react";
import { 
  useListStudents, 
  useGetStudentSummary, 
  useDeleteStudent,
  useUpdateStudent,
  useGetStudent,
  getListStudentsQueryKey,
  getGetStudentSummaryQueryKey,
  getGetStudentQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Search, Edit2, Trash2, Loader2, BookOpen, Clock, X, Check, Filter, Users, UserCheck, UserX, AlarmClock } from "lucide-react";
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

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ListStudentsStatus | "ALL">("ALL");
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: students, isLoading: isLoadingStudents } = useListStudents({
    search: search || undefined,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });

  const { data: summary, isLoading: isLoadingSummary } = useGetStudentSummary();

  const { data: studentDetails, isLoading: isLoadingDetails } = useGetStudent(
    editingStudent?.id || 0,
    { query: { enabled: !!editingStudent?.id, queryKey: getGetStudentQueryKey(editingStudent?.id || 0) } }
  );

  const deleteStudent = useDeleteStudent();
  const updateStudent = useUpdateStudent();

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this record?")) return;
    
    deleteStudent.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStudentSummaryQueryKey() });
        toast({ title: "Record removed successfully" });
      },
      onError: () => {
        toast({ title: "Failed to remove record", variant: "destructive" });
      }
    });
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingStudent) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      block: formData.get("block") as string,
      course: formData.get("course") as string,
      room: formData.get("room") as string,
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

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Overview</h1>
        <p className="text-slate-500 mt-1">Today's attendance summary and active records.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6">
            <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Students</CardTitle>
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

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by name, course..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-slate-200 bg-white"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-slate-400" />
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-[140px] border-slate-200 bg-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="IN">In</SelectItem>
                <SelectItem value="OUT">Out</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-slate-600 h-12">Name</TableHead>
                <TableHead className="font-semibold text-slate-600 h-12">Block</TableHead>
                <TableHead className="font-semibold text-slate-600 h-12">Course</TableHead>
                <TableHead className="font-semibold text-slate-600 h-12">Room</TableHead>
                <TableHead className="font-semibold text-slate-600 h-12">Time</TableHead>
                <TableHead className="font-semibold text-slate-600 h-12">Status</TableHead>
                <TableHead className="font-semibold text-slate-600 h-12">Remarks</TableHead>
                <TableHead className="text-right font-semibold text-slate-600 h-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingStudents ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : students?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-slate-500">
                    No records found.
                  </TableCell>
                </TableRow>
              ) : (
                students?.map((student, i) => (
                  <TableRow key={student.id} className="group hover:bg-slate-50/50 transition-colors animate-in fade-in fill-mode-both" style={{ animationDelay: `${i * 50}ms` }}>
                    <TableCell className="font-medium text-slate-900">{student.name}</TableCell>
                    <TableCell className="text-slate-600">{student.block}</TableCell>
                    <TableCell className="text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                        {student.course}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">{student.room}</TableCell>
                    <TableCell className="text-slate-600 whitespace-nowrap">{student.time}</TableCell>
                    <TableCell>{getStatusBadge(student.status)}</TableCell>
                    <TableCell>{getRemarksBadge(student.remarks)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/10"
                          onClick={() => setEditingStudent(student)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          onClick={() => handleDelete(student.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
        <DialogContent className="sm:max-w-[425px]">
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
    </div>
  );
}
