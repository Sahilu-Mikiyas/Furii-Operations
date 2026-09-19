import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useInvoices } from "@/hooks/useInvoices";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ShieldCheck, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function ClientFinancialsPage() {
  const { currentClient, currency, setCurrency, role } = useAuth();

  // Strict role guard: only client_owner can view financials
  if (role !== "client_owner") {
    return <Navigate to="/portal/overview" replace />;
  }

  const { invoices, isLoading } = useInvoices(currentClient?.id);

  const totalPaid = invoices
    .filter((i) => i.status === "paid")
    .reduce((acc, i) => acc + Number(i.total || i.amount || 0), 0);

  const totalBalance = invoices
    .filter((i) => i.status === "sent" || i.status === "partially_paid")
    .reduce(
      (acc, i) =>
        acc + (Number(i.total || i.amount || 0) - Number(i.amount_paid || 0)),
      0
    );

  const totalContract = totalPaid + totalBalance;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Financial Statement & Invoicing"
        description="Formal accounting of project invoices, milestone deposits, and remaining balances."
        actions={
          <div className="flex items-center gap-2 bg-card p-1 rounded-xl border border-border shadow-2xs">
            <button
              onClick={() => setCurrency("ETB")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                currency === "ETB"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ETB
            </button>
            <button
              onClick={() => setCurrency("USD")}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                currency === "USD"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              USD
            </button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-2">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase font-mono">
            Total Retainer Commitment
          </span>
          <p className="text-2xl font-bold font-mono text-foreground">
            {formatCurrency(totalContract, currency)}
          </p>
          <span className="text-[11px] text-muted-foreground">Combined Active Milestones</span>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-2xs space-y-2">
          <span className="text-[10px] font-semibold text-emerald-800 uppercase font-mono">
            Paid to Date
          </span>
          <p className="text-2xl font-bold font-mono text-emerald-950">
            {formatCurrency(totalPaid, currency)}
          </p>
          <span className="text-[11px] text-emerald-700">Verified Wire / Deposits</span>
        </div>

        <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-2xs space-y-2">
          <span className="text-[10px] font-semibold text-amber-800 uppercase font-mono">
            Remaining Balance
          </span>
          <p className="text-2xl font-bold font-mono text-amber-950">
            {formatCurrency(totalBalance, currency)}
          </p>
          <span className="text-[11px] text-amber-700">Due upon Final Sign-Off</span>
        </div>
      </div>

      {/* Invoices List */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-4">
        <h2 className="text-base font-bold text-foreground">Issued Invoices</h2>

        {isLoading ? (
          <div className="p-8 flex justify-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {invoices.map((inv) => {
              const amount = Number(inv.total || inv.amount || 0);

              return (
                <div
                  key={inv.id}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-foreground">
                        {inv.invoice_number}
                      </span>
                      <StatusBadge status={inv.status} />
                    </div>
                    <p className="text-xs font-medium text-foreground">{inv.title}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      Due: {formatDate(inv.due_date)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold font-mono text-foreground">
                      {formatCurrency(amount, currency)}
                    </p>
                    {inv.amount_paid > 0 && inv.status !== "paid" && (
                      <span className="text-[10px] text-emerald-600 font-mono">
                        Paid: {formatCurrency(inv.amount_paid, currency)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
