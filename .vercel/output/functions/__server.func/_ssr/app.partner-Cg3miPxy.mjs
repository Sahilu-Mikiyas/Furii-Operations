import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { b as useQueryClient, u as useQuery, a as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as useWorkspace, u as useServerFn } from "./createSsrRpc-BN6DI1sa.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { L as Label } from "./label-C8WJLhmR.mjs";
import { T as Textarea } from "./textarea-F69quoCd.mjs";
import { g as getPartnerProfile, u as upsertPartnerProfile, l as listImportantPeople, a as upsertImportantPerson, d as deleteImportantPerson } from "./partner.functions-BTg-hrwm.mjs";
import { s as signAttachmentUrl, u as uploadAttachment } from "./storage.functions-mIyZeip5.mjs";
import "../_libs/seroval.mjs";
import { b as User, L as LoaderCircle, a3 as Upload, d as Plus, t as Trash2 } from "../_libs/lucide-react.mjs";
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
const LOVE_LANGUAGES = ["Words of Affirmation", "Acts of Service", "Receiving Gifts", "Quality Time", "Physical Touch"];
function PartnerPage() {
  const {
    current
  } = useWorkspace();
  if (!current) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-sm text-muted-foreground", children: "Pick a workspace to begin." });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-4xl space-y-8 px-6 py-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-serif text-3xl", children: "Partner Hub" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Everything that helps you be more thoughtful. Lives inside",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: current.name }),
        "."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileEditor, { workspaceId: current.id }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ImportantPeople, { workspaceId: current.id })
  ] });
}
function Section({
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
const toKV = (o) => Object.entries(o ?? {}).map(([key, value]) => ({
  key,
  value
}));
const fromKV = (kv) => Object.fromEntries(kv.filter((r) => r.key.trim()).map((r) => [r.key.trim(), r.value]));
function KvEditor({
  rows,
  setRows,
  placeholderKey
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    rows.map((row, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: row.key, placeholder: placeholderKey, onChange: (e) => setRows(rows.map((r, j) => i === j ? {
        ...r,
        key: e.target.value
      } : r)), className: "w-40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: row.value, onChange: (e) => setRows(rows.map((r, j) => i === j ? {
        ...r,
        value: e.target.value
      } : r)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "icon", onClick: () => setRows(rows.filter((_, j) => j !== i)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
    ] }, i)),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", size: "sm", onClick: () => setRows([...rows, {
      key: "",
      value: ""
    }]), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-3 w-3" }),
      " Add"
    ] })
  ] });
}
function ListEditor({
  items,
  setItems,
  placeholder
}) {
  const [draft, setDraft] = reactExports.useState("");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: items.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs text-accent-foreground", children: [
      t,
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setItems(items.filter((_, j) => j !== i)), className: "opacity-60 hover:opacity-100", children: "×" })
    ] }, i)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: draft, placeholder, onChange: (e) => setDraft(e.target.value), onKeyDown: (e) => {
        if (e.key === "Enter" && draft.trim()) {
          e.preventDefault();
          setItems([...items, draft.trim()]);
          setDraft("");
        }
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => {
        if (draft.trim()) {
          setItems([...items, draft.trim()]);
          setDraft("");
        }
      }, children: "Add" })
    ] })
  ] });
}
function ProfileEditor({
  workspaceId
}) {
  const fetchProfile = useServerFn(getPartnerProfile);
  const upsert = useServerFn(upsertPartnerProfile);
  const sign = useServerFn(signAttachmentUrl);
  const upload = useServerFn(uploadAttachment);
  const qc = useQueryClient();
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["partner-profile", workspaceId],
    queryFn: () => fetchProfile({
      data: {
        workspace_id: workspaceId
      }
    })
  });
  const [form, setForm] = reactExports.useState({
    display_name: "",
    nickname: "",
    birthdate: "",
    anniversary_date: "",
    avatar_url: "",
    love_language: "",
    notes: ""
  });
  const [sizes, setSizes] = reactExports.useState([]);
  const [favorites, setFavorites] = reactExports.useState([]);
  const [personality, setPersonality] = reactExports.useState([]);
  const [likes, setLikes] = reactExports.useState([]);
  const [dislikes, setDislikes] = reactExports.useState([]);
  const [avatarUrl, setAvatarUrl] = reactExports.useState(null);
  const [uploading, setUploading] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const p = data?.profile;
    if (!p) return;
    setForm({
      display_name: p.display_name ?? "",
      nickname: p.nickname ?? "",
      birthdate: p.birthdate ?? "",
      anniversary_date: p.anniversary_date ?? "",
      avatar_url: p.avatar_url ?? "",
      love_language: p.love_language ?? "",
      notes: p.notes ?? ""
    });
    setSizes(toKV(p.clothing_sizes));
    setFavorites(toKV(p.favorites));
    setPersonality(toKV(p.personality));
    setLikes(Array.isArray(p.likes) ? p.likes : []);
    setDislikes(Array.isArray(p.dislikes) ? p.dislikes : []);
  }, [data?.profile]);
  reactExports.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (form.avatar_url) {
        try {
          const {
            url
          } = await sign({
            data: {
              path: form.avatar_url
            }
          });
          if (!cancelled) setAvatarUrl(url);
        } catch {
        }
      } else setAvatarUrl(null);
    })();
    return () => {
      cancelled = true;
    };
  }, [form.avatar_url, sign]);
  const save = useMutation({
    mutationFn: () => upsert({
      data: {
        workspace_id: workspaceId,
        id: data?.profile?.id,
        ...form,
        birthdate: form.birthdate || null,
        anniversary_date: form.anniversary_date || null,
        avatar_url: form.avatar_url || null,
        clothing_sizes: fromKV(sizes),
        favorites: fromKV(favorites),
        personality: fromKV(personality),
        likes,
        dislikes
      }
    }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({
        queryKey: ["partner-profile", workspaceId]
      });
    },
    onError: (e) => toast.error(e.message ?? "Failed")
  });
  async function handleAvatar(file) {
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image must be under 4 MB");
      return;
    }
    setUploading(true);
    try {
      const buf = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      const {
        path
      } = await upload({
        data: {
          workspace_id: workspaceId,
          folder: "avatars",
          filename: file.name,
          content_type: file.type || "image/png",
          base64
        }
      });
      setForm((f) => ({
        ...f,
        avatar_url: path
      }));
      toast.success("Photo ready — don't forget to Save.");
    } catch (e) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Profile", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Loading…" }) });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Profile", description: "Who you're being thoughtful for.", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "space-y-6", onSubmit: (e) => {
    e.preventDefault();
    save.mutate();
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-20 w-20 place-items-center overflow-hidden rounded-2xl bg-accent text-primary", children: avatarUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: avatarUrl, alt: "", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-8 w-8" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "cursor-pointer", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*", hidden: true, onChange: (e) => e.target.files?.[0] && handleAvatar(e.target.files[0]) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 rounded-xl border bg-background px-3 py-2 text-sm hover:bg-accent", children: [
          uploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4" }),
          uploading ? "Uploading…" : "Upload photo"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Name", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.display_name, onChange: (e) => setForm({
        ...form,
        display_name: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Nickname", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.nickname, onChange: (e) => setForm({
        ...form,
        nickname: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Birthdate", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.birthdate ?? "", onChange: (e) => setForm({
        ...form,
        birthdate: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Anniversary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.anniversary_date ?? "", onChange: (e) => setForm({
        ...form,
        anniversary_date: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Love language", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm", value: form.love_language ?? "", onChange: (e) => setForm({
        ...form,
        love_language: e.target.value
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "—" }),
        LOVE_LANGUAGES.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: l, children: l }, l))
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Clothing sizes", hint: "e.g. tops M, shoes 9, ring 6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(KvEditor, { rows: sizes, setRows: setSizes, placeholderKey: "tops" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Favorites", hint: "food, drink, color, flowers…", children: /* @__PURE__ */ jsxRuntimeExports.jsx(KvEditor, { rows: favorites, setRows: setFavorites, placeholderKey: "coffee" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Personality", hint: "mbti, traits, communication style…", children: /* @__PURE__ */ jsxRuntimeExports.jsx(KvEditor, { rows: personality, setRows: setPersonality, placeholderKey: "mbti" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Likes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ListEditor, { items: likes, setItems: setLikes, placeholder: "add and press enter" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Dislikes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ListEditor, { items: dislikes, setItems: setDislikes, placeholder: "add and press enter" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Notes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 4, value: form.notes ?? "", onChange: (e) => setForm({
      ...form,
      notes: e.target.value
    }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: save.isPending, className: "rounded-xl", children: [
      save.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
      " Save profile"
    ] })
  ] }) });
}
function Field({
  label,
  hint,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: label }),
    children,
    hint && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground/70", children: hint })
  ] });
}
function ImportantPeople({
  workspaceId
}) {
  const fetch = useServerFn(listImportantPeople);
  const upsert = useServerFn(upsertImportantPerson);
  const del = useServerFn(deleteImportantPerson);
  const qc = useQueryClient();
  const {
    data
  } = useQuery({
    queryKey: ["important-people", workspaceId],
    queryFn: () => fetch({
      data: {
        workspace_id: workspaceId
      }
    })
  });
  const [draft, setDraft] = reactExports.useState({
    name: "",
    relationship: "",
    birthdate: "",
    notes: ""
  });
  const add = useMutation({
    mutationFn: () => upsert({
      data: {
        workspace_id: workspaceId,
        ...draft,
        birthdate: draft.birthdate || null
      }
    }),
    onSuccess: () => {
      toast.success("Added");
      setDraft({
        name: "",
        relationship: "",
        birthdate: "",
        notes: ""
      });
      qc.invalidateQueries({
        queryKey: ["important-people", workspaceId]
      });
    },
    onError: (e) => toast.error(e.message ?? "Failed")
  });
  const remove = useMutation({
    mutationFn: (id) => del({
      data: {
        id
      }
    }),
    onSuccess: () => qc.invalidateQueries({
      queryKey: ["important-people", workspaceId]
    })
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Important people", description: "Family, close friends, anyone whose birthdays and details matter.", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "grid gap-2 sm:grid-cols-4", onSubmit: (e) => {
      e.preventDefault();
      add.mutate();
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, placeholder: "Name", value: draft.name, onChange: (e) => setDraft({
        ...draft,
        name: e.target.value
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Relationship", value: draft.relationship, onChange: (e) => setDraft({
        ...draft,
        relationship: e.target.value
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: draft.birthdate, onChange: (e) => setDraft({
        ...draft,
        birthdate: e.target.value
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", className: "rounded-xl", disabled: add.isPending, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
        " Add"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-2", children: [
      (data?.people ?? []).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-xl border bg-muted/30 px-3 py-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium", children: [
            p.name,
            " ",
            p.relationship && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
              "· ",
              p.relationship
            ] })
          ] }),
          p.birthdate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
            "Birthday: ",
            p.birthdate
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => remove.mutate(p.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
      ] }, p.id)),
      (data?.people ?? []).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "No one added yet." })
    ] })
  ] });
}
export {
  PartnerPage as component
};
