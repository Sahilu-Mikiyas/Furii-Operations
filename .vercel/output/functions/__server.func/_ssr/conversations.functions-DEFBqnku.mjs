import { c as createServerRpc } from "./createServerRpc-DgawnTky.mjs";
import { a as createServerFn } from "./server-DhrmKQ4T.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-ud2LaeJ8.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { g as objectType, i as stringType } from "../_libs/zod.mjs";
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
const listPrompts_createServerFn_handler = createServerRpc({
  id: "41bc8fcfa646b761d75127d0f62d66006e1397a112e397549ef8fb60a3a561ad",
  name: "listPrompts",
  filename: "src/lib/conversations.functions.ts"
}, (opts) => listPrompts.__executeServer(opts));
const listPrompts = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(listPrompts_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: rows,
    error
  } = await context.supabase.from("conversation_prompts").select("*").eq("workspace_id", data.workspace_id).order("created_at", {
    ascending: false
  });
  if (error) throw error;
  return {
    prompts: rows ?? []
  };
});
const upsertInput = objectType({
  workspace_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  prompt: stringType().trim().min(1).max(500),
  category: stringType().max(40).optional().nullable(),
  answer: stringType().max(8e3).optional().nullable()
});
const upsertPrompt_createServerFn_handler = createServerRpc({
  id: "3b905c9829012f506bee644ba1803979a4a520d9908db9104ba5e600042e4429",
  name: "upsertPrompt",
  filename: "src/lib/conversations.functions.ts"
}, (opts) => upsertPrompt.__executeServer(opts));
const upsertPrompt = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertInput.parse(d)).handler(upsertPrompt_createServerFn_handler, async ({
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
  const payload = {
    ...rest
  };
  if (rest.answer && rest.answer.length > 0) payload.answered_at = (/* @__PURE__ */ new Date()).toISOString();
  if (id) {
    const {
      data: row2,
      error: error2
    } = await supabase.from("conversation_prompts").update(payload).eq("id", id).select().single();
    if (error2) throw error2;
    return {
      prompt: row2
    };
  }
  const {
    data: row,
    error
  } = await supabase.from("conversation_prompts").insert({
    workspace_id,
    author_id: userId,
    ...payload
  }).select().single();
  if (error) throw error;
  return {
    prompt: row
  };
});
const deletePrompt_createServerFn_handler = createServerRpc({
  id: "63216b6302c65b7480676189da62e7c3ffece7ed8847e72d4062e66cbb507f96",
  name: "deletePrompt",
  filename: "src/lib/conversations.functions.ts"
}, (opts) => deletePrompt.__executeServer(opts));
const deletePrompt = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deletePrompt_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error
  } = await context.supabase.from("conversation_prompts").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
export {
  deletePrompt_createServerFn_handler,
  listPrompts_createServerFn_handler,
  upsertPrompt_createServerFn_handler
};
