import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { b as useQueryClient, u as useQuery, a as useMutation } from "../_libs/tanstack__react-query.mjs";
import { u as useServerFn, a as useWorkspace } from "./createSsrRpc-BN6DI1sa.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { L as Label } from "./label-C8WJLhmR.mjs";
import { g as getMe, u as updateProfile, c as createCoupleWorkspace, a as createPartnerInvite, b as listInvitesForWorkspace, d as acceptPartnerInvite } from "./workspace.functions-CVaQX-Hz.mjs";
import "../_libs/seroval.mjs";
import { L as LoaderCircle, U as Users, $ as Copy } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
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
function SettingsPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-3xl space-y-8 px-6 py-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-serif text-3xl", children: "Settings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Account, workspace, and partner." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileCard, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CoupleCard, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AcceptInviteCard, {})
  ] });
}
function Card({
  title,
  description,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border bg-card p-6 shadow-[var(--shadow-soft)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-serif text-xl", children: title }),
    description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: description }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children })
  ] });
}
function ProfileCard() {
  const fetchMe = useServerFn(getMe);
  const update = useServerFn(updateProfile);
  const qc = useQueryClient();
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["me"],
    queryFn: () => fetchMe()
  });
  const [name, setName] = reactExports.useState("");
  const [initialized, setInitialized] = reactExports.useState(false);
  if (data?.profile && !initialized) {
    setName(data.profile.display_name ?? "");
    setInitialized(true);
  }
  const mutation = useMutation({
    mutationFn: () => update({
      data: {
        display_name: name
      }
    }),
    onSuccess: () => {
      toast.success("Profile updated");
      qc.invalidateQueries({
        queryKey: ["me"]
      });
    },
    onError: (e) => toast.error(e.message ?? "Failed to save")
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { title: "Your profile", description: "Used across all your workspaces.", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Loading…" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "space-y-3", onSubmit: (e) => {
    e.preventDefault();
    mutation.mutate();
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Display name" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: name, onChange: (e) => setName(e.target.value), maxLength: 80 })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Email" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: data?.profile?.email ?? "", disabled: true })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: mutation.isPending, className: "rounded-xl", children: [
      mutation.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
      " Save"
    ] })
  ] }) });
}
function CoupleCard() {
  const {
    workspaces,
    setCurrentId,
    current
  } = useWorkspace();
  const couple = workspaces.find((w) => w.kind === "couple");
  const createWs = useServerFn(createCoupleWorkspace);
  const createInv = useServerFn(createPartnerInvite);
  const listInv = useServerFn(listInvitesForWorkspace);
  const qc = useQueryClient();
  const [name, setName] = reactExports.useState("");
  const [date, setDate] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const create = useMutation({
    mutationFn: () => createWs({
      data: {
        name,
        anniversary_date: date || null
      }
    }),
    onSuccess: (res) => {
      toast.success("Couple workspace created");
      qc.invalidateQueries({
        queryKey: ["my-workspaces"]
      });
      if (res?.workspace?.id) setCurrentId(res.workspace.id);
      setName("");
      setDate("");
    },
    onError: (e) => toast.error(e.message ?? "Failed")
  });
  const sendInvite = useMutation({
    mutationFn: () => createInv({
      data: {
        workspace_id: couple.id,
        invited_email: email
      }
    }),
    onSuccess: () => {
      toast.success("Invite created");
      qc.invalidateQueries({
        queryKey: ["invites", couple?.id]
      });
      setEmail("");
    },
    onError: (e) => toast.error(e.message ?? "Failed")
  });
  const invites = useQuery({
    queryKey: ["invites", couple?.id],
    queryFn: () => listInv({
      data: {
        workspace_id: couple.id
      }
    }),
    enabled: !!couple
  });
  if (!couple) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { title: "Couple workspace", description: "Create a shared space and invite your partner.", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "space-y-3", onSubmit: (e) => {
      e.preventDefault();
      create.mutate();
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Workspace name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, value: name, onChange: (e) => setName(e.target.value), placeholder: "Sam & Alex", maxLength: 80 })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Anniversary (optional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: date, onChange: (e) => setDate(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: create.isPending, className: "rounded-xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "mr-2 h-4 w-4" }),
        " Create couple workspace"
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { title: `Couple — ${couple.name}`, description: "Invite your partner with a code.", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "flex gap-2", onSubmit: (e) => {
      e.preventDefault();
      sendInvite.mutate();
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), placeholder: "partner@example.com" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: sendInvite.isPending, className: "rounded-xl", children: "Invite" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-2", children: [
      (invites.data?.invites ?? []).map((inv) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-xl border bg-muted/30 px-3 py-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: inv.invited_email }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: inv.status })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "inline-flex items-center gap-2 rounded-lg border bg-background px-2.5 py-1 font-mono text-xs", onClick: () => {
          navigator.clipboard.writeText(inv.code);
          toast.success("Code copied");
        }, children: [
          inv.code,
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3 w-3" })
        ] })
      ] }, inv.id)),
      (invites.data?.invites ?? []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "No invites yet." })
    ] })
  ] });
}
function AcceptInviteCard() {
  const accept = useServerFn(acceptPartnerInvite);
  const qc = useQueryClient();
  const {
    setCurrentId
  } = useWorkspace();
  const [code, setCode] = reactExports.useState("");
  const mutation = useMutation({
    mutationFn: () => accept({
      data: {
        code
      }
    }),
    onSuccess: (res) => {
      toast.success("Joined your partner's workspace");
      qc.invalidateQueries({
        queryKey: ["my-workspaces"]
      });
      if (res?.workspace_id) setCurrentId(res.workspace_id);
      setCode("");
    },
    onError: (e) => toast.error(e.message ?? "Couldn't accept invite")
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { title: "Have an invite code?", description: "Enter the code your partner shared with you.", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "flex gap-2", onSubmit: (e) => {
    e.preventDefault();
    mutation.mutate();
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: code, onChange: (e) => setCode(e.target.value.toUpperCase()), placeholder: "ABCD1234", className: "font-mono uppercase" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: mutation.isPending || !code, className: "rounded-xl", children: "Accept" })
  ] }) });
}
export {
  SettingsPage as component
};
