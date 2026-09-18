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
const listMoodLogs_createServerFn_handler = createServerRpc({
  id: "b750c9d9161e68f44ea4c99fffffbe7293622276aa6008abbd3e250b232cd461",
  name: "listMoodLogs",
  filename: "src/lib/wellness.functions.ts"
}, (opts) => listMoodLogs.__executeServer(opts));
const listMoodLogs = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  workspace_id: stringType().uuid(),
  days: numberType().int().min(1).max(90).default(30)
}).parse(d)).handler(listMoodLogs_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase
  } = context;
  const {
    data: rows,
    error
  } = await supabase.from("mood_logs").select("*").eq("workspace_id", data.workspace_id).gte("logged_date", new Date(Date.now() - data.days * 864e5).toISOString().slice(0, 10)).order("logged_date", {
    ascending: false
  });
  if (error) throw error;
  return {
    logs: rows ?? []
  };
});
const upsertMoodInput = objectType({
  workspace_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  mood_score: numberType().int().min(1).max(10),
  energy_score: numberType().int().min(1).max(10),
  relationship_note: stringType().max(2e3).optional().nullable(),
  logged_date: stringType().min(8)
});
const upsertMoodLog_createServerFn_handler = createServerRpc({
  id: "737a9aa35cdcd9a6fa260ed4c6198f5dfb55978c74909d947d558113108af456",
  name: "upsertMoodLog",
  filename: "src/lib/wellness.functions.ts"
}, (opts) => upsertMoodLog.__executeServer(opts));
const upsertMoodLog = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertMoodInput.parse(d)).handler(upsertMoodLog_createServerFn_handler, async ({
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
    } = await supabase.from("mood_logs").update(rest).eq("id", id).select().single();
    if (error2) throw error2;
    return {
      log: row2
    };
  }
  const {
    data: row,
    error
  } = await supabase.from("mood_logs").upsert({
    workspace_id,
    author_id: userId,
    ...rest
  }, {
    onConflict: "workspace_id,author_id,logged_date"
  }).select().single();
  if (error) throw error;
  return {
    log: row
  };
});
const deleteMoodLog_createServerFn_handler = createServerRpc({
  id: "efb7c1f3549836d824c8279da5839a20842fdac89b6fa92792f4394619144437",
  name: "deleteMoodLog",
  filename: "src/lib/wellness.functions.ts"
}, (opts) => deleteMoodLog.__executeServer(opts));
const deleteMoodLog = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteMoodLog_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error
  } = await context.supabase.from("mood_logs").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
const listLoveLanguageActions_createServerFn_handler = createServerRpc({
  id: "1659d5f128ed146d9927fcb77d7b9ab7ef3c4145c1fc6a54ac4106c4f346c561",
  name: "listLoveLanguageActions",
  filename: "src/lib/wellness.functions.ts"
}, (opts) => listLoveLanguageActions.__executeServer(opts));
const listLoveLanguageActions = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(listLoveLanguageActions_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase
  } = context;
  const {
    data: rows,
    error
  } = await supabase.from("love_language_actions").select("*").eq("workspace_id", data.workspace_id).order("created_at", {
    ascending: false
  });
  if (error) throw error;
  return {
    actions: rows ?? []
  };
});
const upsertLoveLanguageInput = objectType({
  workspace_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  language_type: enumType(["words_of_affirmation", "quality_time", "acts_of_service", "physical_touch", "receiving_gifts"]),
  action: stringType().trim().min(1).max(500),
  notes: stringType().max(2e3).optional().nullable(),
  completed_at: stringType().optional().nullable()
});
const upsertLoveLanguageAction_createServerFn_handler = createServerRpc({
  id: "3fa1ee0e4e3875a68fd74e196da726c5b91204c7590a3dcf69164c01ca5c6bd6",
  name: "upsertLoveLanguageAction",
  filename: "src/lib/wellness.functions.ts"
}, (opts) => upsertLoveLanguageAction.__executeServer(opts));
const upsertLoveLanguageAction = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertLoveLanguageInput.parse(d)).handler(upsertLoveLanguageAction_createServerFn_handler, async ({
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
    } = await supabase.from("love_language_actions").update(rest).eq("id", id).select().single();
    if (error2) throw error2;
    return {
      action: row2
    };
  }
  const {
    data: row,
    error
  } = await supabase.from("love_language_actions").insert({
    workspace_id,
    author_id: userId,
    ...rest
  }).select().single();
  if (error) throw error;
  return {
    action: row
  };
});
const deleteLoveLanguageAction_createServerFn_handler = createServerRpc({
  id: "e39ea7dca05d88bca693c5ac0179f25113fea578ddbb971a27a9e91638c0cbf3",
  name: "deleteLoveLanguageAction",
  filename: "src/lib/wellness.functions.ts"
}, (opts) => deleteLoveLanguageAction.__executeServer(opts));
const deleteLoveLanguageAction = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteLoveLanguageAction_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error
  } = await context.supabase.from("love_language_actions").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
const listConflictReflections_createServerFn_handler = createServerRpc({
  id: "b9ed24e97411a964e434056a70045551c41edc662186e7955592cd850790cc76",
  name: "listConflictReflections",
  filename: "src/lib/wellness.functions.ts"
}, (opts) => listConflictReflections.__executeServer(opts));
const listConflictReflections = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(listConflictReflections_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase
  } = context;
  const {
    data: rows,
    error
  } = await supabase.from("conflict_reflections").select("*").eq("workspace_id", data.workspace_id).order("reflection_date", {
    ascending: false
  });
  if (error) throw error;
  return {
    reflections: rows ?? []
  };
});
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
const upsertConflictReflection_createServerFn_handler = createServerRpc({
  id: "234282e543eebca646ff7df0a71c262cd467359f9bc25bb5c094112bae088de5",
  name: "upsertConflictReflection",
  filename: "src/lib/wellness.functions.ts"
}, (opts) => upsertConflictReflection.__executeServer(opts));
const upsertConflictReflection = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertConflictInput.parse(d)).handler(upsertConflictReflection_createServerFn_handler, async ({
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
    } = await supabase.from("conflict_reflections").update(rest).eq("id", id).select().single();
    if (error2) throw error2;
    return {
      reflection: row2
    };
  }
  const {
    data: row,
    error
  } = await supabase.from("conflict_reflections").insert({
    workspace_id,
    author_id: userId,
    ...rest
  }).select().single();
  if (error) throw error;
  return {
    reflection: row
  };
});
const deleteConflictReflection_createServerFn_handler = createServerRpc({
  id: "d3ca5a89ea736483b6badb11dc0f060db54503e8488f3489f0c717af2a41be26",
  name: "deleteConflictReflection",
  filename: "src/lib/wellness.functions.ts"
}, (opts) => deleteConflictReflection.__executeServer(opts));
const deleteConflictReflection = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteConflictReflection_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error
  } = await context.supabase.from("conflict_reflections").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
export {
  deleteConflictReflection_createServerFn_handler,
  deleteLoveLanguageAction_createServerFn_handler,
  deleteMoodLog_createServerFn_handler,
  listConflictReflections_createServerFn_handler,
  listLoveLanguageActions_createServerFn_handler,
  listMoodLogs_createServerFn_handler,
  upsertConflictReflection_createServerFn_handler,
  upsertLoveLanguageAction_createServerFn_handler,
  upsertMoodLog_createServerFn_handler
};
