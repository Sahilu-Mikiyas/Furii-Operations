import { c as createServerRpc } from "./createServerRpc-DgawnTky.mjs";
import { a as createServerFn } from "./server-DhrmKQ4T.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-ud2LaeJ8.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { g as objectType, i as stringType, h as numberType, j as arrayType, k as enumType, z as booleanType } from "../_libs/zod.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
const wsId = objectType({
  workspace_id: stringType().uuid()
});
const listTravelDestinations_createServerFn_handler = createServerRpc({
  id: "9b42d7e17b7cca4e6c8750e8d74ebb3b866a47bece0f42274af1dcb91c0a38db",
  name: "listTravelDestinations",
  filename: "src/lib/explore.functions.ts"
}, (opts) => listTravelDestinations.__executeServer(opts));
const listTravelDestinations = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(listTravelDestinations_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: rows,
    error
  } = await context.supabase.from("travel_destinations").select("*").eq("workspace_id", data.workspace_id).order("created_at", {
    ascending: false
  });
  if (error) throw error;
  return {
    destinations: rows ?? []
  };
});
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
const upsertTravelDestination_createServerFn_handler = createServerRpc({
  id: "a5aec2bd0ad98043a15d8229c18bbeecdf61c4731ca584ff6b91172e890069ba",
  name: "upsertTravelDestination",
  filename: "src/lib/explore.functions.ts"
}, (opts) => upsertTravelDestination.__executeServer(opts));
const upsertTravelDestination = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertDestinationInput.parse(d)).handler(upsertTravelDestination_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    workspace_id,
    id,
    ...rest
  } = data;
  if (id) {
    const {
      data: row2,
      error: error2
    } = await supabase.from("travel_destinations").update(rest).eq("id", id).select().single();
    if (error2) throw error2;
    return {
      destination: row2
    };
  }
  const {
    data: row,
    error
  } = await supabase.from("travel_destinations").insert({
    workspace_id,
    author_id: userId,
    ...rest
  }).select().single();
  if (error) throw error;
  return {
    destination: row
  };
});
const deleteTravelDestination_createServerFn_handler = createServerRpc({
  id: "2ff8b3fe3e24f16ab29b1cf00e09a0e17865f2d1fddd5599224b87040a0ab9ac",
  name: "deleteTravelDestination",
  filename: "src/lib/explore.functions.ts"
}, (opts) => deleteTravelDestination.__executeServer(opts));
const deleteTravelDestination = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteTravelDestination_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error
  } = await context.supabase.from("travel_destinations").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
const listSavedPlaces_createServerFn_handler = createServerRpc({
  id: "aa405b47ff905ecd1f844355c3da064b53b6be6716b78f88f8bbcf7224673ebd",
  name: "listSavedPlaces",
  filename: "src/lib/explore.functions.ts"
}, (opts) => listSavedPlaces.__executeServer(opts));
const listSavedPlaces = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(listSavedPlaces_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: rows,
    error
  } = await context.supabase.from("saved_places").select("*").eq("workspace_id", data.workspace_id).order("is_favorite", {
    ascending: false
  }).order("created_at", {
    ascending: false
  });
  if (error) throw error;
  return {
    places: rows ?? []
  };
});
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
const upsertSavedPlace_createServerFn_handler = createServerRpc({
  id: "cca13847cff6ab4c6e9bef9bbd29bb599c34751bc822787c729eeec4c868cf5e",
  name: "upsertSavedPlace",
  filename: "src/lib/explore.functions.ts"
}, (opts) => upsertSavedPlace.__executeServer(opts));
const upsertSavedPlace = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertPlaceInput.parse(d)).handler(upsertSavedPlace_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    workspace_id,
    id,
    ...rest
  } = data;
  if (id) {
    const {
      data: row2,
      error: error2
    } = await supabase.from("saved_places").update(rest).eq("id", id).select().single();
    if (error2) throw error2;
    return {
      place: row2
    };
  }
  const {
    data: row,
    error
  } = await supabase.from("saved_places").insert({
    workspace_id,
    author_id: userId,
    ...rest
  }).select().single();
  if (error) throw error;
  return {
    place: row
  };
});
const deleteSavedPlace_createServerFn_handler = createServerRpc({
  id: "f1a390ff131740a106efc52d8dcc7322cfdeab1d78a336140044128a21f06d14",
  name: "deleteSavedPlace",
  filename: "src/lib/explore.functions.ts"
}, (opts) => deleteSavedPlace.__executeServer(opts));
const deleteSavedPlace = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteSavedPlace_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error
  } = await context.supabase.from("saved_places").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
export {
  deleteSavedPlace_createServerFn_handler,
  deleteTravelDestination_createServerFn_handler,
  listSavedPlaces_createServerFn_handler,
  listTravelDestinations_createServerFn_handler,
  upsertSavedPlace_createServerFn_handler,
  upsertTravelDestination_createServerFn_handler
};
