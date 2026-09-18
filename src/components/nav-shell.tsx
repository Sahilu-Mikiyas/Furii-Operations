import React from "react";
import { useAuth } from "@/lib/auth";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ClientLayout } from "@/layouts/ClientLayout";
import { useRouterState } from "@tanstack/react-router";

export function NavShell({ children }: { children: React.ReactNode }) {
  const { workspaceMode } = useAuth();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  // Don't render shell on auth pages
  if (pathname === "/auth" || pathname.startsWith("/auth/")) {
    return <>{children}</>;
  }

  if (workspaceMode === "client") {
    return <ClientLayout>{children}</ClientLayout>;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
