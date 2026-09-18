import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { q as ArrowRight, l as Sparkles, r as CircleCheck, H as Heart, f as Calendar, G as Gift, o as Bot, A as Album, B as BookHeart, I as Inbox, g as CalendarHeart, W as WandSparkles, i as MessagesSquare, T as Target, k as Activity, N as NotebookPen, Q as Quote, s as Star } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
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
function Logo({
  small
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "flex items-center gap-2.5 group", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative grid place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-warm)] transition-transform group-hover:scale-105 ${small ? "h-8 w-8" : "h-10 w-10"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: small ? "h-3.5 w-3.5" : "h-4 w-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition lp-pulse-ring pointer-events-none" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-serif tracking-tight ${small ? "text-xl" : "text-2xl"}`, children: [
      "love",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "italic text-primary", children: "pond" })
    ] })
  ] });
}
function Landing() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "min-h-screen overflow-x-hidden text-foreground", style: {
    background: "var(--gradient-paper)"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "hidden md:flex items-center gap-7 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#feel", className: "hover:text-foreground transition", children: "The Feeling" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#modules", className: "hover:text-foreground transition", children: "Modules" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#how", className: "hover:text-foreground transition", children: "How it works" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#voices", className: "hover:text-foreground transition", children: "Voices" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", className: "rounded-xl", children: "Sign in" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", search: {
          mode: "signup"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "rounded-xl gap-1.5", children: [
          "Begin ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3.5 w-3.5" })
        ] }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative isolate", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pointer-events-none absolute inset-0 -z-10 overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-primary/30 lp-blob" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-10 right-0 h-[24rem] w-[24rem] rounded-full bg-amber-300/40 lp-blob", style: {
          animationDelay: "-6s"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 left-1/3 h-[22rem] w-[22rem] rounded-full bg-rose-200/40 lp-blob", style: {
          animationDelay: "-12s"
        } })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl px-6 pt-24 pb-20 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 rounded-full border bg-card/80 backdrop-blur px-4 py-1.5 text-xs text-muted-foreground lp-rise", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-primary" }),
          "A quiet pond for the people you love"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-7 font-serif text-[clamp(2.6rem,7vw,5.4rem)] leading-[0.98] tracking-tight lp-rise", style: {
          animationDelay: "80ms"
        }, children: [
          "Love is in the",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative inline-block", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "italic text-primary", children: "small things" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 240 18", className: "absolute -bottom-3 left-0 w-full text-primary/70", fill: "none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M2 12 C 60 2, 180 2, 238 12", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-script text-primary/80", children: " remembered." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-8 max-w-xl text-lg text-muted-foreground lp-rise", style: {
          animationDelay: "160ms"
        }, children: "Lovepond is a relationship operating system — a calm place to capture wishes, plan beautiful moments, and preserve the memories that bind you." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-9 flex flex-wrap items-center justify-center gap-3 lp-rise", style: {
          animationDelay: "240ms"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", search: {
            mode: "signup"
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "lg", className: "rounded-xl gap-2 px-6 h-12", children: [
            "Start your pond ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "lg", variant: "outline", className: "rounded-xl h-12", children: "I have an account" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-12 flex items-center justify-center gap-6 text-xs text-muted-foreground lp-rise", style: {
          animationDelay: "320ms"
        }, children: ["Solo or together", "End-to-end private", "AI-assisted", "Free to start"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5 text-primary" }),
          " ",
          t
        ] }, t)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto mt-16 max-w-4xl lp-rise", style: {
          animationDelay: "400ms"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-6 -left-6 lp-float", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(StickyNote, { color: "bg-amber-100", rotation: "-rotate-6", children: [
            "Her favourite tea →",
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-script text-base", children: "jasmine pearls" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-8 -right-4 lp-float-slow", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(StickyNote, { color: "bg-rose-100", rotation: "rotate-3", children: [
            "Anniversary in ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-serif text-lg italic", children: "12 days" }),
            " 🌸"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-6 -left-10 hidden md:block lp-float-slow", style: {
            animationDelay: "-3s"
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(StickyNote, { color: "bg-emerald-100", rotation: "-rotate-3", children: "Wants Murakami's new book" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-3xl border bg-card shadow-[var(--shadow-warm)] p-6 md:p-8 overflow-hidden lp-grain", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-3.5 w-3.5 text-primary" }),
                " Today's pond"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Tuesday, June 11" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 grid gap-4 md:grid-cols-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(MiniCard, { icon: Calendar, label: "Upcoming", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Mom's birthday" }),
                " · in 4 days",
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-0.5", children: "Dinner reservation locked in." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(MiniCard, { icon: Gift, label: "Saved idea", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Linen apron" }),
                " for Maya",
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-0.5", children: "Spotted at the weekend market." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(MiniCard, { icon: Bot, label: "Lovepond suggests", children: "A handwritten note tonight — her love language is words." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(MiniCard, { icon: Album, label: "On this day", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "One year ago" }),
                " · Kyoto rain, ramen, and you laughed until you cried."
              ] })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "feel", className: "border-y bg-card/40 py-24 px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-5xl text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-script text-3xl text-primary/80", children: "a love letter to your future self" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mt-5 font-serif text-4xl md:text-5xl leading-tight", children: [
        "We forget the little things.",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("em", { className: "text-primary", children: "Lovepond doesn't." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-6 max-w-2xl text-muted-foreground text-lg", children: "The size she wears. The book she casually mentioned. The story behind the scar on her elbow. The way he likes his coffee on Sundays. Tiny things — the language of being truly known." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "modules", className: "py-24 px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-14", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-[0.2em] text-primary font-medium", children: "A whole world, gently designed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-3 font-serif text-4xl md:text-5xl", children: "Eighteen modules. One pond." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-4 max-w-2xl text-muted-foreground", children: "Each module works on its own. Together, they become a thoughtful partner that quietly watches your back." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-5 sm:grid-cols-2 lg:grid-cols-3", children: MODULES.map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group relative rounded-3xl border bg-card p-7 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-warm)] transition-all duration-500 hover:-translate-y-1", style: {
        animationDelay: `${i * 30}ms`
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-11 w-11 place-items-center rounded-2xl bg-accent text-primary group-hover:scale-110 group-hover:rotate-6 transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(m.icon, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-5 font-serif text-2xl", children: m.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 text-sm text-muted-foreground leading-relaxed", children: m.desc })
      ] }, m.title)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "overflow-hidden border-y bg-primary/5 py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-12 whitespace-nowrap lp-marquee text-2xl font-serif text-primary/80", children: Array.from({
      length: 2
    }).flatMap((_, k) => ["Remember", "Plan", "Celebrate", "Support", "Grow", "Preserve", "Surprise", "Cherish"].map((w, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: w }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-4 w-4 text-primary" })
    ] }, `${k}-${i}`))) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "how", className: "py-28 px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl grid gap-14 lg:grid-cols-2 lg:items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-[0.2em] text-primary font-medium", children: "How it works" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mt-3 font-serif text-4xl md:text-5xl leading-tight", children: [
          "Tiny captures.",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("em", { className: "text-primary", children: "Compounding kindness." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 text-muted-foreground text-lg max-w-md", children: "Lovepond's magic isn't features — it's the years of little signals you accumulate, lovingly indexed and surfaced at the right moment." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "space-y-6", children: STEPS.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-5 rounded-2xl border bg-card p-6 shadow-[var(--shadow-soft)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground font-serif text-lg", children: i + 1 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-serif text-xl", children: s.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: s.desc })
        ] })
      ] }, s.title)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "voices", className: "py-24 px-6 bg-card/40 border-y", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center mb-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-serif text-4xl md:text-5xl", children: "For the ones who pay attention." }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-6 md:grid-cols-3", children: VOICES.map((v, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("figure", { className: "rounded-3xl border bg-card p-7 shadow-[var(--shadow-soft)] relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Quote, { className: "absolute -top-3 left-6 h-7 w-7 text-primary bg-card rounded-full p-1.5 border" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("blockquote", { className: "font-serif text-lg leading-snug", children: [
          '"',
          v.q,
          '"'
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("figcaption", { className: "mt-5 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground font-serif", children: v.name[0] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: v.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-xs", children: v.role })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-auto flex gap-0.5 text-amber-500", children: Array.from({
            length: 5
          }).map((_, k) => /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3.5 w-3.5 fill-current" }, k)) })
        ] })
      ] }, i)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative px-6 py-32 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 -z-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0", style: {
          background: "var(--gradient-warm)"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 opacity-30 mix-blend-overlay", style: {
          backgroundImage: "radial-gradient(circle at 30% 30%, white, transparent 40%), radial-gradient(circle at 70% 60%, white, transparent 50%)"
        } })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-3xl text-center text-primary-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-script text-3xl opacity-90", children: "today is a good day to start" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mt-3 font-serif text-5xl md:text-6xl leading-[1]", children: [
          "Be the partner",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "they'll write about."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-6 max-w-xl mx-auto opacity-90", children: "Five quiet minutes today is a love letter you're writing to your relationship years from now." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-9 flex items-center justify-center gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/auth", search: {
          mode: "signup"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "lg", variant: "secondary", className: "rounded-xl gap-2 h-12 px-7 text-base", children: [
          "Open your pond ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" })
        ] }) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "border-t bg-card/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { small: true }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-script text-base text-primary", children: "made with care, for the people you love." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " Lovepond"
      ] })
    ] }) })
  ] });
}
function StickyNote({
  children,
  color,
  rotation
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `${color} ${rotation} rounded-xl p-3 text-xs shadow-lg w-[160px] text-foreground/80 leading-tight border border-foreground/5`, children });
}
function MiniCard({
  icon: Icon,
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-background/70 p-4 text-left", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5 text-primary" }),
      " ",
      label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-sm leading-snug", children })
  ] });
}
const MODULES = [{
  icon: BookHeart,
  title: "Partner Hub",
  desc: "Sizes, favourites, allergies, dreams — the encyclopedia of someone you love."
}, {
  icon: Inbox,
  title: "Thoughtfulness Inbox",
  desc: "Capture a wish, a photo, a half-formed idea. AI sorts it for you."
}, {
  icon: Calendar,
  title: "Shared Calendar",
  desc: "Birthdays, anniversaries, milestones. Never miss what matters."
}, {
  icon: Album,
  title: "Memory Vault",
  desc: "Photos, places, stories. The biography of you, two."
}, {
  icon: Gift,
  title: "Gift Vault",
  desc: "Save ideas as you spot them. Plan budgets. Never repeat a gift."
}, {
  icon: CalendarHeart,
  title: "Date Space",
  desc: "AI date planner that knows your moods, weather, and budget."
}, {
  icon: WandSparkles,
  title: "Surprise Planner",
  desc: "Plot it in secret. Drop clues. Reveal at the perfect moment."
}, {
  icon: MessagesSquare,
  title: "Conversation Hub",
  desc: "Curated prompts to keep going deeper, even after years."
}, {
  icon: Target,
  title: "Goals & Bucket List",
  desc: "The dreams you're chasing, individually and together."
}, {
  icon: Activity,
  title: "Mood & Wellness",
  desc: "Quiet check-ins. Patterns over time. Care, not surveillance."
}, {
  icon: NotebookPen,
  title: "Private Journal",
  desc: "A space that stays yours, even in shared mode."
}, {
  icon: Bot,
  title: "Lovepond Assistant",
  desc: "Grounded in your data. Drafts, suggests, remembers — never invents."
}];
const STEPS = [{
  title: "Capture in seconds",
  desc: "Voice, photo, text, link — anything. The inbox catches it. The AI sorts it."
}, {
  title: "Build the picture",
  desc: "Over weeks, your Partner Hub fills with the texture of who they really are."
}, {
  title: "Lovepond does the noticing",
  desc: "Surfaces the right gift, the right date, the right memory — at the right moment."
}];
const VOICES = [{
  q: "I forgot what year we started dating. Lovepond gently reminded me — and suggested I plan something. I cried.",
  name: "Maya R.",
  role: "married 4 years"
}, {
  q: "I'm long-distance. The inbox catches every little thing I want to remember to ask her about.",
  name: "Jonah K.",
  role: "long-distance"
}, {
  q: "Even using it solo, just for my mom and best friend, has made me a more present person.",
  name: "Aria L.",
  role: "solo mode"
}];
export {
  Landing as component
};
