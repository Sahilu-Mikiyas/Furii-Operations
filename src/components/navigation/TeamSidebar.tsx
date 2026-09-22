import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard,
  CheckSquare,
  Briefcase,
  FileCheck2,
  Calendar,
  LogOut,
  X,
  Code2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FuriiLogo } from "@/components/shared/FuriiLogo";

interface TeamSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const TEAM_NAV = [
  { label: "My Workspace", href: "/team/dashboard", icon: LayoutDashboard },
  { label: "Assigned Tasks", href: "/team/tasks", icon: CheckSquare },
  { label: "Active Projects", href: "/team/projects", icon: Briefcase },
  { label: "Deliverable Drafts", href: "/team/deliverables", icon: FileCheck2 },
  { label: "Production Calendar", href: "/team/calendar", icon: Calendar },
];

export function TeamSidebar({ isOpen, onClose }: TeamSidebarProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden animate-in fade-in"
        />
      )}

      <aside
        className={cn(
          "w-64 border-r border-border bg-sidebar flex flex-col shrink-0 h-screen sticky top-0 select-none z-40 transition-transform duration-200 ease-in-out",
          "fixed md:static inset-y-0 left-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 border-b border-border/80 px-6 flex items-center justify-between">
          <Link to="/team/dashboard" className="flex items-center gap-2.5">
            <FuriiLogo className="h-7" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
              Team
            </span>
            {onClose && (
              <button
                onClick={onClose}
                className="md:hidden p-1 rounded-md text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
            Production Hub
          </div>
          {TEAM_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href || (item.href !== "/team/dashboard" && currentPath.startsWith(item.href));

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User Profile & Sign Out */}
        <div className="p-3 border-t border-border/80 bg-sidebar">
          <div className="flex items-center justify-between p-2 rounded-xl bg-card border border-border/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user?.full_name ? user.full_name.slice(0, 2).toUpperCase() : "TM"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate">
                  {user?.full_name || "Team Member"}
                </p>
                <span className="text-[10px] font-mono text-muted-foreground block truncate">
                  {user?.title || "Specialist"}
                </span>
              </div>
            </div>

            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
