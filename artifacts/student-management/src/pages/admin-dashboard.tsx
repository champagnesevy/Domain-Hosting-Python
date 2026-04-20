import React, { useState } from "react";
import {
  useListStudents,
  useCreateStudent,
  useUpdateStudent,
  useGetStudent,
  getListStudentsQueryKey,
  getGetStudentQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Search, Edit2, Loader2, Plus, User, X, Check } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Student } from "@workspace/api-client-react/src/generated/api.schemas";

export default function AdminDashboard() {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

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
    createStudent.mutate(
      { data: { name } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
          setAddOpen(false);
          toast({ title: "Student added successfully" });
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
          Student Names
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Add new students or update existing student names.
        </p>
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
            Add Student
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
              <TableHead className="font-semibold text-slate-600">#</TableHead>
              <TableHead className="font-semibold text-slate-600">Full Name</TableHead>
              <TableHead className="font-semibold text-slate-600 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-12 text-slate-400">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                  Loading students...
                </TableCell>
              </TableRow>
            ) : !students?.length ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-12 text-slate-400">
                  <User className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  {search ? "No students match your search." : "No students found. Add one to get started."}
                </TableCell>
              </TableRow>
            ) : (
              students.map((student, idx) => (
                <TableRow key={student.id} className="hover:bg-slate-50/60">
                  <TableCell className="text-slate-400 text-sm w-12">{idx + 1}</TableCell>
                  <TableCell className="font-medium text-slate-800">
                    {student.name}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                      onClick={() => setEditingStudent(student)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Rename
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {students && students.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
            {students.length} student{students.length !== 1 ? "s" : ""} total
          </div>
        )}
      </div>

      {/* Add Student Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Add Student
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd}>
            <div className="py-4 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="add-name">Full Name</Label>
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
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddOpen(false)}
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
                Add Student
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Name Dialog */}
      <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-primary" />
              Rename Student
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="py-4 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="edit-name"
                    name="name"
                    placeholder="e.g. Juan dela Cruz"
                    className="pl-9"
                    defaultValue={studentDetails?.name ?? editingStudent?.name}
                    disabled={isLoadingDetails}
                    autoFocus
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingStudent(null)}
                disabled={updateStudent.isPending}
              >
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateStudent.isPending || isLoadingDetails}
                className="gap-2"
              >
                {updateStudent.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Save Name
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
