import { c as createSsrRpc } from "./createSsrRpc-BN6DI1sa.mjs";
import { a as createServerFn } from "./server-DhrmKQ4T.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-ud2LaeJ8.mjs";
import { g as objectType, i as stringType, z as booleanType, h as numberType, k as enumType } from "../_libs/zod.mjs";
const wsId = objectType({
  workspace_id: stringType().uuid()
});
const listMoodLogs = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  workspace_id: stringType().uuid(),
  days: numberType().int().min(1).max(90).default(30)
}).parse(d)).handler(createSsrRpc("b750c9d9161e68f44ea4c99fffffbe7293622276aa6008abbd3e250b232cd461"));
const upsertMoodInput = objectType({
  workspace_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  mood_score: numberType().int().min(1).max(10),
  energy_score: numberType().int().min(1).max(10),
  relationship_note: stringType().max(2e3).optional().nullable(),
  logged_date: stringType().min(8)
});
const upsertMoodLog = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertMoodInput.parse(d)).handler(createSsrRpc("737a9aa35cdcd9a6fa260ed4c6198f5dfb55978c74909d947d558113108af456"));
const deleteMoodLog = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("efb7c1f3549836d824c8279da5839a20842fdac89b6fa92792f4394619144437"));
const listLoveLanguageActions = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(createSsrRpc("1659d5f128ed146d9927fcb77d7b9ab7ef3c4145c1fc6a54ac4106c4f346c561"));
const upsertLoveLanguageInput = objectType({
  workspace_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  language_type: enumType(["words_of_affirmation", "quality_time", "acts_of_service", "physical_touch", "receiving_gifts"]),
  action: stringType().trim().min(1).max(500),
  notes: stringType().max(2e3).optional().nullable(),
  completed_at: stringType().optional().nullable()
});
const upsertLoveLanguageAction = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertLoveLanguageInput.parse(d)).handler(createSsrRpc("3fa1ee0e4e3875a68fd74e196da726c5b91204c7590a3dcf69164c01ca5c6bd6"));
const deleteLoveLanguageAction = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("e39ea7dca05d88bca693c5ac0179f25113fea578ddbb971a27a9e91638c0cbf3"));
const listConflictReflections = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(createSsrRpc("b9ed24e97411a964e434056a70045551c41edc662186e7955592cd850790cc76"));
const upsertConflictInput = objectType({
  workspace_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  title: stringType().trim().min(1).max(200),
  trigger_description: stringType().trim().min(1).max(4e3),
  my_feelings: stringType().max(4e3).optional().nullable(),
  their_perspective: stringType().max(4e3).optional().nullable(),
  what_i_could_do_differently: stringType().max(4e3).optional().nullable(),
  resolution: stringType().max(4e3).optional().nullable(),
  growth_note: stringType().max(4e3).optional().nullable(),
  intensity: numberType().int().min(1).max(5).optional().nullable(),
  is_resolved: booleanType().default(false),
  reflection_date: stringType().min(8)
});
const upsertConflictReflection = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertConflictInput.parse(d)).handler(createSsrRpc("234282e543eebca646ff7df0a71c262cd467359f9bc25bb5c094112bae088de5"));
const deleteConflictReflection = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("d3ca5a89ea736483b6badb11dc0f060db54503e8488f3489f0c717af2a41be26"));
export {
  deleteMoodLog as a,
  upsertMoodLog as b,
  listMoodLogs as c,
  deleteConflictReflection as d,
  upsertLoveLanguageAction as e,
  deleteLoveLanguageAction as f,
  listLoveLanguageActions as g,
  listConflictReflections as l,
  upsertConflictReflection as u
};
