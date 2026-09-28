import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useContracts, ContractAgreement } from "@/hooks/useContracts";
import { formatDate } from "@/lib/utils";
import {
  FileText,
  Download,
  Upload,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileSignature,
  X,
  Loader2,
  AlertCircle,
  RotateCcw,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface ContractWorkspaceViewProps {
  serviceId?: string;
  projectId?: string;
  clientId?: string;
  isManager?: boolean;
}

export function ContractWorkspaceView({
  serviceId,
  projectId,
  clientId,
  isManager = false,
}: ContractWorkspaceViewProps) {
  const { role, currentClient, user } = useAuth();
  const {
    contracts,
    activeContract,
    signContract,
    isSigning,
    uploadContract,
    isUploading,
    resetSignature,
  } = useContracts(serviceId, projectId, clientId);

  const [selectedContractId, setSelectedContractId] = useState<string>("");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [signerName, setSignerName] = useState(user?.full_name || "");
  const [signerTitle, setSignerTitle] = useState(
    role === "client_owner"
      ? "Client Principal / Owner"
      : role === "client_member"
      ? "Authorized Client Signatory"
      : "Authorized Representative"
  );
  const [confirmAuthority, setConfirmAuthority] = useState(false);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadContractTitle, setUploadContractTitle] = useState("");

  const currentContract =
    contracts.find((c) => c.id === selectedContractId) ||
    activeContract ||
    contracts[0];

  const isSigned = currentContract?.status === "signed" || currentContract?.status === "executed";

  const handleOpenSignModal = () => {
    if (!agreedTerms) {
      toast.error("Please toggle 'I have read and agree to the terms of this contract' first.");
      return;
    }
    setSignerName(user?.full_name || "");
    setConfirmAuthority(false);
    setShowSignModal(true);
  };

  const handleConfirmSignature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentContract) return;
    if (!signerName.trim()) {
      toast.error("Please type your full legal name.");
      return;
    }
    if (!confirmAuthority) {
      toast.error("Please confirm authorization to sign on behalf of the client.");
      return;
    }

    try {
      await signContract({
        contractId: currentContract.id,
        signerName: signerName.trim(),
        signerTitle: signerTitle.trim(),
      });

      toast.success("Contract successfully executed! Digital seal applied.");
      setShowSignModal(false);
      setAgreedTerms(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to sign contract.");
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error("Please select a contract document file.");
      return;
    }

    try {
      const created = await uploadContract({
        file: uploadFile,
        title: uploadContractTitle || uploadFile.name.replace(/\.[^/.]+$/, ""),
      });

      toast.success("Contract document published to workspace.");
      if (created?.id) setSelectedContractId(created.id);
      setUploadFile(null);
      setUploadContractTitle("");
      setShowUploadModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to upload contract.");
    }
  };

  const handleResetSignature = async () => {
    if (!currentContract) return;
    if (!window.confirm("Are you sure you want to reset this signature? Both parties will need to resign.")) return;

    try {
      await resetSignature(currentContract.id);
      toast.info("Signature reset. Document returned to pending status.");
    } catch (err: any) {
      toast.error("Failed to reset signature.");
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono uppercase bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">
              Legal Agreement
            </span>
            {isSigned ? (
              <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-700 font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Signed & Executed
              </span>
            ) : (
              <span className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-700 font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-amber-500/20">
                <Clock className="w-3 h-3 text-amber-600" />
                Pending Client Signature
              </span>
            )}
            {currentContract?.version && (
              <span className="text-[10px] font-mono text-muted-foreground">
                v{currentContract.version}.0
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-foreground">
            {currentContract?.title || "Master Services Agreement"}
          </h3>
          <p className="text-xs text-muted-foreground">
            Legally binding scope of work, service level agreement, and commercial terms.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {contracts.length > 1 && (
            <select
              value={currentContract?.id}
              onChange={(e) => setSelectedContractId(e.target.value)}
              className="text-xs bg-secondary/50 font-semibold border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-hidden cursor-pointer"
            >
              {contracts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          )}

          {currentContract?.document_url && (
            <>
              <a
                href={currentContract.document_url}
                download={currentContract.file_name}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors cursor-pointer"
                title="Download contract document"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>

              <a
                href={currentContract.document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors cursor-pointer"
                title="Open in external tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Fullscreen</span>
              </a>
            </>
          )}

          {isManager && (
            <button
              onClick={() => {
                setUploadFile(null);
                setUploadContractTitle("");
                setShowUploadModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Attach Contract</span>
            </button>
          )}
        </div>
      </div>

      {/* In-Built PDF Viewer Container */}
      <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden flex flex-col">
        {/* PDF Viewer Top Bar */}
        <div className="px-4 py-2.5 bg-secondary/40 border-b border-border/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate min-w-0 pr-2">
            <FileText className="w-4 h-4 text-primary shrink-0" />
            <span className="font-mono font-medium text-foreground truncate">
              {currentContract?.file_name || "Contract_Agreement.pdf"}
            </span>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground shrink-0 uppercase">
            Inbuilt Document Viewer
          </span>
        </div>

        {/* Embedded Document Frame */}
        <div className="relative w-full h-[600px] sm:h-[680px] bg-slate-900/5 dark:bg-slate-950/40">
          {currentContract?.document_url ? (
            <iframe
              src={`${currentContract.document_url}#toolbar=1&navpanes=0`}
              className="w-full h-full border-0"
              title={currentContract.title}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3">
              <FileText className="w-12 h-12 text-muted-foreground/50" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">No Contract Document Attached</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Attach an executed scope of work or master services agreement in PDF format.
                </p>
              </div>
              {isManager && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Upload Contract PDF
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Agreement & Signature Execution Section */}
      <div className="space-y-4">
        {isSigned ? (
          /* Official Digital Execution Certificate Card */
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span>Agreement Digitally Executed & Bound</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    This document carries legal force and has been verified with electronic timestamping.
                  </p>
                </div>
              </div>

              {isManager && (
                <button
                  onClick={handleResetSignature}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary text-muted-foreground hover:text-foreground border border-border transition-colors cursor-pointer self-start sm:self-center"
                  title="Reset signature"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Execution</span>
                </button>
              )}
            </div>

            {/* Signature Certificate Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-card/80 border border-border/80 text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground block font-bold">
                  Authorized Signatory
                </span>
                <span className="font-semibold text-foreground text-sm font-serif italic block mt-0.5">
                  ✍️ {currentContract?.signed_by_name || "Client Representative"}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {currentContract?.signed_by_title || "Client Principal"}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground block font-bold">
                  Execution Timestamp
                </span>
                <span className="font-mono text-foreground font-medium block mt-0.5">
                  {currentContract?.signed_at ? formatDate(currentContract.signed_at) : formatDate(new Date().toISOString())}
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {currentContract?.signed_at ? new Date(currentContract.signed_at).toLocaleTimeString() : "Verified"}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground block font-bold">
                  Digital Certificate Hash
                </span>
                <span className="font-mono text-[11px] text-primary font-semibold block truncate mt-0.5">
                  {currentContract?.signature_hash || "SIG-FURII-VERIFIED-ELECTRONIC"}
                </span>
                <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase">
                  ✓ Verified Authentic
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Terms Toggle & Sign Action Card */
          <div className="p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="contract-terms-toggle"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary shrink-0"
              />
              <label
                htmlFor="contract-terms-toggle"
                className="text-xs text-foreground font-medium leading-relaxed cursor-pointer select-none"
              >
                <strong className="font-bold">I have read and agree to the terms of this contract.</strong>
                <span className="block text-muted-foreground mt-0.5 text-[11px]">
                  By checking this box, I acknowledge that I have reviewed the agreement, specifications, delivery milestones,
                  and payment commitments set forth above, and agree to be bound by its terms.
                </span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/60">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Electronic signature requires agreeing to the terms above.</span>
              </div>

              <button
                type="button"
                onClick={handleOpenSignModal}
                disabled={!agreedTerms}
                className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  agreedTerms
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md ring-2 ring-emerald-500/20"
                    : "bg-secondary text-muted-foreground opacity-60 cursor-not-allowed border border-border"
                }`}
              >
                <FileSignature className="w-4 h-4" />
                <span>Sign Contract</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pop-up Modal to Sign Contract by Typing Name */}
      <AnimatePresence>
        {showSignModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                    <FileSignature className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-foreground">Sign & Execute Contract</h2>
                    <p className="text-xs text-muted-foreground">
                      Apply your legally binding electronic signature to execute this agreement.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSignModal(false)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Agreement summary pill */}
              <div className="p-3 rounded-xl bg-secondary/40 border border-border text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Document:</span>
                  <span className="font-semibold text-foreground truncate max-w-[260px]">
                    {currentContract?.title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-mono text-foreground">{formatDate(new Date().toISOString())}</span>
                </div>
              </div>

              <form onSubmit={handleConfirmSignature} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Type Full Legal Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    placeholder="e.g. Mikiyas Sahilu"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-secondary/30 text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    This full name will be permanently stamped on the execution certificate.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Signatory Title / Authority (Optional)
                  </label>
                  <input
                    type="text"
                    value={signerTitle}
                    onChange={(e) => setSignerTitle(e.target.value)}
                    placeholder="e.g. Managing Director / Client Principal"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  />
                </div>

                {/* Live Signature Script Rendering Preview */}
                <div className="p-4 rounded-xl bg-secondary/30 border border-dashed border-border/80 space-y-1 text-center">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                    Digital Signature Preview
                  </span>
                  <div className="min-h-[44px] flex items-center justify-center">
                    {signerName.trim() ? (
                      <span className="font-serif italic text-2xl text-primary tracking-wide transition-all">
                        ✍️ {signerName.trim()}
                      </span>
                    ) : (
                      <span className="text-xs italic text-muted-foreground/60">
                        Type your name above to generate signature
                      </span>
                    )}
                  </div>
                  <div className="w-48 h-0.5 bg-border mx-auto" />
                </div>

                {/* Final Authority Checkbox */}
                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="sign-authority-check"
                    required
                    checked={confirmAuthority}
                    onChange={(e) => setConfirmAuthority(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary shrink-0"
                  />
                  <label
                    htmlFor="sign-authority-check"
                    className="text-[11px] text-muted-foreground leading-snug cursor-pointer select-none"
                  >
                    I confirm under penalty of law that I have authority to execute this contract on behalf of the client entity, and intend this digital signature to be legally binding.
                  </label>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
                  <button
                    type="button"
                    onClick={() => setShowSignModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg border border-border cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSigning || !signerName.trim() || !confirmAuthority}
                    className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    {isSigning ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Executing...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm & Sign</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Attach / Upload Contract Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-foreground">Attach Contract Document</h2>
                  <p className="text-xs text-muted-foreground">
                    Upload a PDF contract, master services agreement, or scope statement.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Contract Title</label>
                  <input
                    type="text"
                    required
                    value={uploadContractTitle}
                    onChange={(e) => setUploadContractTitle(e.target.value)}
                    placeholder="e.g. Master Services & Creative Retainer Agreement 2026"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">PDF File</label>
                  <input
                    type="file"
                    required
                    accept="application/pdf"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setUploadFile(f);
                        if (!uploadContractTitle) {
                          setUploadContractTitle(f.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "));
                        }
                      }
                    }}
                    className="w-full text-xs text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-border file:text-xs file:font-semibold file:bg-secondary file:text-foreground hover:file:bg-secondary/80 cursor-pointer"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg border border-border cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    {isUploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Attach Contract
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
