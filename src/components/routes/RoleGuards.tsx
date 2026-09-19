import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ClientLayout } from "@/layouts/ClientLayout";
import { Loader2 } from "lucide-react";

function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          Verifying Credentials...
        </span>
      </div>
    </div>
  );
}

// Manager guard — for /admin/* routes
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, role, isLoading } = useAuth();
  if (isLoading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/auth/agency" replace />;
  if (role === "client" || role === "client_owner" || role === "client_member") {
    return <Navigate to="/portal/overview" replace />;
  }
  return <AdminLayout>{children}</AdminLayout>;
}

// Client guard — for /portal/* routes
export function ClientGuard({ children }: { children: React.ReactNode }) {
  const { user, role, isLoading } = useAuth();
  if (isLoading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/portal/login" replace />;
  if (role === "manager" || role === "super_admin" || role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <ClientLayout>{children}</ClientLayout>;
}

// Root redirect — sends user to correct home
export function RootRedirect() {
  const { user, role, isLoading } = useAuth();
  if (isLoading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/auth/agency" replace />;
  if (role === "manager" || role === "super_admin" || role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (role === "client" || role === "client_owner" || role === "client_member") {
    return <Navigate to="/portal/overview" replace />;
  }
  return <Navigate to="/auth/agency" replace />;
}


