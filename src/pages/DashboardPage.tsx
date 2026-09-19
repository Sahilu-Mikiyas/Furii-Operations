import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { useApprovals } from "@/hooks/useApprovals";
import { useInvoices } from "@/hooks/useInvoices";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDate, formatRelativeDate } from "@/lib/utils";
import {
  Users,
  Briefcase,
  FileCheck2,
  Receipt,
  Calendar,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";


export function DashboardPage() {
  const { currency } = useAuth();
  return <AdminDashboard currency={currency} />;
}

// ─────────────────────────────────────────────
// Admin Dashboard (Internal Team Operations)
// ─────────────────────────────────────────────

function AdminDashboard({ currency }: { currency: "ETB" | "USD" }) {
  const { clients, isLoading: clientsLoading } = useClients();
  const { projects, isLoading: projectsLoading } = useProjects();
  const { approvals } = useApprovals();
  const { invoices } = useInvoices();
  const { events } = useCalendarEvents();
  const { activities } = useActivityLogs();

  const activeClients = clients.filter((c) => c.status === "active");
  const activeProjects = projects.filter((p) => p.status === "active" || p.status === "waiting_for_client");
  const pendingApprovals = approvals.filter((a) => a.status === "awaiting_review" || a.status === "pending");

  // Outstanding calculation
  const totalOutstanding = invoices
    .filter((i) => i.status === "sent" || i.status === "partially_paid")
    .reduce((acc, inv) => acc + (Number(inv.total || inv.amount || 0) - Number(inv.amount_paid || 0)), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <PageHeader
        title="Operations Command"
        description="High-level overview of active client operations, pending approvals, and today's schedule."
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/clients"
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs"
            >
              + New Client
            </Link>
          </div>
        }
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-card border border-border/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Active Clients</span>
            <Users className="h-4 w-4" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono tracking-tight text-foreground">
              {clientsLoading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : activeClients.length}
            </span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {activeClients.length} active
            </span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-card border border-border/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Active Projects</span>
            <Briefcase className="h-4 w-4" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono tracking-tight text-foreground">
              {projectsLoading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : activeProjects.length}
            </span>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              In progress
            </span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-card border border-border/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Pending Approvals</span>
            <FileCheck2 className="h-4 w-4 text-amber-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono tracking-tight text-foreground">
              {pendingApprovals.length}
            </span>
            <Link
              to="/approvals"
              className="text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200 transition-colors"
            >
              Review queue →
            </Link>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-card border border-border/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Outstanding Invoices</span>
            <Receipt className="h-4 w-4" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
              {formatCurrency(totalOutstanding, currency)}
            </span>
            <span className="text-xs font-mono text-muted-foreground">Pending</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Client Health & Today's Work */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Client Operational Health & Projects */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-xl bg-card border border-border/90 shadow-2xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground">Client Operational Health</h2>
                <p className="text-xs text-muted-foreground">
                  Status is operational clarity (On Track, Waiting for Client, Delayed), not subjective rating.
                </p>
              </div>
              <Link to="/clients" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                All clients <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="divide-y divide-border/60">
              {clients.map((client) => {
                const clientProjects = projects.filter((p) => p.client_id === client.id);
                return (
                  <div key={client.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <Link to="/clients" className="text-sm font-bold text-foreground hover:text-primary transition-colors">
                          {client.name}
                        </Link>
                        <StatusBadge status={client.health_status || "on_track"} />
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{client.industry}</p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground shrink-0">
                      <span>{clientProjects.length} active project(s)</span>
                      <Link
                        to="/projects"
                        className="px-2.5 py-1 rounded-md bg-secondary hover:bg-secondary/80 text-foreground font-sans font-medium text-xs border border-border/80 transition-colors"
                      >
                        Workspace
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Attention Required Highlight if any */}
          {clients.some((c) => c.health_status === "waiting_for_client" || c.health_status === "attention_required") && (
            <div className="p-5 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Operational Notice: Action Required</span>
              </div>
              <p className="text-xs text-amber-900/80 leading-relaxed">
                One or more client streams are currently paused awaiting deliverable sign-offs or stakeholder inputs.
              </p>
              <div className="pt-1 flex items-center gap-3 text-xs">
                <Link to="/approvals" className="font-semibold text-amber-900 hover:underline">
                  Open Approvals Hub ({pendingApprovals.length}) →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Production Schedule & Live Log */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-card border border-border/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Today's Agenda</h2>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="space-y-3">
              {events.slice(0, 3).map((evt) => (
                <div key={evt.id} className="p-3 rounded-lg bg-secondary/40 border border-border/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{evt.title}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {formatDate(evt.start_time, "MMM d")}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">{evt.description}</p>
                </div>
              ))}
            </div>

            <Link
              to="/calendar"
              className="w-full block py-2 text-center text-xs font-semibold text-foreground bg-secondary hover:bg-secondary/80 rounded-lg border border-border/80 transition-colors"
            >
              Full Calendar & Production Shoots →
            </Link>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Operational Audit Log</h2>
              <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                Live
              </span>
            </div>

            <div className="relative pl-4 border-l-2 border-border/80 space-y-4">
              {activities.slice(0, 4).map((act) => (
                <div key={act.id} className="relative group">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />
                  <p className="text-xs font-medium text-foreground leading-snug">{act.entity_title}</p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                    {formatRelativeDate(act.created_at)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}


