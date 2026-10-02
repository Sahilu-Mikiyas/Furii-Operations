import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useServiceRequests } from "@/hooks/useServiceRequests";
import { useServices } from "@/hooks/useServices";
import { PageHeader } from "@/components/shared/PageHeader";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Receipt,
  UploadCloud,
  FileCheck,
  CheckCircle2,
  ArrowLeft,
  Clock,
  AlertCircle,
  FileSignature,
  Calendar,
  Layers,
  ShieldCheck,
  RefreshCw,
  Download,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ContractAgreementModal } from "@/components/portal/ContractAgreementModal";
import type { BillingType } from "@/types";
import { downloadContractPdf } from "@/lib/contractPdfGenerator";

export function ClientPaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get("requestId");

  const { currentClient, currency } = useAuth();
  const { requests, isLoading, submitReceipt, isSubmittingReceipt } = useServiceRequests();
  const { services: clientServices } = useServices(undefined, currentClient?.id);

  const [selectedRequestId, setSelectedRequestId] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [paymentNotes, setPaymentNotes] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Contract Terms Modal State & Billing Model
  const [showContractModal, setShowContractModal] = useState(false);
  const [billingType, setBillingType] = useState<BillingType>("one_time");
  const [duration, setDuration] = useState<string>("4-Week Fixed Sprint");

  // Only pending requests without any attached receipt are eligible to be attached a receipt for.
  // Once in the ongoing phase (approved/converted) or once a receipt has already been attached, it is completely out of the list!
  const eligibleRequests = requests.filter(
    (r) => r.status === "pending" && !r.receipt_url
  );

  const underReviewRequests = requests.filter(
    (r) => r.status === "payment_review" || (r.status === "pending" && !!r.receipt_url)
  );

  const ongoingRequests = requests.filter(
    (r) => r.status === "approved" || r.status === "converted"
  );

  // Active Monthly Retainer Services that may require cycle renewal
  const activeRetainerServices = clientServices.filter(
    (s) => s.billing_type === "monthly_retainer" && s.status !== "completed"
  );

  useEffect(() => {
    if (preselectedId && requests.some((r) => r.id === preselectedId)) {
      setSelectedRequestId(preselectedId);
    } else if (eligibleRequests.length > 0 && !selectedRequestId) {
      setSelectedRequestId(eligibleRequests[0].id);
    }
  }, [preselectedId, requests, eligibleRequests, selectedRequestId]);

  const selectedRequest = requests.find((r) => r.id === selectedRequestId);
  const isSelectedOngoing = selectedRequest?.status === "approved" || selectedRequest?.status === "converted";
  const isSelectedAlreadySubmitted = !isSelectedOngoing && (selectedRequest?.status === "payment_review" || !!selectedRequest?.receipt_url);
  const isSelectedEligible = selectedRequest?.status === "pending" && !selectedRequest?.receipt_url;

  useEffect(() => {
    if (selectedRequest?.billing_type) {
      setBillingType(selectedRequest.billing_type);
      setDuration(selectedRequest.duration || (selectedRequest.billing_type === "monthly_retainer" ? "Monthly Ongoing" : "4-Week Fixed Sprint"));
    }
  }, [selectedRequest]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  // Intercept submit: open Contract Terms agreement popup before final submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId) {
      toast.error("Please select a service to pay for.");
      return;
    }
    if (isSelectedOngoing) {
      toast.error("This service is already in the ongoing phase. Receipts cannot be submitted.");
      return;
    }
    if (isSelectedAlreadySubmitted) {
      toast.error("A receipt has already been attached for this service.");
      return;
    }
    if (!selectedFile) {
      toast.error("Please attach a proof of payment receipt.");
      return;
    }

    setShowContractModal(true);
  };

  // Final confirmation inside contract modal
  const handleConfirmContractAndSubmit = async () => {
    try {
      await submitReceipt({
        requestId: selectedRequestId,
        file: selectedFile!,
        notes: paymentNotes,
        contractAccepted: true,
        contractAcceptedAt: new Date().toISOString(),
        billingType,
        duration: duration || (billingType === "monthly_retainer" ? "Monthly Retainer" : "One-Time Delivery"),
      });

      setShowContractModal(false);
      toast.success("Payment receipt and contract agreement submitted!");
      setIsSuccess(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit receipt.");
    }
  };

  if (isSuccess) {
    return (
      <div className="p-8 max-w-md mx-auto my-12 text-center bg-card rounded-2xl border border-border shadow-2xs space-y-6">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 font-bold px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
            Payment Under Review
          </span>
          <h2 className="text-xl font-bold text-foreground">Receipt Submitted!</h2>
          <p className="text-xs text-muted-foreground">
            Your payment receipt for <span className="text-foreground font-semibold">{selectedRequest?.title}</span> has been uploaded.
          </p>
        </div>

        <div className="p-4 bg-secondary/30 rounded-xl border border-border text-xs text-left space-y-1.5">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <Clock className="w-4 h-4 text-primary shrink-0" />
            <span>Verification in Progress</span>
          </div>
          <p className="text-muted-foreground text-[11px] pl-6 leading-relaxed">
            The project manager will review the attached transaction receipt and activate your project into the <strong>Ongoing</strong> tab.
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                downloadContractPdf({
                  dealNumber: `DEAL-${selectedRequestId.slice(0, 8).toUpperCase()}`,
                  serviceTitle: selectedRequest?.title || "Service Engagement",
                  client: {
                    name: currentClient?.name || "Client Partner",
                    company: currentClient?.company || currentClient?.name,
                  },
                  billingType,
                  duration,
                  totalAmount: Number(selectedRequest?.estimated_total || 0),
                  currency,
                  receiptFileName: selectedFile?.name,
                  signedDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
                  signerName: currentClient?.name,
                });
              }}
              className="w-full py-2.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl text-xs border border-primary/30 flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Signed Deal PDF</span>
            </button>

            <a
              href="/contracts/social-media-content-production-retainer-agreement.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-secondary hover:bg-secondary/80 text-foreground font-bold rounded-xl text-xs border border-border flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
              <span>Inspect Full Doc ↗</span>
            </a>
          </div>

          <button
            onClick={() => navigate("/portal/services?tab=requested")}
            className="w-full py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
          >
            View in Requested Tab
          </button>
          <button
            onClick={() => navigate("/portal/services")}
            className="w-full py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg text-xs font-semibold border border-border transition-colors cursor-pointer"
          >
            Return to Services Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg border border-border bg-secondary/40 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          title="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <span className="text-[10px] font-mono uppercase bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">
            Financial Settlement
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mt-0.5">
            Attach Payment Receipt
          </h1>
        </div>
      </div>

      {/* Active Monthly Retainers Status Strip */}
      {activeRetainerServices.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-secondary/30 border border-border shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
                Ongoing Monthly Retainer Cadence
              </h3>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground font-semibold">
              {activeRetainerServices.length} Monitored Retainer(s)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {activeRetainerServices.map((ret) => {
              const isDue = ret.next_billing_date && new Date(ret.next_billing_date) <= new Date();
              return (
                <div
                  key={ret.id}
                  className="p-3.5 rounded-xl bg-card border border-border/80 flex items-center justify-between text-xs gap-3 shadow-2xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-semibold text-foreground truncate">{ret.name}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      Cycle Due: {ret.next_billing_date ? formatDate(ret.next_billing_date) : "30-Day Cadence"}
                    </p>
                  </div>
                  {isDue ? (
                    <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                      Renewal Due
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-[10px] font-semibold rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                      Active Cycle
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STEP 1: SELECT SERVICE */}
        <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-mono font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                Select Target Service
              </h3>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {eligibleRequests.length} Eligible Request(s)
            </span>
          </div>

          {isLoading ? (
            <div className="text-center py-6 text-xs text-muted-foreground">Loading service requests...</div>
          ) : eligibleRequests.length === 0 ? (
            <div className="p-6 text-center space-y-3 bg-secondary/20 rounded-xl border border-border">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-foreground">No Pending Requests Awaiting Payment</h4>
                <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                  Clients can only attach a receipt once per service. Once approved and in the ongoing phase, services are automatically removed from this list.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {underReviewRequests.length > 0 && (
                  <button
                    type="button"
                    onClick={() => navigate("/portal/services?tab=requested")}
                    className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-foreground border border-border text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    View Under Review ({underReviewRequests.length})
                  </button>
                )}
                {ongoingRequests.length > 0 && (
                  <button
                    type="button"
                    onClick={() => navigate("/portal/services?tab=ongoing")}
                    className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-foreground border border-border text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    View Ongoing Services ({ongoingRequests.length})
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => navigate("/portal/catalog")}
                  className="px-3.5 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Browse Catalog
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {eligibleRequests.map((req) => {
                const isSelected = selectedRequestId === req.id;
                return (
                  <div
                    key={req.id}
                    onClick={() => setSelectedRequestId(req.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-primary/5 border-primary shadow-2xs"
                        : "bg-secondary/20 border-border hover:border-border/80"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-secondary"
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-semibold">
                            {req.request_type}
                          </span>
                          <h4 className="font-semibold text-foreground text-xs truncate">{req.title}</h4>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-7 sm:pl-0">
                      <span className="font-mono font-bold text-xs text-foreground">
                        {formatCurrency(req.estimated_total, currency)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* STEP 2: SERVICE DETAILS & ATTACH RECEIPT */}
        {selectedRequest && (
          <div className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-mono font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                  Payment Status & Proof
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-foreground">
                Amount: {formatCurrency(selectedRequest.estimated_total, currency)}
              </span>
            </div>

            {isSelectedOngoing ? (
              <div className="p-5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Service is in Ongoing Production</span>
                </div>
                <p className="text-xs leading-relaxed">
                  This service has already been approved by Furii Operations and is active in your <strong>Ongoing</strong> delivery streams. Receipts cannot be attached once a service is in the ongoing phase.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/portal/services?tab=ongoing")}
                  className="mt-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                >
                  Go to Ongoing Services
                </button>
              </div>
            ) : isSelectedAlreadySubmitted ? (
              <div className="p-5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Receipt Already Attached — Under Review</span>
                </div>
                <p className="text-xs leading-relaxed">
                  You have already submitted a payment receipt for this service. Each service can only have a single receipt attached. The project manager is currently verifying the transaction.
                </p>
                {selectedRequest.receipt_url && (
                  <div className="pt-1">
                    <a
                      href={selectedRequest.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      View Attached Receipt ↗
                    </a>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => navigate("/portal/services?tab=requested")}
                  className="mt-1 px-3 py-1.5 rounded-lg bg-secondary text-foreground border border-border font-semibold text-xs hover:bg-secondary/80 transition-colors cursor-pointer"
                >
                  View in Requested Services
                </button>
              </div>
            ) : (
              <>
                {/* Dropzone */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-2">
                    Bank Deposit Slip / Mobile Money Screenshot / Wire Receipt
                  </label>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                      dragOver
                        ? "border-primary bg-primary/5"
                        : selectedFile
                        ? "border-emerald-500 bg-emerald-50/10"
                        : "border-border hover:border-primary/50 bg-secondary/20"
                    }`}
                    onClick={() => document.getElementById("receipt-file-input")?.click()}
                  >
                    <input
                      id="receipt-file-input"
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />

                    {selectedFile ? (
                      <div className="space-y-1.5">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mx-auto">
                          <FileCheck className="w-5 h-5" />
                        </div>
                        <div className="font-semibold text-foreground text-xs">{selectedFile.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Click to change
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mx-auto text-muted-foreground">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <div className="font-semibold text-foreground text-xs">
                          Click or drag receipt file here
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          PNG, JPG, or PDF (up to 25MB)
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reference notes */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Transaction Reference / Wire ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Telebirr Ref: TXN-894021 or CBE Wire: 0284019"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground placeholder:text-muted-foreground focus:outline-hidden"
                  />
                </div>

                {/* Submit */}
                <div className="pt-2 flex items-center justify-between gap-3 border-t border-border/80">
                  <span className="text-[11px] text-muted-foreground">
                    Filed securely into accounting ledger.
                  </span>
                  <button
                    type="submit"
                    disabled={!selectedFile || isSubmittingReceipt}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    <FileSignature className="w-4 h-4" />
                    <span>Review Terms & Sign Contract →</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </form>

      {/* Contract Terms Agreement Popup Modal */}
      <ContractAgreementModal
        isOpen={showContractModal}
        onClose={() => setShowContractModal(false)}
        serviceTitle={selectedRequest?.title || "Service Engagement"}
        clientName={currentClient?.name}
        amount={Number(selectedRequest?.estimated_total || 0)}
        currency={currency}
        fileName={selectedFile?.name}
        billingType={billingType}
        onBillingTypeChange={setBillingType}
        duration={duration}
        onDurationChange={setDuration}
        onConfirm={handleConfirmContractAndSubmit}
        isSubmitting={isSubmittingReceipt}
      />
    </motion.div>
  );
}
export default ClientPaymentPage;
