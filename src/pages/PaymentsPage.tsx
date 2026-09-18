import { useState } from "react";
import { MOCK_INVOICES, MOCK_PAYMENTS, MOCK_PROJECTS } from "@/data/mock-data";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { Plus, Download, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function PaymentsPage() {
  const { currency, setCurrency } = useAuth();
  const [invoices] = useState(MOCK_INVOICES);
  const [payments] = useState(MOCK_PAYMENTS);

  const totalContract = MOCK_PROJECTS[0].budget || 300000;
  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((acc, i) => acc + i.total, 0);
  const totalOutstanding = invoices.filter((i) => i.status === "sent" || i.status === "partially_paid").reduce(
    (acc, i) => acc + (i.total - i.amount_paid),
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Financial Workspace"
        description="Transparent tracking of client contracts, issued invoices, verified payment records, and outstanding balances."
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-secondary/70 p-0.5 rounded-lg border border-border">
              <button
                onClick={() => setCurrency("ETB")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  currency === "ETB"
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                ETB
              </button>
              <button
                onClick={() => setCurrency("USD")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  currency === "USD"
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                USD
              </button>
            </div>

            <button
              onClick={() => toast.info("Creating invoice draft...")}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Generate Invoice
            </button>
          </div>
        }
      />

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-card border border-border/90 shadow-2xs space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase font-mono">
            Total Contract Value
          </span>
          <p className="text-2xl font-bold font-mono text-foreground">
            {formatCurrency(totalContract, currency)}
          </p>
          <span className="text-[11px] text-muted-foreground">Ersas Interiors Project 01</span>
        </div>

        <div className="p-5 rounded-xl bg-emerald-50/70 border border-emerald-200 shadow-2xs space-y-2">
          <span className="text-xs font-semibold text-emerald-800 uppercase font-mono">
            Total Paid to Date
          </span>
          <p className="text-2xl font-bold font-mono text-emerald-950">
            {formatCurrency(totalPaid, currency)}
          </p>
          <span className="text-[11px] text-emerald-700">Advance Wire Received</span>
        </div>

        <div className="p-5 rounded-xl bg-amber-50/70 border border-amber-200 shadow-2xs space-y-2">
          <span className="text-xs font-semibold text-amber-800 uppercase font-mono">
            Outstanding Balance
          </span>
          <p className="text-2xl font-bold font-mono text-amber-950">
            {formatCurrency(totalOutstanding, currency)}
          </p>
          <span className="text-[11px] text-amber-700">Due upon Final Milestone</span>
        </div>
      </div>

      {/* Invoices List */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono">
          Invoices & Billing Schedule
        </h3>

        <div className="divide-y divide-border/60">
          {invoices.map((inv) => (
            <div key={inv.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-foreground">{inv.invoice_number}</span>
                  <StatusBadge status={inv.status} />
                </div>
                <h4 className="text-xs font-semibold text-foreground">{inv.title}</h4>
                <p className="text-[11px] text-muted-foreground font-mono">
                  Due {formatDate(inv.due_date)} • Sent {formatDate(inv.sent_at)}
                </p>
              </div>

              <div className="flex items-center gap-5 shrink-0">
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-foreground block">
                    {formatCurrency(inv.total, inv.currency)}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Paid: {formatCurrency(inv.amount_paid, inv.currency)}
                  </span>
                </div>
                <button
                  onClick={() => toast.info(`Downloading invoice ${inv.invoice_number}...`)}
                  className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border/80 transition-colors cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Payment Records */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono">
            Transaction History & Receipts
          </h3>
          <span className="text-xs font-mono text-muted-foreground">Permanent Audit Record</span>
        </div>

        <div className="divide-y divide-border/60">
          {payments.map((p) => (
            <div key={p.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">
                    {formatCurrency(p.amount, p.currency)} received via {p.method.replace("_", " ")}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Ref: {p.reference} • Date: {formatDate(p.payment_date)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => toast.info("Opening payment receipt PDF...")}
                className="px-3 py-1 text-xs font-semibold bg-secondary hover:bg-secondary/80 border border-border rounded-lg text-foreground transition-colors cursor-pointer"
              >
                Receipt
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
