import { c as createServerRpc } from "./createServerRpc-DgawnTky.mjs";
import { a as createServerFn } from "./server-DhrmKQ4T.mjs";
import { g as generateText } from "../_libs/ai.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-ud2LaeJ8.mjs";
import { c as createLovableAiGatewayProvider } from "./ai-gateway.server-CHmBCP5K.mjs";
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
import "../_libs/ai-sdk__gateway.mjs";
import "../_libs/ai-sdk__provider-utils.mjs";
import "../_libs/ai-sdk__provider.mjs";
import "../_libs/eventsource-parser.mjs";
import "../_libs/@vercel/oidc.mjs";
import "path";
import "fs";
import "os";
import "../_libs/opentelemetry__api.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/ai-sdk__openai-compatible.mjs";
const wsId = objectType({
  workspace_id: stringType().uuid()
});
const listAssistantMessages_createServerFn_handler = createServerRpc({
  id: "a1fbb200699fa36ad5e2cfd455408927280a9af05ba0a25e89f83a31ad8c3b07",
  name: "listAssistantMessages",
  filename: "src/lib/assistant.functions.ts"
}, (opts) => listAssistantMessages.__executeServer(opts));
const listAssistantMessages = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(listAssistantMessages_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    data: rows,
    error
  } = await context.supabase.from("assistant_messages").select("*").eq("workspace_id", data.workspace_id).order("created_at", {
    ascending: true
  }).limit(200);
  if (error) throw error;
  return {
    messages: rows ?? []
  };
});
const clearAssistant_createServerFn_handler = createServerRpc({
  id: "7f4fa1de3b1feeacc9c49ea38c0ad6effb67b6b673f600a3d0ad6014993cafed",
  name: "clearAssistant",
  filename: "src/lib/assistant.functions.ts"
}, (opts) => clearAssistant.__executeServer(opts));
const clearAssistant = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(clearAssistant_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error
  } = await context.supabase.from("assistant_messages").delete().eq("workspace_id", data.workspace_id);
  if (error) throw error;
  return {
    ok: true
  };
});
const sendInput = objectType({
  workspace_id: stringType().uuid(),
  content: stringType().trim().min(1).max(4e3)
});
const sendAssistantMessage_createServerFn_handler = createServerRpc({
  id: "8c90d46f19347dc6eb554371817d0ca3267967968a59b2cb5b8deda869be6bfe",
  name: "sendAssistantMessage",
  filename: "src/lib/assistant.functions.ts"
}, (opts) => sendAssistantMessage.__executeServer(opts));
const sendAssistantMessage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => sendInput.parse(d)).handler(sendAssistantMessage_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error: insErr
  } = await supabase.from("assistant_messages").insert({
    workspace_id: data.workspace_id,
    author_id: userId,
    role: "user",
    content: data.content
  });
  if (insErr) throw insErr;
  const [partnerRes, eventsRes, wikiRes, memoriesRes, historyRes] = await Promise.all([supabase.from("partner_profiles").select("*").eq("workspace_id", data.workspace_id).maybeSingle(), supabase.from("events").select("title,event_date,recurrence,notes").eq("workspace_id", data.workspace_id).limit(20), supabase.from("wiki_entries").select("title,body,tags").eq("workspace_id", data.workspace_id).limit(20), supabase.from("memories").select("title,description,occurred_on,location").eq("workspace_id", data.workspace_id).limit(15), supabase.from("assistant_messages").select("role,content").eq("workspace_id", data.workspace_id).order("created_at", {
    ascending: false
  }).limit(12)]);
  const partner = partnerRes.data;
  const events = eventsRes.data ?? [];
  const wiki = wikiRes.data ?? [];
  const memories = memoriesRes.data ?? [];
  const history = (historyRes.data ?? []).reverse();
  const systemContext = `You are Lovepond, a warm, thoughtful AI partner-coach for someone trying to be more attentive in their relationships.
Use ONLY the context below to ground answers. Never invent facts about the partner. If you don't know, say so and ask a kind question.
Tone: gentle, specific, never preachy. Short paragraphs. Concrete suggestions.

PARTNER PROFILE:
${partner ? JSON.stringify({
    display_name: partner.display_name,
    nickname: partner.nickname,
    birthdate: partner.birthdate,
    anniversary_date: partner.anniversary_date,
    love_language: partner.love_language,
    favorites: partner.favorites,
    likes: partner.likes,
    dislikes: partner.dislikes,
    personality: partner.personality,
    notes: partner.notes
  }, null, 2) : "(no partner profile yet)"}

UPCOMING / RECURRING EVENTS:
${events.map((e) => `- ${e.event_date} · ${e.title}${e.notes ? ` — ${e.notes}` : ""}`).join("\n") || "(none)"}

WIKI ENTRIES:
${wiki.map((w) => `- ${w.title}: ${String(w.body).slice(0, 180)}`).join("\n") || "(none)"}

MEMORIES:
${memories.map((m) => `- ${m.occurred_on ?? "?"} · ${m.title}${m.location ? ` @ ${m.location}` : ""}`).join("\n") || "(none)"}`;
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");
  const gateway = createLovableAiGatewayProvider(apiKey);
  let assistantText = "";
  try {
    const {
      text
    } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      system: systemContext,
      messages: history.map((m) => ({
        role: m.role,
        content: m.content
      }))
    });
    assistantText = text.trim();
  } catch (e) {
    assistantText = e?.message?.includes("402") ? "I'm out of AI credits right now — please top up Lovable AI to keep chatting." : e?.message?.includes("429") ? "I'm being rate-limited — give me a moment and try again." : "Something went wrong reaching the AI. Try again in a moment.";
  }
  const {
    data: assistantRow,
    error: aErr
  } = await supabase.from("assistant_messages").insert({
    workspace_id: data.workspace_id,
    author_id: userId,
    role: "assistant",
    content: assistantText
  }).select().single();
  if (aErr) throw aErr;
  return {
    message: assistantRow
  };
});
export {
  clearAssistant_createServerFn_handler,
  listAssistantMessages_createServerFn_handler,
  sendAssistantMessage_createServerFn_handler
};
