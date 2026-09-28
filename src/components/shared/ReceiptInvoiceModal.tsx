import React from "react";
import {
  Download,
  Printer,
  ExternalLink,
  X,
  CheckCircle2,
  ShieldCheck,
  Building,
  Calendar,
  CreditCard,
  FileText,
  Copy,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FuriiLogo } from "@/components/shared/FuriiLogo";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ReceiptPdfData,
  downloadReceiptPdf,
} from "@/lib/invoicePdfGenerator";
import { toast } from "sonner";

interface ReceiptInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ReceiptPdfData | null;
  originalReceiptUrl?: string | null;
}

export function ReceiptInvoiceModal({
  isOpen,
  onClose,
  data,
  originalReceiptUrl,
}: ReceiptInvoiceModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !data) return null;

  const handleDownloadPdf = () => {
    try {
      downloadReceiptPdf(data);
      toast.success("Receipt PDF generated and downloaded!");
    } catch (err: any) {
      console.error("PDF generation failed:", err);
      toast.error(`Failed to generate PDF: ${err.message}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyReceiptNumber = () => {
    navigator.clipboard.writeText(data.receiptNumber);
    setCopied(true);
    toast.success("Receipt number copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const isPaid = data.amountPaid >= data.totalAmount;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-card w-full max-w-3xl rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Action Bar (Screen Only) */}
          <div className="p-4 sm:px-6 border-b border-border bg-secondary/30 flex items-center justify-between gap-3 shrink-0 print:hidden">
            <div className="flex items-center gap-2 min-w-0">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <span className="text-xs font-mono font-bold text-foreground block truncate">
                  {data.receiptNumber}
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  Official Verification Record
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyReceiptNumber}
                className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary/50 text-xs flex items-center gap-1.5 transition-colors"
                title="Copy receipt number"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">Copy #</span>
              </button>

              {originalReceiptUrl && (
                <a
                  href={originalReceiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary/50 text-xs flex items-center gap-1.5 transition-colors"
                  title="View attached bank wire transfer slip"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Original Slip</span>
                </a>
              )}

              <button
                type="button"
                onClick={handlePrint}
                className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary/50 text-xs flex items-center gap-1.5 transition-colors"
                title="Print Receipt"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Printable Receipt Paper Container */}
          <div className="overflow-y-auto p-6 sm:p-8 space-y-6 bg-card text-card-foreground">
            {/* Top Brand Banner */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-border">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <FuriiLogo variant="horizontal" className="h-6 w-auto" />
                </div>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Creative Production • Enterprise Engineering • Brand Systems
                  <br />
                  Addis Ababa, Ethiopia • operations@furii.io
                </p>
              </div>

              <div className="sm:text-right space-y-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  {isPaid ? "Payment Verified & Settled" : "Invoice"}
                </span>
                <div className="text-base font-bold font-mono text-foreground">
                  {data.receiptNumber}
                </div>
                <div className="text-xs text-muted-foreground">
                  Issue Date: <span className="font-semibold text-foreground">{data.issueDate}</span>
                </div>
                {data.approvalDate && (
                  <div className="text-xs text-muted-foreground">
                    Verified: <span className="font-semibold text-foreground">{data.approvalDate}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bill To & Payment Method Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-secondary/20 border border-border/80">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold flex items-center gap-1">
                  <Building className="w-3 h-3 text-primary" />
                  Billed Client / Organization
                </span>
                <div className="text-sm font-bold text-foreground">
                  {data.client.company || data.client.name}
                </div>
                {data.client.company && data.client.name && data.client.company !== data.client.name && (
                  <div className="text-xs text-muted-foreground">
                    Attn: {data.client.name}
                  </div>
                )}
                {data.client.email && (
                  <div className="text-xs text-muted-foreground">
                    {data.client.email}
                  </div>
                )}
                {data.client.phone && (
                  <div className="text-xs text-muted-foreground">
                    {data.client.phone}
                  </div>
                )}
              </div>

              <div className="space-y-1 sm:text-right">
                <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold flex items-center sm:justify-end gap-1">
                  <CreditCard className="w-3 h-3 text-emerald-500" />
                  Payment Clearance Particulars
                </span>
                <div className="text-xs font-semibold text-foreground">
                  {data.paymentMethod || "Bank Wire Transfer"}
                </div>
                {data.paymentReference && (
                  <div className="text-xs font-mono text-muted-foreground">
                    Ref: {data.paymentReference}
                  </div>
                )}
                {data.paymentDate && (
                  <div className="text-xs text-muted-foreground">
                    Date Paid: {data.paymentDate}
                  </div>
                )}
                <div className="text-[11px] font-bold text-emerald-600 flex items-center sm:justify-end gap-1 pt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Authorized & Verified by Agency Operations
                </div>
              </div>
            </div>

            {/* Engagement Stream Scope */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono uppercase text-muted-foreground font-bold">
                <span>Engagement Stream</span>
                <span>{data.serviceType ? `${data.serviceType.toUpperCase()} STREAM` : "DELIVERY STREAM"}</span>
              </div>
              <div className="p-3.5 rounded-lg border border-border bg-card">
                <div className="text-sm font-bold text-foreground">{data.projectTitle}</div>
                {data.description && (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {data.description}
                  </p>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-2">
              <div className="text-xs font-mono uppercase text-muted-foreground font-bold">
                Itemized Scope & Deliverables
              </div>

              <div className="overflow-x-auto border border-border rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-secondary/40 border-b border-border text-[11px] font-mono uppercase text-muted-foreground">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      <th className="py-2.5 px-3">Scope / Deliverable</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Rate</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-secondary/10 transition-colors">
                        <td className="py-2.5 px-3 text-center font-mono text-muted-foreground">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-foreground">
                          {item.description}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">
                          <span className="px-2 py-0.5 rounded bg-secondary text-[10px] font-mono border border-border">
                            {item.category || "Execution"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-muted-foreground">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">
                          {item.unitPrice.toLocaleString()} {data.currency}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                          {item.total.toLocaleString()} {data.currency}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Totals & Verification Badge */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
              {/* Official Seal Card */}
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wide">
                  <ShieldCheck className="w-4 h-4" />
                  Official Clearance Certificate
                </div>
                <p className="text-[11px] text-emerald-950/80 dark:text-emerald-200/80 leading-relaxed">
                  Payment for this service engagement has been verified by Furii Operations. The deliverables under this agreement are fully authorized for active production and handover.
                </p>
                <div className="text-[10px] font-mono text-emerald-600/80 pt-1">
                  Verified by: {data.verifiedBy || "Agency Finance & Operations"}
                </div>
              </div>

              {/* Totals Summary */}
              <div className="space-y-2 sm:pl-6">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-mono">{data.subtotal.toLocaleString()} {data.currency}</span>
                </div>

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Tax / VAT (0% Included)</span>
                  <span className="font-mono">0.00 {data.currency}</span>
                </div>

                <div className="flex justify-between text-sm font-bold text-foreground pt-1 border-t border-border">
                  <span>Total Amount</span>
                  <span className="font-mono">{data.totalAmount.toLocaleString()} {data.currency}</span>
                </div>

                <div className="flex justify-between text-sm font-bold text-emerald-600 pt-0.5">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Amount Paid
                  </span>
                  <span className="font-mono">{data.amountPaid.toLocaleString()} {data.currency}</span>
                </div>

                <div className="flex justify-between text-xs font-semibold text-muted-foreground pt-1 border-t border-dashed border-border">
                  <span>Outstanding Balance</span>
                  <span className="font-mono text-foreground">
                    {Math.max(0, data.totalAmount - data.amountPaid).toLocaleString()} {data.currency}
                  </span>
                </div>
              </div>
            </div>

            {/* Receipt Footer */}
            <div className="pt-6 border-t border-border text-center space-y-1 text-[11px] text-muted-foreground">
              <p>
                This is an electronically generated official receipt issued by Furii Operations Ltd.
              </p>
              <p className="text-[10px]">
                Valid for tax, audit, and operational compliance.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
