import { c as createServerRpc } from "./createServerRpc-DgawnTky.mjs";
import { a as createServerFn } from "./server-DhrmKQ4T.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-ud2LaeJ8.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { g as objectType, i as stringType, j as arrayType, y as recordType } from "../_libs/zod.mjs";
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
const getPartnerProfile_createServerFn_handler = createServerRpc({
  id: "a3199f8b0cd0d7df2f5627a92e4beb0a85cdd30cefe7962e82c57a8cd0c83455",
  name: "getPartnerProfile",
  filename: "src/lib/partner.functions.ts"
}, (opts) => getPartnerProfile.__executeServer(opts));
const getPartnerProfile = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(getPartnerProfile_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase
  } = context;
  const {
    data: row,
    error
  } = await supabase.from("partner_profiles").select("*").eq("workspace_id", data.workspace_id).order("created_at", {
    ascending: true
  }).limit(1).maybeSingle();
  if (error) throw error;
  return {
    profile: row
  };
});
const upsertInput = objectType({
  workspace_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  display_name: stringType().trim().max(120).optional().nullable(),
  nickname: stringType().trim().max(120).optional().nullable(),
  birthdate: stringType().optional().nullable(),
  anniversary_date: stringType().optional().nullable(),
  avatar_url: stringType().max(500).optional().nullable(),
  love_language: stringType().max(60).optional().nullable(),
  notes: stringType().max(8e3).optional().nullable(),
  clothing_sizes: recordType(stringType(), stringType()).optional(),
  favorites: recordType(stringType(), stringType()).optional(),
  personality: recordType(stringType(), stringType()).optional(),
  likes: arrayType(stringType()).optional(),
  dislikes: arrayType(stringType()).optional()
});
const upsertPartnerProfile_createServerFn_handler = createServerRpc({
  id: "0e6085bceaf35b6ab698f2267339fcc226da64fbc75bcf030589d6a58470a8ed",
  name: "upsertPartnerProfile",
  filename: "src/lib/partner.functions.ts"
}, (opts) => upsertPartnerProfile.__executeServer(opts));
const upsertPartnerProfile = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertInput.parse(d)).handler(upsertPartnerProfile_createServerFn_handler, async ({
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
    } = await supabase.from("partner_profiles").update(rest).eq("id", id).select().single();
    if (error2) throw error2;
    return {
      profile: row2
    };
  }
  const {
    data: row,
    error
  } = await supabase.from("partner_profiles").insert({
    workspace_id,
    ...rest
  }).select().single();
  if (error) throw error;
  return {
    profile: row
  };
});
const listImportantPeople_createServerFn_handler = createServerRpc({
  id: "dda58a57c7828fb2d60efdb22cf2964fba106774ba25ec0af0a36e567922633b",
  name: "listImportantPeople",
  filename: "src/lib/partner.functions.ts"
}, (opts) => listImportantPeople.__executeServer(opts));
const listImportantPeople = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(listImportantPeople_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase
  } = context;
  const {
    data: rows,
    error
  } = await supabase.from("important_people").select("*").eq("workspace_id", data.workspace_id).order("name");
  if (error) throw error;
  return {
    people: rows ?? []
  };
});
const personInput = objectType({
  workspace_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  name: stringType().trim().min(1).max(120),
  relationship: stringType().trim().max(80).optional().nullable(),
  birthdate: stringType().optional().nullable(),
  notes: stringType().max(2e3).optional().nullable()
});
const upsertImportantPerson_createServerFn_handler = createServerRpc({
  id: "f82fb5b22e7568bc36ecb270c2c07059b712635edcd0af28ee5a34bd2e6bf3a9",
  name: "upsertImportantPerson",
  filename: "src/lib/partner.functions.ts"
}, (opts) => upsertImportantPerson.__executeServer(opts));
const upsertImportantPerson = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => personInput.parse(d)).handler(upsertImportantPerson_createServerFn_handler, async ({
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
    } = await supabase.from("important_people").update(rest).eq("id", id).select().single();
    if (error2) throw error2;
    return {
      person: row2
    };
  }
  const {
    data: row,
    error
  } = await supabase.from("important_people").insert({
    workspace_id,
    ...rest
  }).select().single();
  if (error) throw error;
  return {
    person: row
  };
});
const deleteImportantPerson_createServerFn_handler = createServerRpc({
  id: "5cb675057067673e0868f49629f582a58b3155449d936dd786a12cd351fdedf4",
  name: "deleteImportantPerson",
  filename: "src/lib/partner.functions.ts"
}, (opts) => deleteImportantPerson.__executeServer(opts));
const deleteImportantPerson = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteImportantPerson_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error
  } = await context.supabase.from("important_people").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
export {
  deleteImportantPerson_createServerFn_handler,
  getPartnerProfile_createServerFn_handler,
  listImportantPeople_createServerFn_handler,
  upsertImportantPerson_createServerFn_handler,
  upsertPartnerProfile_createServerFn_handler
};
