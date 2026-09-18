import { c as createServerRpc } from "./createServerRpc-DgawnTky.mjs";
import { a as createServerFn } from "./server-DhrmKQ4T.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-ud2LaeJ8.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { g as objectType, i as stringType } from "../_libs/zod.mjs";
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
async function ensureStarterWorkspace(supabase, userId, email) {
  const {
    data: profile
  } = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle();
  if (!profile) {
    const displayName = (email?.split("@")[0] || "You").slice(0, 80);
    const {
      error: profileError
    } = await supabase.from("profiles").insert({
      id: userId,
      email: email ?? null,
      display_name: displayName
    });
    if (profileError && !String(profileError.message).toLowerCase().includes("duplicate")) {
      throw profileError;
    }
  }
  const {
    data: memberships
  } = await supabase.from("workspace_members").select("workspace_id").eq("user_id", userId).limit(1);
  if ((memberships?.length ?? 0) > 0) return;
  const {
    data: workspace,
    error: workspaceError
  } = await supabase.from("workspaces").insert({
    kind: "solo",
    name: "Personal",
    owner_id: userId
  }).select().single();
  if (workspaceError) throw workspaceError;
  const {
    error: memberError
  } = await supabase.from("workspace_members").insert({
    workspace_id: workspace.id,
    user_id: userId,
    role: "owner"
  });
  if (memberError) throw memberError;
}
const listMyWorkspaces_createServerFn_handler = createServerRpc({
  id: "5e219e866170d82466c286b920d1abc07bd73829a8779d6c256f54ecc19758bc",
  name: "listMyWorkspaces",
  filename: "src/lib/workspace.functions.ts"
}, (opts) => listMyWorkspaces.__executeServer(opts));
const listMyWorkspaces = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listMyWorkspaces_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId,
    claims
  } = context;
  try {
    await ensureStarterWorkspace(supabase, userId, claims?.email ?? null);
  } catch (e) {
    console.error("[ensureStarterWorkspace]", e);
  }
  const {
    data: memberships,
    error: mErr
  } = await supabase.from("workspace_members").select("workspace_id, role, workspaces:workspace_id (id, name, kind, owner_id, anniversary_date, created_at)").eq("user_id", userId);
  if (mErr) throw mErr;
  let workspaces = (memberships ?? []).map((m) => m.workspaces).filter(Boolean);
  if (workspaces.length === 0) {
    const {
      data: ws,
      error: wsErr
    } = await supabase.from("workspaces").insert({
      kind: "solo",
      name: "Personal",
      owner_id: userId
    }).select().single();
    if (!wsErr && ws) {
      await supabase.from("workspace_members").insert({
        workspace_id: ws.id,
        user_id: userId,
        role: "owner"
      });
      workspaces = [ws];
    } else if (wsErr) {
      console.error("[listMyWorkspaces fallback create]", wsErr);
    }
  }
  return {
    workspaces
  };
});
const ensureMyWorkspace_createServerFn_handler = createServerRpc({
  id: "7252bcab1ec76ffd1faf3e86cc91b563f37e6076d70eff0aacd63d1ba97310d6",
  name: "ensureMyWorkspace",
  filename: "src/lib/workspace.functions.ts"
}, (opts) => ensureMyWorkspace.__executeServer(opts));
const ensureMyWorkspace = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(ensureMyWorkspace_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId,
    claims
  } = context;
  await ensureStarterWorkspace(supabase, userId, claims?.email ?? null);
  const {
    data: memberships
  } = await supabase.from("workspace_members").select("workspaces:workspace_id (id, name, kind, owner_id, anniversary_date, created_at)").eq("user_id", userId);
  const workspaces = (memberships ?? []).map((m) => m.workspaces).filter(Boolean);
  return {
    workspaces
  };
});
const getMe_createServerFn_handler = createServerRpc({
  id: "dab74f3e2178c867a435efd1943cc9db8015c10a70dca099a2cc3429e2d36aca",
  name: "getMe",
  filename: "src/lib/workspace.functions.ts"
}, (opts) => getMe.__executeServer(opts));
const getMe = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getMe_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data,
    error
  } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return {
    profile: data,
    userId
  };
});
const updateProfileInput = objectType({
  display_name: stringType().trim().min(1).max(80).optional(),
  avatar_url: stringType().url().max(500).nullable().optional()
});
const updateProfile_createServerFn_handler = createServerRpc({
  id: "8edc470c7c743c90c0633eca73b46e1568e35cec730e6dc76bcf7685e61e9424",
  name: "updateProfile",
  filename: "src/lib/workspace.functions.ts"
}, (opts) => updateProfile.__executeServer(opts));
const updateProfile = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => updateProfileInput.parse(d)).handler(updateProfile_createServerFn_handler, async ({
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
  } = await supabase.from("profiles").update(data).eq("id", userId).select().single();
  if (error) throw error;
  return {
    profile: row
  };
});
const createCoupleInput = objectType({
  name: stringType().trim().min(1).max(80),
  anniversary_date: stringType().optional().nullable()
});
const createCoupleWorkspace_createServerFn_handler = createServerRpc({
  id: "3391c809a698485b0290a8cc9313138bb806fd24a756e15330af62427c638a44",
  name: "createCoupleWorkspace",
  filename: "src/lib/workspace.functions.ts"
}, (opts) => createCoupleWorkspace.__executeServer(opts));
const createCoupleWorkspace = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => createCoupleInput.parse(d)).handler(createCoupleWorkspace_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    userId
  } = context;
  const {
    supabaseAdmin
  } = await import("./client.server-D5ro3rAQ.mjs");
  const {
    data: ws,
    error
  } = await supabaseAdmin.from("workspaces").insert({
    kind: "couple",
    name: data.name,
    owner_id: userId,
    anniversary_date: data.anniversary_date || null
  }).select().single();
  if (error) throw error;
  const {
    error: mErr
  } = await supabaseAdmin.from("workspace_members").insert({
    workspace_id: ws.id,
    user_id: userId,
    role: "owner"
  });
  if (mErr) throw mErr;
  return {
    workspace: ws
  };
});
const inviteInput = objectType({
  workspace_id: stringType().uuid(),
  invited_email: stringType().trim().email().max(255)
});
function generateCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}
const createPartnerInvite_createServerFn_handler = createServerRpc({
  id: "2d517179acf7c44cf40875ebcc560900aa082554c14d2757ea03b61a612370fa",
  name: "createPartnerInvite",
  filename: "src/lib/workspace.functions.ts"
}, (opts) => createPartnerInvite.__executeServer(opts));
const createPartnerInvite = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => inviteInput.parse(d)).handler(createPartnerInvite_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase,
    userId
  } = context;
  const code = generateCode();
  const {
    data: row,
    error
  } = await supabase.from("partner_invites").insert({
    workspace_id: data.workspace_id,
    inviter_id: userId,
    invited_email: data.invited_email.toLowerCase(),
    code
  }).select().single();
  if (error) throw error;
  return {
    invite: row
  };
});
const listInvitesForWorkspace_createServerFn_handler = createServerRpc({
  id: "1773414b11aa1c959f07cc81e43fb39513f38abb7e0102974e043ce9677c704d",
  name: "listInvitesForWorkspace",
  filename: "src/lib/workspace.functions.ts"
}, (opts) => listInvitesForWorkspace.__executeServer(opts));
const listInvitesForWorkspace = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  workspace_id: stringType().uuid()
}).parse(d)).handler(listInvitesForWorkspace_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase
  } = context;
  const {
    data: invites,
    error
  } = await supabase.from("partner_invites").select("*").eq("workspace_id", data.workspace_id).order("created_at", {
    ascending: false
  });
  if (error) throw error;
  return {
    invites: invites ?? []
  };
});
const acceptInput = objectType({
  code: stringType().trim().min(4).max(20)
});
const acceptPartnerInvite_createServerFn_handler = createServerRpc({
  id: "6c8a535d4b54d99b72cb25ef556fac4404623f10ab1e01141b5d84d43bf0bf55",
  name: "acceptPartnerInvite",
  filename: "src/lib/workspace.functions.ts"
}, (opts) => acceptPartnerInvite.__executeServer(opts));
const acceptPartnerInvite = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => acceptInput.parse(d)).handler(acceptPartnerInvite_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase,
    userId,
    claims
  } = context;
  const email = (claims?.email ?? "").toLowerCase();
  const {
    data: invite,
    error
  } = await supabase.from("partner_invites").select("*").eq("code", data.code.toUpperCase()).maybeSingle();
  if (error) throw error;
  if (!invite) throw new Error("Invite not found");
  if (invite.status !== "pending") throw new Error("Invite is no longer valid");
  if (new Date(invite.expires_at) < /* @__PURE__ */ new Date()) throw new Error("Invite has expired");
  if (email && invite.invited_email && invite.invited_email.toLowerCase() !== email) {
    throw new Error("This invite is for a different email address");
  }
  const {
    error: memErr
  } = await supabase.from("workspace_members").insert({
    workspace_id: invite.workspace_id,
    user_id: userId,
    role: "partner"
  });
  if (memErr && !String(memErr.message).includes("duplicate")) throw memErr;
  const {
    error: updErr
  } = await supabase.from("partner_invites").update({
    status: "accepted",
    accepted_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", invite.id);
  if (updErr) throw updErr;
  return {
    workspace_id: invite.workspace_id
  };
});
export {
  acceptPartnerInvite_createServerFn_handler,
  createCoupleWorkspace_createServerFn_handler,
  createPartnerInvite_createServerFn_handler,
  ensureMyWorkspace_createServerFn_handler,
  getMe_createServerFn_handler,
  listInvitesForWorkspace_createServerFn_handler,
  listMyWorkspaces_createServerFn_handler,
  updateProfile_createServerFn_handler
};
