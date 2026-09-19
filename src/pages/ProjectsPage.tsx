import { useState, useEffect } from "react";
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
import { formatDate } from "@/lib/utils";
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
  Loader2,
  Trash2,
  Edit3,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { ServiceType, ServiceStatus, ProjectStatus, MilestoneStatus } from "@/types";

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
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  useEffect(() => {
    if (projects.length > 0) {
      if (!selectedProjectId || !projects.some((p) => p.id === selectedProjectId)) {
        setSelectedProjectId(projects[0].id);
      }
    }
  }, [projects, selectedProjectId]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

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
  const { tasks } = useTasks(selectedService?.id, selectedProject?.id);
  const { deliverables } = useDeliverables(selectedService?.id, selectedProject?.id);
  const { approvals } = useApprovals(targetClientId);
  const { workRecords, createWorkRecord, deleteWorkRecord, isCreating: isCreatingRecord } = useWorkRecords(selectedService?.id, selectedProject?.id);
  const { files } = useFiles(selectedProject?.client_id, selectedService?.id);
  const { milestones: serviceMilestones, createMilestone, deleteMilestone, updateMilestoneStatus } = useMilestones(selectedService?.id, selectedProject?.id);
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
            <span className="text-xs text-muted-foreground font-mono">Project:</span>
            <select
              value={selectedProject.id}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="text-xs bg-card font-semibold border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-hidden cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

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
                              <button
                                onClick={() => handleDeleteMilestone(m.id, m.title || m.name)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                title="Delete milestone"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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
              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <div className="p-8 text-center bg-card rounded-xl border border-dashed border-border text-xs text-muted-foreground">
                    No tasks assigned to this service stream.
                  </div>
                ) : (
                  tasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 rounded-xl bg-card border border-border shadow-2xs flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-foreground">{t.title}</h4>
                        <p className="text-[11px] text-muted-foreground">{t.description}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] font-mono text-muted-foreground">
                          Due {formatDate(t.due_date)}
                        </span>
                        <StatusBadge status={t.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "deliverables" && (
              <div className="space-y-4">
                {deliverables.length === 0 ? (
                  <div className="p-8 text-center bg-card rounded-xl border border-dashed border-border text-xs text-muted-foreground">
                    No deliverables published for this service yet.
                  </div>
                ) : (
                  deliverables.map((deliv) => (
                    <div key={deliv.id} className="p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono uppercase bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">
                            Deliverable v{deliv.current_version}
                          </span>
                          <h4 className="text-base font-bold text-foreground mt-1">{deliv.name || deliv.title}</h4>
                          <p className="text-xs text-muted-foreground">{deliv.description}</p>
                        </div>
                        <StatusBadge status={deliv.status} />
                      </div>

                      {deliv.versions && deliv.versions.length > 0 && (
                        <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/70 space-y-2">
                          <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground block">
                            Version Archive:
                          </span>
                          <div className="space-y-2">
                            {deliv.versions.map((ver: any) => (
                              <div key={ver.id} className="flex items-center justify-between text-xs bg-card p-2 rounded-lg border border-border/60">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-primary">v{ver.version_number}</span>
                                  <span className="font-mono text-foreground font-medium">{ver.file_name}</span>
                                  {ver.notes && <span className="text-muted-foreground italic">— {ver.notes}</span>}
                                </div>
                                <a
                                  href={ver.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 rounded bg-secondary hover:bg-secondary/80 text-foreground font-medium text-[11px] flex items-center gap-1 transition-colors border border-border"
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
    </motion.div>
  );
}
