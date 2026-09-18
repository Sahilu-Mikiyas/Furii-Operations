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
const listGiftIdeas_createServerFn_handler = createServerRpc({
  id: "7f157400ef4ad94eb3d14dc6d8f1d0b8d42d2ef6e35011e0f6c2f156d4c1affd",
  name: "listGiftIdeas",
  filename: "src/lib/gifts.functions.ts"
}, (opts) => listGiftIdeas.__executeServer(opts));
const listGiftIdeas = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(listGiftIdeas_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase
  } = context;
  const {
    data: rows,
    error
  } = await supabase.from("gift_ideas").select("*").eq("workspace_id", data.workspace_id).order("created_at", {
    ascending: false
  });
  if (error) throw error;
  return {
    ideas: rows ?? []
  };
});
const upsertIdeaInput = objectType({
  workspace_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  title: stringType().trim().min(1).max(200),
  notes: stringType().max(4e3).optional().nullable(),
  price: numberType().optional().nullable(),
  url: stringType().max(2e3).optional().nullable(),
  image_url: stringType().max(500).optional().nullable(),
  status: enumType(["idea", "purchased", "given"]).default("idea")
});
const upsertGiftIdea_createServerFn_handler = createServerRpc({
  id: "094758bb2385d0acfe2800057fd0dd77dbaac03b14d04b910a2cbd9252bf48f8",
  name: "upsertGiftIdea",
  filename: "src/lib/gifts.functions.ts"
}, (opts) => upsertGiftIdea.__executeServer(opts));
const upsertGiftIdea = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertIdeaInput.parse(d)).handler(upsertGiftIdea_createServerFn_handler, async ({
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
    } = await supabase.from("gift_ideas").update(rest).eq("id", id).select().single();
    if (error2) throw error2;
    return {
      idea: row2
    };
  }
  const {
    data: row,
    error
  } = await supabase.from("gift_ideas").insert({
    workspace_id,
    author_id: userId,
    ...rest
  }).select().single();
  if (error) throw error;
  return {
    idea: row
  };
});
const deleteGiftIdea_createServerFn_handler = createServerRpc({
  id: "ebf28ed6c14dfe9e971607aed6d15510922100a7ebe4ee1b772d46511aa120f6",
  name: "deleteGiftIdea",
  filename: "src/lib/gifts.functions.ts"
}, (opts) => deleteGiftIdea.__executeServer(opts));
const deleteGiftIdea = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteGiftIdea_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error
  } = await context.supabase.from("gift_ideas").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
const listGiftBudgets_createServerFn_handler = createServerRpc({
  id: "ae3249a1148e1f6fa08b1ec2ff1bed2cf31d0bda8b6ea588fa08f1636e42fad0",
  name: "listGiftBudgets",
  filename: "src/lib/gifts.functions.ts"
}, (opts) => listGiftBudgets.__executeServer(opts));
const listGiftBudgets = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(listGiftBudgets_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase
  } = context;
  const {
    data: rows,
    error
  } = await supabase.from("gift_budgets").select("*").eq("workspace_id", data.workspace_id).order("created_at", {
    ascending: false
  });
  if (error) throw error;
  return {
    budgets: rows ?? []
  };
});
const upsertBudgetInput = objectType({
  workspace_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  title: stringType().trim().min(1).max(200),
  target_amount: numberType().min(0),
  current_amount: numberType().min(0).default(0),
  deadline: stringType().optional().nullable()
});
const upsertGiftBudget_createServerFn_handler = createServerRpc({
  id: "7cb20175caabf5b47572826332f656e34544a6cd28eea2c70a0ec3fdd6559a87",
  name: "upsertGiftBudget",
  filename: "src/lib/gifts.functions.ts"
}, (opts) => upsertGiftBudget.__executeServer(opts));
const upsertGiftBudget = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertBudgetInput.parse(d)).handler(upsertGiftBudget_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase
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
    } = await supabase.from("gift_budgets").update(rest).eq("id", id).select().single();
    if (error2) throw error2;
    return {
      budget: row2
    };
  }
  const {
    data: row,
    error
  } = await supabase.from("gift_budgets").insert({
    workspace_id,
    ...rest
  }).select().single();
  if (error) throw error;
  return {
    budget: row
  };
});
const deleteGiftBudget_createServerFn_handler = createServerRpc({
  id: "21e68940730e8a8bad7fff43eebc2966a843069c75c9395c960325446abd0742",
  name: "deleteGiftBudget",
  filename: "src/lib/gifts.functions.ts"
}, (opts) => deleteGiftBudget.__executeServer(opts));
const deleteGiftBudget = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteGiftBudget_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error
  } = await context.supabase.from("gift_budgets").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
const listGiftHistory_createServerFn_handler = createServerRpc({
  id: "2bceae9cf0658ef0b95b9194b811153bf2b8012b273eedf2f413c7d36b566047",
  name: "listGiftHistory",
  filename: "src/lib/gifts.functions.ts"
}, (opts) => listGiftHistory.__executeServer(opts));
const listGiftHistory = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(listGiftHistory_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase
  } = context;
  const {
    data: rows,
    error
  } = await supabase.from("gift_history").select("*").eq("workspace_id", data.workspace_id).order("date_given", {
    ascending: false
  });
  if (error) throw error;
  return {
    history: rows ?? []
  };
});
const historyInput = objectType({
  workspace_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  title: stringType().trim().min(1).max(200),
  recipient: stringType().trim().min(1).max(120),
  date_given: stringType().min(8),
  rating: numberType().min(1).max(5).optional().nullable(),
  reaction_notes: stringType().max(4e3).optional().nullable()
});
const upsertGiftHistory_createServerFn_handler = createServerRpc({
  id: "f92776e11261d24719a97ac376b304ef33c7d37953a0a216b2ff55c04f7a7b7e",
  name: "upsertGiftHistory",
  filename: "src/lib/gifts.functions.ts"
}, (opts) => upsertGiftHistory.__executeServer(opts));
const upsertGiftHistory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => historyInput.parse(d)).handler(upsertGiftHistory_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase
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
    } = await supabase.from("gift_history").update(rest).eq("id", id).select().single();
    if (error2) throw error2;
    return {
      history: row2
    };
  }
  const {
    data: row,
    error
  } = await supabase.from("gift_history").insert({
    workspace_id,
    ...rest
  }).select().single();
  if (error) throw error;
  return {
    history: row
  };
});
const deleteGiftHistory_createServerFn_handler = createServerRpc({
  id: "83180189ed541eaf7b77f49e6a388a5b0ac430e21d4520b18ebe89954c7f8c03",
  name: "deleteGiftHistory",
  filename: "src/lib/gifts.functions.ts"
}, (opts) => deleteGiftHistory.__executeServer(opts));
const deleteGiftHistory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteGiftHistory_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error
  } = await context.supabase.from("gift_history").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
export {
  deleteGiftBudget_createServerFn_handler,
  deleteGiftHistory_createServerFn_handler,
  deleteGiftIdea_createServerFn_handler,
  listGiftBudgets_createServerFn_handler,
  listGiftHistory_createServerFn_handler,
  listGiftIdeas_createServerFn_handler,
  upsertGiftBudget_createServerFn_handler,
  upsertGiftHistory_createServerFn_handler,
  upsertGiftIdea_createServerFn_handler
};
