import { c as createSsrRpc } from "./createSsrRpc-BN6DI1sa.mjs";
import { a as createServerFn } from "./server-DhrmKQ4T.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-ud2LaeJ8.mjs";
import { g as objectType, i as stringType, j as arrayType, y as recordType } from "../_libs/zod.mjs";
const wsId = objectType({
  workspace_id: stringType().uuid()
});
const getPartnerProfile = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(createSsrRpc("a3199f8b0cd0d7df2f5627a92e4beb0a85cdd30cefe7962e82c57a8cd0c83455"));
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
const upsertPartnerProfile = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertInput.parse(d)).handler(createSsrRpc("0e6085bceaf35b6ab698f2267339fcc226da64fbc75bcf030589d6a58470a8ed"));
const listImportantPeople = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(createSsrRpc("dda58a57c7828fb2d60efdb22cf2964fba106774ba25ec0af0a36e567922633b"));
const personInput = objectType({
  workspace_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  name: stringType().trim().min(1).max(120),
  relationship: stringType().trim().max(80).optional().nullable(),
  birthdate: stringType().optional().nullable(),
  notes: stringType().max(2e3).optional().nullable()
});
const upsertImportantPerson = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => personInput.parse(d)).handler(createSsrRpc("f82fb5b22e7568bc36ecb270c2c07059b712635edcd0af28ee5a34bd2e6bf3a9"));
const deleteImportantPerson = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("5cb675057067673e0868f49629f582a58b3155449d936dd786a12cd351fdedf4"));
export {
  upsertImportantPerson as a,
  deleteImportantPerson as d,
  getPartnerProfile as g,
  listImportantPeople as l,
  upsertPartnerProfile as u
};
