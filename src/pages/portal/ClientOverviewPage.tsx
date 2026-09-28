import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useApprovals } from "@/hooks/useApprovals";
import { useProjects } from "@/hooks/useProjects";
import { useServices } from "@/hooks/useServices";
import { useInvoices } from "@/hooks/useInvoices";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { CircularProgress } from "@/components/shared/CircularProgress";
import { useFinancialSummary } from "@/hooks/useFinancialSummary";
import { ProductionCalendarView } from "@/components/calendar/ProductionCalendarView";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Sparkles,
  ArrowRight,
  Calendar,
  Building2,
  CheckCircle2,
  FileCheck2,
} from "lucide-react";
import { motion } from "framer-motion";

export function ClientOverviewPage() {
  const { currentClient, currency, role } = useAuth();

  const clientId = currentClient?.id;
  const { approvals } = useApprovals(clientId);
  const { projects } = useProjects(clientId);
  const { services } = useServices(undefined, clientId);
  const { invoices } = useInvoices(clientId);
  const { events } = useCalendarEvents(clientId);

  const isClientOwner = role === "client" || role === "client_owner";


  const pendingApprovals = approvals.filter(
    (a) => a.status === "awaiting_review" || a.status === "pending"
  );

  const {
    totalPaid: paidTotal,
    totalOutstanding: remainingTotal,
    overallDeliveryPct,
  } = useFinancialSummary(clientId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 sm:space-y-8"
    >
      {/* Header with Client Identity */}
      <div className="p-5 sm:p-7 rounded-2xl bg-card border border-border shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold bg-primary/10 px-2 py-0.5 rounded">
              Client Portal
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground font-medium">
              {currentClient?.industry || "Enterprise Partner"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight truncate">
            {currentClient?.name || "Corporate Workspace"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            {currentClient?.description ||
              "Your dedicated operations center for deliverables, formal sign-offs, and service progress."}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-secondary/50 border border-border/80 shrink-0 sm:min-w-64 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-semibold">Overall Delivery</span>
            <span className="font-mono font-bold text-foreground text-sm">{overallDeliveryPct}%</span>
          </div>
          <ProgressBar value={overallDeliveryPct} showValue={false} />
        </div>
      </div>

      {/* Action Required Banner for Client Owner */}
      {pendingApprovals.length > 0 && isClientOwner && (
        <div className="p-4 sm:p-5 rounded-xl bg-amber-50 border border-amber-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-bold shrink-0">
              <Sparkles className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-amber-950">
                Action Required: Deliverables Awaiting Sign-Off
              </h2>
              <p className="text-xs text-amber-800 mt-0.5">
                {pendingApprovals.length} deliverable(s) are awaiting your executive sign-off or requested modifications.
              </p>
            </div>
          </div>
          <Link
            to="/portal/approvals"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-900 text-amber-50 hover:bg-amber-800 font-semibold text-xs transition-colors shadow-2xs text-center shrink-0"
          >
            Review Deliverables ({pendingApprovals.length}) →
          </Link>
        </div>
      )}

      {/* Active Service Streams */}
      <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">Active Service Streams</h2>
            <p className="text-xs text-muted-foreground">
              Production progress and technical outputs across your retained services.
            </p>
          </div>
          <Link
            to="/portal/services"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            All Services <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((srv) => (
            <Link
              key={srv.id}
              to="/portal/services"
              className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/70 border border-border/80 transition-all space-y-3 group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground font-semibold">
                    {srv.service_type}
                  </span>
                  <StatusBadge status={srv.status} />
                </div>
                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {srv.name}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {srv.summary || srv.description}
                </p>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-3 min-w-0">
                <CircularProgress
                  value={srv.progress}
                  size={38}
                  strokeWidth={3.5}
                  label="Phase Progress"
                  sublabel={srv.current_phase || (srv.progress === 100 ? "Completed" : "Active")}
                  className="min-w-0 flex-1"
                />
                <span className="text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 shrink-0">
                  Track →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Statement & Billing Summary (Client Owner) */}
      {isClientOwner && (
        <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Statement & Billing</h2>
              <p className="text-xs text-muted-foreground">
                Consolidated financials across approved service contracts and active milestones.
              </p>
            </div>
            <Link
              to="/portal/financials"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Full statement →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800 space-y-1">
              <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-400 uppercase font-mono">
                Paid to Date
              </span>
              <p className="text-2xl font-bold font-mono text-emerald-950 dark:text-emerald-300">
                {formatCurrency(paidTotal, currency)}
              </p>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400">Verified Milestone Deposits</span>
            </div>

            <div className="p-4 rounded-xl bg-secondary/60 border border-border space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase font-mono">
                Remaining Balance
              </span>
              <p className="text-2xl font-bold font-mono text-foreground">
                {formatCurrency(remainingTotal, currency)}
              </p>
              <span className="text-[10px] text-muted-foreground">Due at Final Delivery</span>
            </div>
          </div>
        </div>
      )}

      {/* Production Timeline & Shoots (Detailed Monthly Calendar & Comment Box) */}
      <ProductionCalendarView
        clientId={clientId}
        title="Production Timeline & Shoots"
        subtitle="Detailed monthly production calendar with call sheets, shoot logistics, and dedicated client feedback."
      />
    </motion.div>
  );
}
