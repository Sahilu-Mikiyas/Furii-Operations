import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { useProjects } from "@/hooks/useProjects";
import { useServices } from "@/hooks/useServices";
import { useTasks } from "@/hooks/useTasks";
import { useDeliverables } from "@/hooks/useDeliverables";
import { useApprovals } from "@/hooks/useApprovals";
import { useWorkRecords } from "@/hooks/useWorkRecords";
import { useFiles } from "@/hooks/useFiles";
import { useClients } from "@/hooks/useClients";
import { useMilestones } from "@/hooks/useMilestones";
import { useDecisions } from "@/hooks/useDecisions";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  Layers,
  CheckCircle2,
  FileCheck2,
  CheckSquare,
  FolderOpen,
  History,
  Scale,
  Plus,
  Download,
  Upload,
  Loader2,
  Trash2,
  Edit3,
  X,
  Building2,
  ListTodo,
  Calendar,
  AlertCircle,
  Clock,
  Zap,
  ArrowRight,
  Check,
  Search,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type {
  ServiceType,
  ServiceStatus,
  ProjectStatus,
  MilestoneStatus,
  Task,
  Milestone,
  Deliverable,
  DeliverableStatus,
  FileCategory,
  TaskStatus,
  TaskPriority,
  Visibility,
} from "@/types";

export interface SubtaskItem {
  id: string;
  title: string;
  done: boolean;
}

export function parseSubtasks(desc?: string | null): { cleanDesc: string; subtasks: SubtaskItem[] } {
  if (!desc) return { cleanDesc: "", subtasks: [] };
  const lines = desc.split("\n");
  const subtasks: SubtaskItem[] = [];
  const descLines: string[] = [];

  lines.forEach((line, idx) => {
    const doneMatch = line.match(/^[-*]\s+\[([ xX])\]\s+(.*)$/);
    if (doneMatch) {
      subtasks.push({
        id: `st-${idx}`,
        done: doneMatch[1].toLowerCase() === "x",
        title: doneMatch[2].trim(),
      });
    } else {
      descLines.push(line);
    }
  });

  return {
    cleanDesc: descLines.join("\n").trim(),
    subtasks,
  };
}

export function serializeSubtasks(cleanDesc: string, subtasks: SubtaskItem[]): string {
  const subtaskBlock = subtasks
    .map((st) => `- [${st.done ? "x" : " "}] ${st.title}`)
    .join("\n");
  if (!cleanDesc && !subtaskBlock) return "";
  if (!cleanDesc) return subtaskBlock;
  if (!subtaskBlock) return cleanDesc;
  return `${cleanDesc}\n\n${subtaskBlock}`;
}

const SERVICE_TYPES: { value: ServiceType; label: string }[] = [
  { value: "website", label: "Website Design & Dev" },
  { value: "software", label: "Software & Systems" },
  { value: "branding", label: "Branding & Identity" },
  { value: "seo", label: "Search Engine Optimization (SEO)" },
  { value: "google_business", label: "Google Business Profile" },
  { value: "social_media", label: "Social Media Management" },
  { value: "content_production", label: "Content Strategy & Production" },
  { value: "photography", label: "Photography" },
  { value: "videography", label: "Videography" },
  { value: "video_editing", label: "Video Editing & Post-Production" },
  { value: "marketing", label: "Digital Marketing & Ads" },
  { value: "consulting", label: "Digital Advisory & Consulting" },
  { value: "maintenance", label: "System Maintenance & Support" },
];

