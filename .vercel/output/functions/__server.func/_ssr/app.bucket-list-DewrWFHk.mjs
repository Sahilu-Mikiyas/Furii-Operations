import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQuery, b as useQueryClient, a as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as useWorkspace, u as useServerFn } from "./createSsrRpc-BN6DI1sa.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { L as Label } from "./label-C8WJLhmR.mjs";
import { k as upsertBucketListItem, m as deleteBucketListItem, n as listBucketListItems } from "./operations.functions-BJJ4r6Fq.mjs";
import "../_libs/seroval.mjs";
import { j as ListTodo, d as Plus, J as PartyPopper, D as Circle, r as CircleCheck, L as LoaderCircle, l as Sparkles, t as Trash2, X } from "../_libs/lucide-react.mjs";
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
const BUCKET_IDEAS = ["🌅 Watch the sunrise together", "🏔️ Hike a mountain peak", "🌍 Travel to a new country", "🎭 Attend a live theater show", "🍳 Take a cooking class together", "🌊 Learn to surf or scuba dive", "🎸 Go to a music festival", "🚂 Take a scenic train ride", "🌺 Volunteer together for a cause", "🏡 Design your dream home", "💫 Stargaze in the middle of nowhere", "📖 Read the same book and discuss it"];
function BucketListPage() {
  const {
    current
  } = useWorkspace();
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [showCompleted, setShowCompleted] = reactExports.useState(false);
  const fetchItems = useServerFn(listBucketListItems);
  const workspaceId = current?.id;
  const itemsQuery = useQuery({
    queryKey: ["bucket-list", workspaceId],
    queryFn: () => fetchItems({
      data: {
        workspace_id: workspaceId
      }
    }),
    enabled: !!workspaceId
  });
  if (!current) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-sm text-muted-foreground", children: "Pick a workspace to begin." });
  const items = itemsQuery.data?.items ?? [];
  const active = items.filter((i) => i.status === "active");
  const completed = items.filter((i) => i.status === "completed");
  const displayed = showCompleted ? completed : active;
  const pct = items.length > 0 ? Math.round(completed.length / items.length * 100) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-4xl px-6 py-10 space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-end justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-serif text-3xl flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListTodo, { className: "h-7 w-7 text-primary" }),
          " Bucket List"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Adventures to share, memories to make. Your couple's bucket list. 🌟" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setDialogOpen(true), className: "rounded-xl gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " Add Dream"
      ] })
    ] }),
    items.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-gradient-to-br from-primary/5 to-primary/10 p-5 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PartyPopper, { className: "h-5 w-5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-sm", children: [
            completed.length,
            " of ",
            items.length,
            " adventures completed!"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-bold text-primary", children: [
          pct,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2.5 w-full bg-white/60 dark:bg-black/20 rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-primary rounded-full transition-all duration-700", style: {
        width: `${pct}%`
      } }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-0.5 flex gap-0.5 w-fit text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowCompleted(false), className: `inline-flex items-center gap-2 rounded-lg px-4 py-1.5 font-medium transition ${!showCompleted ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-3.5 w-3.5" }),
        " Dreams",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-1.5 text-[10px] font-bold ${!showCompleted ? "bg-white/20" : "bg-primary/10 text-primary"}`, children: active.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowCompleted(true), className: `inline-flex items-center gap-2 rounded-lg px-4 py-1.5 font-medium transition ${showCompleted ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5" }),
        " Done",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-1.5 text-[10px] font-bold ${showCompleted ? "bg-white/20" : "bg-emerald-100 text-emerald-700"}`, children: completed.length })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-[1fr_260px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: itemsQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
        " Loading…"
      ] }) : displayed.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground", children: showCompleted ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PartyPopper, { className: "mx-auto h-10 w-10 text-muted-foreground/40 mb-3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No completed adventures yet — get going! 🚀" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ListTodo, { className: "mx-auto h-10 w-10 text-muted-foreground/40 mb-3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Your bucket list is empty." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1", children: "Try one of the ideas on the right →" })
      ] }) }) : displayed.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(BucketItem, { item, workspaceId, queryKey: ["bucket-list", workspaceId] }, item.id)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-primary" }),
          " Inspiration"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: BUCKET_IDEAS.map((idea, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(QuickAddItem, { idea, workspaceId, queryKey: ["bucket-list", workspaceId], existing: items }, i)) })
      ] })
    ] }),
    dialogOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(BucketDialog, { workspaceId: current.id, onClose: () => setDialogOpen(false), queryKey: ["bucket-list", current.id] })
  ] });
}
function BucketItem({
  item,
  workspaceId,
  queryKey
}) {
  const qc = useQueryClient();
  const upsert = useServerFn(upsertBucketListItem);
  const remove = useServerFn(deleteBucketListItem);
  const isDone = item.status === "completed";
  const toggle = useMutation({
    mutationFn: () => upsert({
      data: {
        workspace_id: workspaceId,
        id: item.id,
        title: item.title,
        status: isDone ? "active" : "completed"
      }
    }),
    onSuccess: () => {
      if (!isDone) toast.success("🎉 Adventure completed!");
      qc.invalidateQueries({
        queryKey
      });
    },
    onError: (e) => toast.error(e.message)
  });
  const del = useMutation({
    mutationFn: () => remove({
      data: {
        id: item.id
      }
    }),
    onSuccess: () => {
      toast.success("Removed");
      qc.invalidateQueries({
        queryKey
      });
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `group flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-[var(--shadow-soft)] hover:shadow-md transition ${isDone ? "opacity-60" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "shrink-0", onClick: () => toggle.mutate(), children: isDone ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-5 w-5 text-emerald-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-5 w-5 text-muted-foreground/40 hover:text-primary transition" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `flex-1 text-sm font-medium ${isDone ? "line-through" : ""}`, children: item.title }),
    isDone && /* @__PURE__ */ jsxRuntimeExports.jsx(PartyPopper, { className: "h-4 w-4 text-amber-400 shrink-0" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0", onClick: () => del.mutate(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-muted-foreground hover:text-destructive" }) })
  ] });
}
function QuickAddItem({
  idea,
  workspaceId,
  queryKey,
  existing
}) {
  const qc = useQueryClient();
  const upsert = useServerFn(upsertBucketListItem);
  const alreadyAdded = existing.some((i) => i.title === idea);
  const add = useMutation({
    mutationFn: () => upsert({
      data: {
        workspace_id: workspaceId,
        title: idea
      }
    }),
    onSuccess: () => {
      toast.success("Added to bucket list!");
      qc.invalidateQueries({
        queryKey
      });
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-2 rounded-xl border p-2.5 text-xs transition ${alreadyAdded ? "opacity-40 cursor-default" : "hover:bg-accent cursor-pointer"}`, onClick: () => !alreadyAdded && !add.isPending && add.mutate(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 leading-snug", children: idea }),
    alreadyAdded ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5 text-emerald-500 shrink-0" }) : add.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin shrink-0 text-muted-foreground" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary shrink-0" })
  ] });
}
function BucketDialog({
  workspaceId,
  onClose,
  queryKey
}) {
  const qc = useQueryClient();
  const upsert = useServerFn(upsertBucketListItem);
  const [title, setTitle] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  async function save(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      await upsert({
        data: {
          workspace_id: workspaceId,
          title: title.trim()
        }
      });
      toast.success("Dream added! ✨");
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
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-serif text-2xl flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ListTodo, { className: "h-6 w-6 text-primary" }),
        " Add a Dream"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "icon", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "What do you want to experience together?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, autoFocus: true, value: title, onChange: (e) => setTitle(e.target.value), placeholder: "e.g. Watch the Northern Lights 🌌" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2 border-t", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: busy || !title.trim(), className: "rounded-xl", children: [
        busy && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
        " Add Dream"
      ] })
    ] })
  ] }) });
}
export {
  BucketListPage as component
};
