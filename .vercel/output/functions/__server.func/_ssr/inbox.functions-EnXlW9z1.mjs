import { c as createSsrRpc } from "./createSsrRpc-BN6DI1sa.mjs";
import { a as createServerFn } from "./server-DhrmKQ4T.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-ud2LaeJ8.mjs";
import { g as objectType, i as stringType, k as enumType } from "../_libs/zod.mjs";
const listInput = objectType({
  workspace_id: stringType().uuid(),
  status: enumType(["new", "routed", "archived"]).optional()
});
const listInboxItems = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => listInput.parse(d)).handler(createSsrRpc("147a1ee52b196681b7c8fb3e57e51cc198b1c749b3138580ca1c8b38188f05d7"));
const createInput = objectType({
  workspace_id: stringType().uuid(),
  content: stringType().max(8e3).default(""),
  source_type: enumType(["text", "voice", "photo", "video", "link", "screenshot"]).default("text"),
  attachment_path: stringType().max(500).optional().nullable(),
  attachment_mime: stringType().max(120).optional().nullable(),
  link_url: stringType().max(2e3).optional().nullable()
});
const createInboxItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => createInput.parse(d)).handler(createSsrRpc("24d70d6f7b3b8da51ea00b3ad78b8e7f5ea651f4a9e252837ed1ff20b9015b8f"));
const updateInput = objectType({
  id: stringType().uuid(),
  category: stringType().max(40).optional().nullable(),
  status: enumType(["new", "routed", "archived"]).optional(),
  routed_to: stringType().max(60).optional().nullable(),
  content: stringType().max(8e3).optional()
});
const updateInboxItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => updateInput.parse(d)).handler(createSsrRpc("bde5300afd3ed3ba978089853172342a18b56c8e503213868a2c02e8e26f049e"));
const deleteInboxItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("53a309a01c71fbb2d18298f865c7bcd7c95d048bb352802ec27677df71a611e6"));
const categorizeInput = objectType({
  id: stringType().uuid()
});
const categorizeInboxItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => categorizeInput.parse(d)).handler(createSsrRpc("1b0f51b1c58e56f5ebaa2cbb7ead153e71796c4a2735d8e9ccf8f7890fc8e1c1"));
export {
  categorizeInboxItem as a,
  createInboxItem as c,
  deleteInboxItem as d,
  listInboxItems as l,
  updateInboxItem as u
};
