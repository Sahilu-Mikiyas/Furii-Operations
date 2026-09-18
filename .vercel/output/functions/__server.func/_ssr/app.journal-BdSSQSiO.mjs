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
import { R as Lock, d as Plus, N as NotebookPen, X, t as Trash2 } from "../_libs/lucide-react.mjs";
import { g as objectType, i as stringType, h as numberType } from "../_libs/zod.mjs";
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
const listJournalEntries = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(createSsrRpc("1220159d9473f8e220ed69bba67d68094a647d425a19fced73f3ba525f5da1ca"));
const upsertInput = objectType({
  workspace_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  title: stringType().max(200).optional().nullable(),
  body: stringType().min(1).max(2e4),
  mood: numberType().int().min(1).max(10).optional().nullable()
});
const upsertJournalEntry = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertInput.parse(d)).handler(createSsrRpc("617c8fc244916e45aaa43edefb28130c3e3d17f361906778e14b6631ea0a8ee6"));
const deleteJournalEntry = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("326e696999dd8ac1c6689a76f1756e5a81f8e6cdf8e6e4a5df0ffbca81449f45"));
function JournalPage() {
  const {
    current
  } = useWorkspace();
  const qc = useQueryClient();
  const list = useServerFn(listJournalEntries);
  const save = useServerFn(upsertJournalEntry);
  const remove = useServerFn(deleteJournalEntry);
  const [active, setActive] = reactExports.useState(null);
  const [composing, setComposing] = reactExports.useState(false);
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["journal", current?.id],
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
        queryKey: ["journal", current?.id]
      });
      setComposing(false);
      setActive(null);
      toast.success("Saved");
    }
  });
  const delMut = useMutation({
    mutationFn: (id) => remove({
      data: {
        id
      }
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["journal", current?.id]
      });
      setActive(null);
    }
  });
  if (!current) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-sm text-muted-foreground", children: "Pick a workspace." });
  const entries = data?.entries ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl p-6 md:p-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-end justify-between gap-4 mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-[11px] text-accent-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3 w-3" }),
          " Always private — even in couple mode"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-serif text-4xl md:text-5xl mt-3", children: "Your private journal." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1 text-sm", children: "Untangle the day. Nobody but you can read this." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
        setActive(null);
        setComposing(true);
      }, className: "rounded-xl gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " New entry"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-[280px_1fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "rounded-2xl border bg-card p-3 max-h-[70vh] overflow-y-auto", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 text-xs text-muted-foreground", children: "Loading…" }) : entries.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 text-xs text-muted-foreground", children: "No entries yet." }) : entries.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
        setActive(e);
        setComposing(false);
      }, className: `w-full text-left rounded-xl p-3 transition ${active?.id === e.id ? "bg-accent" : "hover:bg-accent/60"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium truncate", children: e.title || "Untitled" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground mt-0.5", children: new Date(e.created_at).toLocaleDateString() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-1 line-clamp-2", children: e.body })
      ] }, e.id)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "rounded-2xl border bg-card p-6 md:p-8 min-h-[60vh]", children: composing || active && !composing ? /* @__PURE__ */ jsxRuntimeExports.jsx(Editor, { initial: active ?? {}, onSave: (d) => saveMut.mutate(d), onClose: () => {
        setComposing(false);
        setActive(null);
      }, onDelete: active?.id ? () => delMut.mutate(active.id) : void 0, saving: saveMut.isPending }, active?.id || "new") : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid place-items-center h-full text-center text-muted-foreground py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(NotebookPen, { className: "mx-auto h-10 w-10 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 font-serif text-xl text-foreground", children: "A quiet place for your truest thoughts." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm", children: "Pick an entry or start a new one." })
      ] }) }) })
    ] })
  ] });
}
function Editor({
  initial,
  onSave,
  onClose,
  onDelete,
  saving
}) {
  const [title, setTitle] = reactExports.useState(initial?.title ?? "");
  const [body, setBody] = reactExports.useState(initial?.body ?? "");
  const [mood, setMood] = reactExports.useState(initial?.mood ?? null);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: title, onChange: (e) => setTitle(e.target.value), placeholder: "A title (optional)", className: "border-0 px-0 font-serif text-2xl shadow-none focus-visible:ring-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: body, onChange: (e) => setBody(e.target.value), placeholder: "What's on your mind?", className: "flex-1 min-h-[300px] border-0 px-0 shadow-none focus-visible:ring-0 resize-none text-base leading-relaxed" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-t pt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Mood:" }),
        [1, 3, 5, 7, 9].map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setMood(mood === n ? null : n), className: `h-7 w-7 rounded-full text-sm transition ${mood === n ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`, children: ["😔", "😕", "😐", "🙂", "😄"][[1, 3, 5, 7, 9].indexOf(n)] }, n))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        onDelete && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: onDelete, className: "text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: saving || !body.trim(), onClick: () => onSave({
          id: initial?.id,
          title: title || null,
          body,
          mood
        }), children: "Save" })
      ] })
    ] })
  ] });
}
export {
  JournalPage as component
};
