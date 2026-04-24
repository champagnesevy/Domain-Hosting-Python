import { useState } from "react";
import { Link, useLocation } from "wouter";
import { GraduationCap, Shield, UserPlus, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: "Student Names", href: "/admin", icon: Shield },
    { name: "Registrations", href: "/admin/register", icon: UserPlus },
  ];

  const close = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
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

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
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

        <div className="p-4 border-t border-slate-700/50 shrink-0">
          <div className="text-xs text-slate-400 font-medium px-2">Admin — Limited Access</div>
          <div className="text-[10px] text-slate-500 px-2 mt-0.5">Add, register & rename teachers</div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile top bar */}
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
