import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useProjects } from "@/hooks/useProjects";
import { useServices } from "@/hooks/useServices";
import { useTasks } from "@/hooks/useTasks";
import { useMilestones } from "@/hooks/useMilestones";
import { useDeliverables } from "@/hooks/useDeliverables";
import { useInvoices } from "@/hooks/useInvoices";
import { useServiceRequests } from "@/hooks/useServiceRequests";
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
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Zap,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ClientServicesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");

  const { currentClient, currency } = useAuth();
  const clientId = currentClient?.id;

  // Active Tab State: "ongoing" | "completed" | "requested"
  const [activeTab, setActiveTab] = useState<"ongoing" | "completed" | "requested">(
    (tabParam as any) || "ongoing"
  );

  // Sync tab with URL search param
  useEffect(() => {
    if (tabParam && ["ongoing", "completed", "requested"].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);

  const handleTabChange = (tab: "ongoing" | "completed" | "requested") => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Expanded project/service card IDs
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
  const { invoices, payments } = useInvoices(clientId);
  const { requests, isLoading: requestsLoading } = useServiceRequests(clientId);

  const formatMoney = (amount: number) => {
    return `${amount.toLocaleString()} ${currency || "ETB"}`;
  };

  // Partition services into Ongoing and Completed
  const ongoingServices = services.filter((s) => s.status !== "completed");
  const completedServices = services.filter((s) => s.status === "completed");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-28">
      {/* Header Bar */}
      <div className="border-b border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-widest uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">
                FURII CLIENT PORTAL
              </span>
              <span className="text-xs text-zinc-400 font-medium">
                {currentClient?.name || "Client Portal"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Services & Production Hub
            </h1>
          </div>

          {/* "+ Add Service" Action Button (Directs to Catalog) */}
          <button
            onClick={() => navigate("/portal/catalog")}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm rounded-xl transition shadow-lg shadow-amber-500/15 flex items-center justify-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            + Add Service
          </button>
        </div>

        {/* 3 Navigation Tabs (Requested | Ongoing | Completed - matching sketch) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto no-scrollbar gap-2 pt-1">
          {[
            {
              id: "ongoing",
              label: "Ongoing",
              count: ongoingServices.length,
              icon: TrendingUp,
              color: "text-amber-400",
            },
            {
              id: "completed",
              label: "Completed",
              count: completedServices.length,
              icon: CheckCircle2,
              color: "text-emerald-400",
            },
            {
              id: "requested",
              label: "Requested",
              count: requests.length,
              icon: Clock,
              color: "text-purple-400",
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as any)}
                className={`flex items-center gap-2.5 px-6 py-3.5 border-b-2 text-sm font-semibold transition-all ${
                  active
                    ? "border-amber-400 text-amber-300 bg-amber-500/5"
                    : "border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? tab.color : "text-zinc-500"}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                    active ? "bg-amber-400/20 text-amber-300" : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Views */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* ======================================================== */}
        {/* TAB 1: ONGOING (Interactive, Expandable, Animated)       */}
        {/* ======================================================== */}
        {activeTab === "ongoing" && (
          <div className="space-y-6">
            {ongoingServices.length === 0 ? (
              <div className="p-12 text-center bg-zinc-900/40 rounded-2xl border border-zinc-800/80 space-y-4">
                <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                  <Layers className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">No Ongoing Services</h3>
                  <p className="text-sm text-zinc-400 max-w-md mx-auto mt-1">
                    You currently have no active delivery streams in progress. Request a package from our catalog or check your requested tab!
                  </p>
                </div>
                <button
                  onClick={() => navigate("/portal/catalog")}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-lg transition inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Explore Catalog & Add Service
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {ongoingServices.map((service) => {
                  const isExpanded = !!expandedIds[service.id];
                  const project = projects.find((p) => p.id === service.project_id);

                  // Service Sub-tasks
                  const serviceTasks = tasks.filter(
                    (t) => t.service_id === service.id || t.project_id === service.project_id
                  );
                  const completedTasksCount = serviceTasks.filter((t) => t.status === "completed").length;

                  // Service Milestones
                  const serviceMilestones = milestones.filter(
                    (m) => m.service_id === service.id || m.project_id === service.project_id
                  );

                  // Service Deliverables & Approvals
                  const serviceDeliverables = deliverables.filter(
                    (d) => d.service_id === service.id || d.project_id === service.project_id
                  );
                  const awaitingApprovalCount = serviceDeliverables.filter(
                    (d) => d.status === "awaiting_review"
                  ).length;

                  // Financial calculations for this project/service
                  const projectInvoices = invoices.filter((i) => i.project_id === service.project_id);
                  const totalBilled = projectInvoices.reduce((acc, i) => acc + (i.total || 0), 0);
                  const totalPaid = projectInvoices.reduce((acc, i) => acc + (i.amount_paid || 0), 0);

                  const progressVal = service.progress || 0;

                  return (
                    <div
                      key={service.id}
                      className="bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700/80 rounded-2xl overflow-hidden transition-all shadow-xl"
                    >
                      {/* COLLAPSED HEADER CARD (Always Visible) */}
                      <div
                        onClick={() => toggleExpand(service.id)}
                        className="p-6 sm:p-7 cursor-pointer hover:bg-zinc-900/90 transition flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="px-2.5 py-0.5 text-xs font-mono uppercase font-bold bg-zinc-800 text-amber-400 rounded border border-zinc-700">
                              {service.service_type}
                            </span>
                            <span
                              className={`text-xs font-semibold px-2.5 py-0.5 rounded capitalize ${
                                service.status === "in_progress"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  : service.status === "waiting_for_client"
                                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                  : "bg-zinc-800 text-zinc-300"
                              }`}
                            >
                              {service.status.replace("_", " ")}
                            </span>

                            {awaitingApprovalCount > 0 && (
                              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 animate-pulse">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {awaitingApprovalCount} Deliverable(s) Awaiting Approval
                              </span>
                            )}
                          </div>

                          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                            {service.name}
                          </h3>

                          {service.current_phase && (
                            <div className="text-xs text-zinc-400 flex items-center gap-2">
                              <span className="font-semibold text-zinc-300">Phase:</span>
                              <span className="text-amber-300">{service.current_phase}</span>
                            </div>
                          )}
                        </div>

                        {/* Progress, Payment & Timeline Indicators */}
                        <div className="flex flex-wrap items-center gap-6 shrink-0 lg:border-l lg:border-zinc-800 lg:pl-6">
                          {/* Progress Meter */}
                          <div className="space-y-1.5 w-32 sm:w-40">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-zinc-400">Progress</span>
                              <span className="text-amber-400 font-mono">{progressVal}%</span>
                            </div>
                            <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-800">
                              <div
                                className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500"
                                style={{ width: `${progressVal}%` }}
                              />
                            </div>
                          </div>

                          {/* Payment Snapshot */}
                          <div className="space-y-1 text-left sm:text-right min-w-[120px]">
                            <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
                              Payment Status
                            </div>
                            <div className="text-sm font-bold font-mono text-zinc-200">
                              {formatMoney(totalPaid)}
                              {totalBilled > 0 && (
                                <span className="text-xs text-zinc-500 font-normal">
                                  {" "}
                                  / {formatMoney(totalBilled)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Expand/Collapse Toggle Button */}
                          <button
                            type="button"
                            className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl transition ml-auto lg:ml-0"
                            title={isExpanded ? "Collapse View" : "Expand Details"}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* EXPANDABLE DETAILS ACCORDION */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            className="border-t border-zinc-800/80 bg-zinc-950/50 p-6 sm:p-8 space-y-8"
                          >
                            {/* 1. Sub-tasks under this service with live status pills */}
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                                  <Briefcase className="w-4 h-4 text-amber-400" />
                                  Active Sub-tasks & Workstreams ({completedTasksCount}/{serviceTasks.length} Completed)
                                </h4>
                                <span className="text-xs text-zinc-500">Live Admin Updates</span>
                              </div>

                              {serviceTasks.length === 0 ? (
                                <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 text-xs text-zinc-400">
                                  No sub-tasks currently assigned to this delivery phase.
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {serviceTasks.map((task) => {
                                    const isDone = task.status === "completed";
                                    const isInProgress = task.status === "in_progress";
                                    return (
                                      <div
                                        key={task.id}
                                        className="bg-zinc-900/70 p-4 rounded-xl border border-zinc-800 flex items-center justify-between gap-3"
                                      >
                                        <div className="space-y-1">
                                          <div className="text-sm font-semibold text-white flex items-center gap-2">
                                            {isDone ? (
                                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                            ) : (
                                              <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                                            )}
                                            <span className={isDone ? "line-through text-zinc-400" : "text-zinc-200"}>
                                              {task.title}
                                            </span>
                                          </div>
                                          {task.due_date && (
                                            <div className="text-[11px] text-zinc-500 flex items-center gap-1">
                                              <Calendar className="w-3 h-3" />
                                              Target: {task.due_date}
                                            </div>
                                          )}
                                        </div>

                                        {/* Status Pill (Pending, In Progress, Completed) */}
                                        <span
                                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider shrink-0 ${
                                            isDone
                                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                              : isInProgress
                                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                              : "bg-zinc-800 text-zinc-400"
                                          }`}
                                        >
                                          {task.status.replace("_", " ")}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* 2. Milestones Checkpoints */}
                            {serviceMilestones.length > 0 && (
                              <div className="space-y-4 pt-4 border-t border-zinc-800/80">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                                  Milestone Progression
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  {serviceMilestones.map((m, idx) => (
                                    <div
                                      key={m.id}
                                      className={`p-4 rounded-xl border space-y-2 ${
                                        m.status === "completed"
                                          ? "bg-emerald-500/5 border-emerald-500/30"
                                          : m.status === "in_progress"
                                          ? "bg-amber-500/5 border-amber-500/30"
                                          : "bg-zinc-900/50 border-zinc-800"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="font-mono text-zinc-400">Phase 0{idx + 1}</span>
                                        <span
                                          className={`font-semibold capitalize ${
                                            m.status === "completed"
                                              ? "text-emerald-400"
                                              : m.status === "in_progress"
                                              ? "text-amber-400"
                                              : "text-zinc-500"
                                          }`}
                                        >
                                          {m.status.replace("_", " ")}
                                        </span>
                                      </div>
                                      <div className="font-semibold text-sm text-white">{m.title}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 3. Deliverables & Approval Sign-offs */}
                            {serviceDeliverables.length > 0 && (
                              <div className="space-y-4 pt-4 border-t border-zinc-800/80">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                                  <FileCheck2 className="w-4 h-4 text-purple-400" />
                                  Output Deliverables & Approvals
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {serviceDeliverables.map((deliv) => (
                                    <div
                                      key={deliv.id}
                                      className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 flex items-center justify-between gap-3"
                                    >
                                      <div className="space-y-1">
                                        <div className="font-semibold text-sm text-white">{deliv.title}</div>
                                        <div className="text-xs text-zinc-400 flex items-center gap-2">
                                          <span>v{deliv.current_version || 1}</span>
                                          <span>•</span>
                                          <span className="capitalize">{deliv.status.replace("_", " ")}</span>
                                        </div>
                                      </div>

                                      {deliv.status === "awaiting_review" ? (
                                        <button
                                          onClick={() => navigate("/portal/approvals")}
                                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-lg transition flex items-center gap-1.5"
                                        >
                                          Review & Sign Off
                                          <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                      ) : (
                                        <span className="text-xs text-emerald-400 font-semibold px-2 py-1 bg-emerald-500/10 rounded border border-emerald-500/20">
                                          Approved
                                        </span>
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
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: COMPLETED (Trophy Case / Archive)                 */}
        {/* ======================================================== */}
        {activeTab === "completed" && (
          <div className="space-y-6">
            {completedServices.length === 0 ? (
              <div className="p-12 text-center bg-zinc-900/40 rounded-2xl border border-zinc-800/80 space-y-4">
                <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">No Completed Services Yet</h3>
                  <p className="text-sm text-zinc-400 max-w-md mx-auto mt-1">
                    Delivered milestones and finished projects will be immortalized here with permanent asset access and project retrospectives.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {completedServices.map((service) => {
                  const serviceTasks = tasks.filter(
                    (t) => t.service_id === service.id || t.project_id === service.project_id
                  );
                  const serviceDeliverables = deliverables.filter(
                    (d) => d.service_id === service.id || d.project_id === service.project_id
                  );

                  return (
                    <div
                      key={service.id}
                      className="bg-zinc-900/70 border border-emerald-500/20 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 text-xs font-mono uppercase font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                              Completed Service Stream
                            </span>
                            <span className="text-xs font-semibold text-zinc-400 uppercase">
                              {service.service_type}
                            </span>
                          </div>
                          <h3 className="text-2xl font-bold text-white">{service.name}</h3>
                          {service.description && (
                            <p className="text-sm text-zinc-400">{service.description}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <div className="text-xs text-zinc-500 font-medium">Delivery Status</div>
                            <div className="text-lg font-bold text-emerald-400 font-mono">
                              100% Finalized
                            </div>
                          </div>
                          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                        </div>
                      </div>

                      {/* Completed Metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-center">
                          <div className="text-xs text-zinc-500">Tasks Executed</div>
                          <div className="text-xl font-bold text-white font-mono mt-1">
                            {serviceTasks.length}
                          </div>
                        </div>
                        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-center">
                          <div className="text-xs text-zinc-500">Deliverables Handed Over</div>
                          <div className="text-xl font-bold text-white font-mono mt-1">
                            {serviceDeliverables.length}
                          </div>
                        </div>
                        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-center">
                          <div className="text-xs text-zinc-500">Milestones Reached</div>
                          <div className="text-xl font-bold text-emerald-400 font-mono mt-1">All Complete</div>
                        </div>
                        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-center">
                          <div className="text-xs text-zinc-500">Asset Vault Access</div>
                          <div className="text-xl font-bold text-purple-400 font-mono mt-1">Permanent</div>
                        </div>
                      </div>

                      {/* Deliverables Download Links */}
                      {serviceDeliverables.length > 0 && (
                        <div className="space-y-3 pt-2">
                          <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-400">
                            Delivered Assets & Documentation
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {serviceDeliverables.map((deliv) => (
                              <div
                                key={deliv.id}
                                className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 flex items-center justify-between gap-3 text-xs"
                              >
                                <div className="font-semibold text-white truncate">{deliv.title}</div>
                                <button
                                  onClick={() => navigate("/portal/files")}
                                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg flex items-center gap-1 shrink-0"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  Download Asset
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: REQUESTED (With "Pay to Get Started" Button)      */}
        {/* ======================================================== */}
        {activeTab === "requested" && (
          <div className="space-y-6">
            <div className="bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded">
                  Client Service Requests
                </span>
                <h3 className="text-xl font-bold text-white mt-1">Pending & Quoted Requirements</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Track requirements you've submitted, attach receipts, or initiate formal kickoffs.
                </p>
              </div>

              <button
                onClick={() => navigate("/portal/catalog")}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                Submit New Request
              </button>
            </div>

            {requestsLoading ? (
              <div className="text-center py-12 text-zinc-500 text-sm">Loading requests...</div>
            ) : requests.length === 0 ? (
              <div className="p-12 text-center bg-zinc-900/40 rounded-2xl border border-zinc-800/80 space-y-4">
                <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                  <Clock className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">No Submitted Requests</h3>
                  <p className="text-sm text-zinc-400 max-w-md mx-auto mt-1">
                    When you request new curated packages or bespoke development features, they will appear here for tracking and payment clearance.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/portal/catalog")}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-lg transition inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Browse Catalog
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((req) => {
                  const isUnderPaymentReview = req.status === "payment_review";
                  const isApproved = req.status === "approved";
                  const isPending = req.status === "pending";

                  return (
                    <div
                      key={req.id}
                      className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 sm:p-7 space-y-4 shadow-xl"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-semibold border border-zinc-700">
                              {req.request_type}
                            </span>

                            {/* Status Badge */}
                            <span
                              className={`text-xs font-semibold px-2.5 py-0.5 rounded uppercase tracking-wider ${
                                isUnderPaymentReview
                                  ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                  : isApproved
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              }`}
                            >
                              {isUnderPaymentReview
                                ? "Under Payment Review"
                                : isApproved
                                ? "Approved — Launching"
                                : "Pending Review"}
                            </span>

                            <span className="text-[11px] text-zinc-500">
                              Submitted: {new Date(req.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          <h4 className="text-xl font-bold text-white">{req.title}</h4>

                          {req.description && (
                            <p className="text-xs text-zinc-400">{req.description}</p>
                          )}

                          {req.manager_notes && (
                            <div className="text-xs text-amber-300 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                              <span className="font-semibold">Furii Ops Note: </span>
                              {req.manager_notes}
                            </div>
                          )}
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex flex-col sm:items-end justify-between gap-3 shrink-0">
                          <div className="text-left sm:text-right">
                            <div className="text-[11px] text-zinc-500 uppercase">Estimated Total</div>
                            <div className="text-2xl font-bold font-mono text-amber-400">
                              {formatMoney(req.estimated_total)}
                            </div>
                          </div>

                          {/* "Pay to Get Started" Button (from your sketch!) */}
                          {(isPending || isApproved) && !isUnderPaymentReview && (
                            <button
                              onClick={() => navigate(`/portal/payment?requestId=${req.id}`)}
                              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl transition shadow-lg shadow-amber-500/15 flex items-center justify-center gap-2"
                            >
                              <Receipt className="w-4 h-4" />
                              Pay to Get Project Started
                            </button>
                          )}

                          {isUnderPaymentReview && (
                            <div className="flex items-center gap-2 text-xs text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Receipt Attached — Awaiting Admin Sign-off</span>
                            </div>
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
      </div>
    </div>
  );
}
export default ClientServicesPage;
