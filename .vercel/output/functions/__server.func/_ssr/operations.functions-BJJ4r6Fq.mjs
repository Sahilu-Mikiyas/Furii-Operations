import { c as createSsrRpc } from "./createSsrRpc-BN6DI1sa.mjs";
import { a as createServerFn } from "./server-DhrmKQ4T.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-ud2LaeJ8.mjs";
import { g as objectType, i as stringType, k as enumType, h as numberType } from "../_libs/zod.mjs";
const wsId = objectType({
  workspace_id: stringType().uuid()
});
const listSharedTasks = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(createSsrRpc("8e98edd1d121a890474245ce940482f16777f64bca742b344881712ed960a643"));
const upsertTaskInput = objectType({
  workspace_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  title: stringType().trim().min(1).max(300),
  description: stringType().max(2e3).optional().nullable(),
  assignee: enumType(["self", "partner", "joint"]).default("joint"),
  status: enumType(["todo", "in_progress", "done"]).default("todo"),
  category: stringType().max(100).optional().nullable(),
  due_date: stringType().optional().nullable(),
  completed_at: stringType().optional().nullable()
});
const upsertSharedTask = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertTaskInput.parse(d)).handler(createSsrRpc("4d963b02cf0365fae3d1ba19466d9742c2daa5fed10583e8049b84b1740038f7"));
const deleteSharedTask = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("6cbdd03c9285dbc25185a03a66231ccf53f68a2451733696ffe41c4916e0facc"));
const listNestingFunds = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(createSsrRpc("fb36fd93b36267ba03d6543e851ee348f521312ad535e3b1182a27b10a6e6160"));
const upsertFundInput = objectType({
  workspace_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  title: stringType().trim().min(1).max(200),
  description: stringType().max(2e3).optional().nullable(),
  emoji: stringType().max(8).default("🏠"),
  target_amount: numberType().min(0),
  current_amount: numberType().min(0).default(0),
  deadline: stringType().optional().nullable()
});
const upsertNestingFund = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertFundInput.parse(d)).handler(createSsrRpc("49879bbe88996a27eec8318f76a8dbfe2eb15149d8aacc51680d1fb267792bd1"));
const deleteNestingFund = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("e4612e421024782fdadc68f0355c3efd3ad17b03b0d2a64b9693af8b013d7789"));
const listFundTransactions = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  fund_id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("8eef080409b04115cdbe4432deed573e6d1a4b60b084c6baf9e03c94a776c341"));
const addFundTransaction = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  fund_id: stringType().uuid(),
  amount: numberType(),
  note: stringType().max(500).optional().nullable()
}).parse(d)).handler(createSsrRpc("43e62b884972cad955c50fdfff081cdf4a14c3b0cf6df5f0f1a18af2b8d9539a"));
const deleteFundTransaction = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  fund_id: stringType().uuid(),
  amount: numberType()
}).parse(d)).handler(createSsrRpc("75adc4cd75dbebeae40bdd697a651e4d4a07e2ed173a1f8ceaf071de72d33106"));
const listGoals = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(createSsrRpc("fb2872d6723dca9ce9e7868fb2384302816e9a3d6dc2302f05f8709dab972638"));
const upsertGoal = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  workspace_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  title: stringType().trim().min(1).max(300),
  status: enumType(["active", "completed", "paused"]).default("active")
}).parse(d)).handler(createSsrRpc("d1f92b8920c27f9404c0f5efce3fe8564bc927f7b8177cc182016f74c2745b06"));
const deleteGoal = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("7c88999a54b5cdde7a7f9741fbe31685a864d4b5b5be1d9cb32d0b1b17bc7f1d"));
const listBucketListItems = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(createSsrRpc("49fc1935b886660569285e59ae74f98ee08a2e8b33bd1cb08cecfc8a8a4d9318"));
const upsertBucketListItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  workspace_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  title: stringType().trim().min(1).max(300),
  status: enumType(["active", "completed"]).default("active")
}).parse(d)).handler(createSsrRpc("b3279d5e2e367c03300a20bc3c831db59f349f07d947e7f41177ada6fdc878bc"));
const deleteBucketListItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("7e7ce427217e36354643a631380fe1ec96f025b9b10a03087b93aad08f2deeb6"));
export {
  upsertGoal as a,
  deleteGoal as b,
  listGoals as c,
  deleteSharedTask as d,
  deleteNestingFund as e,
  upsertNestingFund as f,
  listFundTransactions as g,
  addFundTransaction as h,
  deleteFundTransaction as i,
  listNestingFunds as j,
  upsertBucketListItem as k,
  listSharedTasks as l,
  deleteBucketListItem as m,
  listBucketListItems as n,
  upsertSharedTask as u
};
