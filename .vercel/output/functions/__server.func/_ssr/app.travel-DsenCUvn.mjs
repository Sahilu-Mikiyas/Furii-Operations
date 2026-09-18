import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useQueryClient, u as useQuery, a as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as useWorkspace, u as useServerFn } from "./createSsrRpc-BN6DI1sa.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { L as Label } from "./label-C8WJLhmR.mjs";
import { T as Textarea } from "./textarea-F69quoCd.mjs";
import { M as MapPreview, a as MapPicker, d as deleteTravelDestination, u as upsertTravelDestination, l as listTravelDestinations } from "./map-picker-CzgHFEZ3.mjs";
import "../_libs/seroval.mjs";
import "../_libs/leaflet.mjs";
import { h as Plane, d as Plus, u as MapPinned, r as CircleCheck, n as Wallet, L as LoaderCircle, v as Pencil, t as Trash2, w as Compass, x as CalendarDays, X } from "../_libs/lucide-react.mjs";
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
import "../_libs/react-leaflet.mjs";
import "../_libs/react-leaflet__core.mjs";
import "../_libs/zod.mjs";
const PRIORITIES = ["soon", "someday", "dream"];
const STATUSES = ["idea", "planning", "booked", "visited"];
const TRIP_TYPES = ["Picnic escape", "Movie night away", "Food trip", "Beach trip", "City break", "Nature retreat", "Workdate getaway", "Adventure", "Family visit"];
function TravelPage() {
  const {
    current
  } = useWorkspace();
  const qc = useQueryClient();
  const list = useServerFn(listTravelDestinations);
  const save = useServerFn(upsertTravelDestination);
  const remove = useServerFn(deleteTravelDestination);
  const [active, setActive] = reactExports.useState(null);
  const [statusFilter, setStatusFilter] = reactExports.useState("all");
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["travel-destinations", current?.id],
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
        queryKey: ["travel-destinations", current?.id]
      });
      setActive(null);
      toast.success("Destination saved");
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
      queryKey: ["travel-destinations", current?.id]
    })
  });
  if (!current) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-sm text-muted-foreground", children: "Preparing your workspace…" });
  const destinations = data?.destinations ?? [];
  const filtered = destinations.filter((d) => statusFilter === "all" || d.status === statusFilter);
  const totalBudget = destinations.reduce((sum, d) => sum + Number(d.estimated_budget || 0), 0);
  const visited = destinations.filter((d) => d.status === "visited").length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl px-6 py-10 space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-end justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-serif text-3xl flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plane, { className: "h-7 w-7 text-primary" }),
          " Trip Wishlist"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Save destinations, budget them, and keep a running map of places you want to go together." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setActive({}), className: "rounded-xl gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " Add destination"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: MapPinned, label: "Saved trips", value: String(destinations.length) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: CircleCheck, label: "Visited", value: String(visited) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: Wallet, label: "Budget tracked", value: totalBudget > 0 ? `$${totalBudget.toLocaleString("en-US")}` : "—" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap items-center gap-2", children: [{
      value: "all",
      label: "All"
    }, ...STATUSES.map((value) => ({
      value,
      label: value[0].toUpperCase() + value.slice(1)
    }))].map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setStatusFilter(tab.value), className: `rounded-full border px-3 py-1.5 text-xs font-medium ${statusFilter === tab.value ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent"}`, children: tab.label }, tab.value)) }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
      " Loading destinations…"
    ] }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-dashed bg-card p-14 text-center text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plane, { className: "mx-auto h-10 w-10 text-muted-foreground/40 mb-3" }),
      "No trips saved yet. Start with the weekend ideas you keep talking about."
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: filtered.map((destination) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "rounded-2xl border bg-card p-5 shadow-[var(--shadow-soft)] space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-1.5 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { children: destination.priority }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { subtle: true, children: destination.status })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-serif text-xl leading-tight", children: destination.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: [destination.city_region, destination.country].filter(Boolean).join(", ") || "Location TBD" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: () => setActive(destination), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }), label: "Edit destination" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: () => delMut.mutate(destination.id), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }), label: "Delete destination" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 grid-cols-2 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Compass, { className: "h-3.5 w-3.5" }), label: "Type", value: destination.trip_type || "Open" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-3.5 w-3.5" }), label: "Budget", value: destination.estimated_budget ? `$${Number(destination.estimated_budget).toLocaleString("en-US")}` : "Not set" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "h-3.5 w-3.5" }), label: "Season", value: destination.target_season || "Any time" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPinned, { className: "h-3.5 w-3.5" }), label: "Duration", value: destination.duration_days ? `${destination.duration_days} days` : "Flexible" })
      ] }),
      destination.best_for?.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: destination.best_for.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-accent px-2 py-0.5 text-[10px]", children: tag }, tag)) }),
      destination.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground leading-relaxed", children: destination.notes }),
      destination.latitude != null && destination.longitude != null && /* @__PURE__ */ jsxRuntimeExports.jsx(MapPreview, { latitude: destination.latitude, longitude: destination.longitude, height: 150 })
    ] }, destination.id)) }),
    active && /* @__PURE__ */ jsxRuntimeExports.jsx(TravelDialog, { initial: active, onClose: () => setActive(null), onSave: (payload) => saveMut.mutate(payload), saving: saveMut.isPending })
  ] });
}
function TravelDialog({
  initial,
  onClose,
  onSave,
  saving
}) {
  const [form, setForm] = reactExports.useState({
    id: initial?.id,
    title: initial?.title ?? "",
    country: initial?.country ?? "",
    city_region: initial?.city_region ?? "",
    trip_type: initial?.trip_type ?? "",
    estimated_budget: initial?.estimated_budget ? String(initial.estimated_budget) : "",
    target_season: initial?.target_season ?? "",
    duration_days: initial?.duration_days ? String(initial.duration_days) : "",
    priority: initial?.priority ?? "someday",
    status: initial?.status ?? "idea",
    notes: initial?.notes ?? "",
    best_for: (initial?.best_for ?? []).join(", "),
    tags: (initial?.tags ?? []).join(", "),
    latitude: initial?.latitude ?? null,
    longitude: initial?.longitude ?? null
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-start bg-black/30 backdrop-blur-[2px] p-4 overflow-y-auto", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
    e.preventDefault();
    onSave({
      ...form,
      estimated_budget: form.estimated_budget ? Number(form.estimated_budget) : null,
      duration_days: form.duration_days ? Number(form.duration_days) : null,
      best_for: form.best_for.split(",").map((v) => v.trim()).filter(Boolean),
      tags: form.tags.split(",").map((v) => v.trim()).filter(Boolean),
      country: form.country || null,
      city_region: form.city_region || null,
      trip_type: form.trip_type || null,
      target_season: form.target_season || null,
      notes: form.notes || null,
      latitude: form.latitude,
      longitude: form.longitude
    });
  }, className: "w-full max-w-2xl rounded-2xl border bg-card p-6 shadow-xl space-y-4 mx-auto my-8", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-serif text-2xl", children: initial?.id ? "Edit destination" : "New destination" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "icon", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Destination name", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, value: form.title, onChange: (e) => setForm({
        ...form,
        title: e.target.value
      }), placeholder: "e.g. Kyoto in spring" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Trip type", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm", value: form.trip_type, onChange: (e) => setForm({
        ...form,
        trip_type: e.target.value
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Choose" }),
        TRIP_TYPES.map((value) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value, children: value }, value))
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Country", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.country, onChange: (e) => setForm({
        ...form,
        country: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "City / region", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.city_region, onChange: (e) => setForm({
        ...form,
        city_region: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Budget", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", step: "0.01", value: form.estimated_budget, onChange: (e) => setForm({
        ...form,
        estimated_budget: e.target.value
      }), placeholder: "2500" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Duration days", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", step: "1", value: form.duration_days, onChange: (e) => setForm({
        ...form,
        duration_days: e.target.value
      }), placeholder: "3" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Target season", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.target_season, onChange: (e) => setForm({
        ...form,
        target_season: e.target.value
      }), placeholder: "Summer / December / Rainy season" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Priority", children: /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm", value: form.priority, onChange: (e) => setForm({
        ...form,
        priority: e.target.value
      }), children: PRIORITIES.map((value) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value, children: value }, value)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Status", children: /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm", value: form.status, onChange: (e) => setForm({
        ...form,
        status: e.target.value
      }), children: STATUSES.map((value) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value, children: value }, value)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Best for", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.best_for, onChange: (e) => setForm({
        ...form,
        best_for: e.target.value
      }), placeholder: "romance, food, rest" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Tags", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.tags, onChange: (e) => setForm({
      ...form,
      tags: e.target.value
    }), placeholder: "weekend, international, roadtrip" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Notes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: form.notes, onChange: (e) => setForm({
      ...form,
      notes: e.target.value
    }), placeholder: "Why this place, what to do there, booking thoughts, ideal season, budget notes…" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Pin on map", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPicker, { value: {
      latitude: form.latitude,
      longitude: form.longitude
    }, onChange: (loc) => setForm((f) => ({
      ...f,
      latitude: loc.latitude,
      longitude: loc.longitude,
      city_region: f.city_region || (loc.name ?? "")
    })), height: 280 }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 border-t flex justify-end gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: saving || !form.title.trim(), children: [
        saving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
        "Save destination"
      ] })
    ] })
  ] }) });
}
function StatCard({
  icon,
  label,
  value
}) {
  const Icon = icon;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-4 shadow-[var(--shadow-soft)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5 text-primary" }),
      " ",
      label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-serif text-2xl mt-1", children: value })
  ] });
}
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: label }),
    children
  ] });
}
function Badge({
  children,
  subtle
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${subtle ? "bg-accent text-accent-foreground" : "bg-primary/10 text-primary"}`, children });
}
function IconButton({
  onClick,
  icon,
  label
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "icon", className: "h-8 w-8", onClick, "aria-label": label, children: icon });
}
function Info({
  icon,
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-1", children: [
      icon,
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-foreground mt-0.5", children: value })
  ] });
}
export {
  TravelPage as component
};
