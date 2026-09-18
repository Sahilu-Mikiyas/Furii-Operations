import { c as createSsrRpc } from "./createSsrRpc-BN6DI1sa.mjs";
import { a as createServerFn } from "./server-DhrmKQ4T.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-ud2LaeJ8.mjs";
import { g as objectType, i as stringType, k as enumType, h as numberType, z as booleanType } from "../_libs/zod.mjs";
const wsId = objectType({
  workspace_id: stringType().uuid()
});
const listDatePlans = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(createSsrRpc("395b436757b9e80ce1ccbcb0eaba38f603a96a6bbf28fb9dd44ab0f9c59b7d16"));
const upsertDatePlanInput = objectType({
  workspace_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  title: stringType().trim().min(1).max(200),
  description: stringType().max(4e3).optional().nullable(),
  date_planned: stringType().optional().nullable(),
  status: enumType(["idea", "scheduled", "completed"]).default("idea"),
  place_id: stringType().uuid().optional().nullable(),
  location_name: stringType().max(200).optional().nullable(),
  location_address: stringType().max(500).optional().nullable(),
  latitude: numberType().optional().nullable(),
  longitude: numberType().optional().nullable()
});
const upsertDatePlan = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertDatePlanInput.parse(d)).handler(createSsrRpc("a52030ee0ef196663c640d377c4e9b9e20bca465336cf16c010dcfcd342baa45"));
const deleteDatePlan = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("c40b483f2cc98430a9997284ac9d99b22729797e9921234018a15434d68f4e2b"));
const listDateStages = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  date_plan_id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("571f8ff9ed9ff1f94e323c8296bd9a85de836083b233d9f013e64f6bd536b5b4"));
const upsertStageInput = objectType({
  date_plan_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  title: stringType().trim().min(1).max(200),
  description: stringType().max(1e3).optional().nullable(),
  time_offset: stringType().optional().nullable(),
  is_completed: booleanType().default(false)
});
const upsertDateStage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertStageInput.parse(d)).handler(createSsrRpc("88d03f05d605c42b95ad8da05689f379d964b48070889f9a05c638869c806c1e"));
const deleteDateStage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("29316fb1f1980807a5a00d039bc92b4bbdb51e6e71ad1769959be95172d6bb70"));
const listSurprisePlans = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(createSsrRpc("f4acdbc0a3fc8caa703631adb1bcae6356ceecc4cbc9dec245b183d9d07dd43b"));
const upsertSurpriseInput = objectType({
  workspace_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  title: stringType().trim().min(1).max(200),
  target_date: stringType().min(8),
  status: enumType(["planning", "ready", "revealed"]).default("planning"),
  details: stringType().max(8e3)
});
const upsertSurprisePlan = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertSurpriseInput.parse(d)).handler(createSsrRpc("c1d6d446bb7c3ad5120f409a6f65febf5205b4fe1ad08d8ab63a387ce668069f"));
const deleteSurprisePlan = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("501f21d9e66990740b1ffca674804c50ed35f213d354e745a850dddfcaf80cfc"));
const listSurpriseClues = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  surprise_plan_id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("f0051a1591a392c066fffa243cdeb61af55f3cf24b0cb21644cb021463b5a576"));
const upsertClueInput = objectType({
  surprise_plan_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  clue_text: stringType().trim().min(1).max(1e3),
  revealed_at: stringType().optional().nullable()
});
const upsertSurpriseClue = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertClueInput.parse(d)).handler(createSsrRpc("a1c93c55cf43cb46f395aac9dc90f49922f6055ed272d917d11052c82f4af3c9"));
const deleteSurpriseClue = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("f973fa79023f9c83adf3858dfec4bf15efa013617abb531220d8ec2e0ab87554"));
export {
  upsertSurpriseClue as a,
  deleteSurpriseClue as b,
  listSurprisePlans as c,
  deleteSurprisePlan as d,
  deleteDatePlan as e,
  upsertDatePlan as f,
  upsertDateStage as g,
  listDateStages as h,
  deleteDateStage as i,
  listDatePlans as j,
  listSurpriseClues as l,
  upsertSurprisePlan as u
};
