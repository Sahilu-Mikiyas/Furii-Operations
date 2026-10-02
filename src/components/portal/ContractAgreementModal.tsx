import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileSignature,
  X,
  ShieldCheck,
  CheckCircle2,
  FileText,
  ExternalLink,
  Calendar,
  Layers,
  Receipt,
  Loader2,
  AlertCircle,
  Download,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { BillingType, Currency } from "@/types";
import { downloadContractPdf } from "@/lib/contractPdfGenerator";

interface ContractAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceTitle: string;
  clientName?: string;
  amount: number;
  currency?: Currency;
  fileName?: string;
  billingType: BillingType;
  onBillingTypeChange: (type: BillingType) => void;
  duration: string;
  onDurationChange: (duration: string) => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export function ContractAgreementModal({
  isOpen,
  onClose,
  serviceTitle,
  clientName = "Client Partner",
  amount,
  currency = "ETB",
  fileName,
  billingType,
  onBillingTypeChange,
  duration,
  onDurationChange,
  onConfirm,
  isSubmitting = false,
}: ContractAgreementModalProps) {
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedAuthenticity, setAgreedAuthenticity] = useState(false);

  const handleDownloadDealPdf = () => {
    downloadContractPdf({
      dealNumber: `DEAL-${Date.now().toString(36).toUpperCase()}`,
      serviceTitle,
      client: {
        name: clientName,
        company: clientName,
      },
      billingType,
      duration,
      totalAmount: amount,
      currency,
      receiptFileName: fileName,
      signedDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      signerName: clientName,
    });
  };

  if (!isOpen) return null;

  const currentMonth = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-border/80 pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-mono font-bold uppercase tracking-wider">
                <FileSignature className="w-3.5 h-3.5" />
                Master Services Agreement (MSA) Acceptance
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
                Contract Terms & Service Authorization
              </h2>
              <p className="text-xs text-muted-foreground">
                Please review and accept the operational terms for this engagement before submission to admin.
              </p>
            </div>

            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Engagement Overview Card */}
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2.5">
              <div>
                <span className="text-[10px] uppercase font-mono text-muted-foreground font-semibold">
                  Target Service Engagement
                </span>
                <h3 className="text-sm font-bold text-foreground">{serviceTitle}</h3>
                <span className="text-xs text-muted-foreground">Client: {clientName}</span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-mono text-muted-foreground font-semibold">
                  Total Commitment
                </span>
                <div className="text-base font-bold font-mono text-primary">
                  {formatCurrency(amount, currency)}
                </div>
                {fileName && (
                  <div className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-mono mt-0.5">
                    <Receipt className="w-3 h-3" />
                    <span>Receipt: {fileName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Billing Model Classification Selector */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Billing Classification Model</span>
                <span className="text-[10px] font-mono text-muted-foreground font-normal">
                  Select service billing cadence
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onBillingTypeChange("one_time");
                    if (!duration || duration === "Monthly Ongoing") onDurationChange("4-Week Fixed Sprint");
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                    billingType === "one_time"
                      ? "border-primary bg-primary/5 shadow-2xs text-foreground"
                      : "border-border bg-secondary/20 hover:bg-secondary/40 text-muted-foreground"
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${billingType === "one_time" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">One-Time Offer</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Single engagement delivery with milestone-based sign-offs.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onBillingTypeChange("monthly_retainer");
                    onDurationChange("Monthly Ongoing");
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                    billingType === "monthly_retainer"
                      ? "border-primary bg-primary/5 shadow-2xs text-foreground"
                      : "border-border bg-secondary/20 hover:bg-secondary/40 text-muted-foreground"
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${billingType === "monthly_retainer" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">Monthly Retainer</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Monthly recurring cycle. Prompts for receipt renewal each month.
                    </div>
                  </div>
                </button>
              </div>

              {/* Duration specification */}
              <div className="pt-1.5 flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground shrink-0">
                  {billingType === "monthly_retainer" ? "Starting Month:" : "Expected Duration:"}
                </span>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => onDurationChange(e.target.value)}
                  placeholder={billingType === "monthly_retainer" ? currentMonth : "e.g. 4 Weeks, 2 Months"}
                  className="px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-hidden focus:border-primary flex-1 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Contract Terms Box (Scrollable) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" />
                Standard Terms of Engagement
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadDealPdf}
                  className="text-[11px] font-bold text-primary bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Deal PDF</span>
                </button>
                <a
                  href="/contracts/sample-contract.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-muted-foreground hover:text-foreground hover:underline font-medium flex items-center gap-1"
                >
                  Template ↗
                </a>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-secondary/20 border border-border/80 text-[11px] text-muted-foreground space-y-2 max-h-40 overflow-y-auto font-sans leading-relaxed">
              <p>
                <strong>1. Scope of Work & Deliverables:</strong> Furii Agency will execute the designated
                creative, engineering, or production milestones outlined in this engagement specification. Any
                supplementary scope requested will be invoiced via separate addendum.
              </p>
              <p>
                <strong>2. Payment Clearance:</strong> Work initiation and operational sprint scheduling commence
                upon financial clearance of the attached payment receipt by operations command.
              </p>
              {billingType === "monthly_retainer" ? (
                <p>
                  <strong>3. Monthly Retainer Terms:</strong> This retainer operates on a 30-day recurring cycle
                  commencing on the clearance date. At the end of each billing month, a renewal receipt will be requested
                  to maintain continuous priority agency capacity. Either party may pause or cancel with 14 days notice.
                </p>
              ) : (
                <p>
                  <strong>3. Delivery & Milestone Handover:</strong> Deliverables for this one-time engagement will
                  be submitted via the Client Deliverables Vault for formal review, stakeholder revisions, and sign-off.
                </p>
              )}
              <p>
                <strong>4. Intellectual Property:</strong> All final approved media assets, software artifacts,
                and production masters transfer to the client upon complete settlement of all issued invoices.
              </p>
              <p>
                <strong>5. Digital Signature & Authorization:</strong> Checking the agreement box below constitutes
                a legally binding electronic agreement between the client representative and Furii Agency Inc.
              </p>
            </div>
          </div>

          {/* Agreement Checkboxes */}
          <div className="space-y-2.5 pt-1 border-t border-border/80">
            <label className="flex items-start gap-2.5 text-xs text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-0.5 rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
              />
              <span className="leading-snug">
                I have read, understand, and agree to the <strong>Master Services Agreement terms</strong> and
                specifications governing this {billingType === "monthly_retainer" ? "Monthly Retainer" : "One-Time Engagement"}.
              </span>
            </label>

            <label className="flex items-start gap-2.5 text-xs text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreedAuthenticity}
                onChange={(e) => setAgreedAuthenticity(e.target.checked)}
                className="mt-0.5 rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
              />
              <span className="leading-snug text-muted-foreground">
                I certify that the attached transaction document is an authentic payment proof authorizing this deployment.
              </span>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-border flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2 rounded-xl border border-border bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel / Change Receipt
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={!agreedTerms || isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting to Operations...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm Contract & Submit to Admin</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
