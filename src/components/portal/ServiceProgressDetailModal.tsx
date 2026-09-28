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
  ChevronUp,
  ArrowRight,
  Check,
  Search,
  Filter,
  Activity,
  Award,
  Plus,
  Trash2,
  Edit3,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import type {
  Service,
  Task,
  Milestone,
  Deliverable,
  WorkRecord,
  Currency,
  TaskPriority,
  TaskStatus,
  MilestoneStatus,
  DeliverableStatus,
} from "@/types";
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

  lines.forEach((line, index) => {
    const match = line.match(/^\s*-\s*\[([ xX])\]\s*(.+)$/);
    if (match) {
      subtasks.push({
        id: `sub-${index}-${Date.now()}`,
        title: match[2].trim(),
        done: match[1].toLowerCase() === "x",
      });
    } else {
      cleanLines.push(line);
    }
  });

  return {
    cleanDescription: cleanLines.join("\n").trim(),
    subtasks,
  };
}

export function serializeSubtasks(
  cleanDescription: string,
  subtasks: SubtaskItem[]
): string {
  const checklist = subtasks
    .map((st) => `- [${st.done ? "x" : " "}] ${st.title}`)
    .join("\n");
  if (!cleanDescription.trim()) return checklist;
  if (!checklist) return cleanDescription.trim();
  return `${cleanDescription.trim()}\n\n${checklist}`;
}

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
  const { role, currentClient, user } = useAuth();
  const isManager = role === "manager" || role === "super_admin" || role === "admin" || !role;

  // Live queries & mutations scoped to this service
  const {
    tasks,
    createTask,
    updateTask,
    deleteTask,
    updateStatus: updateTaskStatus,
    isUpdating: isTaskUpdating,
  } = useTasks(service?.id, service?.project_id);

  const {
    milestones,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    updateMilestoneStatus,
  } = useMilestones(service?.id, service?.project_id);

  const {
    deliverables,
    createDeliverable,
    updateDeliverable,
    deleteDeliverable,
  } = useDeliverables(service?.id, service?.project_id);

  const { workRecords } = useWorkRecords(service?.id, service?.project_id);
  const { invoices } = useInvoices(service?.client_id);
  const { categories: checklistCategories, items: checklistItems } = useChecklists();

  // Active Tab inside modal: "tasks" | "milestones" | "deliverables" | "activity" | "scope"
  const [modalTab, setModalTab] = useState<"tasks" | "milestones" | "deliverables" | "activity" | "scope">(
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

  // Modals state for Tasks
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("medium");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskMilestoneId, setNewTaskMilestoneId] = useState("");
  const [newTaskSubtasks, setNewTaskSubtasks] = useState<string[]>([]);
  const [newTaskSubtaskInput, setNewTaskSubtaskInput] = useState("");

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskDesc, setEditTaskDesc] = useState("");
  const [editTaskPriority, setEditTaskPriority] = useState<TaskPriority>("medium");
  const [editTaskStatus, setEditTaskStatus] = useState<TaskStatus>("planned");
  const [editTaskDueDate, setEditTaskDueDate] = useState("");
  const [editTaskMilestoneId, setEditTaskMilestoneId] = useState("");
  const [editTaskSubtasks, setEditTaskSubtasks] = useState<SubtaskItem[]>([]);
  const [editTaskSubtaskInput, setEditTaskSubtaskInput] = useState("");

  const [inlineSubtaskInputs, setInlineSubtaskInputs] = useState<Record<string, string>>({});

  // Modals state for Milestones
  const [showAddMilestoneModal, setShowAddMilestoneModal] = useState(false);
  const [newMilestoneName, setNewMilestoneName] = useState("");
  const [newMilestoneDesc, setNewMilestoneDesc] = useState("");
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState("");
  const [newMilestoneStatus, setNewMilestoneStatus] = useState<MilestoneStatus>("not_started");

  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [editMilestoneName, setEditMilestoneName] = useState("");
  const [editMilestoneDesc, setEditMilestoneDesc] = useState("");
  const [editMilestoneDueDate, setEditMilestoneDueDate] = useState("");
  const [editMilestoneStatus, setEditMilestoneStatus] = useState<MilestoneStatus>("not_started");

  // Modals state for Deliverables
  const [showAddDeliverableModal, setShowAddDeliverableModal] = useState(false);
  const [newDelivTitle, setNewDelivTitle] = useState("");
  const [newDelivDesc, setNewDelivDesc] = useState("");
  const [newDelivType, setNewDelivType] = useState("Design File");
  const [newDelivStatus, setNewDelivStatus] = useState<DeliverableStatus>("draft");

  const [editingDeliverable, setEditingDeliverable] = useState<Deliverable | null>(null);
  const [editDelivTitle, setEditDelivTitle] = useState("");
  const [editDelivDesc, setEditDelivDesc] = useState("");
  const [editDelivType, setEditDelivType] = useState("Design File");
  const [editDelivStatus, setEditDelivStatus] = useState<DeliverableStatus>("draft");

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

  // Handlers for Tasks
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !service) return;
    try {
      const initialSubtasks: SubtaskItem[] = newTaskSubtasks.map((sub, i) => ({
        id: `sub-${Date.now()}-${i}`,
        title: sub,
        done: false,
      }));
      const fullDescription = serializeSubtasks(newTaskDesc, initialSubtasks);

      await createTask({
        project_id: service.project_id,
        service_id: service.id,
        client_id: service.client_id,
        title: newTaskTitle.trim(),
        description: fullDescription,
        status: "planned",
        priority: newTaskPriority,
        due_date: newTaskDueDate || null,
        milestone_id: newTaskMilestoneId || null,
        visibility: "client",
      });

      toast.success(`Task "${newTaskTitle}" created.`);
      setNewTaskTitle("");
      setNewTaskDesc("");
      setNewTaskPriority("medium");
      setNewTaskDueDate("");
      setNewTaskMilestoneId("");
      setNewTaskSubtasks([]);
      setNewTaskSubtaskInput("");
      setShowAddTaskModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create task.");
    }
  };

  const handleOpenEditTask = (t: Task) => {
    const { cleanDescription, subtasks } = parseSubtasks(t.description || "");
    setEditingTask(t);
    setEditTaskTitle(t.title);
    setEditTaskDesc(cleanDescription);
    setEditTaskPriority(t.priority || "medium");
    setEditTaskStatus(t.status || "planned");
    setEditTaskDueDate(t.due_date ? t.due_date.split("T")[0] : "");
    setEditTaskMilestoneId(t.milestone_id || "");
    setEditTaskSubtasks(subtasks);
    setEditTaskSubtaskInput("");
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    try {
      const fullDescription = serializeSubtasks(editTaskDesc, editTaskSubtasks);
      await updateTask({
        id: editingTask.id,
        updates: {
          title: editTaskTitle.trim(),
          description: fullDescription,
          priority: editTaskPriority,
          status: editTaskStatus,
          due_date: editTaskDueDate || null,
          milestone_id: editTaskMilestoneId || null,
        },
      });

      toast.success("Task updated successfully.");
      setEditingTask(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to update task.");
    }
  };

  const handleDeleteTask = async (id: string, title: string) => {
    if (!window.confirm(`Delete task "${title}"?`)) return;
    try {
      await deleteTask(id);
      toast.success("Task deleted.");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete task.");
    }
  };

  const handleClearAllTasks = async () => {
    if (serviceTasks.length === 0) return;
    if (!window.confirm(`Are you sure you want to clear all ${serviceTasks.length} tasks from this service stream?`)) return;
    try {
      for (const t of serviceTasks) {
        await deleteTask(t.id);
      }
      toast.success("All tasks cleared.");
    } catch (err: any) {
      toast.error("Failed to clear tasks.");
    }
  };

  const handleToggleSubtask = async (task: Task, subtaskId: string) => {
    const { cleanDescription, subtasks } = parseSubtasks(task.description || "");
    const updatedSubtasks = subtasks.map((st) =>
      st.id === subtaskId ? { ...st, done: !st.done } : st
    );
    const newDesc = serializeSubtasks(cleanDescription, updatedSubtasks);
    try {
      await updateTask({
        id: task.id,
        updates: { description: newDesc },
      });
    } catch (err: any) {
      toast.error("Failed to toggle subtask.");
    }
  };

  const handleAddSubtaskInline = async (task: Task) => {
    const text = inlineSubtaskInputs[task.id]?.trim();
    if (!text) return;
    const { cleanDescription, subtasks } = parseSubtasks(task.description || "");
    const updatedSubtasks = [
      ...subtasks,
      { id: `sub-${Date.now()}`, title: text, done: false },
    ];
    const newDesc = serializeSubtasks(cleanDescription, updatedSubtasks);
    try {
      await updateTask({
        id: task.id,
        updates: { description: newDesc },
      });
      setInlineSubtaskInputs((prev) => ({ ...prev, [task.id]: "" }));
    } catch (err: any) {
      toast.error("Failed to add subtask.");
    }
  };

  const handleDeleteSubtaskInline = async (task: Task, subtaskId: string) => {
    const { cleanDescription, subtasks } = parseSubtasks(task.description || "");
    const updatedSubtasks = subtasks.filter((st) => st.id !== subtaskId);
    const newDesc = serializeSubtasks(cleanDescription, updatedSubtasks);
    try {
      await updateTask({
        id: task.id,
        updates: { description: newDesc },
      });
    } catch (err: any) {
      toast.error("Failed to delete subtask.");
    }
  };

  const handleQuickTaskStatus = async (task: Task, newStatus: TaskStatus) => {
    try {
      await updateTaskStatus({ id: task.id, status: newStatus });
      toast.success(`Task set to ${newStatus.replace("_", " ")}`);
    } catch (err: any) {
      toast.error("Failed to update status.");
    }
  };

  // Handlers for Milestones
  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneName.trim() || !service) return;
    try {
      await createMilestone({
        project_id: service.project_id,
        service_id: service.id,
        client_id: service.client_id,
        name: newMilestoneName.trim(),
        title: newMilestoneName.trim(),
        description: newMilestoneDesc,
        due_date: newMilestoneDueDate || null,
        status: newMilestoneStatus,
        order_index: serviceMilestones.length,
      });

      toast.success(`Milestone "${newMilestoneName}" added.`);
      setNewMilestoneName("");
      setNewMilestoneDesc("");
      setNewMilestoneDueDate("");
      setNewMilestoneStatus("not_started");
      setShowAddMilestoneModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to add milestone.");
    }
  };

  const handleOpenEditMilestone = (m: Milestone) => {
    setEditingMilestone(m);
    setEditMilestoneName(m.name || m.title || "");
    setEditMilestoneDesc(m.description || "");
    setEditMilestoneDueDate(m.due_date ? m.due_date.split("T")[0] : "");
    setEditMilestoneStatus(m.status);
  };

  const handleUpdateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMilestone) return;
    try {
      await updateMilestone({
        id: editingMilestone.id,
        updates: {
          name: editMilestoneName,
          title: editMilestoneName,
          description: editMilestoneDesc,
          due_date: editMilestoneDueDate || null,
          status: editMilestoneStatus,
        },
      });

      toast.success("Milestone updated.");
      setEditingMilestone(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to update milestone.");
    }
  };

  const handleDeleteMilestone = async (id: string, name: string) => {
    if (!window.confirm(`Delete milestone "${name}"?`)) return;
    try {
      await deleteMilestone(id);
      toast.success("Milestone deleted.");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete milestone.");
    }
  };

  const handleClearAllMilestones = async () => {
    if (serviceMilestones.length === 0) return;
    if (!window.confirm(`Are you sure you want to clear all ${serviceMilestones.length} milestones?`)) return;
    try {
      for (const m of serviceMilestones) {
        await deleteMilestone(m.id);
      }
      toast.success("All milestones cleared.");
    } catch (err: any) {
      toast.error("Failed to clear milestones.");
    }
  };

  const handleInitializeDefaultMilestones = async () => {
    if (!service) return;
    try {
      const defaultPhases = [
        { name: "Phase 1: Discovery & Requirements", desc: "Catalog specifications alignment, brand asset intake, database schema definition, and prototype wireframes." },
        { name: "Phase 2: Production & Engineering", desc: "High-fidelity visual design, responsive frontend development, CMS wiring, and automated workflow implementation." },
        { name: "Phase 3: QA Validation & Sign-off", desc: "Cross-device stress testing, speed optimization, client approval walkthrough, and production deployment." },
      ];
      for (let i = 0; i < defaultPhases.length; i++) {
        await createMilestone({
          project_id: service.project_id,
          service_id: service.id,
          client_id: service.client_id,
          name: defaultPhases[i].name,
          title: defaultPhases[i].name,
          description: defaultPhases[i].desc,
          status: i === 0 ? "in_progress" : "not_started",
          order_index: i,
        });
      }
      toast.success("Initialized 3 standard phased milestones.");
    } catch (err: any) {
      toast.error("Failed to initialize milestones.");
    }
  };

  // Handlers for Deliverables
  const handleCreateDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDelivTitle.trim() || !service) return;
    try {
      await createDeliverable({
        project_id: service.project_id,
        service_id: service.id,
        client_id: service.client_id,
        name: newDelivTitle.trim(),
        description: newDelivDesc,
        type: newDelivType,
        status: newDelivStatus,
      });

      toast.success(`Deliverable "${newDelivTitle}" added.`);
      setNewDelivTitle("");
      setNewDelivDesc("");
      setNewDelivType("Design File");
      setNewDelivStatus("draft");
      setShowAddDeliverableModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to add deliverable.");
    }
  };

  const handleOpenEditDeliverable = (d: Deliverable) => {
    setEditingDeliverable(d);
    setEditDelivTitle(d.name || (d as any).title || "");
    setEditDelivDesc(d.description || "");
    setEditDelivType(d.type || "Design File");
    setEditDelivStatus(d.status);
  };

  const handleUpdateDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeliverable) return;
    try {
      await updateDeliverable({
        id: editingDeliverable.id,
        updates: {
          name: editDelivTitle.trim(),
          description: editDelivDesc,
          type: editDelivType,
          status: editDelivStatus,
        },
      });

      toast.success("Deliverable updated.");
      setEditingDeliverable(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to update deliverable.");
    }
  };

  const handleDeleteDeliverable = async (id: string, name: string) => {
    if (!window.confirm(`Delete deliverable "${name}"?`)) return;
    try {
      await deleteDeliverable(id);
      toast.success("Deliverable deleted.");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete deliverable.");
    }
  };

  // Filter deliverables
  const serviceDeliverables = useMemo(() => {
    if (!service) return [];
    return deliverables.filter(
      (d) => d.service_id === service.id || d.project_id === service.project_id
    );
  }, [deliverables, service]);

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
                {serviceTasks.length > 0 ? `${completedTasksCount} / ${serviceTasks.length}` : "0 / 0"}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground font-semibold">
                {serviceTasks.length > 0 ? `${taskCompletionPct}% Done` : "Empty"}
              </span>
            </div>
            <ProgressBar value={serviceTasks.length > 0 ? taskCompletionPct : 0} showValue={false} className="h-1.5" />
          </div>

          <div className="p-3 rounded-xl bg-secondary/30 border border-border/80 space-y-1">
            <span className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1">
              <Layers className="w-3 h-3 text-emerald-500" />
              Milestones
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-base font-bold font-mono text-foreground">
                {serviceMilestones.length > 0 ? `${completedMilestonesCount} / ${serviceMilestones.length}` : "0 / 0"}
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
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

          <div className="p-3 rounded-xl bg-secondary/30 border border-border/80 space-y-1">
            <span className="text-[10px] font-mono uppercase text-muted-foreground flex items-center gap-1">
              <FileCheck2 className="w-3 h-3 text-purple-500" />
              Deliverables
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-base font-bold font-mono text-foreground">
                {serviceDeliverables.length > 0 ? `${approvedDeliverablesCount} / ${serviceDeliverables.length}` : "0 / 0"}
              </span>
              <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-semibold">
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
              {/* Search, Status Filters & Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 p-1 bg-secondary/50 rounded-lg border border-border w-fit text-xs flex-wrap">
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
                  <div className="relative flex-1 sm:w-56">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search sub-tasks..."
                      value={taskSearch}
                      onChange={(e) => setTaskSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-secondary/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary"
                    />
                  </div>

                  <button
                    onClick={() => setShowAddTaskModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Task
                  </button>

                  {serviceTasks.length > 0 && (
                    <button
                      onClick={handleClearAllTasks}
                      className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                      title="Clear all tasks from this service stream"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Tasks List */}
              {filteredTasks.length === 0 ? (
                <div className="p-8 text-center bg-secondary/20 rounded-xl border border-dashed border-border space-y-3">
                  <CheckSquare className="w-8 h-8 text-muted-foreground mx-auto" />
                  <div className="text-xs font-bold text-foreground">No Sub-Tasks in this Stream</div>
                  <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                    {taskSearch || taskFilter !== "all"
                      ? "No tasks match your current filter criteria."
                      : "Add your first task to track work items, checkpoints, and execution subtasks."}
                  </p>
                  <button
                    onClick={() => setShowAddTaskModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add First Sub-Task
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTasks.map((task) => {
                    const isExpanded = !!expandedTaskIds[task.id];
                    const isDone = task.status === "completed";
                    const { cleanDescription, subtasks } = parseSubtasks(task.description || "");
                    const completedSubCount = subtasks.filter((s) => s.done).length;
                    const subtaskPct = subtasks.length > 0 ? Math.round((completedSubCount / subtasks.length) * 100) : 0;
                    const linkedMilestone = serviceMilestones.find((m) => m.id === task.milestone_id);

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
                        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div
                            onClick={() => toggleTaskExpand(task.id)}
                            className="space-y-1 flex-1 min-w-0 cursor-pointer"
                          >
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

                            {cleanDescription && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {cleanDescription}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            {/* Quick status selector */}
                            <select
                              value={task.status}
                              onChange={(e) => handleQuickTaskStatus(task, e.target.value as TaskStatus)}
                              className="text-xs bg-secondary/50 font-semibold border border-border rounded-lg px-2 py-1 text-foreground focus:outline-hidden cursor-pointer"
                            >
                              <option value="planned">Planned</option>
                              <option value="in_progress">In Progress</option>
                              <option value="review">Review</option>
                              <option value="completed">Completed</option>
                              <option value="blocked">Blocked</option>
                            </select>

                            {/* Edit Button */}
                            <button
                              onClick={() => handleOpenEditTask(task)}
                              className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                              title="Edit task & subtasks"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteTask(task.id, task.title)}
                              className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                              title="Delete task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Accordion Expand Button */}
                            <button
                              type="button"
                              onClick={() => toggleTaskExpand(task.id)}
                              className="p-1.5 rounded-lg border border-border bg-secondary/30 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                              title="Toggle Subtask Details"
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
                              {cleanDescription && (
                                <div className="space-y-1">
                                  <div className="text-[10px] font-mono uppercase text-muted-foreground font-bold">
                                    Description & Context
                                  </div>
                                  <p className="text-xs text-foreground leading-relaxed bg-card p-3 rounded-lg border border-border whitespace-pre-wrap">
                                    {cleanDescription}
                                  </p>
                                </div>
                              )}

                              {/* Interactive Subtasks Checklist */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-muted-foreground font-bold">
                                  <span className="flex items-center gap-1.5">
                                    <CheckSquare className="w-3.5 h-3.5 text-primary" />
                                    Subtask Checklist ({completedSubCount}/{subtasks.length})
                                  </span>
                                  <span>{subtasks.length > 0 ? `${subtaskPct}% Complete` : "No checklist steps"}</span>
                                </div>

                                {subtasks.length > 0 && (
                                  <div className="w-full bg-secondary/60 h-1.5 rounded-full overflow-hidden">
                                    <div
                                      className="bg-primary h-full transition-all duration-300"
                                      style={{ width: `${subtaskPct}%` }}
                                    />
                                  </div>
                                )}

                                {subtasks.length > 0 && (
                                  <div className="space-y-1 bg-card p-2 rounded-xl border border-border/70">
                                    {subtasks.map((st) => (
                                      <div
                                        key={st.id}
                                        className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-secondary/40 group transition-colors"
                                      >
                                        <button
                                          type="button"
                                          onClick={() => handleToggleSubtask(task, st.id)}
                                          className="flex items-center gap-2 text-left cursor-pointer flex-1"
                                        >
                                          <div
                                            className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                                              st.done
                                                ? "bg-primary border-primary text-primary-foreground"
                                                : "border-border bg-card group-hover:border-primary/60"
                                            }`}
                                          >
                                            {st.done && <Check className="w-3 h-3 stroke-[3]" />}
                                          </div>
                                          <span
                                            className={`text-xs ${
                                              st.done ? "line-through text-muted-foreground" : "text-foreground"
                                            }`}
                                          >
                                            {st.title}
                                          </span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => handleDeleteSubtaskInline(task, st.id)}
                                          className="text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive p-1 transition-all cursor-pointer"
                                          title="Delete subtask step"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Inline Add Subtask Step */}
                                <div className="flex items-center gap-2 pt-1">
                                  <input
                                    type="text"
                                    value={inlineSubtaskInputs[task.id] || ""}
                                    onChange={(e) =>
                                      setInlineSubtaskInputs((prev) => ({ ...prev, [task.id]: e.target.value }))
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddSubtaskInline(task);
                                      }
                                    }}
                                    placeholder="+ Add a subtask step (press Enter)..."
                                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-border/80 bg-card text-foreground placeholder:text-muted-foreground/70 focus:outline-hidden focus:border-primary"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleAddSubtaskInline(task)}
                                    className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                                  >
                                    Add
                                  </button>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-card border border-border">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-500" />
                    Phased Milestone Architecture
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Custom milestones tracking completion stages and phase delivery.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setShowAddMilestoneModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Milestone
                  </button>

                  {serviceMilestones.length > 0 && (
                    <button
                      onClick={handleClearAllMilestones}
                      className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                      title="Clear all milestones"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {serviceMilestones.length === 0 ? (
                <div className="p-8 text-center bg-secondary/20 rounded-xl border border-dashed border-border space-y-3">
                  <Layers className="w-8 h-8 text-muted-foreground mx-auto" />
                  <div className="text-xs font-bold text-foreground">No Milestones Defined Yet</div>
                  <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                    Define custom milestones or initialize the agency's 3-phase delivery roadmap.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      onClick={() => setShowAddMilestoneModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Milestone
                    </button>
                    <button
                      onClick={handleInitializeDefaultMilestones}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-secondary text-foreground transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Initialize 3-Phase Template
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {serviceMilestones.map((m, idx) => (
                    <div
                      key={m.id}
                      className="p-4 rounded-xl bg-card border border-border shadow-2xs space-y-2 hover:border-border/90 transition-all"
                    >
                      <div className="flex items-center justify-between text-xs gap-3">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <button
                            onClick={() =>
                              updateMilestoneStatus(
                                m.id,
                                m.status === "completed" ? "in_progress" : "completed"
                              )
                            }
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 cursor-pointer transition-colors ${
                              m.status === "completed"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                                : m.status === "in_progress"
                                ? "bg-blue-100 text-blue-800 border border-blue-300 animate-pulse dark:bg-blue-950 dark:text-blue-300"
                                : "bg-secondary text-muted-foreground border border-border"
                            }`}
                            title="Click to toggle completion status"
                          >
                            {m.status === "completed" ? "✓" : idx + 1}
                          </button>
                          <div className="min-w-0 flex-1">
                            <h5 className="font-bold text-foreground text-xs truncate">
                              {m.name || m.title}
                            </h5>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <StatusBadge status={m.status} />

                          <button
                            onClick={() => handleOpenEditMilestone(m)}
                            className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                            title="Edit milestone"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteMilestone(m.id, m.name || m.title || "Milestone")}
                            className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                            title="Delete milestone"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {m.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed pl-8">
                          {m.description}
                        </p>
                      )}

                      {m.due_date && (
                        <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-1 pl-8 pt-1">
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-card border border-border">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-purple-500" />
                    Project Deliverables & Vault Assets
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Review and download completed work products, design systems, and client approvals.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setShowAddDeliverableModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Deliverable
                  </button>

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
              </div>

              {serviceDeliverables.length === 0 ? (
                <div className="p-8 text-center bg-secondary/20 rounded-xl border border-dashed border-border space-y-3">
                  <FileCheck2 className="w-8 h-8 text-muted-foreground mx-auto" />
                  <div className="text-xs font-bold text-foreground">No Deliverables Published Yet</div>
                  <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                    Publish design deliverables, brand guides, code repositories, or documents for review.
                  </p>
                  <button
                    onClick={() => setShowAddDeliverableModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add First Deliverable
                  </button>
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
                              v{deliv.current_version || 1}.0 • {deliv.type || (deliv as any).file_type || "Asset"}
                            </span>
                            <StatusBadge status={deliv.status} />
                          </div>
                          <h5 className="text-sm font-bold text-foreground">{deliv.name || (deliv as any).title}</h5>
                          {deliv.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {deliv.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-border/70 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {(deliv as any).file_url ? (
                              <a
                                href={(deliv as any).file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Download File
                              </a>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">Verified Asset</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditDeliverable(deliv)}
                              className="p-1 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                              title="Edit deliverable"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteDeliverable(deliv.id, deliv.name || (deliv as any).title)}
                              className="p-1 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                              title="Delete deliverable"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
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

      {/* ======================================================== */}
      {/* MODALS: ADD & EDIT TASKS, MILESTONES, DELIVERABLES        */}
      {/* ======================================================== */}

      {/* 1. Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">Add New Sub-Task</h3>
                <p className="text-xs text-muted-foreground">{service.name}</p>
              </div>
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Design responsive UI components"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Scope details, acceptance requirements, or notes..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Target Date</label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Link to Milestone</label>
                <select
                  value={newTaskMilestoneId}
                  onChange={(e) => setNewTaskMilestoneId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                >
                  <option value="">None (Independent Sub-Task)</option>
                  {serviceMilestones.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name || m.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subtask steps checklist */}
              <div className="pt-2 border-t border-border/60 space-y-2">
                <label className="block text-xs font-semibold text-foreground">
                  Subtask Steps ({newTaskSubtasks.length})
                </label>
                {newTaskSubtasks.length > 0 && (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {newTaskSubtasks.map((st, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-secondary/30 text-xs text-foreground"
                      >
                        <span>• {st}</span>
                        <button
                          type="button"
                          onClick={() => setNewTaskSubtasks((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-muted-foreground hover:text-destructive p-0.5 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTaskSubtaskInput}
                    onChange={(e) => setNewTaskSubtaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (newTaskSubtaskInput.trim()) {
                          setNewTaskSubtasks((prev) => [...prev, newTaskSubtaskInput.trim()]);
                          setNewTaskSubtaskInput("");
                        }
                      }
                    }}
                    placeholder="Add step (e.g. Verify wireframe with client)..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newTaskSubtaskInput.trim()) {
                        setNewTaskSubtasks((prev) => [...prev, newTaskSubtaskInput.trim()]);
                        setNewTaskSubtaskInput("");
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-secondary text-foreground hover:bg-secondary/80 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg border border-border cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTaskUpdating}
                  className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isTaskUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Create Sub-Task
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 2. Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">Edit Sub-Task</h3>
                <p className="text-xs text-muted-foreground">{editingTask.title}</p>
              </div>
              <button
                onClick={() => setEditingTask(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateTask} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={editTaskTitle}
                  onChange={(e) => setEditTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Status</label>
                  <select
                    value={editTaskStatus}
                    onChange={(e) => setEditTaskStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  >
                    <option value="planned">Planned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Priority</label>
                  <select
                    value={editTaskPriority}
                    onChange={(e) => setEditTaskPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Target Date</label>
                  <input
                    type="date"
                    value={editTaskDueDate}
                    onChange={(e) => setEditTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Linked Milestone</label>
                  <select
                    value={editTaskMilestoneId}
                    onChange={(e) => setEditTaskMilestoneId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  >
                    <option value="">None (Independent Sub-Task)</option>
                    {serviceMilestones.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name || m.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subtasks inside Edit Modal */}
              <div className="pt-2 border-t border-border/60 space-y-2">
                <label className="block text-xs font-semibold text-foreground">
                  Subtask Steps ({editTaskSubtasks.filter((s) => s.done).length}/{editTaskSubtasks.length} Done)
                </label>
                {editTaskSubtasks.length > 0 && (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {editTaskSubtasks.map((st) => (
                      <div
                        key={st.id}
                        className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-secondary/30 text-xs"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setEditTaskSubtasks((prev) =>
                              prev.map((item) => (item.id === st.id ? { ...item, done: !item.done } : item))
                            )
                          }
                          className="flex items-center gap-2 cursor-pointer text-left flex-1"
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] font-bold ${
                              st.done ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card"
                            }`}
                          >
                            {st.done && "✓"}
                          </div>
                          <span className={st.done ? "line-through text-muted-foreground" : "text-foreground"}>
                            {st.title}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEditTaskSubtasks((prev) => prev.filter((item) => item.id !== st.id))
                          }
                          className="text-muted-foreground hover:text-destructive p-0.5 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editTaskSubtaskInput}
                    onChange={(e) => setEditTaskSubtaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (editTaskSubtaskInput.trim()) {
                          setEditTaskSubtasks((prev) => [
                            ...prev,
                            { id: `sub-${Date.now()}`, title: editTaskSubtaskInput.trim(), done: false },
                          ]);
                          setEditTaskSubtaskInput("");
                        }
                      }
                    }}
                    placeholder="Add a step..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (editTaskSubtaskInput.trim()) {
                        setEditTaskSubtasks((prev) => [
                          ...prev,
                          { id: `sub-${Date.now()}`, title: editTaskSubtaskInput.trim(), done: false },
                        ]);
                        setEditTaskSubtaskInput("");
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-secondary text-foreground hover:bg-secondary/80 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg border border-border cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTaskUpdating}
                  className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isTaskUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 3. Add Milestone Modal */}
      {showAddMilestoneModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">Add Milestone</h3>
                <p className="text-xs text-muted-foreground">{service.name}</p>
              </div>
              <button
                onClick={() => setShowAddMilestoneModal(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMilestone} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Milestone Name</label>
                <input
                  type="text"
                  required
                  value={newMilestoneName}
                  onChange={(e) => setNewMilestoneName(e.target.value)}
                  placeholder="e.g. Design & Prototype Approval"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newMilestoneDesc}
                  onChange={(e) => setNewMilestoneDesc(e.target.value)}
                  placeholder="Phase goals, completion criteria..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Target Sign-off</label>
                  <input
                    type="date"
                    value={newMilestoneDueDate}
                    onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Initial Status</label>
                  <select
                    value={newMilestoneStatus}
                    onChange={(e) => setNewMilestoneStatus(e.target.value as MilestoneStatus)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMilestoneModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg border border-border cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors cursor-pointer"
                >
                  Create Milestone
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 4. Edit Milestone Modal */}
      {editingMilestone && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">Edit Milestone</h3>
                <p className="text-xs text-muted-foreground">{editingMilestone.name || editingMilestone.title}</p>
              </div>
              <button
                onClick={() => setEditingMilestone(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateMilestone} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Milestone Name</label>
                <input
                  type="text"
                  required
                  value={editMilestoneName}
                  onChange={(e) => setEditMilestoneName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editMilestoneDesc}
                  onChange={(e) => setEditMilestoneDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Target Sign-off</label>
                  <input
                    type="date"
                    value={editMilestoneDueDate}
                    onChange={(e) => setEditMilestoneDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Status</label>
                  <select
                    value={editMilestoneStatus}
                    onChange={(e) => setEditMilestoneStatus(e.target.value as MilestoneStatus)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMilestone(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg border border-border cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors cursor-pointer"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 5. Add Deliverable Modal */}
      {showAddDeliverableModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">Add Deliverable</h3>
                <p className="text-xs text-muted-foreground">{service.name}</p>
              </div>
              <button
                onClick={() => setShowAddDeliverableModal(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDeliverable} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Deliverable Title</label>
                <input
                  type="text"
                  required
                  value={newDelivTitle}
                  onChange={(e) => setNewDelivTitle(e.target.value)}
                  placeholder="e.g. High-Fidelity Figma Prototype"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDelivDesc}
                  onChange={(e) => setNewDelivDesc(e.target.value)}
                  placeholder="Specifications, links, or notes..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Asset Type</label>
                  <select
                    value={newDelivType}
                    onChange={(e) => setNewDelivType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  >
                    <option value="Design File">Design File</option>
                    <option value="Document">Document</option>
                    <option value="Code Repository">Code Repository</option>
                    <option value="Video Asset">Video Asset</option>
                    <option value="Archive">Archive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Status</label>
                  <select
                    value={newDelivStatus}
                    onChange={(e) => setNewDelivStatus(e.target.value as DeliverableStatus)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  >
                    <option value="draft">Draft</option>
                    <option value="awaiting_review">Awaiting Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Revision Requested</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDeliverableModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg border border-border cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors cursor-pointer"
                >
                  Add Deliverable
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 6. Edit Deliverable Modal */}
      {editingDeliverable && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">Edit Deliverable</h3>
                <p className="text-xs text-muted-foreground">{editingDeliverable.name || (editingDeliverable as any).title}</p>
              </div>
              <button
                onClick={() => setEditingDeliverable(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateDeliverable} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Deliverable Title</label>
                <input
                  type="text"
                  required
                  value={editDelivTitle}
                  onChange={(e) => setEditDelivTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editDelivDesc}
                  onChange={(e) => setEditDelivDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Asset Type</label>
                  <select
                    value={editDelivType}
                    onChange={(e) => setEditDelivType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  >
                    <option value="Design File">Design File</option>
                    <option value="Document">Document</option>
                    <option value="Code Repository">Code Repository</option>
                    <option value="Video Asset">Video Asset</option>
                    <option value="Archive">Archive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Status</label>
                  <select
                    value={editDelivStatus}
                    onChange={(e) => setEditDelivStatus(e.target.value as DeliverableStatus)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  >
                    <option value="draft">Draft</option>
                    <option value="awaiting_review">Awaiting Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Revision Requested</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDeliverable(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg border border-border cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors cursor-pointer"
                >
                  Save Deliverable
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
export default ServiceProgressDetailModal;
