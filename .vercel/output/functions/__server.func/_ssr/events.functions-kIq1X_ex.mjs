import { c as createServerRpc } from "./createServerRpc-DgawnTky.mjs";
import { a as createServerFn } from "./server-DhrmKQ4T.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-ud2LaeJ8.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { g as objectType, i as stringType, z as booleanType, k as enumType } from "../_libs/zod.mjs";
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
const listEvents_createServerFn_handler = createServerRpc({
  id: "c6c3050e76f6a3dfc8d5d2ac54e072621bfa1f2f6d5d769b0049bda3381525f9",
  name: "listEvents",
  filename: "src/lib/events.functions.ts"
}, (opts) => listEvents.__executeServer(opts));
const listEvents = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(listEvents_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: rows,
    error
  } = await context.supabase.from("events").select("*").eq("workspace_id", data.workspace_id).order("event_date", {
    ascending: true
  });
  if (error) throw error;
  return {
    events: rows ?? []
  };
});
const upsertInput = objectType({
  workspace_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  title: stringType().trim().min(1).max(200),
  event_date: stringType().min(8),
  event_time: stringType().optional().nullable(),
  recurrence: enumType(["none", "weekly", "monthly", "yearly"]).default("none"),
  category: stringType().max(40).optional().nullable(),
  location: stringType().max(200).optional().nullable(),
  notes: stringType().max(4e3).optional().nullable(),
  is_milestone: booleanType().default(false)
});
const upsertEvent_createServerFn_handler = createServerRpc({
  id: "f783d064126a6698039e7eec74f0fcc451e4bfd0e3115f6a3e31192fd1c505a6",
  name: "upsertEvent",
  filename: "src/lib/events.functions.ts"
}, (opts) => upsertEvent.__executeServer(opts));
const upsertEvent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertInput.parse(d)).handler(upsertEvent_createServerFn_handler, async ({
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
    } = await supabase.from("events").update(rest).eq("id", id).select().single();
    if (error2) throw error2;
    return {
      event: row2
    };
  }
  const {
    data: row,
    error
  } = await supabase.from("events").insert({
    workspace_id,
    author_id: userId,
    ...rest
  }).select().single();
  if (error) throw error;
  return {
    event: row
  };
});
const deleteEvent_createServerFn_handler = createServerRpc({
  id: "283032f1601f931ed9ccc7df9ec903a2b23ecdea2a8d5ff032cf36f717d315da",
  name: "deleteEvent",
  filename: "src/lib/events.functions.ts"
}, (opts) => deleteEvent.__executeServer(opts));
const deleteEvent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteEvent_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error
  } = await context.supabase.from("events").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
export {
  deleteEvent_createServerFn_handler,
  listEvents_createServerFn_handler,
  upsertEvent_createServerFn_handler
};
