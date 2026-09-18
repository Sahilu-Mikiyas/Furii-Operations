import { c as createServerRpc } from "./createServerRpc-DgawnTky.mjs";
import { a as createServerFn } from "./server-DhrmKQ4T.mjs";
import { g as generateText, o as output_exports } from "../_libs/ai.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-ud2LaeJ8.mjs";
import { c as createLovableAiGatewayProvider } from "./ai-gateway.server-CHmBCP5K.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { g as objectType, k as enumType, i as stringType } from "../_libs/zod.mjs";
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
const CATEGORIES = ["gift_idea", "dream", "date_idea", "wishlist", "memory", "goal", "problem", "preference", "other"];
const listInput = objectType({
  workspace_id: stringType().uuid(),
  status: enumType(["new", "routed", "archived"]).optional()
});
const listInboxItems_createServerFn_handler = createServerRpc({
  id: "147a1ee52b196681b7c8fb3e57e51cc198b1c749b3138580ca1c8b38188f05d7",
  name: "listInboxItems",
  filename: "src/lib/inbox.functions.ts"
}, (opts) => listInboxItems.__executeServer(opts));
const listInboxItems = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => listInput.parse(d)).handler(listInboxItems_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase
  } = context;
  let q = supabase.from("inbox_items").select("*").eq("workspace_id", data.workspace_id).order("created_at", {
    ascending: false
  });
  if (data.status) q = q.eq("status", data.status);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw error;
  return {
    items: rows ?? []
  };
});
const createInput = objectType({
  workspace_id: stringType().uuid(),
  content: stringType().max(8e3).default(""),
  source_type: enumType(["text", "voice", "photo", "video", "link", "screenshot"]).default("text"),
  attachment_path: stringType().max(500).optional().nullable(),
  attachment_mime: stringType().max(120).optional().nullable(),
  link_url: stringType().max(2e3).optional().nullable()
});
const createInboxItem_createServerFn_handler = createServerRpc({
  id: "24d70d6f7b3b8da51ea00b3ad78b8e7f5ea651f4a9e252837ed1ff20b9015b8f",
  name: "createInboxItem",
  filename: "src/lib/inbox.functions.ts"
}, (opts) => createInboxItem.__executeServer(opts));
const createInboxItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => createInput.parse(d)).handler(createInboxItem_createServerFn_handler, async ({
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
  } = await supabase.from("inbox_items").insert({
    ...data,
    author_id: userId
  }).select().single();
  if (error) throw error;
  return {
    item: row
  };
});
const updateInput = objectType({
  id: stringType().uuid(),
  category: stringType().max(40).optional().nullable(),
  status: enumType(["new", "routed", "archived"]).optional(),
  routed_to: stringType().max(60).optional().nullable(),
  content: stringType().max(8e3).optional()
});
const updateInboxItem_createServerFn_handler = createServerRpc({
  id: "bde5300afd3ed3ba978089853172342a18b56c8e503213868a2c02e8e26f049e",
  name: "updateInboxItem",
  filename: "src/lib/inbox.functions.ts"
}, (opts) => updateInboxItem.__executeServer(opts));
const updateInboxItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => updateInput.parse(d)).handler(updateInboxItem_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    id,
    ...rest
  } = data;
  const {
    supabase,
    userId
  } = context;
  if (rest.status === "routed" && rest.routed_to) {
    const {
      data: item,
      error: fErr
    } = await supabase.from("inbox_items").select("*").eq("id", id).single();
    if (fErr) throw fErr;
    const title = item.ai_suggestion?.title || item.content.slice(0, 60) || "Inbox Item";
    const bodyText = item.content + (item.link_url ? `

Link: ${item.link_url}` : "");
    if (rest.routed_to === "wiki") {
      const {
        error: insErr
      } = await supabase.from("wiki_entries").insert({
        workspace_id: item.workspace_id,
        author_id: item.author_id,
        title,
        body: bodyText
      });
      if (insErr) throw insErr;
    } else if (rest.routed_to === "calendar") {
      const {
        error: insErr
      } = await supabase.from("events").insert({
        workspace_id: item.workspace_id,
        author_id: item.author_id,
        title,
        event_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
        notes: item.content
      });
      if (insErr) throw insErr;
    } else if (rest.routed_to === "gifts") {
      const {
        error: insErr
      } = await supabase.from("gift_ideas").insert({
        workspace_id: item.workspace_id,
        author_id: item.author_id,
        title,
        notes: item.content,
        url: item.link_url
      });
      if (insErr) throw insErr;
    } else if (rest.routed_to === "dates") {
      const {
        error: insErr
      } = await supabase.from("date_plans").insert({
        workspace_id: item.workspace_id,
        author_id: item.author_id,
        title,
        description: item.content,
        date_planned: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
      });
      if (insErr) throw insErr;
    } else if (rest.routed_to === "memories") {
      const {
        error: insErr
      } = await supabase.from("memories").insert({
        workspace_id: item.workspace_id,
        author_id: item.author_id,
        title,
        description: item.content,
        occurred_on: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
      });
      if (insErr) throw insErr;
    } else if (rest.routed_to === "goals") {
      const {
        error: insErr
      } = await supabase.from("goals").insert({
        workspace_id: item.workspace_id,
        author_id: item.author_id,
        title,
        status: "active"
      });
      if (insErr) throw insErr;
    } else if (rest.routed_to === "bucket-list") {
      const {
        error: insErr
      } = await supabase.from("bucket_list_items").insert({
        workspace_id: item.workspace_id,
        author_id: item.author_id,
        title,
        status: "active"
      });
      if (insErr) throw insErr;
    } else if (rest.routed_to === "travel") {
      const {
        error: insErr
      } = await supabase.from("travel_destinations").insert({
        workspace_id: item.workspace_id,
        author_id: item.author_id,
        title,
        notes: item.content,
        status: "idea",
        priority: "someday"
      });
      if (insErr) throw insErr;
    } else if (rest.routed_to === "places") {
      const {
        error: insErr
      } = await supabase.from("saved_places").insert({
        workspace_id: item.workspace_id,
        author_id: item.author_id,
        name: title,
        category: "Other",
        notes: bodyText,
        link_url: item.link_url
      });
      if (insErr) throw insErr;
    }
  }
  const {
    data: row,
    error
  } = await supabase.from("inbox_items").update(rest).eq("id", id).select().single();
  if (error) throw error;
  return {
    item: row
  };
});
const deleteInboxItem_createServerFn_handler = createServerRpc({
  id: "53a309a01c71fbb2d18298f865c7bcd7c95d048bb352802ec27677df71a611e6",
  name: "deleteInboxItem",
  filename: "src/lib/inbox.functions.ts"
}, (opts) => deleteInboxItem.__executeServer(opts));
const deleteInboxItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(deleteInboxItem_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    error
  } = await context.supabase.from("inbox_items").delete().eq("id", data.id);
  if (error) throw error;
  return {
    ok: true
  };
});
const categorizeInput = objectType({
  id: stringType().uuid()
});
const categorizeInboxItem_createServerFn_handler = createServerRpc({
  id: "1b0f51b1c58e56f5ebaa2cbb7ead153e71796c4a2735d8e9ccf8f7890fc8e1c1",
  name: "categorizeInboxItem",
  filename: "src/lib/inbox.functions.ts"
}, (opts) => categorizeInboxItem.__executeServer(opts));
const categorizeInboxItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => categorizeInput.parse(d)).handler(categorizeInboxItem_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase
  } = context;
  const {
    data: item,
    error
  } = await supabase.from("inbox_items").select("*").eq("id", data.id).single();
  if (error) throw error;
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("AI is not configured");
  const gateway = createLovableAiGatewayProvider(key);
  const text = [item.content, item.link_url ? `Link: ${item.link_url}` : "", item.attachment_mime ? `Attachment: ${item.attachment_mime}` : ""].filter(Boolean).join("\n");
  const prompt = `You are sorting a "thoughtfulness inbox" entry for a couple's app.
Pick the BEST category from: ${CATEGORIES.join(", ")}.
Provide a one-sentence summary and a 3-6 word title.

Entry:
"""${text || "(no text — attachment only)"}"""`;
  let category = "other";
  let summary = "";
  let title = "";
  try {
    const {
      output
    } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      output: output_exports.object({
        schema: objectType({
          category: enumType(CATEGORIES),
          title: stringType().max(80),
          summary: stringType().max(300)
        })
      }),
      prompt
    });
    category = output.category;
    summary = output.summary;
    title = output.title;
  } catch (e) {
    throw new Error(e?.message?.includes("402") ? "AI credits exhausted — add credits in Lovable to use AI categorization." : e?.message?.includes("429") ? "AI is rate-limited right now — try again in a moment." : "AI categorization failed.");
  }
  const ai_suggestion = {
    title,
    summary,
    suggested_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  const {
    data: row,
    error: uErr
  } = await supabase.from("inbox_items").update({
    category,
    ai_suggestion
  }).eq("id", data.id).select().single();
  if (uErr) throw uErr;
  return {
    item: row
  };
});
export {
  categorizeInboxItem_createServerFn_handler,
  createInboxItem_createServerFn_handler,
  deleteInboxItem_createServerFn_handler,
  listInboxItems_createServerFn_handler,
  updateInboxItem_createServerFn_handler
};
