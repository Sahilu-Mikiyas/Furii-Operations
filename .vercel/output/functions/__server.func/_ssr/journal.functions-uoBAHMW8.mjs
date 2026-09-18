import { c as createServerRpc } from "./createServerRpc-DgawnTky.mjs";
import { a as createServerFn } from "./server-DhrmKQ4T.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-ud2LaeJ8.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { g as objectType, i as stringType, h as numberType } from "../_libs/zod.mjs";
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
const listJournalEntries_createServerFn_handler = createServerRpc({
  id: "1220159d9473f8e220ed69bba67d68094a647d425a19fced73f3ba525f5da1ca",
  name: "listJournalEntries",
  filename: "src/lib/journal.functions.ts"
}, (opts) => listJournalEntries.__executeServer(opts));
const listJournalEntries = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(listJournalEntries_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: rows,
    error
  } = await context.supabase.from("journal_entries").select("*").eq("workspace_id", data.workspace_id).order("created_at", {
    ascending: false
  });
  if (error) throw error;
  return {
    entries: rows ?? []
  };
});
const upsertInput = objectType({
  workspace_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  title: stringType().max(200).optional().nullable(),
  body: stringType().min(1).max(2e4),
  mood: numberType().int().min(1).max(10).optional().nullable()
});
const upsertJournalEntry_createServerFn_handler = createServerRpc({
  id: "617c8fc244916e45aaa43edefb28130c3e3d17f361906778e14b6631ea0a8ee6",
  name: "upsertJournalEntry",
  filename: "src/lib/journal.functions.ts"
}, (opts) => upsertJournalEntry.__executeServer(opts));
const upsertJournalEntry = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertInput.parse(d)).handler(upsertJournalEntry_createServerFn_handler, async ({
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
    } = await supabase.from("journal_entries").update(rest).eq("id", id).select().single();
    if (error2) throw error2;
    return {
      entry: row2
    };
  }
  const {
    data: row,
    error
  } = await supabase.from("journal_entries").insert({
    workspace_id,
    author_id: userId,
    ...rest
  }).select().single();
  if (error) throw error;
  return {
    entry: row
  };
});
const deleteJournalEntry_createServerFn_handler = createServerRpc({
  id: "326e696999dd8ac1c6689a76f1756e5a81f8e6cdf8e6e4a5df0ffbca81449f45",
  name: "deleteJournalEntry",
  filename: "src/lib/journal.functions.ts"
}, (opts) => deleteJournalEntry.__executeServer(opts));
const deleteJournalEntry = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteJournalEntry_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error
  } = await context.supabase.from("journal_entries").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
export {
  deleteJournalEntry_createServerFn_handler,
  listJournalEntries_createServerFn_handler,
  upsertJournalEntry_createServerFn_handler
};
