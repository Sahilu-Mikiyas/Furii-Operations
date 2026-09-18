import React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard,
  Briefcase,
  FileCheck2,
  FolderOpen,
  Receipt,
  Calendar,
  ArrowLeft,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_APPROVALS } from "@/data/mock-data";

const CLIENT_NAV = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: Briefcase },
  { label: "Approvals", href: "/approvals", icon: FileCheck2, badge: true },
  { label: "Files & Assets", href: "/files", icon: FolderOpen },
  { label: "Financials", href: "/payments", icon: Receipt },
  { label: "Schedule", href: "/calendar", icon: Calendar },
];

export function ClientSidebar() {
  const { currentClient, setWorkspaceMode } = useAuth();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const pendingApprovalsCount = MOCK_APPROVALS.filter(
    (a) => a.status === "awaiting_review"
  ).length;

  return (
    <aside className="w-64 border-r border-border bg-sidebar flex flex-col shrink-0 h-screen sticky top-0 select-none z-20">
      {/* Brand Header */}
      <div className="h-16 border-b border-border/80 px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/brand/furii-logo-horizontal.jpg"
            alt="Furii"
            className="h-7 w-auto object-contain"
          />
        </Link>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
          Client Portal
        </span>
      </div>

      {/* Client Identity Card */}
      <div className="p-4 mx-3 my-3 rounded-xl bg-card border border-border/80 space-y-1">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-foreground truncate">
              {currentClient?.name || "Ersas Interiors"}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {currentClient?.industry || "Client Workspace"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 font-mono">
          Workspace
        </div>
        {CLIENT_NAV.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? currentPath === "/"
              : currentPath.startsWith(item.href);

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && pendingApprovalsCount > 0 && (
                <span
                  className={cn(
                    "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-amber-100 text-amber-800"
                  )}
                >
                  {pendingApprovalsCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Switch to Admin Mode */}
      <div className="p-3 border-t border-border/80 bg-sidebar">
        <button
          onClick={() => setWorkspaceMode("admin")}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors border border-border"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Admin Operations
        </button>
      </div>
    </aside>
  );
}
