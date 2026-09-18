import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQuery, b as useQueryClient, a as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as useWorkspace, u as useServerFn } from "./createSsrRpc-BN6DI1sa.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { L as Label } from "./label-C8WJLhmR.mjs";
import { T as Textarea } from "./textarea-F69quoCd.mjs";
import { e as deleteNestingFund, f as upsertNestingFund, g as listFundTransactions, h as addFundTransaction, i as deleteFundTransaction, j as listNestingFunds } from "./operations.functions-BJJ4r6Fq.mjs";
import "../_libs/seroval.mjs";
import { n as Wallet, d as Plus, a6 as TrendingUp, L as LoaderCircle, f as Calendar, v as Pencil, t as Trash2, aj as CircleArrowUp, X } from "../_libs/lucide-react.mjs";
import { f as format, p as parseISO } from "../_libs/date-fns.mjs";
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
const FUND_EMOJIS = ["🏠", "✈️", "💍", "🎉", "🎓", "🚗", "🌴", "💑", "🎁", "💰", "🏕️", "🛋️"];
function FinancesPage() {
  const {
    current
  } = useWorkspace();
  const [fundDialogOpen, setFundDialogOpen] = reactExports.useState(false);
  const [editingFund, setEditingFund] = reactExports.useState(null);
  const [selectedFund, setSelectedFund] = reactExports.useState(null);
  const fetchFunds = useServerFn(listNestingFunds);
  const workspaceId = current?.id;
  const fundsQuery = useQuery({
    queryKey: ["nesting-funds", workspaceId],
    queryFn: () => fetchFunds({
      data: {
        workspace_id: workspaceId
      }
    }),
    enabled: !!workspaceId
  });
  if (!current) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-sm text-muted-foreground", children: "Pick a workspace to begin." });
  const funds = fundsQuery.data?.funds ?? [];
  const totalSaved = funds.reduce((s, f) => s + parseFloat(f.current_amount), 0);
  const totalTarget = funds.reduce((s, f) => s + parseFloat(f.target_amount), 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-5xl px-6 py-10 space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-end justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-serif text-3xl flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-7 w-7 text-primary" }),
          " Nesting Finances"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Save together for what matters — vacations, moving in, anniversaries, and more." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
        setEditingFund(null);
        setFundDialogOpen(true);
      }, className: "rounded-xl gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " New Fund"
      ] })
    ] }),
    funds.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-4 shadow-[var(--shadow-soft)] space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-3.5 w-3.5 text-primary" }),
          " Total Saved"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-serif text-2xl font-medium text-primary", children: [
          "$",
          totalSaved.toLocaleString("en", {
            minimumFractionDigits: 2
          })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-4 shadow-[var(--shadow-soft)] space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-3.5 w-3.5 text-amber-500" }),
          " Total Target"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-serif text-2xl font-medium", children: [
          "$",
          totalTarget.toLocaleString("en", {
            minimumFractionDigits: 2
          })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-4 shadow-[var(--shadow-soft)] col-span-2 sm:col-span-1 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Overall Progress" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2.5 w-full bg-accent rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-primary rounded-full transition-all", style: {
          width: `${Math.min(100, totalTarget > 0 ? totalSaved / totalTarget * 100 : 0).toFixed(1)}%`
        } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-right text-muted-foreground font-medium", children: [
          totalTarget > 0 ? (totalSaved / totalTarget * 100).toFixed(1) : 0,
          "%"
        ] })
      ] })
    ] }),
    fundsQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
      " Loading…"
    ] }) : funds.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-dashed bg-card p-14 text-center text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "mx-auto h-10 w-10 text-muted-foreground/40 mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No savings funds yet." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1", children: "Create a fund for your next big adventure together." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2", children: funds.map((fund) => /* @__PURE__ */ jsxRuntimeExports.jsx(FundCard, { fund, workspaceId, queryKey: ["nesting-funds", workspaceId], onEdit: () => {
      setEditingFund(fund);
      setFundDialogOpen(true);
    }, onOpen: () => setSelectedFund(fund) }, fund.id)) }),
    fundDialogOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(FundDialog, { workspaceId: current.id, initial: editingFund, onClose: () => setFundDialogOpen(false), queryKey: ["nesting-funds", current.id] }),
    selectedFund && /* @__PURE__ */ jsxRuntimeExports.jsx(TransactionPanel, { fund: selectedFund, workspaceId: current.id, onClose: () => setSelectedFund(null), fundsQueryKey: ["nesting-funds", current.id] })
  ] });
}
function FundCard({
  fund,
  workspaceId,
  queryKey,
  onEdit,
  onOpen
}) {
  const qc = useQueryClient();
  const deleteFund = useServerFn(deleteNestingFund);
  const target = parseFloat(fund.target_amount);
  const current = parseFloat(fund.current_amount);
  const pct = target > 0 ? Math.min(100, current / target * 100) : 0;
  const isComplete = pct >= 100;
  const remove = useMutation({
    mutationFn: () => deleteFund({
      data: {
        id: fund.id
      }
    }),
    onSuccess: () => {
      toast.success("Fund removed");
      qc.invalidateQueries({
        queryKey
      });
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group rounded-2xl border bg-card shadow-[var(--shadow-soft)] p-5 flex flex-col gap-4 hover:shadow-md transition", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-3xl", children: fund.emoji }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-serif text-lg leading-tight", children: fund.title }),
          fund.deadline && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1 mt-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3 w-3" }),
            " Goal by ",
            format(parseISO(fund.deadline), "MMM d, yyyy")
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 opacity-0 group-hover:opacity-100", onClick: onEdit, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5 text-muted-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-7 w-7 opacity-0 group-hover:opacity-100", onClick: () => remove.mutate(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-muted-foreground hover:text-destructive" }) })
      ] })
    ] }),
    fund.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground leading-relaxed -mt-2", children: fund.description }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary", children: [
          "$",
          current.toLocaleString("en", {
            minimumFractionDigits: 2
          })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
          "of $",
          target.toLocaleString("en", {
            minimumFractionDigits: 2
          })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2.5 w-full bg-accent rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-full rounded-full transition-all duration-700 ${isComplete ? "bg-emerald-500" : "bg-primary"}`, style: {
        width: `${pct.toFixed(1)}%`
      } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: isComplete ? "🎉 Goal reached!" : `${pct.toFixed(1)}% saved` }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "$",
          Math.max(0, target - current).toLocaleString("en", {
            minimumFractionDigits: 2
          }),
          " to go"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onOpen, className: "w-full rounded-xl border border-dashed py-2 text-xs text-muted-foreground hover:text-primary hover:border-primary transition flex items-center justify-center gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleArrowUp, { className: "h-3.5 w-3.5" }),
      " Add Contribution / View History"
    ] })
  ] });
}
function TransactionPanel({
  fund,
  workspaceId,
  onClose,
  fundsQueryKey
}) {
  const qc = useQueryClient();
  const fetchTxns = useServerFn(listFundTransactions);
  const addTxn = useServerFn(addFundTransaction);
  const deleteTxn = useServerFn(deleteFundTransaction);
  const [amount, setAmount] = reactExports.useState("");
  const [note, setNote] = reactExports.useState("");
  const [addingTxn, setAddingTxn] = reactExports.useState(false);
  const txnQuery = useQuery({
    queryKey: ["fund-transactions", fund.id],
    queryFn: () => fetchTxns({
      data: {
        fund_id: fund.id
      }
    })
  });
  const txns = txnQuery.data?.transactions ?? [];
  const contribute = useMutation({
    mutationFn: () => addTxn({
      data: {
        fund_id: fund.id,
        amount: parseFloat(amount),
        note: note.trim() || null
      }
    }),
    onSuccess: () => {
      setAmount("");
      setNote("");
      setAddingTxn(false);
      qc.invalidateQueries({
        queryKey: ["fund-transactions", fund.id]
      });
      qc.invalidateQueries({
        queryKey: fundsQueryKey
      });
      toast.success("Contribution added! 💰");
    },
    onError: (e) => toast.error(e.message)
  });
  const remove = useMutation({
    mutationFn: (txn) => deleteTxn({
      data: {
        id: txn.id,
        fund_id: fund.id,
        amount: parseFloat(txn.amount)
      }
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["fund-transactions", fund.id]
      });
      qc.invalidateQueries({
        queryKey: fundsQueryKey
      });
      toast.success("Transaction removed");
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-[2px]", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm h-full bg-card border-l shadow-2xl flex flex-col", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky top-0 bg-card/95 backdrop-blur border-b px-6 py-5 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-serif text-xl flex items-center gap-2", children: [
          fund.emoji,
          " ",
          fund.title
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
          "$",
          parseFloat(fund.current_amount).toLocaleString("en", {
            minimumFractionDigits: 2
          }),
          " saved"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-4 border-b space-y-2", children: !addingTxn ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "w-full rounded-xl gap-1.5", onClick: () => setAddingTxn(true), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleArrowUp, { className: "h-4 w-4" }),
      " Add Contribution"
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { autoFocus: true, type: "number", step: "0.01", min: "0", placeholder: "Amount ($)", value: amount, onChange: (e) => setAmount(e.target.value), className: "h-9 text-sm" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Note (optional)", value: note, onChange: (e) => setNote(e.target.value), className: "h-9 text-sm" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", className: "flex-1 rounded-lg", onClick: () => {
          if (parseFloat(amount) > 0) contribute.mutate();
        }, disabled: !amount || parseFloat(amount) <= 0 || contribute.isPending, children: contribute.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Save" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "rounded-lg", onClick: () => {
          setAddingTxn(false);
          setAmount("");
          setNote("");
        }, children: "Cancel" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto px-6 py-4 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3", children: "Transaction History" }),
      txnQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }),
        " Loading…"
      ] }) : txns.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleArrowUp, { className: "mx-auto h-7 w-7 mb-2 text-muted-foreground/40" }),
        "No contributions yet."
      ] }) : txns.map((txn) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex items-center gap-3 rounded-xl border bg-card p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleArrowUp, { className: "h-4 w-4 text-emerald-500 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-emerald-600", children: [
            "+$",
            parseFloat(txn.amount).toFixed(2)
          ] }),
          txn.note && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground truncate", children: txn.note }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: format(new Date(txn.transacted_at), "MMM d, yyyy · h:mm a") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0", onClick: () => remove.mutate(txn), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5 text-muted-foreground hover:text-destructive" }) })
      ] }, txn.id))
    ] })
  ] }) });
}
function FundDialog({
  initial,
  workspaceId,
  onClose,
  queryKey
}) {
  const qc = useQueryClient();
  const upsert = useServerFn(upsertNestingFund);
  const [title, setTitle] = reactExports.useState(initial?.title ?? "");
  const [description, setDescription] = reactExports.useState(initial?.description ?? "");
  const [emoji, setEmoji] = reactExports.useState(initial?.emoji ?? "🏠");
  const [target, setTarget] = reactExports.useState(initial?.target_amount ? String(initial.target_amount) : "");
  const [current, setCurrent] = reactExports.useState(initial?.current_amount ? String(initial.current_amount) : "0");
  const [deadline, setDeadline] = reactExports.useState(initial?.deadline ?? "");
  const [busy, setBusy] = reactExports.useState(false);
  async function save(e) {
    e.preventDefault();
    if (!title.trim() || !target) return;
    setBusy(true);
    try {
      await upsert({
        data: {
          workspace_id: workspaceId,
          id: initial?.id,
          title: title.trim(),
          description: description.trim() || null,
          emoji,
          target_amount: parseFloat(target),
          current_amount: parseFloat(current || "0"),
          deadline: deadline || null
        }
      });
      toast.success(initial ? "Fund updated" : "Fund created! 💰");
      qc.invalidateQueries({
        queryKey
      });
      onClose();
    } catch (err) {
      toast.error(err.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/30 backdrop-blur-[2px] p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: save, className: "w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-serif text-2xl", children: initial ? "Edit Fund" : "New Savings Fund" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "icon", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Pick an Emoji" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: FUND_EMOJIS.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setEmoji(e), className: `text-xl w-9 h-9 rounded-lg border transition ${emoji === e ? "border-primary bg-primary/10 ring-2 ring-primary/20" : "hover:bg-accent"}`, children: e }, e)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fund Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, autoFocus: true, value: title, onChange: (e) => setTitle(e.target.value), placeholder: "e.g. Anniversary Trip to Paris" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Target Amount ($)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, type: "number", step: "0.01", min: "0", value: target, onChange: (e) => setTarget(e.target.value), placeholder: "5000.00" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Already Saved ($)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", min: "0", value: current, onChange: (e) => setCurrent(e.target.value), placeholder: "0.00" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Target Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "date", className: "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm", value: deadline, onChange: (e) => setDeadline(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: description, onChange: (e) => setDescription(e.target.value), placeholder: "What are you saving for?" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2 border-t", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: busy || !title.trim() || !target, className: "rounded-xl", children: [
        busy && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
        initial ? "Save Changes" : "Create Fund"
      ] })
    ] })
  ] }) });
}
export {
  FinancesPage as component
};
