import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  Search,
  Bell,
  CheckCircle2,
  DollarSign,
  UserCheck,
  Building,
} from "lucide-react";
import { MOCK_NOTIFICATIONS, MOCK_CLIENTS } from "@/data/mock-data";
import type { UserRole } from "@/types";

interface TopBarProps {
  onOpenSearch?: () => void;
}

export function TopBar({ onOpenSearch }: TopBarProps) {
  const {
    user,
    role,
    switchRole,
    workspaceMode,
    setWorkspaceMode,
    currentClient,
    setCurrentClient,
    currency,
    setCurrency,
  } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <header className="h-16 border-b border-border/80 bg-background/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Search trigger */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-muted-foreground bg-card hover:bg-secondary/70 border border-border rounded-lg shadow-2xs transition-colors"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Search clients, projects, tasks, files...</span>
          </div>
          <kbd className="font-mono text-[10px] bg-secondary px-1.5 py-0.5 rounded border border-border text-muted-foreground">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Control bar */}
      <div className="flex items-center gap-3">
        {/* Currency Switcher */}
        <div className="flex items-center bg-secondary/70 p-0.5 rounded-lg border border-border">
          <button
            onClick={() => setCurrency("ETB")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              currency === "ETB"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            ETB
          </button>
          <button
            onClick={() => setCurrency("USD")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              currency === "USD"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            USD
          </button>
        </div>

        {/* Client selector (when in admin mode) */}
        {workspaceMode === "admin" && (
          <div className="hidden lg:flex items-center gap-1.5 bg-card border border-border px-2.5 py-1 rounded-lg text-xs">
            <Building className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={currentClient?.id || ""}
              onChange={(e) => {
                const found = MOCK_CLIENTS.find((c) => c.id === e.target.value);
                if (found) setCurrentClient(found);
              }}
              className="bg-transparent border-none text-xs font-medium text-foreground focus:outline-hidden cursor-pointer"
            >
              {MOCK_CLIENTS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Role Simulator Switcher */}
        <div className="hidden sm:flex items-center gap-1.5 bg-card border border-border px-2.5 py-1 rounded-lg text-xs">
          <UserCheck className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground text-[11px]">Role:</span>
          <select
            value={role}
            onChange={(e) => switchRole(e.target.value as UserRole)}
            className="bg-transparent border-none text-xs font-semibold text-foreground focus:outline-hidden cursor-pointer"
          >
            <option value="super_admin">Super Admin (Mikiyas)</option>
            <option value="admin">Project Manager</option>
            <option value="team_member">Team Member (Designer/Dev)</option>
            <option value="client_owner">Client Owner (Ersas)</option>
            <option value="client_member">Client Member (Restricted)</option>
          </select>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-background" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-card border border-border shadow-lg p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-border/80">
                <span className="text-xs font-bold text-foreground">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <CheckCircle2 className="h-3 w-3" /> Mark all read
                  </button>
                )}
              </div>
              <div className="divide-y divide-border/60 max-h-72 overflow-y-auto mt-2">
                {notifications.map((n) => (
                  <div key={n.id} className="py-2.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">{n.title}</span>
                      {!n.is_read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{n.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
