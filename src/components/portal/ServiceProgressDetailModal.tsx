import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  DollarSign,
  FileCheck2,
  Download,
  ExternalLink,
  ShieldCheck,
  CheckSquare,
  Sparkles,
  TrendingUp,
  FolderOpen,
  FileText,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Search,
  Activity,
  Award,
  Circle,
  FileSignature,
  Plus,
  Loader2,
} from "lucide-react";
import type {
  Service,
  Task,
  TaskPriority,
  Milestone,
  Deliverable,
  WorkRecord,
  Currency,
} from "@/types";
import { toast } from "sonner";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { CircularProgress } from "@/components/shared/CircularProgress";
import { useTasks } from "@/hooks/useTasks";
import { useMilestones } from "@/hooks/useMilestones";
import { useDeliverables } from "@/hooks/useDeliverables";
import { useWorkRecords } from "@/hooks/useWorkRecords";
import { useInvoices } from "@/hooks/useInvoices";
import { useFinancialSummary } from "@/hooks/useFinancialSummary";
import { CURATED_PACKAGES } from "@/data/catalog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { ReceiptInvoiceModal } from "@/components/shared/ReceiptInvoiceModal";
import { ContractWorkspaceView } from "@/components/contracts/ContractWorkspaceView";
import type { ReceiptPdfData } from "@/lib/invoicePdfGenerator";

export interface SubtaskItem {
  id: string;
  title: string;
  done: boolean;
}

export function parseSubtasks(description?: string | null): {
  cleanDescription: string;
  subtasks: SubtaskItem[];
} {
  if (!description) return { cleanDescription: "", subtasks: [] };
  const lines = description.split("\n");
  const subtasks: SubtaskItem[] = [];
  const cleanLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^[-*]\s*\[([ xX])\]\s*(.*)$/);
    if (match) {
      subtasks.push({
        id: `step-${i}`,
        done: match[1].toLowerCase() === "x",
        title: match[2].trim(),
      });
    } else {
      cleanLines.push(line);
    }
  }

  return {
    cleanDescription: cleanLines.join("\n").trim(),
    subtasks,
  };
}

interface ServiceProgressDetailModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  initialTaskId?: string | null;
  currency?: Currency;
  isManager?: boolean;
}

