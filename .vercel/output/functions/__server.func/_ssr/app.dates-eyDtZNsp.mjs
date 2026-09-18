import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQuery, b as useQueryClient, a as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as useWorkspace, u as useServerFn } from "./createSsrRpc-BN6DI1sa.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { L as Label } from "./label-C8WJLhmR.mjs";
import { T as Textarea } from "./textarea-F69quoCd.mjs";
import { e as deleteDatePlan, f as upsertDatePlan, g as upsertDateStage, h as listDateStages, i as deleteDateStage, j as listDatePlans } from "./dates.functions-CKFKIjAY.mjs";
import { e as listSavedPlaces, c as upsertSavedPlace, a as MapPicker, M as MapPreview } from "./map-picker-CzgHFEZ3.mjs";
import "../_libs/seroval.mjs";
import "../_libs/leaflet.mjs";
import { g as CalendarHeart, d as Plus, L as LoaderCircle, v as Pencil, t as Trash2, f as Calendar, M as MapPin, ak as ListChecks, O as ChevronRight, r as CircleCheck, X, l as Sparkles, F as Clock, D as Circle } from "../_libs/lucide-react.mjs";
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
import "../_libs/react-leaflet.mjs";
import "../_libs/react-leaflet__core.mjs";
const DATE_TEMPLATES = [{
  label: "✨ Luxury Night Out",
  stages: [{
    title: "Get ready together",
    time_offset: "17:00"
  }, {
    title: "Pre-dinner cocktails",
    time_offset: "19:00"
  }, {
    title: "Fine dining reservation",
    time_offset: "20:00"
  }, {
    title: "Dessert & late walk",
    time_offset: "22:30"
  }]
}, {
  label: "🏕️ Outdoor Adventure",
  stages: [{
    title: "Pack a picnic & gear up",
    time_offset: "09:00"
  }, {
    title: "Drive to destination",
    time_offset: "10:00"
  }, {
    title: "Hike / explore",
    time_offset: "11:00"
  }, {
    title: "Picnic lunch under the sky",
    time_offset: "13:00"
  }, {
    title: "Sunset watch & head home",
    time_offset: "17:30"
  }]
}, {
  label: "🕯️ Cozy Home Night",
  stages: [{
    title: "Cook dinner together",
    time_offset: "18:00"
  }, {
    title: "Movie / board game",
    time_offset: "20:00"
  }, {
    title: "Dessert & conversation",
    time_offset: "22:00"
  }]
}, {
  label: "🎨 Creative Date",
  stages: [{
    title: "Supplies & inspiration run",
    time_offset: "14:00"
  }, {
    title: "Art / craft session",
    time_offset: "15:00"
  }, {
    title: "Show & tell your creations",
    time_offset: "17:00"
  }, {
    title: "Dinner to celebrate",
    time_offset: "19:00"
  }]
}, {
  label: "🍜 Foodie Tour",
  stages: [{
    title: "Pick a food neighborhood",
    time_offset: "12:00"
  }, {
    title: "Appetizers stop #1",
    time_offset: "12:30"
  }, {
    title: "Main course stop #2",
    time_offset: "14:00"
  }, {
    title: "Dessert crawl stop #3",
    time_offset: "16:00"
  }, {
    title: "Coffee & reflection",
    time_offset: "17:30"
  }]
}];
const STATUS_TABS = [{
  key: "idea",
  label: "Ideas",
  color: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
}, {
  key: "scheduled",
  label: "Scheduled",
  color: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200"
}, {
  key: "completed",
  label: "Completed",
  color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
}];
function DateSpacePage() {
  const {
    current
  } = useWorkspace();
  const [activeTab, setActiveTab] = reactExports.useState("idea");
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [editingDate, setEditingDate] = reactExports.useState(null);
  const [detailDate, setDetailDate] = reactExports.useState(null);
  const fetchDates = useServerFn(listDatePlans);
  const workspaceId = current?.id;
  const datesQuery = useQuery({
    queryKey: ["date-plans", workspaceId],
    queryFn: () => fetchDates({
      data: {
        workspace_id: workspaceId
      }
    }),
    enabled: !!workspaceId
  });
  if (!current) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-sm text-muted-foreground", children: "Pick a workspace to begin." });
  }
  const dates = datesQuery.data?.dates ?? [];
  const filtered = dates.filter((d) => d.status === activeTab);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-5xl px-6 py-10 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-end justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-serif text-3xl flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarHeart, { className: "h-7 w-7 text-primary" }),
          " Date Space"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Plan your perfect dates — from ideas to unforgettable memories." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
        setEditingDate(null);
        setDialogOpen(true);
      }, className: "rounded-xl gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " New Date"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border bg-card p-1 flex gap-0.5 w-fit text-sm", children: STATUS_TABS.map((tab) => {
      const count = dates.filter((d) => d.status === tab.key).length;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActiveTab(tab.key), className: `inline-flex items-center gap-2 rounded-lg px-4 py-1.5 font-medium transition ${activeTab === tab.key ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`, children: [
        tab.label,
        count > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === tab.key ? "bg-white/20" : tab.color}`, children: count })
      ] }, tab.key);
    }) }),
    datesQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
      " Loading dates…"
    ] }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-dashed bg-card p-14 text-center text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarHeart, { className: "mx-auto h-10 w-10 text-muted-foreground/40 mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
        "No ",
        STATUS_TABS.find((t) => t.key === activeTab)?.label.toLowerCase(),
        " yet."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1", children: [
        activeTab === "idea" && "Save a date idea before you forget it!",
        activeTab === "scheduled" && "Schedule a date to lock it in.",
        activeTab === "completed" && "Completed dates will appear here."
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: filtered.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx(DateCard, { date: d, workspaceId, onEdit: () => {
      setEditingDate(d);
      setDialogOpen(true);
    }, onOpen: () => setDetailDate(d), queryKey: ["date-plans", workspaceId] }, d.id)) }),
    dialogOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(DateDialog, { workspaceId: current.id, initial: editingDate, onClose: () => setDialogOpen(false), queryKey: ["date-plans", current.id] }),
    detailDate && /* @__PURE__ */ jsxRuntimeExports.jsx(DateDetailPanel, { date: detailDate, onClose: () => setDetailDate(null), queryKey: ["date-plans", current.id] })
  ] });
}
function DateCard({
  date,
  workspaceId,
  onEdit,
  onOpen,
  queryKey
}) {
  const qc = useQueryClient();
  const deleteDate = useServerFn(deleteDatePlan);
  const upsertDate = useServerFn(upsertDatePlan);
  const remove = useMutation({
    mutationFn: (id) => deleteDate({
      data: {
        id
      }
    }),
    onSuccess: () => {
      toast.success("Date removed");
      qc.invalidateQueries({
        queryKey
      });
    },
    onError: (e) => toast.error(e.message ?? "Failed")
  });
  const moveStatus = useMutation({
    mutationFn: ({
      id,
      status
    }) => upsertDate({
      data: {
        workspace_id: workspaceId,
        id,
        title: date.title,
        status
      }
    }),
    onSuccess: () => qc.invalidateQueries({
      queryKey
    }),
    onError: (e) => toast.error(e.message ?? "Failed")
  });
  const statusInfo = STATUS_TABS.find((t) => t.key === date.status);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group rounded-2xl border bg-card shadow-[var(--shadow-soft)] flex flex-col overflow-hidden hover:shadow-md transition", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-1 w-full ${date.status === "idea" ? "bg-amber-400" : date.status === "scheduled" ? "bg-rose-400" : "bg-emerald-400"}` }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 flex flex-col flex-1 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusInfo.color}`, children: statusInfo.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: onEdit, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5 text-muted-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7", onClick: (e) => {
            e.stopPropagation();
            remove.mutate(date.id);
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-muted-foreground hover:text-destructive" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-serif text-lg leading-snug", children: date.title }),
        date.date_planned && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground inline-flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3 w-3" }),
          format(parseISO(date.date_planned), "MMMM d, yyyy")
        ] }),
        date.location_name && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground inline-flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3" }),
          " ",
          date.location_name
        ] }),
        date.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground leading-relaxed line-clamp-3", children: date.description })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-3 border-t gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onOpen, className: "inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListChecks, { className: "h-3.5 w-3.5" }),
          " View Itinerary"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          date.status === "idea" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-7 rounded-lg text-[10px] px-2", onClick: () => moveStatus.mutate({
            id: date.id,
            status: "scheduled"
          }), children: [
            "Schedule ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3 ml-0.5" })
          ] }),
          date.status === "scheduled" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-7 rounded-lg text-[10px] px-2", onClick: () => moveStatus.mutate({
            id: date.id,
            status: "completed"
          }), children: [
            "Complete ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3 ml-0.5" })
          ] })
        ] })
      ] })
    ] })
  ] });
}
function DateDetailPanel({
  date,
  onClose,
  queryKey
}) {
  const qc = useQueryClient();
  const fetchStages = useServerFn(listDateStages);
  const upsertStage = useServerFn(upsertDateStage);
  const deleteStage = useServerFn(deleteDateStage);
  const [newTitle, setNewTitle] = reactExports.useState("");
  const [newTime, setNewTime] = reactExports.useState("");
  const [addingStage, setAddingStage] = reactExports.useState(false);
  const stagesQuery = useQuery({
    queryKey: ["date-stages", date.id],
    queryFn: () => fetchStages({
      data: {
        date_plan_id: date.id
      }
    })
  });
  const stages = stagesQuery.data?.stages ?? [];
  const toggleComplete = useMutation({
    mutationFn: (stage) => upsertStage({
      data: {
        date_plan_id: stage.date_plan_id,
        id: stage.id,
        title: stage.title,
        is_completed: !stage.is_completed
      }
    }),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ["date-stages", date.id]
    }),
    onError: (e) => toast.error(e.message)
  });
  const removeStage = useMutation({
    mutationFn: (id) => deleteStage({
      data: {
        id
      }
    }),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ["date-stages", date.id]
    }),
    onError: (e) => toast.error(e.message)
  });
  const addStage = useMutation({
    mutationFn: () => upsertStage({
      data: {
        date_plan_id: date.id,
        title: newTitle.trim(),
        time_offset: newTime || null
      }
    }),
    onSuccess: () => {
      setNewTitle("");
      setNewTime("");
      setAddingStage(false);
      qc.invalidateQueries({
        queryKey: ["date-stages", date.id]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  const completedCount = stages.filter((s) => s.is_completed).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-[2px]", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md h-full bg-card border-l shadow-2xl overflow-y-auto flex flex-col", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky top-0 bg-card/95 backdrop-blur border-b px-6 py-5 flex items-start justify-between gap-4 z-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-serif text-xl leading-tight", children: date.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1", children: [
          date.date_planned && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3 w-3" }),
            format(parseISO(date.date_planned), "MMMM d, yyyy")
          ] }),
          stages.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-primary font-medium", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }),
            " ",
            completedCount,
            "/",
            stages.length,
            " done"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: onClose, className: "shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    date.description && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 pt-4 pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground leading-relaxed italic", children: date.description }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-4 flex-1 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListChecks, { className: "h-4 w-4 text-primary" }),
          " Itinerary"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "ghost", className: "h-7 text-xs gap-1", onClick: () => setAddingStage(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }),
          " Add Step"
        ] })
      ] }),
      stagesQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
        " Loading…"
      ] }) : stages.length === 0 && !addingStage ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-dashed p-8 text-center text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "mx-auto h-7 w-7 mb-2 text-muted-foreground/40" }),
        "No itinerary steps yet. Add the first one!"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: stages.map((stage) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `group flex items-start gap-3 rounded-xl border p-3 transition ${stage.is_completed ? "opacity-60 bg-accent/40" : "bg-card"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "mt-0.5 shrink-0", onClick: () => toggleComplete.mutate(stage), children: stage.is_completed ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4.5 w-4.5 text-emerald-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-4.5 w-4.5 text-muted-foreground/40 hover:text-primary transition" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-sm font-medium leading-snug ${stage.is_completed ? "line-through" : ""}`, children: stage.title }),
          stage.time_offset && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground inline-flex items-center gap-0.5 mt-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
            stage.time_offset.slice(0, 5)
          ] }),
          stage.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1 leading-relaxed", children: stage.description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0", onClick: () => removeStage.mutate(stage.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-muted-foreground hover:text-destructive" }) })
      ] }, stage.id)) }),
      addingStage && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border bg-accent/30 p-3 space-y-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Step title…", value: newTitle, onChange: (e) => setNewTitle(e.target.value), className: "col-span-2 h-8 text-sm", autoFocus: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "time", value: newTime, onChange: (e) => setNewTime(e.target.value), className: "h-8 text-sm" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "h-8 rounded-lg flex-1 text-xs", onClick: () => {
            if (newTitle.trim()) addStage.mutate();
          }, disabled: !newTitle.trim() || addStage.isPending, children: addStage.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : "Add" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-8 rounded-lg text-xs", onClick: () => {
            setAddingStage(false);
            setNewTitle("");
            setNewTime("");
          }, children: "Cancel" })
        ] })
      ] }) })
    ] })
  ] }) });
}
function DateDialog({
  initial,
  workspaceId,
  onClose,
  queryKey
}) {
  const qc = useQueryClient();
  const upsertDate = useServerFn(upsertDatePlan);
  const upsertStage = useServerFn(upsertDateStage);
  const fetchPlaces = useServerFn(listSavedPlaces);
  const savePlace = useServerFn(upsertSavedPlace);
  const placesQuery = useQuery({
    queryKey: ["saved-places", workspaceId],
    queryFn: () => fetchPlaces({
      data: {
        workspace_id: workspaceId
      }
    })
  });
  const [title, setTitle] = reactExports.useState(initial?.title ?? "");
  const [description, setDescription] = reactExports.useState(initial?.description ?? "");
  const [datePlanned, setDatePlanned] = reactExports.useState(initial?.date_planned ?? "");
  const [status, setStatus] = reactExports.useState(initial?.status ?? "idea");
  const [selectedTemplate, setSelectedTemplate] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const [placeId, setPlaceId] = reactExports.useState(initial?.place_id ?? "");
  const [locName, setLocName] = reactExports.useState(initial?.location_name ?? "");
  const [locAddress, setLocAddress] = reactExports.useState(initial?.location_address ?? "");
  const [lat, setLat] = reactExports.useState(initial?.latitude ?? null);
  const [lng, setLng] = reactExports.useState(initial?.longitude ?? null);
  const [savePlaceToLibrary, setSavePlaceToLibrary] = reactExports.useState(false);
  const [newPlaceCategory, setNewPlaceCategory] = reactExports.useState("Restaurant");
  const places = placesQuery.data?.places ?? [];
  const choosePlace = (id) => {
    setPlaceId(id);
    if (id === "" || id === "new") {
      if (id === "new") {
        setLocName("");
        setLocAddress("");
        setLat(null);
        setLng(null);
      }
      return;
    }
    const p = places.find((x) => x.id === id);
    if (p) {
      setLocName(p.name);
      setLocAddress(p.address ?? p.city_region ?? "");
      setLat(p.latitude ?? null);
      setLng(p.longitude ?? null);
    }
  };
  async function save(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      let finalPlaceId = placeId && placeId !== "new" ? placeId : null;
      if (placeId === "new" && savePlaceToLibrary && locName.trim()) {
        const res = await savePlace({
          data: {
            workspace_id: workspaceId,
            name: locName.trim(),
            category: newPlaceCategory,
            address: locAddress || null,
            latitude: lat,
            longitude: lng,
            ideal_for: ["date"]
          }
        });
        finalPlaceId = res?.place?.id ?? null;
        qc.invalidateQueries({
          queryKey: ["saved-places", workspaceId]
        });
      }
      const result = await upsertDate({
        data: {
          workspace_id: workspaceId,
          id: initial?.id,
          title: title.trim(),
          description: description.trim() || null,
          date_planned: datePlanned || null,
          status,
          place_id: finalPlaceId,
          location_name: locName || null,
          location_address: locAddress || null,
          latitude: lat,
          longitude: lng
        }
      });
      if (!initial?.id && selectedTemplate) {
        const template = DATE_TEMPLATES.find((t) => t.label === selectedTemplate);
        if (template && result?.date?.id) {
          await Promise.all(template.stages.map((stage) => upsertStage({
            data: {
              date_plan_id: result.date.id,
              title: stage.title,
              time_offset: stage.time_offset
            }
          })));
        }
      }
      toast.success(initial ? "Date updated" : "Date idea saved!");
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
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-start bg-black/30 backdrop-blur-[2px] p-4 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: save, className: "w-full max-w-lg rounded-2xl border bg-card p-6 shadow-xl space-y-5 mx-auto my-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-serif text-2xl flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarHeart, { className: "h-6 w-6 text-primary" }),
        initial ? "Edit Date" : "Plan a Date"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "icon", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date Title" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, value: title, onChange: (e) => setTitle(e.target.value), placeholder: "e.g. Rooftop dinner & stargazing" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date Planned" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: datePlanned, onChange: (e) => setDatePlanned(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm", value: status, onChange: (e) => setStatus(e.target.value), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "idea", children: "💡 Idea" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "scheduled", children: "📅 Scheduled" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "completed", children: "✅ Completed" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 rounded-xl border bg-accent/20 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3.5 w-3.5 text-primary" }),
          " Location"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "h-9 w-full rounded-md border border-input bg-card px-3 text-sm", value: placeId, onChange: (e) => choosePlace(e.target.value), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "No location" }),
          places.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("optgroup", { label: "From your saved places", children: places.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: p.id, children: [
            p.name,
            p.category ? ` — ${p.category}` : ""
          ] }, p.id)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "new", children: "➕ Pick a new spot on the map…" })
        ] }),
        placeId === "new" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Place name", value: locName, onChange: (e) => setLocName(e.target.value) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: "h-9 rounded-md border border-input bg-card px-3 text-sm", value: newPlaceCategory, onChange: (e) => setNewPlaceCategory(e.target.value), children: ["Restaurant", "Cafe", "Picnic spot", "Cinema", "Park", "Bakery", "Workdate", "Night out", "Other"].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c, children: c }, c)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapPicker, { value: {
            latitude: lat,
            longitude: lng
          }, onChange: (loc) => {
            setLat(loc.latitude);
            setLng(loc.longitude);
            setLocAddress(loc.address ?? "");
            if (!locName && loc.name) setLocName(loc.name);
          }, height: 240 }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: savePlaceToLibrary, onChange: (e) => setSavePlaceToLibrary(e.target.checked) }),
            "Also save this to my Places library"
          ] })
        ] }),
        placeId && placeId !== "new" && lat != null && lng != null && /* @__PURE__ */ jsxRuntimeExports.jsx(MapPreview, { latitude: lat, longitude: lng, height: 140 })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: description, onChange: (e) => setDescription(e.target.value), placeholder: "What's the vibe? Any special details or ideas…" })
      ] }),
      !initial && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-primary" }),
          "Start from a template (optional)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1", children: DATE_TEMPLATES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setSelectedTemplate((prev) => prev === t.label ? "" : t.label), className: `flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs font-medium transition ${selectedTemplate === t.label ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1", children: t.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
            t.stages.length,
            " steps"
          ] })
        ] }, t.label)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2 border-t", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: busy || !title.trim(), className: "rounded-xl", children: [
        busy && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
        initial ? "Save Changes" : "Create Date"
      ] })
    ] })
  ] }) });
}
export {
  DateSpacePage as component
};
