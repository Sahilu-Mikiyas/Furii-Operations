import { c as createServerRpc } from "./createServerRpc-DgawnTky.mjs";
import { a as createServerFn } from "./server-DhrmKQ4T.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-ud2LaeJ8.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { g as objectType, i as stringType, k as enumType, h as numberType } from "../_libs/zod.mjs";
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
const listSharedTasks_createServerFn_handler = createServerRpc({
  id: "8e98edd1d121a890474245ce940482f16777f64bca742b344881712ed960a643",
  name: "listSharedTasks",
  filename: "src/lib/operations.functions.ts"
}, (opts) => listSharedTasks.__executeServer(opts));
const listSharedTasks = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(listSharedTasks_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: rows,
    error
  } = await context.supabase.from("shared_tasks").select("*").eq("workspace_id", data.workspace_id).order("created_at", {
    ascending: false
  });
  if (error) throw error;
  return {
    tasks: rows ?? []
  };
});
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
const upsertSharedTask_createServerFn_handler = createServerRpc({
  id: "4d963b02cf0365fae3d1ba19466d9742c2daa5fed10583e8049b84b1740038f7",
  name: "upsertSharedTask",
  filename: "src/lib/operations.functions.ts"
}, (opts) => upsertSharedTask.__executeServer(opts));
const upsertSharedTask = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertTaskInput.parse(d)).handler(upsertSharedTask_createServerFn_handler, async ({
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
    } = await supabase.from("shared_tasks").update(rest).eq("id", id).select().single();
    if (error2) throw error2;
    return {
      task: row2
    };
  }
  const {
    data: row,
    error
  } = await supabase.from("shared_tasks").insert({
    workspace_id,
    author_id: userId,
    ...rest
  }).select().single();
  if (error) throw error;
  return {
    task: row
  };
});
const deleteSharedTask_createServerFn_handler = createServerRpc({
  id: "6cbdd03c9285dbc25185a03a66231ccf53f68a2451733696ffe41c4916e0facc",
  name: "deleteSharedTask",
  filename: "src/lib/operations.functions.ts"
}, (opts) => deleteSharedTask.__executeServer(opts));
const deleteSharedTask = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteSharedTask_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error
  } = await context.supabase.from("shared_tasks").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
const listNestingFunds_createServerFn_handler = createServerRpc({
  id: "fb36fd93b36267ba03d6543e851ee348f521312ad535e3b1182a27b10a6e6160",
  name: "listNestingFunds",
  filename: "src/lib/operations.functions.ts"
}, (opts) => listNestingFunds.__executeServer(opts));
const listNestingFunds = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(listNestingFunds_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: rows,
    error
  } = await context.supabase.from("nesting_funds").select("*").eq("workspace_id", data.workspace_id).order("created_at", {
    ascending: false
  });
  if (error) throw error;
  return {
    funds: rows ?? []
  };
});
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
const upsertNestingFund_createServerFn_handler = createServerRpc({
  id: "49879bbe88996a27eec8318f76a8dbfe2eb15149d8aacc51680d1fb267792bd1",
  name: "upsertNestingFund",
  filename: "src/lib/operations.functions.ts"
}, (opts) => upsertNestingFund.__executeServer(opts));
const upsertNestingFund = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertFundInput.parse(d)).handler(upsertNestingFund_createServerFn_handler, async ({
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
    } = await supabase.from("nesting_funds").update(rest).eq("id", id).select().single();
    if (error2) throw error2;
    return {
      fund: row2
    };
  }
  const {
    data: row,
    error
  } = await supabase.from("nesting_funds").insert({
    workspace_id,
    author_id: userId,
    ...rest
  }).select().single();
  if (error) throw error;
  return {
    fund: row
  };
});
const deleteNestingFund_createServerFn_handler = createServerRpc({
  id: "e4612e421024782fdadc68f0355c3efd3ad17b03b0d2a64b9693af8b013d7789",
  name: "deleteNestingFund",
  filename: "src/lib/operations.functions.ts"
}, (opts) => deleteNestingFund.__executeServer(opts));
const deleteNestingFund = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteNestingFund_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error
  } = await context.supabase.from("nesting_funds").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
