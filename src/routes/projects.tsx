import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  MOCK_PROJECTS,
  MOCK_SERVICES,
  MOCK_MILESTONES,
  MOCK_WORK_RECORDS,
  MOCK_DELIVERABLES,
  MOCK_APPROVALS,
  MOCK_TASKS,
  MOCK_DECISIONS,
  MOCK_FILES,
} from "@/data/mock-data";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { formatDate } from "@/lib/utils";
import {
  Layers,
  CheckCircle2,
  FileCheck2,
  CheckSquare,
  FileText,
  FolderOpen,
  History,
  Scale,
  Calendar,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/projects")({
  component: ProjectsPage,
});

function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState(MOCK_PROJECTS[0]);
  const [selectedService, setSelectedService] = useState(MOCK_SERVICES[0]);
  const [activeTab, setActiveTab] = useState<
    "overview" | "work" | "tasks" | "deliverables" | "approvals" | "decisions" | "files"
  >("overview");

  // Filter items scoped to the active Service Workspace
  const serviceMilestones = MOCK_MILESTONES.filter((m) => m.service_id === selectedService.id);
  const serviceTasks = MOCK_TASKS.filter((t) => t.service_id === selectedService.id);
  const serviceWorkRecords = MOCK_WORK_RECORDS.filter((r) => r.service_id === selectedService.id);
  const serviceDeliverables = MOCK_DELIVERABLES.filter((d) => d.service_id === selectedService.id);
  const serviceApprovals = MOCK_APPROVALS.filter((a) => a.service_id === selectedService.id);
  const serviceDecisions = MOCK_DECISIONS.filter((d) => d.service_id === selectedService.id);
  const serviceFiles = MOCK_FILES.filter((f) => f.service_id === selectedService.id);

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
              onChange={(e) => {
                const found = MOCK_PROJECTS.find((p) => p.id === e.target.value);
                if (found) {
                  setSelectedProject(found);
                  const firstService = MOCK_SERVICES.find((s) => s.project_id === found.id);
                  if (firstService) setSelectedService(firstService);
                }
              }}
              className="text-xs bg-card font-semibold border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-hidden cursor-pointer"
            >
              {MOCK_PROJECTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* Service Area Selector Tabs (PRD §16: Branding, Website, SEO, Social Media, Content Production) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border">
        {MOCK_SERVICES.filter((s) => s.project_id === selectedProject.id).map((srv) => {
          const isSelected = srv.id === selectedService.id;
          return (
            <button
              key={srv.id}
              onClick={() => {
                setSelectedService(srv);
                setActiveTab("overview");
              }}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
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
              Target: {formatDate(selectedService.target_date)}
            </span>
          </div>
        )}
      </div>

      {/* Service Workspace Navigation Tabs (PRD §17) */}
      <div className="flex items-center gap-1 border-b border-border/80 overflow-x-auto text-xs font-semibold">
        {(
          [
            { id: "overview", label: "Overview & Milestones", icon: Layers, count: serviceMilestones.length },
            { id: "work", label: "Work Records", icon: History, count: serviceWorkRecords.length },
            { id: "tasks", label: "Tasks", icon: CheckSquare, count: serviceTasks.length },
            { id: "deliverables", label: "Deliverables", icon: FileCheck2, count: serviceDeliverables.length },
            { id: "approvals", label: "Approvals", icon: CheckCircle2, count: serviceApprovals.length },
            { id: "decisions", label: "Decisions", icon: Scale, count: serviceDecisions.length },
            { id: "files", label: "Files", icon: FolderOpen, count: serviceFiles.length },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium transition-colors whitespace-nowrap ${
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
        {/* OVERVIEW & MILESTONES (PRD §20) */}
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

        {/* WORK RECORDS (PRD §18: Permanent record of what was actually performed) */}
        {activeTab === "work" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2">
              <p className="text-xs text-muted-foreground">
                Documented work performed by the internal team on behalf of the client.
              </p>
            </div>

            {serviceWorkRecords.length === 0 ? (
              <div className="p-8 text-center bg-card rounded-xl border border-dashed border-border text-xs text-muted-foreground">
                No work records published for this service yet.
              </div>
            ) : (
              serviceWorkRecords.map((record) => (
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

        {/* TASKS (PRD §19) */}
        {activeTab === "tasks" && (
          <div className="space-y-3">
            {serviceTasks.map((t) => (
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
            ))}
          </div>
        )}

        {/* DELIVERABLES (PRD §21: Official outputs produced for client) */}
        {activeTab === "deliverables" && (
          <div className="space-y-4">
            {serviceDeliverables.map((deliv) => (
              <div key={deliv.id} className="p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">
                      Deliverable v{deliv.current_version}
                    </span>
                    <h4 className="text-base font-bold text-foreground mt-1">{deliv.name}</h4>
                    <p className="text-xs text-muted-foreground">{deliv.description}</p>
                  </div>
                  <StatusBadge status={deliv.status} />
                </div>

                {deliv.versions && deliv.versions.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/70 space-y-2">
                    <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground block">
                      Version Archive:
                    </span>
                    <div className="space-y-1.5">
                      {deliv.versions.map((ver) => (
                        <div key={ver.id} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-primary">v{ver.version_number}</span>
                            <span className="font-mono text-muted-foreground">{ver.file_name}</span>
                            {ver.notes && <span className="text-muted-foreground italic">— {ver.notes}</span>}
                          </div>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {formatDate(ver.created_at)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* APPROVALS (PRD §22) */}
        {activeTab === "approvals" && (
          <div className="space-y-4">
            {serviceApprovals.map((appr) => (
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
            ))}
          </div>
        )}

        {/* DECISIONS (PRD §2 Core Philosophy: Documented decisions) */}
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

        {/* FILES */}
        {activeTab === "files" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {serviceFiles.map((file) => (
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
                <button className="px-2.5 py-1 rounded text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground border border-border/80">
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
