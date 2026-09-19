import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useTasks } from "@/hooks/useTasks";
import { useDeliverables } from "@/hooks/useDeliverables";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/utils";
import {
  CheckSquare,
  FileCheck2,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

export function TeamDashboardPage() {
  const { user } = useAuth();
  const { tasks, updateStatus } = useTasks();
  const { deliverables } = useDeliverables();
  const { events } = useCalendarEvents();

  // Filter tasks assigned to current team member
  const myTasks = tasks.filter((t) => t.assignee_id === user?.id || !t.assignee_id);
  const pendingTasks = myTasks.filter((t) => t.status !== "completed");
  const completedTasks = myTasks.filter((t) => t.status === "completed");

  const handleToggle = async (t: any) => {
    const nextStatus = t.status === "completed" ? "in_progress" : "completed";
    await updateStatus({ id: t.id, status: nextStatus });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 sm:space-y-8"
    >
      {/* Header */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded border border-blue-200">
              Production Workspace
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome, {user?.full_name?.split(" ")[0] || "Operator"}
          </h1>
          <p className="text-xs text-muted-foreground">
            Role: {user?.title || "Production Specialist"} • Focus: High-quality deliverable execution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3.5 rounded-xl bg-secondary/50 border border-border text-center min-w-28">
            <span className="text-[10px] uppercase font-mono text-muted-foreground block">Active Tasks</span>
            <span className="text-xl font-bold font-mono text-foreground">{pendingTasks.length}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-secondary/50 border border-border text-center min-w-28">
            <span className="text-[10px] uppercase font-mono text-muted-foreground block">Completed</span>
            <span className="text-xl font-bold font-mono text-emerald-600">{completedTasks.length}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Assigned Tasks & Production Shoots */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Assigned Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold text-foreground">My Assigned Tasks</h2>
              </div>
              <Link
                to="/team/tasks"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                All tasks <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="divide-y divide-border/60">
              {myTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground py-6 text-center italic">
                  No active tasks assigned to your queue.
                </p>
              ) : (
                myTasks.slice(0, 6).map((task) => {
                  const isDone = task.status === "completed";
                  return (
                    <div
                      key={task.id}
                      className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => handleToggle(task)}
                          className={`h-5 w-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                            isDone
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-border hover:border-primary"
                          }`}
                        >
                          {isDone && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </button>
                        <span
                          className={`text-xs font-medium truncate ${
                            isDone ? "line-through text-muted-foreground" : "text-foreground"
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge status={task.priority} />
                        <StatusBadge status={task.status} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Production Schedule */}
        <div className="space-y-4">
          <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold text-foreground">Studio & Shoots</h2>
              </div>
            </div>

            <div className="space-y-3">
              {events.slice(0, 4).map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-xl bg-secondary/40 border border-border/70 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground truncate">{evt.title}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {formatDate(evt.start_time, "MMM d")}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">{evt.description}</p>
                </div>
              ))}
            </div>

            <Link
              to="/team/calendar"
              className="w-full block py-2 text-center text-xs font-semibold text-foreground bg-secondary hover:bg-secondary/80 rounded-lg border border-border transition-colors"
            >
              View Full Schedule →
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
