import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { b as useQueryClient, u as useQuery, a as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as useWorkspace, u as useServerFn, c as createSsrRpc } from "./createSsrRpc-BN6DI1sa.mjs";
import { a as createServerFn } from "./server-DhrmKQ4T.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-ud2LaeJ8.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { T as Textarea } from "./textarea-F69quoCd.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import { o as Bot, t as Trash2, l as Sparkles, ad as Send, b as User } from "../_libs/lucide-react.mjs";
import { g as objectType, i as stringType } from "../_libs/zod.mjs";
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
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
const wsId = objectType({
  workspace_id: stringType().uuid()
});
const listAssistantMessages = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(createSsrRpc("a1fbb200699fa36ad5e2cfd455408927280a9af05ba0a25e89f83a31ad8c3b07"));
const clearAssistant = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => wsId.parse(d)).handler(createSsrRpc("7f4fa1de3b1feeacc9c49ea38c0ad6effb67b6b673f600a3d0ad6014993cafed"));
const sendInput = objectType({
  workspace_id: stringType().uuid(),
  content: stringType().trim().min(1).max(4e3)
});
const sendAssistantMessage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => sendInput.parse(d)).handler(createSsrRpc("8c90d46f19347dc6eb554371817d0ca3267967968a59b2cb5b8deda869be6bfe"));
const STARTERS = ["What's a thoughtful date idea for this weekend?", "Help me write a sweet text for her right now.", "What gifts have I been considering lately?", "What anniversary is coming up and how should I plan?", "Suggest a question I should ask my partner tonight."];
function AssistantPage() {
  const {
    current
  } = useWorkspace();
  const qc = useQueryClient();
  const list = useServerFn(listAssistantMessages);
  const send = useServerFn(sendAssistantMessage);
  const clear = useServerFn(clearAssistant);
  const [input, setInput] = reactExports.useState("");
  const scrollRef = reactExports.useRef(null);
  const {
    data
  } = useQuery({
    queryKey: ["assistant", current?.id],
    queryFn: () => list({
      data: {
        workspace_id: current.id
      }
    }),
    enabled: !!current
  });
  const messages = data?.messages ?? [];
  const sendMut = useMutation({
    mutationFn: (content) => send({
      data: {
        workspace_id: current.id,
        content
      }
    }),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ["assistant", current?.id]
    }),
    onError: (e) => toast.error(e.message)
  });
  const clearMut = useMutation({
    mutationFn: () => clear({
      data: {
        workspace_id: current.id
      }
    }),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ["assistant", current?.id]
    })
  });
  reactExports.useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages.length, sendMut.isPending]);
  if (!current) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-sm text-muted-foreground", children: "Pick a workspace." });
  const submit = () => {
    const text = input.trim();
    if (!text || sendMut.isPending) return;
    setInput("");
    sendMut.mutate(text);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-[calc(100vh-3.5rem)] flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "border-b bg-card/60 backdrop-blur px-6 py-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-9 w-9 place-items-center rounded-2xl bg-primary text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-serif text-xl leading-tight", children: "Lovepond Assistant" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Grounded in your pond. Drafts, suggests, remembers." })
        ] })
      ] }),
      messages.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: () => clearMut.mutate(), className: "text-muted-foreground gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }),
        " Clear"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: scrollRef, className: "flex-1 overflow-y-auto px-4 md:px-8 py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-3xl space-y-5", children: [
      messages.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid mx-auto h-14 w-14 place-items-center rounded-2xl bg-accent text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-6 w-6" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 font-serif text-3xl", children: "How can I help you love better today?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "I know everything you've shared with Lovepond — your partner, dates, memories, gifts, calendar." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 grid gap-2 sm:grid-cols-2 max-w-2xl mx-auto", children: STARTERS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => sendMut.mutate(s), className: "text-left rounded-2xl border bg-card p-3 text-sm hover:bg-accent transition", children: s }, s)) })
      ] }) : messages.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(Bubble, { role: m.role, content: m.content }, m.id)),
      sendMut.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(Bubble, { role: "assistant", content: "…", pulse: true })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t bg-card/60 backdrop-blur p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-3xl flex items-end gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: input, onChange: (e) => setInput(e.target.value), onKeyDown: (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          submit();
        }
      }, placeholder: "Ask Lovepond anything…", rows: 1, className: "resize-none rounded-2xl min-h-[44px] max-h-32" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: submit, disabled: !input.trim() || sendMut.isPending, className: "rounded-2xl h-11 w-11 p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }) })
    ] }) })
  ] });
}
function Bubble({
  role,
  content,
  pulse
}) {
  const isUser = role === "user";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex gap-3 ${isUser ? "justify-end" : "justify-start"}`, children: [
    !isUser && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "h-3.5 w-3.5" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${isUser ? "bg-primary text-primary-foreground" : "bg-card border"} ${pulse ? "animate-pulse" : ""}`, children: content }),
    isUser && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-7 w-7 place-items-center rounded-full bg-accent text-primary shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3.5 w-3.5" }) })
  ] });
}
export {
  AssistantPage as component
};
