import { c as createSsrRpc } from "./createSsrRpc-BN6DI1sa.mjs";
import { a as createServerFn } from "./server-DhrmKQ4T.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-ud2LaeJ8.mjs";
import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L } from "../_libs/leaflet.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { M as MapContainer, T as TileLayer, a as Marker, u as useMapEvents, b as useMap } from "../_libs/react-leaflet.mjs";
import { S as Search, L as LoaderCircle, M as MapPin } from "../_libs/lucide-react.mjs";
import { g as objectType, i as stringType, h as numberType, z as booleanType, j as arrayType, k as enumType } from "../_libs/zod.mjs";
const wsId = objectType({
  workspace_id: stringType().uuid()
});
const listTravelDestinations = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(createSsrRpc("9b42d7e17b7cca4e6c8750e8d74ebb3b866a47bece0f42274af1dcb91c0a38db"));
const upsertDestinationInput = objectType({
  workspace_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  title: stringType().trim().min(1).max(200),
  country: stringType().max(120).optional().nullable(),
  city_region: stringType().max(160).optional().nullable(),
  trip_type: stringType().max(120).optional().nullable(),
  estimated_budget: numberType().min(0).optional().nullable(),
  target_season: stringType().max(80).optional().nullable(),
  duration_days: numberType().int().min(1).max(365).optional().nullable(),
  priority: enumType(["soon", "someday", "dream"]).default("someday"),
  status: enumType(["idea", "planning", "booked", "visited"]).default("idea"),
  notes: stringType().max(4e3).optional().nullable(),
  tags: arrayType(stringType().trim().min(1).max(40)).max(20).default([]),
  best_for: arrayType(stringType().trim().min(1).max(40)).max(20).default([]),
  latitude: numberType().optional().nullable(),
  longitude: numberType().optional().nullable()
});
const upsertTravelDestination = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertDestinationInput.parse(d)).handler(createSsrRpc("a5aec2bd0ad98043a15d8229c18bbeecdf61c4731ca584ff6b91172e890069ba"));
const deleteTravelDestination = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("2ff8b3fe3e24f16ab29b1cf00e09a0e17865f2d1fddd5599224b87040a0ab9ac"));
const listSavedPlaces = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(createSsrRpc("aa405b47ff905ecd1f844355c3da064b53b6be6716b78f88f8bbcf7224673ebd"));
const upsertPlaceInput = objectType({
  workspace_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  name: stringType().trim().min(1).max(200),
  category: stringType().trim().min(1).max(80),
  city_region: stringType().max(160).optional().nullable(),
  address: stringType().max(500).optional().nullable(),
  price_band: enumType(["budget", "moderate", "premium", "luxury"]).optional().nullable(),
  vibe: stringType().max(120).optional().nullable(),
  ideal_for: arrayType(stringType().trim().min(1).max(40)).max(20).default([]),
  notes: stringType().max(3e3).optional().nullable(),
  link_url: stringType().max(2e3).optional().nullable(),
  is_favorite: booleanType().default(false),
  latitude: numberType().optional().nullable(),
  longitude: numberType().optional().nullable()
});
const upsertSavedPlace = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertPlaceInput.parse(d)).handler(createSsrRpc("cca13847cff6ab4c6e9bef9bbd29bb599c34751bc822787c729eeec4c868cf5e"));
const deleteSavedPlace = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("f1a390ff131740a106efc52d8dcc7322cfdeab1d78a336140044128a21f06d14"));
const markerIcon = typeof window !== "undefined" ? L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
}) : void 0;
function ClickHandler({ onPick }) {
  useMapEvents({ click(e) {
    onPick(e.latlng.lat, e.latlng.lng);
  } });
  return null;
}
function Recenter({ lat, lng }) {
  const map = useMap();
  reactExports.useEffect(() => {
    map.setView([lat, lng], Math.max(map.getZoom(), 13));
  }, [lat, lng, map]);
  return null;
}
function MapPicker({ value, onChange, height = 260, showSearch = true }) {
  const initialCenter = reactExports.useMemo(() => {
    if (value?.latitude && value?.longitude) return [value.latitude, value.longitude];
    return [20, 0];
  }, []);
  const [query, setQuery] = reactExports.useState("");
  const [results, setResults] = reactExports.useState([]);
  const [searching, setSearching] = reactExports.useState(false);
  const [mounted, setMounted] = reactExports.useState(false);
  const debounce = reactExports.useRef(null);
  reactExports.useEffect(() => {
    setMounted(true);
  }, []);
  const reverse = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const json = await res.json();
      return json?.display_name;
    } catch {
      return void 0;
    }
  };
  const handlePick = async (lat, lng) => {
    const address = await reverse(lat, lng);
    onChange({ latitude: lat, longitude: lng, address: address ?? null });
  };
  const runSearch = (q) => {
    setQuery(q);
    if (debounce.current) window.clearTimeout(debounce.current);
    if (!q.trim()) {
      setResults([]);
      return;
    }
    debounce.current = window.setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=6&q=${encodeURIComponent(q)}`);
        const json = await res.json();
        setResults(Array.isArray(json) ? json : []);
      } finally {
        setSearching(false);
      }
    }, 350);
  };
  const chooseResult = (r) => {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    onChange({ latitude: lat, longitude: lng, address: r.display_name, name: r.display_name.split(",")[0] });
    setResults([]);
    setQuery(r.display_name);
  };
  const hasMarker = value?.latitude != null && value?.longitude != null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    showSearch && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: query,
              onChange: (e) => runSearch(e.target.value),
              placeholder: "Search a place, address, or city…",
              className: "pl-8"
            }
          )
        ] }),
        searching && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin self-center text-muted-foreground" })
      ] }),
      results.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute z-[1000] mt-1 w-full max-h-64 overflow-auto rounded-lg border bg-popover shadow-lg", children: results.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => chooseResult(r),
          className: "block w-full text-left px-3 py-2 text-xs hover:bg-accent border-b last:border-b-0",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "inline h-3 w-3 mr-1 text-primary" }),
            r.display_name
          ]
        },
        i
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl overflow-hidden border bg-muted/30", style: { height }, children: mounted ? /* @__PURE__ */ jsxRuntimeExports.jsxs(MapContainer, { center: initialCenter, zoom: hasMarker ? 13 : 2, style: { height: "100%", width: "100%" }, scrollWheelZoom: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        TileLayer,
        {
          attribution: "© OpenStreetMap",
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ClickHandler, { onPick: handlePick }),
      hasMarker && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Marker, { position: [value.latitude, value.longitude], icon: markerIcon }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Recenter, { lat: value.latitude, lng: value.longitude })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full grid place-items-center text-xs text-muted-foreground", children: "Loading map…" }) }),
    hasMarker ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
      "Pinned at ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono", children: [
        value.latitude.toFixed(5),
        ", ",
        value.longitude.toFixed(5)
      ] }),
      ". Click the map to change."
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Search above or click on the map to drop a pin." })
  ] });
}
function MapPreview({ latitude, longitude, height = 160 }) {
  const [mounted, setMounted] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border bg-muted/30 grid place-items-center text-xs text-muted-foreground", style: { height }, children: "Map…" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl overflow-hidden border", style: { height }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(MapContainer, { center: [latitude, longitude], zoom: 14, style: { height: "100%", width: "100%" }, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, zoomControl: false, attributionControl: false, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TileLayer, { url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Marker, { position: [latitude, longitude], icon: markerIcon })
  ] }) });
}
export {
  MapPreview as M,
  MapPicker as a,
  deleteSavedPlace as b,
  upsertSavedPlace as c,
  deleteTravelDestination as d,
  listSavedPlaces as e,
  listTravelDestinations as l,
  upsertTravelDestination as u
};
