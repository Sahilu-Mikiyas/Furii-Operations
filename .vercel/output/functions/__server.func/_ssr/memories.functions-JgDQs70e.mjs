import { c as createServerRpc } from "./createServerRpc-DgawnTky.mjs";
import { a as createServerFn } from "./server-DhrmKQ4T.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-ud2LaeJ8.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { g as objectType, i as stringType, j as arrayType } from "../_libs/zod.mjs";
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
const listMemories_createServerFn_handler = createServerRpc({
  id: "197229992b1d8913b954f57ed2a7b0644e2ebce378c2378a441ce71bac35e984",
  name: "listMemories",
  filename: "src/lib/memories.functions.ts"
}, (opts) => listMemories.__executeServer(opts));
const listMemories = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(listMemories_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: rows,
    error
  } = await context.supabase.from("memories").select("*").eq("workspace_id", data.workspace_id).order("occurred_on", {
    ascending: false,
    nullsFirst: false
  });
  if (error) throw error;
  return {
    memories: rows ?? []
  };
});
const upsertInput = objectType({
  workspace_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  title: stringType().trim().min(1).max(200),
  description: stringType().max(8e3).optional().nullable(),
  occurred_on: stringType().min(8).optional().nullable(),
  location: stringType().max(200).optional().nullable(),
  mood: stringType().max(40).optional().nullable(),
  photo_path: stringType().max(500).optional().nullable(),
  tags: arrayType(stringType().max(40)).default([])
});
const upsertMemory_createServerFn_handler = createServerRpc({
  id: "780de2c0de45f903da36fd8a03465139827045e61666dd9b4e89a39122dfc668",
  name: "upsertMemory",
  filename: "src/lib/memories.functions.ts"
}, (opts) => upsertMemory.__executeServer(opts));
const upsertMemory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertInput.parse(d)).handler(upsertMemory_createServerFn_handler, async ({
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
    } = await supabase.from("memories").update(rest).eq("id", id).select().single();
    if (error2) throw error2;
    return {
      memory: row2
    };
  }
  const {
    data: row,
    error
  } = await supabase.from("memories").insert({
    workspace_id,
    author_id: userId,
    ...rest
  }).select().single();
  if (error) throw error;
  return {
    memory: row
  };
});
const deleteMemory_createServerFn_handler = createServerRpc({
  id: "947ef2f82893334576216982aabbbfa2d4534dd954410f88c2d90d6eb19fc528",
  name: "deleteMemory",
  filename: "src/lib/memories.functions.ts"
}, (opts) => deleteMemory.__executeServer(opts));
const deleteMemory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteMemory_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error
  } = await context.supabase.from("memories").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
export {
  deleteMemory_createServerFn_handler,
  listMemories_createServerFn_handler,
  upsertMemory_createServerFn_handler
};
