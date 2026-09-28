import React from "react";
import { Link, useLocation } from "react-router-dom";
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
  LogOut,
  X,
  PanelLeftClose,
  Sparkles,
  ListTodo,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FuriiLogo } from "@/components/shared/FuriiLogo";

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const ADMIN_NAV = [
  { label: "Command Hub", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Clients Directory", href: "/admin/clients", icon: Users },
  { label: "Client Applications", href: "/admin/requests", icon: Sparkles },
  { label: "Service Streams", href: "/admin/projects", icon: Briefcase },
  { label: "Task Matrix", href: "/admin/tasks", icon: CheckSquare },
  { label: "Checklists & QA", href: "/admin/checklists", icon: ListTodo },
  { label: "Review Queue", href: "/admin/approvals", icon: FileCheck2 },
  { label: "Financials", href: "/admin/payments", icon: Receipt },
  { label: "Asset Vault", href: "/admin/files", icon: FolderOpen },
  { label: "Production Schedule", href: "/admin/calendar", icon: Calendar },
  { label: "Executive Debriefs", href: "/admin/reports", icon: BarChart3 },
  { label: "Agency Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}: AdminSidebarProps) {
  const { user, role, signOut } = useAuth();
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
          "w-64 border-r border-border bg-sidebar flex flex-col shrink-0 h-screen fixed inset-y-0 left-0 select-none z-40 transition-transform duration-300 ease-in-out shadow-xs",
          // Mobile responsive state
          isOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop collapse state
          isCollapsed ? "md:-translate-x-full" : "md:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 border-b border-border/80 px-4 sm:px-5 flex items-center justify-between shrink-0">
          <Link to="/admin/dashboard" className="flex items-center gap-2.5">
            <FuriiLogo className="h-7" />
          </Link>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-semibold border border-border">
              Operations
            </span>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                title="Hide sidebar"
                aria-label="Hide sidebar"
                className="hidden md:flex p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                aria-label="Close sidebar"
                className="md:hidden p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
            Agency Management
          </div>
          {ADMIN_NAV.map((item) => {
            if (item.href === "/admin/settings" && role !== "super_admin" && role !== "manager" && role !== "admin") {
              return null;
            }


            const Icon = item.icon;
            const isActive = currentPath === item.href || (item.href !== "/admin/dashboard" && currentPath.startsWith(item.href));

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

        {/* Real User Profile & Logout */}
        <div className="p-3 border-t border-border/80 bg-sidebar">
          <div className="flex items-center justify-between p-2 rounded-xl bg-card border border-border/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shrink-0">
                {user?.full_name ? user.full_name.slice(0, 2).toUpperCase() : "AD"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate">
                  {user?.full_name || "Admin"}
                </p>
                <span className="text-[10px] font-mono text-muted-foreground block truncate capitalize">
                  {role?.replace("_", " ")}
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
