import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as useWorkspace, u as useServerFn } from "./createSsrRpc-BN6DI1sa.mjs";
import { g as getPartnerProfile } from "./partner.functions-BTg-hrwm.mjs";
import { l as listEvents } from "./events.functions-pBjIr4Ll.mjs";
import { l as listInboxItems } from "./inbox.functions-EnXlW9z1.mjs";
import { s as signAttachmentUrl } from "./storage.functions-mIyZeip5.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import "../_libs/seroval.mjs";
import { l as Sparkles, b as User, q as ArrowRight, I as Inbox, d as Plus, N as NotebookPen } from "../_libs/lucide-react.mjs";
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
import "../_libs/tanstack__query-core.mjs";
import "./server-DhrmKQ4T.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
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
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
function getDaysUntil(dateStr) {
  if (!dateStr) return null;
  const now = /* @__PURE__ */ new Date();
  now.setHours(0, 0, 0, 0);
  const targetBase = new Date(dateStr);
  const target = new Date(now.getFullYear(), targetBase.getMonth(), targetBase.getDate());
  if (target < now) {
    target.setFullYear(target.getFullYear() + 1);
  }
  return Math.round((target.getTime() - now.getTime()) / 864e5);
}
function parseDate(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function nextOccurrence(ev, from) {
  const base = parseDate(ev.event_date);
  if (ev.recurrence === "none") return base >= from ? base : null;
  const d = new Date(base);
  while (d < from) {
    if (ev.recurrence === "yearly") d.setFullYear(d.getFullYear() + 1);
    else if (ev.recurrence === "monthly") d.setMonth(d.getMonth() + 1);
    else if (ev.recurrence === "weekly") d.setDate(d.getDate() + 7);
    else return null;
  }
  return d;
}
function computeUpcoming(events, limit) {
  const now = /* @__PURE__ */ new Date();
  now.setHours(0, 0, 0, 0);
  return events.map((event) => {
    const date = nextOccurrence(event, now);
    if (!date) return null;
    const daysAway = Math.round((date.getTime() - now.getTime()) / 864e5);
    return {
      event,
      date,
      daysAway
    };
  }).filter(Boolean).sort((a, b) => a.daysAway - b.daysAway).slice(0, limit);
}
function Dashboard() {
  const {
    current,
    scope
  } = useWorkspace();
  const fetchPartner = useServerFn(getPartnerProfile);
  const fetchEvents = useServerFn(listEvents);
  const fetchInbox = useServerFn(listInboxItems);
  const sign = useServerFn(signAttachmentUrl);
  const workspaceId = current?.id;
  const partnerQuery = useQuery({
    queryKey: ["partner-profile", workspaceId],
    queryFn: () => fetchPartner({
      data: {
        workspace_id: workspaceId
      }
    }),
    enabled: !!workspaceId
  });
  const eventsQuery = useQuery({
    queryKey: ["events", workspaceId],
    queryFn: () => fetchEvents({
      data: {
        workspace_id: workspaceId
      }
    }),
    enabled: !!workspaceId
  });
  const inboxQuery = useQuery({
    queryKey: ["inbox", workspaceId],
    queryFn: () => fetchInbox({
      data: {
        workspace_id: workspaceId
      }
    }),
    enabled: !!workspaceId
  });
  const profile = partnerQuery.data?.profile;
  const events = eventsQuery.data?.events ?? [];
  const inboxItems = (inboxQuery.data?.items ?? []).filter((i) => i.status === "new").slice(0, 3);
  const [avatarUrl, setAvatarUrl] = reactExports.useState(null);
  reactExports.useEffect(() => {
    let cancelled = false;
    if (profile?.avatar_url) {
      sign({
        data: {
          path: profile.avatar_url
        }
      }).then(({
        url
      }) => {
        if (!cancelled) setAvatarUrl(url);
      }).catch(() => {
      });
    } else {
      setAvatarUrl(null);
    }
    return () => {
      cancelled = true;
    };
  }, [profile?.avatar_url, sign]);
  const birthdayDays = getDaysUntil(profile?.birthdate);
  const anniversaryDays = getDaysUntil(profile?.anniversary_date || current?.anniversary_date);
  const upcomingEvents = reactExports.useMemo(() => computeUpcoming(events, 3), [events]);
  if (!current) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-sm text-muted-foreground", children: "Pick a workspace to begin." });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-5xl space-y-8 px-6 py-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border bg-card p-8 shadow-[var(--shadow-soft)] relative overflow-hidden", style: {
      background: "var(--gradient-paper)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/5 blur-3xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-primary" }),
        " Welcome to Lovepond"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-2 font-serif text-4xl leading-tight", children: current.kind === "couple" ? "Your shared connection" : "Your private catalog" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 max-w-xl text-sm text-muted-foreground", children: [
        "Currently viewing ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: current.name }),
        " in",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: scope }),
        " view. Capture thoughts, schedule moments, and keep track of everything that matters."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [
      current.kind === "couple" || profile ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-6 shadow-[var(--shadow-soft)] space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-serif text-2xl", children: "Partner Profile" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Quick facts at a glance" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/app/partner", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "rounded-xl", children: "Edit Hub" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-16 w-16 place-items-center overflow-hidden rounded-2xl bg-accent text-primary", children: avatarUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: avatarUrl, alt: "", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-7 w-7" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-serif text-lg leading-tight", children: profile?.display_name || "Partner Name" }),
            profile?.nickname && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              'aka "',
              profile.nickname,
              '"'
            ] }),
            profile?.love_language && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mt-1.5 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary", children: [
              "❤️ ",
              profile.love_language
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-accent/30 p-3 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground block", children: "Partner's Birthday" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-serif text-2xl text-primary block mt-1", children: birthdayDays !== null ? birthdayDays === 0 ? "Today 🎉" : `${birthdayDays} days` : "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-accent/30 p-3 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground block", children: "Anniversary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-serif text-2xl text-primary block mt-1", children: anniversaryDays !== null ? anniversaryDays === 0 ? "Today 💕" : `${anniversaryDays} days` : "—" })
          ] })
        ] }),
        profile?.favorites && Object.keys(profile.favorites).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 pt-2 border-t text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs text-muted-foreground uppercase font-bold tracking-wider", children: "Favorites Snippet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: Object.entries(profile.favorites).slice(0, 3).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-muted/30 px-2.5 py-1 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium capitalize text-muted-foreground", children: [
              k,
              ":"
            ] }),
            " ",
            v
          ] }, k)) })
        ] })
      ] }) : (
        /* Fallback Partner Prompt if Solo and no profile details exist */
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-6 shadow-[var(--shadow-soft)] flex flex-col justify-between min-h-[300px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-serif text-2xl", children: "Create Couple Workspace" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Lovepond is built for collaboration. Set up a couple workspace to invite your partner, share calendar events, logs, and capture thoughts together." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/app/settings", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "w-full rounded-xl gap-2", children: [
            "Invite Partner ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" })
          ] }) })
        ] })
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-6 shadow-[var(--shadow-soft)] space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-serif text-2xl", children: "Upcoming Events" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "What's coming next" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/app/calendar", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "rounded-xl", children: "View Calendar" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          upcomingEvents.map((u, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-xl border bg-muted/20 px-3.5 py-2.5 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-foreground", children: u.event.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: u.date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric"
              }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-serif text-sm text-primary", children: u.daysAway === 0 ? "Today" : u.daysAway === 1 ? "Tomorrow" : `${u.daysAway} days` })
          ] }, `${u.event.id}-${i}`)),
          upcomingEvents.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground", children: "No upcoming events. Log your anniversaries or plans." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-6 shadow-[var(--shadow-soft)] space-y-4 md:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-serif text-2xl", children: "Thoughtfulness Inbox" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Recent unorganized thoughts" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/app/inbox", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", className: "rounded-xl", children: "Sort Inbox" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          inboxItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 rounded-xl border bg-muted/20 p-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[10px] text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-accent px-1.5 py-0.5", children: item.source_type }),
                item.category && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-primary/10 px-1.5 py-0.5 text-primary", children: item.category })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 font-medium truncate", children: item.ai_suggestion?.title || "Captured Thought" }),
              item.content && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground line-clamp-1 mt-0.5", children: item.content })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/app/inbox", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" }) }) })
          ] }, item.id)),
          inboxItems.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground", children: "Inbox is clear. Capture a quick suggestion or thought!" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-6 shadow-[var(--shadow-soft)] space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-serif text-2xl", children: "Quick Actions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/app/inbox", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "w-full justify-start rounded-xl gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Inbox, { className: "h-4 w-4 text-primary" }),
            " Capture a Thought"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/app/calendar", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "w-full justify-start rounded-xl gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 text-primary" }),
            " Log Calendar Event"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/app/wiki", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "w-full justify-start rounded-xl gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(NotebookPen, { className: "h-4 w-4 text-primary" }),
            " Write Wiki Page"
          ] }) })
        ] })
      ] })
    ] })
  ] });
}
export {
  Dashboard as component
};
