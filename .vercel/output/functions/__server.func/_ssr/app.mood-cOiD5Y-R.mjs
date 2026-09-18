import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQuery, b as useQueryClient, a as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as useWorkspace, u as useServerFn } from "./createSsrRpc-BN6DI1sa.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { L as Label } from "./label-C8WJLhmR.mjs";
import { T as Textarea } from "./textarea-F69quoCd.mjs";
import { a as deleteMoodLog, b as upsertMoodLog, c as listMoodLogs } from "./wellness.functions-DHsnCyXo.mjs";
import "../_libs/seroval.mjs";
import { s as startOfDay, c as subDays, f as format, p as parseISO } from "../_libs/date-fns.mjs";
import { k as Activity, d as Plus, a4 as Smile, a5 as Zap, f as Calendar, a6 as TrendingUp, L as LoaderCircle, t as Trash2, X } from "../_libs/lucide-react.mjs";
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
function moodEmoji(score) {
  if (score >= 8) return "😊";
  if (score >= 6) return "🙂";
  if (score >= 4) return "😐";
  if (score >= 2) return "😕";
  return "😢";
}
function moodColor(score) {
  if (score >= 8) return "text-emerald-500";
  if (score >= 6) return "text-teal-500";
  if (score >= 4) return "text-amber-500";
  if (score >= 2) return "text-orange-500";
  return "text-rose-500";
}
function moodBarColor(score) {
  if (score >= 8) return "bg-emerald-400";
  if (score >= 6) return "bg-teal-400";
  if (score >= 4) return "bg-amber-400";
  if (score >= 2) return "bg-orange-400";
  return "bg-rose-400";
}
function ScoreSlider({
  label,
  icon: Icon,
  value,
  onChange,
  colorFn
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "flex items-center gap-1.5 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }),
        " ",
        label
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-2xl font-bold tabular-nums ${colorFn(value)}`, children: [
        value,
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground font-normal", children: "/10" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1.5", children: Array.from({
      length: 10
    }, (_, i) => i + 1).map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => onChange(n), className: `flex-1 h-8 rounded-md transition-all text-xs font-bold ${n <= value ? `${colorFn(value).replace("text-", "bg-")} text-white` : "bg-accent hover:bg-accent/80 text-muted-foreground"}`, children: n }, n)) })
  ] });
}
function MoodPage() {
  const {
    current
  } = useWorkspace();
  const [dialogOpen, setDialogOpen] = reactExports.useState(false);
  const [editingLog, setEditingLog] = reactExports.useState(null);
  const [days, setDays] = reactExports.useState(14);
  const fetchLogs = useServerFn(listMoodLogs);
  const workspaceId = current?.id;
  const logsQuery = useQuery({
    queryKey: ["mood-logs", workspaceId, days],
    queryFn: () => fetchLogs({
      data: {
        workspace_id: workspaceId,
        days
      }
    }),
    enabled: !!workspaceId
  });
  if (!current) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-sm text-muted-foreground", children: "Pick a workspace to begin." });
  const logs = logsQuery.data?.logs ?? [];
  const avgMood = logs.length ? Math.round(logs.reduce((s, l) => s + l.mood_score, 0) / logs.length * 10) / 10 : null;
  const avgEnergy = logs.length ? Math.round(logs.reduce((s, l) => s + l.energy_score, 0) / logs.length * 10) / 10 : null;
  const today = startOfDay(/* @__PURE__ */ new Date());
  const dayMap = reactExports.useMemo(() => {
    const m = {};
    logs.forEach((l) => {
      m[l.logged_date] = l;
    });
    return m;
  }, [logs]);
  const chartDays = Array.from({
    length: days
  }, (_, i) => {
    const d = subDays(today, days - 1 - i);
    const key = format(d, "yyyy-MM-dd");
    return {
      date: d,
      key,
      log: dayMap[key] ?? null
    };
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-4xl px-6 py-10 space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-end justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-serif text-3xl flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-7 w-7 text-primary" }),
          " Mood & Energy"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Track your daily relationship energy and emotional wellbeing." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
        setEditingLog(null);
        setDialogOpen(true);
      }, className: "rounded-xl gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " Log Today"
      ] })
    ] }),
    logs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: Smile, label: "Avg Mood", value: `${avgMood}/10`, color: "text-emerald-500" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: Zap, label: "Avg Energy", value: `${avgEnergy}/10`, color: "text-amber-500" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: Calendar, label: "Check-ins", value: `${logs.length}`, color: "text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: TrendingUp, label: "Streak", value: calcStreak(dayMap) + " days", color: "text-rose-500" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-5 shadow-[var(--shadow-soft)] space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-semibold", children: [
          "Last ",
          days,
          " Days"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1 text-xs", children: [7, 14, 30].map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setDays(d), className: `px-2.5 py-1 rounded-lg transition font-medium ${days === d ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`, children: [
          d,
          "d"
        ] }, d)) })
      ] }),
      logsQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground py-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
        " Loading…"
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end gap-1 h-28 overflow-x-auto pb-1", children: chartDays.map(({
        date,
        key,
        log
      }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1 flex-1 min-w-[28px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full flex flex-col justify-end h-20 gap-0.5", children: log ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-full rounded-sm transition-all ${moodBarColor(log.energy_score)} opacity-50`, style: {
            height: `${log.energy_score / 10 * 100}%`
          }, title: `Energy: ${log.energy_score}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-full rounded-sm transition-all ${moodBarColor(log.mood_score)}`, style: {
            height: `${log.mood_score / 10 * 100}%`
          }, title: `Mood: ${log.mood_score}` })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full rounded-sm bg-accent/40 h-1" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-muted-foreground", children: format(date, days <= 14 ? "dd" : "d") })
      ] }, key)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 text-[10px] text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block h-2.5 w-4 rounded-sm bg-emerald-400" }),
          " Mood"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block h-2.5 w-4 rounded-sm bg-emerald-400 opacity-50" }),
          " Energy"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold text-muted-foreground uppercase tracking-wider", children: "Recent Check-ins" }),
      logsQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Loading…" }) : logs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-dashed bg-card p-12 text-center text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "mx-auto h-10 w-10 text-muted-foreground/40 mb-3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No check-ins yet." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1", children: "Log your first mood to start tracking your relationship wellness." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: logs.map((log) => /* @__PURE__ */ jsxRuntimeExports.jsx(MoodLogCard, { log, workspaceId, queryKey: ["mood-logs", workspaceId, days], onEdit: () => {
        setEditingLog(log);
        setDialogOpen(true);
      } }, log.id)) })
    ] }),
    dialogOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(MoodDialog, { workspaceId: current.id, initial: editingLog, onClose: () => setDialogOpen(false), queryKey: ["mood-logs", current.id, days] })
  ] });
}
function StatCard({
  icon: Icon,
  label,
  value,
  color
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-4 shadow-[var(--shadow-soft)] space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `h-3.5 w-3.5 ${color}` }),
      " ",
      label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-serif text-2xl font-medium", children: value })
  ] });
}
function calcStreak(dayMap) {
  let streak = 0;
  let d = /* @__PURE__ */ new Date();
  while (true) {
    const key = format(d, "yyyy-MM-dd");
    if (dayMap[key]) {
      streak++;
      d = subDays(d, 1);
    } else break;
  }
  return streak;
}
function MoodLogCard({
  log,
  workspaceId,
  queryKey,
  onEdit
}) {
  const qc = useQueryClient();
  const deleteLog = useServerFn(deleteMoodLog);
  const remove = useMutation({
    mutationFn: () => deleteLog({
      data: {
        id: log.id
      }
    }),
    onSuccess: () => {
      toast.success("Entry removed");
      qc.invalidateQueries({
        queryKey
      });
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: onEdit, className: "group rounded-2xl border bg-card p-4 shadow-[var(--shadow-soft)] flex items-center gap-4 cursor-pointer hover:shadow-md transition", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl shrink-0", children: moodEmoji(log.mood_score) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-bold text-lg tabular-nums ${moodColor(log.mood_score)}`, children: [
          log.mood_score,
          "/10"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "mood" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-bold text-lg tabular-nums ${moodColor(log.energy_score)}`, children: [
          log.energy_score,
          "/10"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "energy" })
      ] }),
      log.relationship_note && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground line-clamp-1 italic", children: [
        '"',
        log.relationship_note,
        '"'
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right shrink-0 space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: format(parseISO(log.logged_date), "MMM d") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 opacity-0 group-hover:opacity-100", onClick: (e) => {
        e.stopPropagation();
        remove.mutate();
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-muted-foreground hover:text-destructive" }) })
    ] })
  ] });
}
function MoodDialog({
  initial,
  workspaceId,
  onClose,
  queryKey
}) {
  const qc = useQueryClient();
  const upsert = useServerFn(upsertMoodLog);
  const [mood, setMood] = reactExports.useState(initial?.mood_score ?? 7);
  const [energy, setEnergy] = reactExports.useState(initial?.energy_score ?? 7);
  const [note, setNote] = reactExports.useState(initial?.relationship_note ?? "");
  const [date, setDate] = reactExports.useState(initial?.logged_date ?? format(/* @__PURE__ */ new Date(), "yyyy-MM-dd"));
  const [busy, setBusy] = reactExports.useState(false);
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await upsert({
        data: {
          workspace_id: workspaceId,
          id: initial?.id,
          mood_score: mood,
          energy_score: energy,
          relationship_note: note.trim() || null,
          logged_date: date
        }
      });
      toast.success(initial ? "Updated!" : "Mood logged 🌿");
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
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/30 backdrop-blur-[2px] p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: save, className: "w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-serif text-2xl flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "h-6 w-6 text-primary" }),
        initial ? "Edit Check-in" : "Daily Check-in"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "icon", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", className: "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm", value: date, onChange: (e) => setDate(e.target.value) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ScoreSlider, { label: "Mood Score", icon: Smile, value: mood, onChange: setMood, colorFn: moodColor }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ScoreSlider, { label: "Energy Score", icon: Zap, value: energy, onChange: setEnergy, colorFn: moodColor }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Relationship Note (optional)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: note, onChange: (e) => setNote(e.target.value), placeholder: "How do you feel about the relationship today?" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2 border-t", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: busy, className: "rounded-xl", children: [
        busy && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
        initial ? "Save Changes" : "Log Mood"
      ] })
    ] })
  ] }) });
}
export {
  MoodPage as component
};
