import { b as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { S as redirect } from "../_libs/tanstack__router-core.mjs";
import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { s as supabase } from "./client-Ca-eqV5I.mjs";
import { T as Toaster$1 } from "../_libs/sonner.mjs";
import { g as objectType, i as stringType, k as enumType } from "../_libs/zod.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
const appCss = "/assets/styles-C9DedBVg.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-serif text-7xl text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router = useRouter();
  reactExports.useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-serif text-xl text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-xl border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$p = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovepond — Relationship OS" },
      { name: "description", content: "Remember, plan, celebrate, support, and grow together. A thoughtful operating system for your relationships." },
      { name: "author", content: "Lovepond" },
      { property: "og:title", content: "Lovepond — Relationship OS" },
      { property: "og:description", content: "Become a more thoughtful partner." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..600&family=Inter:wght@400;500;600;700&family=Caveat:wght@500;600;700&display=swap" }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$p.useRouteContext();
  const router = useRouter();
  reactExports.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => subscription.unsubscribe();
  }, [router, queryClient]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(QueryClientProvider, { client: queryClient, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, {})
  ] });
}
const $$splitComponentImporter$o = () => import("./auth-DFaqfhcd.mjs");
const searchSchema = objectType({
  mode: enumType(["signin", "signup"]).optional(),
  redirect: stringType().optional()
});
const Route$o = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [{
      title: "Sign in — Lovepond"
    }, {
      name: "description",
      content: "Sign in or create your Lovepond account."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$o, "component")
});
const $$splitComponentImporter$n = () => import("./app-Cr0mKxTe.mjs");
const Route$n = createFileRoute("/app")({
  ssr: false,
  beforeLoad: async ({
    location
  }) => {
    const {
      data,
      error
    } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({
        to: "/auth",
        search: {
          redirect: location.pathname
        }
      });
    }
    return {
      user: data.user
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$n, "component")
});
const $$splitComponentImporter$m = () => import("./index-v8xlwrx8.mjs");
const Route$m = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "Lovepond — a quiet pond for the people you love"
    }, {
      name: "description",
      content: "Lovepond is a relationship operating system. Remember what matters, plan meaningful moments, and become a more thoughtful partner — alone or together."
    }, {
      property: "og:title",
      content: "Lovepond — Relationship OS"
    }, {
      property: "og:description",
      content: "Become a more thoughtful partner."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$m, "component")
});
const $$splitComponentImporter$l = () => import("./app.index-CjntxVBC.mjs");
const Route$l = createFileRoute("/app/")({
  component: lazyRouteComponent($$splitComponentImporter$l, "component")
});
const $$splitComponentImporter$k = () => import("./app.wiki-DwPj4XFx.mjs");
const Route$k = createFileRoute("/app/wiki")({
  component: lazyRouteComponent($$splitComponentImporter$k, "component")
});
const $$splitComponentImporter$j = () => import("./app.travel-DsenCUvn.mjs");
const Route$j = createFileRoute("/app/travel")({
  component: lazyRouteComponent($$splitComponentImporter$j, "component")
});
const $$splitComponentImporter$i = () => import("./app.tasks-DQ25-eP3.mjs");
const Route$i = createFileRoute("/app/tasks")({
  component: lazyRouteComponent($$splitComponentImporter$i, "component")
});
const $$splitComponentImporter$h = () => import("./app.surprises-C3BhG-_o.mjs");
const Route$h = createFileRoute("/app/surprises")({
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const $$splitComponentImporter$g = () => import("./app.support-CU2DLfsC.mjs");
const Route$g = createFileRoute("/app/support")({
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./app.settings-BygYzd1v.mjs");
const Route$f = createFileRoute("/app/settings")({
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./app.places-BNeisPJE.mjs");
const Route$e = createFileRoute("/app/places")({
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./app.partner-Cg3miPxy.mjs");
const Route$d = createFileRoute("/app/partner")({
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./app.mood-cOiD5Y-R.mjs");
const Route$c = createFileRoute("/app/mood")({
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./app.memories-CvNwCWrZ.mjs");
const Route$b = createFileRoute("/app/memories")({
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./app.love-languages-QZmkMIgq.mjs");
const Route$a = createFileRoute("/app/love-languages")({
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./app.journal-BdSSQSiO.mjs");
const Route$9 = createFileRoute("/app/journal")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./app.inbox-BJ8KeF46.mjs");
const Route$8 = createFileRoute("/app/inbox")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./app.goals-N2SiC41C.mjs");
const Route$7 = createFileRoute("/app/goals")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./app.gifts-CKok2OYS.mjs");
const Route$6 = createFileRoute("/app/gifts")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./app.finances-BEEPyn6E.mjs");
const Route$5 = createFileRoute("/app/finances")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./app.dates-eyDtZNsp.mjs");
const Route$4 = createFileRoute("/app/dates")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./app.conversations-uIuGp3uc.mjs");
const Route$3 = createFileRoute("/app/conversations")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./app.calendar-CXvK1vcV.mjs");
const Route$2 = createFileRoute("/app/calendar")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./app.bucket-list-DewrWFHk.mjs");
const Route$1 = createFileRoute("/app/bucket-list")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./app.assistant-BWJl260j.mjs");
const Route = createFileRoute("/app/assistant")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const AuthRoute = Route$o.update({
  id: "/auth",
  path: "/auth",
  getParentRoute: () => Route$p
});
const AppRoute = Route$n.update({
  id: "/app",
  path: "/app",
  getParentRoute: () => Route$p
});
const IndexRoute = Route$m.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$p
});
const AppIndexRoute = Route$l.update({
  id: "/",
  path: "/",
  getParentRoute: () => AppRoute
});
const AppWikiRoute = Route$k.update({
  id: "/wiki",
  path: "/wiki",
  getParentRoute: () => AppRoute
});
const AppTravelRoute = Route$j.update({
  id: "/travel",
  path: "/travel",
  getParentRoute: () => AppRoute
});
const AppTasksRoute = Route$i.update({
  id: "/tasks",
  path: "/tasks",
  getParentRoute: () => AppRoute
});
const AppSurprisesRoute = Route$h.update({
  id: "/surprises",
  path: "/surprises",
  getParentRoute: () => AppRoute
});
const AppSupportRoute = Route$g.update({
  id: "/support",
  path: "/support",
  getParentRoute: () => AppRoute
});
const AppSettingsRoute = Route$f.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => AppRoute
});
const AppPlacesRoute = Route$e.update({
  id: "/places",
  path: "/places",
  getParentRoute: () => AppRoute
});
const AppPartnerRoute = Route$d.update({
  id: "/partner",
  path: "/partner",
  getParentRoute: () => AppRoute
});
const AppMoodRoute = Route$c.update({
  id: "/mood",
  path: "/mood",
  getParentRoute: () => AppRoute
});
const AppMemoriesRoute = Route$b.update({
  id: "/memories",
  path: "/memories",
  getParentRoute: () => AppRoute
});
const AppLoveLanguagesRoute = Route$a.update({
  id: "/love-languages",
  path: "/love-languages",
  getParentRoute: () => AppRoute
});
const AppJournalRoute = Route$9.update({
  id: "/journal",
  path: "/journal",
  getParentRoute: () => AppRoute
});
const AppInboxRoute = Route$8.update({
  id: "/inbox",
  path: "/inbox",
  getParentRoute: () => AppRoute
});
const AppGoalsRoute = Route$7.update({
  id: "/goals",
  path: "/goals",
  getParentRoute: () => AppRoute
});
const AppGiftsRoute = Route$6.update({
  id: "/gifts",
  path: "/gifts",
  getParentRoute: () => AppRoute
});
const AppFinancesRoute = Route$5.update({
  id: "/finances",
  path: "/finances",
  getParentRoute: () => AppRoute
});
const AppDatesRoute = Route$4.update({
  id: "/dates",
  path: "/dates",
  getParentRoute: () => AppRoute
});
const AppConversationsRoute = Route$3.update({
  id: "/conversations",
  path: "/conversations",
  getParentRoute: () => AppRoute
});
const AppCalendarRoute = Route$2.update({
  id: "/calendar",
  path: "/calendar",
  getParentRoute: () => AppRoute
});
const AppBucketListRoute = Route$1.update({
  id: "/bucket-list",
  path: "/bucket-list",
  getParentRoute: () => AppRoute
});
const AppAssistantRoute = Route.update({
  id: "/assistant",
  path: "/assistant",
  getParentRoute: () => AppRoute
});
const AppRouteChildren = {
  AppAssistantRoute,
  AppBucketListRoute,
  AppCalendarRoute,
  AppConversationsRoute,
  AppDatesRoute,
  AppFinancesRoute,
  AppGiftsRoute,
  AppGoalsRoute,
  AppInboxRoute,
  AppJournalRoute,
  AppLoveLanguagesRoute,
  AppMemoriesRoute,
  AppMoodRoute,
  AppPartnerRoute,
  AppPlacesRoute,
  AppSettingsRoute,
  AppSupportRoute,
  AppSurprisesRoute,
  AppTasksRoute,
  AppTravelRoute,
  AppWikiRoute,
  AppIndexRoute
};
const AppRouteWithChildren = AppRoute._addFileChildren(AppRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  AppRoute: AppRouteWithChildren,
  AuthRoute
};
const routeTree = Route$p._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router;
};
export {
  getRouter
};
