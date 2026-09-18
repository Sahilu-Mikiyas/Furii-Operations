import { c as createServerRpc } from "./createServerRpc-DgawnTky.mjs";
import { a as createServerFn } from "./server-DhrmKQ4T.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-ud2LaeJ8.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { g as objectType, h as numberType, i as stringType } from "../_libs/zod.mjs";
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
const signInput = objectType({
  path: stringType().min(1).max(500),
  expires_in: numberType().int().min(30).max(60 * 60 * 24).optional()
});
const signAttachmentUrl_createServerFn_handler = createServerRpc({
  id: "da53c5d0f4076d0c477e947395ca7f5455a61a2d12e929a5f86b77f597cab859",
  name: "signAttachmentUrl",
  filename: "src/lib/storage.functions.ts"
}, (opts) => signAttachmentUrl.__executeServer(opts));
const signAttachmentUrl = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => signInput.parse(d)).handler(signAttachmentUrl_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase
  } = context;
  const {
    data: signed,
    error
  } = await supabase.storage.from("attachments").createSignedUrl(data.path, data.expires_in ?? 60 * 60);
  if (error) throw error;
  return {
    url: signed.signedUrl
  };
});
const uploadInput = objectType({
  workspace_id: stringType().uuid(),
  folder: stringType().regex(/^[a-z0-9_-]+$/).max(40),
  filename: stringType().min(1).max(200),
  content_type: stringType().min(1).max(120),
  base64: stringType().min(1)
});
const uploadAttachment_createServerFn_handler = createServerRpc({
  id: "bad377eec226e58ad299461234def913d12c3f93800d518bcfbb5bc1c257c015",
  name: "uploadAttachment",
  filename: "src/lib/storage.functions.ts"
}, (opts) => uploadAttachment.__executeServer(opts));
const uploadAttachment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => uploadInput.parse(d)).handler(uploadAttachment_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase
  } = context;
  const safe = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${data.workspace_id}/${data.folder}/${Date.now()}-${safe}`;
  const bytes = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));
  const {
    error
  } = await supabase.storage.from("attachments").upload(path, bytes, {
    contentType: data.content_type,
    upsert: false
  });
  if (error) throw error;
  return {
    path
  };
});
export {
  signAttachmentUrl_createServerFn_handler,
  uploadAttachment_createServerFn_handler
};
