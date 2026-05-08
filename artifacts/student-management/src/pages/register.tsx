import { useState } from "react";
import { useLocation } from "wouter";
import { Loader2, UserPlus, Mail, Lock, Eye, EyeOff, User, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getToken } from "@/lib/auth";

export default function Register() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Registration failed", description: data.message || "An error occurred", variant: "destructive" });
        return;
      }
      setDone(true);
    } catch {
      toast({ title: "Connection error", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="p-8 max-w-lg mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-in fade-in zoom-in duration-500">
          <div className="flex items-center justify-center mb-6">
            <div className="rounded-full bg-emerald-100 p-4">
              <CheckCircle2 className="h-12 w-12 text-emerald-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Created</h2>
          <p className="text-slate-500 mb-2">The teacher account has been registered successfully.</p>
          <p className="text-sm text-slate-400 mb-8">They can now sign in to the Admin Panel using their email and password.</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => { setDone(false); setName(""); setEmail(""); setPassword(""); setConfirmPassword(""); }}>
              Register Another
            </Button>
            <Button onClick={() => setLocation("/")}>Back to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-lg mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Register Teacher</h1>
        <p className="text-slate-500 mt-1">Create an account that gives access to the Admin Panel.</p>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6">
          <CardTitle className="text-xl flex items-center text-primary">
            <UserPlus className="mr-2 h-5 w-5" />
            Teacher Details
          </CardTitle>
          <CardDescription>
            The registered email and password will be used to sign in to the Admin Panel.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Full Name <span className="text-rose-500">*</span></label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="e.g. Juan dela Cruz" className="pl-9" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Email Address <span className="text-rose-500">*</span></label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input type="email" placeholder="teacher@example.com" className="pl-9" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Password <span className="text-rose-500">*</span></label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  className="pl-9 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Confirm Password <span className="text-rose-500">*</span></label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter password"
                  className="pl-9 pr-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setShowConfirm((v) => !v)} tabIndex={-1}>
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <Button type="submit" className="w-full md:w-auto gap-2" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                {loading ? "Creating account..." : "Register Teacher"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
