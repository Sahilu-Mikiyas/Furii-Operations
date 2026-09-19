import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useTasks } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/utils";
import {
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  Trash2,
  Edit3,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { Task, TaskStatus, TaskPriority, Visibility } from "@/types";

export function TasksPage() {
  const { role } = useAuth();
  const isManager = role === "manager" || role === "super_admin" || role === "admin";
  const { tasks, updateStatus, createTask, updateTask, deleteTask, isLoading } = useTasks();
  const { projects } = useProjects();
  const { clients } = useClients();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>("medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [newProjectId, setNewProjectId] = useState("");
  const [newVisibility, setNewVisibility] = useState<Visibility>("client");
  const [submitting, setSubmitting] = useState(false);

  // Edit task modal state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPriority, setEditPriority] = useState<TaskPriority>("medium");
  const [editStatus, setEditStatus] = useState<TaskStatus>("planned");
  const [editDueDate, setEditDueDate] = useState("");
  const [editVisibility, setEditVisibility] = useState<Visibility>("client");
  const [isEditing, setIsEditing] = useState(false);

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSubmitting(true);

    try {
      const selectedProj = projects.find((p) => p.id === newProjectId) || projects[0];
      const targetClientId = selectedProj?.client_id || clients[0]?.id;

      if (!targetClientId) {
        toast.error("Please onboard a client first.");
        return;
      }

      await createTask({
        title: newTitle,
        description: newDesc,
        priority: newPriority,
        due_date: newDueDate || null,
        project_id: selectedProj?.id,
        client_id: targetClientId,
        status: "planned",
        visibility: newVisibility,
      });

      toast.success("Task created successfully.");
      setNewTitle("");
      setNewDesc("");
      setNewDueDate("");
      setShowCreateModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create task.");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDesc(task.description || "");
    setEditPriority(task.priority || "medium");
    setEditStatus(task.status || "planned");
    setEditDueDate(task.due_date || "");
    setEditVisibility(task.visibility || "client");
  };

  const handleEditTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTitle.trim()) return;
    setIsEditing(true);

    try {
      await updateTask({
        id: editingTask.id,
        updates: {
          title: editTitle,
          description: editDesc,
          priority: editPriority,
          status: editStatus,
          due_date: editDueDate || null,
          visibility: editVisibility,
        },
      });

      toast.success(`Task "${editTitle}" updated.`);
      setEditingTask(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to update task.");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteTask = async (task: Task) => {
    if (!window.confirm(`Are you sure you want to delete task "${task.title}"?`)) return;
    try {
      await deleteTask(task.id);
      toast.success(`Task "${task.title}" deleted.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete task.");
    }
  };

  const handleToggleTaskStatus = async (task: Task) => {
    const nextStatus: TaskStatus = task.status === "completed" ? "in_progress" : "completed";
    try {
      await updateStatus({ id: task.id, status: nextStatus });
      toast.success(nextStatus === "completed" ? "Task marked completed!" : "Task set back in progress.");
    } catch (err: any) {
      toast.error(err.message || "Failed to update task.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Tasks & Granular Execution"
        description="Granular work items across all active client service streams, design revisions, and project deliverables."
        actions={
          isManager && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Create Task
            </button>
          )
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

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-secondary/50 border border-border/80 rounded-lg px-2 py-1 text-foreground focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs bg-secondary/50 border border-border/80 rounded-lg px-2 py-1 text-foreground focus:outline-hidden"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="p-12 flex justify-center text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-2xl border border-border space-y-2">
          <CheckCircle2 className="w-8 h-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No tasks found</h3>
          <p className="text-xs text-muted-foreground">Clear filters or create a new task item.</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border/90 divide-y divide-border/60 shadow-2xs overflow-hidden">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === "completed";
            const isOverdue =
              task.due_date && !isCompleted && new Date(task.due_date) < new Date(new Date().toDateString());

            return (
              <div
                key={task.id}
                className={`p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 transition-colors hover:bg-secondary/20 ${
                  isCompleted ? "opacity-60 bg-secondary/10" : ""
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <button
                    onClick={() => handleToggleTaskStatus(task)}
                    className={`mt-0.5 sm:mt-0 h-5 w-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      isCompleted
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </button>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4
                        className={`text-sm font-bold text-foreground ${
                          isCompleted ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {task.title}
                      </h4>
                      <StatusBadge status={task.priority} />
                      <StatusBadge status={task.status} />
                      {task.visibility === "internal" && (
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-semibold">
                          Internal
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {task.due_date && (
                    <div
                      className={`flex items-center gap-1.5 text-xs font-mono ${
                        isOverdue ? "text-rose-600 font-bold" : "text-muted-foreground"
                      }`}
                    >
                      {isOverdue ? <AlertTriangle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                      <span>{formatDate(task.due_date)}</span>
                    </div>
                  )}

                  {isManager && (
                    <div className="flex items-center gap-1 border-l border-border pl-2">
                      <button
                        onClick={() => openEditModal(task)}
                        className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors cursor-pointer"
                        title="Edit task"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task)}
                        className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Create Production Task</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Export 3D packaging rendering"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Assign to Project</label>
                <select
                  value={newProjectId}
                  onChange={(e) => setNewProjectId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
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
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Client Visibility</label>
                <select
                  value={newVisibility}
                  onChange={(e) => setNewVisibility(e.target.value as Visibility)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                >
                  <option value="client">Client & Internal</option>
                  <option value="internal">Internal Team Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Notes / Instructions</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Technical requirements and deliverables context..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg border border-border cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Task
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
            className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Edit Task</h2>
              <button onClick={() => setEditingTask(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleEditTaskSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  >
                    <option value="planned">Planned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="in_review">In Review</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Priority</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
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
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Visibility</label>
                  <select
                    value={editVisibility}
                    onChange={(e) => setEditVisibility(e.target.value as Visibility)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  >
                    <option value="client">Client & Internal</option>
                    <option value="internal">Internal Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Description / Notes</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
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
                  disabled={isEditing}
                  className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isEditing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
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
