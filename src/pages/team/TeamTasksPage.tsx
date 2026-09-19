import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useTasks } from "@/hooks/useTasks";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/utils";
import { Search, CheckCircle2, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { TaskStatus } from "@/types";

export function TeamTasksPage() {
  const { user } = useAuth();
  const { tasks, updateStatus, isLoading } = useTasks();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const myTasks = tasks.filter((t) => t.assignee_id === user?.id || !t.assignee_id);

  const filteredTasks = myTasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleToggleTaskStatus = async (task: any) => {
    const nextStatus: TaskStatus = task.status === "completed" ? "in_progress" : "completed";
    try {
      await updateStatus({ id: task.id, status: nextStatus });
      toast.success(nextStatus === "completed" ? "Task completed!" : "Task active.");
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
        title="My Assigned Production Tasks"
        description="Individual backlog items, active tickets, and milestone deliverables assigned to you."
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search my tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-secondary/50 border border-border/80 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-muted-foreground">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-secondary/50 border border-border/80 rounded-lg px-2.5 py-1 text-foreground focus:outline-hidden"
          >
            <option value="all">All Items</option>
            <option value="in_progress">In Progress</option>
            <option value="planned">Planned</option>
            <option value="completed">Completed</option>
          </select>
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
          <h3 className="text-sm font-bold text-foreground">No tasks in this view</h3>
          <p className="text-xs text-muted-foreground">You are all caught up on your production queue.</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border divide-y divide-border/60 shadow-2xs overflow-hidden">
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
                    </div>
                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono shrink-0">
                  {task.due_date && (
                    <div
                      className={`flex items-center gap-1.5 ${
                        isOverdue ? "text-rose-600 font-bold" : "text-muted-foreground"
                      }`}
                    >
                      {isOverdue ? <AlertTriangle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                      <span>{formatDate(task.due_date)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
