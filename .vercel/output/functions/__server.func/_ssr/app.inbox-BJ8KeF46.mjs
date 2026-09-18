import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { b as useQueryClient, u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as useWorkspace, u as useServerFn } from "./createSsrRpc-BN6DI1sa.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { T as Textarea } from "./textarea-F69quoCd.mjs";
import { c as createInboxItem, l as listInboxItems, u as updateInboxItem, d as deleteInboxItem, a as categorizeInboxItem } from "./inbox.functions-EnXlW9z1.mjs";
import { u as uploadAttachment, s as signAttachmentUrl } from "./storage.functions-mIyZeip5.mjs";
import "../_libs/seroval.mjs";
import { aa as Paperclip, ab as Square, ac as Mic, L as LoaderCircle, ad as Send, ae as Archive, t as Trash2, l as Sparkles } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "./server-DhrmKQ4T.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "./auth-middleware-ud2LaeJ8.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/zod.mjs";
const CATEGORY_LABELS = {
  gift_idea: "Gift idea",
  dream: "Dream",
  date_idea: "Date idea",
  wishlist: "Wishlist",
  memory: "Memory",
  goal: "Goal",
  problem: "Problem",
  preference: "Preference",
  other: "Other"
};
function InboxPage() {
  const {
    current
  } = useWorkspace();
  if (!current) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-sm text-muted-foreground", children: "Pick a workspace to begin." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-3xl space-y-6 px-6 py-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-serif text-3xl", children: "Thoughtfulness Inbox" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Capture anything. Sort it later." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Composer, { workspaceId: current.id }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ItemList, { workspaceId: current.id })
  ] });
}
function Composer({
  workspaceId
}) {
  const create = useServerFn(createInboxItem);
  const upload = useServerFn(uploadAttachment);
  const qc = useQueryClient();
  const [text, setText] = reactExports.useState("");
  const [link, setLink] = reactExports.useState("");
  const [busy, setBusy] = reactExports.useState(false);
  const [recording, setRecording] = reactExports.useState(false);
  const mediaRef = reactExports.useRef(null);
  const chunksRef = reactExports.useRef([]);
  async function blobToBase64(blob) {
    const buf = new Uint8Array(await blob.arrayBuffer());
    let s = "";
    for (const b of buf) s += String.fromCharCode(b);
    return btoa(s);
  }
  async function submit(extra = {}) {
    if (busy) return;
    setBusy(true);
    try {
      await create({
        data: {
          workspace_id: workspaceId,
          content: text.trim(),
          link_url: link.trim() || null,
          source_type: extra.source_type ?? (link.trim() ? "link" : "text"),
          attachment_path: extra.attachment_path ?? null,
          attachment_mime: extra.attachment_mime ?? null
        }
      });
      setText("");
      setLink("");
      qc.invalidateQueries({
        queryKey: ["inbox", workspaceId]
      });
      toast.success("Captured");
    } catch (e) {
      toast.error(e.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  }
  async function handleFile(file, source) {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10 MB");
      return;
    }
    setBusy(true);
    try {
      const base64 = await blobToBase64(file);
      const {
        path
      } = await upload({
        data: {
          workspace_id: workspaceId,
          folder: "inbox",
          filename: file.name,
          content_type: file.type || "application/octet-stream",
          base64
        }
      });
      await submit({
        source_type: source,
        attachment_path: path,
        attachment_mime: file.type
      });
    } catch (e) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  }
  async function toggleRecord() {
    if (recording) {
      mediaRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        const blob = new Blob(chunksRef.current, {
          type: "audio/webm"
        });
        if (blob.size === 0) return;
        const base64 = await blobToBase64(blob);
        setBusy(true);
        try {
          const {
            path
          } = await upload({
            data: {
              workspace_id: workspaceId,
              folder: "inbox",
              filename: `voice-${Date.now()}.webm`,
              content_type: "audio/webm",
              base64
            }
          });
          await submit({
            source_type: "voice",
            attachment_path: path,
            attachment_mime: "audio/webm"
          });
        } catch (e) {
          toast.error(e.message ?? "Upload failed");
        } finally {
          setBusy(false);
        }
      };
      mediaRef.current = mr;
      mr.start();
      setRecording(true);
    } catch {
      toast.error("Microphone access denied");
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border bg-card p-5 shadow-[var(--shadow-soft)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: text, onChange: (e) => setText(e.target.value), placeholder: "A thought, an idea, a thing they mentioned…" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid gap-2 sm:grid-cols-[1fr_auto]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: link, onChange: (e) => setLink(e.target.value), placeholder: "Paste a link (optional)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*", hidden: true, onChange: (e) => e.target.files?.[0] && handleFile(e.target.files[0], "photo") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-xl border bg-background px-2.5 py-1.5 text-xs hover:bg-accent", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-3.5 w-3.5" }),
            " Photo"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "video/*", hidden: true, onChange: (e) => e.target.files?.[0] && handleFile(e.target.files[0], "video") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-xl border bg-background px-2.5 py-1.5 text-xs hover:bg-accent", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-3.5 w-3.5" }),
            " Video"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: toggleRecord, className: `inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs ${recording ? "bg-destructive text-destructive-foreground" : "bg-background hover:bg-accent"}`, children: recording ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { className: "h-3.5 w-3.5" }),
          " Stop"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "h-3.5 w-3.5" }),
          " Voice"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => submit(), disabled: busy || !text.trim() && !link.trim(), className: "rounded-xl", children: busy ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }) })
      ] })
    ] })
  ] });
}
const ROUTE_OPTIONS = [{
  value: "gifts",
  label: "Send to Gifts"
}, {
  value: "dates",
  label: "Send to Dates"
}, {
  value: "travel",
  label: "Send to Travel"
}, {
  value: "places",
  label: "Send to Places"
}, {
  value: "memories",
  label: "Send to Memories"
}, {
  value: "wiki",
  label: "Send to Wiki"
}, {
  value: "goals",
  label: "Send to Goals"
}, {
  value: "bucket-list",
  label: "Send to Bucket List"
}];
function ItemList({
  workspaceId
}) {
  const fetchList = useServerFn(listInboxItems);
  const update = useServerFn(updateInboxItem);
  const del = useServerFn(deleteInboxItem);
  const categorize = useServerFn(categorizeInboxItem);
  const qc = useQueryClient();
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["inbox", workspaceId],
    queryFn: () => fetchList({
      data: {
        workspace_id: workspaceId
      }
    })
  });
  const invalidate = () => qc.invalidateQueries({
    queryKey: ["inbox", workspaceId]
  });
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Loading…" });
  const items = data?.items ?? [];
  if (items.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border bg-card/60 p-10 text-center text-sm text-muted-foreground", children: "Inbox is clear. Quietly impressive." });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: items.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsx(InboxRow, { item: it, onCategorize: async () => {
    try {
      await categorize({
        data: {
          id: it.id
        }
      });
      invalidate();
    } catch (e) {
      toast.error(e.message);
    }
  }, onRoute: async (to) => {
    await update({
      data: {
        id: it.id,
        routed_to: to,
        status: "routed"
      }
    });
    invalidate();
    toast.success(`Routed to ${to}`);
  }, onArchive: async () => {
    await update({
      data: {
        id: it.id,
        status: it.status === "archived" ? "new" : "archived"
      }
    });
    invalidate();
  }, onDelete: async () => {
    await del({
      data: {
        id: it.id
      }
    });
    invalidate();
  } }, it.id)) });
}
function InboxRow({
  item,
  onCategorize,
  onRoute,
  onArchive,
  onDelete
}) {
  const sign = useServerFn(signAttachmentUrl);
  const [previewUrl, setPreviewUrl] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!item.attachment_path) return;
    let cancelled = false;
    sign({
      data: {
        path: item.attachment_path
      }
    }).then(({
      url
    }) => !cancelled && setPreviewUrl(url)).catch(() => {
    });
    return () => {
      cancelled = true;
    };
  }, [item.attachment_path, sign]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: `rounded-2xl border bg-card p-4 shadow-[var(--shadow-soft)] ${item.status === "archived" ? "opacity-60" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-muted px-2 py-0.5", children: item.source_type }),
          item.category && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-primary/10 px-2 py-0.5 text-primary", children: CATEGORY_LABELS[item.category] ?? item.category }),
          item.routed_to && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-accent px-2 py-0.5", children: [
            "→ ",
            item.routed_to
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: new Date(item.created_at).toLocaleString() })
        ] }),
        item.ai_suggestion?.title && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 font-serif text-base", children: item.ai_suggestion.title }),
        item.content && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 whitespace-pre-wrap text-sm", children: item.content }),
        item.link_url && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: item.link_url, target: "_blank", rel: "noreferrer", className: "mt-1 block break-all text-xs text-primary underline", children: item.link_url }),
        previewUrl && item.attachment_mime?.startsWith("image/") && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: previewUrl, alt: "", className: "mt-2 max-h-64 rounded-xl" }),
        previewUrl && item.attachment_mime?.startsWith("audio/") && /* @__PURE__ */ jsxRuntimeExports.jsx("audio", { src: previewUrl, controls: true, className: "mt-2 w-full" }),
        previewUrl && item.attachment_mime?.startsWith("video/") && /* @__PURE__ */ jsxRuntimeExports.jsx("video", { src: previewUrl, controls: true, className: "mt-2 max-h-64 w-full rounded-xl" }),
        item.ai_suggestion?.summary && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-xs text-muted-foreground italic", children: item.ai_suggestion.summary })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 flex-col items-end gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: onArchive, title: "Archive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: onDelete, title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap items-center gap-2", children: [
      !item.category && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: onCategorize, className: "rounded-xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "mr-1 h-3.5 w-3.5" }),
        " Categorize with AI"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "h-8 rounded-md border border-input bg-transparent px-2 text-xs", value: item.routed_to ?? "", onChange: (e) => e.target.value && onRoute(e.target.value), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Route to…" }),
        ROUTE_OPTIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: o.value, children: o.label }, o.value))
      ] })
    ] })
  ] });
}
export {
  InboxPage as component
};
