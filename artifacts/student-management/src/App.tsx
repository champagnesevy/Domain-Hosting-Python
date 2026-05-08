import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { AdminLayout } from "@/components/admin-layout";
import Dashboard from "@/pages/dashboard";
import Register from "@/pages/register";
import Report from "@/pages/report";
import StudentReport from "@/pages/student-report";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminRegister from "@/pages/admin-register";
import Login from "@/pages/login";
import AdminLogin from "@/pages/admin-login";
import NotFound from "@/pages/not-found";
import { isAuthenticated } from "@/lib/auth";

const queryClient = new QueryClient();

function RequireAuth({ children, redirect }: { children: React.ReactNode; redirect: string }) {
  const [, setLocation] = useLocation();
  useEffect(() => {
    if (!isAuthenticated()) {
      setLocation(redirect);
    }
  }, []);
  if (!isAuthenticated()) return null;
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      {/* Standalone student-facing page — PIN protected, no login needed */}
      <Route path="/student-report" component={StudentReport} />

      {/* Auth pages */}
      <Route path="/login" component={Login} />
      <Route path="/admin/login" component={AdminLogin} />

      {/* Admin routes — require login */}
      <Route path="/admin/register">
        <RequireAuth redirect="/admin/login">
          <AdminLayout>
            <AdminRegister />
          </AdminLayout>
        </RequireAuth>
      </Route>
      <Route path="/admin">
        <RequireAuth redirect="/admin/login">
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </RequireAuth>
      </Route>

      {/* Main dashboard routes — require login */}
      <Route>
        <RequireAuth redirect="/login">
          <Layout>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/register" component={Register} />
              <Route path="/report" component={Report} />
              <Route component={NotFound} />
            </Switch>
          </Layout>
        </RequireAuth>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
