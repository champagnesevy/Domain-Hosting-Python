import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateStudent } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import {
  Loader2,
  ClipboardCheck,
  User,
  BookOpen,
  Hash,
  MapPin,
  Activity,
  GraduationCap,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const STATUS_OPTIONS = [
  "Present",
  "Absent",
  "Absent with post on GCR",
  "Late",
  "Late with post on GCR",
] as const;

const formSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  block: z.string().min(1, "Block is required"),
  subject: z.string().min(1, "Subject is required"),
  course: z.string().min(1, "Course code is required"),
  room: z.string().min(1, "Room number is required"),
  status: z.enum(STATUS_OPTIONS),
  remarks: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  name: "",
  block: "",
  subject: "",
  course: "",
  room: "",
  status: "Present",
  remarks: "",
};

function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const { toast } = useToast();
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [checking, setChecking] = useState(false);
  const [shake, setShake] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;
    setChecking(true);
    try {
      const res = await fetch("/api/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pin.trim() }),
      });
      if (res.ok) {
        onUnlock();
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 600);
        setPin("");
        toast({ title: "Incorrect PIN", description: "Please check your PIN and try again.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Connection error. Please try again.", variant: "destructive" });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-semibold text-slate-800 text-lg tracking-tight">Teacher Attendance Report</span>
          </div>
          <Link href="/report">
            <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors px-2 py-1 rounded hover:bg-slate-100">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Teacher Report
            </button>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className={`w-full max-w-sm transition-all ${shake ? "animate-[shake_0.5s_ease-in-out]" : ""}`} style={shake ? { animation: "shake 0.5s ease-in-out" } : {}}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="bg-primary/5 border-b border-slate-100 px-6 py-5 flex flex-col items-center text-center">
              <div className="rounded-full bg-primary/10 p-3 mb-3"><Lock className="h-6 w-6 text-primary" /></div>
              <h2 className="text-lg font-bold text-slate-900">Enter Class PIN</h2>
              <p className="text-sm text-slate-500 mt-1">Enter the PIN provided by your professor to access the form.</p>
            </div>
            <form onSubmit={handleVerify} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">PIN Code</label>
                <div className="relative">
                  <Input type={showPin ? "text" : "password"} value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Enter PIN" className="pr-10 text-center text-lg tracking-widest font-mono" autoFocus />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" onClick={() => setShowPin((v) => !v)} tabIndex={-1}>{showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                </div>
              </div>
              <Button type="submit" className="w-full gap-2" disabled={checking || !pin.trim()}>{checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}{checking ? "Verifying..." : "Unlock Form"}</Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function StudentReport() {
  const { toast } = useToast();
  const createStudent = useCreateStudent();
  const [unlocked, setUnlocked] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues });

  const handleCancel = () => form.reset(defaultValues);

  const onSubmit = (data: FormValues) => {
    const payload = {
      name: data.name,
      block: data.block,
      course: data.subject,
      courseCode: data.course,
      room: data.room,
      status: data.status,
      remarks: data.remarks?.trim() || data.status,
    };
    createStudent.mutate(
      { data: payload },
      {
        onSuccess: () => {
          setSubmitted(true);
          form.reset(defaultValues);
        },
        onError: (err) => {
          toast({ title: "Submission failed", description: (err as any)?.message || "An error occurred. Please try again.", variant: "destructive" });
        },
      },
    );
  };

  if (!unlocked) return <PinGate onUnlock={() => setUnlocked(true)} />;

  if (submitted) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6"><div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-10 max-w-md w-full text-center animate-in fade-in zoom-in duration-500"><div className="flex items-center justify-center mb-6"><div className="rounded-full bg-emerald-100 p-4"><CheckCircle2 className="h-12 w-12 text-emerald-600" /></div></div><h2 className="text-2xl font-bold text-slate-900 mb-2">Report Submitted</h2><p className="text-slate-500 mb-8">Your attendance report has been recorded successfully.</p><Button onClick={() => setSubmitted(false)} className="w-full gap-2"><ClipboardCheck className="h-4 w-4" />Submit Another Report</Button></div></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 shadow-sm"><div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between gap-3"><div className="flex items-center gap-3"><GraduationCap className="h-6 w-6 text-primary" /><span className="font-semibold text-slate-800 text-lg tracking-tight">Teacher Attendance Report</span></div><Link href="/report"><button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors px-2 py-1 rounded hover:bg-slate-100"><LayoutDashboard className="h-3.5 w-3.5" />Teacher Report</button></Link></div></header>
      <main className="flex-1 flex items-start justify-center p-6 pt-10">
        <div className="w-full max-w-2xl">
          <div className="mb-6"><h1 className="text-2xl font-bold text-slate-900">Daily Attendance Report</h1><p className="text-slate-500 mt-1 text-sm">Please fill in all required fields and submit your attendance information.</p></div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-primary/5 border-b border-slate-100 px-6 py-4 flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-primary" /><span className="font-semibold text-slate-800">Class Record Form</span></div>
            <div className="p-6"><Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel>Full Name <span className="text-rose-500">*</span></FormLabel><FormControl><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="e.g. Juan dela Cruz" className="pl-9" {...field} /></div></FormControl><FormMessage /></FormItem>} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField control={form.control} name="block" render={({ field }) => <FormItem><FormLabel>Block <span className="text-rose-500">*</span></FormLabel><FormControl><div className="relative"><Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="e.g. 4.2 BSIT" className="pl-9" {...field} /></div></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="room" render={({ field }) => <FormItem><FormLabel>Room Number <span className="text-rose-500">*</span></FormLabel><FormControl><div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="e.g. 403" className="pl-9" {...field} /></div></FormControl><FormMessage /></FormItem>} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField control={form.control} name="subject" render={({ field }) => <FormItem><FormLabel>Subject <span className="text-rose-500">*</span></FormLabel><FormControl><div className="relative"><BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="e.g. Mathematics" className="pl-9" {...field} /></div></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="course" render={({ field }) => <FormItem><FormLabel>Course Code <span className="text-rose-500">*</span></FormLabel><FormControl><div className="relative"><Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="e.g. MATH101" className="pl-9" {...field} /></div></FormControl><FormMessage /></FormItem>} />
              </div>
              <div className="pt-2 border-t border-slate-100"><FormField control={form.control} name="status" render={({ field }) => <FormItem><FormLabel>Status <span className="text-rose-500">*</span></FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="w-full"><div className="flex items-center gap-2"><Activity className="h-4 w-4 text-slate-400 shrink-0" /><SelectValue placeholder="Select status" /></div></SelectTrigger></FormControl><SelectContent>{STATUS_OPTIONS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>} /></div>
              <FormField control={form.control} name="remarks" render={({ field }) => <FormItem><FormLabel>Remarks (optional)</FormLabel><FormControl><Input placeholder="Add any optional notes..." {...field} /></FormControl><FormMessage /></FormItem>} />
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100"><Button type="button" variant="outline" className="sm:w-auto w-full order-2 sm:order-1" onClick={handleCancel} disabled={createStudent.isPending}>Cancel</Button><Button type="submit" className="sm:flex-1 w-full order-1 sm:order-2 gap-2" disabled={createStudent.isPending}>{createStudent.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-4 w-4" />}Submit Report</Button></div>
            </form></Form></div>
          </div>
        </div>
      </main>
    </div>
  );
}
