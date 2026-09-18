import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQuery, b as useQueryClient, a as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as useWorkspace, u as useServerFn } from "./createSsrRpc-BN6DI1sa.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { L as Label } from "./label-C8WJLhmR.mjs";
import { T as Textarea } from "./textarea-F69quoCd.mjs";
import { s as supabase } from "./client-Ca-eqV5I.mjs";
import { d as deleteSurprisePlan, u as upsertSurprisePlan, l as listSurpriseClues, a as upsertSurpriseClue, b as deleteSurpriseClue, c as listSurprisePlans } from "./dates.functions-CKFKIjAY.mjs";
import "../_libs/seroval.mjs";
import { W as WandSparkles, d as Plus, G as Gift, L as LoaderCircle, J as PartyPopper, l as Sparkles, v as Pencil, t as Trash2, f as Calendar, K as Lightbulb, O as ChevronRight, R as Lock, X, V as Eye } from "../_libs/lucide-react.mjs";
import { f as format, p as parseISO, b as isAfter, s as startOfDay } from "../_libs/date-fns.mjs";
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
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./auth-middleware-ud2LaeJ8.mjs";
import "../_libs/zod.mjs";
const STATUS_DISPLAY = {
  planning: {
    label: "Planning",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
    icon: WandSparkles
  },
  ready: {
    label: "Ready!",
    color: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
    icon: Sparkles
  },
  revealed: {
    label: "Revealed",
    color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
    icon: PartyPopper
  }
};
function SurprisePlannerPage() {
  const {
    current
  } = useWorkspace();
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const userQuery = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const {
        data
      } = await supabase.auth.getUser();
      return data.user;
    }
  });
  const [editingSurprise, setEditingSurprise] = reactExports.useState(null);
  const [detailSurprise, setDetailSurprise] = reactExports.useState(null);
  const [activeTab, setActiveTab] = reactExports.useState("mine");
  const fetchSurprises = useServerFn(listSurprisePlans);
  const workspaceId = current?.id;
  const userId = userQuery.data?.id;
  const surprisesQuery = useQuery({
    queryKey: ["surprise-plans", workspaceId],
    queryFn: () => fetchSurprises({
      data: {
        workspace_id: workspaceId
      }
    }),
    enabled: !!workspaceId
  });
  if (!current || !userId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-sm text-muted-foreground", children: !current ? "Pick a workspace to begin." : "Loading user…" });
  }
  const surprises = surprisesQuery.data?.surprises ?? [];
  const mySurprises = surprises.filter((s) => s.author_id === userId);
  const surprisesForMe = surprises.filter((s) => s.author_id !== userId);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-5xl px-6 py-10 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-end justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-serif text-3xl flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(WandSparkles, { className: "h-7 w-7 text-primary" }),
          " Surprise Planner"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Plan secret surprises and reveal them at just the right moment. 🎉" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
        setEditingSurprise(null);
        setDialogOpen(true);
      }, className: "rounded-xl gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " New Surprise"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-1 flex gap-0.5 w-fit text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActiveTab("mine"), className: `inline-flex items-center gap-2 rounded-lg px-4 py-1.5 font-medium transition ${activeTab === "mine" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(WandSparkles, { className: "h-3.5 w-3.5" }),
        " My Surprises",
        mySurprises.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === "mine" ? "bg-white/20" : "bg-primary/10 text-primary"}`, children: mySurprises.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActiveTab("for-me"), className: `inline-flex items-center gap-2 rounded-lg px-4 py-1.5 font-medium transition ${activeTab === "for-me" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "h-3.5 w-3.5" }),
        " For Me",
        surprisesForMe.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === "for-me" ? "bg-white/20" : "bg-primary/10 text-primary"}`, children: surprisesForMe.length })
      ] })
    ] }),
    surprisesQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
      " Loading surprises…"
    ] }) : activeTab === "mine" ? mySurprises.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: WandSparkles, title: "No surprises planned yet", message: "Create a secret surprise for your partner — they won't see the details until you reveal it!" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2", children: mySurprises.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorSurpriseCard, { surprise: s, workspaceId, onEdit: () => {
      setEditingSurprise(s);
      setDialogOpen(true);
    }, onOpen: () => setDetailSurprise({
      ...s,
      isCreator: true
    }), queryKey: ["surprise-plans", workspaceId] }, s.id)) }) : surprisesForMe.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: Gift, title: "No surprises in store yet", message: "When your partner plans a surprise for you, clues will appear here — but the details stay secret until revealed! 🎁" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2", children: surprisesForMe.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(RecipientSurpriseCard, { surprise: s, workspaceId, onOpen: () => setDetailSurprise({
      ...s,
      isCreator: false
    }), queryKey: ["surprise-plans", workspaceId] }, s.id)) }),
    dialogOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(SurpriseDialog, { workspaceId: current.id, initial: editingSurprise, onClose: () => setDialogOpen(false), queryKey: ["surprise-plans", current.id] }),
    detailSurprise && /* @__PURE__ */ jsxRuntimeExports.jsx(SurpriseDetailPanel, { surprise: detailSurprise, isCreator: detailSurprise.isCreator, workspaceId: current.id, onClose: () => setDetailSurprise(null), queryKey: ["surprise-plans", current.id] })
  ] });
}
function EmptyState({
  icon: Icon,
  title,
  message
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-dashed bg-card p-14 text-center text-sm text-muted-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "mx-auto h-10 w-10 text-muted-foreground/40 mb-3" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 max-w-xs mx-auto", children: message })
  ] });
}
function CreatorSurpriseCard({
  surprise,
  workspaceId,
  onEdit,
  onOpen,
  queryKey
}) {
  const qc = useQueryClient();
  const deleteSurprise = useServerFn(deleteSurprisePlan);
  const upsertSurprise = useServerFn(upsertSurprisePlan);
  const remove = useMutation({
    mutationFn: (id) => deleteSurprise({
      data: {
        id
      }
    }),
    onSuccess: () => {
      toast.success("Surprise removed");
      qc.invalidateQueries({
        queryKey
      });
    },
    onError: (e) => toast.error(e.message)
  });
  const advanceStatus = useMutation({
    mutationFn: (newStatus) => upsertSurprise({
      data: {
        workspace_id: workspaceId,
        id: surprise.id,
        title: surprise.title,
        target_date: surprise.target_date,
        status: newStatus,
        details: surprise.details
      }
    }),
    onSuccess: () => {
      toast.success("Status updated!");
      qc.invalidateQueries({
        queryKey
      });
    },
    onError: (e) => toast.error(e.message)
  });
  const statusInfo = STATUS_DISPLAY[surprise.status];
  const StatusIcon = statusInfo.icon;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group rounded-2xl border bg-card shadow-[var(--shadow-soft)] flex flex-col overflow-hidden hover:shadow-md transition", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-1 w-full ${surprise.status === "planning" ? "bg-amber-400" : surprise.status === "ready" ? "bg-rose-400" : "bg-emerald-400"}` }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 flex flex-col flex-1 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${statusInfo.color}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusIcon, { className: "h-3 w-3" }),
          " ",
          statusInfo.label
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: onEdit, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5 text-muted-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: () => remove.mutate(surprise.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-muted-foreground hover:text-destructive" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-serif text-lg leading-snug", children: surprise.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground inline-flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3 w-3" }),
          "Target: ",
          format(parseISO(surprise.target_date), "MMMM d, yyyy")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground line-clamp-2 leading-relaxed italic mt-1", children: surprise.details })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-3 border-t gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onOpen, className: "inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "h-3.5 w-3.5" }),
          " View & Manage Clues"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          surprise.status === "planning" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-7 rounded-lg text-[10px] px-2", onClick: () => advanceStatus.mutate("ready"), disabled: advanceStatus.isPending, children: [
            "Mark Ready ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3 ml-0.5" })
          ] }),
          surprise.status === "ready" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-7 rounded-lg text-[10px] px-2 text-emerald-700 border-emerald-300 hover:bg-emerald-50", onClick: () => advanceStatus.mutate("revealed"), disabled: advanceStatus.isPending, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PartyPopper, { className: "h-3 w-3 mr-1" }),
            " Reveal!"
          ] })
        ] })
      ] })
    ] })
  ] });
}
function RecipientSurpriseCard({
  surprise,
  onOpen,
  queryKey,
  workspaceId
}) {
  const qc = useQueryClient();
  const upsertSurprise = useServerFn(upsertSurprisePlan);
  const isRevealed = surprise.status === "revealed";
  const canReveal = !isRevealed && isAfter(startOfDay(/* @__PURE__ */ new Date()), parseISO(surprise.target_date));
  const statusInfo = STATUS_DISPLAY[surprise.status];
  const StatusIcon = statusInfo.icon;
  const revealNow = useMutation({
    mutationFn: () => upsertSurprise({
      data: {
        workspace_id: workspaceId,
        id: surprise.id,
        title: surprise.title,
        target_date: surprise.target_date,
        status: "revealed",
        details: surprise.details ?? ""
      }
    }),
    onSuccess: () => {
      toast.success("🎉 Surprise revealed!");
      qc.invalidateQueries({
        queryKey
      });
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `group rounded-2xl border bg-card shadow-[var(--shadow-soft)] flex flex-col overflow-hidden hover:shadow-md transition ${!isRevealed ? "relative overflow-hidden" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-1 w-full ${surprise.status === "planning" ? "bg-amber-400" : surprise.status === "ready" ? "bg-rose-400" : "bg-emerald-400"}` }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 flex flex-col flex-1 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-between gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${statusInfo.color}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatusIcon, { className: "h-3 w-3" }),
        " ",
        statusInfo.label
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 space-y-1.5", children: isRevealed ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-serif text-lg leading-snug", children: surprise.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground inline-flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3 w-3" }),
          format(parseISO(surprise.target_date), "MMMM d, yyyy")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/80 leading-relaxed mt-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-3 border border-emerald-200 dark:border-emerald-800", children: surprise.details })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-serif text-lg leading-snug", children: "A Surprise Awaits You…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground inline-flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3 w-3" }),
          format(parseISO(surprise.target_date), "MMMM d, yyyy")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-dashed bg-accent/30 px-4 py-3 text-xs text-muted-foreground italic mt-2", children: "🔒 The details are hidden until the big day. Check your clues below!" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-3 border-t gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onOpen, className: "inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "h-3.5 w-3.5" }),
          " ",
          isRevealed ? "View Clues" : "View Clues"
        ] }),
        canReveal && !isRevealed && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "h-7 rounded-lg text-[10px] px-3 bg-emerald-600 hover:bg-emerald-700", onClick: () => revealNow.mutate(), disabled: revealNow.isPending, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PartyPopper, { className: "h-3 w-3 mr-1" }),
          " Reveal Now!"
        ] })
      ] })
    ] })
  ] });
}
function SurpriseDetailPanel({
  surprise,
  isCreator,
  workspaceId,
  onClose,
  queryKey
}) {
  const qc = useQueryClient();
  const fetchClues = useServerFn(listSurpriseClues);
  const upsertClue = useServerFn(upsertSurpriseClue);
  const deleteClue = useServerFn(deleteSurpriseClue);
  const [newClue, setNewClue] = reactExports.useState("");
  const [addingClue, setAddingClue] = reactExports.useState(false);
  const cluesQuery = useQuery({
    queryKey: ["surprise-clues", surprise.id],
    queryFn: () => fetchClues({
      data: {
        surprise_plan_id: surprise.id
      }
    })
  });
  const clues = cluesQuery.data?.clues ?? [];
  const addClueMutation = useMutation({
    mutationFn: () => upsertClue({
      data: {
        surprise_plan_id: surprise.id,
        clue_text: newClue.trim()
      }
    }),
    onSuccess: () => {
      setNewClue("");
      setAddingClue(false);
      qc.invalidateQueries({
        queryKey: ["surprise-clues", surprise.id]
      });
      toast.success("Clue added!");
    },
    onError: (e) => toast.error(e.message)
  });
  const removeClueMutation = useMutation({
    mutationFn: (id) => deleteClue({
      data: {
        id
      }
    }),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ["surprise-clues", surprise.id]
    }),
    onError: (e) => toast.error(e.message)
  });
  const statusInfo = STATUS_DISPLAY[surprise.status];
  const StatusIcon = statusInfo.icon;
  const isRevealed = surprise.status === "revealed";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-[2px]", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md h-full bg-card border-l shadow-2xl overflow-y-auto flex flex-col", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky top-0 bg-card/95 backdrop-blur border-b px-6 py-5 flex items-start justify-between gap-4 z-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${statusInfo.color}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusIcon, { className: "h-3 w-3" }),
          " ",
          statusInfo.label
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-serif text-xl leading-tight", children: isCreator ? surprise.title : isRevealed ? surprise.title : "A Surprise Awaits…" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground inline-flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3 w-3" }),
          format(parseISO(surprise.target_date), "MMMM d, yyyy")
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: onClose, className: "shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 pt-5 pb-3 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold flex items-center gap-1.5", children: isCreator || isRevealed ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4 text-primary" }),
        " Secret Details"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-4 w-4 text-muted-foreground" }),
        " Secret Details"
      ] }) }),
      isCreator ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 px-4 py-3 text-sm text-foreground leading-relaxed", children: surprise.details || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "italic text-muted-foreground", children: "No details saved yet." }) }) : isRevealed ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 px-4 py-3 text-sm text-foreground leading-relaxed", children: surprise.details }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-dashed bg-accent/30 px-4 py-6 text-center text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "mx-auto h-7 w-7 mb-2 text-muted-foreground/40" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "The details are locked until ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: format(parseISO(surprise.target_date), "MMMM d") }),
          "."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1 opacity-70", children: "Your partner is cooking something special! 🍳" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-4 flex-1 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "h-4 w-4 text-primary" }),
          " Clue Board"
        ] }),
        isCreator && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", className: "h-7 text-xs gap-1", onClick: () => setAddingClue(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
          " Add Clue"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: isCreator ? "Clues are visible to both partners — tease your partner with hints without spoiling the surprise." : "These clues are from your partner — piece them together to get excited! 😄" }),
      cluesQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
        " Loading…"
      ] }) : clues.length === 0 && !addingClue ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-dashed p-8 text-center text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "mx-auto h-7 w-7 mb-2 text-muted-foreground/40" }),
        isCreator ? "No clues yet — add a hint to tease your partner!" : "No clues have been shared yet. Check back soon!"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: clues.map((clue, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex items-start gap-3 rounded-xl border bg-card p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-0.5 shrink-0 h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center", children: index + 1 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "flex-1 text-sm leading-relaxed", children: clue.clue_text }),
        isCreator && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0", onClick: () => removeClueMutation.mutate(clue.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-muted-foreground hover:text-destructive" }) })
      ] }, clue.id)) }),
      isCreator && addingClue && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-accent/30 p-3 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { autoFocus: true, rows: 2, placeholder: "e.g. Dress code: semi-formal 👗", value: newClue, onChange: (e) => setNewClue(e.target.value), className: "text-sm resize-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "h-8 rounded-lg flex-1 text-xs", onClick: () => {
            if (newClue.trim()) addClueMutation.mutate();
          }, disabled: !newClue.trim() || addClueMutation.isPending, children: addClueMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : "Add Clue" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-8 rounded-lg text-xs", onClick: () => {
            setAddingClue(false);
            setNewClue("");
          }, children: "Cancel" })
        ] })
      ] })
    ] })
  ] }) });
}
function SurpriseDialog({
  initial,
  workspaceId,
  onClose,
  queryKey
}) {
  const qc = useQueryClient();
  const upsertSurprise = useServerFn(upsertSurprisePlan);
  const [title, setTitle] = reactExports.useState(initial?.title ?? "");
  const [details, setDetails] = reactExports.useState(initial?.details ?? "");
  const [targetDate, setTargetDate] = reactExports.useState(initial?.target_date ?? "");
  const [status, setStatus] = reactExports.useState(initial?.status ?? "planning");
  const [busy, setBusy] = reactExports.useState(false);
  async function save(e) {
    e.preventDefault();
    if (!title.trim() || !targetDate || !details.trim()) return;
    setBusy(true);
    try {
      await upsertSurprise({
        data: {
          workspace_id: workspaceId,
          id: initial?.id,
          title: title.trim(),
          target_date: targetDate,
          status,
          details: details.trim()
        }
      });
      toast.success(initial ? "Surprise updated!" : "Surprise planned! 🎉");
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
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/30 backdrop-blur-[2px] p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: save, className: "w-full max-w-lg rounded-2xl border bg-card p-6 shadow-xl space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-serif text-2xl flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(WandSparkles, { className: "h-6 w-6 text-primary" }),
        initial ? "Edit Surprise" : "Plan a Surprise"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "icon", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 px-4 py-2.5 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3.5 w-3.5 shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "The secret details you write here are ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "only visible to you" }),
        " until you click Reveal. Your partner won't see them!"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Surprise Title" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, value: title, onChange: (e) => setTitle(e.target.value), placeholder: "e.g. Surprise weekend getaway 🏔️" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Target Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, type: "date", value: targetDate, onChange: (e) => setTargetDate(e.target.value) })
        ] }),
        initial && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm", value: status, onChange: (e) => setStatus(e.target.value), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "planning", children: "🪄 Planning" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ready", children: "✨ Ready!" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "revealed", children: "🎉 Revealed" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-3.5 w-3.5 text-muted-foreground" }),
          "Secret Details (only you can see this)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { required: true, rows: 5, value: details, onChange: (e) => setDetails(e.target.value), placeholder: "Describe the full surprise here — the venue, activities, reservations, everything! Your partner won't see this until you reveal it." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2 border-t", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: busy || !title.trim() || !targetDate || !details.trim(), className: "rounded-xl", children: [
        busy && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
        initial ? "Save Changes" : "Plan Surprise"
      ] })
    ] })
  ] }) });
}
export {
  SurprisePlannerPage as component
};
