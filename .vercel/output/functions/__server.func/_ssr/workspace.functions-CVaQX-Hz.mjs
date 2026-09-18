import { c as createSsrRpc } from "./createSsrRpc-BN6DI1sa.mjs";
import { a as createServerFn } from "./server-DhrmKQ4T.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-ud2LaeJ8.mjs";
import { g as objectType, i as stringType } from "../_libs/zod.mjs";
const listMyWorkspaces = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("5e219e866170d82466c286b920d1abc07bd73829a8779d6c256f54ecc19758bc"));
const ensureMyWorkspace = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("7252bcab1ec76ffd1faf3e86cc91b563f37e6076d70eff0aacd63d1ba97310d6"));
const getMe = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("dab74f3e2178c867a435efd1943cc9db8015c10a70dca099a2cc3429e2d36aca"));
const updateProfileInput = objectType({
  display_name: stringType().trim().min(1).max(80).optional(),
  avatar_url: stringType().url().max(500).nullable().optional()
});
const updateProfile = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => updateProfileInput.parse(d)).handler(createSsrRpc("8edc470c7c743c90c0633eca73b46e1568e35cec730e6dc76bcf7685e61e9424"));
const createCoupleInput = objectType({
  name: stringType().trim().min(1).max(80),
  anniversary_date: stringType().optional().nullable()
});
const createCoupleWorkspace = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => createCoupleInput.parse(d)).handler(createSsrRpc("3391c809a698485b0290a8cc9313138bb806fd24a756e15330af62427c638a44"));
const inviteInput = objectType({
  workspace_id: stringType().uuid(),
  invited_email: stringType().trim().email().max(255)
});
const createPartnerInvite = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => inviteInput.parse(d)).handler(createSsrRpc("2d517179acf7c44cf40875ebcc560900aa082554c14d2757ea03b61a612370fa"));
const listInvitesForWorkspace = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  workspace_id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("1773414b11aa1c959f07cc81e43fb39513f38abb7e0102974e043ce9677c704d"));
const acceptInput = objectType({
  code: stringType().trim().min(4).max(20)
});
const acceptPartnerInvite = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => acceptInput.parse(d)).handler(createSsrRpc("6c8a535d4b54d99b72cb25ef556fac4404623f10ab1e01141b5d84d43bf0bf55"));
export {
  createPartnerInvite as a,
  listInvitesForWorkspace as b,
  createCoupleWorkspace as c,
  acceptPartnerInvite as d,
  ensureMyWorkspace as e,
  getMe as g,
  listMyWorkspaces as l,
  updateProfile as u
};
