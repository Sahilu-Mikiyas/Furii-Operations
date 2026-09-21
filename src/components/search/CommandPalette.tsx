import { useEffect } from "react";
import { Command } from "cmdk";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { useDeliverables } from "@/hooks/useDeliverables";
import { useFiles } from "@/hooks/useFiles";
import {
  Building2,
  Briefcase,
  CheckSquare,
  FileCheck2,
  FolderOpen,
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { role, currentClient } = useAuth();
  const isClientRole = role === "client" || role === "client_owner" || role === "client_member";

  const { clients } = useClients();
  const { projects } = useProjects(isClientRole ? currentClient?.id : undefined);
  const { tasks } = useTasks();
  const { deliverables } = useDeliverables();
  const { files } = useFiles(isClientRole ? currentClient?.id : undefined);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  if (!open) return null;

  const handleSelect = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  // Client-specific vs Admin-specific navigation mapping
  const getProjectPath = () => (isClientRole ? "/portal/services" : "/projects");
  const getTaskPath = () => (isClientRole ? "/portal/services" : "/tasks");
  const getDeliverablePath = () => (isClientRole ? "/portal/approvals" : "/approvals");
  const getFilePath = () => (isClientRole ? "/portal/files" : "/files");

  // Filter items for clients
  const filteredProjects = isClientRole
    ? projects.filter((p) => p.client_id === currentClient?.id)
    : projects;

  const filteredTasks = isClientRole
    ? tasks.filter((t) => t.client_id === currentClient?.id && t.visibility === "client")
    : tasks;

  const filteredDeliverables = isClientRole
    ? deliverables.filter((d) => d.client_id === currentClient?.id)
    : deliverables;

  const filteredFiles = isClientRole
    ? files.filter((f) => f.client_id === currentClient?.id && f.visibility === "client")
    : files;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Global Command Menu" className="w-full">
          <div className="flex items-center border-b border-border px-3">
            <Command.Input
              placeholder={
                isClientRole
                  ? "Search your services, deliverables, milestones, files..."
                  : "Type to search live clients, projects, tasks, deliverables, files..."
              }
              className="w-full bg-transparent py-3 text-sm text-foreground placeholder:text-muted-foreground outline-hidden border-none"
              autoFocus
            />
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 divide-y divide-border/40">
            <Command.Empty className="py-6 text-center text-xs text-muted-foreground">
              No results found.
            </Command.Empty>

            {/* Live Clients (ONLY for Agency/Admin roles, NEVER for clients) */}
            {!isClientRole && clients.length > 0 && (
              <Command.Group heading="Clients" className="py-1 text-[11px] font-mono uppercase text-muted-foreground">
                {clients.map((client) => (
                  <Command.Item
                    key={client.id}
                    onSelect={() => handleSelect(`/clients`)}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-secondary cursor-pointer transition-colors"
                  >
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{client.name}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto font-normal">
                      {client.industry}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Live Services & Projects */}
            {filteredProjects.length > 0 && (
              <Command.Group
                heading={isClientRole ? "Your Services" : "Projects"}
                className="py-1 text-[11px] font-mono uppercase text-muted-foreground"
              >
                {filteredProjects.map((proj) => (
                  <Command.Item
                    key={proj.id}
                    onSelect={() => handleSelect(getProjectPath())}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-secondary cursor-pointer transition-colors"
                  >
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{proj.name}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto font-mono">
                      {proj.status.replace("_", " ")}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Live Tasks */}
            {filteredTasks.length > 0 && (
              <Command.Group heading="Tasks" className="py-1 text-[11px] font-mono uppercase text-muted-foreground">
                {filteredTasks.slice(0, 8).map((t) => (
                  <Command.Item
                    key={t.id}
                    onSelect={() => handleSelect(getTaskPath())}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-secondary cursor-pointer transition-colors"
                  >
                    <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    <span>{t.title}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto font-mono">
                      {t.status.replace("_", " ")}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Live Deliverables */}
            {filteredDeliverables.length > 0 && (
              <Command.Group heading="Deliverables" className="py-1 text-[11px] font-mono uppercase text-muted-foreground">
                {filteredDeliverables.map((d) => (
                  <Command.Item
                    key={d.id}
                    onSelect={() => handleSelect(getDeliverablePath())}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-secondary cursor-pointer transition-colors"
                  >
                    <FileCheck2 className="h-4 w-4 text-muted-foreground" />
                    <span>{d.name || d.title}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto font-mono">
                      v{d.current_version}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Live Files */}
            {filteredFiles.length > 0 && (
              <Command.Group heading="Files" className="py-1 text-[11px] font-mono uppercase text-muted-foreground">
                {filteredFiles.map((f) => (
                  <Command.Item
                    key={f.id}
                    onSelect={() => handleSelect(getFilePath())}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-secondary cursor-pointer transition-colors"
                  >
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    <span>{f.name}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
export default CommandPalette;
