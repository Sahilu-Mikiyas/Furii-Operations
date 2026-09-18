import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useQueryClient, u as useQuery, a as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as useWorkspace, u as useServerFn, c as createSsrRpc } from "./createSsrRpc-BN6DI1sa.mjs";
import { a as createServerFn } from "./server-DhrmKQ4T.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-ud2LaeJ8.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { T as Textarea } from "./textarea-F69quoCd.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import { d as Plus, x as CalendarDays, M as MapPin, t as Trash2, A as Album, X, a4 as Smile } from "../_libs/lucide-react.mjs";
import { g as objectType, i as stringType, j as arrayType } from "../_libs/zod.mjs";
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
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
const wsId = objectType({
  workspace_id: stringType().uuid()
});
const listMemories = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(createSsrRpc("197229992b1d8913b954f57ed2a7b0644e2ebce378c2378a441ce71bac35e984"));
const upsertInput = objectType({
  workspace_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  title: stringType().trim().min(1).max(200),
  description: stringType().max(8e3).optional().nullable(),
  occurred_on: stringType().min(8).optional().nullable(),
  location: stringType().max(200).optional().nullable(),
  mood: stringType().max(40).optional().nullable(),
  photo_path: stringType().max(500).optional().nullable(),
  tags: arrayType(stringType().max(40)).default([])
});
const upsertMemory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertInput.parse(d)).handler(createSsrRpc("780de2c0de45f903da36fd8a03465139827045e61666dd9b4e89a39122dfc668"));
const deleteMemory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("947ef2f82893334576216982aabbbfa2d4534dd954410f88c2d90d6eb19fc528"));
const MOODS = ["✨ Magical", "💕 Tender", "😂 Funny", "🌧️ Bittersweet", "🔥 Adventurous", "🕊️ Calm"];
function MemoriesPage() {
  const {
    current
  } = useWorkspace();
  const qc = useQueryClient();
  const list = useServerFn(listMemories);
  const save = useServerFn(upsertMemory);
  const remove = useServerFn(deleteMemory);
  const [dialog, setDialog] = reactExports.useState(null);
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["memories", current?.id],
    queryFn: () => list({
      data: {
        workspace_id: current.id
      }
    }),
    enabled: !!current
  });
  const saveMut = useMutation({
    mutationFn: (input) => save({
      data: {
        workspace_id: current.id,
        ...input
      }
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["memories", current?.id]
      });
      setDialog(null);
      toast.success("Memory saved");
    },
    onError: (e) => toast.error(e.message)
  });
  const delMut = useMutation({
    mutationFn: (id) => remove({
      data: {
        id
      }
    }),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ["memories", current?.id]
    })
  });
  if (!current) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-sm text-muted-foreground", children: "Pick a workspace." });
  const memories = data?.memories ?? [];
  const grouped = memories.reduce((acc, m) => {
    const yr = m.occurred_on ? new Date(m.occurred_on).getFullYear() : "Undated";
    (acc[yr] = acc[yr] || []).push(m);
    return acc;
  }, {});
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl p-6 md:p-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-end justify-between gap-4 mb-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-[0.2em] text-primary font-medium", children: "Memory Vault" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-serif text-4xl md:text-5xl mt-2", children: "The biography of us." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1 text-sm", children: "Tag, place, and preserve the moments that made you." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setDialog({}), className: "rounded-xl gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " Add memory"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Loading…" }) : memories.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { onAdd: () => setDialog({}) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-12", children: Object.entries(grouped).sort(([a], [b]) => String(b).localeCompare(String(a))).map(([yr, items]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-serif text-3xl text-primary", children: yr }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px flex-1 bg-border" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
          items.length,
          " ",
          items.length === 1 ? "moment" : "moments"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: items.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "group relative rounded-2xl border bg-card p-5 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-warm)] transition cursor-pointer", onClick: () => setDialog(m), children: [
        m.mood && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mb-1", children: m.mood }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-serif text-xl leading-tight", children: m.title }),
        m.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground line-clamp-3", children: m.description }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground", children: [
          m.occurred_on && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "h-3 w-3" }),
            " ",
            new Date(m.occurred_on).toLocaleDateString()
          ] }),
          m.location && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3" }),
            " ",
            m.location
          ] })
        ] }),
        m.tags?.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex flex-wrap gap-1.5", children: m.tags.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-accent px-2 py-0.5 text-[10px] text-accent-foreground", children: [
          "#",
          t
        ] }, t)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
          e.stopPropagation();
          delMut.mutate(m.id);
        }, className: "absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
      ] }, m.id)) })
    ] }, yr)) }),
    dialog && /* @__PURE__ */ jsxRuntimeExports.jsx(MemoryDialog, { initial: dialog, onClose: () => setDialog(null), onSave: (d) => saveMut.mutate(d), saving: saveMut.isPending })
  ] });
}
function EmptyState({
  onAdd
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-dashed bg-card/50 p-16 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Album, { className: "mx-auto h-10 w-10 text-primary" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-4 font-serif text-2xl", children: "No memories yet" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground max-w-md mx-auto", children: "Start with the small ones — the first coffee, the silly inside joke, the way she looked at you on the train." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: onAdd, className: "mt-5 rounded-xl gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
      " First memory"
    ] })
  ] });
}
function MemoryDialog({
  initial,
  onClose,
  onSave,
  saving
}) {
  const [form, setForm] = reactExports.useState({
    id: initial?.id,
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    occurred_on: initial?.occurred_on ?? "",
    location: initial?.location ?? "",
    mood: initial?.mood ?? "",
    tags: (initial?.tags ?? []).join(", ")
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/40 p-4", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-lg rounded-3xl bg-card p-6 shadow-2xl", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-serif text-2xl", children: initial?.id ? "Edit memory" : "New memory" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Title", value: form.title, onChange: (e) => setForm({
        ...form,
        title: e.target.value
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 4, placeholder: "Tell the story…", value: form.description, onChange: (e) => setForm({
        ...form,
        description: e.target.value
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.occurred_on, onChange: (e) => setForm({
          ...form,
          occurred_on: e.target.value
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Location", value: form.location, onChange: (e) => setForm({
          ...form,
          location: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mb-1.5 flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Smile, { className: "h-3 w-3" }),
          " Mood"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: MOODS.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setForm({
          ...form,
          mood: form.mood === m ? "" : m
        }), className: `rounded-full border px-3 py-1 text-xs transition ${form.mood === m ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent"}`, children: m }, m)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Tags (comma separated)", value: form.tags, onChange: (e) => setForm({
        ...form,
        tags: e.target.value
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex justify-end gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: saving || !form.title.trim(), onClick: () => onSave({
        ...form,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        occurred_on: form.occurred_on || null
      }), children: "Save memory" })
    ] })
  ] }) });
}
export {
  MemoriesPage as component
};