export function ProjectsPage() {
  const { role, currentClient } = useAuth();
  const isManager = role === "manager" || role === "super_admin" || role === "admin";
  const targetClientId = role === "client_owner" || role === "client_member" ? currentClient?.id : undefined;

  const { clients } = useClients();
  const { projects, isLoading: projectsLoading, createProject, updateProject, deleteProject, isCreating: isCreatingProj } = useProjects(targetClientId);

  // Client workspace separation
  const [selectedClientId, setSelectedClientId] = useState<string>("all");

  const filteredProjects = useMemo(() => {
    if (selectedClientId === "all") return projects;
    return projects.filter((p) => p.client_id === selectedClientId);
  }, [projects, selectedClientId]);

  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  useEffect(() => {
    if (filteredProjects.length > 0) {
      if (!selectedProjectId || !filteredProjects.some((p) => p.id === selectedProjectId)) {
        setSelectedProjectId(filteredProjects[0].id);
      }
    } else {
      setSelectedProjectId("");
    }
  }, [filteredProjects, selectedProjectId]);

  const selectedProject = filteredProjects.find((p) => p.id === selectedProjectId) || filteredProjects[0];
  const currentProjectClient = clients.find((c) => c.id === selectedProject?.client_id);

  const {
    services,
    isLoading: servicesLoading,
    createService,
    deleteService,
    updateProgress,
    isCreatingService,
  } = useServices(selectedProject?.id);

  const [selectedServiceId, setSelectedServiceId] = useState<string>("");

  useEffect(() => {
    if (services.length > 0) {
      if (!selectedServiceId || !services.some((s) => s.id === selectedServiceId)) {
        setSelectedServiceId(services[0].id);
      }
    } else {
      setSelectedServiceId("");
    }
  }, [services, selectedServiceId]);

  const selectedService = services.find((s) => s.id === selectedServiceId) || services[0];

  const [activeTab, setActiveTab] = useState<
    "overview" | "work" | "tasks" | "deliverables" | "approvals" | "decisions" | "files"
  >("overview");

  // Live queries scoped to current service & project
  const {
    tasks,
    updateStatus: updateTaskStatus,
    createTask,
    updateTask,
    deleteTask,
    isUpdating: isTaskUpdating,
  } = useTasks(selectedService?.id, selectedProject?.id);
  const {
    deliverables,
    createDeliverable,
    uploadNewVersion,
    updateDeliverable,
    deleteDeliverable,
    isUploading: isDeliverableUploading,
    isCreating: isDeliverableCreating,
  } = useDeliverables(selectedService?.id, selectedProject?.id);
  const { approvals } = useApprovals(targetClientId);
  const { workRecords, createWorkRecord, deleteWorkRecord, isCreating: isCreatingRecord } = useWorkRecords(selectedService?.id, selectedProject?.id);
  const { files } = useFiles(selectedProject?.client_id, selectedService?.id);
  const {
    milestones: serviceMilestones,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    updateMilestoneStatus,
  } = useMilestones(selectedService?.id, selectedProject?.id);
  const { decisions: serviceDecisions, createDecision, deleteDecision } = useDecisions(selectedService?.id, selectedProject?.id);
  const serviceApprovals = approvals.filter((a) => a.service_id === selectedService?.id || a.project_id === selectedProject?.id);

  // Modal States
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [showNewServiceModal, setShowNewServiceModal] = useState(false);
  const [showEditServiceModal, setShowEditServiceModal] = useState(false);
  const [showAddMilestoneModal, setShowAddMilestoneModal] = useState(false);
  const [showAddDecisionModal, setShowAddDecisionModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);

  // Milestone Edit Modal State
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [editMilestoneName, setEditMilestoneName] = useState("");
  const [editMilestoneDesc, setEditMilestoneDesc] = useState("");
  const [editMilestoneDueDate, setEditMilestoneDueDate] = useState("");
  const [editMilestoneStatus, setEditMilestoneStatus] = useState<MilestoneStatus>("not_started");

  // Task & Subtask Management States
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("medium");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskMilestoneId, setNewTaskMilestoneId] = useState("");
  const [newTaskVisibility, setNewTaskVisibility] = useState<Visibility>("client");
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

  const [taskSearch, setTaskSearch] = useState("");
  const [taskFilterStatus, setTaskFilterStatus] = useState<string>("all");
  const [inlineSubtaskInputs, setInlineSubtaskInputs] = useState<Record<string, string>>({});

  // New Project Form
  const [newProjClientId, setNewProjClientId] = useState("");
  const [newProjName, setNewProjName] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [newProjBudget, setNewProjBudget] = useState(0);
  const [newProjCurrency, setNewProjCurrency] = useState("ETB");
  const [newProjStatus, setNewProjStatus] = useState<ProjectStatus>("active");
  const [newProjStartDate, setNewProjStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [newProjEndDate, setNewProjEndDate] = useState("");

  // Edit Project Form
  const [editProjName, setEditProjName] = useState("");
  const [editProjDesc, setEditProjDesc] = useState("");
  const [editProjBudget, setEditProjBudget] = useState(0);
  const [editProjCurrency, setEditProjCurrency] = useState("ETB");
  const [editProjStatus, setEditProjStatus] = useState<ProjectStatus>("active");
  const [editProjStartDate, setEditProjStartDate] = useState("");
  const [editProjEndDate, setEditProjEndDate] = useState("");

  // New Service Form
  const [newSrvType, setNewSrvType] = useState<ServiceType>("website");
  const [newSrvName, setNewSrvName] = useState("");
  const [newSrvDesc, setNewSrvDesc] = useState("");
  const [newSrvPhase, setNewSrvPhase] = useState("Discovery & Planning");
  const [newSrvStatus, setNewSrvStatus] = useState<ServiceStatus>("in_progress");

  // Edit Service Form
  const [editSrvName, setEditSrvName] = useState("");
  const [editSrvDesc, setEditSrvDesc] = useState("");
  const [editSrvPhase, setEditSrvPhase] = useState("");
  const [editSrvStatus, setEditSrvStatus] = useState<ServiceStatus>("in_progress");
  const [editSrvProgress, setEditSrvProgress] = useState(0);

  // New Milestone Form
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newMilestoneDesc, setNewMilestoneDesc] = useState("");
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState("");
  const [newMilestoneStatus, setNewMilestoneStatus] = useState<MilestoneStatus>("not_started");

  // New Decision Form
  const [newDecisionTitle, setNewDecisionTitle] = useState("");
  const [newDecisionDesc, setNewDecisionDesc] = useState("");
  const [newDecisionDate, setNewDecisionDate] = useState(new Date().toISOString().split("T")[0]);
  const [newDecisionMadeBy, setNewDecisionMadeBy] = useState("Operations Lead");

  // New Record Form
  const [recordTitle, setRecordTitle] = useState("");
  const [recordDesc, setRecordDesc] = useState("");
  const [recordChanges, setRecordChanges] = useState("");

  // New Deliverable Form
  const [showAddDeliverableModal, setShowAddDeliverableModal] = useState(false);
  const [newDelivName, setNewDelivName] = useState("");
  const [newDelivDesc, setNewDelivDesc] = useState("");
  const [newDelivType, setNewDelivType] = useState("Document");
  const [newDelivCategory, setNewDelivCategory] = useState<FileCategory>("pdf");
  const [newDelivStatus, setNewDelivStatus] = useState<DeliverableStatus>("awaiting_review");
  const [newDelivFile, setNewDelivFile] = useState<File | null>(null);
  const [newDelivNotes, setNewDelivNotes] = useState("");

  // Upload Revision Form
  const [uploadDeliverableId, setUploadDeliverableId] = useState<string | null>(null);
  const [revisionFile, setRevisionFile] = useState<File | null>(null);
  const [revisionNotes, setRevisionNotes] = useState("");

  // Edit Deliverable Form
  const [editingDeliverable, setEditingDeliverable] = useState<Deliverable | null>(null);
  const [editDelivName, setEditDelivName] = useState("");
  const [editDelivDesc, setEditDelivDesc] = useState("");
  const [editDelivStatus, setEditDelivStatus] = useState<DeliverableStatus>("draft");

  // Open Edit Project Modal
  const openEditProject = () => {
    if (!selectedProject) return;
    setEditProjName(selectedProject.name);
    setEditProjDesc(selectedProject.description || "");
    setEditProjBudget(selectedProject.budget || 0);
    setEditProjCurrency(selectedProject.budget_currency || "ETB");
    setEditProjStatus(selectedProject.status || "active");
    setEditProjStartDate(selectedProject.start_date || "");
    setEditProjEndDate(selectedProject.end_date || "");
    setShowEditProjectModal(true);
  };

  // Open Edit Service Modal
  const openEditService = () => {
    if (!selectedService) return;
    setEditSrvName(selectedService.name);
    setEditSrvDesc(selectedService.description || "");
    setEditSrvPhase(selectedService.current_phase || "");
    setEditSrvStatus(selectedService.status || "in_progress");
    setEditSrvProgress(selectedService.progress || 0);
    setShowEditServiceModal(true);
  };

  // Handlers
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) {
      toast.error("Project name is required.");
      return;
    }
    const targetClient = newProjClientId || clients[0]?.id;
    if (!targetClient) {
      toast.error("Please onboard a client before creating a project.");
      return;
    }

    try {
      const created = await createProject({
        client_id: targetClient,
        name: newProjName,
        description: newProjDesc,
        budget: Number(newProjBudget) || 0,
        budget_currency: newProjCurrency,
        status: newProjStatus,
        start_date: newProjStartDate || undefined,
        end_date: newProjEndDate || undefined,
      });
      toast.success(`Project "${newProjName}" initialized.`);
      setNewProjName("");
      setNewProjDesc("");
      setNewProjBudget(0);
      setShowNewProjectModal(false);
      if (created?.id) setSelectedProjectId(created.id);
    } catch (err: any) {
      toast.error(err.message || "Failed to create project.");
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    try {
      await updateProject({
        id: selectedProject.id,
        updates: {
          name: editProjName,
          description: editProjDesc,
          budget: Number(editProjBudget),
          budget_currency: editProjCurrency,
          status: editProjStatus,
          start_date: editProjStartDate || null,
          end_date: editProjEndDate || null,
        },
      });
      toast.success("Project updated successfully.");
      setShowEditProjectModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update project.");
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    if (!window.confirm(`Are you sure you want to delete project "${selectedProject.name}"? This action cannot be undone.`)) return;
    try {
      await deleteProject(selectedProject.id);
      toast.success(`Project "${selectedProject.name}" deleted.`);
      setSelectedProjectId("");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete project.");
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) {
      toast.error("Please select an active project first.");
      return;
    }
    const finalName = newSrvName.trim() || SERVICE_TYPES.find((s) => s.value === newSrvType)?.label || "New Service";

    try {
      const created = await createService({
        project_id: selectedProject.id,
        client_id: selectedProject.client_id,
        service_type: newSrvType,
        name: finalName,
        description: newSrvDesc,
        current_phase: newSrvPhase,
        status: newSrvStatus,
        progress: 0,
      });
      toast.success(`Service workspace "${finalName}" launched.`);
      setNewSrvName("");
      setNewSrvDesc("");
      setShowNewServiceModal(false);
      if (created?.id) setSelectedServiceId(created.id);
    } catch (err: any) {
      toast.error(err.message || "Failed to launch service workspace.");
    }
  };

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    try {
      await updateProgress({
        id: selectedService.id,
        progress: Number(editSrvProgress),
        status: editSrvStatus,
        current_phase: editSrvPhase,
      });
      toast.success("Service workspace updated.");
      setShowEditServiceModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update service workspace.");
    }
  };

  const handleDeleteService = async () => {
    if (!selectedService) return;
    if (!window.confirm(`Are you sure you want to delete service "${selectedService.name}"?`)) return;
    try {
      await deleteService(selectedService.id);
      toast.success(`Service "${selectedService.name}" deleted.`);
      setSelectedServiceId("");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete service.");
    }
  };

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim() || !selectedService || !selectedProject) return;
    try {
      await createMilestone({
        project_id: selectedProject.id,
        service_id: selectedService.id,
        client_id: selectedProject.client_id,
        title: newMilestoneTitle,
        description: newMilestoneDesc,
        due_date: newMilestoneDueDate || null,
        status: newMilestoneStatus,
      });
      toast.success(`Milestone "${newMilestoneTitle}" added.`);
      setNewMilestoneTitle("");
      setNewMilestoneDesc("");
      setNewMilestoneDueDate("");
      setShowAddMilestoneModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to add milestone.");
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

  const handleToggleMilestoneStatus = async (id: string, current: MilestoneStatus) => {
    const nextStatus: MilestoneStatus = current === "completed" ? "in_progress" : "completed";
    try {
      await updateMilestoneStatus({ id, status: nextStatus });
      toast.success(`Milestone marked as ${nextStatus.replace("_", " ")}.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update milestone status.");
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
      toast.success("Milestone updated successfully.");
      setEditingMilestone(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to update milestone.");
    }
  };

  // Task & Subtask Handlers
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selectedProject) return;

    try {
      const initialSubtasks: SubtaskItem[] = newTaskSubtasks.map((sub, i) => ({
        id: `sub-${Date.now()}-${i}`,
        title: sub,
        done: false,
      }));
      const fullDescription = serializeSubtasks(newTaskDesc, initialSubtasks);

      await createTask({
        project_id: selectedProject.id,
        service_id: selectedService?.id || null,
        client_id: selectedProject.client_id,
        title: newTaskTitle.trim(),
        description: fullDescription,
        status: "planned",
        priority: newTaskPriority,
        due_date: newTaskDueDate || null,
        milestone_id: newTaskMilestoneId || null,
        visibility: newTaskVisibility,
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
      toast.success(`Task status set to ${newStatus.replace("_", " ")}`);
    } catch (err: any) {
      toast.error("Failed to update status.");
    }
  };

  const handleCreateDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDecisionTitle.trim() || !selectedService || !selectedProject) return;
    try {
      await createDecision({
        project_id: selectedProject.id,
        service_id: selectedService.id,
        client_id: selectedProject.client_id,
        title: newDecisionTitle,
        description: newDecisionDesc,
        decision_date: newDecisionDate,
        made_by: newDecisionMadeBy,
      });
      toast.success(`Decision "${newDecisionTitle}" permanently logged.`);
      setNewDecisionTitle("");
      setNewDecisionDesc("");
      setShowAddDecisionModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to log decision.");
    }
  };

  const handleDeleteDecision = async (id: string, title: string) => {
    if (!window.confirm(`Delete decision "${title}"?`)) return;
    try {
      await deleteDecision(id);
      toast.success("Decision deleted.");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete decision.");
    }
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordTitle.trim() || !selectedService || !selectedProject) return;
    try {
      await createWorkRecord({
        organization_id: selectedProject.organization_id || "72e3ff6d-96e6-4cc6-b904-d07327f43b29",
        project_id: selectedProject.id,
        service_id: selectedService.id,
        client_id: selectedProject.client_id,
        title: recordTitle,
        description: recordDesc,
        changes: recordChanges || null,
        visibility: "client",
      });
      toast.success("Work record logged and permanently documented.");
      setRecordTitle("");
      setRecordDesc("");
      setRecordChanges("");
      setShowRecordModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to log work record.");
    }
  };

  const handleDeleteRecord = async (id: string, title: string) => {
    if (!window.confirm(`Delete work record "${title}"?`)) return;
    try {
      await deleteWorkRecord(id);
      toast.success("Work record deleted.");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete record.");
    }
  };

  // Deliverable Handlers
  const handleCreateDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDelivName.trim() || !selectedProject) return;

    try {
      await createDeliverable({
        organization_id: selectedProject.organization_id || "72e3ff6d-96e6-4cc6-b904-d07327f43b29",
        project_id: selectedProject.id,
        service_id: selectedService?.id || null,
        client_id: selectedProject.client_id,
        name: newDelivName.trim(),
        title: newDelivName.trim(),
        description: newDelivDesc.trim(),
        type: newDelivType,
        category: newDelivCategory,
        status: newDelivStatus,
        file: newDelivFile,
        fileNotes: newDelivNotes || "Initial version submitted.",
      });

      toast.success(`Deliverable "${newDelivName}" published successfully.`);
      setNewDelivName("");
      setNewDelivDesc("");
      setNewDelivType("Document");
      setNewDelivCategory("pdf");
      setNewDelivStatus("awaiting_review");
      setNewDelivFile(null);
      setNewDelivNotes("");
      setShowAddDeliverableModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to publish deliverable.");
    }
  };

  const handleUploadRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadDeliverableId || !revisionFile) return;

    try {
      await uploadNewVersion({
        deliverableId: uploadDeliverableId,
        file: revisionFile,
        notes: revisionNotes || "Updated revision uploaded.",
      });

      toast.success("New revision uploaded and submitted for review.");
      setUploadDeliverableId(null);
      setRevisionFile(null);
      setRevisionNotes("");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload revision.");
    }
  };

  const handleOpenEditDeliverable = (deliv: Deliverable) => {
    setEditingDeliverable(deliv);
    setEditDelivName(deliv.name || (deliv as any).title || "");
    setEditDelivDesc(deliv.description || "");
    setEditDelivStatus(deliv.status);
  };

  const handleUpdateDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeliverable) return;

    try {
      await updateDeliverable({
        id: editingDeliverable.id,
        updates: {
          name: editDelivName.trim(),
          title: editDelivName.trim(),
          description: editDelivDesc.trim(),
          status: editDelivStatus,
        },
      });

      toast.success("Deliverable updated successfully.");
      setEditingDeliverable(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to update deliverable.");
    }
  };

  const handleDeleteDeliverable = async (id: string, name: string) => {
    if (!window.confirm(`Delete deliverable "${name}"? This action cannot be undone.`)) return;

    try {
      await deleteDeliverable(id);
      toast.success(`Deliverable "${name}" deleted.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete deliverable.");
    }
  };

  if (projectsLoading) {
    return (
      <div className="p-12 flex justify-center text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  // If no projects exist yet
  if (!selectedProject || projects.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Projects & Service Workspaces"
          description="Every digital service operates in an isolated workspace acting as a permanent, unalterable historical record of all digital work."
          actions={
            isManager ? (
              <button
                onClick={() => setShowNewProjectModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                New Project
              </button>
            ) : undefined
          }
        />
        <div className="p-12 text-center bg-card rounded-2xl border border-border space-y-3">
          <Layers className="w-8 h-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No Projects Available</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {isManager
              ? "Initialize your first project to begin tracking client services, milestones, and deliverables."
              : "Projects will appear here once onboarded by your account lead."}
          </p>
          {isManager && (
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Create First Project
            </button>
          )}
        </div>

        {/* New Project Modal */}
        {showNewProjectModal && renderNewProjectModal()}
      </div>
    );
  }

  function renderNewProjectModal() {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">Initialize New Project</h2>
            <button onClick={() => setShowNewProjectModal(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleCreateProject} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Target Client</label>
              <select
                value={newProjClientId}
                onChange={(e) => setNewProjClientId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Project Name</label>
              <input
                type="text"
                required
                value={newProjName}
                onChange={(e) => setNewProjName(e.target.value)}
                placeholder="e.g. Enterprise E-Commerce Platform & Rebrand"
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
              >
              </input>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Description / Scope Overview</label>
              <textarea
                rows={2}
                value={newProjDesc}
                onChange={(e) => setNewProjDesc(e.target.value)}
                placeholder="Key deliverables, strategic objectives, and scope constraints..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Total Budget</label>
                <input
                  type="number"
                  value={newProjBudget}
                  onChange={(e) => setNewProjBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Currency</label>
                <select
                  value={newProjCurrency}
                  onChange={(e) => setNewProjCurrency(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                >
                  <option value="ETB">ETB (Ethiopian Birr)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Start Date</label>
                <input
                  type="date"
                  value={newProjStartDate}
                  onChange={(e) => setNewProjStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Target End Date</label>
                <input
                  type="date"
                  value={newProjEndDate}
                  onChange={(e) => setNewProjEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewProjectModal(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg border border-border cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreatingProj}
                className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isCreatingProj && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Create Project
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Projects & Service Workspaces"
        description="Every service operates in an isolated workspace acting as a permanent, unalterable historical record of all digital work."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {isManager && (
              <div className="flex items-center gap-1.5 bg-card px-2.5 py-1.5 rounded-lg border border-border shadow-2xs">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider font-semibold">Client:</span>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="text-xs bg-transparent font-semibold text-foreground focus:outline-hidden cursor-pointer"
                >
                  <option value="all">All Clients ({clients.length})</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-1.5 bg-card px-2.5 py-1.5 rounded-lg border border-border shadow-2xs">
              <FolderOpen className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider font-semibold">Project:</span>
              <select
                value={selectedProject.id}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="text-xs bg-transparent font-semibold text-foreground focus:outline-hidden cursor-pointer max-w-[200px] truncate"
              >
                {filteredProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {isManager && (
              <>
                <button
                  onClick={openEditProject}
                  className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                  title="Edit project details"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDeleteProject}
                  className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="Delete project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setShowNewProjectModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer ml-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Project
                </button>
              </>
            )}
          </div>
        }
      />

      {/* Workspace Hierarchy Context Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-secondary/30 border border-border/80 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Workspace:</span>
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <span className="inline-flex items-center gap-1 text-primary font-semibold">
              <Building2 className="w-3.5 h-3.5" />
              {currentProjectClient?.name || "Client"}
            </span>
            <span className="text-muted-foreground">/</span>
            <span className="font-semibold text-foreground">{selectedProject.name}</span>
            {selectedService && (
              <>
                <span className="text-muted-foreground">/</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary font-mono text-[11px]">
                  <Layers className="w-3 h-3" />
                  {selectedService.name}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-muted-foreground">
            {filteredProjects.length} {filteredProjects.length === 1 ? "Project" : "Projects"} in client scope
          </span>
        </div>
      </div>

      {/* Service Area Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border">
        {services.map((srv) => {
          const isSelected = selectedService && srv.id === selectedService.id;
          return (
            <button
              key={srv.id}
              onClick={() => {
                setSelectedServiceId(srv.id);
                setActiveTab("overview");
              }}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                  : "bg-card text-muted-foreground hover:text-foreground border-border hover:bg-secondary/60"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>{srv.name}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                  isSelected ? "bg-white/20 text-white" : "bg-secondary text-muted-foreground"
                }`}
              >
                {srv.progress}%
              </span>
            </button>
          );
        })}

        {isManager && (
          <button
            onClick={() => setShowNewServiceModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary transition-all whitespace-nowrap cursor-pointer ml-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Service Workspace
          </button>
        )}
      </div>

      {/* If current project has no services yet */}
      {!selectedService ? (
        <div className="p-12 text-center bg-card rounded-2xl border border-border space-y-3">
          <Layers className="w-8 h-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No Service Workspaces Initialized</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Launch specialized workspaces for website design, SEO, branding, or media production.
          </p>
          {isManager && (
            <button
              onClick={() => setShowNewServiceModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Service Workspace
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Service Workspace Header & Status */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    Service Workspace
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-[11px] font-mono uppercase text-primary font-bold">
                    {selectedService.service_type}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-foreground">{selectedService.name}</h2>
                <p className="text-xs text-muted-foreground max-w-2xl mt-1">{selectedService.description}</p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <StatusBadge status={selectedService.status} />
                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-muted-foreground block">Completion</span>
                  <span className="text-lg font-bold font-mono text-foreground">{selectedService.progress}%</span>
                </div>
                {isManager && (
                  <div className="flex items-center gap-1.5 ml-2 border-l border-border pl-3">
                    <button
                      onClick={openEditService}
                      className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                      title="Update service progress & phase"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleDeleteService}
                      className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete service workspace"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Current Phase Highlight */}
            {selectedService.current_phase && (
              <div className="p-3 rounded-lg bg-secondary/50 border border-border/70 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Current Active Phase: <strong className="text-foreground">{selectedService.current_phase}</strong>
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  Target: {formatDate(selectedService.target_date || selectedProject.end_date)}
                </span>
              </div>
            )}
          </div>

          {/* Service Workspace Navigation Tabs */}
          <div className="flex items-center gap-1 border-b border-border/80 overflow-x-auto text-xs font-semibold">
            {(
              [
                { id: "overview", label: "Overview & Milestones", icon: Layers, count: serviceMilestones.length },
                { id: "work", label: "Work Records", icon: History, count: workRecords.length },
                { id: "tasks", label: "Tasks", icon: CheckSquare, count: tasks.length },
                { id: "deliverables", label: "Deliverables", icon: FileCheck2, count: deliverables.length },
                { id: "approvals", label: "Approvals", icon: CheckCircle2, count: serviceApprovals.length },
                { id: "decisions", label: "Decisions", icon: Scale, count: serviceDecisions.length },
                { id: "files", label: "Files", icon: FolderOpen, count: files.length },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "border-primary text-foreground font-bold"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-secondary text-muted-foreground">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono">
                      Milestone Progression
                    </h3>
                    {isManager && (
                      <button
                        onClick={() => setShowAddMilestoneModal(true)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Milestone
                      </button>
                    )}
                  </div>

                  {serviceMilestones.length === 0 ? (
                    <div className="p-8 text-center bg-secondary/20 rounded-xl border border-dashed border-border text-xs text-muted-foreground">
                      No milestones created yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {serviceMilestones.map((m, idx) => (
                        <div
                          key={m.id}
                          className="p-4 rounded-xl bg-secondary/30 border border-border/70 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <button
                              disabled={!isManager}
                              onClick={() => isManager && handleToggleMilestoneStatus(m.id, m.status)}
                              title={isManager ? "Click to toggle completion status" : undefined}
                              className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                isManager ? "cursor-pointer hover:ring-2 hover:ring-primary/50" : ""
                              } ${
                                m.status === "completed"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                  : m.status === "in_progress"
                                  ? "bg-blue-100 text-blue-800 border border-blue-300 animate-pulse"
                                  : "bg-secondary text-muted-foreground border border-border"
                              }`}
                            >
                              {m.status === "completed" ? "✓" : idx + 1}
                            </button>
                            <div>
                              <h4 className="text-xs font-bold text-foreground">{m.title || m.name}</h4>
                              <p className="text-[11px] text-muted-foreground">{m.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <StatusBadge status={m.status} />
                              <p className="text-[10px] font-mono text-muted-foreground mt-1">
                                {m.completed_at
                                  ? `Completed ${formatDate(m.completed_at)}`
                                  : m.due_date
                                  ? `Due ${formatDate(m.due_date)}`
                                  : "No due date"}
                              </p>
                            </div>
                            {isManager && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleOpenEditMilestone(m)}
                                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors cursor-pointer"
                                  title="Edit milestone"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMilestone(m.id, m.title || m.name)}
                                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                  title="Delete milestone"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "work" && (
              <div className="space-y-4">
                {isManager && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowRecordModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Log Work Record
                    </button>
                  </div>
                )}

                {workRecords.length === 0 ? (
                  <div className="p-8 text-center bg-card rounded-xl border border-dashed border-border text-xs text-muted-foreground">
                    No work records published for this service yet.
                  </div>
                ) : (
                  workRecords.map((record) => (
                    <div key={record.id} className="p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono uppercase bg-secondary px-2 py-0.5 rounded text-muted-foreground font-semibold">
                              Work Record
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">
                              {formatDate(record.work_date)}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-foreground">{record.title}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={record.status} />
                          {isManager && (
                            <button
                              onClick={() => handleDeleteRecord(record.id, record.title)}
                              className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              title="Delete work record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-foreground/90 leading-relaxed">{record.description}</p>

                      {record.changes && (
                        <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/70 space-y-1">
                          <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground block">
                            Changes & Technical Implementation:
                          </span>
                          <pre className="text-xs font-sans text-foreground whitespace-pre-wrap leading-relaxed">
                            {record.changes}
                          </pre>
                        </div>
                      )}

                      {record.notes && (
                        <p className="text-[11px] text-muted-foreground italic border-t border-border/60 pt-2">
                          Note: {record.notes}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "tasks" && (
              <div className="space-y-4">
                {/* Task Toolbar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border shadow-2xs">
                  <div className="flex items-center gap-2 flex-1 flex-wrap">
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        value={taskSearch}
                        onChange={(e) => setTaskSearch(e.target.value)}
                        placeholder="Search tasks or subtasks..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                      />
                    </div>

                    <div className="flex items-center gap-1 overflow-x-auto">
                      {(["all", "planned", "in_progress", "review", "completed"] as const).map((st) => {
                        const count = st === "all" ? tasks.length : tasks.filter((t) => t.status === st).length;
                        return (
                          <button
                            key={st}
                            onClick={() => setTaskFilterStatus(st)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                              taskFilterStatus === st
                                ? "bg-primary text-primary-foreground shadow-2xs"
                                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                            }`}
                          >
                            {st === "all" ? "All" : st.replace("_", " ")} ({count})
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {isManager && (
                    <button
                      onClick={() => setShowAddTaskModal(true)}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Task
                    </button>
                  )}
                </div>

                {/* Task Cards Matrix */}
                {(() => {
                  const filtered = tasks.filter((t) => {
                    const matchesSearch =
                      !taskSearch ||
                      t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
                      (t.description && t.description.toLowerCase().includes(taskSearch.toLowerCase()));
                    const matchesStatus = taskFilterStatus === "all" || t.status === taskFilterStatus;
                    return matchesSearch && matchesStatus;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="p-10 text-center bg-card rounded-2xl border border-dashed border-border space-y-3">
                        <CheckSquare className="w-8 h-8 text-muted-foreground mx-auto" />
                        <h4 className="text-sm font-bold text-foreground">No Tasks Found</h4>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                          {taskSearch || taskFilterStatus !== "all"
                            ? "No tasks match your current filter or search criteria."
                            : "Create your first task to plan work, link milestones, and track subtask checklists."}
                        </p>
                        {isManager && (
                          <button
                            onClick={() => setShowAddTaskModal(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer mt-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Create Task
                          </button>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {filtered.map((t) => {
                        const { cleanDescription, subtasks } = parseSubtasks(t.description || "");
                        const completedSubtasks = subtasks.filter((s) => s.done).length;
                        const subtaskPercent =
                          subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;
                        const linkedMilestone = serviceMilestones.find((m) => m.id === t.milestone_id);

                        return (
                          <div
                            key={t.id}
                            className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-3 transition-all hover:border-primary/40"
                          >
                            {/* Task Top Meta & Actions */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                                    t.priority === "urgent"
                                      ? "bg-rose-500/10 text-rose-600 border border-rose-200"
                                      : t.priority === "high"
                                      ? "bg-amber-500/10 text-amber-600 border border-amber-200"
                                      : t.priority === "medium"
                                      ? "bg-blue-500/10 text-blue-600 border border-blue-200"
                                      : "bg-slate-500/10 text-slate-600 border border-slate-200"
                                  }`}
                                >
                                  {t.priority}
                                </span>

                                {linkedMilestone && (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold flex items-center gap-1">
                                    <Layers className="w-3 h-3" />
                                    {linkedMilestone.name || linkedMilestone.title}
                                  </span>
                                )}

                                {t.due_date && (
                                  <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Due {formatDate(t.due_date)}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {isManager ? (
                                  <select
                                    value={t.status}
                                    onChange={(e) => handleQuickTaskStatus(t, e.target.value as TaskStatus)}
                                    className="text-xs bg-secondary/50 font-semibold border border-border rounded-lg px-2.5 py-1 text-foreground focus:outline-hidden cursor-pointer"
                                  >
                                    <option value="planned">Planned</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="review">Review</option>
                                    <option value="completed">Completed</option>
                                    <option value="blocked">Blocked</option>
                                  </select>
                                ) : (
                                  <StatusBadge status={t.status} />
                                )}

                                {isManager && (
                                  <div className="flex items-center gap-1 border-l border-border pl-2">
                                    <button
                                      onClick={() => handleOpenEditTask(t)}
                                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors cursor-pointer"
                                      title="Edit task & subtasks"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTask(t.id, t.title)}
                                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                      title="Delete task"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Task Content */}
                            <div>
                              <h4
                                className={`text-sm font-bold text-foreground ${
                                  t.status === "completed" ? "line-through text-muted-foreground" : ""
                                }`}
                              >
                                {t.title}
                              </h4>
                              {cleanDescription && (
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                  {cleanDescription}
                                </p>
                              )}
                            </div>

                            {/* Subtasks Section */}
                            <div className="pt-2 space-y-2.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                                  <CheckSquare className="w-3.5 h-3.5 text-primary" />
                                  Subtasks ({completedSubtasks}/{subtasks.length})
                                </span>
                                {subtasks.length > 0 && (
                                  <span className="font-mono text-[10px] text-muted-foreground font-semibold">
                                    {subtaskPercent}% done
                                  </span>
                                )}
                              </div>

                              {subtasks.length > 0 && (
                                <div className="w-full bg-secondary/60 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="bg-primary h-full transition-all duration-300"
                                    style={{ width: `${subtaskPercent}%` }}
                                  />
                                </div>
                              )}

                              {/* Subtasks Checklist List */}
                              {subtasks.length > 0 && (
                                <div className="space-y-1.5 bg-secondary/20 p-2.5 rounded-xl border border-border/60">
                                  {subtasks.map((st) => (
                                    <div
                                      key={st.id}
                                      className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-secondary/40 group transition-colors"
                                    >
                                      <button
                                        onClick={() => handleToggleSubtask(t, st.id)}
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

                                      {isManager && (
                                        <button
                                          onClick={() => handleDeleteSubtaskInline(t, st.id)}
                                          className="text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive p-1 transition-all cursor-pointer"
                                          title="Delete subtask"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Inline Quick Add Subtask */}
                              {isManager && (
                                <div className="flex items-center gap-2 pt-1">
                                  <input
                                    type="text"
                                    value={inlineSubtaskInputs[t.id] || ""}
                                    onChange={(e) =>
                                      setInlineSubtaskInputs((prev) => ({ ...prev, [t.id]: e.target.value }))
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddSubtaskInline(t);
                                      }
                                    }}
                                    placeholder="+ Add a subtask (press Enter)..."
                                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-border/80 bg-secondary/30 text-foreground placeholder:text-muted-foreground/70 focus:outline-hidden"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleAddSubtaskInline(t)}
                                    className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                                  >
                                    Add
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            {activeTab === "deliverables" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Published Deliverables</h3>
                    <p className="text-xs text-muted-foreground">
                      Client-facing outputs, creative assets, code repos, and version histories for executive sign-off.
                    </p>
                  </div>
                  {isManager && (
                    <button
                      onClick={() => setShowAddDeliverableModal(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer self-start sm:self-auto shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Publish Deliverable
                    </button>
                  )}
                </div>

                {deliverables.length === 0 ? (
                  <div className="p-12 text-center bg-card rounded-2xl border border-dashed border-border space-y-3">
                    <FileCheck2 className="w-8 h-8 text-muted-foreground mx-auto" />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-foreground">No deliverables published yet</p>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Publish technical documents, design vectors, staging URLs, or media exports for this service.
                      </p>
                    </div>
                    {isManager && (
                      <button
                        onClick={() => setShowAddDeliverableModal(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Publish First Deliverable
                      </button>
                    )}
                  </div>
                ) : (
                  deliverables.map((deliv) => (
                    <div key={deliv.id} className="p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-mono uppercase bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">
                              Deliverable v{deliv.current_version}
                            </span>
                            <span className="text-[10px] font-mono uppercase bg-secondary px-2 py-0.5 rounded text-muted-foreground font-semibold border border-border">
                              {deliv.type || deliv.category || "Asset"}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-foreground mt-1">{deliv.name || deliv.title}</h4>
                          {deliv.description && (
                            <p className="text-xs text-muted-foreground leading-relaxed">{deliv.description}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                          <StatusBadge status={deliv.status} />

                          {isManager && (
                            <>
                              <button
                                onClick={() => {
                                  setUploadDeliverableId(deliv.id);
                                  setRevisionFile(null);
                                  setRevisionNotes("");
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary text-foreground hover:bg-secondary/80 border border-border transition-colors cursor-pointer"
                                title="Upload new version"
                              >
                                <Upload className="w-3.5 h-3.5 text-primary" />
                                <span>Upload Revision</span>
                              </button>

                              <button
                                onClick={() => handleOpenEditDeliverable(deliv)}
                                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                                title="Edit deliverable info"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteDeliverable(deliv.id, deliv.name || deliv.title || "Deliverable")}
                                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                title="Delete deliverable"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Versions list */}
                      {deliv.versions && deliv.versions.length > 0 && (
                        <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/70 space-y-2">
                          <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground block">
                            Version Archive:
                          </span>
                          <div className="space-y-2">
                            {deliv.versions.map((ver: any) => (
                              <div key={ver.id} className="flex items-center justify-between text-xs bg-card p-2.5 rounded-lg border border-border/60">
                                <div className="flex items-center gap-2 truncate min-w-0 pr-2">
                                  <span className="font-mono font-bold text-primary shrink-0">v{ver.version_number}</span>
                                  <span className="font-mono text-foreground font-medium truncate">{ver.file_name}</span>
                                  {ver.notes && <span className="text-muted-foreground italic truncate">— {ver.notes}</span>}
                                </div>
                                <a
                                  href={ver.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 rounded bg-secondary hover:bg-secondary/80 text-foreground font-medium text-[11px] flex items-center gap-1 transition-colors border border-border shrink-0 cursor-pointer"
                                >
                                  <Download className="w-3 h-3" />
                                  Download
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "approvals" && (
              <div className="space-y-4">
                {serviceApprovals.length === 0 ? (
                  <div className="p-8 text-center bg-card rounded-xl border border-dashed border-border text-xs text-muted-foreground">
                    No active approvals in this workspace.
                  </div>
                ) : (
                  serviceApprovals.map((appr) => (
                    <div key={appr.id} className="p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-foreground">{appr.title}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{appr.description}</p>
                        </div>
                        <StatusBadge status={appr.status} />
                      </div>
                      {appr.client_comment && (
                        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                          <span className="text-[10px] font-mono font-bold uppercase text-amber-900">
                            Client Feedback:
                          </span>
                          <p className="text-xs text-amber-950 font-medium">{appr.client_comment}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "decisions" && (
              <div className="space-y-4">
                {isManager && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowAddDecisionModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Log Strategic Decision
                    </button>
                  </div>
                )}

                {serviceDecisions.length === 0 ? (
                  <div className="p-8 text-center bg-card rounded-xl border border-dashed border-border text-xs text-muted-foreground">
                    No strategic decisions recorded yet.
                  </div>
                ) : (
                  serviceDecisions.map((dec) => (
                    <div key={dec.id} className="p-5 rounded-xl bg-card border border-border shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-foreground">{dec.title}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground">
                            {formatDate(dec.decision_date)}
                          </span>
                          {isManager && (
                            <button
                              onClick={() => handleDeleteDecision(dec.id, dec.title)}
                              className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              title="Delete decision"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{dec.description}</p>
                      <div className="pt-1 text-[11px] font-mono text-primary font-semibold">
                        Authorized by: {dec.made_by}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "files" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="p-4 rounded-xl bg-card border border-border shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FolderOpen className="h-5 w-5 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{file.name}</p>
                        <p className="text-[10px] font-mono text-muted-foreground uppercase">{file.category}</p>
                      </div>
                    </div>
                    <a
                      href={file.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground border border-border/80 flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* New Project Modal */}
      {showNewProjectModal && renderNewProjectModal()}

      {/* Edit Project Modal */}
      {showEditProjectModal && selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Edit Project Parameters</h2>
              <button onClick={() => setShowEditProjectModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdateProject} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={editProjName}
                  onChange={(e) => setEditProjName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editProjDesc}
                  onChange={(e) => setEditProjDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Status</label>
                  <select
                    value={editProjStatus}
                    onChange={(e) => setEditProjStatus(e.target.value as ProjectStatus)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="on_hold">On Hold</option>
                    <option value="waiting_for_client">Waiting for Client</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Budget</label>
                  <input
                    type="number"
                    value={editProjBudget}
                    onChange={(e) => setEditProjBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Start Date</label>
                  <input
                    type="date"
                    value={editProjStartDate}
                    onChange={(e) => setEditProjStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">End Date</label>
                  <input
                    type="date"
                    value={editProjEndDate}
                    onChange={(e) => setEditProjEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditProjectModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg border border-border cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* New Service Modal */}
      {showNewServiceModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Launch Service Workspace</h2>
              <button onClick={() => setShowNewServiceModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateService} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Service Discipline</label>
                <select
                  value={newSrvType}
                  onChange={(e) => setNewSrvType(e.target.value as ServiceType)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                >
                  {SERVICE_TYPES.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Workspace Title (Optional — defaults to discipline)
                </label>
                <input
                  type="text"
                  value={newSrvName}
                  onChange={(e) => setNewSrvName(e.target.value)}
                  placeholder="e.g. Next.js Web App Re-architecture"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Description & Scope</label>
                <textarea
                  rows={2}
                  value={newSrvDesc}
                  onChange={(e) => setNewSrvDesc(e.target.value)}
                  placeholder="Goals, requirements, deliverables, and service cadence..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Starting Phase</label>
                  <input
                    type="text"
                    value={newSrvPhase}
                    onChange={(e) => setNewSrvPhase(e.target.value)}
                    placeholder="e.g. Discovery & Wireframes"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Initial Status</label>
                  <select
                    value={newSrvStatus}
                    onChange={(e) => setNewSrvStatus(e.target.value as ServiceStatus)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="waiting_for_client">Waiting for Client</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewServiceModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg border border-border cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingService}
                  className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isCreatingService && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Launch Workspace
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Service Modal */}
      {showEditServiceModal && selectedService && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Update Service Workspace</h2>
              <button onClick={() => setShowEditServiceModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdateService} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Status</label>
                  <select
                    value={editSrvStatus}
                    onChange={(e) => setEditSrvStatus(e.target.value as ServiceStatus)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="waiting_for_client">Waiting for Client</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Completion Progress ({editSrvProgress}%)</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={editSrvProgress}
                    onChange={(e) => setEditSrvProgress(Number(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Current Active Phase</label>
                <input
                  type="text"
                  value={editSrvPhase}
                  onChange={(e) => setEditSrvPhase(e.target.value)}
                  placeholder="e.g. Design & Client Feedback"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditServiceModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg border border-border cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors cursor-pointer"
                >
                  Save Workspace
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Milestone Modal */}
      {showAddMilestoneModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Add Service Milestone</h2>
              <button onClick={() => setShowAddMilestoneModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateMilestone} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Milestone Title</label>
                <input
                  type="text"
                  required
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  placeholder="e.g. UI/UX Figma Prototype Delivery"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newMilestoneDesc}
                  onChange={(e) => setNewMilestoneDesc(e.target.value)}
                  placeholder="Requirements to achieve completion..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Due Date</label>
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
                    <option value="not_started">Planned / Backlog</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
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
                  Add Milestone
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Strategic Decision Modal */}
      {showAddDecisionModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Log Strategic Decision</h2>
              <button onClick={() => setShowAddDecisionModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Permanently record key architectural, brand, or technical decisions to maintain an immutable log.
            </p>
            <form onSubmit={handleCreateDecision} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Decision Title</label>
                <input
                  type="text"
                  required
                  value={newDecisionTitle}
                  onChange={(e) => setNewDecisionTitle(e.target.value)}
                  placeholder="e.g. Selected PostgreSQL & Supabase over Firebase"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Rationale & Context</label>
                <textarea
                  rows={3}
                  required
                  value={newDecisionDesc}
                  onChange={(e) => setNewDecisionDesc(e.target.value)}
                  placeholder="Why this direction was chosen, alternatives considered, and anticipated impacts..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Decision Date</label>
                  <input
                    type="date"
                    value={newDecisionDate}
                    onChange={(e) => setNewDecisionDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Authorized By</label>
                  <input
                    type="text"
                    value={newDecisionMadeBy}
                    onChange={(e) => setNewDecisionMadeBy(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDecisionModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg border border-border cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors cursor-pointer"
                >
                  Save Decision
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Log Work Record Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Log Work Record</h2>
              <button onClick={() => setShowRecordModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Document technical execution and changes for this service stream.
            </p>
            <form onSubmit={handleCreateRecord} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Work Summary</label>
                <input
                  type="text"
                  required
                  value={recordTitle}
                  onChange={(e) => setRecordTitle(e.target.value)}
                  placeholder="e.g. Configured PostgreSQL schema & Row-Level Security"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Detailed Description</label>
                <textarea
                  rows={2}
                  required
                  value={recordDesc}
                  onChange={(e) => setRecordDesc(e.target.value)}
                  placeholder="Overview of tasks accomplished during this working session..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Technical Changes & Artifacts (Optional)
                </label>
                <textarea
                  rows={3}
                  value={recordChanges}
                  onChange={(e) => setRecordChanges(e.target.value)}
                  placeholder="Modified functions, database indexes, or asset export formats..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground font-mono focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg border border-border cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingRecord}
                  className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isCreatingRecord && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Record
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground">Create New Task</h2>
                <p className="text-xs text-muted-foreground">
                  Workspace: {selectedService ? selectedService.name : selectedProject.name}
                </p>
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
                  placeholder="e.g. Design wireframes for checkout flow"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Key instructions, acceptance criteria, context..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
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
                  <label className="block text-xs font-semibold text-foreground mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Link to Milestone</label>
                  <select
                    value={newTaskMilestoneId}
                    onChange={(e) => setNewTaskMilestoneId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  >
                    <option value="">None (Independent Task)</option>
                    {serviceMilestones.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name || m.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Visibility</label>
                  <select
                    value={newTaskVisibility}
                    onChange={(e) => setNewTaskVisibility(e.target.value as Visibility)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  >
                    <option value="client">Client & Team</option>
                    <option value="internal">Internal Team Only</option>
                  </select>
                </div>
              </div>

              {/* Subtasks List in Add Modal */}
              <div className="pt-2 border-t border-border/60 space-y-2">
                <label className="block text-xs font-semibold text-foreground">
                  Subtask Checklist ({newTaskSubtasks.length})
                </label>
                {newTaskSubtasks.length > 0 && (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
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
                    placeholder="Add a subtask step..."
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
                  Create Task
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground">Edit Task & Subtasks</h2>
                <p className="text-xs text-muted-foreground">ID: {editingTask.id.slice(0, 8)}</p>
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
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editTaskDesc}
                  onChange={(e) => setEditTaskDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
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
                  <label className="block text-xs font-semibold text-foreground mb-1">Due Date</label>
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
                    <option value="">None (Independent Task)</option>
                    {serviceMilestones.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name || m.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subtasks Management inside Edit Modal */}
              <div className="pt-2 border-t border-border/60 space-y-2">
                <label className="block text-xs font-semibold text-foreground">
                  Subtask Checklist ({editTaskSubtasks.filter((s) => s.done).length}/{editTaskSubtasks.length} Done)
                </label>
                {editTaskSubtasks.length > 0 && (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
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
                          <span
                            className={st.done ? "line-through text-muted-foreground" : "text-foreground"}
                          >
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
                    placeholder="Add a new subtask..."
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

      {/* Edit Milestone Modal */}
      {editingMilestone && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground">Edit Milestone</h2>
                <p className="text-xs text-muted-foreground">Modify milestone parameters & status</p>
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
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editMilestoneDesc}
                  onChange={(e) => setEditMilestoneDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Due Date</label>
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

      {/* Publish Deliverable Modal */}
      {showAddDeliverableModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground">Publish Deliverable</h2>
                <p className="text-xs text-muted-foreground">
                  Workspace: {selectedService ? selectedService.name : selectedProject?.name}
                </p>
              </div>
              <button
                onClick={() => setShowAddDeliverableModal(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDeliverable} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Deliverable Title *</label>
                <input
                  type="text"
                  required
                  value={newDelivName}
                  onChange={(e) => setNewDelivName(e.target.value)}
                  placeholder="e.g. Brand Identity Vector Suite & Typography Spec"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Deliverable Type</label>
                  <select
                    value={newDelivType}
                    onChange={(e) => setNewDelivType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden cursor-pointer"
                  >
                    <option value="Document">Document / PDF</option>
                    <option value="Design">Design / Vector</option>
                    <option value="Video">Video / Master Cut</option>
                    <option value="Presentation">Presentation / Deck</option>
                    <option value="Audio">Audio / Sound Track</option>
                    <option value="Code">Software / Code Package</option>
                    <option value="Archive">Archive / Assets ZIP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Initial Status</label>
                  <select
                    value={newDelivStatus}
                    onChange={(e) => setNewDelivStatus(e.target.value as DeliverableStatus)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden cursor-pointer"
                  >
                    <option value="awaiting_review">Awaiting Client Review</option>
                    <option value="draft">Internal Draft</option>
                    <option value="approved">Approved</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Scope Description</label>
                <textarea
                  rows={2}
                  value={newDelivDesc}
                  onChange={(e) => setNewDelivDesc(e.target.value)}
                  placeholder="Technical specs, Amharic/English typography details, or playback notes..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden resize-none"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-secondary/20 border border-border/80 space-y-2">
                <label className="block text-xs font-semibold text-foreground">
                  Initial File Upload (Optional)
                </label>
                <input
                  type="file"
                  onChange={(e) => setNewDelivFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                />
                {newDelivFile && (
                  <div className="pt-1">
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Version 1 Notes
                    </label>
                    <input
                      type="text"
                      value={newDelivNotes}
                      onChange={(e) => setNewDelivNotes(e.target.value)}
                      placeholder="e.g. Master release v1.0 signed by creative director"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-hidden"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDeliverableModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg border border-border cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeliverableCreating}
                  className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isDeliverableCreating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Publish Deliverable
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Upload Deliverable Revision Modal */}
      {uploadDeliverableId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground">Upload Revision</h2>
                <p className="text-xs text-muted-foreground">Upload an updated file version for this deliverable.</p>
              </div>
              <button
                onClick={() => setUploadDeliverableId(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadRevision} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Select Revised File *</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setRevisionFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Changelog / Revision Notes</label>
                <textarea
                  rows={2}
                  required
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  placeholder="e.g. Addressed client feedback on color palette contrast..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUploadDeliverableId(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg border border-border cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeliverableUploading || !revisionFile}
                  className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isDeliverableUploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Upload Revision
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Deliverable Modal */}
      {editingDeliverable && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Edit Deliverable</h2>
              <button
                onClick={() => setEditingDeliverable(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateDeliverable} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editDelivName}
                  onChange={(e) => setEditDelivName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editDelivDesc}
                  onChange={(e) => setEditDelivDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Status</label>
                <select
                  value={editDelivStatus}
                  onChange={(e) => setEditDelivStatus(e.target.value as DeliverableStatus)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden cursor-pointer"
                >
                  <option value="draft">Draft</option>
                  <option value="awaiting_review">Awaiting Review</option>
                  <option value="approved">Approved</option>
                  <option value="changes_requested">Changes Requested</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
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
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