const listFundTransactions_createServerFn_handler = createServerRpc({
  id: "8eef080409b04115cdbe4432deed573e6d1a4b60b084c6baf9e03c94a776c341",
  name: "listFundTransactions",
  filename: "src/lib/operations.functions.ts"
}, (opts) => listFundTransactions.__executeServer(opts));
const listFundTransactions = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  fund_id: stringType().uuid()
}).parse(d)).handler(listFundTransactions_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: rows,
    error
  } = await context.supabase.from("fund_transactions").select("*").eq("fund_id", data.fund_id).order("transacted_at", {
    ascending: false
  });
  if (error) throw error;
  return {
    transactions: rows ?? []
  };
});
const addFundTransaction_createServerFn_handler = createServerRpc({
  id: "43e62b884972cad955c50fdfff081cdf4a14c3b0cf6df5f0f1a18af2b8d9539a",
  name: "addFundTransaction",
  filename: "src/lib/operations.functions.ts"
}, (opts) => addFundTransaction.__executeServer(opts));
const addFundTransaction = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  fund_id: stringType().uuid(),
  amount: numberType(),
  note: stringType().max(500).optional().nullable()
}).parse(d)).handler(addFundTransaction_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: row,
    error
  } = await supabase.from("fund_transactions").insert({
    ...data,
    contributed_by: userId
  }).select().single();
  if (error) throw error;
  const {
    data: fund
  } = await supabase.from("nesting_funds").select("current_amount").eq("id", data.fund_id).single();
  if (fund) {
    await supabase.from("nesting_funds").update({
      current_amount: parseFloat(String(fund.current_amount)) + data.amount
    }).eq("id", data.fund_id);
  }
  return {
    transaction: row
  };
});
const deleteFundTransaction_createServerFn_handler = createServerRpc({
  id: "75adc4cd75dbebeae40bdd697a651e4d4a07e2ed173a1f8ceaf071de72d33106",
  name: "deleteFundTransaction",
  filename: "src/lib/operations.functions.ts"
}, (opts) => deleteFundTransaction.__executeServer(opts));
const deleteFundTransaction = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  fund_id: stringType().uuid(),
  amount: numberType()
}).parse(d)).handler(deleteFundTransaction_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase
  } = context;
  const {
    error
  } = await supabase.from("fund_transactions").delete().eq("id", data.id);
  if (error) throw error;
  const {
    data: fund
  } = await supabase.from("nesting_funds").select("current_amount").eq("id", data.fund_id).single();
  if (fund) {
    await supabase.from("nesting_funds").update({
      current_amount: Math.max(0, parseFloat(String(fund.current_amount)) - data.amount)
    }).eq("id", data.fund_id);
  }
  return {
    ok: true
  };
});
const listGoals_createServerFn_handler = createServerRpc({
  id: "fb2872d6723dca9ce9e7868fb2384302816e9a3d6dc2302f05f8709dab972638",
  name: "listGoals",
  filename: "src/lib/operations.functions.ts"
}, (opts) => listGoals.__executeServer(opts));
const listGoals = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(listGoals_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: rows,
    error
  } = await context.supabase.from("goals").select("*").eq("workspace_id", data.workspace_id).order("created_at", {
    ascending: false
  });
  if (error) throw error;
  return {
    goals: rows ?? []
  };
});
const upsertGoal_createServerFn_handler = createServerRpc({
  id: "d1f92b8920c27f9404c0f5efce3fe8564bc927f7b8177cc182016f74c2745b06",
  name: "upsertGoal",
  filename: "src/lib/operations.functions.ts"
}, (opts) => upsertGoal.__executeServer(opts));
const upsertGoal = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  workspace_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  title: stringType().trim().min(1).max(300),
  status: enumType(["active", "completed", "paused"]).default("active")
}).parse(d)).handler(upsertGoal_createServerFn_handler, async ({
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
    } = await supabase.from("goals").update(rest).eq("id", id).select().single();
    if (error2) throw error2;
    return {
      goal: row2
    };
  }
  const {
    data: row,
    error
  } = await supabase.from("goals").insert({
    workspace_id,
    author_id: userId,
    ...rest
  }).select().single();
  if (error) throw error;
  return {
    goal: row
  };
});
const deleteGoal_createServerFn_handler = createServerRpc({
  id: "7c88999a54b5cdde7a7f9741fbe31685a864d4b5b5be1d9cb32d0b1b17bc7f1d",
  name: "deleteGoal",
  filename: "src/lib/operations.functions.ts"
}, (opts) => deleteGoal.__executeServer(opts));
const deleteGoal = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteGoal_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error
  } = await context.supabase.from("goals").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
const listBucketListItems_createServerFn_handler = createServerRpc({
  id: "49fc1935b886660569285e59ae74f98ee08a2e8b33bd1cb08cecfc8a8a4d9318",
  name: "listBucketListItems",
  filename: "src/lib/operations.functions.ts"
}, (opts) => listBucketListItems.__executeServer(opts));
const listBucketListItems = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(listBucketListItems_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: rows,
    error
  } = await context.supabase.from("bucket_list_items").select("*").eq("workspace_id", data.workspace_id).order("created_at", {
    ascending: false
  });
  if (error) throw error;
  return {
    items: rows ?? []
  };
});
const upsertBucketListItem_createServerFn_handler = createServerRpc({
  id: "b3279d5e2e367c03300a20bc3c831db59f349f07d947e7f41177ada6fdc878bc",
  name: "upsertBucketListItem",
  filename: "src/lib/operations.functions.ts"
}, (opts) => upsertBucketListItem.__executeServer(opts));
const upsertBucketListItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  workspace_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  title: stringType().trim().min(1).max(300),
  status: enumType(["active", "completed"]).default("active")
}).parse(d)).handler(upsertBucketListItem_createServerFn_handler, async ({
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
    } = await supabase.from("bucket_list_items").update(rest).eq("id", id).select().single();
    if (error2) throw error2;
    return {
      item: row2
    };
  }
  const {
    data: row,
    error
  } = await supabase.from("bucket_list_items").insert({
    workspace_id,
    author_id: userId,
    ...rest
  }).select().single();
  if (error) throw error;
  return {
    item: row
  };
});
const deleteBucketListItem_createServerFn_handler = createServerRpc({
  id: "7e7ce427217e36354643a631380fe1ec96f025b9b10a03087b93aad08f2deeb6",
  name: "deleteBucketListItem",
  filename: "src/lib/operations.functions.ts"
}, (opts) => deleteBucketListItem.__executeServer(opts));
const deleteBucketListItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteBucketListItem_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error
  } = await context.supabase.from("bucket_list_items").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
export {
  addFundTransaction_createServerFn_handler,
  deleteBucketListItem_createServerFn_handler,
  deleteFundTransaction_createServerFn_handler,
  deleteGoal_createServerFn_handler,
  deleteNestingFund_createServerFn_handler,
  deleteSharedTask_createServerFn_handler,
  listBucketListItems_createServerFn_handler,
  listFundTransactions_createServerFn_handler,
  listGoals_createServerFn_handler,
  listNestingFunds_createServerFn_handler,
  listSharedTasks_createServerFn_handler,
  upsertBucketListItem_createServerFn_handler,
  upsertGoal_createServerFn_handler,
  upsertNestingFund_createServerFn_handler,
  upsertSharedTask_createServerFn_handler
};
