import { c as createServerRpc } from "./createServerRpc-DgawnTky.mjs";
import { a as createServerFn } from "./server-DhrmKQ4T.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-ud2LaeJ8.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { g as objectType, i as stringType, h as numberType, k as enumType, z as booleanType } from "../_libs/zod.mjs";
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
const listDatePlans_createServerFn_handler = createServerRpc({
  id: "395b436757b9e80ce1ccbcb0eaba38f603a96a6bbf28fb9dd44ab0f9c59b7d16",
  name: "listDatePlans",
  filename: "src/lib/dates.functions.ts"
}, (opts) => listDatePlans.__executeServer(opts));
const listDatePlans = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(listDatePlans_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase
  } = context;
  const {
    data: rows,
    error
  } = await supabase.from("date_plans").select("*").eq("workspace_id", data.workspace_id).order("date_planned", {
    ascending: true
  });
  if (error) throw error;
  return {
    dates: rows ?? []
  };
});
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
const upsertDatePlan_createServerFn_handler = createServerRpc({
  id: "a52030ee0ef196663c640d377c4e9b9e20bca465336cf16c010dcfcd342baa45",
  name: "upsertDatePlan",
  filename: "src/lib/dates.functions.ts"
}, (opts) => upsertDatePlan.__executeServer(opts));
const upsertDatePlan = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertDatePlanInput.parse(d)).handler(upsertDatePlan_createServerFn_handler, async ({
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
    } = await supabase.from("date_plans").update(rest).eq("id", id).select().single();
    if (error2) throw error2;
    return {
      date: row2
    };
  }
  const {
    data: row,
    error
  } = await supabase.from("date_plans").insert({
    workspace_id,
    author_id: userId,
    ...rest
  }).select().single();
  if (error) throw error;
  return {
    date: row
  };
});
const deleteDatePlan_createServerFn_handler = createServerRpc({
  id: "c40b483f2cc98430a9997284ac9d99b22729797e9921234018a15434d68f4e2b",
  name: "deleteDatePlan",
  filename: "src/lib/dates.functions.ts"
}, (opts) => deleteDatePlan.__executeServer(opts));
const deleteDatePlan = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteDatePlan_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error
  } = await context.supabase.from("date_plans").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
const listDateStages_createServerFn_handler = createServerRpc({
  id: "571f8ff9ed9ff1f94e323c8296bd9a85de836083b233d9f013e64f6bd536b5b4",
  name: "listDateStages",
  filename: "src/lib/dates.functions.ts"
}, (opts) => listDateStages.__executeServer(opts));
const listDateStages = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  date_plan_id: stringType().uuid()
}).parse(d)).handler(listDateStages_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase
  } = context;
  const {
    data: rows,
    error
  } = await supabase.from("date_stages").select("*").eq("date_plan_id", data.date_plan_id).order("time_offset", {
    ascending: true
  });
  if (error) throw error;
  return {
    stages: rows ?? []
  };
});
const upsertStageInput = objectType({
  date_plan_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  title: stringType().trim().min(1).max(200),
  description: stringType().max(1e3).optional().nullable(),
  time_offset: stringType().optional().nullable(),
  is_completed: booleanType().default(false)
});
const upsertDateStage_createServerFn_handler = createServerRpc({
  id: "88d03f05d605c42b95ad8da05689f379d964b48070889f9a05c638869c806c1e",
  name: "upsertDateStage",
  filename: "src/lib/dates.functions.ts"
}, (opts) => upsertDateStage.__executeServer(opts));
const upsertDateStage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertStageInput.parse(d)).handler(upsertDateStage_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase
  } = context;
  const {
    id,
    ...rest
  } = data;
  if (id) {
    const {
      data: row2,
      error: error2
    } = await supabase.from("date_stages").update(rest).eq("id", id).select().single();
    if (error2) throw error2;
    return {
      stage: row2
    };
  }
  const {
    data: row,
    error
  } = await supabase.from("date_stages").insert(rest).select().single();
  if (error) throw error;
  return {
    stage: row
  };
});
const deleteDateStage_createServerFn_handler = createServerRpc({
  id: "29316fb1f1980807a5a00d039bc92b4bbdb51e6e71ad1769959be95172d6bb70",
  name: "deleteDateStage",
  filename: "src/lib/dates.functions.ts"
}, (opts) => deleteDateStage.__executeServer(opts));
const deleteDateStage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteDateStage_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error
  } = await context.supabase.from("date_stages").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
