import React from "react";
import { useAuth } from "@/lib/auth";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ClientLayout } from "@/layouts/ClientLayout";
import { useLocation } from "react-router-dom";

export function NavShell({ children }: { children: React.ReactNode }) {
  const { workspaceMode } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;

  // Don't render sidebar shell on auth or portal login pages
  if (pathname === "/auth" || pathname.startsWith("/auth/") || pathname === "/portal/login") {
    return <>{children}</>;
  }

  if (workspaceMode === "client") {
    return <ClientLayout>{children}</ClientLayout>;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
