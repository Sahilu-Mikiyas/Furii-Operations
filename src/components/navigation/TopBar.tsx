import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useApprovals } from "@/hooks/useApprovals";
import { useTasks } from "@/hooks/useTasks";
import {
  Search,
  Bell,
  CheckCircle2,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

interface TopBarProps {
  onOpenSearch?: () => void;
  onToggleMobileMenu?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
}

export function TopBar({
  onOpenSearch,
  onToggleMobileMenu,
  isSidebarCollapsed,
  onToggleSidebarCollapse,
}: TopBarProps) {
  const {
    user,
    role,
    currency,
    setCurrency,
    signOut,
  } = useAuth();

  const { approvals } = useApprovals();
  const { tasks } = useTasks();

  const [showNotifications, setShowNotifications] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);

  // Compute live notifications from real database records
  const liveNotifications = [
    ...approvals
      .filter((a) => a.status === "awaiting_review" || a.status === "pending")
      .map((a) => ({
        id: `appr-${a.id}`,
        title: "Review Required",
        body: `Deliverable "${a.title}" is awaiting formal client review.`,
        is_read: readIds.includes(`appr-${a.id}`),
      })),
    ...tasks
      .filter((t) => t.priority === "urgent" && t.status !== "completed")
      .map((t) => ({
        id: `task-${t.id}`,
        title: "Urgent Production Task",
        body: `Task "${t.title}" is flagged high priority.`,
        is_read: readIds.includes(`task-${t.id}`),
      })),
  ];

  const unreadCount = liveNotifications.filter((n) => !n.is_read).length;

  const markAllAsRead = () => {
    setReadIds(liveNotifications.map((n) => n.id));
  };

  return (
    <header className="h-16 border-b border-border/80 bg-background/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile hamburger & Global Search */}
      <div className="flex items-center gap-2.5 flex-1 max-w-md">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            aria-label="Toggle mobile menu"
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {onToggleSidebarCollapse && (
          <button
            onClick={onToggleSidebarCollapse}
            aria-label={isSidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
            title={isSidebarCollapsed ? "Show sidebar (expand)" : "Hide sidebar (collapse)"}
            className={`hidden md:flex p-2 rounded-lg transition-colors cursor-pointer items-center justify-center shrink-0 border ${
              isSidebarCollapsed
                ? "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20"
                : "bg-secondary/40 text-muted-foreground border-border hover:text-foreground hover:bg-secondary"
            }`}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        )}

        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-muted-foreground bg-card hover:bg-secondary/70 border border-border rounded-lg shadow-2xs transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="truncate">Search records, tasks, deliverables...</span>
          </div>
          <kbd className="hidden sm:inline-block font-mono text-[10px] bg-secondary px-1.5 py-0.5 rounded border border-border text-muted-foreground">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Control Bar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Currency Switcher */}
        <div className="flex items-center bg-secondary/70 p-0.5 rounded-lg border border-border text-xs">
          <button
            onClick={() => setCurrency("ETB")}
            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 font-semibold rounded-md transition-colors cursor-pointer ${
              currency === "ETB"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            ETB
          </button>
          <button
            onClick={() => setCurrency("USD")}
            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 font-semibold rounded-md transition-colors cursor-pointer ${
              currency === "USD"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            USD
          </button>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-background" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-card border border-border shadow-xl p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-border/80">
                <span className="text-xs font-bold text-foreground">
                  Notifications {unreadCount > 0 && `(${unreadCount})`}
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="h-3 w-3" /> Mark read
                  </button>
                )}
              </div>
              <div className="divide-y divide-border/60 max-h-72 overflow-y-auto mt-2">
                {liveNotifications.length === 0 ? (
                  <div className="py-4 text-center text-xs text-muted-foreground">
                    All caught up! No active notices.
                  </div>
                ) : (
                  liveNotifications.map((n) => (
                    <div key={n.id} className="py-2.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground">{n.title}</span>
                        {!n.is_read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{n.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Badge & Sign Out */}
        <div className="flex items-center gap-2 pl-2 border-l border-border/80">
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shrink-0">
            {user?.full_name ? user.full_name.slice(0, 2).toUpperCase() : "FU"}
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
    </header>
  );
}
