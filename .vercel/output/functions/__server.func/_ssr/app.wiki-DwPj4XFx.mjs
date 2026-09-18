import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useQueryClient, u as useQuery, a as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as useWorkspace, u as useServerFn, c as createSsrRpc } from "./createSsrRpc-BN6DI1sa.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { L as Label } from "./label-C8WJLhmR.mjs";
import { T as Textarea } from "./textarea-F69quoCd.mjs";
import { a as createServerFn } from "./server-DhrmKQ4T.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-ud2LaeJ8.mjs";
import "../_libs/seroval.mjs";
import { d as Plus, S as Search, t as Trash2, X, L as LoaderCircle } from "../_libs/lucide-react.mjs";
import { g as objectType, i as stringType, j as arrayType } from "../_libs/zod.mjs";
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
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
const listInput = objectType({
  workspace_id: stringType().uuid(),
  q: stringType().max(200).optional()
});
const listWikiEntries = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => listInput.parse(d)).handler(createSsrRpc("5456ac900f902e0759ea2609061cde8c423df74ac927acd446e99fee44fa948a"));
const upsertInput = objectType({
  workspace_id: stringType().uuid(),
  id: stringType().uuid().optional(),
  title: stringType().trim().min(1).max(200),
  body: stringType().max(2e4).default(""),
  tags: arrayType(stringType().trim().min(1).max(40)).max(20).default([])
});
const upsertWikiEntry = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => upsertInput.parse(d)).handler(createSsrRpc("cf855ab6284822928783eec59a8035675959c2f9ce18bcf4f95266dfe7cc37e3"));
const deleteWikiEntry = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).handler(createSsrRpc("b008167c7a90a5c63d9a1f2cfb7675efc378be723acc812691ad71781a5b08ea"));
function WikiPage() {
  const {
    current
  } = useWorkspace();
  const [q, setQ] = reactExports.useState("");
  const fetchList = useServerFn(listWikiEntries);
  const upsert = useServerFn(upsertWikiEntry);
  const del = useServerFn(deleteWikiEntry);
  const qc = useQueryClient();
  const workspaceId = current?.id;
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["wiki", workspaceId, q],
    queryFn: () => fetchList({
      data: {
        workspace_id: workspaceId,
        q
      }
    }),
    enabled: !!workspaceId
  });
  const [openId, setOpenId] = reactExports.useState(null);
  const remove = useMutation({
    mutationFn: (id) => del({
      data: {
        id
      }
    }),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ["wiki", workspaceId]
    })
  });
  if (!current) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-sm text-muted-foreground", children: "Pick a workspace to begin." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-5xl px-6 py-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-end justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-serif text-3xl", children: "Wiki" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "A searchable notebook of what you've learned." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setOpenId("new"), className: "rounded-xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
        " New entry"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Search titles and body…", className: "pl-9" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid gap-3", children: [
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Loading…" }),
      (data?.entries ?? []).map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "group rounded-2xl border bg-card p-5 shadow-[var(--shadow-soft)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setOpenId(e.id), className: "text-left", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-serif text-xl", children: e.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground line-clamp-2", children: e.body || "No body yet." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => remove.mutate(e.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
        ] }),
        e.tags?.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex flex-wrap gap-1.5", children: e.tags.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground", children: t }, t)) })
      ] }, e.id)),
      !isLoading && (data?.entries ?? []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border bg-card/60 p-10 text-center text-sm text-muted-foreground", children: "Nothing in the wiki yet. Start with a thought you don't want to forget." })
    ] }),
    openId && /* @__PURE__ */ jsxRuntimeExports.jsx(Editor, { workspaceId: current.id, entry: openId === "new" ? null : (data?.entries ?? []).find((e) => e.id === openId) ?? null, onClose: () => setOpenId(null), onSave: async (payload) => {
      await upsert({
        data: payload
      });
      toast.success("Saved");
      qc.invalidateQueries({
        queryKey: ["wiki", workspaceId]
      });
      setOpenId(null);
    } })
  ] });
}
function Editor({
  entry,
  workspaceId,
  onClose,
  onSave
}) {
  const [title, setTitle] = reactExports.useState(entry?.title ?? "");
  const [body, setBody] = reactExports.useState(entry?.body ?? "");
  const [tags, setTags] = reactExports.useState(entry?.tags ?? []);
  const [tagDraft, setTagDraft] = reactExports.useState("");
  const [saving, setSaving] = reactExports.useState(false);
  const canSave = reactExports.useMemo(() => title.trim().length > 0, [title]);
  async function save() {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSave({
        workspace_id: workspaceId,
        id: entry?.id,
        title: title.trim(),
        body,
        tags
      });
    } finally {
      setSaving(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/30 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-2xl rounded-2xl border bg-card p-6 shadow-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-serif text-2xl", children: entry ? "Edit entry" : "New entry" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Title" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { autoFocus: true, value: title, onChange: (e) => setTitle(e.target.value), maxLength: 200 })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Body" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 10, value: body, onChange: (e) => setBody(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Tags" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: tags.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs", children: [
          t,
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTags(tags.filter((_, j) => j !== i)), children: "×" })
        ] }, i)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: tagDraft, onChange: (e) => setTagDraft(e.target.value), onKeyDown: (e) => {
          if (e.key === "Enter" && tagDraft.trim()) {
            e.preventDefault();
            setTags([...tags, tagDraft.trim()]);
            setTagDraft("");
          }
        }, placeholder: "add tag and press enter" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex justify-end gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: save, disabled: !canSave || saving, className: "rounded-xl", children: [
        saving && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
        " Save"
      ] })
    ] })
  ] }) });
}
export {
  WikiPage as component
};
