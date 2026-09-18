import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQuery, b as useQueryClient, a as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as useWorkspace, u as useServerFn } from "./createSsrRpc-BN6DI1sa.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { L as Label } from "./label-C8WJLhmR.mjs";
import { T as Textarea } from "./textarea-F69quoCd.mjs";
import { e as upsertLoveLanguageAction, f as deleteLoveLanguageAction, g as listLoveLanguageActions } from "./wellness.functions-DHsnCyXo.mjs";
import "../_libs/seroval.mjs";
import { a7 as MessageSquareHeart, F as Clock, a8 as HandHeart, a9 as Gem, G as Gift, l as Sparkles, d as Plus, L as LoaderCircle, r as CircleCheck, D as Circle, v as Pencil, t as Trash2, X } from "../_libs/lucide-react.mjs";
import { f as format } from "../_libs/date-fns.mjs";
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
const LANGUAGES = [{
  key: "words_of_affirmation",
  label: "Words of Affirmation",
  icon: MessageSquareHeart,
  description: "Verbal expressions of love, encouragement, and appreciation.",
  color: "text-rose-600 dark:text-rose-400",
  bg: "bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800",
  ideas: ["Leave a love note in their bag", "Send a voice message just to say I love you", "List 10 things you love about them", "Write them a letter about your favorite memory", "Compliment something specific they did today"]
}, {
  key: "quality_time",
  label: "Quality Time",
  icon: Clock,
  description: "Undivided attention and meaningful shared experiences.",
  color: "text-violet-600 dark:text-violet-400",
  bg: "bg-violet-50 border-violet-200 dark:bg-violet-950/30 dark:border-violet-800",
  ideas: ["Cook dinner together without phones", "Plan a picnic in the park", "Have a screen-free hour each evening", "Take a long drive with no destination", "Morning coffee ritual together every day"]
}, {
  key: "acts_of_service",
  label: "Acts of Service",
  icon: HandHeart,
  description: "Doing helpful things that ease their load and show you care.",
  color: "text-teal-600 dark:text-teal-400",
  bg: "bg-teal-50 border-teal-200 dark:bg-teal-950/30 dark:border-teal-800",
  ideas: ["Make their bed before they wake up", "Handle a chore they hate without being asked", "Prep their lunch for the week", "Run an errand they've been putting off", "Surprise them with a clean house"]
}, {
  key: "physical_touch",
  label: "Physical Touch",
  icon: Gem,
  description: "Physical closeness and affection that communicates love.",
  color: "text-amber-600 dark:text-amber-400",
  bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",
  ideas: ["Give a 20-second hug for no reason", "Hold hands during a walk", "Give a shoulder massage after their long day", "Sit close while watching a movie", "A gentle touch when passing by"]
}, {
  key: "receiving_gifts",
  label: "Receiving Gifts",
  icon: Gift,
  description: "Thoughtful gestures and tokens that say 'I was thinking of you'.",
  color: "text-blue-600 dark:text-blue-400",
  bg: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
  ideas: ["Pick up their favorite snack randomly", "Order something they mentioned wanting", "Make a homemade card for no occasion", "Get them a book by their favorite author", "Frame a photo of a special memory"]
}];
function LoveLanguagesPage() {
  const {
    current
  } = useWorkspace();
  const [activeKey, setActiveKey] = reactExports.useState("words_of_affirmation");
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [editingAction, setEditingAction] = reactExports.useState(null);
  const fetchActions = useServerFn(listLoveLanguageActions);
  const workspaceId = current?.id;
  const actionsQuery = useQuery({
    queryKey: ["love-language-actions", workspaceId],
    queryFn: () => fetchActions({
      data: {
        workspace_id: workspaceId
      }
    }),
    enabled: !!workspaceId
  });
  if (!current) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-sm text-muted-foreground", children: "Pick a workspace to begin." });
  const actions = actionsQuery.data?.actions ?? [];
  const activeActions = actions.filter((a) => a.language_type === activeKey);
  const doneCount = activeActions.filter((a) => a.completed_at).length;
  const activeLang = LANGUAGES.find((l) => l.key === activeKey);
  const ActiveIcon = activeLang.icon;
  const progressMap = reactExports.useMemo(() => {
    const map = {};
    LANGUAGES.forEach((l) => {
      const la = actions.filter((a) => a.language_type === l.key);
      map[l.key] = {
        total: la.length,
        done: la.filter((a) => a.completed_at).length
      };
    });
    return map;
  }, [actions]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-5xl px-6 py-10 space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-end justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-serif text-3xl flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-7 w-7 text-primary" }),
          " Love Languages"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Log thoughtful acts for each love language and track your intentional effort." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
        setEditingAction(null);
        setDialogOpen(true);
      }, className: "rounded-xl gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " Log an Act"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3", children: LANGUAGES.map((lang) => {
      const LangIcon = lang.icon;
      const prog = progressMap[lang.key];
      const isActive = activeKey === lang.key;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActiveKey(lang.key), className: `rounded-2xl border p-4 text-left transition space-y-2 ${isActive ? lang.bg + " ring-2 ring-primary/30" : "bg-card hover:bg-accent/50"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LangIcon, { className: `h-5 w-5 ${isActive ? lang.color : "text-muted-foreground"}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs font-semibold leading-tight ${isActive ? lang.color : ""}`, children: lang.label }),
        prog.total > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-full rounded-full transition-all ${isActive ? lang.color.replace("text-", "bg-") : "bg-primary"}`, style: {
            width: `${Math.round(prog.done / prog.total * 100)}%`
          } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground", children: [
            prog.done,
            "/",
            prog.total,
            " done"
          ] })
        ] })
      ] }, lang.key);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-[1fr_300px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-2xl border p-5 ${activeLang.bg} space-y-2`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ActiveIcon, { className: `h-5 w-5 ${activeLang.color}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: `font-semibold ${activeLang.color}`, children: activeLang.label })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: activeLang.description }),
          activeActions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-medium text-muted-foreground", children: [
            doneCount,
            "/",
            activeActions.length,
            " completed"
          ] })
        ] }),
        actionsQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
          " Loading…"
        ] }) : activeActions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ActiveIcon, { className: "mx-auto h-8 w-8 text-muted-foreground/40 mb-2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            "No acts logged yet for ",
            activeLang.label,
            "."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs", children: "Try one of the ideas on the right →" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: activeActions.map((action) => /* @__PURE__ */ jsxRuntimeExports.jsx(ActionCard, { action, lang: activeLang, workspaceId, queryKey: ["love-language-actions", workspaceId], onEdit: () => {
          setEditingAction(action);
          setDialogOpen(true);
        } }, action.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-muted-foreground uppercase tracking-wider", children: "💡 Ideas to Try" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: activeLang.ideas.map((idea, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-3 text-sm flex items-start gap-2.5 cursor-pointer hover:bg-accent/50 transition group", onClick: () => {
          setEditingAction({
            language_type: activeKey,
            action: idea
          });
          setDialogOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground shrink-0 mt-0.5 text-xs font-bold", children: [
            i + 1,
            "."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "leading-snug", children: idea }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5 shrink-0 ml-auto text-muted-foreground/40 group-hover:text-primary transition" })
        ] }, i)) })
      ] })
    ] }),
    dialogOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(ActionDialog, { workspaceId: current.id, initial: editingAction, defaultLanguage: activeKey, onClose: () => setDialogOpen(false), queryKey: ["love-language-actions", current.id] })
  ] });
}
function ActionCard({
  action,
  lang,
  workspaceId,
  queryKey,
  onEdit
}) {
  const qc = useQueryClient();
  const upsert = useServerFn(upsertLoveLanguageAction);
  const deleteAction = useServerFn(deleteLoveLanguageAction);
  const isDone = !!action.completed_at;
  const toggle = useMutation({
    mutationFn: () => upsert({
      data: {
        workspace_id: workspaceId,
        id: action.id,
        language_type: action.language_type,
        action: action.action,
        completed_at: isDone ? null : (/* @__PURE__ */ new Date()).toISOString()
      }
    }),
    onSuccess: () => qc.invalidateQueries({
      queryKey
    }),
    onError: (e) => toast.error(e.message)
  });
  const remove = useMutation({
    mutationFn: () => deleteAction({
      data: {
        id: action.id
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `group flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-[var(--shadow-soft)] transition hover:shadow-md ${isDone ? "opacity-60" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "mt-0.5 shrink-0", onClick: () => toggle.mutate(), children: isDone ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: `h-5 w-5 ${lang.color}` }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-5 w-5 text-muted-foreground/40 hover:text-primary transition" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 space-y-0.5 cursor-pointer", onClick: onEdit, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-sm font-medium leading-snug ${isDone ? "line-through" : ""}`, children: action.action }),
      action.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground italic leading-relaxed line-clamp-2", children: action.notes }),
      isDone && action.completed_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground", children: [
        "Done ",
        format(new Date(action.completed_at), "MMM d")
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 opacity-0 group-hover:opacity-100", onClick: onEdit, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5 text-muted-foreground" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 opacity-0 group-hover:opacity-100", onClick: () => remove.mutate(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-muted-foreground hover:text-destructive" }) })
    ] })
  ] });
}
function ActionDialog({
  initial,
  workspaceId,
  defaultLanguage,
  onClose,
  queryKey
}) {
  const qc = useQueryClient();
  const upsert = useServerFn(upsertLoveLanguageAction);
  const [language, setLanguage] = reactExports.useState(initial?.language_type ?? defaultLanguage);
  const [action, setAction] = reactExports.useState(initial?.action ?? "");
  const [notes, setNotes] = reactExports.useState(initial?.notes ?? "");
  const [busy, setBusy] = reactExports.useState(false);
  const isIdeaPrefill = initial && !initial.id;
  async function save(e) {
    e.preventDefault();
    if (!action.trim()) return;
    setBusy(true);
    try {
      await upsert({
        data: {
          workspace_id: workspaceId,
          id: isIdeaPrefill ? void 0 : initial?.id,
          language_type: language,
          action: action.trim(),
          notes: notes.trim() || null
        }
      });
      toast.success(initial?.id ? "Updated!" : "Act logged 💛");
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
  const activeLang = LANGUAGES.find((l) => l.key === language);
  const LangIcon = activeLang.icon;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/30 backdrop-blur-[2px] p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: save, className: "w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-serif text-2xl flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LangIcon, { className: `h-6 w-6 ${activeLang.color}` }),
        initial?.id ? "Edit Act" : "Log an Act of Love"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "icon", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Love Language" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm", value: language, onChange: (e) => setLanguage(e.target.value), children: LANGUAGES.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: l.key, children: l.label }, l.key)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "What did you do? (or plan to do)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, value: action, onChange: (e) => setAction(e.target.value), placeholder: "e.g. Left a love note in their bag" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes (optional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: notes, onChange: (e) => setNotes(e.target.value), placeholder: "Their reaction, how it went, what you felt…" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2 border-t", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: busy || !action.trim(), className: "rounded-xl", children: [
        busy && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
        initial?.id ? "Save Changes" : "Log Act"
      ] })
    ] })
  ] }) });
}
export {
  LoveLanguagesPage as component
};
