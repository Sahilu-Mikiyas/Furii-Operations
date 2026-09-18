import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQuery, b as useQueryClient, a as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as useWorkspace, u as useServerFn, c as createSsrRpc } from "./createSsrRpc-BN6DI1sa.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { L as Label } from "./label-C8WJLhmR.mjs";
import { T as Textarea } from "./textarea-F69quoCd.mjs";
import { a as createServerFn } from "./server-DhrmKQ4T.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-ud2LaeJ8.mjs";
import "../_libs/seroval.mjs";
import { G as Gift, ag as PiggyBank, ah as History, d as Plus, t as Trash2, ai as DollarSign, a0 as ExternalLink, f as Calendar, s as Star, X, L as LoaderCircle } from "../_libs/lucide-react.mjs";
import { g as objectType, i as stringType, k as enumType, h as numberType } from "../_libs/zod.mjs";
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
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
const wsId = objectType({
  workspace_id: stringType().uuid()
});
const listGiftIdeas = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(createSsrRpc("7f157400ef4ad94eb3d14dc6d8f1d0b8d42d2ef6e35011e0f6c2f156d4c1affd"));
const upsertIdeaInput = objectType({
  workspace_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  title: stringType().trim().min(1).max(200),
  notes: stringType().max(4e3).optional().nullable(),
  price: numberType().optional().nullable(),
  url: stringType().max(2e3).optional().nullable(),
  image_url: stringType().max(500).optional().nullable(),
  status: enumType(["idea", "purchased", "given"]).default("idea")
});
const upsertGiftIdea = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertIdeaInput.parse(d)).handler(createSsrRpc("094758bb2385d0acfe2800057fd0dd77dbaac03b14d04b910a2cbd9252bf48f8"));
const deleteGiftIdea = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("ebf28ed6c14dfe9e971607aed6d15510922100a7ebe4ee1b772d46511aa120f6"));
const listGiftBudgets = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(createSsrRpc("ae3249a1148e1f6fa08b1ec2ff1bed2cf31d0bda8b6ea588fa08f1636e42fad0"));
const upsertBudgetInput = objectType({
  workspace_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  title: stringType().trim().min(1).max(200),
  target_amount: numberType().min(0),
  current_amount: numberType().min(0).default(0),
  deadline: stringType().optional().nullable()
});
const upsertGiftBudget = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertBudgetInput.parse(d)).handler(createSsrRpc("7cb20175caabf5b47572826332f656e34544a6cd28eea2c70a0ec3fdd6559a87"));
const deleteGiftBudget = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("21e68940730e8a8bad7fff43eebc2966a843069c75c9395c960325446abd0742"));
const listGiftHistory = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(createSsrRpc("2bceae9cf0658ef0b95b9194b811153bf2b8012b273eedf2f413c7d36b566047"));
const historyInput = objectType({
  workspace_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  title: stringType().trim().min(1).max(200),
  recipient: stringType().trim().min(1).max(120),
  date_given: stringType().min(8),
  rating: numberType().min(1).max(5).optional().nullable(),
  reaction_notes: stringType().max(4e3).optional().nullable()
});
const upsertGiftHistory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => historyInput.parse(d)).handler(createSsrRpc("f92776e11261d24719a97ac376b304ef33c7d37953a0a216b2ff55c04f7a7b7e"));
const deleteGiftHistory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("83180189ed541eaf7b77f49e6a388a5b0ac430e21d4520b18ebe89954c7f8c03"));
function GiftVaultPage() {
  const {
    current
  } = useWorkspace();
  const [activeTab, setActiveTab] = reactExports.useState("ideas");
  const [dialogType, setDialogType] = reactExports.useState(null);
  const [selectedItem, setSelectedItem] = reactExports.useState(null);
  const fetchIdeas = useServerFn(listGiftIdeas);
  const fetchBudgets = useServerFn(listGiftBudgets);
  const fetchHistory = useServerFn(listGiftHistory);
  const workspaceId = current?.id;
  const ideasQuery = useQuery({
    queryKey: ["gift-ideas", workspaceId],
    queryFn: () => fetchIdeas({
      data: {
        workspace_id: workspaceId
      }
    }),
    enabled: !!workspaceId
  });
  const budgetsQuery = useQuery({
    queryKey: ["gift-budgets", workspaceId],
    queryFn: () => fetchBudgets({
      data: {
        workspace_id: workspaceId
      }
    }),
    enabled: !!workspaceId
  });
  const historyQuery = useQuery({
    queryKey: ["gift-history", workspaceId],
    queryFn: () => fetchHistory({
      data: {
        workspace_id: workspaceId
      }
    }),
    enabled: !!workspaceId
  });
  if (!current) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-sm text-muted-foreground", children: "Pick a workspace to begin." });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-5xl px-6 py-10 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-end justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-serif text-3xl", children: "Gift Vault" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Keep gift ideas, budget for occasions, and record their smiles." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-1 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActiveTab("ideas"), className: `inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-medium transition ${activeTab === "ideas" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "h-3.5 w-3.5" }),
            " Ideas"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActiveTab("budgets"), className: `inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-medium transition ${activeTab === "budgets" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PiggyBank, { className: "h-3.5 w-3.5" }),
            " Budgets"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActiveTab("history"), className: `inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-medium transition ${activeTab === "history" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "h-3.5 w-3.5" }),
            " History"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
          setSelectedItem(null);
          setDialogType(activeTab === "ideas" ? "idea" : activeTab === "budgets" ? "budget" : "history");
        }, className: "rounded-xl gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          activeTab === "ideas" ? "New Idea" : activeTab === "budgets" ? "New Budget" : "Log Gift"
        ] })
      ] })
    ] }),
    activeTab === "ideas" && /* @__PURE__ */ jsxRuntimeExports.jsx(IdeasTab, { workspaceId: current.id, loading: ideasQuery.isLoading, ideas: ideasQuery.data?.ideas ?? [], onEdit: (item) => {
      setSelectedItem(item);
      setDialogType("idea");
    } }),
    activeTab === "budgets" && /* @__PURE__ */ jsxRuntimeExports.jsx(BudgetsTab, { workspaceId: current.id, loading: budgetsQuery.isLoading, budgets: budgetsQuery.data?.budgets ?? [], onEdit: (item) => {
      setSelectedItem(item);
      setDialogType("budget");
    } }),
    activeTab === "history" && /* @__PURE__ */ jsxRuntimeExports.jsx(HistoryTab, { workspaceId: current.id, loading: historyQuery.isLoading, history: historyQuery.data?.history ?? [], onEdit: (item) => {
      setSelectedItem(item);
      setDialogType("history");
    } }),
    dialogType === "idea" && /* @__PURE__ */ jsxRuntimeExports.jsx(IdeaDialog, { workspaceId: current.id, initial: selectedItem, onClose: () => setDialogType(null), queryKey: ["gift-ideas", current.id] }),
    dialogType === "budget" && /* @__PURE__ */ jsxRuntimeExports.jsx(BudgetDialog, { workspaceId: current.id, initial: selectedItem, onClose: () => setDialogType(null), queryKey: ["gift-budgets", current.id] }),
    dialogType === "history" && /* @__PURE__ */ jsxRuntimeExports.jsx(HistoryDialog, { workspaceId: current.id, initial: selectedItem, onClose: () => setDialogType(null), queryKey: ["gift-history", current.id] })
  ] });
}
function IdeasTab({
  ideas,
  loading,
  workspaceId,
  onEdit
}) {
  const qc = useQueryClient();
  const deleteIdea = useServerFn(deleteGiftIdea);
  const upsertIdea = useServerFn(upsertGiftIdea);
  const remove = useMutation({
    mutationFn: (id) => deleteIdea({
      data: {
        id
      }
    }),
    onSuccess: () => {
      toast.success("Idea removed");
      qc.invalidateQueries({
        queryKey: ["gift-ideas", workspaceId]
      });
    },
    onError: (e) => toast.error(e.message ?? "Failed")
  });
  const toggleStatus = useMutation({
    mutationFn: ({
      id,
      status
    }) => upsertIdea({
      data: {
        workspace_id: workspaceId,
        id,
        title: ideas.find((i) => i.id === id).title,
        status
      }
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["gift-ideas", workspaceId]
      });
    },
    onError: (e) => toast.error(e.message ?? "Failed")
  });
  if (loading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Loading ideas…" });
  if (ideas.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "mx-auto h-10 w-10 text-muted-foreground/60 mb-2" }),
      "No gift ideas logged yet. Save an idea when they mention it!"
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: ideas.map((idea) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => onEdit(idea), className: `group rounded-2xl border bg-card p-5 shadow-[var(--shadow-soft)] flex flex-col justify-between cursor-pointer transition hover:shadow-md ${idea.status === "given" ? "opacity-60" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${idea.status === "given" ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" : idea.status === "purchased" ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"}`, children: idea.status }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: (e) => {
          e.stopPropagation();
          remove.mutate(idea.id);
        }, className: "h-7 w-7 text-muted-foreground hover:text-destructive shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-serif text-lg leading-snug", children: idea.title }),
      idea.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground line-clamp-3 leading-relaxed", children: idea.notes })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 pt-3 border-t flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs", children: [
        idea.price && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-primary inline-flex items-center gap-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-3 w-3" }),
          parseFloat(idea.price).toFixed(2)
        ] }),
        idea.url && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: idea.url, target: "_blank", rel: "noreferrer", onClick: (e) => e.stopPropagation(), className: "inline-flex items-center gap-0.5 text-muted-foreground hover:text-primary", children: [
          "Link ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", onClick: (e) => e.stopPropagation(), children: [
        idea.status === "idea" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => toggleStatus.mutate({
          id: idea.id,
          status: "purchased"
        }), className: "h-7 rounded-lg text-[10px] px-2", children: "Mark Purchased" }),
        idea.status === "purchased" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: () => toggleStatus.mutate({
          id: idea.id,
          status: "given"
        }), className: "h-7 rounded-lg text-[10px] px-2", children: "Mark Given" })
      ] })
    ] })
  ] }, idea.id)) });
}
function BudgetsTab({
  budgets,
  loading,
  workspaceId,
  onEdit
}) {
  const qc = useQueryClient();
  const deleteBudget = useServerFn(deleteGiftBudget);
  const remove = useMutation({
    mutationFn: (id) => deleteBudget({
      data: {
        id
      }
    }),
    onSuccess: () => {
      toast.success("Budget removed");
      qc.invalidateQueries({
        queryKey: ["gift-budgets", workspaceId]
      });
    },
    onError: (e) => toast.error(e.message ?? "Failed")
  });
  if (loading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Loading budgets…" });
  if (budgets.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PiggyBank, { className: "mx-auto h-10 w-10 text-muted-foreground/60 mb-2" }),
      "No savings budgets logged. Create a budget for their birthday or anniversary."
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2", children: budgets.map((b) => {
    const percent = Math.min(100, Math.max(0, Math.round(parseFloat(b.current_amount) / parseFloat(b.target_amount) * 100)));
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => onEdit(b), className: "group rounded-2xl border bg-card p-6 shadow-[var(--shadow-soft)] space-y-4 cursor-pointer hover:shadow-md transition", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-serif text-lg leading-tight", children: b.title }),
          b.deadline && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground inline-flex items-center gap-1 mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3 w-3" }),
            " Deadline: ",
            b.deadline
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: (e) => {
          e.stopPropagation();
          remove.mutate(b.id);
        }, className: "h-8 w-8 text-muted-foreground hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary", children: [
            "$",
            parseFloat(b.current_amount).toFixed(2),
            " saved"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
            "Goal: $",
            parseFloat(b.target_amount).toFixed(2)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-full bg-accent rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-primary transition-all duration-500", style: {
          width: `${percent}%`
        } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-right text-muted-foreground font-semibold", children: [
          percent,
          "% Complete"
        ] })
      ] })
    ] }, b.id);
  }) });
}
function HistoryTab({
  history,
  loading,
  workspaceId,
  onEdit
}) {
  const qc = useQueryClient();
  const deleteHistory = useServerFn(deleteGiftHistory);
  const remove = useMutation({
    mutationFn: (id) => deleteHistory({
      data: {
        id
      }
    }),
    onSuccess: () => {
      toast.success("Gift log removed");
      qc.invalidateQueries({
        queryKey: ["gift-history", workspaceId]
      });
    },
    onError: (e) => toast.error(e.message ?? "Failed")
  });
  if (loading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Loading history…" });
  if (history.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "mx-auto h-10 w-10 text-muted-foreground/60 mb-2" }),
      "No past gifts logged. Record the gifts you give and save their reactions!"
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: history.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => onEdit(h), className: "group rounded-2xl border bg-card p-5 shadow-[var(--shadow-soft)] flex items-start gap-4 justify-between cursor-pointer hover:shadow-md transition", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-primary/10 px-2 py-0.5 text-primary font-medium", children: [
          "To ",
          h.recipient
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Given: ",
          h.date_given
        ] }),
        h.rating && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center text-amber-500 font-semibold gap-0.5", children: [
          h.rating,
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3.5 w-3.5 fill-amber-500" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-serif text-lg leading-tight", children: h.title }),
      h.reaction_notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground leading-relaxed italic", children: [
        'Reaction: "',
        h.reaction_notes,
        '"'
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: (e) => {
      e.stopPropagation();
      remove.mutate(h.id);
    }, className: "h-8 w-8 text-muted-foreground hover:text-destructive shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
  ] }, h.id)) });
}
function IdeaDialog({
  initial,
  workspaceId,
  onClose,
  queryKey
}) {
  const qc = useQueryClient();
  const upsert = useServerFn(upsertGiftIdea);
  const [title, setTitle] = reactExports.useState(initial?.title ?? "");
  const [notes, setNotes] = reactExports.useState(initial?.notes ?? "");
  const [price, setPrice] = reactExports.useState(initial?.price ? String(initial.price) : "");
  const [url, setUrl] = reactExports.useState(initial?.url ?? "");
  const [status, setStatus] = reactExports.useState(initial?.status ?? "idea");
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
          notes: notes.trim() || null,
          price: price.trim() ? parseFloat(price) : null,
          url: url.trim() || null,
          status
        }
      });
      toast.success("Saved");
      qc.invalidateQueries({
        queryKey
      });
      onClose();
    } catch (err) {
      toast.error(err.message ?? "Failed to save");
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/30 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: save, className: "w-full max-w-lg rounded-2xl border bg-card p-6 shadow-xl space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-serif text-2xl", children: initial ? "Edit Idea" : "New Gift Idea" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "icon", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Title" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, value: title, onChange: (e) => setTitle(e.target.value), placeholder: "Product name or idea" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Price ($)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: price, onChange: (e) => setPrice(e.target.value), placeholder: "0.00" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "h-9 w-full rounded-md border border-input bg-transparent px-3", value: status, onChange: (e) => setStatus(e.target.value), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "idea", children: "Idea" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "purchased", children: "Purchased" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "given", children: "Given" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Shop URL" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "url", value: url, onChange: (e) => setUrl(e.target.value), placeholder: "https://..." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 4, value: notes, onChange: (e) => setNotes(e.target.value), placeholder: "Sizing details, color preferences, why they want it..." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex justify-end gap-2 pt-2 border-t", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: busy || !title.trim(), className: "rounded-xl", children: [
        busy && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
        " Save"
      ] })
    ] })
  ] }) });
}
function BudgetDialog({
  initial,
  workspaceId,
  onClose,
  queryKey
}) {
  const qc = useQueryClient();
  const upsert = useServerFn(upsertGiftBudget);
  const [title, setTitle] = reactExports.useState(initial?.title ?? "");
  const [target, setTarget] = reactExports.useState(initial?.target_amount ? String(initial.target_amount) : "");
  const [current, setCurrent] = reactExports.useState(initial?.current_amount ? String(initial.current_amount) : "0");
  const [deadline, setDeadline] = reactExports.useState(initial?.deadline ?? "");
  const [busy, setBusy] = reactExports.useState(false);
  async function save(e) {
    e.preventDefault();
    if (!title.trim() || !target.trim()) return;
    setBusy(true);
    try {
      await upsert({
        data: {
          workspace_id: workspaceId,
          id: initial?.id,
          title: title.trim(),
          target_amount: parseFloat(target),
          current_amount: parseFloat(current || "0"),
          deadline: deadline.trim() || null
        }
      });
      toast.success("Saved");
      qc.invalidateQueries({
        queryKey
      });
      onClose();
    } catch (err) {
      toast.error(err.message ?? "Failed to save");
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/30 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: save, className: "w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-serif text-2xl", children: initial ? "Edit Budget" : "New Savings Budget" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "icon", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Occasion Title" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, value: title, onChange: (e) => setTitle(e.target.value), placeholder: "Sarah's Birthday Gift" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Target Amount ($)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", required: true, step: "0.01", value: target, onChange: (e) => setTarget(e.target.value), placeholder: "200.00" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Current Saved ($)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: current, onChange: (e) => setCurrent(e.target.value), placeholder: "0.00" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Deadline Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: deadline, onChange: (e) => setDeadline(e.target.value) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex justify-end gap-2 pt-2 border-t", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: busy || !title.trim() || !target.trim(), className: "rounded-xl", children: [
        busy && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
        " Save"
      ] })
    ] })
  ] }) });
}
function HistoryDialog({
  initial,
  workspaceId,
  onClose,
  queryKey
}) {
  const qc = useQueryClient();
  const upsert = useServerFn(upsertGiftHistory);
  const [title, setTitle] = reactExports.useState(initial?.title ?? "");
  const [recipient, setRecipient] = reactExports.useState(initial?.recipient ?? "");
  const [date, setDate] = reactExports.useState(initial?.date_given ?? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [rating, setRating] = reactExports.useState(initial?.rating ?? 5);
  const [reaction, setReaction] = reactExports.useState(initial?.reaction_notes ?? "");
  const [busy, setBusy] = reactExports.useState(false);
  async function save(e) {
    e.preventDefault();
    if (!title.trim() || !recipient.trim() || !date.trim()) return;
    setBusy(true);
    try {
      await upsert({
        data: {
          workspace_id: workspaceId,
          id: initial?.id,
          title: title.trim(),
          recipient: recipient.trim(),
          date_given: date,
          rating,
          reaction_notes: reaction.trim() || null
        }
      });
      toast.success("Logged");
      qc.invalidateQueries({
        queryKey
      });
      onClose();
    } catch (err) {
      toast.error(err.message ?? "Failed to save");
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/30 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: save, className: "w-full max-w-lg rounded-2xl border bg-card p-6 shadow-xl space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-serif text-2xl", children: initial ? "Edit Gift Log" : "Log Past Gift" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "icon", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Gift Name / Title" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, value: title, onChange: (e) => setTitle(e.target.value), placeholder: "E.g., Gold Heart Necklace" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Recipient Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, value: recipient, onChange: (e) => setRecipient(e.target.value), placeholder: "Sarah" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date Given" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", required: true, value: date, onChange: (e) => setDate(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rating / Reaction Strength" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1 mt-1", children: [1, 2, 3, 4, 5].map((star) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setRating(star), className: "p-1 focus:outline-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: `h-6 w-6 ${star <= rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30"}` }) }, star)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reaction Notes / Memory" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 4, value: reaction, onChange: (e) => setReaction(e.target.value), placeholder: "She was completely surprised and loved the custom engraving!" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex justify-end gap-2 pt-2 border-t", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: busy || !title.trim() || !recipient.trim(), className: "rounded-xl", children: [
        busy && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
        " Save"
      ] })
    ] })
  ] }) });
}
export {
  GiftVaultPage as component
};
