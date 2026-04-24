import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Users, UserPlus, GraduationCap, ExternalLink, Lock, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: Users },
    { name: "Registrations", href: "/register", icon: UserPlus },
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
          "fixed inset-y-0 left-0 z-30 w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col shadow-sm transition-transform duration-200",
          "lg:relative lg:translate-x-0 lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-sidebar-border/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="h-6 w-6 text-sidebar-primary" />
            <h1 className="font-semibold text-lg tracking-tight">Faculty Desk</h1>
          </div>
          <button
            className="lg:hidden p-1 rounded text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
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
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  )}
                >
                  <Icon className={cn("mr-3 h-4 w-4 shrink-0", isActive ? "text-sidebar-primary" : "opacity-70")} />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border/50 space-y-3 shrink-0">
          <Link href="/student-report" onClick={close}>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all cursor-pointer border border-sidebar-border/40">
              <ExternalLink className="h-3.5 w-3.5 opacity-70 shrink-0" />
              Student Beadle Report Form
            </div>
          </Link>
          <Link href="/admin" onClick={close}>
            <div className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all cursor-pointer border border-sidebar-border/40">
              <ExternalLink className="h-3.5 w-3.5 opacity-70 shrink-0" />
              Admin Panel
            </div>
          </Link>
          <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-sidebar-border/40 bg-sidebar-accent/20">
            <Lock className="h-3.5 w-3.5 text-sidebar-foreground/60 shrink-0" />
            <div>
              <div className="text-[10px] text-sidebar-foreground/50 uppercase tracking-wide font-medium">Student Report PIN</div>
              <div className="text-sm font-bold text-sidebar-foreground/80 tracking-widest font-mono">1234</div>
            </div>
          </div>
          <div className="text-xs text-sidebar-foreground/50 font-medium px-2">
            Teacher Management System v1.0
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center h-14 px-4 bg-white border-b border-slate-200 shadow-sm shrink-0 z-10">
          <button
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors mr-3"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="font-semibold text-slate-800">Faculty Desk</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
