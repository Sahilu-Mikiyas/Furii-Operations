import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useInvoices } from "@/hooks/useInvoices";
import { useProjects } from "@/hooks/useProjects";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Download, CheckCircle2, ShieldAlert, Loader2, Receipt } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { PaymentMethod } from "@/types";

export function PaymentsPage() {
  const { currency, setCurrency, role, currentClient } = useAuth();
  const targetClientId = role === "client_owner" ? currentClient?.id : undefined;
  const { invoices, payments, recordPayment, isRecordingPayment, isLoading } = useInvoices(targetClientId);
  const { projects } = useProjects(targetClientId);

  const [recordModalInvoiceId, setRecordModalInvoiceId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<PaymentMethod>("bank_transfer");
  const [payRef, setPayRef] = useState("");

  // Role Restriction Check
  if (role === "team_member" || role === "client_member") {
    return (
      <div className="p-12 text-center bg-card rounded-2xl border border-border space-y-3 max-w-lg mx-auto my-12">
        <ShieldAlert className="w-10 h-10 text-amber-600 mx-auto" />
        <h2 className="text-base font-bold text-foreground">Financial Access Restricted</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Billing records, contract amounts, and invoice balances are restricted to executive stakeholders and authorized
          financial leads.
        </p>
      </div>
    );
  }

  const totalContract = projects.reduce((acc, p) => acc + Number(p.budget || 0), 0) || 850000;
  const totalPaid = invoices
    .filter((i) => i.status === "paid")
    .reduce((acc, i) => acc + Number(i.total || i.amount || 0), 0);
  const totalOutstanding = invoices
    .filter((i) => i.status === "sent" || i.status === "partially_paid")
    .reduce((acc, i) => acc + (Number(i.total || i.amount || 0) - Number(i.amount_paid || 0)), 0);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordModalInvoiceId || !payAmount) return;

    try {
      await recordPayment({
        invoiceId: recordModalInvoiceId,
        amount: Number(payAmount),
        method: payMethod,
        reference: payRef || "Verified Bank Transfer",
      });

      toast.success("Payment recorded and invoice balance updated.");
      setRecordModalInvoiceId(null);
      setPayAmount("");
      setPayRef("");
    } catch (err: any) {
      toast.error(err.message || "Failed to record payment.");
    }
  };

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
          <span className="text-[11px] text-muted-foreground">Combined Active Statements</span>
        </div>

        <div className="p-5 rounded-xl bg-emerald-50/70 border border-emerald-200 shadow-2xs space-y-2">
          <span className="text-xs font-semibold text-emerald-800 uppercase font-mono">
            Total Paid to Date
          </span>
          <p className="text-2xl font-bold font-mono text-emerald-950">
            {formatCurrency(totalPaid, currency)}
          </p>
          <span className="text-[11px] text-emerald-700">Verified Wire / Mobile Receipts</span>
        </div>

        <div className="p-5 rounded-xl bg-amber-50/70 border border-amber-200 shadow-2xs space-y-2">
          <span className="text-xs font-semibold text-amber-800 uppercase font-mono">
            Outstanding Balance
          </span>
          <p className="text-2xl font-bold font-mono text-amber-950">
            {formatCurrency(totalOutstanding, currency)}
          </p>
          <span className="text-[11px] text-amber-700">Due upon Milestone Delivery</span>
        </div>
      </div>

      {/* Invoices List */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-foreground">Invoices & Milestones</h2>
            <p className="text-xs text-muted-foreground">Formal statements issued against project deliverables.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 flex justify-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {invoices.map((inv) => {
              const amount = Number(inv.total || inv.amount || 0);
              const isPaid = inv.status === "paid";

              return (
                <div key={inv.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-foreground">{inv.invoice_number}</span>
                      <StatusBadge status={inv.status} />
                    </div>
                    <p className="text-xs font-medium text-foreground">{inv.title}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      Due: {formatDate(inv.due_date)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-bold font-mono text-foreground">
                        {formatCurrency(amount, currency)}
                      </p>
                      {inv.amount_paid > 0 && !isPaid && (
                        <span className="text-[10px] text-emerald-600 font-mono">
                          Paid: {formatCurrency(inv.amount_paid, currency)}
                        </span>
                      )}
                    </div>

                    {!isPaid && (role === "super_admin" || role === "admin") && (
                      <button
                        onClick={() => {
                          setRecordModalInvoiceId(inv.id);
                          setPayAmount(String(amount - Number(inv.amount_paid || 0)));
                        }}
                        className="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                      >
                        Record Payment
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {recordModalInvoiceId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-4"
          >
            <h2 className="text-base font-bold text-foreground">Record Verified Payment</h2>
            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Amount Paid ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                >
                  <option value="bank_transfer">Bank Wire Transfer (CBE / Awash / Dashen)</option>
                  <option value="mobile_money">Telebirr / Telebirr SuperApp</option>
                  <option value="cheque">Corporate Cheque</option>
                  <option value="cash">Cash Receipt</option>
                  <option value="other">International Wire (SWIFT / USD)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Bank Reference / TX ID</label>
                <input
                  type="text"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="e.g. TX-9920194827"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRecordModalInvoiceId(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg border border-border cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRecordingPayment}
                  className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isRecordingPayment && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm Payment
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