const listSurprisePlans_createServerFn_handler = createServerRpc({
  id: "f4acdbc0a3fc8caa703631adb1bcae6356ceecc4cbc9dec245b183d9d07dd43b",
  name: "listSurprisePlans",
  filename: "src/lib/dates.functions.ts"
}, (opts) => listSurprisePlans.__executeServer(opts));
const listSurprisePlans = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(listSurprisePlans_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase
  } = context;
  const {
    data: rows,
    error
  } = await supabase.from("surprise_plans").select("*").eq("workspace_id", data.workspace_id).order("target_date", {
    ascending: true
  });
  if (error) throw error;
  return {
    surprises: rows ?? []
  };
});
const upsertSurpriseInput = objectType({
  workspace_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  title: stringType().trim().min(1).max(200),
  target_date: stringType().min(8),
  status: enumType(["planning", "ready", "revealed"]).default("planning"),
  details: stringType().max(8e3)
});
const upsertSurprisePlan_createServerFn_handler = createServerRpc({
  id: "c1d6d446bb7c3ad5120f409a6f65febf5205b4fe1ad08d8ab63a387ce668069f",
  name: "upsertSurprisePlan",
  filename: "src/lib/dates.functions.ts"
}, (opts) => upsertSurprisePlan.__executeServer(opts));
const upsertSurprisePlan = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertSurpriseInput.parse(d)).handler(upsertSurprisePlan_createServerFn_handler, async ({
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
    } = await supabase.from("surprise_plans").update(rest).eq("id", id).select().single();
    if (error2) throw error2;
    return {
      surprise: row2
    };
  }
  const {
    data: row,
    error
  } = await supabase.from("surprise_plans").insert({
    workspace_id,
    author_id: userId,
    ...rest
  }).select().single();
  if (error) throw error;
  return {
    surprise: row
  };
});
const deleteSurprisePlan_createServerFn_handler = createServerRpc({
  id: "501f21d9e66990740b1ffca674804c50ed35f213d354e745a850dddfcaf80cfc",
  name: "deleteSurprisePlan",
  filename: "src/lib/dates.functions.ts"
}, (opts) => deleteSurprisePlan.__executeServer(opts));
const deleteSurprisePlan = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteSurprisePlan_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error
  } = await context.supabase.from("surprise_plans").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
const listSurpriseClues_createServerFn_handler = createServerRpc({
  id: "f0051a1591a392c066fffa243cdeb61af55f3cf24b0cb21644cb021463b5a576",
  name: "listSurpriseClues",
  filename: "src/lib/dates.functions.ts"
}, (opts) => listSurpriseClues.__executeServer(opts));
const listSurpriseClues = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  surprise_plan_id: stringType().uuid()
}).parse(d)).handler(listSurpriseClues_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase
  } = context;
  const {
    data: rows,
    error
  } = await supabase.from("surprise_clues").select("*").eq("surprise_plan_id", data.surprise_plan_id).order("created_at", {
    ascending: true
  });
  if (error) throw error;
  return {
    clues: rows ?? []
  };
});
const upsertClueInput = objectType({
  surprise_plan_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  clue_text: stringType().trim().min(1).max(1e3),
  revealed_at: stringType().optional().nullable()
});
const upsertSurpriseClue_createServerFn_handler = createServerRpc({
  id: "a1c93c55cf43cb46f395aac9dc90f49922f6055ed272d917d11052c82f4af3c9",
  name: "upsertSurpriseClue",
  filename: "src/lib/dates.functions.ts"
}, (opts) => upsertSurpriseClue.__executeServer(opts));
const upsertSurpriseClue = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertClueInput.parse(d)).handler(upsertSurpriseClue_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase
  } = context;
  const {
    id,
    ...rest
  } = data;
  if (id) {
    const {
      data: row2,
      error: error2
    } = await supabase.from("surprise_clues").update(rest).eq("id", id).select().single();
    if (error2) throw error2;
    return {
      clue: row2
    };
  }
  const {
    data: row,
    error
  } = await supabase.from("surprise_clues").insert(rest).select().single();
  if (error) throw error;
  return {
    clue: row
  };
});
const deleteSurpriseClue_createServerFn_handler = createServerRpc({
  id: "f973fa79023f9c83adf3858dfec4bf15efa013617abb531220d8ec2e0ab87554",
  name: "deleteSurpriseClue",
  filename: "src/lib/dates.functions.ts"
}, (opts) => deleteSurpriseClue.__executeServer(opts));
const deleteSurpriseClue = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteSurpriseClue_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error
  } = await context.supabase.from("surprise_clues").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
export {
  deleteDatePlan_createServerFn_handler,
  deleteDateStage_createServerFn_handler,
  deleteSurpriseClue_createServerFn_handler,
  deleteSurprisePlan_createServerFn_handler,
  listDatePlans_createServerFn_handler,
  listDateStages_createServerFn_handler,
  listSurpriseClues_createServerFn_handler,
  listSurprisePlans_createServerFn_handler,
  upsertDatePlan_createServerFn_handler,
  upsertDateStage_createServerFn_handler,
  upsertSurpriseClue_createServerFn_handler,
  upsertSurprisePlan_createServerFn_handler
};
