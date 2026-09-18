import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useQueryClient, u as useQuery, a as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as useWorkspace, u as useServerFn } from "./createSsrRpc-BN6DI1sa.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { L as Label } from "./label-C8WJLhmR.mjs";
import { T as Textarea } from "./textarea-F69quoCd.mjs";
import { d as deleteEvent, u as upsertEvent, l as listEvents } from "./events.functions-pBjIr4Ll.mjs";
import "../_libs/seroval.mjs";
import { d as Plus, x as CalendarDays, _ as ChevronLeft, O as ChevronRight, s as Star, t as Trash2, X, L as LoaderCircle } from "../_libs/lucide-react.mjs";
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
const CATEGORIES = ["birthday", "anniversary", "milestone", "exam", "interview", "trip", "date", "other"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function CalendarPage() {
  const {
    current
  } = useWorkspace();
  const [view, setView] = reactExports.useState("month");
  const [cursor, setCursor] = reactExports.useState(() => {
    const d = /* @__PURE__ */ new Date();
    d.setDate(1);
    return d;
  });
  const [editing, setEditing] = reactExports.useState(null);
  const fetchList = useServerFn(listEvents);
  const upsert = useServerFn(upsertEvent);
  const del = useServerFn(deleteEvent);
  const qc = useQueryClient();
  const workspaceId = current?.id;
  const {
    data
  } = useQuery({
    queryKey: ["events", workspaceId],
    queryFn: () => fetchList({
      data: {
        workspace_id: workspaceId
      }
    }),
    enabled: !!workspaceId
  });
  const events = data?.events ?? [];
  const upcoming = reactExports.useMemo(() => computeUpcoming(events, 6), [events]);
  const remove = useMutation({
    mutationFn: (id) => del({
      data: {
        id
      }
    }),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ["events", workspaceId]
    })
  });
  if (!current) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-sm text-muted-foreground", children: "Pick a workspace to begin." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl px-6 py-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-end justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-serif text-3xl", children: "Calendar & Timeline" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Birthdays, anniversaries, exams, trips, milestones." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-1 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setView("month"), className: `rounded-lg px-3 py-1 ${view === "month" ? "bg-primary text-primary-foreground" : ""}`, children: "Month" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setView("timeline"), className: `rounded-lg px-3 py-1 ${view === "timeline" ? "bg-primary text-primary-foreground" : ""}`, children: "Timeline" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setEditing("new"), className: "rounded-xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
          " New event"
        ] })
      ] })
    ] }),
    upcoming.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: upcoming.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-4 shadow-[var(--shadow-soft)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "h-3.5 w-3.5" }),
        " ",
        u.event.category ?? "Event"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 font-serif text-lg", children: u.event.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-sm text-muted-foreground", children: u.date.toDateString() }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-2xl font-serif text-primary", children: u.daysAway === 0 ? "Today" : u.daysAway === 1 ? "Tomorrow" : `${u.daysAway} days` })
    ] }, `${u.event.id}-${u.date.toISOString()}`)) }),
    view === "month" ? /* @__PURE__ */ jsxRuntimeExports.jsx(MonthGrid, { cursor, setCursor, events, onPick: (date) => setEditing({
      event_date: toISODate(date)
    }), onClickEvent: (ev) => setEditing(ev) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Timeline, { events, onEdit: setEditing, onDelete: (id) => remove.mutate(id) }),
    editing && /* @__PURE__ */ jsxRuntimeExports.jsx(EventDialog, { workspaceId: current.id, initial: editing === "new" ? null : editing, onClose: () => setEditing(null), onSave: async (payload) => {
      await upsert({
        data: payload
      });
      qc.invalidateQueries({
        queryKey: ["events", workspaceId]
      });
      toast.success("Saved");
      setEditing(null);
    }, onDelete: async (id) => {
      await del({
        data: {
          id
        }
      });
      qc.invalidateQueries({
        queryKey: ["events", workspaceId]
      });
      setEditing(null);
    } })
  ] });
}
function toISODate(d) {
  return d.toISOString().slice(0, 10);
}
function parseDate(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function nextOccurrence(ev, from) {
  const base = parseDate(ev.event_date);
  if (ev.recurrence === "none") return base >= from ? base : null;
  const d = new Date(base);
  while (d < from) {
    if (ev.recurrence === "yearly") d.setFullYear(d.getFullYear() + 1);
    else if (ev.recurrence === "monthly") d.setMonth(d.getMonth() + 1);
    else if (ev.recurrence === "weekly") d.setDate(d.getDate() + 7);
    else return null;
  }
  return d;
}
function computeUpcoming(events, limit) {
  const now = /* @__PURE__ */ new Date();
  now.setHours(0, 0, 0, 0);
  return events.map((event) => {
    const date = nextOccurrence(event, now);
    if (!date) return null;
    const daysAway = Math.round((date.getTime() - now.getTime()) / 864e5);
    return {
      event,
      date,
      daysAway
    };
  }).filter(Boolean).sort((a, b) => a.daysAway - b.daysAway).slice(0, limit);
}
function MonthGrid({
  cursor,
  setCursor,
  events,
  onPick,
  onClickEvent
}) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  const eventsByKey = reactExports.useMemo(() => {
    const map = {};
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    for (const ev of events) {
      const base = parseDate(ev.event_date);
      const dates = [];
      if (ev.recurrence === "none") {
        if (base >= monthStart && base <= monthEnd) dates.push(base);
      } else {
        const d = new Date(base);
        while (d < monthStart) {
          if (ev.recurrence === "yearly") d.setFullYear(d.getFullYear() + 1);
          else if (ev.recurrence === "monthly") d.setMonth(d.getMonth() + 1);
          else if (ev.recurrence === "weekly") d.setDate(d.getDate() + 7);
          else break;
        }
        while (d <= monthEnd) {
          dates.push(new Date(d));
          if (ev.recurrence === "yearly") d.setFullYear(d.getFullYear() + 1);
          else if (ev.recurrence === "monthly") d.setMonth(d.getMonth() + 1);
          else if (ev.recurrence === "weekly") d.setDate(d.getDate() + 7);
          else break;
        }
      }
      for (const d of dates) {
        const key = toISODate(d);
        (map[key] ??= []).push(ev);
      }
    }
    return map;
  }, [events, year, month]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-6 rounded-2xl border bg-card p-4 shadow-[var(--shadow-soft)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-serif text-xl", children: [
        MONTHS[month],
        " ",
        year
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setCursor(new Date(year, month - 1, 1)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
          const d = /* @__PURE__ */ new Date();
          d.setDate(1);
          setCursor(d);
        }, children: "Today" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => setCursor(new Date(year, month + 1, 1)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground", children: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-1", children: d }, d)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-7 gap-1", children: cells.map((d, i) => {
      if (!d) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}, i);
      const key = toISODate(d);
      const list = eventsByKey[key] ?? [];
      const isToday = key === toISODate(/* @__PURE__ */ new Date());
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => onPick(d), className: `min-h-[88px] rounded-lg border bg-background/60 p-1.5 text-left text-xs hover:bg-accent ${isToday ? "border-primary" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mb-1 text-[11px] ${isToday ? "font-bold text-primary" : "text-muted-foreground"}`, children: d.getDate() }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
          list.slice(0, 3).map((ev) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: (e) => {
            e.stopPropagation();
            onClickEvent(ev);
          }, className: "truncate rounded bg-primary/10 px-1 py-0.5 text-[11px] text-primary", children: [
            ev.is_milestone && /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "mr-0.5 inline h-2.5 w-2.5" }),
            " ",
            ev.title
          ] }, ev.id)),
          list.length > 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
            "+",
            list.length - 3,
            " more"
          ] })
        ] })
      ] }, i);
    }) })
  ] });
}
function Timeline({
  events,
  onEdit,
  onDelete
}) {
  const sorted = [...events].sort((a, b) => a.event_date.localeCompare(b.event_date));
  const grouped = {};
  for (const ev of sorted) {
    const y = ev.event_date.slice(0, 4);
    (grouped[y] ??= []).push(ev);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-6 rounded-2xl border bg-card p-6 shadow-[var(--shadow-soft)]", children: [
    Object.keys(grouped).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "No events yet." }),
    Object.entries(grouped).map(([year, list]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mb-8 last:mb-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-serif text-2xl text-primary", children: year }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "mt-3 space-y-3 border-l-2 border-accent pl-5", children: list.map((ev) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -left-[27px] top-1.5 grid h-4 w-4 place-items-center rounded-full bg-primary text-primary-foreground", children: ev.is_milestone ? /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-2.5 w-2.5" }) : null }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
              ev.event_date,
              ev.event_time ? ` · ${ev.event_time.slice(0, 5)}` : "",
              ev.category ? ` · ${ev.category}` : ""
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "font-serif text-lg hover:underline", onClick: () => onEdit(ev), children: ev.title }),
            ev.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-sm text-muted-foreground", children: ev.notes })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => onDelete(ev.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
        ] })
      ] }, ev.id)) })
    ] }, year))
  ] });
}
function EventDialog({
  initial,
  workspaceId,
  onClose,
  onSave,
  onDelete
}) {
  const [form, setForm] = reactExports.useState({
    title: initial?.title ?? "",
    event_date: initial?.event_date ?? toISODate(/* @__PURE__ */ new Date()),
    event_time: initial?.event_time ?? "",
    recurrence: initial?.recurrence ?? "none",
    category: initial?.category ?? "other",
    location: initial?.location ?? "",
    notes: initial?.notes ?? "",
    is_milestone: !!initial?.is_milestone
  });
  const [saving, setSaving] = reactExports.useState(false);
  async function save() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await onSave({
        workspace_id: workspaceId,
        id: initial?.id,
        ...form,
        event_time: form.event_time || null,
        location: form.location || null,
        notes: form.notes || null
      });
    } finally {
      setSaving(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/30 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-lg rounded-2xl border bg-card p-6 shadow-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-serif text-2xl", children: initial?.id ? "Edit event" : "New event" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Title", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { autoFocus: true, value: form.title, onChange: (e) => setForm({
        ...form,
        title: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Date", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.event_date, onChange: (e) => setForm({
          ...form,
          event_date: e.target.value
        }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Time", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "time", value: form.event_time ?? "", onChange: (e) => setForm({
          ...form,
          event_time: e.target.value
        }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Category", children: /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm", value: form.category, onChange: (e) => setForm({
          ...form,
          category: e.target.value
        }), children: CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c, children: c }, c)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Recurrence", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm", value: form.recurrence, onChange: (e) => setForm({
          ...form,
          recurrence: e.target.value
        }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "none", children: "none" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "weekly", children: "weekly" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "monthly", children: "monthly" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "yearly", children: "yearly" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Location", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.location ?? "", onChange: (e) => setForm({
        ...form,
        location: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Notes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: form.notes ?? "", onChange: (e) => setForm({
        ...form,
        notes: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: form.is_milestone, onChange: (e) => setForm({
          ...form,
          is_milestone: e.target.checked
        }) }),
        "Mark as a milestone"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: initial?.id && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", onClick: () => onDelete(initial.id), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "mr-2 h-4 w-4" }),
        " Delete"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: onClose, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: save, disabled: saving || !form.title.trim(), className: "rounded-xl", children: [
          saving && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
          " Save"
        ] })
      ] })
    ] })
  ] }) });
}
function Row({
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: label }),
    children
  ] });
}
export {
  CalendarPage as component
};
