import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useProjects } from "@/hooks/useProjects";
import { useServices } from "@/hooks/useServices";
import { useTasks } from "@/hooks/useTasks";
import { useMilestones } from "@/hooks/useMilestones";
import { useDeliverables } from "@/hooks/useDeliverables";
import { useInvoices } from "@/hooks/useInvoices";
import { useServiceRequests } from "@/hooks/useServiceRequests";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { CircularProgress } from "@/components/shared/CircularProgress";
import { useFinancialSummary } from "@/hooks/useFinancialSummary";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Layers,
  CheckCircle2,
  Clock,
  Plus,
  ChevronDown,
  ChevronUp,
  Receipt,
  Download,
  AlertCircle,
  FileCheck2,
  Calendar,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Loader2,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Service } from "@/types";
import { ServiceProgressDetailModal } from "@/components/portal/ServiceProgressDetailModal";
import { isActiveSocialService } from "@/lib/socialAnalytics";

export function ClientServicesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");

  const { currentClient, currency, role } = useAuth();
  const clientId = currentClient?.id;

  // Detail Progress Modal State
  const [detailModalService, setDetailModalService] = useState<Service | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Active Tab: "ongoing" | "completed" | "requested"
  const [activeTab, setActiveTab] = useState<"ongoing" | "completed" | "requested">(
    (tabParam as any) || "ongoing"
  );

  // Ongoing Sub-Hubs: "all" | "retainers" | "one_time"
  const subParam = searchParams.get("sub");
  const [ongoingSubHub, setOngoingSubHub] = useState<"all" | "retainers" | "one_time">(
    subParam === "retainers" || subParam === "one_time" ? subParam : "all"
  );

  const handleSubHubChange = (sub: "all" | "retainers" | "one_time") => {
    setOngoingSubHub(sub);
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set("sub", sub);
      return p;
    });
  };

  useEffect(() => {
    if (tabParam && ["ongoing", "completed", "requested"].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);

  const handleTabChange = (tab: "ongoing" | "completed" | "requested") => {
    setActiveTab(tab);
    setSearchParams({ tab, sub: ongoingSubHub });
  };

  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Queries
  const { projects, isLoading: projectsLoading } = useProjects(clientId);
  const { services, isLoading: servicesLoading } = useServices(undefined, clientId);
  const { tasks } = useTasks();
  const { milestones } = useMilestones();
  const { deliverables } = useDeliverables();
  const { invoices } = useInvoices(clientId);
  const { requests, isLoading: requestsLoading } = useServiceRequests(clientId);
  const { getServiceFinancials } = useFinancialSummary(clientId);

  const ongoingServices = services.filter((s) => s.status !== "completed");
  const completedServices = services.filter((s) => s.status === "completed");

  const retainerServices = ongoingServices.filter(
    (s) => s.billing_type === "monthly_retainer" || s.name.toLowerCase().includes("retainer")
  );
  const oneTimeServices = ongoingServices.filter(
    (s) => s.billing_type !== "monthly_retainer" && !s.name.toLowerCase().includes("retainer")
  );

  const displayedOngoingServices =
    ongoingSubHub === "retainers"
      ? retainerServices
      : ongoingSubHub === "one_time"
      ? oneTimeServices
      : ongoingServices;

  const isLoading = projectsLoading || servicesLoading || requestsLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Standard Header matching the rest of the app */}
      <PageHeader
        title="Services & Production Hub"
        description="Monitor active delivery streams, track work breakdown progress, and commission new services."
        actions={
          <button
            onClick={() => navigate("/portal/catalog")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Service
          </button>
        }
      />

      {/* Segmented Tab Navigation matching app design */}
      <div className="flex items-center gap-1.5 p-1 bg-secondary/50 rounded-xl border border-border/80 w-fit">
        <button
          onClick={() => handleTabChange("ongoing")}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === "ongoing"
              ? "bg-card text-foreground shadow-2xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Ongoing</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground font-mono">
            {ongoingServices.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("completed")}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === "completed"
              ? "bg-card text-foreground shadow-2xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Completed</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground font-mono">
            {completedServices.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("requested")}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === "requested"
              ? "bg-card text-foreground shadow-2xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Requested</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
              requests.length > 0
                ? "bg-primary/15 text-primary"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {requests.length}
          </span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 flex justify-center items-center text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <>
          {/* ======================================================== */}
          {/* TAB 1: ONGOING                                            */}
          {/* ======================================================== */}
          {activeTab === "ongoing" && (
            <div className="space-y-4">
              {/* Sub-Hubs Navigation for Ongoing Streams */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border shadow-2xs">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span>Ongoing Delivery Streams</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Segregated by commercial structure: recurring monthly retainers and fixed one-time offers.
                  </p>
                </div>

                <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-xl border border-border/80 shrink-0">
                  <button
                    onClick={() => handleSubHubChange("all")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      ongoingSubHub === "all"
                        ? "bg-card text-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>All Ongoing</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-secondary text-muted-foreground">
                      {ongoingServices.length}
                    </span>
                  </button>

                  <button
                    onClick={() => handleSubHubChange("retainers")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      ongoingSubHub === "retainers"
                        ? "bg-purple-500/15 text-purple-700 dark:text-purple-300 font-bold border border-purple-500/30 shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>Monthly Retainers</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold">
                      {retainerServices.length}
                    </span>
                  </button>

                  <button
                    onClick={() => handleSubHubChange("one_time")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      ongoingSubHub === "one_time"
                        ? "bg-blue-500/15 text-blue-700 dark:text-blue-300 font-bold border border-blue-500/30 shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>One-Time Deals</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold">
                      {oneTimeServices.length}
                    </span>
                  </button>
                </div>
              </div>

              {displayedOngoingServices.length === 0 ? (
                <div className="p-12 text-center bg-card rounded-2xl border border-dashed border-border shadow-2xs space-y-3">
                  {ongoingSubHub === "retainers" ? (
                    <Calendar className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto opacity-70" />
                  ) : ongoingSubHub === "one_time" ? (
                    <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto opacity-70" />
                  ) : (
                    <Layers className="w-8 h-8 text-muted-foreground mx-auto" />
                  )}
                  <h3 className="text-sm font-bold text-foreground">
                    {ongoingSubHub === "retainers"
                      ? "No Active Monthly Retainers"
                      : ongoingSubHub === "one_time"
                      ? "No Active One-Time Deals"
                      : "No Ongoing Services"}
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    {ongoingSubHub === "retainers"
                      ? "There are currently no active monthly retainer subscriptions for this client account."
                      : ongoingSubHub === "one_time"
                      ? "There are currently no active fixed-duration or one-time project engagements for this client account."
                      : "You currently have no active delivery streams in progress. Select a package from the catalog to get started."}
                  </p>
                  {ongoingSubHub === "all" && (
                    <button
                      onClick={() => navigate("/portal/catalog")}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Explore Catalog
                    </button>
                  )}
                </div>
              ) : (
                displayedOngoingServices.map((service) => {
                  const isExpanded = !!expandedIds[service.id];
                  const serviceTasks = tasks.filter(
                    (t) => t.service_id === service.id || t.project_id === service.project_id
                  );
                  const completedTasksCount = serviceTasks.filter((t) => t.status === "completed").length;

                  const serviceMilestones = milestones.filter(
                    (m) => m.service_id === service.id || m.project_id === service.project_id
                  );

                  const serviceDeliverables = deliverables.filter(
                    (d) => d.service_id === service.id || d.project_id === service.project_id
                  );
                  const awaitingApprovalCount = serviceDeliverables.filter(
                    (d) => d.status === "awaiting_review"
                  ).length;

                  const { totalBilled, totalPaid } = getServiceFinancials(service);

                  const progressVal =
                    serviceTasks.length > 0
                      ? Math.round((completedTasksCount / serviceTasks.length) * 100)
                      : service.progress || 0;

                  return (
                    <div
                      key={service.id}
                      className="rounded-2xl bg-card border border-border hover:border-primary/40 transition-all shadow-2xs overflow-hidden"
                    >
                      {/* Collapsed Header */}
                      <div
                        onClick={() => toggleExpand(service.id)}
                        className="p-5 sm:p-6 cursor-pointer hover:bg-secondary/20 transition-colors flex flex-col xl:flex-row xl:items-center justify-between gap-4 xl:gap-6"
                      >
                        {/* Title & Category Info */}
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
                              {service.service_type}
                            </span>
                            <StatusBadge status={service.status} />

                            {/* Monthly Retainer Classification & Renewal Alert */}
                            {service.billing_type === "monthly_retainer" && (
                              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold flex items-center gap-1">
                                <Calendar className="w-2.5 h-2.5" />
                                Monthly Retainer
                              </span>
                            )}

                            {service.billing_type === "monthly_retainer" && service.next_billing_date && new Date(service.next_billing_date) <= new Date() && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate("/portal/payment");
                                }}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                              >
                                <Receipt className="w-2.5 h-2.5" />
                                <span>Monthly Renewal Due — Attach Receipt →</span>
                              </button>
                            )}

                            {awaitingApprovalCount > 0 && (
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {awaitingApprovalCount} Awaiting Sign-off
                              </span>
                            )}
                          </div>

                          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-foreground leading-snug break-words">
                            {service.name}
                          </h3>

                          {service.current_phase && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                              <span>Phase:</span>
                              <span className="text-foreground font-semibold px-2 py-0.5 rounded-md bg-secondary border border-border/60">
                                {service.current_phase}
                              </span>
                            </p>
                          )}
                        </div>

                        {/* Circular Progress, Payment, Details Action & Toggle */}
                        <div className="flex flex-wrap items-center justify-between xl:justify-end gap-3 sm:gap-5 pt-3 xl:pt-0 border-t xl:border-t-0 border-border/80 w-full xl:w-auto">
                          <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
                            {/* Circular Progress Gauge */}
                            <div className="shrink-0">
                              <CircularProgress
                                value={progressVal}
                                size={46}
                                strokeWidth={4}
                                label="Progress"
                                sublabel={
                                  serviceTasks.length > 0
                                    ? `${completedTasksCount}/${serviceTasks.length} Tasks`
                                    : progressVal === 100
                                    ? "Completed"
                                    : "0 Tasks"
                                }
                              />
                            </div>

                            {/* Payment status */}
                            <div className="text-left sm:text-right min-w-[75px] shrink-0">
                              <span className="text-[10px] uppercase font-mono text-muted-foreground font-semibold block">
                                Paid to Date
                              </span>
                              <span className="text-xs sm:text-sm font-bold font-mono text-foreground block">
                                {formatCurrency(totalPaid, currency)}
                              </span>
                              {totalBilled > 0 && (
                                <span className="text-[10px] text-muted-foreground block font-mono">
                                  of {formatCurrency(totalBilled, currency)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 shrink-0">
                            {isActiveSocialService(service.service_type, service.status) && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/portal/services/${service.id}/social`);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 transition-all cursor-pointer shrink-0"
                              >
                                <TrendingUp className="w-3.5 h-3.5" />
                                <span>Social analytics</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDetailModalService(service);
                                setSelectedTaskId(null);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground border border-border shadow-2xs hover:border-primary/40 transition-all cursor-pointer shrink-0"
                            >
                              <Eye className="w-3.5 h-3.5 text-primary" />
                              <span>See Details</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(service.id);
                              }}
                              className="p-1.5 sm:p-2 rounded-xl border border-border bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer shrink-0"
                              aria-label="Toggle details"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expandable Body */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-border/80 bg-secondary/10 p-5 sm:p-6 space-y-6"
                          >
                            {/* Sub-tasks */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                  Sub-Tasks ({serviceTasks.length > 0 ? `${completedTasksCount}/${serviceTasks.length} Completed` : "0 Assigned"})
                                </h4>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDetailModalService(service);
                                    setSelectedTaskId(null);
                                  }}
                                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <span>See Full Progress Breakdown</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>

                              {serviceTasks.length === 0 ? (
                                <div className="p-3.5 rounded-xl bg-card border border-dashed border-border/80 text-xs text-muted-foreground italic text-center">
                                  No tasks assigned yet. Operations will publish checklist items as work proceeds.
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                  {serviceTasks.map((task) => {
                                    const isDone = task.status === "completed";
                                    return (
                                      <div
                                        key={task.id}
                                        onClick={() => {
                                          setDetailModalService(service);
                                          setSelectedTaskId(task.id);
                                        }}
                                        className="p-3 rounded-xl bg-card border border-border hover:border-primary/50 transition-all flex items-center justify-between gap-3 text-xs shadow-2xs cursor-pointer group"
                                      >
                                        <div className="space-y-0.5 min-w-0 flex-1">
                                          <div className={`font-semibold truncate group-hover:text-primary transition-colors ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                            {task.title}
                                          </div>
                                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                                            {task.due_date && (
                                              <span className="flex items-center gap-1">
                                                <Calendar className="w-2.5 h-2.5" />
                                                Target: {formatDate(task.due_date)}
                                              </span>
                                            )}
                                            {task.priority && (
                                              <span className="uppercase text-[9px] font-bold px-1.5 py-0.2 rounded bg-secondary">
                                                {task.priority}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                          <StatusBadge status={task.status} />
                                          <span className="text-[11px] font-semibold text-primary group-hover:translate-x-0.5 transition-transform flex items-center">
                                            Details →
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Milestones */}
                            {serviceMilestones.length > 0 && (
                              <div className="space-y-3 pt-3 border-t border-border/60">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                  Milestone Progression
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                  {serviceMilestones.map((m, idx) => (
                                    <div
                                      key={m.id}
                                      className="p-3.5 rounded-xl bg-card border border-border shadow-2xs space-y-1.5"
                                    >
                                      <div className="flex items-center justify-between text-[10px]">
                                        <span className="font-mono text-muted-foreground">Phase 0{idx + 1}</span>
                                        <StatusBadge status={m.status} />
                                      </div>
                                      <div className="text-xs font-bold text-foreground truncate">{m.title}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Deliverables */}
                            {serviceDeliverables.length > 0 && (
                              <div className="space-y-3 pt-3 border-t border-border/60">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                  Deliverables & Review
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                  {serviceDeliverables.map((deliv) => (
                                    <div
                                      key={deliv.id}
                                      className="p-3.5 rounded-xl bg-card border border-border shadow-2xs flex items-center justify-between gap-3"
                                    >
                                      <div className="space-y-0.5 min-w-0">
                                        <div className="text-xs font-bold text-foreground truncate">{deliv.title}</div>
                                        <span className="text-[10px] text-muted-foreground font-mono">
                                          v{deliv.current_version || 1} • {deliv.status.replace("_", " ")}
                                        </span>
                                      </div>
                                      {deliv.status === "awaiting_review" ? (
                                        <button
                                          onClick={() => navigate("/portal/approvals")}
                                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer shrink-0"
                                        >
                                          Sign Off
                                          <ArrowRight className="w-3 h-3" />
                                        </button>
                                      ) : (
                                        <StatusBadge status={deliv.status} />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: COMPLETED                                          */}
          {/* ======================================================== */}
          {activeTab === "completed" && (
            <div className="space-y-4">
              {completedServices.length === 0 ? (
                <div className="p-12 text-center bg-card rounded-2xl border border-border shadow-2xs space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-muted-foreground mx-auto" />
                  <h3 className="text-sm font-bold text-foreground">No Completed Services Yet</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Finished projects and finalized milestones will be permanently archived here for asset downloads and historical auditing.
                  </p>
                </div>
              ) : (
                completedServices.map((service) => {
                  const serviceTasks = tasks.filter(
                    (t) => t.service_id === service.id || t.project_id === service.project_id
                  );
                  const serviceDeliverables = deliverables.filter(
                    (d) => d.service_id === service.id || d.project_id === service.project_id
                  );

                  return (
                    <div
                      key={service.id}
                      className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                              Completed Stream
                            </span>
                            <span className="text-xs text-muted-foreground font-mono uppercase">
                              {service.service_type}
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-foreground">{service.name}</h3>
                          {service.description && (
                            <p className="text-xs text-muted-foreground leading-relaxed">{service.description}</p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 shrink-0">
                          <CircularProgress
                            value={100}
                            size={44}
                            strokeWidth={4}
                            variant="emerald"
                            label="Milestones"
                            sublabel="100% Done"
                            className="hidden sm:inline-flex"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setDetailModalService(service);
                              setSelectedTaskId(null);
                            }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground border border-border shadow-2xs hover:border-primary/40 transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-primary" />
                            <span>See More Details</span>
                          </button>
                          <StatusBadge status="completed" />
                        </div>
                      </div>

                      {/* Summary Metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 rounded-xl bg-secondary/40 border border-border text-center space-y-0.5">
                          <span className="text-[10px] font-mono uppercase text-muted-foreground">Tasks</span>
                          <p className="text-sm font-bold font-mono text-foreground">{serviceTasks.length} Completed</p>
                        </div>
                        <div className="p-3 rounded-xl bg-secondary/40 border border-border text-center space-y-0.5">
                          <span className="text-[10px] font-mono uppercase text-muted-foreground">Deliverables</span>
                          <p className="text-sm font-bold font-mono text-foreground">{serviceDeliverables.length} Delivered</p>
                        </div>
                        <div className="p-3 rounded-xl bg-secondary/40 border border-border text-center space-y-0.5">
                          <span className="text-[10px] font-mono uppercase text-muted-foreground">Milestones</span>
                          <p className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">100% Complete</p>
                        </div>
                        <div className="p-3 rounded-xl bg-secondary/40 border border-border text-center space-y-0.5">
                          <span className="text-[10px] font-mono uppercase text-muted-foreground">Asset Vault</span>
                          <p className="text-sm font-bold font-mono text-foreground">Archived</p>
                        </div>
                      </div>

                      {/* Deliverables quick download */}
                      {serviceDeliverables.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold">
                            Delivered Files & Documentation
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {serviceDeliverables.map((deliv) => (
                              <div
                                key={deliv.id}
                                className="p-2.5 rounded-xl bg-secondary/30 border border-border/80 flex items-center justify-between gap-3 text-xs"
                              >
                                <span className="font-semibold text-foreground truncate">{deliv.title}</span>
                                <button
                                  onClick={() => navigate("/portal/files")}
                                  className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors cursor-pointer shrink-0"
                                >
                                  <Download className="w-3 h-3" />
                                  Vault
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: REQUESTED (Matching the exact design system)       */}
          {/* ======================================================== */}
          {activeTab === "requested" && (
            <div className="space-y-4">
              {/* Clean Banner Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">
                      Service Requests
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground">
                    Pending & Quoted Requirements
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Track requirements you've submitted, attach payment receipts, or initiate formal project kickoffs.
                  </p>
                </div>

                <button
                  onClick={() => navigate("/portal/catalog")}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Submit New Request
                </button>
              </div>

              {requests.length === 0 ? (
                <div className="p-12 text-center bg-card rounded-2xl border border-border shadow-2xs space-y-2">
                  <Clock className="w-8 h-8 text-muted-foreground mx-auto" />
                  <h3 className="text-sm font-bold text-foreground">No Submitted Requests</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    When you request new curated packages or bespoke development features, they will appear here for tracking and payment clearance.
                  </p>
                  <button
                    onClick={() => navigate("/portal/catalog")}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer mt-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Browse Catalog
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.map((req) => {
                    const isPaymentReview = req.status === "payment_review";
                    const isApproved = req.status === "approved";
                    const isPending = req.status === "pending";

                    return (
                      <div
                        key={req.id}
                        className="p-5 sm:p-6 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all shadow-2xs space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-secondary text-muted-foreground font-semibold border border-border/80">
                                {req.request_type}
                              </span>

                              {/* Status Badge */}
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                                  isPaymentReview
                                    ? "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
                                    : isApproved
                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                                    : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                                }`}
                              >
                                {isPaymentReview
                                  ? "Payment Review"
                                  : isApproved
                                  ? "Approved — Launching"
                                  : "Pending Review"}
                              </span>

                              <span className="text-[11px] text-muted-foreground font-mono">
                                Submitted {formatDate(req.created_at)}
                              </span>
                            </div>

                            <h4 className="text-base sm:text-lg font-bold text-foreground">
                              {req.title}
                            </h4>

                            {req.description && (
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {req.description}
                              </p>
                            )}

                            {req.manager_notes && (
                              <div className="text-xs text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800">
                                <span className="font-semibold">Furii Ops Note: </span>
                                {req.manager_notes}
                              </div>
                            )}
                          </div>

                          {/* Right: Estimated Total & Pay Button */}
                          <div className="flex flex-col sm:items-end justify-between gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/80">
                            <div className="text-left sm:text-right">
                              <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                                Estimated Total
                              </span>
                              <span className="text-base sm:text-lg font-bold font-mono text-foreground">
                                {formatCurrency(req.estimated_total, currency)}
                              </span>
                            </div>

                            {/* Action / Status Pill */}
                            {isPending && !req.receipt_url && (
                              <button
                                onClick={() => navigate(`/portal/payment?requestId=${req.id}`)}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                                Pay to Get Project Started
                              </button>
                            )}

                            {(isPaymentReview || (isPending && !!req.receipt_url)) && (
                              <div className="flex items-center gap-1.5 text-xs text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800 font-medium">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Receipt Attached — Under Review</span>
                              </div>
                            )}

                            {isApproved && (
                              <button
                                onClick={() => handleTabChange("ongoing")}
                                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Active Stream — View in Ongoing</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Comprehensive Service & Sub-Tasks Progress Detail Modal */}
      <ServiceProgressDetailModal
        service={detailModalService}
        isOpen={!!detailModalService}
        onClose={() => {
          setDetailModalService(null);
          setSelectedTaskId(null);
        }}
        initialTaskId={selectedTaskId}
        currency={currency}
        isManager={role === "owner" || role === "operations_manager" || role === "lead_creative" || role === "creative"}
      />
    </motion.div>
  );
}
export default ClientServicesPage;
