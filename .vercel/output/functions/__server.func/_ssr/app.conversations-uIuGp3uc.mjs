import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useQueryClient, u as useQuery, a as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as useWorkspace, u as useServerFn, c as createSsrRpc } from "./createSsrRpc-BN6DI1sa.mjs";
import { a as createServerFn } from "./server-DhrmKQ4T.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-ud2LaeJ8.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { T as Textarea } from "./textarea-F69quoCd.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import { l as Sparkles, d as Plus, i as MessagesSquare, c as Check, t as Trash2, X } from "../_libs/lucide-react.mjs";
import { g as objectType, i as stringType } from "../_libs/zod.mjs";
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
const listPrompts = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(createSsrRpc("41bc8fcfa646b761d75127d0f62d66006e1397a112e397549ef8fb60a3a561ad"));
const upsertInput = objectType({
  workspace_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  prompt: stringType().trim().min(1).max(500),
  category: stringType().max(40).optional().nullable(),
  answer: stringType().max(8e3).optional().nullable()
});
const upsertPrompt = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertInput.parse(d)).handler(createSsrRpc("3b905c9829012f506bee644ba1803979a4a520d9908db9104ba5e600042e4429"));
const deletePrompt = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("63216b6302c65b7480676189da62e7c3ffece7ed8847e72d4062e66cbb507f96"));
const CURATED = [{
  c: "Childhood",
  q: "What's a smell that takes you straight back to being eight years old?"
}, {
  c: "Childhood",
  q: "Which adult in your childhood do you wish you could thank now?"
}, {
  c: "Dreams",
  q: "If money were truly no object, where would we live next year?"
}, {
  c: "Dreams",
  q: "What's one wild thing you've quietly wanted to try but never said out loud?"
}, {
  c: "Us",
  q: "What's a moment from us you replay often?"
}, {
  c: "Us",
  q: "When did you first know this was serious?"
}, {
  c: "Values",
  q: "What does a 'good life' look like to you, in one sentence?"
}, {
  c: "Values",
  q: "What's something you used to believe strongly that you don't anymore?"
}, {
  c: "Vulnerable",
  q: "What's something I do that makes you feel most loved?"
}, {
  c: "Vulnerable",
  q: "Is there anything you wish I knew about how you've been lately?"
}, {
  c: "Playful",
  q: "If we were a cocktail, which one and why?"
}, {
  c: "Playful",
  q: "Pick a song for the next chapter of us."
}, {
  c: "Future",
  q: "What does being 70 together look like to you?"
}, {
  c: "Future",
  q: "What kind of parents (or aunts/uncles, or partners) do we want to be?"
}];
const CATEGORIES = Array.from(new Set(CURATED.map((c) => c.c)));
function ConversationsPage() {
  const {
    current
  } = useWorkspace();
  const qc = useQueryClient();
  const list = useServerFn(listPrompts);
  const save = useServerFn(upsertPrompt);
  const remove = useServerFn(deletePrompt);
  const [tab, setTab] = reactExports.useState("library");
  const [filter, setFilter] = reactExports.useState("All");
  const [active, setActive] = reactExports.useState(null);
  const {
    data
  } = useQuery({
    queryKey: ["prompts", current?.id],
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
        queryKey: ["prompts", current?.id]
      });
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
    onSuccess: () => qc.invalidateQueries({
      queryKey: ["prompts", current?.id]
    })
  });
  const saved = data?.prompts ?? [];
  const filtered = reactExports.useMemo(() => CURATED.filter((c) => filter === "All" || c.c === filter), [filter]);
  const todayPrompt = reactExports.useMemo(() => CURATED[(/* @__PURE__ */ new Date()).getDate() % CURATED.length], []);
  if (!current) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-sm text-muted-foreground", children: "Pick a workspace." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl p-6 md:p-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-[0.2em] text-primary font-medium", children: "Conversation Hub" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-serif text-4xl md:text-5xl mt-2", children: "Keep going deeper." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1 text-sm", children: "Even after years, there's always more to discover." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border bg-gradient-to-br from-primary/15 via-card to-card p-6 md:p-8 mb-10 relative overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-2xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs uppercase tracking-wider text-primary inline-flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3" }),
          " Today's prompt · ",
          todayPrompt.c
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 font-serif text-2xl md:text-3xl leading-snug max-w-3xl", children: [
          '"',
          todayPrompt.q,
          '"'
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 flex gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setActive({
          prompt: todayPrompt.q,
          category: todayPrompt.c
        }), className: "rounded-xl", children: "Answer together" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTab("library"), className: `rounded-xl px-3 py-1.5 text-sm ${tab === "library" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`, children: "Library" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setTab("saved"), className: `rounded-xl px-3 py-1.5 text-sm ${tab === "saved" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`, children: [
        "Saved ",
        saved.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 opacity-70", children: [
          "(",
          saved.length,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => setActive({}), className: "ml-auto rounded-xl gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
        " Custom prompt"
      ] })
    ] }),
    tab === "library" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5 mb-4", children: ["All", ...CATEGORIES].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFilter(c), className: `rounded-full border px-3 py-1 text-xs ${filter === c ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent"}`, children: c }, c)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 md:grid-cols-2", children: filtered.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-5 hover:shadow-[var(--shadow-soft)] transition group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-primary", children: c.c }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 font-serif text-lg leading-snug", children: c.q }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setActive({
          prompt: c.q,
          category: c.c
        }), className: "mt-3 opacity-0 group-hover:opacity-100 transition", children: "Answer" })
      ] }, c.q)) })
    ] }),
    tab === "saved" && (saved.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-dashed bg-card/50 p-16 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MessagesSquare, { className: "mx-auto h-10 w-10 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-4 font-serif text-2xl", children: "No saved conversations yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Answer a prompt to keep it here." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: saved.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          p.category && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-primary", children: p.category }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-serif text-lg mt-1", children: p.prompt })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          p.answer ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[10px] text-emerald-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3 w-3" }),
            " Answered"
          ] }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setActive(p), className: "text-xs text-muted-foreground hover:text-foreground", children: "Edit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => delMut.mutate(p.id), className: "text-muted-foreground hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
        ] })
      ] }),
      p.answer && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3", children: p.answer })
    ] }, p.id)) })),
    active && /* @__PURE__ */ jsxRuntimeExports.jsx(AnswerDialog, { initial: active, onClose: () => setActive(null), onSave: (d) => saveMut.mutate(d), saving: saveMut.isPending })
  ] });
}
function AnswerDialog({
  initial,
  onClose,
  onSave,
  saving
}) {
  const [prompt, setPrompt] = reactExports.useState(initial?.prompt ?? "");
  const [answer, setAnswer] = reactExports.useState(initial?.answer ?? "");
  const [category, setCategory] = reactExports.useState(initial?.category ?? "");
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/40 p-4", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-lg rounded-3xl bg-card p-6 shadow-2xl", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-serif text-2xl", children: initial?.id ? "Edit answer" : "Capture an answer" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, placeholder: "Prompt", value: prompt, onChange: (e) => setPrompt(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 5, placeholder: "Their answer (or yours)…", value: answer, onChange: (e) => setAnswer(e.target.value) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: "w-full rounded-md border bg-background px-3 py-2 text-sm", placeholder: "Category (optional)", value: category, onChange: (e) => setCategory(e.target.value) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex justify-end gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: saving || !prompt.trim(), onClick: () => onSave({
        id: initial?.id,
        prompt,
        answer: answer || null,
        category: category || null
      }), children: "Save" })
    ] })
  ] }) });
}
export {
  ConversationsPage as component
};
