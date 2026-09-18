import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { useApprovals } from "@/hooks/useApprovals";
import { useInvoices } from "@/hooks/useInvoices";
import { useServices } from "@/hooks/useServices";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { formatCurrency, formatDate, formatRelativeDate } from "@/lib/utils";
import { MOCK_ACTIVITY } from "@/data/mock-data";
import {
  Users,
  Briefcase,
  FileCheck2,
  Receipt,
  ArrowRight,
  Clock,
  Calendar,
  AlertTriangle,
  Layers,
  Sparkles,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

export function DashboardPage() {
  const { workspaceMode, currency, setWorkspaceMode, currentClient, role } = useAuth();

  if (workspaceMode === "client") {
    return <ClientDashboard client={currentClient} currency={currency} role={role} />;
  }

  return <AdminDashboard currency={currency} onSwitchToClient={() => setWorkspaceMode("client")} />;
}

// ─────────────────────────────────────────────
// Admin Dashboard (Internal Team Operations)
// ─────────────────────────────────────────────

function AdminDashboard({ currency, onSwitchToClient }: { currency: "ETB" | "USD"; onSwitchToClient: () => void }) {
  const { clients, isLoading: clientsLoading } = useClients();
  const { projects, isLoading: projectsLoading } = useProjects();
  const { approvals } = useApprovals();
  const { invoices } = useInvoices();
  const { events } = useCalendarEvents();

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
              {MOCK_ACTIVITY.slice(0, 4).map((act) => (
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

// ─────────────────────────────────────────────
// Client Dashboard (Polished Portal Scoped to Client)
// ─────────────────────────────────────────────

function ClientDashboard({ client, currency, role }: { client: any; currency: "ETB" | "USD"; role: string }) {
  const targetClient = client || {
    id: "client-solomon",
    name: "Solomon Gold Mining",
    industry: "Mining & Resources",
    description: "Mineral exploration and industrial enterprise portal.",
  };

  const { approvals } = useApprovals(targetClient.id);
  const { projects } = useProjects(targetClient.id);
  const { services } = useServices(undefined, targetClient.id);
  const { invoices } = useInvoices(targetClient.id);
  const { events } = useCalendarEvents(targetClient.id);

  const pendingApprovals = approvals.filter((a) => a.status === "awaiting_review" || a.status === "pending");
  const paidTotal = invoices
    .filter((i) => i.status === "paid")
    .reduce((acc, i) => acc + Number(i.total || i.amount || 0), 0);
  const remainingTotal = invoices
    .filter((i) => i.status === "sent" || i.status === "partially_paid")
    .reduce((acc, i) => acc + (Number(i.total || i.amount || 0) - Number(i.amount_paid || 0)), 0);

  const isClientMember = role === "client_member";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header with Client Identity */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">Client Workspace</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground font-medium">{targetClient.industry}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">{targetClient.name}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">{targetClient.description}</p>
        </div>

        <div className="p-4 rounded-xl bg-secondary/60 border border-border/80 shrink-0 min-w-56 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-semibold">Overall Delivery</span>
            <span className="font-mono font-bold text-foreground text-sm">78%</span>
          </div>
          <ProgressBar value={78} showValue={false} />
        </div>
      </div>

      {/* Action Required Banner for Client Owner */}
      {pendingApprovals.length > 0 && !isClientMember && (
        <div className="p-5 rounded-xl bg-amber-50 border border-amber-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-bold shrink-0">
              <Sparkles className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-amber-950">Action Required: Deliverables Awaiting Sign-Off</h2>
              <p className="text-xs text-amber-800 mt-0.5">
                {pendingApprovals.length} item(s) are awaiting your formal approval or change request.
              </p>
            </div>
          </div>
          <Link
            to="/approvals"
            className="px-4 py-2 rounded-lg bg-amber-900 text-amber-50 hover:bg-amber-800 font-semibold text-xs transition-colors shrink-0 shadow-2xs text-center"
          >
            Review Deliverables ({pendingApprovals.length}) →
          </Link>
        </div>
      )}

      {/* Active Work Service Areas */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">Active Work Streams</h2>
            <p className="text-xs text-muted-foreground">Detailed records of deliverables and technical outputs.</p>
          </div>
          <Link to="/projects" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
            All Workspaces <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((srv) => (
            <Link
              key={srv.id}
              to="/projects"
              className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/70 border border-border/80 transition-all space-y-3 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="text-xs font-mono uppercase text-muted-foreground font-semibold">{srv.service_type}</span>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    {srv.name}
                  </h3>
                </div>
                <StatusBadge status={srv.status} />
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {srv.summary || srv.description}
              </p>

              <div className="space-y-1 pt-1">
                <ProgressBar value={srv.progress} label="Phase Progress" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Up Next & Financial Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Up Next */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">Up Next on Schedule</h2>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="space-y-3">
            {events.slice(0, 3).map((evt) => (
              <div key={evt.id} className="p-3.5 rounded-xl bg-secondary/40 border border-border/70 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-foreground">{evt.title}</p>
                  <p className="text-[11px] text-muted-foreground">{evt.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-primary block">
                    {formatDate(evt.start_time, "MMM d")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary (Hidden from client_member) */}
        {!isClientMember && (
          <div className="p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Payment Status</h2>
              <Link to="/payments" className="text-xs font-semibold text-primary hover:underline">
                View statement →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-1">
                <span className="text-[11px] font-semibold text-emerald-800 uppercase font-mono">Paid to Date</span>
                <p className="text-2xl font-bold font-mono text-emerald-950">
                  {formatCurrency(paidTotal, currency)}
                </p>
                <span className="text-[10px] text-emerald-700">Verified Milestone Deposits</span>
              </div>

              <div className="p-4 rounded-xl bg-secondary/60 border border-border space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase font-mono">Remaining Balance</span>
                <p className="text-2xl font-bold font-mono text-foreground">
                  {formatCurrency(remainingTotal, currency)}
                </p>
                <span className="text-[10px] text-muted-foreground">Due upon Milestone Delivery</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
