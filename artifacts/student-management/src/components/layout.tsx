import { Link, useLocation } from "wouter";
import { Users, UserPlus, FileText, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: Users },
    { name: "Registrations", href: "/register", icon: UserPlus },
    { name: "Student Report", href: "/report", icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground font-sans">
      <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col shadow-sm relative z-10">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border/50">
          <GraduationCap className="h-6 w-6 mr-3 text-sidebar-primary" />
          <h1 className="font-semibold text-lg tracking-tight">Faculty Desk</h1>
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
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className={cn("mr-3 h-4 w-4", isActive ? "text-sidebar-primary" : "opacity-70")} />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border/50">
          <div className="text-xs text-sidebar-foreground/50 font-medium px-2">
            Student Management System v1.0
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
