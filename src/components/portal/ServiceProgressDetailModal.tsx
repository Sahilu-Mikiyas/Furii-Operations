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
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Check,
  Search,
  Filter,
  Activity,
  Award,
} from "lucide-react";
import type { Service, Task, Milestone, Deliverable, WorkRecord, Currency } from "@/types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { useTasks } from "@/hooks/useTasks";
import { useMilestones } from "@/hooks/useMilestones";
import { useDeliverables } from "@/hooks/useDeliverables";
import { useWorkRecords } from "@/hooks/useWorkRecords";
import { useInvoices } from "@/hooks/useInvoices";
import { CURATED_PACKAGES } from "@/data/catalog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useChecklists } from "@/hooks/useChecklists";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { ReceiptInvoiceModal } from "@/components/shared/ReceiptInvoiceModal";
import type { ReceiptPdfData } from "@/lib/invoicePdfGenerator";

interface ServiceProgressDetailModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  initialTaskId?: string | null;
  currency?: Currency;
}

export function ServiceProgressDetailModal({
  service,
  isOpen,
  onClose,
  initialTaskId,
  currency = "ETB",
}: ServiceProgressDetailModalProps) {
  const navigate = useNavigate();

  // Queries for the specific service & project
  const { tasks } = useTasks(service?.id, service?.project_id);
  const { milestones } = useMilestones();
  const { deliverables } = useDeliverables(service?.id, service?.project_id);
  const { workRecords } = useWorkRecords(service?.id, service?.project_id);
  const { invoices } = useInvoices(service?.client_id);
  const { categories: checklistCategories, items: checklistItems } = useChecklists();

  // Active Tab inside modal: "tasks" | "milestones" | "deliverables" | "activity" | "scope"
  const [modalTab, setModalTab] = useState<"tasks" | "milestones" | "deliverables" | "activity" | "scope">(
    "tasks"
  );

  // Sub-task status filter
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
      const matchesSearch = t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
        (t.description || "").toLowerCase().includes(taskSearch.toLowerCase());
      const matchesFilter =
        taskFilter === "all" ||
        (taskFilter === "completed" && t.status === "completed") ||
        (taskFilter === "in_progress" && (t.status === "in_progress" || t.status === "in_review")) ||
        (taskFilter === "planned" && (t.status === "planned" || t.status === "backlog"));
      return matchesSearch && matchesFilter;
    });
  }, [serviceTasks, taskSearch, taskFilter]);

  // Filter milestones for this service or project
  const serviceMilestones = useMemo(() => {
    if (!service) return [];
    return milestones
      .filter((m) => m.service_id === service.id || m.project_id === service.project_id)
      .sort((a, b) => a.order_index - b.order_index);
  }, [milestones, service]);

  // Filter deliverables
  const serviceDeliverables = useMemo(() => {
    if (!service) return [];
    return deliverables.filter(
      (d) => d.service_id === service.id || d.project_id === service.project_id
    );
  }, [deliverables, service]);

  const { currentClient } = useAuth();
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptPdfData, setReceiptPdfData] = useState<ReceiptPdfData | null>(null);

  // Invoices & financial progress
  const projectInvoices = useMemo(() => {
    if (!service) return [];
    return invoices.filter((i) => i.project_id === service.project_id);
  }, [invoices, service]);

  const totalBilled = projectInvoices.reduce((acc, i) => acc + (i.total || 0), 0);
  const totalPaid = projectInvoices.reduce((acc, i) => acc + (i.amount_paid || 0), 0);

  const handleOpenReceipt = () => {
    if (!service) return;
    const inv = projectInvoices[0];
    const amount = totalPaid || service.project?.budget || 0;
    const receiptNum = inv ? `FURII-${inv.invoice_number}` : `FURII-REC-${service.id.slice(0, 8).toUpperCase()}`;

    const data: ReceiptPdfData = {
      receiptNumber: receiptNum,
      issueDate: formatDate(service.start_date || new Date().toISOString()),
      approvalDate: formatDate(new Date().toISOString()),
      client: {
        name: currentClient?.name || "Client Partner",
        company: currentClient?.company || currentClient?.name || "Client Organization",
        email: currentClient?.email || undefined,
        phone: currentClient?.phone || undefined,
      },
      projectTitle: service.name,
      serviceType: service.service_type,
      description: service.description || "Active authorized service delivery stream with Furii Operations.",
      items: [
        {
          description: service.name,
          category: service.service_type ? `${service.service_type.toUpperCase()} SCOPE` : "Delivery Stream",
          quantity: 1,
          unitPrice: Number(amount),
          total: Number(amount),
        },
      ],
      currency: (currency as "ETB" | "USD") || "ETB",
      subtotal: Number(amount),
      totalAmount: Number(amount),
      amountPaid: Number(amount),
      paymentMethod: "Electronic Wire / Bank Clearance",
      paymentReference: `REC-${service.id.slice(0, 8).toUpperCase()}`,
      paymentDate: formatDate(service.start_date || new Date().toISOString()),
      verifiedBy: "Furii Operations & Finance",
    };

    setReceiptPdfData(data);
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
  const taskCompletionPct = serviceTasks.length > 0
    ? Math.round((completedTasksCount / serviceTasks.length) * 100)
    : service.progress || 0;

  const completedMilestonesCount = serviceMilestones.filter((m) => m.status === "completed").length;
  const approvedDeliverablesCount = serviceDeliverables.filter(
    (d) => d.status === "approved"
  ).length;

  // Dynamic checklist generator using admin-configured categories and items
  const getSubtaskChecklist = (task: Task) => {
    const isCompleted = task.status === "completed";
    const isInReview = task.status === "in_review";
    const isInProgress = task.status === "in_progress";

    if (checklistItems && checklistItems.length > 0) {
      return checklistItems.map((item, idx) => {
        const cat = checklistCategories.find((c) => c.id === item.category_id);
        const autoDone =
          item.is_completed ||
          isCompleted ||
          (isInReview && idx <= Math.floor(checklistItems.length * 0.75)) ||
          (isInProgress && idx <= Math.floor(checklistItems.length * 0.4));

        return {
          id: item.id,
          step: item.title,
          desc: item.description,
          categoryName: cat?.name || "Standard Quality Check",
          categoryColor: cat?.color || "blue",
          done: autoDone,
        };
      });
    }

    return [
      {
        id: "step-1",
        step: "Scope & Requirement Alignment",
        desc: "Confirmation of specifications, brief details, and asset dependencies.",
        categoryName: "Discovery",
        categoryColor: "blue",
        done: true,
      },
      {
        id: "step-2",
        step: "Engineering & Visual Architecture",
        desc: "Core design layout, data structures, and component scaffolding.",
        categoryName: "Architecture",
        categoryColor: "purple",
        done: isCompleted || isInReview || isInProgress,
      },
      {
        id: "step-3",
        step: "Feature Implementation & Integration",
        desc: "Deep functional execution, database integration, and UI polishing.",
        categoryName: "Execution",
        categoryColor: "amber",
        done: isCompleted || isInReview,
      },
      {
        id: "step-4",
        step: "Quality Verification & Performance Testing",
        desc: "Cross-device responsiveness, speed optimization, and edge-case testing.",
        categoryName: "QA",
        categoryColor: "emerald",
        done: isCompleted || isInReview,
      },
      {
        id: "step-5",
        step: "Production Deployment & Stakeholder Sign-off",
        desc: "Final delivery approval and deployment to live environment.",
        categoryName: "Delivery",
        categoryColor: "emerald",
        done: isCompleted,
      },
    ];
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-card w-full max-w-4xl rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border/80 bg-secondary/15 flex flex-col sm:flex-row sm:items-start justify-between gap-4 shrink-0">
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

            <h2 className="text-lg sm:text-xl font-bold text-foreground leading-snug">
              {service.name}
            </h2>

            {service.description && (
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {service.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                Overall Progress
              </span>
              <span className="text-base font-bold font-mono text-foreground">
                {taskCompletionPct}%
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
              title="Close Modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Key Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 sm:p-5 bg-card border-b border-border/70 shrink-0">
          <div className="p-3 rounded-xl bg-secondary/30 border border-border/80 space-y-1">
            <span className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1">
              <CheckSquare className="w-3 h-3 text-primary" />
              Sub-Tasks
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-base font-bold font-mono text-foreground">
                {completedTasksCount} / {serviceTasks.length}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground font-semibold">
                {taskCompletionPct}% Done
              </span>
            </div>
            <ProgressBar value={taskCompletionPct} showValue={false} className="h-1.5" />
          </div>

          <div className="p-3 rounded-xl bg-secondary/30 border border-border/80 space-y-1">
            <span className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1">
              <Layers className="w-3 h-3 text-emerald-500" />
              Milestones
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-base font-bold font-mono text-foreground">
                {completedMilestonesCount} / {serviceMilestones.length || 3}
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                {serviceMilestones.length > 0 && completedMilestonesCount === serviceMilestones.length
                  ? "Completed"
                  : "On Track"}
              </span>
            </div>
            <ProgressBar
              value={
                serviceMilestones.length > 0
                  ? Math.round((completedMilestonesCount / serviceMilestones.length) * 100)
                  : 33
              }
              showValue={false}
              className="h-1.5"
            />
          </div>

          <div className="p-3 rounded-xl bg-secondary/30 border border-border/80 space-y-1">
            <span className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1">
              <FileCheck2 className="w-3 h-3 text-purple-500" />
              Deliverables
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-base font-bold font-mono text-foreground">
                {approvedDeliverablesCount} / {serviceDeliverables.length}
              </span>
              <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-semibold">
                {serviceDeliverables.filter((d) => d.status === "awaiting_review").length > 0
                  ? `${serviceDeliverables.filter((d) => d.status === "awaiting_review").length} To Sign`
                  : "Up to Date"}
              </span>
            </div>
            <ProgressBar
              value={
                serviceDeliverables.length > 0
                  ? Math.round((approvedDeliverablesCount / serviceDeliverables.length) * 100)
                  : 100
              }
              showValue={false}
              className="h-1.5"
            />
          </div>

          <div className="p-3 rounded-xl bg-secondary/30 border border-border/80 space-y-1">
            <span className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-amber-500" />
              Investment
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold font-mono text-foreground truncate">
                {formatCurrency(totalPaid, currency)}
              </span>
              {totalBilled > 0 && (
                <span className="text-[10px] font-mono text-muted-foreground">
                  of {formatCurrency(totalBilled, currency)}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
              <span>
                {totalBilled > totalPaid
                  ? `${formatCurrency(totalBilled - totalPaid, currency)} Remaining`
                  : "Fully Settled"}
              </span>
              {(totalPaid > 0 || (service.project?.budget && service.project.budget > 0)) && (
                <button
                  type="button"
                  onClick={handleOpenReceipt}
                  className="inline-flex items-center gap-1 text-[10px] text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-bold underline cursor-pointer"
                  title="View and download official payment receipt PDF"
                >
                  <ShieldCheck className="w-3 h-3" />
                  PDF Receipt
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 sm:px-6 pt-3 bg-secondary/10 border-b border-border flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setModalTab("tasks")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              modalTab === "tasks"
                ? "border-primary text-primary bg-card shadow-2xs"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Sub-Tasks Breakdown</span>
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
              {serviceMilestones.length || 3}
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
            onClick={() => setModalTab("activity")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              modalTab === "activity"
                ? "border-primary text-primary bg-card shadow-2xs"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Live Audit Trail</span>
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
              <span>Included Blueprint Scope</span>
            </button>
          )}
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* ======================================================== */}
          {/* TAB 1: SUB-TASKS BREAKDOWN                               */}
          {/* ======================================================== */}
          {modalTab === "tasks" && (
            <div className="space-y-4">
              {/* Search & Status Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 p-1 bg-secondary/50 rounded-lg border border-border w-fit text-xs">
                  <button
                    onClick={() => setTaskFilter("all")}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      taskFilter === "all"
                        ? "bg-card text-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All ({serviceTasks.length})
                  </button>
                  <button
                    onClick={() => setTaskFilter("in_progress")}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      taskFilter === "in_progress"
                        ? "bg-card text-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    In Progress (
                    {serviceTasks.filter((t) => t.status === "in_progress" || t.status === "in_review").length}
                    )
                  </button>
                  <button
                    onClick={() => setTaskFilter("completed")}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      taskFilter === "completed"
                        ? "bg-card text-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Completed ({completedTasksCount})
                  </button>
                  <button
                    onClick={() => setTaskFilter("planned")}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      taskFilter === "planned"
                        ? "bg-card text-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Upcoming (
                    {serviceTasks.filter((t) => t.status === "planned" || t.status === "backlog").length}
                    )
                  </button>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search sub-tasks..."
                    value={taskSearch}
                    onChange={(e) => setTaskSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-secondary/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary"
                  />
                </div>
              </div>

              {/* Tasks List */}
              {filteredTasks.length === 0 ? (
                <div className="p-8 text-center bg-secondary/20 rounded-xl border border-border space-y-2">
                  <CheckSquare className="w-6 h-6 text-muted-foreground mx-auto" />
                  <div className="text-xs font-semibold text-foreground">No Sub-Tasks Match Filter</div>
                  <p className="text-[11px] text-muted-foreground">
                    Try adjusting your search criteria or switching status tabs.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTasks.map((task) => {
                    const isExpanded = !!expandedTaskIds[task.id];
                    const isDone = task.status === "completed";
                    const checklist = getSubtaskChecklist(task);
                    const doneSteps = checklist.filter((s) => s.done).length;

                    return (
                      <div
                        key={task.id}
                        className={`rounded-xl border transition-all ${
                          isExpanded
                            ? "bg-card border-primary/40 shadow-xs ring-1 ring-primary/20"
                            : "bg-card border-border hover:border-border/80 shadow-2xs"
                        }`}
                      >
                        {/* Task Header Row */}
                        <div
                          onClick={() => toggleTaskExpand(task.id)}
                          className="p-4 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1 flex-1 min-w-0">
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

                              {task.due_date && (
                                <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Target: {formatDate(task.due_date)}
                                </span>
                              )}
                            </div>

                            <h4
                              className={`text-sm font-bold leading-snug ${
                                isDone ? "line-through text-muted-foreground" : "text-foreground"
                              }`}
                            >
                              {task.title}
                            </h4>

                            {task.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {task.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right hidden sm:block">
                              <span className="text-[10px] font-mono text-muted-foreground block">
                                Checklist
                              </span>
                              <span className="text-xs font-mono font-bold text-foreground">
                                {doneSteps} / {checklist.length} Steps
                              </span>
                            </div>

                            <button
                              type="button"
                              className="p-1.5 rounded-lg border border-border bg-secondary/30 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Detailed Expanded Sub-Tasks Checklist & Scope */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="border-t border-border/80 bg-secondary/15 p-4 sm:p-5 space-y-4"
                            >
                              {task.description && (
                                <div className="space-y-1">
                                  <div className="text-[10px] font-mono uppercase text-muted-foreground font-bold">
                                    Full Specification & Scope
                                  </div>
                                  <p className="text-xs text-foreground leading-relaxed bg-card p-3 rounded-lg border border-border">
                                    {task.description}
                                  </p>
                                </div>
                              )}

                              {/* Granular Execution Steps */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-muted-foreground font-bold">
                                  <span>Execution Stages & Quality Checkpoints</span>
                                  <span>
                                    {doneSteps === checklist.length
                                      ? "100% Finalized"
                                      : `${Math.round((doneSteps / checklist.length) * 100)}% Complete`}
                                  </span>
                                </div>

                                <div className="space-y-1.5">
                                  {checklist.map((item, idx) => (
                                    <div
                                      key={idx}
                                      className={`p-2.5 rounded-lg border text-xs flex items-start gap-3 transition-colors ${
                                        item.done
                                          ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/60 text-foreground"
                                          : "bg-card border-border/70 text-muted-foreground"
                                      }`}
                                    >
                                      <div
                                        className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                                          item.done
                                            ? "bg-emerald-600 text-white"
                                            : "border border-border text-muted-foreground bg-secondary"
                                        }`}
                                      >
                                        {item.done ? <Check className="w-2.5 h-2.5" /> : idx + 1}
                                      </div>

                                      <div className="space-y-0.5 min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                          <div className={`font-semibold ${item.done ? "text-foreground" : "text-muted-foreground"}`}>
                                            {item.step}
                                          </div>
                                          {item.categoryName && (
                                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-secondary/80 text-muted-foreground border border-border/60 shrink-0">
                                              {item.categoryName}
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-[11px] text-muted-foreground leading-tight">
                                          {item.desc}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
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
          {/* TAB 2: MILESTONES PROGRESSION                            */}
          {/* ======================================================== */}
          {modalTab === "milestones" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-card border border-border space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Phased Milestone Architecture
                </h4>
                <p className="text-xs text-muted-foreground">
                  Our delivery methodology follows strict milestone checkpoints to ensure flawless execution and transparent client sign-offs.
                </p>
              </div>

              {serviceMilestones.length === 0 ? (
                <div className="space-y-3">
                  {/* Default 3-phase progression if custom milestones are not populated */}
                  {[
                    {
                      phase: "Phase 1: Discovery & Technical Architecture",
                      desc: "Catalog specifications alignment, brand asset intake, database schema definition, and prototype wireframes.",
                      status: "completed",
                      target: "Week 1",
                    },
                    {
                      phase: "Phase 2: Creative Production & Core Engineering",
                      desc: "High-fidelity visual design, responsive frontend development, CMS wiring, and automated workflow implementation.",
                      status: "in_progress",
                      target: "Week 2 - 3",
                    },
                    {
                      phase: "Phase 3: QA Validation, Final Sign-off & Handover",
                      desc: "Cross-device stress testing, speed optimization, client approval walkthrough, and production deployment.",
                      status: "not_started",
                      target: "Week 4",
                    },
                  ].map((m, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-card border border-border shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-muted-foreground font-bold">
                            0{idx + 1}
                          </span>
                          <span className="font-bold text-foreground">{m.phase}</span>
                        </div>
                        <StatusBadge status={m.status} />
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
                      <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-1 pt-1">
                        <Calendar className="w-3 h-3" />
                        Timeline: {m.target}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {serviceMilestones.map((m, idx) => (
                    <div
                      key={m.id}
                      className="p-4 rounded-xl bg-card border border-border shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-muted-foreground font-bold">
                            Phase 0{idx + 1}
                          </span>
                          <span className="font-bold text-foreground">{m.name || m.title}</span>
                        </div>
                        <StatusBadge status={m.status} />
                      </div>
                      {m.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed">{m.description}</p>
                      )}
                      {m.due_date && (
                        <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-1 pt-1">
                          <Calendar className="w-3 h-3" />
                          Target Sign-off: {formatDate(m.due_date)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: DELIVERABLES & REVIEW VAULT                       */}
          {/* ======================================================== */}
          {modalTab === "deliverables" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Project Deliverables & Vault Assets
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Review and download completed work products, design systems, and platform credentials.
                  </p>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    navigate("/portal/approvals");
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Approvals Hub</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {serviceDeliverables.length === 0 ? (
                <div className="p-8 text-center bg-secondary/20 rounded-xl border border-border space-y-2">
                  <FileCheck2 className="w-6 h-6 text-muted-foreground mx-auto" />
                  <div className="text-xs font-semibold text-foreground">No Deliverables Published Yet</div>
                  <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                    Deliverables will appear here for client review as each production phase is completed.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {serviceDeliverables.map((deliv) => {
                    const isAwaiting = deliv.status === "awaiting_review";
                    return (
                      <div
                        key={deliv.id}
                        className="p-4 rounded-xl bg-card border border-border shadow-2xs space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase text-muted-foreground">
                              v{deliv.current_version || 1}.0 • {deliv.file_type || "Asset"}
                            </span>
                            <StatusBadge status={deliv.status} />
                          </div>
                          <h5 className="text-sm font-bold text-foreground">{deliv.title}</h5>
                          {deliv.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {deliv.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-border/70 flex items-center justify-between gap-2">
                          {deliv.file_url ? (
                            <a
                              href={deliv.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download File
                            </a>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">Internal Asset</span>
                          )}

                          {isAwaiting && (
                            <button
                              onClick={() => {
                                onClose();
                                navigate("/portal/approvals");
                              }}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
                            >
                              Sign Off
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: LIVE ENGINEERING & WORK AUDIT TRAIL               */}
          {/* ======================================================== */}
          {modalTab === "activity" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-card border border-border space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-primary" />
                  Engineering & Production Audit Trail
                </h4>
                <p className="text-xs text-muted-foreground">
                  Transparent real-time changelog of technical commits, creative iterations, and operational updates logged by the agency team.
                </p>
              </div>

              {workRecords.length === 0 ? (
                <div className="p-8 text-center bg-secondary/20 rounded-xl border border-border space-y-2">
                  <Clock className="w-6 h-6 text-muted-foreground mx-auto" />
                  <div className="text-xs font-semibold text-foreground">No Work Records Logged Yet</div>
                  <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                    Daily engineering logs, code deployment commits, and asset updates will automatically stream here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {workRecords.map((record) => (
                    <div
                      key={record.id}
                      className="p-4 rounded-xl bg-card border border-border shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-foreground">{record.title}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {formatDate(record.work_date || record.created_at)}
                        </span>
                      </div>

                      {record.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed">{record.description}</p>
                      )}

                      {record.changes && record.changes.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <div className="text-[10px] font-mono uppercase text-muted-foreground font-bold">
                            Changelog Summary
                          </div>
                          <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                            {record.changes.map((ch, idx) => (
                              <li key={idx}>{ch}</li>
                            ))}
                          </ul>
                        </div>
                      )}
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
              <div className="p-5 rounded-xl bg-card border border-border space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
                    Official Catalog Package #{matchedPackage.number}
                  </span>
                  <span className="text-xs font-mono font-bold text-foreground">
                    {formatCurrency(matchedPackage.price, currency)}
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground">{matchedPackage.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{matchedPackage.tagline}</p>
                <div className="text-xs text-foreground font-semibold pt-1">
                  Core Goal: <span className="text-muted-foreground font-normal">{matchedPackage.coreGoal}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Included Sub-Services & Feature Breakdown
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {matchedPackage.includedServices.map((inc, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-card border border-border shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-foreground">{inc.name}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          Valued at {formatCurrency(inc.value, currency)}
                        </span>
                      </div>

                      <ul className="space-y-1.5 pt-1">
                        {inc.description.map((bullet, bIdx) => (
                          <li
                            key={bIdx}
                            className="text-xs text-muted-foreground flex items-start gap-2 leading-snug"
                          >
                            <span className="text-primary mt-1 shrink-0">•</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-border/80 bg-secondary/15 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-muted-foreground font-mono">
            Service ID: <span className="text-foreground">{service.id.slice(0, 8)}...</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </div>
      </motion.div>

      {/* Official Receipt & Settled Invoice Modal */}
      <ReceiptInvoiceModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        data={receiptPdfData}
      />
    </div>
  );
}
export default ServiceProgressDetailModal;
