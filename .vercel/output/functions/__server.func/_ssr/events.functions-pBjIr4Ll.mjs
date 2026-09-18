import { c as createSsrRpc } from "./createSsrRpc-BN6DI1sa.mjs";
import { a as createServerFn } from "./server-DhrmKQ4T.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-ud2LaeJ8.mjs";
import { g as objectType, i as stringType, z as booleanType, k as enumType } from "../_libs/zod.mjs";
const wsId = objectType({
  workspace_id: stringType().uuid()
});
const listEvents = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(createSsrRpc("c6c3050e76f6a3dfc8d5d2ac54e072621bfa1f2f6d5d769b0049bda3381525f9"));
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
const upsertEvent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertInput.parse(d)).handler(createSsrRpc("f783d064126a6698039e7eec74f0fcc451e4bfd0e3115f6a3e31192fd1c505a6"));
const deleteEvent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("283032f1601f931ed9ccc7df9ec903a2b23ecdea2a8d5ff032cf36f717d315da"));
export {
  deleteEvent as d,
  listEvents as l,
  upsertEvent as u
};
