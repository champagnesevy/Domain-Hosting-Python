import { useState } from "react";
import { Link, useLocation } from "wouter";
import { GraduationCap, Shield, UserPlus, Menu, X, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { getUser, clearToken } from "@/lib/auth";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = getUser();

  const handleLogout = () => {
    clearToken();
    setLocation("/admin/login");
  };

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: Shield },
    { name: "Registrations", href: "/admin/register", icon: UserPlus },
  ];

  const close = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={close} />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 bg-slate-800 text-white flex flex-col shadow-md transition-transform duration-200",
          "lg:relative lg:translate-x-0 lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-700/50 shrink-0">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-6 w-6 text-blue-400" />
            <div>
              <h1 className="font-semibold text-sm tracking-tight leading-none">Faculty Desk</h1>
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 leading-none">
                Admin Panel
              </span>
            </div>
          </div>
          <button
            className="lg:hidden p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            onClick={close}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {user && (
          <div className="px-4 pt-4 pb-2 shrink-0">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-md bg-slate-700/50 border border-slate-600/30">
              <div className="rounded-full bg-blue-500/20 p-1.5 shrink-0">
                <User className="h-3.5 w-3.5 text-blue-400" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">{user.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href} onClick={close}>
                <div
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer",
                    isActive
                      ? "bg-blue-600/40 border border-blue-500/40 text-white"
                      : "text-slate-300 hover:bg-slate-700/60 hover:text-white",
                  )}
                >
                  <Icon className={cn("mr-3 h-4 w-4 shrink-0", isActive ? "text-blue-400" : "text-slate-400")} />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700/50 space-y-2 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-rose-400/80 hover:bg-rose-900/30 hover:text-rose-300 transition-all border border-rose-800/40"
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        <header className="lg:hidden flex items-center h-14 px-4 bg-slate-800 text-white shrink-0 z-10">
          <button
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors mr-3"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-blue-400" />
            <div>
              <span className="font-semibold text-sm">Faculty Desk</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 ml-2">Admin</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
