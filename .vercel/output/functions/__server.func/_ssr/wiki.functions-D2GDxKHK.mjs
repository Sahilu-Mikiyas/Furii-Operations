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
const listInput = objectType({
  workspace_id: stringType().uuid(),
  q: stringType().max(200).optional()
});
const listWikiEntries_createServerFn_handler = createServerRpc({
  id: "5456ac900f902e0759ea2609061cde8c423df74ac927acd446e99fee44fa948a",
  name: "listWikiEntries",
  filename: "src/lib/wiki.functions.ts"
}, (opts) => listWikiEntries.__executeServer(opts));
const listWikiEntries = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => listInput.parse(d)).handler(listWikiEntries_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase
  } = context;
  let query = supabase.from("wiki_entries").select("*").eq("workspace_id", data.workspace_id).order("updated_at", {
    ascending: false
  });
  if (data.q && data.q.trim()) {
    const term = `%${data.q.trim()}%`;
    query = query.or(`title.ilike.${term},body.ilike.${term}`);
  }
  const {
    data: rows,
    error
  } = await query;
  if (error) throw error;
  return {
    entries: rows ?? []
  };
});
const upsertInput = objectType({
  workspace_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  title: stringType().trim().min(1).max(200),
  body: stringType().max(2e4).default(""),
  tags: arrayType(stringType().trim().min(1).max(40)).max(20).default([])
});
const upsertWikiEntry_createServerFn_handler = createServerRpc({
  id: "cf855ab6284822928783eec59a8035675959c2f9ce18bcf4f95266dfe7cc37e3",
  name: "upsertWikiEntry",
  filename: "src/lib/wiki.functions.ts"
}, (opts) => upsertWikiEntry.__executeServer(opts));
const upsertWikiEntry = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertInput.parse(d)).handler(upsertWikiEntry_createServerFn_handler, async ({
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
    } = await supabase.from("wiki_entries").update(rest).eq("id", id).select().single();
    if (error2) throw error2;
    return {
      entry: row2
    };
  }
  const {
    data: row,
    error
  } = await supabase.from("wiki_entries").insert({
    workspace_id,
    author_id: userId,
    ...rest
  }).select().single();
  if (error) throw error;
  return {
    entry: row
  };
});
const deleteWikiEntry_createServerFn_handler = createServerRpc({
  id: "b008167c7a90a5c63d9a1f2cfb7675efc378be723acc812691ad71781a5b08ea",
  name: "deleteWikiEntry",
  filename: "src/lib/wiki.functions.ts"
}, (opts) => deleteWikiEntry.__executeServer(opts));
const deleteWikiEntry = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteWikiEntry_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error
  } = await context.supabase.from("wiki_entries").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
export {
  deleteWikiEntry_createServerFn_handler,
  listWikiEntries_createServerFn_handler,
  upsertWikiEntry_createServerFn_handler
};
