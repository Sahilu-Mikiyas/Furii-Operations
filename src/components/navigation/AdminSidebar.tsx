import React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  FileCheck2,
  Receipt,
  FolderOpen,
  Calendar,
  BarChart3,
  Settings,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Clients", href: "/clients", icon: Users },
  { label: "Projects", href: "/projects", icon: Briefcase },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Approvals", href: "/approvals", icon: FileCheck2 },
  { label: "Payments", href: "/payments", icon: Receipt },
  { label: "Files", href: "/files", icon: FolderOpen },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AdminSidebar() {
  const { user, setWorkspaceMode } = useAuth();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <aside className="w-64 border-r border-border bg-sidebar flex flex-col shrink-0 h-screen sticky top-0 select-none z-20">
      {/* Brand Header */}
      <div className="h-16 border-b border-border/80 px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src="/brand/furii-logo-horizontal.jpg"
            alt="Furii"
            className="h-8 w-auto object-contain"
          />
        </Link>
        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-semibold border border-border">
          Ops
        </span>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 font-mono">
          Operations
        </div>
        {NAV_ITEMS.map((item) => {
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
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Client Mode Preview Switcher & User Profile */}
      <div className="p-3 border-t border-border/80 space-y-2 bg-sidebar">
        <button
          onClick={() => setWorkspaceMode("client")}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary rounded-lg transition-colors border border-border/60"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="h-3.5 w-3.5 text-primary" />
            Switch to Client Portal
          </span>
          <span className="font-mono text-[10px] uppercase text-primary font-bold">Preview</span>
        </button>

        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-card border border-border/60">
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shrink-0">
            {user?.full_name ? user.full_name.slice(0, 2).toUpperCase() : "FU"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">
              {user?.full_name || "Admin"}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {user?.title || "Operations"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
