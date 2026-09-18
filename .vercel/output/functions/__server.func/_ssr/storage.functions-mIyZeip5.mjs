import { c as createSsrRpc } from "./createSsrRpc-BN6DI1sa.mjs";
import { a as createServerFn } from "./server-DhrmKQ4T.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-ud2LaeJ8.mjs";
import { g as objectType, h as numberType, i as stringType } from "../_libs/zod.mjs";
const signInput = objectType({
  path: stringType().min(1).max(500),
  expires_in: numberType().int().min(30).max(60 * 60 * 24).optional()
});
const signAttachmentUrl = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => signInput.parse(d)).handler(createSsrRpc("da53c5d0f4076d0c477e947395ca7f5455a61a2d12e929a5f86b77f597cab859"));
const uploadInput = objectType({
  workspace_id: stringType().uuid(),
  folder: stringType().regex(/^[a-z0-9_-]+$/).max(40),
  filename: stringType().min(1).max(200),
  content_type: stringType().min(1).max(120),
  base64: stringType().min(1)
});
const uploadAttachment = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => uploadInput.parse(d)).handler(createSsrRpc("bad377eec226e58ad299461234def913d12c3f93800d518bcfbb5bc1c257c015"));
export {
  signAttachmentUrl as s,
  uploadAttachment as u
};
