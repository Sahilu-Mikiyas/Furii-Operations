import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQuery, b as useQueryClient, a as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as useWorkspace, u as useServerFn } from "./createSsrRpc-BN6DI1sa.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { L as Label } from "./label-C8WJLhmR.mjs";
import { T as Textarea } from "./textarea-F69quoCd.mjs";
import { u as upsertConflictReflection, d as deleteConflictReflection, l as listConflictReflections } from "./wellness.functions-DHsnCyXo.mjs";
import "../_libs/seroval.mjs";
import { H as Heart, d as Plus, Y as ShieldCheck, D as Circle, r as CircleCheck, L as LoaderCircle, Z as Flame, v as Pencil, t as Trash2, X, _ as ChevronLeft, O as ChevronRight } from "../_libs/lucide-react.mjs";
import { f as format, p as parseISO } from "../_libs/date-fns.mjs";
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
const STEPS = [{
  key: "trigger_description",
  label: "What happened?",
  hint: "Describe the situation or trigger as neutrally as you can. Stick to facts, not feelings.",
  placeholder: "We had a disagreement about household responsibilities when I got home from work…",
  required: true
}, {
  key: "my_feelings",
  label: "How did you feel?",
  hint: "Name your emotions — not your judgments. Use 'I felt…' instead of 'They made me feel…'",
  placeholder: "I felt dismissed and unheard. I also felt frustrated because I was already tired…",
  required: false
}, {
  key: "their_perspective",
  label: "Their perspective",
  hint: "Try to genuinely understand what they might have been feeling or thinking. Empathy is the goal.",
  placeholder: "They were probably stressed too and felt like their efforts weren't being noticed…",
  required: false
}, {
  key: "what_i_could_do_differently",
  label: "What could I do differently?",
  hint: "Reflect on your own role — not to blame yourself, but to grow. What would you change?",
  placeholder: "I could have taken a breath before reacting and brought it up later when we were both calm…",
  required: false
}, {
  key: "resolution",
  label: "How was it resolved?",
  hint: "What happened next? Did you talk it out? Is it still unresolved?",
  placeholder: "We talked it through after dinner. We agreed to split tasks more clearly…",
  required: false
}, {
  key: "growth_note",
  label: "Growth takeaway",
  hint: "What did this teach you about yourself, your partner, or your relationship?",
  placeholder: "I learned that I need to communicate when I'm overwhelmed instead of shutting down…",
  required: false
}];
const INTENSITY_LABELS = {
  1: {
    label: "Minor",
    color: "text-emerald-600"
  },
  2: {
    label: "Mild",
    color: "text-teal-600"
  },
  3: {
    label: "Moderate",
    color: "text-amber-600"
  },
  4: {
    label: "Serious",
    color: "text-orange-600"
  },
  5: {
    label: "Intense",
    color: "text-rose-600"
  }
};
function SupportPage() {
  const {
    current
  } = useWorkspace();
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [editingReflection, setEditingReflection] = reactExports.useState(null);
  const [detailReflection, setDetailReflection] = reactExports.useState(null);
  const [activeTab, setActiveTab] = reactExports.useState("open");
  const fetchReflections = useServerFn(listConflictReflections);
  const workspaceId = current?.id;
  const reflectionsQuery = useQuery({
    queryKey: ["conflict-reflections", workspaceId],
    queryFn: () => fetchReflections({
      data: {
        workspace_id: workspaceId
      }
    }),
    enabled: !!workspaceId
  });
  if (!current) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-sm text-muted-foreground", children: "Pick a workspace to begin." });
  const reflections = reflectionsQuery.data?.reflections ?? [];
  const open = reflections.filter((r) => !r.is_resolved);
  const resolved = reflections.filter((r) => r.is_resolved);
  const displayed = activeTab === "open" ? open : resolved;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-4xl px-6 py-10 space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-end justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-serif text-3xl flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-7 w-7 text-primary" }),
          " Support & Care"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "A private, guided space to reflect on conflicts and grow from them — not to assign blame." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
        setEditingReflection(null);
        setDialogOpen(true);
      }, className: "rounded-xl gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " New Reflection"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 px-4 py-3 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4 shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Private to you." }),
        " Your conflict reflections are only visible to you — not your partner. This is a personal growth space."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-1 flex gap-0.5 w-fit text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActiveTab("open"), className: `inline-flex items-center gap-2 rounded-lg px-4 py-1.5 font-medium transition ${activeTab === "open" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-3.5 w-3.5" }),
        " Open",
        open.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === "open" ? "bg-white/20" : "bg-primary/10 text-primary"}`, children: open.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActiveTab("resolved"), className: `inline-flex items-center gap-2 rounded-lg px-4 py-1.5 font-medium transition ${activeTab === "resolved" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5" }),
        " Resolved",
        resolved.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === "resolved" ? "bg-white/20" : "bg-emerald-100 text-emerald-700"}`, children: resolved.length })
      ] })
    ] }),
    reflectionsQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
      " Loading…"
    ] }) : displayed.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-dashed bg-card p-14 text-center text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "mx-auto h-10 w-10 text-muted-foreground/40 mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: activeTab === "open" ? "No open reflections." : "No resolved conflicts logged yet." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1", children: activeTab === "open" ? "Use this journal to process disagreements constructively." : "Resolved reflections will appear here." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: displayed.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(ReflectionCard, { reflection: r, workspaceId, queryKey: ["conflict-reflections", workspaceId], onEdit: () => {
      setEditingReflection(r);
      setDialogOpen(true);
    }, onOpen: () => setDetailReflection(r) }, r.id)) }),
    dialogOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(ReflectionWizard, { workspaceId: current.id, initial: editingReflection, onClose: () => setDialogOpen(false), queryKey: ["conflict-reflections", current.id] }),
    detailReflection && /* @__PURE__ */ jsxRuntimeExports.jsx(ReflectionDetailPanel, { reflection: detailReflection, workspaceId: current.id, onClose: () => setDetailReflection(null), queryKey: ["conflict-reflections", current.id] })
  ] });
}
function ReflectionCard({
  reflection,
  workspaceId,
  queryKey,
  onEdit,
  onOpen
}) {
  const qc = useQueryClient();
  const upsert = useServerFn(upsertConflictReflection);
  const deleteReflection = useServerFn(deleteConflictReflection);
  const toggleResolved = useMutation({
    mutationFn: () => upsert({
      data: {
        workspace_id: workspaceId,
        id: reflection.id,
        title: reflection.title,
        trigger_description: reflection.trigger_description,
        reflection_date: reflection.reflection_date,
        is_resolved: !reflection.is_resolved
      }
    }),
    onSuccess: () => qc.invalidateQueries({
      queryKey
    }),
    onError: (e) => toast.error(e.message)
  });
  const remove = useMutation({
    mutationFn: () => deleteReflection({
      data: {
        id: reflection.id
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
  const intensityInfo = reflection.intensity ? INTENSITY_LABELS[reflection.intensity] : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group rounded-2xl border bg-card shadow-[var(--shadow-soft)] p-5 flex items-start gap-4 hover:shadow-md transition cursor-pointer", onClick: onOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "mt-0.5 shrink-0", onClick: (e) => {
      e.stopPropagation();
      toggleResolved.mutate();
    }, children: reflection.is_resolved ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-5 w-5 text-emerald-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-5 w-5 text-muted-foreground/40 hover:text-primary transition" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: `font-serif text-lg leading-snug ${reflection.is_resolved ? "line-through opacity-60" : ""}`, children: reflection.title }),
        intensityInfo && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-[10px] font-semibold uppercase ${intensityInfo.color} flex items-center gap-0.5`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-2.5 w-2.5" }),
          " ",
          intensityInfo.label
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground line-clamp-2 leading-relaxed", children: reflection.trigger_description }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: format(parseISO(reflection.reflection_date), "MMMM d, yyyy") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 opacity-0 group-hover:opacity-100", onClick: (e) => {
        e.stopPropagation();
        onEdit();
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5 text-muted-foreground" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 opacity-0 group-hover:opacity-100", onClick: (e) => {
        e.stopPropagation();
        remove.mutate();
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-muted-foreground hover:text-destructive" }) })
    ] })
  ] });
}
function ReflectionDetailPanel({
  reflection,
  workspaceId,
  onClose,
  queryKey
}) {
  const qc = useQueryClient();
  const upsert = useServerFn(upsertConflictReflection);
  const intensityInfo = reflection.intensity ? INTENSITY_LABELS[reflection.intensity] : null;
  const toggleResolved = useMutation({
    mutationFn: () => upsert({
      data: {
        workspace_id: workspaceId,
        id: reflection.id,
        title: reflection.title,
        trigger_description: reflection.trigger_description,
        reflection_date: reflection.reflection_date,
        is_resolved: !reflection.is_resolved
      }
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey
      });
      onClose();
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-[2px]", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md h-full bg-card border-l shadow-2xl overflow-y-auto flex flex-col", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky top-0 bg-card/95 backdrop-blur border-b px-6 py-5 flex items-start justify-between z-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
          reflection.is_resolved && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 uppercase", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }),
            " Resolved"
          ] }),
          intensityInfo && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-[10px] font-semibold uppercase ${intensityInfo.color} flex items-center gap-0.5`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "h-2.5 w-2.5" }),
            " ",
            intensityInfo.label
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-serif text-xl leading-tight", children: reflection.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: format(parseISO(reflection.reflection_date), "MMMM d, yyyy") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: onClose, className: "shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-5 space-y-5 flex-1", children: STEPS.map((step) => {
      const val = reflection[step.key];
      if (!val) return null;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: step.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm leading-relaxed text-foreground/80", children: val })
      ] }, step.key);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky bottom-0 bg-card/95 backdrop-blur border-t px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "w-full rounded-xl", variant: reflection.is_resolved ? "outline" : "default", onClick: () => toggleResolved.mutate(), disabled: toggleResolved.isPending, children: [
      toggleResolved.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
      reflection.is_resolved ? "Mark as Unresolved" : "Mark as Resolved ✓"
    ] }) })
  ] }) });
}
function ReflectionWizard({
  initial,
  workspaceId,
  onClose,
  queryKey
}) {
  const qc = useQueryClient();
  const upsert = useServerFn(upsertConflictReflection);
  const [step, setStep] = reactExports.useState(0);
  const [busy, setBusy] = reactExports.useState(false);
  const [title, setTitle] = reactExports.useState(initial?.title ?? "");
  const [date, setDate] = reactExports.useState(initial?.reflection_date ?? format(/* @__PURE__ */ new Date(), "yyyy-MM-dd"));
  const [intensity, setIntensity] = reactExports.useState(initial?.intensity ?? 3);
  const [fields, setFields] = reactExports.useState({
    trigger_description: initial?.trigger_description ?? "",
    my_feelings: initial?.my_feelings ?? "",
    their_perspective: initial?.their_perspective ?? "",
    what_i_could_do_differently: initial?.what_i_could_do_differently ?? "",
    resolution: initial?.resolution ?? "",
    growth_note: initial?.growth_note ?? ""
  });
  const totalSteps = STEPS.length;
  const currentStep = STEPS[step];
  const isLast = step === totalSteps - 1;
  const canNext = step === 0 ? !!fields.trigger_description.trim() : true;
  async function save() {
    if (!title.trim() || !fields.trigger_description.trim()) return;
    setBusy(true);
    try {
      await upsert({
        data: {
          workspace_id: workspaceId,
          id: initial?.id,
          title: title.trim(),
          reflection_date: date,
          intensity,
          is_resolved: initial?.is_resolved ?? false,
          trigger_description: fields.trigger_description.trim(),
          my_feelings: fields.my_feelings.trim() || null,
          their_perspective: fields.their_perspective.trim() || null,
          what_i_could_do_differently: fields.what_i_could_do_differently.trim() || null,
          resolution: fields.resolution.trim() || null,
          growth_note: fields.growth_note.trim() || null
        }
      });
      toast.success(initial ? "Reflection updated" : "Reflection saved 🌱");
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
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/30 backdrop-blur-[2px] p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-lg rounded-2xl border bg-card shadow-xl flex flex-col overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1 w-full bg-accent", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-primary transition-all duration-300", style: {
      width: `${(step + 1) / (totalSteps + 1) * 100}%`
    } }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-5 flex-1", children: [
      step === -1 ? null : step === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-serif text-2xl flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-6 w-6 text-primary" }),
            initial ? "Edit Reflection" : "New Reflection"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "icon", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Give it a title" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { autoFocus: true, required: true, value: title, onChange: (e) => setTitle(e.target.value), placeholder: "e.g. Argument about chores on Tuesday" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", className: "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm", value: date, onChange: (e) => setDate(e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Intensity" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1", children: [1, 2, 3, 4, 5].map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setIntensity(n), className: `flex-1 h-9 rounded-md text-xs font-bold transition ${n <= intensity ? n <= 2 ? "bg-emerald-400 text-white" : n <= 3 ? "bg-amber-400 text-white" : "bg-rose-500 text-white" : "bg-accent hover:bg-accent/80 text-muted-foreground"}`, children: n }, n)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: INTENSITY_LABELS[intensity]?.label })
            ] })
          ] })
        ] })
      ] }),
      step > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground font-medium", children: [
            "Step ",
            step,
            " of ",
            totalSteps
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-serif text-xl mt-0.5", children: currentStep.label })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "icon", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
      ] }),
      step > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-accent/30 px-4 py-2.5 text-xs text-muted-foreground italic leading-relaxed", children: [
        "💡 ",
        currentStep.hint
      ] }),
      step > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { autoFocus: true, rows: 6, value: fields[currentStep.key], onChange: (e) => setFields((prev) => ({
        ...prev,
        [currentStep.key]: e.target.value
      })), placeholder: currentStep.placeholder, className: "resize-none" }),
      step === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: STEPS[0].label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-rose-500", children: "*" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-accent/30 px-4 py-2 text-xs text-muted-foreground italic", children: [
          "💡 ",
          STEPS[0].hint
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 4, required: true, value: fields.trigger_description, onChange: (e) => setFields((prev) => ({
          ...prev,
          trigger_description: e.target.value
        })), placeholder: STEPS[0].placeholder, className: "resize-none" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t px-6 py-4 flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: () => step > 0 ? setStep((s) => s - 1) : onClose(), className: "gap-1", children: step > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }),
        " Back"
      ] }) : "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1", children: Array.from({
        length: totalSteps
      }, (_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-1.5 rounded-full transition-all ${i <= step ? "bg-primary w-4" : "bg-accent w-1.5"}` }, i)) }),
      isLast ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: save, disabled: busy || !title.trim() || !fields.trigger_description.trim(), className: "rounded-xl gap-1", children: [
        busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4" }),
        "Save"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", onClick: () => setStep((s) => s + 1), disabled: step === 0 && !canNext, className: "rounded-xl gap-1", children: [
        "Next ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" })
      ] })
    ] })
  ] }) });
}
export {
  SupportPage as component
};
