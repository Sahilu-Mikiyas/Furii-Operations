import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useInvoices } from "@/hooks/useInvoices";
import { useProjects } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { useFinancialSummary } from "@/hooks/useFinancialSummary";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Plus,
  CheckCircle2,
  ShieldAlert,
  Loader2,
  Trash2,
  X,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { PaymentMethod, Invoice, Payment } from "@/types";
import { ReceiptInvoiceModal } from "@/components/shared/ReceiptInvoiceModal";
import type { ReceiptPdfData } from "@/lib/invoicePdfGenerator";

export function PaymentsPage() {
  const { currency, setCurrency, role, currentClient } = useAuth();
  const isManager = role === "manager" || role === "super_admin" || role === "admin";
  const targetClientId = role === "client_owner" || role === "client_member" ? currentClient?.id : undefined;

  const {
    invoices,
    payments,
    recordPayment,
    createInvoice,
    deleteInvoice,
    isRecordingPayment,
    isCreatingInvoice,
    isLoading,
  } = useInvoices(targetClientId);

  const { projects } = useProjects(targetClientId);
  const { clients } = useClients();

  // Modals state
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [recordModalInvoiceId, setRecordModalInvoiceId] = useState<string | null>(null);

  // New Invoice Form State
  const [invClientId, setInvClientId] = useState("");
  const [invProjectId, setInvProjectId] = useState("");
  const [invNumber, setInvNumber] = useState(`INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, "0")}`);
  const [invTitle, setInvTitle] = useState("");
  const [invDueDate, setInvDueDate] = useState("");
  const [invNotes, setInvNotes] = useState("");
  const [lineItems, setLineItems] = useState([
    { description: "Milestone Deliverable Execution", quantity: 1, unit_price: 50000 },
  ]);

  // Record Payment Form State
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<PaymentMethod>("bank_transfer");
  const [payRef, setPayRef] = useState("");

  // Receipt & Invoice Modal State
  const [selectedReceiptData, setSelectedReceiptData] = useState<ReceiptPdfData | null>(null);
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const handleOpenInvoicePdf = (inv: Invoice) => {
    const client = clients.find((c) => c.id === inv.client_id) || inv.client;
    const project = projects.find((p) => p.id === inv.project_id);

    const items = inv.items && inv.items.length > 0
      ? inv.items.map((it) => ({
          description: it.description,
          category: "Invoice Line Item",
          quantity: it.quantity,
          unitPrice: it.unit_price,
          total: it.total,
        }))
      : [
          {
            description: inv.title || `Invoice ${inv.invoice_number}`,
            category: "Deliverable",
            quantity: 1,
            unitPrice: Number(inv.total || inv.amount),
            total: Number(inv.total || inv.amount),
          },
        ];

    const data: ReceiptPdfData = {
      receiptNumber: `FURII-${inv.invoice_number}`,
      invoiceNumber: inv.invoice_number,
      issueDate: formatDate(inv.created_at),
      approvalDate: formatDate(inv.updated_at || inv.created_at),
      client: {
        name: client?.name || "Client Partner",
        company: client?.company || client?.name || "Client Organization",
        email: client?.email || undefined,
        phone: client?.phone || undefined,
      },
      projectTitle: project?.name || inv.title || `Invoice ${inv.invoice_number}`,
      serviceType: "Commercial Engagement",
      description: inv.notes || "Official agency tax invoice and payment record.",
      items,
      currency: (inv.currency as "ETB" | "USD") || "ETB",
      subtotal: Number(inv.subtotal || inv.total || inv.amount),
      taxAmount: Number(inv.tax_amount || 0),
      totalAmount: Number(inv.total || inv.amount),
      amountPaid: Number(inv.amount_paid || 0),
      paymentMethod: "Electronic Wire / Bank Clearance",
      paymentReference: `INV-${inv.invoice_number}`,
      paymentDate: inv.due_date ? formatDate(inv.due_date) : undefined,
      verifiedBy: "Furii Operations & Finance",
    };

    setSelectedReceiptData(data);
    setSelectedReceiptUrl(null);
    setIsReceiptModalOpen(true);
  };

  const handleOpenPaymentPdf = (pay: Payment) => {
    const client = clients.find((c) => c.id === pay.client_id) || pay.client;
    const project = projects.find((p) => p.id === pay.project_id);

    const data: ReceiptPdfData = {
      receiptNumber: `FURII-PAY-${pay.id.slice(0, 8).toUpperCase()}`,
      issueDate: formatDate(pay.payment_date),
      approvalDate: formatDate(pay.created_at),
      client: {
        name: client?.name || "Client Partner",
        company: client?.company || client?.name || "Client Organization",
        email: client?.email || undefined,
        phone: client?.phone || undefined,
      },
      projectTitle: project?.name || pay.reference || "Verified Agency Payment",
      serviceType: "Payment Settlement",
      description: pay.notes || "Verified wire transfer payment settlement.",
      items: [
        {
          description: pay.reference || `Settlement Payment #${pay.id.slice(0, 8)}`,
          category: pay.method.replace("_", " ").toUpperCase(),
          quantity: 1,
          unitPrice: Number(pay.amount),
          total: Number(pay.amount),
        },
      ],
      currency: (pay.currency as "ETB" | "USD") || "ETB",
      subtotal: Number(pay.amount),
      totalAmount: Number(pay.amount),
      amountPaid: Number(pay.amount),
      paymentMethod: pay.method.replace("_", " ").toUpperCase(),
      paymentReference: pay.reference || undefined,
      paymentDate: formatDate(pay.payment_date),
      verifiedBy: "Furii Operations & Finance",
    };

    setSelectedReceiptData(data);
    setSelectedReceiptUrl(pay.receipt_url || null);
    setIsReceiptModalOpen(true);
  };

  const {
    totalPaid,
    totalOutstanding,
    totalCommitment: totalContract,
  } = useFinancialSummary(targetClientId);

  const calculatedTotal = lineItems.reduce((acc, item) => acc + Number(item.quantity) * Number(item.unit_price), 0);

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, unit_price: 0 }]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((_, idx) => idx !== index));
  };

  const handleLineItemChange = (index: number, field: string, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetClient = invClientId || clients[0]?.id;
    if (!targetClient) {
      toast.error("Please select a target client.");
      return;
    }
    if (!invTitle.trim()) {
      toast.error("Invoice title / description is required.");
      return;
    }

    try {
      await createInvoice({
        clientId: targetClient,
        projectId: invProjectId || undefined,
        invoiceNumber: invNumber,
        title: invTitle,
        total: calculatedTotal,
        currency,
        dueDate: invDueDate || undefined,
        notes: invNotes || undefined,
        items: lineItems.map((itm) => ({
          description: itm.description || "Service Item",
          quantity: Number(itm.quantity) || 1,
          unit_price: Number(itm.unit_price) || 0,
        })),
      });

      toast.success(`Invoice ${invNumber} issued successfully.`);
      setShowCreateInvoiceModal(false);
      setInvTitle("");
      setInvNotes("");
      setInvNumber(`INV-${new Date().getFullYear()}-${String(invoices.length + 2).padStart(3, "0")}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create invoice.");
    }
  };

  const handleDeleteInvoice = async (id: string, number: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete invoice ${number}?`)) return;
    try {
      await deleteInvoice(id);
      toast.success(`Invoice ${number} deleted.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete invoice.");
    }
  };

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
            {isManager && (
              <button
                onClick={() => setShowCreateInvoiceModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Issue Invoice
              </button>
            )}
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
            <h2 className="text-base font-bold text-foreground">Invoices & Statements</h2>
            <p className="text-xs text-muted-foreground">Formal billing statements issued against project scopes.</p>
          </div>
          {isManager && (
            <button
              onClick={() => setShowCreateInvoiceModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground transition-colors border border-border cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              New Invoice
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="p-8 flex justify-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-10 text-center bg-secondary/20 rounded-xl border border-dashed border-border text-xs text-muted-foreground">
            No invoices issued yet.
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

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenInvoicePdf(inv)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors cursor-pointer flex items-center gap-1"
                        title="View and download PDF invoice / receipt"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>PDF</span>
                      </button>

                      {!isPaid && isManager && (
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

                      {isManager && (
                        <button
                          onClick={() => handleDeleteInvoice(inv.id, inv.invoice_number)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors border border-border cursor-pointer"
                          title="Delete invoice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Verified Payments Ledger */}
      {payments.length > 0 && (
        <div className="p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-600" />
            <h2 className="text-base font-bold text-foreground">Payment Records Ledger</h2>
          </div>
          <div className="divide-y divide-border/60">
            {payments.map((pay) => (
              <div key={pay.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-foreground">
                    {pay.reference || "Bank Wire Transfer"}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    {formatDate(pay.payment_date)} • Method: {pay.method.replace("_", " ")}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <span className="font-mono font-bold text-emerald-600 block">
                      +{formatCurrency(pay.amount, currency)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleOpenPaymentPdf(pay)}
                    className="p-1.5 rounded-lg border border-border bg-secondary/50 hover:bg-secondary text-foreground text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    title="Download official receipt PDF"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Receipt</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Issue Invoice Modal */}
      {showCreateInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Issue Invoice / Statement</h2>
              <button onClick={() => setShowCreateInvoiceModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateInvoice} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Target Client</label>
                  <select
                    value={invClientId}
                    onChange={(e) => setInvClientId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Associated Project</label>
                  <select
                    value={invProjectId}
                    onChange={(e) => setInvProjectId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  >
                    <option value="">General Client Retainer</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Invoice Number</label>
                  <input
                    type="text"
                    required
                    value={invNumber}
                    onChange={(e) => setInvNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground font-mono focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Due Date</label>
                  <input
                    type="date"
                    value={invDueDate}
                    onChange={(e) => setInvDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Invoice Title / Summary</label>
                <input
                  type="text"
                  required
                  value={invTitle}
                  onChange={(e) => setInvTitle(e.target.value)}
                  placeholder="e.g. Phase 1 - UX Discovery & Design Milestone"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              {/* Line Items */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">Line Items</label>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="text-xs text-primary hover:underline font-semibold"
                  >
                    + Add Item
                  </button>
                </div>

                {lineItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) => handleLineItemChange(idx, "description", e.target.value)}
                      className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                    />
                    <input
                      type="number"
                      min={1}
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(idx, "quantity", Number(e.target.value))}
                      className="w-16 px-2 py-1.5 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden text-center"
                    />
                    <input
                      type="number"
                      step="100"
                      placeholder="Price"
                      value={item.unit_price}
                      onChange={(e) => handleLineItemChange(idx, "unit_price", Number(e.target.value))}
                      className="w-28 px-2 py-1.5 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                    />
                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(idx)}
                        className="p-1.5 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}

                <div className="pt-2 text-right">
                  <span className="text-xs text-muted-foreground mr-2">Total Amount:</span>
                  <span className="text-base font-bold font-mono text-foreground">
                    {formatCurrency(calculatedTotal, currency)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Notes / Wire Instructions</label>
                <textarea
                  rows={2}
                  value={invNotes}
                  onChange={(e) => setInvNotes(e.target.value)}
                  placeholder="Payment details or terms..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateInvoiceModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg border border-border cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingInvoice}
                  className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isCreatingInvoice && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Issue Statement
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Record Payment Modal */}
      {recordModalInvoiceId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Record Verified Payment</h2>
              <button onClick={() => setRecordModalInvoiceId(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
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

      {/* Official Receipt & Settled Invoice Modal */}
      <ReceiptInvoiceModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        data={selectedReceiptData}
        originalReceiptUrl={selectedReceiptUrl}
      />
    </motion.div>
  );
}
