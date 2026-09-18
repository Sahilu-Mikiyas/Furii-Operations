import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useQueryClient, u as useQuery, a as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as useWorkspace, u as useServerFn } from "./createSsrRpc-BN6DI1sa.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { L as Label } from "./label-C8WJLhmR.mjs";
import { T as Textarea } from "./textarea-F69quoCd.mjs";
import { M as MapPreview, a as MapPicker, b as deleteSavedPlace, c as upsertSavedPlace, e as listSavedPlaces } from "./map-picker-CzgHFEZ3.mjs";
import "../_libs/seroval.mjs";
import "../_libs/leaflet.mjs";
import { M as MapPin, d as Plus, L as LoaderCircle, H as Heart, v as Pencil, t as Trash2, a0 as ExternalLink, a1 as Coffee, a2 as UtensilsCrossed, X } from "../_libs/lucide-react.mjs";
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
const CATEGORIES = ["Picnic spot", "Gym", "Cafe", "Restaurant", "Cinema", "Park", "Museum", "Bakery", "Workdate", "Night out", "Other"];
const VIBE_OPTIONS = ["cozy", "quiet", "fancy", "fun", "romantic", "productive", "family-friendly", "outdoorsy"];
function PlacesPage() {
  const {
    current
  } = useWorkspace();
  const qc = useQueryClient();
  const list = useServerFn(listSavedPlaces);
  const save = useServerFn(upsertSavedPlace);
  const remove = useServerFn(deleteSavedPlace);
  const [active, setActive] = reactExports.useState(null);
  const [filter, setFilter] = reactExports.useState("All");
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["saved-places", current?.id],
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
        queryKey: ["saved-places", current?.id]
      });
      setActive(null);
      toast.success("Place saved");
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
      queryKey: ["saved-places", current?.id]
    })
  });
  if (!current) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-sm text-muted-foreground", children: "Preparing your workspace…" });
  const places = data?.places ?? [];
  const categories = reactExports.useMemo(() => ["All", ...Array.from(new Set(places.map((place) => place.category).filter(Boolean)))], [places]);
  const filtered = places.filter((place) => filter === "All" || place.category === filter);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl px-6 py-10 space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-end justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-serif text-3xl flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-7 w-7 text-primary" }),
          " Saved Places"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Keep a reusable list of cafés, restaurants, gyms, picnic spots, and every place that matters to your plans." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setActive({}), className: "rounded-xl gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " Add place"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: categories.map((category) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFilter(category), className: `rounded-full border px-3 py-1.5 text-xs font-medium ${filter === category ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent"}`, children: category }, category)) }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
      " Loading places…"
    ] }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-dashed bg-card p-14 text-center text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "mx-auto h-10 w-10 text-muted-foreground/40 mb-3" }),
      "No places saved yet. Start your own city guide for dates, routines, and spontaneous plans."
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: filtered.map((place) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "rounded-2xl border bg-card p-5 shadow-[var(--shadow-soft)] space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
            iconFor(place.category),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: place.category }),
            place.is_favorite ? /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-3.5 w-3.5 text-primary fill-current" }) : null
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-serif text-xl mt-2 leading-tight", children: place.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: [place.city_region, place.address].filter(Boolean).join(" · ") || "Location details later" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: () => setActive(place), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5" }), label: "Edit place" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: () => delMut.mutate(place.id), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }), label: "Delete place" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-1.5 text-[10px]", children: [
        place.vibe ? /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { children: place.vibe }) : null,
        place.price_band ? /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { children: place.price_band }) : null,
        (place.ideal_for ?? []).map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { children: tag }, tag))
      ] }),
      place.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground leading-relaxed", children: place.notes }),
      place.latitude != null && place.longitude != null && /* @__PURE__ */ jsxRuntimeExports.jsx(MapPreview, { latitude: place.latitude, longitude: place.longitude, height: 140 }),
      place.link_url && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: place.link_url, target: "_blank", rel: "noreferrer", className: "inline-flex items-center gap-1 text-xs text-primary hover:underline", children: [
        "Open link ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3" })
      ] })
    ] }, place.id)) }),
    active && /* @__PURE__ */ jsxRuntimeExports.jsx(PlaceDialog, { initial: active, onClose: () => setActive(null), onSave: (payload) => saveMut.mutate(payload), saving: saveMut.isPending })
  ] });
}
function PlaceDialog({
  initial,
  onClose,
  onSave,
  saving
}) {
  const [form, setForm] = reactExports.useState({
    id: initial?.id,
    name: initial?.name ?? "",
    category: initial?.category ?? CATEGORIES[0],
    city_region: initial?.city_region ?? "",
    address: initial?.address ?? "",
    price_band: initial?.price_band ?? "",
    vibe: initial?.vibe ?? "",
    ideal_for: (initial?.ideal_for ?? []).join(", "),
    notes: initial?.notes ?? "",
    link_url: initial?.link_url ?? "",
    is_favorite: Boolean(initial?.is_favorite),
    latitude: initial?.latitude ?? null,
    longitude: initial?.longitude ?? null
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-start bg-black/30 backdrop-blur-[2px] p-4 overflow-y-auto", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
    e.preventDefault();
    onSave({
      ...form,
      city_region: form.city_region || null,
      address: form.address || null,
      price_band: form.price_band || null,
      vibe: form.vibe || null,
      ideal_for: form.ideal_for.split(",").map((v) => v.trim()).filter(Boolean),
      notes: form.notes || null,
      link_url: form.link_url || null,
      latitude: form.latitude,
      longitude: form.longitude
    });
  }, className: "w-full max-w-2xl rounded-2xl border bg-card p-6 shadow-xl space-y-4 mx-auto my-8", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-serif text-2xl", children: initial?.id ? "Edit place" : "New place" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "icon", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Name", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, value: form.name, onChange: (e) => setForm({
        ...form,
        name: e.target.value
      }), placeholder: "e.g. Riverside coffee house" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Category", children: /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm", value: form.category, onChange: (e) => setForm({
        ...form,
        category: e.target.value
      }), children: CATEGORIES.map((category) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: category, children: category }, category)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "City / region", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.city_region, onChange: (e) => setForm({
        ...form,
        city_region: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Address", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.address, onChange: (e) => setForm({
        ...form,
        address: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Price band", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm", value: form.price_band, onChange: (e) => setForm({
        ...form,
        price_band: e.target.value
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Not set" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "budget", children: "Budget" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "moderate", children: "Moderate" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "premium", children: "Premium" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "luxury", children: "Luxury" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Vibe", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm", value: form.vibe, onChange: (e) => setForm({
        ...form,
        vibe: e.target.value
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Choose" }),
        VIBE_OPTIONS.map((value) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value, children: value }, value))
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Location on map", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPicker, { value: {
      latitude: form.latitude,
      longitude: form.longitude
    }, onChange: (loc) => setForm((f) => ({
      ...f,
      latitude: loc.latitude,
      longitude: loc.longitude,
      address: loc.address ?? f.address,
      name: f.name || (loc.name ?? f.name)
    })), height: 280 }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Ideal for", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.ideal_for, onChange: (e) => setForm({
      ...form,
      ideal_for: e.target.value
    }), placeholder: "picnic, workdate, brunch, anniversary" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Link", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "url", value: form.link_url, onChange: (e) => setForm({
      ...form,
      link_url: e.target.value
    }), placeholder: "https://..." }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Notes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: form.notes, onChange: (e) => setForm({
      ...form,
      notes: e.target.value
    }), placeholder: "Why it matters, best times to go, reservation tips, what to order…" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: form.is_favorite, onChange: (e) => setForm({
        ...form,
        is_favorite: e.target.checked
      }) }),
      " Favorite place"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 border-t flex justify-end gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: saving || !form.name.trim(), children: [
        saving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
        "Save place"
      ] })
    ] })
  ] }) });
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
function Chip({
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-accent px-2 py-0.5 text-accent-foreground", children });
}
function IconButton({
  onClick,
  icon,
  label
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "icon", className: "h-8 w-8", onClick, "aria-label": label, children: icon });
}
function iconFor(category) {
  const lower = category.toLowerCase();
  if (lower.includes("cafe") || lower.includes("bakery")) return /* @__PURE__ */ jsxRuntimeExports.jsx(Coffee, { className: "h-3.5 w-3.5 text-primary" });
  if (lower.includes("restaurant")) return /* @__PURE__ */ jsxRuntimeExports.jsx(UtensilsCrossed, { className: "h-3.5 w-3.5 text-primary" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3.5 w-3.5 text-primary" });
}
export {
  PlacesPage as component
};
