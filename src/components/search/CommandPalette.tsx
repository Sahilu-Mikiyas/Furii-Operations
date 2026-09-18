import React, { useEffect } from "react";
import { Command } from "cmdk";
import { useNavigate } from "react-router-dom";
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

  const { clients } = useClients();
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const { deliverables } = useDeliverables();
  const { files } = useFiles();

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

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Global Command Menu" className="w-full">
          <div className="flex items-center border-b border-border px-3">
            <Command.Input
              placeholder="Type to search live clients, projects, tasks, deliverables, files..."
              className="w-full bg-transparent py-3 text-sm text-foreground placeholder:text-muted-foreground outline-hidden border-none"
              autoFocus
            />
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 divide-y divide-border/40">
            <Command.Empty className="py-6 text-center text-xs text-muted-foreground">
              No results found.
            </Command.Empty>

            {/* Live Clients */}
            {clients.length > 0 && (
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

            {/* Live Projects */}
            {projects.length > 0 && (
              <Command.Group heading="Projects" className="py-1 text-[11px] font-mono uppercase text-muted-foreground">
                {projects.map((proj) => (
                  <Command.Item
                    key={proj.id}
                    onSelect={() => handleSelect(`/projects`)}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-secondary cursor-pointer transition-colors"
                  >
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{proj.name}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Live Tasks */}
            {tasks.length > 0 && (
              <Command.Group heading="Tasks" className="py-1 text-[11px] font-mono uppercase text-muted-foreground">
                {tasks.slice(0, 8).map((t) => (
                  <Command.Item
                    key={t.id}
                    onSelect={() => handleSelect(`/tasks`)}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-secondary cursor-pointer transition-colors"
                  >
                    <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    <span>{t.title}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Live Deliverables */}
            {deliverables.length > 0 && (
              <Command.Group heading="Deliverables" className="py-1 text-[11px] font-mono uppercase text-muted-foreground">
                {deliverables.map((d) => (
                  <Command.Item
                    key={d.id}
                    onSelect={() => handleSelect(`/approvals`)}
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
            {files.length > 0 && (
              <Command.Group heading="Files" className="py-1 text-[11px] font-mono uppercase text-muted-foreground">
                {files.map((f) => (
                  <Command.Item
                    key={f.id}
                    onSelect={() => handleSelect(`/files`)}
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
