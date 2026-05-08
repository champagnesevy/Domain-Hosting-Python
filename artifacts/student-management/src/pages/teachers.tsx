import { useState, useEffect, useCallback } from "react";
import { Users, Trash2, Loader2, UserCheck, RefreshCw, AlertTriangle, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getToken } from "@/lib/auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Teacher {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export default function Teachers() {
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch("/api/teachers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load teachers");
      setTeachers(data.teachers);
    } catch (err: any) {
      setError(err.message || "Could not load teacher list");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const token = getToken();
      const res = await fetch(`/api/teachers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete teacher");
      setTeachers((prev) => prev.filter((t) => t.id !== id));
      toast({ title: "Account deleted", description: "The teacher account has been removed." });
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  const confirmTeacher = teachers.find((t) => t.id === confirmId);

  return (
    <div className="p-8 max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Teacher Accounts</h1>
          <p className="text-slate-500 mt-1">
            Manage all registered teacher accounts that have access to the Admin Panel.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchTeachers} disabled={loading} className="gap-2 shrink-0">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin mb-3" />
          <p className="text-sm">Loading teacher accounts…</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-rose-100 p-4 mb-4">
            <AlertTriangle className="h-7 w-7 text-rose-500" />
          </div>
          <p className="text-slate-700 font-medium mb-1">Failed to load teachers</p>
          <p className="text-sm text-slate-400 mb-5">{error}</p>
          <Button variant="outline" onClick={fetchTeachers} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
        </div>
      )}

      {!loading && !error && teachers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="rounded-full bg-slate-100 p-5 mb-4">
            <Users className="h-9 w-9 text-slate-400" />
          </div>
          <p className="text-slate-700 font-semibold text-lg mb-1">No teacher accounts yet</p>
          <p className="text-sm text-slate-400">
            Register a teacher from the{" "}
            <a href="/register" className="text-primary underline underline-offset-2">
              Registrations
            </a>{" "}
            page to get started.
          </p>
        </div>
      )}

      {!loading && !error && teachers.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider px-1">
            {teachers.length} account{teachers.length !== 1 ? "s" : ""}
          </p>
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm hover:shadow transition-shadow"
            >
              <div className="rounded-full bg-primary/10 p-2.5 shrink-0">
                <UserCheck className="h-5 w-5 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900 truncate">{teacher.name}</div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Mail className="h-3 w-3" />
                    {teacher.email}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Calendar className="h-3 w-3" />
                    Registered{" "}
                    {new Date(teacher.createdAt).toLocaleDateString("en-PH", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 gap-1.5 shrink-0"
                onClick={() => setConfirmId(teacher.id)}
                disabled={deletingId === teacher.id}
              >
                {deletingId === teacher.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={confirmId !== null} onOpenChange={(open) => { if (!open) setConfirmId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete teacher account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-semibold text-slate-800">{confirmTeacher?.name}</span>{" "}
              ({confirmTeacher?.email}). They will no longer be able to sign in to the Admin Panel.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingId !== null}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={() => confirmId !== null && handleDelete(confirmId)}
              disabled={deletingId !== null}
            >
              {deletingId !== null ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Deleting…</>
              ) : (
                "Yes, delete account"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
