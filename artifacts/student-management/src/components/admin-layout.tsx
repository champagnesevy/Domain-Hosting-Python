import { Link, useLocation } from "wouter";
import { GraduationCap, Shield, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();

  const navigation = [
    { name: "Student Names", href: "/admin", icon: Shield },
    { name: "Registrations", href: "/admin/register", icon: UserPlus },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground font-sans">
      <aside className="w-64 bg-slate-800 text-white flex flex-col shadow-md relative z-10">
        <div className="h-16 flex items-center px-6 border-b border-slate-700/50 gap-3">
          <GraduationCap className="h-6 w-6 text-blue-400" />
          <div>
            <h1 className="font-semibold text-sm tracking-tight leading-none">Faculty Desk</h1>
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 leading-none">
              Admin Panel
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer",
                    isActive
                      ? "bg-blue-600/40 border border-blue-500/40 text-white"
                      : "text-slate-300 hover:bg-slate-700/60 hover:text-white"
                  )}
                >
                  <Icon className={cn("mr-3 h-4 w-4", isActive ? "text-blue-400" : "text-slate-400")} />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <div className="text-xs text-slate-400 font-medium px-2">Admin — Limited Access</div>
          <div className="text-[10px] text-slate-500 px-2 mt-0.5">Add, register & rename students</div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-slate-50">
        {children}
      </main>
    </div>
  );
}
