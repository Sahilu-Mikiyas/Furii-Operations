import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQuery, b as useQueryClient, a as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as useWorkspace, u as useServerFn } from "./createSsrRpc-BN6DI1sa.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { L as Label } from "./label-C8WJLhmR.mjs";
import { a as upsertGoal, b as deleteGoal, c as listGoals } from "./operations.functions-BJJ4r6Fq.mjs";
import "../_libs/seroval.mjs";
import { T as Target, d as Plus, a6 as TrendingUp, af as CirclePause, r as CircleCheck, D as Circle, L as LoaderCircle, v as Pencil, t as Trash2, X } from "../_libs/lucide-react.mjs";
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
  active: {
    label: "Active",
    icon: Circle,
    color: "text-primary",
    bg: "bg-primary/10 text-primary"
  },
  completed: {
    label: "Completed",
    icon: CircleCheck,
    color: "text-emerald-600",
    bg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
  },
  paused: {
    label: "Paused",
    icon: CirclePause,
    color: "text-amber-500",
    bg: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
  }
};
function GoalsPage() {
  const {
    current
  } = useWorkspace();
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [editingGoal, setEditingGoal] = reactExports.useState(null);
  const [activeTab, setActiveTab] = reactExports.useState("active");
  const fetchGoals = useServerFn(listGoals);
  const workspaceId = current?.id;
  const goalsQuery = useQuery({
    queryKey: ["goals", workspaceId],
    queryFn: () => fetchGoals({
      data: {
        workspace_id: workspaceId
      }
    }),
    enabled: !!workspaceId
  });
  if (!current) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-sm text-muted-foreground", children: "Pick a workspace to begin." });
  const goals = goalsQuery.data?.goals ?? [];
  const filtered = activeTab === "all" ? goals : goals.filter((g) => g.status === activeTab);
  const completedCount = goals.filter((g) => g.status === "completed").length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-3xl px-6 py-10 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-end justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-serif text-3xl flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "h-7 w-7 text-primary" }),
          " Shared Goals"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Dream big together. Track your relationship goals as a team." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
        setEditingGoal(null);
        setDialogOpen(true);
      }, className: "rounded-xl gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " New Goal"
      ] })
    ] }),
    goals.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-4 shadow-[var(--shadow-soft)] space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm font-medium", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4 text-primary" }),
          " Goals Progress"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
          completedCount,
          "/",
          goals.length,
          " completed"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-full bg-accent rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-primary rounded-full transition-all", style: {
        width: `${goals.length > 0 ? completedCount / goals.length * 100 : 0}%`
      } }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border bg-card p-0.5 flex gap-0.5 w-fit text-sm", children: ["active", "paused", "completed", "all"].map((tab) => {
      const count = tab === "all" ? goals.length : goals.filter((g) => g.status === tab).length;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActiveTab(tab), className: `inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-medium transition text-xs ${activeTab === tab ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`, children: [
        tab === "all" ? "All" : STATUS_CONFIG[tab].label,
        count > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === tab ? "bg-white/20" : "bg-accent text-muted-foreground"}`, children: count })
      ] }, tab);
    }) }),
    goalsQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
      " Loading…"
    ] }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-dashed bg-card p-14 text-center text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { className: "mx-auto h-10 w-10 text-muted-foreground/40 mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
        "No ",
        activeTab === "all" ? "" : activeTab,
        " goals yet."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1", children: "Set a meaningful goal to work toward together." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: filtered.map((goal) => /* @__PURE__ */ jsxRuntimeExports.jsx(GoalCard, { goal, workspaceId, queryKey: ["goals", workspaceId], onEdit: () => {
      setEditingGoal(goal);
      setDialogOpen(true);
    } }, goal.id)) }),
    dialogOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(GoalDialog, { workspaceId: current.id, initial: editingGoal, onClose: () => setDialogOpen(false), queryKey: ["goals", current.id] })
  ] });
}
function GoalCard({
  goal,
  workspaceId,
  queryKey,
  onEdit
}) {
  const qc = useQueryClient();
  const upsert = useServerFn(upsertGoal);
  const remove = useServerFn(deleteGoal);
  const cfg = STATUS_CONFIG[goal.status];
  const StatusIcon = cfg.icon;
  const cycleStatus = useMutation({
    mutationFn: () => {
      const next = {
        active: "completed",
        completed: "active",
        paused: "active"
      };
      return upsert({
        data: {
          workspace_id: workspaceId,
          id: goal.id,
          title: goal.title,
          status: next[goal.status]
        }
      });
    },
    onSuccess: () => qc.invalidateQueries({
      queryKey
    }),
    onError: (e) => toast.error(e.message)
  });
  const del = useMutation({
    mutationFn: () => remove({
      data: {
        id: goal.id
      }
    }),
    onSuccess: () => {
      toast.success("Goal removed");
      qc.invalidateQueries({
        queryKey
      });
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `group flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-[var(--shadow-soft)] hover:shadow-md transition ${goal.status === "completed" ? "opacity-70" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "shrink-0", onClick: () => cycleStatus.mutate(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusIcon, { className: `h-5 w-5 ${cfg.color} ${goal.status === "active" ? "hover:text-emerald-500" : ""} transition` }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `flex-1 text-sm font-medium ${goal.status === "completed" ? "line-through" : ""}`, children: goal.title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[10px] font-semibold rounded-full px-2 py-0.5 ${cfg.bg} shrink-0`, children: cfg.label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0", onClick: onEdit, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5 text-muted-foreground" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0", onClick: () => del.mutate(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-muted-foreground hover:text-destructive" }) })
  ] });
}
function GoalDialog({
  initial,
  workspaceId,
  onClose,
  queryKey
}) {
  const qc = useQueryClient();
  const upsert = useServerFn(upsertGoal);
  const [title, setTitle] = reactExports.useState(initial?.title ?? "");
  const [status, setStatus] = reactExports.useState(initial?.status ?? "active");
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
          status
        }
      });
      toast.success(initial ? "Updated!" : "Goal set! 🎯");
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
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/30 backdrop-blur-[2px] p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: save, className: "w-full max-w-sm rounded-2xl border bg-card p-6 shadow-xl space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-serif text-2xl", children: initial ? "Edit Goal" : "New Goal" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "icon", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Goal" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, autoFocus: true, value: title, onChange: (e) => setTitle(e.target.value), placeholder: "e.g. Move to a bigger place together" })
      ] }),
      initial && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm", value: status, onChange: (e) => setStatus(e.target.value), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "active", children: "Active" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "paused", children: "Paused" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "completed", children: "Completed" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2 border-t", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: busy || !title.trim(), className: "rounded-xl", children: [
        busy && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
        initial ? "Save" : "Add Goal"
      ] })
    ] })
  ] }) });
}
export {
  GoalsPage as component
};
