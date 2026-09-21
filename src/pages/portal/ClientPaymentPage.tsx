import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useServiceRequests } from "@/hooks/useServiceRequests";
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
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function ClientPaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get("requestId");

  const { currentClient, currency } = useAuth();
  const { requests, isLoading, submitReceipt, isSubmittingReceipt } = useServiceRequests();

  const [selectedRequestId, setSelectedRequestId] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [paymentNotes, setPaymentNotes] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const eligibleRequests = requests.filter(
    (r) => r.status === "pending" || r.status === "approved" || r.status === "payment_review"
  );

  useEffect(() => {
    if (preselectedId && requests.some((r) => r.id === preselectedId)) {
      setSelectedRequestId(preselectedId);
    } else if (eligibleRequests.length > 0 && !selectedRequestId) {
      setSelectedRequestId(eligibleRequests[0].id);
    }
  }, [preselectedId, requests]);

  const selectedRequest = requests.find((r) => r.id === selectedRequestId);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId) {
      toast.error("Please select a service to pay for.");
      return;
    }
    if (!selectedFile) {
      toast.error("Please attach a proof of payment receipt.");
      return;
    }

    try {
      await submitReceipt({
        requestId: selectedRequestId,
        file: selectedFile,
        notes: paymentNotes,
      });

      toast.success("Payment receipt attached successfully!");
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
              <AlertCircle className="w-6 h-6 text-muted-foreground mx-auto" />
              <p className="text-xs font-semibold text-foreground">No pending service requests found.</p>
              <button
                type="button"
                onClick={() => navigate("/portal/catalog")}
                className="px-3.5 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Browse Catalog
              </button>
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
                  Attach Payment Proof
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-foreground">
                Amount: {formatCurrency(selectedRequest.estimated_total, currency)}
              </span>
            </div>

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
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5" />
                {isSubmittingReceipt ? "Submitting..." : "Submit Payment Confirmation"}
              </button>
            </div>
          </div>
        )}
      </form>
    </motion.div>
  );
}
export default ClientPaymentPage;
