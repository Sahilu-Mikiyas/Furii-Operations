import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQuery, b as useQueryClient, a as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as useWorkspace, u as useServerFn } from "./createSsrRpc-BN6DI1sa.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { L as Label } from "./label-C8WJLhmR.mjs";
import { T as Textarea } from "./textarea-F69quoCd.mjs";
import { u as upsertSharedTask, d as deleteSharedTask, l as listSharedTasks } from "./operations.functions-BJJ4r6Fq.mjs";
import "../_libs/seroval.mjs";
import { i as isPast, p as parseISO, a as isToday, f as format } from "../_libs/date-fns.mjs";
import { m as ClipboardList, d as Plus, y as CircleAlert, U as Users, z as UserCheck, b as User, L as LoaderCircle, r as CircleCheck, D as Circle, E as Tag, F as Clock, v as Pencil, t as Trash2, X } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "./server-DhrmKQ4T.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "./auth-middleware-ud2LaeJ8.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/zod.mjs";
const STATUS_CONFIG = {
  todo: {
    label: "To Do",
    color: "text-slate-600",
    bg: "bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
  },
  in_progress: {
    label: "In Progress",
    color: "text-amber-600",
    bg: "bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300"
  },
  done: {
    label: "Done",
    color: "text-emerald-600",
    bg: "bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300"
  }
};
const ASSIGNEE_CONFIG = {
  self: {
    label: "Me",
    icon: User,
    color: "text-violet-600"
  },
  partner: {
    label: "Partner",
    icon: UserCheck,
    color: "text-rose-600"
  },
  joint: {
    label: "Together",
    icon: Users,
    color: "text-teal-600"
  }
};
const TASK_CATEGORIES = ["🛒 Groceries", "🏠 Home", "💳 Finance", "📋 Admin", "🎉 Events", "💌 Relationship", "🌿 Health", "📦 Errands", "Other"];
function TasksPage() {
  const {
    current
  } = useWorkspace();
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [editingTask, setEditingTask] = reactExports.useState(null);
  const [filterAssignee, setFilterAssignee] = reactExports.useState("all");
  const [filterStatus, setFilterStatus] = reactExports.useState("active");
  const [filterCategory, setFilterCategory] = reactExports.useState("all");
  const fetchTasks = useServerFn(listSharedTasks);
  const workspaceId = current?.id;
  const tasksQuery = useQuery({
    queryKey: ["shared-tasks", workspaceId],
    queryFn: () => fetchTasks({
      data: {
        workspace_id: workspaceId
      }
    }),
    enabled: !!workspaceId
  });
  if (!current) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-sm text-muted-foreground", children: "Pick a workspace to begin." });
  const tasks = tasksQuery.data?.tasks ?? [];
  const filtered = reactExports.useMemo(() => tasks.filter((t) => {
    if (filterAssignee !== "all" && t.assignee !== filterAssignee) return false;
    if (filterStatus === "active" && t.status === "done") return false;
    if (filterStatus !== "active" && filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterCategory !== "all" && t.category !== filterCategory) return false;
    return true;
  }), [tasks, filterAssignee, filterStatus, filterCategory]);
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const overdueCount = tasks.filter((t) => t.status !== "done" && t.due_date && isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date))).length;
  Array.from(new Set(tasks.map((t) => t.category).filter(Boolean)));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-4xl px-6 py-10 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-end justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-serif text-3xl flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-7 w-7 text-primary" }),
          " Shared Tasks"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Household tasks, errands, and shared responsibilities — all in one place." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
        setEditingTask(null);
        setDialogOpen(true);
      }, className: "rounded-xl gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " Add Task"
      ] })
    ] }),
    tasks.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3 text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full border px-3 py-1 text-muted-foreground", children: [
        tasks.filter((t) => t.status !== "done").length,
        " open"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full border px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400", children: [
        "✓ ",
        doneCount,
        " done"
      ] }),
      overdueCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full border px-3 py-1 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-3 w-3" }),
        " ",
        overdueCount,
        " overdue"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 items-center text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border bg-card p-0.5 flex gap-0.5", children: ["all", "self", "partner", "joint"].map((a) => {
        const cfg = a === "all" ? null : ASSIGNEE_CONFIG[a];
        const Icon = cfg?.icon;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setFilterAssignee(a), className: `inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition text-xs ${filterAssignee === a ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`, children: [
          Icon && /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3 w-3" }),
          a === "all" ? "Everyone" : cfg.label
        ] }, a);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border bg-card p-0.5 flex gap-0.5", children: ["active", "todo", "in_progress", "done"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFilterStatus(s), className: `rounded-lg px-3 py-1.5 font-medium transition text-xs ${filterStatus === s ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`, children: s === "active" ? "Active" : STATUS_CONFIG[s].label }, s)) })
    ] }),
    tasksQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
      " Loading…"
    ] }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-dashed bg-card p-14 text-center text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "mx-auto h-10 w-10 text-muted-foreground/40 mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No tasks here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1", children: "Add a shared task to coordinate with your partner." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: filtered.map((task) => /* @__PURE__ */ jsxRuntimeExports.jsx(TaskCard, { task, workspaceId, queryKey: ["shared-tasks", workspaceId], onEdit: () => {
      setEditingTask(task);
      setDialogOpen(true);
    } }, task.id)) }),
    dialogOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(TaskDialog, { workspaceId: current.id, initial: editingTask, onClose: () => setDialogOpen(false), queryKey: ["shared-tasks", current.id] })
  ] });
}
function TaskCard({
  task,
  workspaceId,
  queryKey,
  onEdit
}) {
  const qc = useQueryClient();
  const upsert = useServerFn(upsertSharedTask);
  const deleteTask = useServerFn(deleteSharedTask);
  const isDone = task.status === "done";
  const isOverdue = !isDone && task.due_date && isPast(parseISO(task.due_date)) && !isToday(parseISO(task.due_date));
  const isDueToday = !isDone && task.due_date && isToday(parseISO(task.due_date));
  const assigneeCfg = ASSIGNEE_CONFIG[task.assignee];
  const AssigneeIcon = assigneeCfg.icon;
  const cycleStatus = useMutation({
    mutationFn: () => {
      const next = {
        todo: "in_progress",
        in_progress: "done",
        done: "todo"
      };
      const newStatus = next[task.status];
      return upsert({
        data: {
          workspace_id: workspaceId,
          id: task.id,
          title: task.title,
          assignee: task.assignee,
          status: newStatus,
          completed_at: newStatus === "done" ? (/* @__PURE__ */ new Date()).toISOString() : null
        }
      });
    },
    onSuccess: () => qc.invalidateQueries({
      queryKey
    }),
    onError: (e) => toast.error(e.message)
  });
  const remove = useMutation({
    mutationFn: () => deleteTask({
      data: {
        id: task.id
      }
    }),
    onSuccess: () => {
      toast.success("Task removed");
      qc.invalidateQueries({
        queryKey
      });
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `group flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-[var(--shadow-soft)] hover:shadow-md transition ${isDone ? "opacity-60" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "mt-0.5 shrink-0", onClick: () => cycleStatus.mutate(), children: isDone ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-5 w-5 text-emerald-500" }) : task.status === "in_progress" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-5 w-5 text-amber-400 fill-amber-100" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-5 w-5 text-muted-foreground/40 hover:text-primary transition" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 space-y-1 cursor-pointer", onClick: onEdit, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-sm font-medium leading-snug ${isDone ? "line-through" : ""}`, children: task.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5 ${STATUS_CONFIG[task.status].bg}`, children: STATUS_CONFIG[task.status].label })
      ] }),
      task.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground line-clamp-1", children: task.description }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-0.5 ${assigneeCfg.color}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AssigneeIcon, { className: "h-3 w-3" }),
          " ",
          assigneeCfg.label
        ] }),
        task.category && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: "h-3 w-3" }),
          " ",
          task.category
        ] }),
        task.due_date && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-0.5 font-medium ${isOverdue ? "text-rose-500" : isDueToday ? "text-amber-500" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
          isOverdue ? "Overdue · " : isDueToday ? "Due today · " : "",
          format(parseISO(task.due_date), "MMM d")
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 opacity-0 group-hover:opacity-100", onClick: onEdit, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5 text-muted-foreground" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 opacity-0 group-hover:opacity-100", onClick: () => remove.mutate(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-muted-foreground hover:text-destructive" }) })
    ] })
  ] });
}
function TaskDialog({
  initial,
  workspaceId,
  onClose,
  queryKey
}) {
  const qc = useQueryClient();
  const upsert = useServerFn(upsertSharedTask);
  const [title, setTitle] = reactExports.useState(initial?.title ?? "");
  const [description, setDescription] = reactExports.useState(initial?.description ?? "");
  const [assignee, setAssignee] = reactExports.useState(initial?.assignee ?? "joint");
  const [status, setStatus] = reactExports.useState(initial?.status ?? "todo");
  const [category, setCategory] = reactExports.useState(initial?.category ?? "");
  const [dueDate, setDueDate] = reactExports.useState(initial?.due_date ?? "");
  const [busy, setBusy] = reactExports.useState(false);
  async function save(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      await upsert({
        data: {
          workspace_id: workspaceId,
          id: initial?.id,
          title: title.trim(),
          description: description.trim() || null,
          assignee,
          status,
          category: category.trim() || null,
          due_date: dueDate || null,
          completed_at: status === "done" ? (/* @__PURE__ */ new Date()).toISOString() : null
        }
      });
      toast.success(initial ? "Task updated" : "Task added!");
      qc.invalidateQueries({
        queryKey
      });
      onClose();
    } catch (err) {
      toast.error(err.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/30 backdrop-blur-[2px] p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: save, className: "w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-serif text-2xl", children: initial ? "Edit Task" : "New Task" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "icon", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Title" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, autoFocus: true, value: title, onChange: (e) => setTitle(e.target.value), placeholder: "e.g. Buy groceries for dinner" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assigned To" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm", value: assignee, onChange: (e) => setAssignee(e.target.value), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "self", children: "👤 Me" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "partner", children: "🤝 Partner" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "joint", children: "👫 Together" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm", value: status, onChange: (e) => setStatus(e.target.value), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "todo", children: "To Do" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "in_progress", children: "In Progress" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "done", children: "Done" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm", value: category, onChange: (e) => setCategory(e.target.value), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "No category" }),
            TASK_CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c, children: c }, c))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Due Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", className: "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm", value: dueDate, onChange: (e) => setDueDate(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: description, onChange: (e) => setDescription(e.target.value), placeholder: "Any extra details…" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2 border-t", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: busy || !title.trim(), className: "rounded-xl", children: [
        busy && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
        initial ? "Save Changes" : "Add Task"
      ] })
    ] })
  ] }) });
}
export {
  TasksPage as component
};
