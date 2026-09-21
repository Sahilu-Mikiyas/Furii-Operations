import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useServiceRequests } from "@/hooks/useServiceRequests";
import {
  Receipt,
  UploadCloud,
  FileCheck,
  CheckCircle2,
  ArrowLeft,
  Clock,
  Sparkles,
  FileText,
  AlertCircle,
  Building2,
  Wallet,
} from "lucide-react";
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

  // Filter requests that are eligible for payment (pending, approved, or payment_review)
  const eligibleRequests = requests.filter(
    (r) => r.status === "pending" || r.status === "approved" || r.status === "payment_review"
  );

  // Auto-select request from URL or default to first
  useEffect(() => {
    if (preselectedId && requests.some((r) => r.id === preselectedId)) {
      setSelectedRequestId(preselectedId);
    } else if (eligibleRequests.length > 0 && !selectedRequestId) {
      setSelectedRequestId(eligibleRequests[0].id);
    }
  }, [preselectedId, requests]);

  const selectedRequest = requests.find((r) => r.id === selectedRequestId);

  const formatMoney = (amount: number) => {
    return `${amount.toLocaleString()} ${currency || "ETB"}`;
  };

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
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
              Status: Under Payment Review
            </span>
            <h2 className="text-2xl font-bold text-white">Receipt Submitted!</h2>
            <p className="text-zinc-400 text-sm">
              Your payment receipt for <span className="text-white font-semibold">{selectedRequest?.title}</span> has been securely transmitted.
            </p>
          </div>

          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 text-xs text-left space-y-2">
            <div className="flex items-center gap-2 text-zinc-400">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Furii Operations is currently reviewing and verifying your transaction.</span>
            </div>
            <div className="text-zinc-500 pl-6">
              Once verified, the project manager will activate your service and it will appear directly in your <strong>Ongoing Projects</strong> stream!
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => navigate("/portal/services?tab=requested")}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm rounded-lg transition shadow-lg shadow-amber-500/10"
            >
              View in Requested Services
            </button>
            <button
              onClick={() => navigate("/portal/services")}
              className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs rounded-lg transition"
            >
              Return to Services Overview
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24">
      {/* Header */}
      <div className="border-b border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                Payment Verification
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Submit Payment & Attach Receipt
              </h1>
            </div>
          </div>

          <span className="text-xs text-zinc-400 hidden sm:block">
            {currentClient?.name || "Client Portal"}
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* STEP 1: SELECT SERVICE (From user's sketch) */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                  Select Service
                </h3>
              </div>
              <span className="text-xs text-zinc-400">
                {eligibleRequests.length} service request(s) eligible
              </span>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-zinc-500 text-sm">
                Loading your service requests...
              </div>
            ) : eligibleRequests.length === 0 ? (
              <div className="p-6 text-center space-y-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                <p className="text-zinc-300 text-sm font-semibold">No pending service requests found.</p>
                <p className="text-zinc-500 text-xs max-w-sm mx-auto">
                  Browse our catalog to select or configure a service package first.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/portal/catalog")}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-lg transition"
                >
                  Browse Catalog
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {eligibleRequests.map((req) => {
                  const isSelected = selectedRequestId === req.id;
                  return (
                    <div
                      key={req.id}
                      onClick={() => setSelectedRequestId(req.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/5"
                          : "bg-zinc-950/60 border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "border-amber-400 bg-amber-400 text-zinc-950"
                              : "border-zinc-700 bg-zinc-800"
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-zinc-950" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                              {req.request_type}
                            </span>
                            <h4 className="font-semibold text-white text-sm">{req.title}</h4>
                          </div>
                          {req.description && (
                            <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                              {req.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-8 sm:pl-0">
                        <span
                          className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                            req.status === "payment_review"
                              ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                              : req.status === "approved"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-zinc-800 text-zinc-400"
                          }`}
                        >
                          {req.status === "payment_review"
                            ? "Receipt Submitted"
                            : req.status === "approved"
                            ? "Approved to Pay"
                            : "Pending Review"}
                        </span>
                        <span className="font-mono font-bold text-sm text-amber-400">
                          {formatMoney(req.estimated_total)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* STEP 2: SERVICE DETAILS & ATTACH RECEIPT (From user's sketch) */}
          {selectedRequest && (
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center">
                    2
                  </span>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                    Service Details & Attach Receipt
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {formatMoney(selectedRequest.estimated_total)}
                </span>
              </div>

              {/* Service Summary Box */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 space-y-2">
                <div className="text-xs uppercase text-zinc-500 font-semibold">
                  Selected Target Service
                </div>
                <div className="text-base font-bold text-white">{selectedRequest.title}</div>
                {selectedRequest.description && (
                  <p className="text-xs text-zinc-400">{selectedRequest.description}</p>
                )}
                {selectedRequest.receipt_url && (
                  <div className="pt-2 border-t border-zinc-800 flex items-center gap-2 text-xs text-purple-400">
                    <FileCheck className="w-4 h-4" />
                    <span>A receipt was previously uploaded. Uploading another will update it.</span>
                  </div>
                )}
              </div>

              {/* Upload Dropzone (ATTACH RECEIPT) */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Attach Receipt (Bank Slip / Mobile Money Screenshot / Wire PDF)
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                    dragOver
                      ? "border-amber-400 bg-amber-500/5"
                      : selectedFile
                      ? "border-emerald-500/50 bg-emerald-500/5"
                      : "border-zinc-700 hover:border-zinc-600 bg-zinc-950/60"
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
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                        <FileCheck className="w-6 h-6" />
                      </div>
                      <div className="font-semibold text-white text-sm">{selectedFile.name}</div>
                      <div className="text-xs text-zinc-400 font-mono">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Click to replace file
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div className="font-semibold text-white text-sm">
                        Click or drag & drop receipt here
                      </div>
                      <div className="text-xs text-zinc-500">
                        PNG, JPG, JPEG, or PDF up to 25MB
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Notes / Transaction Reference */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Transaction Notes / Reference (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Telebirr TXN: 948201948 or CBE Wire Ref: 0482014"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-zinc-400">
                  Receipt will be filed directly into the client financial verification ledger.
                </div>
                <button
                  type="submit"
                  disabled={!selectedFile || isSubmittingReceipt}
                  className="w-full sm:w-auto px-8 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-bold text-sm rounded-lg transition shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
                >
                  <Receipt className="w-4 h-4" />
                  {isSubmittingReceipt ? "Uploading & Submitting..." : "Submit Payment Confirmation"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
export default ClientPaymentPage;
