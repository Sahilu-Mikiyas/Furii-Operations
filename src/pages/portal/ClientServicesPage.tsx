import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useProjects } from "@/hooks/useProjects";
import { useServices } from "@/hooks/useServices";
import { useWorkRecords } from "@/hooks/useWorkRecords";
import { useDeliverables } from "@/hooks/useDeliverables";
import { useMilestones } from "@/hooks/useMilestones";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { formatDate } from "@/lib/utils";
import { Layers, Download, History, FileCheck2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function ClientServicesPage() {
  const { currentClient } = useAuth();
  const clientId = currentClient?.id;

  const { projects, isLoading: projectsLoading } = useProjects(clientId);
  const selectedProject = projects[0];

  const { services, isLoading: servicesLoading } = useServices(selectedProject?.id, clientId);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");

  const activeService =
    services.find((s) => s.id === selectedServiceId) || services[0];

  const { workRecords } = useWorkRecords(activeService?.id, selectedProject?.id);
  const { deliverables } = useDeliverables(activeService?.id, selectedProject?.id);
  const { milestones } = useMilestones(activeService?.id, selectedProject?.id);

  if (projectsLoading || servicesLoading) {
    return (
      <div className="p-12 flex justify-center text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!activeService) {
    return (
      <div className="p-12 text-center bg-card rounded-2xl border border-border space-y-2">
        <Layers className="w-8 h-8 text-muted-foreground mx-auto" />
        <h3 className="text-sm font-bold text-foreground">No Active Services</h3>
        <p className="text-xs text-muted-foreground">Retained service streams will be displayed here.</p>
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
        title="Retained Service Streams"
        description="Permanent record of digital work, approved assets, and historical production milestones."
      />

      {/* Service Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border">
        {services.map((srv) => {
          const isSelected = srv.id === activeService.id;
          return (
            <button
              key={srv.id}
              onClick={() => setSelectedServiceId(srv.id)}
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

      {/* Service Header */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-primary font-bold">
              {activeService.service_type}
            </span>
            <h2 className="text-xl font-bold text-foreground">{activeService.name}</h2>
            <p className="text-xs text-muted-foreground max-w-2xl">{activeService.description}</p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <StatusBadge status={activeService.status} />
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono text-muted-foreground block">Completion</span>
              <span className="text-lg font-bold font-mono text-foreground">{activeService.progress}%</span>
            </div>
          </div>
        </div>

        <ProgressBar value={activeService.progress} />
      </div>

      {/* Grid: Milestones & Work Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Milestones */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono">
            Milestone Schedule
          </h3>
          <div className="space-y-3">
            {milestones.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No milestones configured for this phase.</p>
            ) : (
              milestones.map((m, idx) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl bg-secondary/30 border border-border/70 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-6 w-6 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-xs shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{m.name}</h4>
                      <p className="text-[11px] text-muted-foreground">{m.description}</p>
                    </div>
                  </div>
                  <StatusBadge status={m.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Deliverables Available */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono">
            Output Deliverables
          </h3>
          <div className="space-y-3">
            {deliverables.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No deliverables published in this stream yet.</p>
            ) : (
              deliverables.map((deliv) => (
                <div
                  key={deliv.id}
                  className="p-3.5 rounded-xl bg-secondary/30 border border-border/70 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground truncate">{deliv.name || deliv.title}</span>
                      <span className="text-[10px] font-mono text-primary font-bold">v{deliv.current_version}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{deliv.description}</p>
                  </div>
                  <StatusBadge status={deliv.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Work Records Log */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          Technical Work Records & Audit Trail
        </h3>
        <div className="space-y-3">
          {workRecords.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No work records published yet.</p>
          ) : (
            workRecords.map((rec) => (
              <div key={rec.id} className="p-4 rounded-xl bg-secondary/30 border border-border/70 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground">{rec.title}</h4>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {formatDate(rec.work_date)}
                  </span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">{rec.description}</p>
                {rec.changes && (
                  <div className="p-2.5 rounded-lg bg-card border border-border/60 text-[11px] font-mono text-muted-foreground">
                    {rec.changes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
