import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useApprovals } from "@/hooks/useApprovals";
import {
  LayoutDashboard,
  FileCheck2,
  Layers,
  FolderOpen,
  Receipt,
  Calendar,
  LogOut,
  X,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function ClientSidebar({ isOpen, onClose }: ClientSidebarProps) {
  const { currentClient, role, user, signOut } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  const { approvals } = useApprovals(currentClient?.id);
  const pendingApprovalsCount = approvals.filter(
    (a) => a.status === "awaiting_review" || a.status === "pending"
  ).length;

  const isClientOwner = role === "client_owner";

  const CLIENT_NAV = [
    { label: "Executive Overview", href: "/portal/overview", icon: LayoutDashboard },
    {
      label: "Review & Approvals",
      href: "/portal/approvals",
      icon: FileCheck2,
      badgeCount: pendingApprovalsCount,
    },
    { label: "Active Services", href: "/portal/services", icon: Layers },
    { label: "Brand & Asset Vault", href: "/portal/files", icon: FolderOpen },
    ...(isClientOwner
      ? [{ label: "Financial Statement", href: "/portal/financials", icon: Receipt }]
      : []),
    { label: "Production Timeline", href: "/portal/schedule", icon: Calendar },
  ];

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
          <Link to="/portal/overview" className="flex items-center gap-2">
            <img
              src="/brand/furii-logo-horizontal.jpg"
              alt="Furii"
              className="h-7 w-auto object-contain"
            />
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              Client Portal
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

        {/* Client Identity Card */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-card border border-border/80 space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-xs shrink-0">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground truncate">
                {currentClient?.name || "Corporate Client"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {currentClient?.industry || "Enterprise Account"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
            Workspace
          </div>
          {CLIENT_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <span
                    className={cn(
                      "font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-full",
                      isActive
                        ? "bg-white text-primary"
                        : "bg-amber-100 text-amber-900 border border-amber-300"
                    )}
                  >
                    {item.badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Identity & Logout */}
        <div className="p-3 border-t border-border/80 bg-sidebar">
          <div className="flex items-center justify-between p-2 rounded-xl bg-card border border-border/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user?.full_name ? user.full_name.slice(0, 2).toUpperCase() : "CL"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate">
                  {user?.full_name || "Client Executive"}
                </p>
                <span className="text-[10px] font-mono text-muted-foreground block truncate">
                  {user?.title || (isClientOwner ? "Owner" : "Stakeholder")}
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
