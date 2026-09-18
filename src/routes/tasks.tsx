import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MOCK_TASKS, MOCK_PROJECTS, MOCK_SERVICES } from "@/data/mock-data";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/utils";
import { Plus, Search, CheckSquare, Clock, Filter } from "lucide-react";
import { motion } from "framer-motion";
import type { TaskStatus } from "@/types";

export const Route = createFileRoute("/tasks")({
  component: TasksPage,
});

function TasksPage() {
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isCreating, setIsCreating] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [newDueDate, setNewDueDate] = useState("");

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = {
      id: `task-${Date.now()}`,
      organization_id: "furii-org-01",
      project_id: MOCK_PROJECTS[0].id,
      service_id: MOCK_SERVICES[0].id,
      client_id: "client-ersas",
      title: newTitle,
      description: newDesc,
      status: "planned" as TaskStatus,
      priority: newPriority,
      creator_id: "user-mikiyas",
      due_date: newDueDate || "2026-09-30",
      visibility: "client" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTasks([created, ...tasks]);
    setNewTitle("");
    setNewDesc("");
    setIsCreating(false);
  };

  const toggleTaskComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: t.status === "completed" ? "in_progress" : "completed",
              completed_at: t.status === "completed" ? null : new Date().toISOString(),
            }
          : t
      )
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Tasks Management"
        description="Granular work items across all active client service streams and project deliverables."
        actions={
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs"
          >
            <Plus className="h-4 w-4" />
            Create Task
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-secondary/50 border border-border/80 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-secondary/70 border border-border/80 rounded-lg px-2.5 py-1.5 text-foreground focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="backlog">Backlog</option>
            <option value="planned">Planned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs bg-secondary/70 border border-border/80 rounded-lg px-2.5 py-1.5 text-foreground focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Create Task Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground">Create New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement responsive tablet navigation drawer"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Details, technical acceptance criteria, or asset links..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 focus:outline-hidden"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => {
          const isDone = task.status === "completed";
          return (
            <div
              key={task.id}
              className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 bg-card ${
                isDone ? "opacity-60 border-border/60" : "border-border shadow-2xs hover:border-border/90"
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => toggleTaskComplete(task.id)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-0 cursor-pointer"
                />
                <div className="space-y-0.5 min-w-0">
                  <p className={`text-xs font-bold text-foreground truncate ${isDone ? "line-through" : ""}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-[11px] text-muted-foreground truncate">{task.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <span
                  className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                    task.priority === "urgent"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : task.priority === "high"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-secondary text-muted-foreground border-border"
                  }`}
                >
                  {task.priority}
                </span>

                <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
                  Due {formatDate(task.due_date)}
                </span>

                <StatusBadge status={task.status} />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