export function ServiceProgressDetailModal({
  service,
  isOpen,
  onClose,
  initialTaskId,
  currency = "ETB",
  isManager: isManagerProp,
}: ServiceProgressDetailModalProps) {
  const navigate = useNavigate();
  const { currentClient, role } = useAuth();
  const isManager =
    isManagerProp !== undefined
      ? isManagerProp
      : role === "super_admin" ||
        role === "admin" ||
        role === "owner" ||
        role === "operations_manager" ||
        role === "lead_creative" ||
        role === "creative";

  // Scoped queries
  const { tasks, createTask } = useTasks(service?.id, service?.project_id);
  const { milestones, createMilestone } = useMilestones(service?.id, service?.project_id);
  const { deliverables } = useDeliverables(service?.id, service?.project_id);
  const { workRecords } = useWorkRecords(service?.id, service?.project_id);
  const { invoices } = useInvoices(service?.client_id);
  const { getServiceFinancials } = useFinancialSummary(service?.client_id);

  // Manager quick add task / milestone states
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("medium");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [newMilestoneName, setNewMilestoneName] = useState("");
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState("");
  const [isSubmittingMilestone, setIsSubmittingMilestone] = useState(false);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !service) return;
    setIsSubmittingTask(true);
    try {
      await createTask({
        title: newTaskTitle.trim(),
        service_id: service.id,
        project_id: service.project_id,
        client_id: service.client_id,
        priority: newTaskPriority,
        due_date: newTaskDueDate || null,
        status: "planned",
        visibility: "client",
      });
      toast.success("Task added to service!");
      setNewTaskTitle("");
      setNewTaskDueDate("");
      setShowAddTask(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create task");
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneName.trim() || !service) return;
    setIsSubmittingMilestone(true);
    try {
      await createMilestone({
        name: newMilestoneName.trim(),
        service_id: service.id,
        project_id: service.project_id,
        client_id: service.client_id,
        due_date: newMilestoneDueDate || null,
        status: "not_started",
        order_index: serviceMilestones.length + 1,
      });
      toast.success("Milestone phase created!");
      setNewMilestoneName("");
      setNewMilestoneDueDate("");
      setShowAddMilestone(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create milestone");
    } finally {
      setIsSubmittingMilestone(false);
    }
  };

  // Active Tab inside modal: "tasks" | "milestones" | "deliverables" | "contracts" | "activity" | "scope"
  const [modalTab, setModalTab] = useState<"tasks" | "milestones" | "deliverables" | "contracts" | "activity" | "scope">(
    "tasks"
  );

  // Sub-task status filter & search
  const [taskFilter, setTaskFilter] = useState<"all" | "in_progress" | "completed" | "planned">("all");
  const [taskSearch, setTaskSearch] = useState("");
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>(() => {
    return initialTaskId ? { [initialTaskId]: true } : {};
  });

  const toggleTaskExpand = (id: string) => {
    setExpandedTaskIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter tasks belonging to this service or project
  const serviceTasks = useMemo(() => {
    if (!service) return [];
    return tasks.filter(
      (t) => t.service_id === service.id || t.project_id === service.project_id
    );
  }, [tasks, service]);

  const filteredTasks = useMemo(() => {
    return serviceTasks.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
        (t.description || "").toLowerCase().includes(taskSearch.toLowerCase());
      const matchesFilter =
        taskFilter === "all" ||
        (taskFilter === "completed" && t.status === "completed") ||
        (taskFilter === "in_progress" && (t.status === "in_progress" || t.status === "in_review")) ||
        (taskFilter === "planned" && (t.status === "planned" || t.status === "backlog"));
      return matchesSearch && matchesFilter;
    });
  }, [serviceTasks, taskSearch, taskFilter]);

  // Filter milestones
  const serviceMilestones = useMemo(() => {
    if (!service) return [];
    return milestones.filter(
      (m) => m.service_id === service.id || m.project_id === service.project_id
    );
  }, [milestones, service]);

  // Filter deliverables
  const serviceDeliverables = useMemo(() => {
    if (!service) return [];
    return deliverables.filter(
      (d) => d.service_id === service.id || d.project_id === service.project_id
    );
  }, [deliverables, service]);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptPdfData, setReceiptPdfData] = useState<ReceiptPdfData | null>(null);

  // Unified financial data
  const { totalBilled, totalPaid } = useMemo(() => {
    return getServiceFinancials(service);
  }, [getServiceFinancials, service]);

  const projectInvoices = useMemo(() => {
    if (!service) return [];
    return invoices.filter((i) => i.project_id === service.project_id);
  }, [invoices, service]);

  const handleOpenReceipt = () => {
    if (!service) return;
    const inv = projectInvoices[0];
    const amount = totalPaid || service.project?.budget || 0;
    const receiptNum = inv ? `FURII-${inv.invoice_number}` : `FURII-REC-${service.id.slice(0, 8).toUpperCase()}`;

    setReceiptPdfData({
      receiptNumber: receiptNum,
      paymentDate: inv?.payment_date ? formatDate(inv.payment_date) : formatDate(new Date().toISOString()),
      clientName: currentClient?.company_name || currentClient?.name || "Client",
      clientEmail: currentClient?.billing_email || currentClient?.email || "",
      projectName: service.project?.title || service.name,
      serviceName: service.name,
      amountPaid: amount,
      paymentMethod: inv?.payment_method || "Direct Bank Transfer / Wire",
      referenceNumber: inv?.stripe_invoice_id || `TXN-${service.id.slice(0, 6)}`,
      currency,
    });
    setIsReceiptModalOpen(true);
  };

  // Match catalog package if applicable
  const matchedPackage = useMemo(() => {
    if (!service) return null;
    const sName = service.name.toLowerCase();
    return CURATED_PACKAGES.find((pkg) =>
      sName.includes(pkg.name.toLowerCase()) || pkg.name.toLowerCase().includes(sName)
    );
  }, [service]);

  if (!isOpen || !service) return null;

  const completedTasksCount = serviceTasks.filter((t) => t.status === "completed").length;
  const taskCompletionPct =
    serviceTasks.length > 0
      ? Math.round((completedTasksCount / serviceTasks.length) * 100)
      : service.progress || 0;

  const completedMilestonesCount = serviceMilestones.filter((m) => m.status === "completed").length;
  const approvedDeliverablesCount = serviceDeliverables.filter(
    (d) => d.status === "approved"
  ).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.2 }}
        className="bg-card w-full max-w-4xl rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-border/80 bg-secondary/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
                {service.service_type}
              </span>
              <StatusBadge status={service.status} />
              {service.current_phase && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-secondary text-foreground border border-border flex items-center gap-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  {service.current_phase}
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-foreground leading-snug break-words">
              {service.name}
            </h2>

            {service.description && (
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {service.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-border/60">
            {/* Analytical Circular Progress Gauge */}
            <CircularProgress
              value={taskCompletionPct}
              size={52}
              strokeWidth={4.5}
              label="Overall Progress"
              sublabel={service.current_phase || (taskCompletionPct === 100 ? "Completed" : "Active")}
            />

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer shrink-0"
              title="Close Modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Analytical Key Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 p-3.5 sm:p-5 bg-card border-b border-border/70 shrink-0">
          {/* 1. Sub-Tasks */}
          <div className="p-3 rounded-xl bg-secondary/30 border border-border/80 space-y-1.5 min-w-0">
            <span className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1 font-semibold">
              <CheckSquare className="w-3 h-3 text-primary" />
              Sub-Tasks
            </span>
            <div className="flex items-baseline justify-between gap-1">
              <span className="text-sm sm:text-base font-bold font-mono text-foreground truncate">
                {serviceTasks.length > 0 ? `${completedTasksCount} / ${serviceTasks.length}` : "0 / 0"}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground font-semibold shrink-0">
                {serviceTasks.length > 0 ? `${taskCompletionPct}% Done` : "Empty"}
              </span>
            </div>
            <ProgressBar value={serviceTasks.length > 0 ? taskCompletionPct : 0} showValue={false} className="h-1.5" />
          </div>

          {/* 2. Milestones */}
          <div className="p-3 rounded-xl bg-secondary/30 border border-border/80 space-y-1.5 min-w-0">
            <span className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1 font-semibold">
              <Layers className="w-3 h-3 text-emerald-500" />
              Milestones
            </span>
            <div className="flex items-baseline justify-between gap-1">
              <span className="text-sm sm:text-base font-bold font-mono text-foreground truncate">
                {serviceMilestones.length > 0 ? `${completedMilestonesCount} / ${serviceMilestones.length}` : "0 / 0"}
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
                {serviceMilestones.length > 0
                  ? completedMilestonesCount === serviceMilestones.length
                    ? "Completed"
                    : "On Track"
                  : "None"}
              </span>
            </div>
            <ProgressBar
              value={
                serviceMilestones.length > 0
                  ? Math.round((completedMilestonesCount / serviceMilestones.length) * 100)
                  : 0
              }
              showValue={false}
              className="h-1.5"
            />
          </div>

          {/* 3. Deliverables */}
          <div className="p-3 rounded-xl bg-secondary/30 border border-border/80 space-y-1.5 min-w-0">
            <span className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1 font-semibold">
              <FileCheck2 className="w-3 h-3 text-purple-500" />
              Deliverables
            </span>
            <div className="flex items-baseline justify-between gap-1">
              <span className="text-sm sm:text-base font-bold font-mono text-foreground truncate">
                {serviceDeliverables.length > 0 ? `${approvedDeliverablesCount} / ${serviceDeliverables.length}` : "0 / 0"}
              </span>
              <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-semibold shrink-0">
                {serviceDeliverables.length > 0
                  ? serviceDeliverables.filter((d) => d.status === "awaiting_review").length > 0
                    ? `${serviceDeliverables.filter((d) => d.status === "awaiting_review").length} To Sign`
                    : "Up to Date"
                  : "None"}
              </span>
            </div>
            <ProgressBar
              value={
                serviceDeliverables.length > 0
                  ? Math.round((approvedDeliverablesCount / serviceDeliverables.length) * 100)
                  : 0
              }
              showValue={false}
              className="h-1.5"
            />
          </div>

          {/* 4. Investment */}
          <div className="p-3 rounded-xl bg-secondary/30 border border-border/80 space-y-1.5 min-w-0">
            <span className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1 font-semibold">
              <DollarSign className="w-3 h-3 text-amber-500" />
              Investment
            </span>
            <div className="flex items-baseline justify-between gap-1">
              <span className="text-xs sm:text-sm font-bold font-mono text-foreground truncate">
                {formatCurrency(totalPaid, currency)}
              </span>
              {totalBilled > 0 && (
                <span className="text-[10px] font-mono text-muted-foreground truncate">
                  of {formatCurrency(totalBilled, currency)}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
              <span className="truncate">
                {totalBilled > totalPaid
                  ? `${formatCurrency(totalBilled - totalPaid, currency)} Due`
                  : "Settled"}
              </span>
              {(totalPaid > 0 || (service.project?.budget && service.project.budget > 0)) && (
                <button
                  type="button"
                  onClick={handleOpenReceipt}
                  className="inline-flex items-center gap-1 text-[10px] text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-bold underline cursor-pointer shrink-0"
                  title="View and download official payment receipt PDF"
                >
                  <ShieldCheck className="w-3 h-3" />
                  Receipt
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 sm:px-6 pt-2.5 bg-secondary/10 border-b border-border flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setModalTab("tasks")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              modalTab === "tasks"
                ? "border-primary text-primary bg-card shadow-2xs"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tasks Checklist</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-secondary font-mono">
              {serviceTasks.length}
            </span>
          </button>

          <button
            onClick={() => setModalTab("milestones")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              modalTab === "milestones"
                ? "border-primary text-primary bg-card shadow-2xs"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Milestone Timeline</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-secondary font-mono">
              {serviceMilestones.length}
            </span>
          </button>

          <button
            onClick={() => setModalTab("deliverables")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              modalTab === "deliverables"
                ? "border-primary text-primary bg-card shadow-2xs"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Deliverables & Vault</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-secondary font-mono">
              {serviceDeliverables.length}
            </span>
          </button>

          <button
            onClick={() => setModalTab("contracts")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              modalTab === "contracts"
                ? "border-primary text-primary bg-card shadow-2xs"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileSignature className="w-3.5 h-3.5" />
            <span>Contracts</span>
          </button>

          <button
            onClick={() => setModalTab("activity")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              modalTab === "activity"
                ? "border-primary text-primary bg-card shadow-2xs"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Audit Trail</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-secondary font-mono">
              {workRecords.length}
            </span>
          </button>

          {matchedPackage && (
            <button
              onClick={() => setModalTab("scope")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                modalTab === "scope"
                  ? "border-primary text-primary bg-card shadow-2xs"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Blueprint Scope</span>
            </button>
          )}
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* ======================================================== */}
          {/* TAB 1: COLORED TASKS & SUBTASKS CHECKLIST                */}
          {/* ======================================================== */}
          {modalTab === "tasks" && (
            <div className="space-y-4">
              {/* Search & Status Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg border border-border text-xs flex-wrap">
                  {(["all", "in_progress", "completed", "planned"] as const).map((filterKey) => {
                    const count =
                      filterKey === "all"
                        ? serviceTasks.length
                        : filterKey === "in_progress"
                        ? serviceTasks.filter((t) => t.status === "in_progress" || t.status === "in_review").length
                        : filterKey === "completed"
                        ? completedTasksCount
                        : serviceTasks.filter((t) => t.status === "planned" || t.status === "backlog").length;

                    return (
                      <button
                        key={filterKey}
                        onClick={() => setTaskFilter(filterKey)}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                          taskFilter === filterKey
                            ? "bg-card text-foreground shadow-2xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {filterKey === "all"
                          ? "All"
                          : filterKey === "in_progress"
                          ? "In Progress"
                          : filterKey === "completed"
                          ? "Completed"
                          : "Upcoming"}{" "}
                        ({count})
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-full sm:w-52">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search checklist..."
                      value={taskSearch}
                      onChange={(e) => setTaskSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-secondary/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary"
                    />
                  </div>

                  {isManager && (
                    <button
                      type="button"
                      onClick={() => setShowAddTask((prev) => !prev)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Task</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Inline Add Task Form for Manager */}
              {isManager && showAddTask && (
                <form
                  onSubmit={handleCreateTask}
                  className="p-3.5 rounded-xl bg-secondary/30 border border-border space-y-3 animate-in fade-in duration-150"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5 text-primary" />
                      Add New Sub-Task
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddTask(false)}
                      className="text-muted-foreground hover:text-foreground text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        required
                        placeholder="Task title..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-hidden focus:border-primary"
                      />
                    </div>
                    <div>
                      <input
                        type="date"
                        value={newTaskDueDate}
                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground font-mono">Priority:</span>
                      <select
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                        className="px-2 py-1 text-xs rounded border border-border bg-card text-foreground font-mono cursor-pointer"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingTask || !newTaskTitle.trim()}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                    >
                      {isSubmittingTask && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Save Task
                    </button>
                  </div>
                </form>
              )}

              {/* Tasks List */}
              {filteredTasks.length === 0 ? (
                <div className="p-8 text-center bg-secondary/20 rounded-xl border border-dashed border-border space-y-2">
                  <CheckSquare className="w-8 h-8 text-muted-foreground mx-auto" />
                  <div className="text-xs font-bold text-foreground">No Tasks Listed</div>
                  <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                    {taskSearch || taskFilter !== "all"
                      ? "No tasks match your current filter."
                      : isManager
                      ? "This service has no tasks yet. Use 'Add Task' above to create checklist items for this client."
                      : "The execution team will publish progress checklist items as work advances."}
                  </p>
                  {isManager && !showAddTask && (
                    <button
                      type="button"
                      onClick={() => setShowAddTask(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer mt-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add First Task</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTasks.map((task) => {
                    const isExpanded = !!expandedTaskIds[task.id];
                    const isDone = task.status === "completed";
                    const { cleanDescription, subtasks } = parseSubtasks(task.description || "");

                    const itemsToRender = subtasks.map((s) => ({
                      id: s.id,
                      title: s.title,
                      done: s.done,
                    }));

                    const completedItemsCount = itemsToRender.filter((s) => s.done).length;
                    const subtaskPct = itemsToRender.length > 0 ? Math.round((completedItemsCount / itemsToRender.length) * 100) : 0;
                    const linkedMilestone = serviceMilestones.find((m) => m.id === task.milestone_id);

                    return (
                      <div
                        key={task.id}
                        className={`rounded-xl border transition-all ${
                          isDone
                            ? "bg-card border-border/70 shadow-2xs"
                            : isExpanded
                            ? "bg-card border-primary/40 shadow-xs ring-1 ring-primary/20"
                            : "bg-card border-border hover:border-border/90 shadow-2xs"
                        }`}
                      >
                        {/* Task Card Header (Click to Expand Checklist) */}
                        <div
                          onClick={() => toggleTaskExpand(task.id)}
                          className="p-4 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-secondary/15 transition-colors"
                        >
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <StatusBadge status={task.status} />

                              {task.priority && (
                                <span
                                  className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                                    task.priority === "urgent"
                                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                                      : task.priority === "high"
                                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                      : "bg-secondary text-muted-foreground border border-border"
                                  }`}
                                >
                                  {task.priority} Priority
                                </span>
                              )}

                              {linkedMilestone && (
                                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold flex items-center gap-1">
                                  <Layers className="w-3 h-3" />
                                  {linkedMilestone.name || linkedMilestone.title}
                                </span>
                              )}

                              {task.due_date && (
                                <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Due: {formatDate(task.due_date)}
                                </span>
                              )}
                            </div>

                            <h4
                              className={`text-sm sm:text-base font-bold leading-snug break-words ${
                                isDone ? "line-through text-muted-foreground" : "text-foreground"
                              }`}
                            >
                              {task.title}
                            </h4>

                            {cleanDescription && (
                              <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
                                {cleanDescription}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-3 shrink-0 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-border/50">
                            {itemsToRender.length > 0 && (
                              <div className="text-right min-w-[70px]">
                                <span className="text-[10px] font-mono text-muted-foreground block font-semibold">
                                  {completedItemsCount}/{itemsToRender.length} Done
                                </span>
                                <div className="w-20 sm:w-24 mt-1">
                                  <ProgressBar value={subtaskPct} showValue={false} className="h-1.5" />
                                </div>
                              </div>
                            )}

                            <div className="p-1 rounded-lg border border-border bg-secondary/30 text-muted-foreground">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Colored Checklist (Read-Only) */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="border-t border-border/80 bg-secondary/10 p-4 sm:p-5 space-y-3"
                            >
                              {cleanDescription && (
                                <div className="text-xs text-foreground/80 leading-relaxed bg-card/60 p-3 rounded-lg border border-border/60">
                                  {cleanDescription}
                                </div>
                              )}

                              {itemsToRender.length > 0 && (
                                <div className="space-y-2">
                                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
                                    <CheckSquare className="w-3.5 h-3.5 text-primary" />
                                    Checklist Breakdown ({completedItemsCount}/{itemsToRender.length})
                                  </div>

                                  <div className="space-y-2">
                                    {itemsToRender.map((step, idx) => (
                                      <div
                                        key={step.id || idx}
                                        className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 text-xs ${
                                          step.done
                                            ? "bg-emerald-500/5 border-emerald-500/20 text-foreground"
                                            : "bg-card border-border/70 text-foreground"
                                        }`}
                                      >
                                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                          {step.done ? (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                          ) : (
                                            <Circle className="w-4 h-4 text-primary/50 shrink-0 mt-0.5" />
                                          )}
                                          <div className="space-y-0.5 min-w-0">
                                            <span
                                              className={`font-semibold leading-relaxed break-words block ${
                                                step.done ? "line-through text-muted-foreground" : "text-foreground"
                                              }`}
                                            >
                                              {step.title}
                                            </span>
                                          </div>
                                        </div>

                                        <span
                                          className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded shrink-0 ${
                                            step.done
                                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                              : "bg-secondary text-muted-foreground border border-border"
                                          }`}
                                        >
                                          {step.done ? "Completed" : "Pending"}
                                        </span>
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
          {/* TAB 2: MILESTONE TIMELINE (ROADMAP)                      */}
          {/* ======================================================== */}
          {modalTab === "milestones" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Delivery Milestone Roadmap</h3>
                  <p className="text-xs text-muted-foreground">Phased progression and milestone achievement milestones</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-foreground bg-secondary px-2.5 py-1 rounded-lg border border-border">
                    {completedMilestonesCount} of {serviceMilestones.length} Completed
                  </span>
                  {isManager && (
                    <button
                      onClick={() => setShowAddMilestone((v) => !v)}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Milestone
                    </button>
                  )}
                </div>
              </div>

              {/* Inline Add Milestone Form */}
              {isManager && showAddMilestone && (
                <form
                  onSubmit={handleCreateMilestone}
                  className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3"
                >
                  <h4 className="text-xs font-bold text-foreground">New Milestone Phase</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Milestone name…"
                      value={newMilestoneName}
                      onChange={(e) => setNewMilestoneName(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      required
                    />
                    <input
                      type="date"
                      value={newMilestoneDueDate}
                      onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => { setShowAddMilestone(false); setNewMilestoneName(""); setNewMilestoneDueDate(""); }}
                      className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-secondary transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingMilestone || !newMilestoneName.trim()}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {isSubmittingMilestone ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                      Create Phase
                    </button>
                  </div>
                </form>
              )}

              {serviceMilestones.length === 0 ? (
                <div className="p-8 text-center bg-secondary/20 rounded-xl border border-dashed border-border space-y-3">
                  <Layers className="w-8 h-8 text-muted-foreground mx-auto" />
                  <div className="text-xs font-bold text-foreground">No Milestones Outlined</div>
                  <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                    The project management team will formalize delivery phases and checkpoints for this stream.
                  </p>
                  {isManager && !showAddMilestone && (
                    <button
                      onClick={() => setShowAddMilestone(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add First Milestone
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {serviceMilestones.map((milestone, idx) => {
                    const isCompleted = milestone.status === "completed";
                    const isInProgress = milestone.status === "in_progress";

                    return (
                      <div
                        key={milestone.id}
                        className={`p-4 rounded-xl border transition-all space-y-2 ${
                          isCompleted
                            ? "bg-emerald-500/5 border-emerald-500/20 shadow-2xs"
                            : isInProgress
                            ? "bg-primary/5 border-primary/30 shadow-xs"
                            : "bg-card border-border shadow-2xs"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-secondary font-bold text-muted-foreground shrink-0">
                              Phase 0{idx + 1}
                            </span>
                            <h4 className="text-sm font-bold text-foreground truncate">
                              {milestone.name || milestone.title}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {milestone.due_date && (
                              <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Target: {formatDate(milestone.due_date)}
                              </span>
                            )}
                            <StatusBadge status={milestone.status} />
                          </div>
                        </div>

                        {milestone.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {milestone.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: DELIVERABLES & VAULT                              */}
          {/* ======================================================== */}
          {modalTab === "deliverables" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Project Deliverables & Assets</h3>
                  <p className="text-xs text-muted-foreground">Digital files, source links, and final signed outputs</p>
                </div>
                <span className="text-xs font-mono font-semibold text-foreground bg-secondary px-2.5 py-1 rounded-lg border border-border">
                  {serviceDeliverables.length} Deliverable{serviceDeliverables.length !== 1 ? "s" : ""}
                </span>
              </div>

              {serviceDeliverables.length === 0 ? (
                <div className="p-8 text-center bg-secondary/20 rounded-xl border border-dashed border-border space-y-2">
                  <FileCheck2 className="w-8 h-8 text-muted-foreground mx-auto" />
                  <div className="text-xs font-bold text-foreground">No Deliverables Published Yet</div>
                  <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                    Approved artwork, source files, and documents will appear here once ready for review or download.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {serviceDeliverables.map((deliv) => {
                    const isAwaitingReview = deliv.status === "awaiting_review";

                    return (
                      <div
                        key={deliv.id}
                        className={`p-4 rounded-xl border flex flex-col justify-between gap-3 shadow-2xs ${
                          isAwaitingReview
                            ? "bg-amber-500/5 border-amber-500/30 ring-1 ring-amber-500/20"
                            : "bg-card border-border"
                        }`}
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-secondary font-bold text-muted-foreground">
                              {deliv.type || "Asset"}
                            </span>
                            <StatusBadge status={deliv.status} />
                          </div>

                          <h4 className="text-sm font-bold text-foreground leading-snug break-words">
                            {deliv.title}
                          </h4>

                          {deliv.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {deliv.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
                          <span className="text-[10px] font-mono text-muted-foreground">
                            v{deliv.current_version || 1} • {formatDate(deliv.created_at)}
                          </span>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {deliv.file_url && (
                              <a
                                href={deliv.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors cursor-pointer"
                              >
                                <Download className="w-3 h-3" />
                                Download
                              </a>
                            )}

                            {isAwaitingReview && (
                              <button
                                onClick={() => navigate("/portal/approvals")}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
                              >
                                Sign Off
                                <ArrowRight className="w-3 h-3" />
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

          {/* ======================================================== */}
          {/* TAB 4: CONTRACTS & DIGITAL SIGN-OFF                      */}
          {/* ======================================================== */}
          {modalTab === "contracts" && (
            <div className="space-y-4">
              <ContractWorkspaceView
                serviceId={service?.id}
                projectId={service?.project_id}
                clientId={service?.client_id}
                isManager={isManager}
              />
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: LIVE AUDIT TRAIL                                  */}
          {/* ======================================================== */}
          {modalTab === "activity" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Live Work Audit Trail</h3>
                  <p className="text-xs text-muted-foreground">Chronological logs of completed milestones, sprints, and logged hours</p>
                </div>
              </div>

              {workRecords.length === 0 ? (
                <div className="p-8 text-center bg-secondary/20 rounded-xl border border-dashed border-border space-y-2">
                  <Activity className="w-8 h-8 text-muted-foreground mx-auto" />
                  <div className="text-xs font-bold text-foreground">No Activity Records</div>
                  <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                    Time logs, commits, and work progress updates will stream here automatically.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {workRecords.map((record) => (
                    <div
                      key={record.id}
                      className="p-3.5 rounded-xl bg-card border border-border shadow-2xs flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground truncate">
                            {record.task?.title || "Operational Milestone"}
                          </span>
                          {record.hours_spent && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-secondary text-muted-foreground">
                              {record.hours_spent} hrs
                            </span>
                          )}
                        </div>
                        {record.notes && (
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1">
                            {record.notes}
                          </p>
                        )}
                      </div>

                      <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                        {formatDate(record.work_date || record.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: INCLUDED BLUEPRINT SCOPE                          */}
          {/* ======================================================== */}
          {modalTab === "scope" && matchedPackage && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">{matchedPackage.name} Scope</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {matchedPackage.description}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                  Included Features & Specifications
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {matchedPackage.features.map((feature, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-card border border-border shadow-2xs flex items-start gap-2.5 text-xs"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-foreground leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-secondary/20 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Furii Studio Operations Transparency</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground border border-border shadow-2xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>

      {/* Official PDF Receipt / Invoice Modal */}
      <ReceiptInvoiceModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        data={receiptPdfData}
      />
    </div>
  );
}
