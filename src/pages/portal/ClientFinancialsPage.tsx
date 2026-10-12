import { useState, useMemo } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useFinancialSummary } from "@/hooks/useFinancialSummary";
import { PageHeader } from "@/components/shared/PageHeader";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ShieldCheck,
  Loader2,
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  Layers,
  DollarSign,
  Plus,
  Download,
} from "lucide-react";
import { motion } from "framer-motion";
import { ReceiptInvoiceModal } from "@/components/shared/ReceiptInvoiceModal";
import type { ReceiptPdfData } from "@/lib/invoicePdfGenerator";

export function ClientFinancialsPage() {
  const navigate = useNavigate();
  const { currentClient, currency, setCurrency, role } = useAuth();

  // Strict role guard: only client roles can view financials
  const isClientRole =
    role === "client" || role === "client_owner" || role === "client_member";

  if (!isClientRole) {
    return <Navigate to="/portal/overview" replace />;
  }

  const clientId = currentClient?.id;

  // Unified Financial Data
  const {
    paidItems,
    outstandingItems,
    allLedgerItems,
    totalPaid,
    totalOutstanding,
    totalCommitment,
    isLoading,
  } = useFinancialSummary(clientId);

  const [filter, setFilter] = useState<"all" | "paid" | "outstanding">("all");

  // Receipt Modal State
  const [selectedReceiptData, setSelectedReceiptData] = useState<ReceiptPdfData | null>(null);
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Exchange rate helper: 1 USD ≈ 145 ETB standard benchmark
  const ETB_TO_USD_BENCHMARK = 145;
  const toDisplayAmount = (amountInETB: number) => {
    if (currency === "USD") {
      return Math.round((amountInETB / ETB_TO_USD_BENCHMARK) * 100) / 100;
    }
    return amountInETB;
  };

  const filteredItems = useMemo(() => {
    if (filter === "paid") return paidItems;
    if (filter === "outstanding") return outstandingItems;
    return allLedgerItems;
  }, [filter, paidItems, outstandingItems, allLedgerItems]);

  const handleOpenReceipt = (item: any) => {
    const rawReq = item.rawRequest;
    const rawInv = item.rawInvoice;
    const rawProj = item.rawProject;
    const rawPay = item.rawPayment;

    const receiptNum = rawPay
      ? `FURII-PAY-${rawPay.id.slice(0, 8).toUpperCase()}`
      : rawReq
      ? `FURII-REC-${rawReq.id.slice(0, 8).toUpperCase()}`
      : rawInv
      ? `FURII-${rawInv.invoice_number}`
      : `FURII-REC-${item.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase()}`;

    let receiptItems = [
      {
        description: item.title,
        category: item.type,
        quantity: 1,
        unitPrice: item.amount,
        total: item.amount,
      },
    ];

    if (rawReq?.catalog_items && Array.isArray(rawReq.catalog_items) && rawReq.catalog_items.length > 0) {
      receiptItems = rawReq.catalog_items.map((catItem: any) => ({
        description: catItem.name || catItem.title || catItem.description || "Scope Deliverable",
        category: catItem.category || item.type,
        quantity: 1,
        unitPrice: Number(catItem.price || catItem.cost || item.amount / rawReq.catalog_items.length),
        total: Number(catItem.price || catItem.cost || item.amount / rawReq.catalog_items.length),
      }));
    } else if (!rawPay && rawInv?.items && Array.isArray(rawInv.items) && rawInv.items.length > 0) {
      receiptItems = rawInv.items.map((invItem: any) => ({
        description: invItem.description || "Invoice Item",
        category: "Deliverable",
        quantity: Number(invItem.quantity || 1),
        unitPrice: Number(invItem.unit_price || 0),
        total: Number(invItem.total || 0),
      }));
    }

    const data: ReceiptPdfData = {
      receiptNumber: receiptNum,
      issueDate: formatDate(item.date),
      approvalDate: formatDate(item.date),
      client: {
        name: currentClient?.name || "Client Partner",
        company: currentClient?.company || currentClient?.name || "Client Organization",
        email: currentClient?.email || undefined,
        phone: currentClient?.phone || undefined,
      },
      projectTitle: item.title,
      serviceType: item.type,
      description: rawPay?.notes || rawReq?.description || rawProj?.description || "Authorized engagement stream with Furii Operations.",
      items: receiptItems,
      currency: "ETB",
      subtotal: item.amount,
      totalAmount: item.amount,
      amountPaid: item.amount,
      paymentMethod: rawPay
        ? rawPay.method.replace("_", " ").toUpperCase()
        : rawReq?.payment_notes?.toLowerCase().includes("telebirr")
        ? "Telebirr Electronic Money"
        : rawReq?.payment_notes?.toLowerCase().includes("cbe")
        ? "CBE Birr / Commercial Bank of Ethiopia"
        : "Bank Wire Transfer",
      paymentReference: rawPay?.reference || rawReq?.payment_notes || `TX-${receiptNum}`,
      paymentDate: formatDate(item.date),
      verifiedBy: "Furii Operations & Finance",
    };

    setSelectedReceiptData(data);
    setSelectedReceiptUrl(item.receipt_url || null);
    setIsReceiptModalOpen(true);
  };

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
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Retainer Commitment */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-2">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase font-mono tracking-wider">
            Total Retainer Commitment
          </span>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
            {formatCurrency(toDisplayAmount(totalCommitment), currency)}
          </p>
          <span className="text-[11px] text-muted-foreground block">
            Combined Active & Requested Streams
          </span>
        </div>

        {/* Paid to Date */}
        <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 shadow-2xs space-y-2">
          <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-400 uppercase font-mono tracking-wider">
            Paid to Date
          </span>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-emerald-950 dark:text-emerald-300">
            {formatCurrency(toDisplayAmount(totalPaid), currency)}
          </p>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 block">
            Verified Wire / Approved Receipts
          </span>
        </div>

        {/* Remaining Balance / Outstanding */}
        <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 shadow-2xs space-y-2">
          <span className="text-[10px] font-semibold text-amber-800 dark:text-amber-400 uppercase font-mono tracking-wider">
            Remaining Balance
          </span>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-amber-950 dark:text-amber-300">
            {formatCurrency(toDisplayAmount(totalOutstanding), currency)}
          </p>
          <span className="text-[11px] text-amber-700 dark:text-amber-400 block">
            {totalOutstanding > 0 ? "Pending Clearance & Verification" : "All Services Cleared"}
          </span>
        </div>
      </div>

      {/* Ledger & Invoices Section */}
      <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-foreground">
              Issued Invoices & Services Statements
            </h2>
            <p className="text-xs text-muted-foreground">
              Formal accounting ledger of all approved service streams, verified receipts, and pending requirements.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-xl border border-border text-xs w-fit">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filter === "all"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({allLedgerItems.length})
            </button>
            <button
              onClick={() => setFilter("paid")}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filter === "paid"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Paid & Verified ({paidItems.length})
            </button>
            <button
              onClick={() => setFilter("outstanding")}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filter === "outstanding"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Outstanding ({outstandingItems.length})
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-secondary/20 rounded-xl border border-border space-y-3">
            <Receipt className="w-8 h-8 text-muted-foreground mx-auto" />
            <h3 className="text-sm font-bold text-foreground">No Financial Statements Recorded</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              When you commission packages or request services from the catalog, formal invoices and cleared receipts will appear here.
            </p>
            <button
              onClick={() => navigate("/portal/catalog")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer mt-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Browse Catalog
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredItems.map((item) => {
              const isPaid = item.status === "paid";
              const isReview = item.status === "payment_review";
              const isPending = item.status === "pending";

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-card border border-border hover:border-border/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-secondary text-muted-foreground font-semibold border border-border/70">
                        {item.type}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          isPaid
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            : isReview
                            ? "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                        }`}
                      >
                        {isPaid
                          ? "Paid & Cleared"
                          : isReview
                          ? "Receipt Under Review"
                          : "Awaiting Payment Clearance"}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {formatDate(item.date)}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-foreground truncate">{item.title}</h4>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/70">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                        {isPaid ? "Settled Amount" : "Outstanding Balance"}
                      </span>
                      <span className="text-base font-bold font-mono text-foreground">
                        {formatCurrency(toDisplayAmount(item.amount), currency)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.receipt_url && (
                        <a
                          href={item.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>Receipt</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      {isPending && (
                        <button
                          onClick={() =>
                            navigate(`/portal/payment?requestId=${(item as any).requestId}`)
                          }
                          className="px-3 py-1 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                        >
                          <Receipt className="w-3 h-3" />
                          <span>Pay Now</span>
                        </button>
                      )}

                      {isPaid && (
                        <>
                          <button
                            onClick={() => handleOpenReceipt(item)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="View and download official receipt / settled invoice"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Official Receipt</span>
                          </button>

                          <button
                            onClick={() => navigate("/portal/services?tab=ongoing")}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <span>View Service</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
export default ClientFinancialsPage;
