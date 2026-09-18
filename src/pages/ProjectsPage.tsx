import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useProjects } from "@/hooks/useProjects";
import { useServices } from "@/hooks/useServices";
import { useTasks } from "@/hooks/useTasks";
import { useDeliverables } from "@/hooks/useDeliverables";
import { useApprovals } from "@/hooks/useApprovals";
import { useWorkRecords } from "@/hooks/useWorkRecords";
import { useFiles } from "@/hooks/useFiles";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ProgressBar } from "@/components/shared/ProgressBar";
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
  Upload,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useMilestones } from "@/hooks/useMilestones";
import { useDecisions } from "@/hooks/useDecisions";

export function ProjectsPage() {
  const { role, currentClient } = useAuth();
  const targetClientId = role === "client_owner" || role === "client_member" ? currentClient?.id : undefined;

  const { projects, isLoading: projectsLoading } = useProjects(targetClientId);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const { services, isLoading: servicesLoading } = useServices(selectedProject?.id);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");

  useEffect(() => {
    if (services.length > 0) {
      setSelectedServiceId(services[0].id);
    }
  }, [services]);

  const selectedService = services.find((s) => s.id === selectedServiceId) || services[0];

  const [activeTab, setActiveTab] = useState<
    "overview" | "work" | "tasks" | "deliverables" | "approvals" | "decisions" | "files"
  >("overview");

  // Query live data for this service & project
  const { tasks } = useTasks(selectedService?.id, selectedProject?.id);
  const { deliverables, uploadNewVersion, isUploading } = useDeliverables(selectedService?.id, selectedProject?.id);
  const { approvals, approveDeliverable, requestChanges, isApproving } = useApprovals(targetClientId);
  const { workRecords, createWorkRecord, isCreating: isCreatingRecord } = useWorkRecords(selectedService?.id, selectedProject?.id);
  const { files, uploadFile, canUpload } = useFiles(selectedProject?.client_id, selectedService?.id);

  // Filter items scoped to the active Service Workspace
  const { milestones: serviceMilestones } = useMilestones(selectedService?.id, selectedProject?.id);
  const { decisions: serviceDecisions } = useDecisions(selectedService?.id, selectedProject?.id);
  const serviceApprovals = approvals.filter((a) => a.service_id === selectedService?.id || a.project_id === selectedProject?.id);

  // New Work Record Form State
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [recordTitle, setRecordTitle] = useState("");
  const [recordDesc, setRecordDesc] = useState("");
  const [recordChanges, setRecordChanges] = useState("");

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

  if (projectsLoading) {
    return (
      <div className="p-12 flex justify-center text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!selectedProject || !selectedService) {
    return (
      <div className="p-12 text-center bg-card rounded-2xl border border-border space-y-2">
        <Layers className="w-8 h-8 text-muted-foreground mx-auto" />
        <h3 className="text-sm font-bold text-foreground">No Projects Available</h3>
        <p className="text-xs text-muted-foreground">Projects will appear here once onboarded.</p>
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
          <div className="flex items-center gap-2">
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
          </div>
        }
      />

      {/* Service Area Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border">
        {services.map((srv) => {
          const isSelected = srv.id === selectedService.id;
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
      </div>

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
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono">
                Milestone Progression
              </h3>
              <div className="space-y-3">
                {serviceMilestones.map((m, idx) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-xl bg-secondary/30 border border-border/70 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          m.status === "completed"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : m.status === "in_progress"
                            ? "bg-blue-100 text-blue-800 border border-blue-300 animate-pulse"
                            : "bg-secondary text-muted-foreground border border-border"
                        }`}
                      >
                        {m.status === "completed" ? "✓" : idx + 1}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">{m.name}</h4>
                        <p className="text-[11px] text-muted-foreground">{m.description}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <StatusBadge status={m.status} />
                      <p className="text-[10px] font-mono text-muted-foreground mt-1">
                        {m.completed_at
                          ? `Completed ${formatDate(m.completed_at)}`
                          : `Due ${formatDate(m.due_date)}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "work" && (
          <div className="space-y-4">
            {role !== "client_owner" && role !== "client_member" && (
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
                    <StatusBadge status={record.status} />
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
            {serviceDecisions.map((dec) => (
              <div key={dec.id} className="p-5 rounded-xl bg-card border border-border shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground">{dec.title}</h4>
                  <span className="text-xs font-mono text-muted-foreground">
                    {formatDate(dec.decision_date)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{dec.description}</p>
                <div className="pt-1 text-[11px] font-mono text-primary font-semibold">
                  Authorized by: {dec.made_by}
                </div>
              </div>
            ))}
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

      {/* Log Work Record Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 space-y-4"
          >
            <h2 className="text-base font-bold text-foreground">Log Work Record</h2>
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
