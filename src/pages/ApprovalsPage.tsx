import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useApprovals } from "@/hooks/useApprovals";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/utils";
import {
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Download,
  Loader2,
  FileCheck2,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function ApprovalsPage() {
  const { role, currentClient } = useAuth();
  const { approvals, approveDeliverable, requestChanges, isApproving, isRequestingChanges, isLoading } =
    useApprovals(role === "client_owner" || role === "client_member" ? currentClient?.id : undefined);

  const [feedbackModalId, setFeedbackModalId] = useState<string | null>(null);
  const [feedbackComment, setFeedbackComment] = useState("");

  const canSignOff = role === "client_owner" || role === "super_admin" || role === "admin";

  const handleApprove = async (approvalId: string) => {
    try {
      await approveDeliverable({ id: approvalId });
      toast.success("Deliverable successfully approved! Next phase unlocked.");
    } catch (err: any) {
      toast.error(err.message || "Failed to approve deliverable.");
    }
  };

  const handleRequestChanges = async (approvalId: string) => {
    if (!feedbackComment.trim()) {
      toast.error("Please provide constructive feedback or change requests.");
      return;
    }

    try {
      await requestChanges({ id: approvalId, comment: feedbackComment });
      setFeedbackModalId(null);
      setFeedbackComment("");
      toast.info("Changes requested. The Furii team has been notified.");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit change request.");
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
        title="Deliverables & Client Approvals"
        description="Official outputs submitted for formal review. Acceptance unlocks subsequent milestones and implementation phases."
      />

      {isLoading ? (
        <div className="p-12 flex justify-center items-center text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : approvals.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-2xl border border-border space-y-2">
          <FileCheck2 className="w-8 h-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold text-foreground">Review Queue is Clear</h3>
          <p className="text-xs text-muted-foreground">No deliverables are currently awaiting sign-off.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {approvals.map((approval) => {
            const isPending = approval.status === "awaiting_review" || approval.status === "pending";
            const fileUrl = (approval as any).deliverable_version?.file_url;
            const fileName = (approval as any).deliverable_version?.file_name;

            return (
              <div
                key={approval.id}
                className={`p-6 rounded-2xl bg-card border transition-all space-y-5 ${
                  isPending
                    ? "border-amber-300 shadow-md ring-1 ring-amber-200/50"
                    : "border-border shadow-2xs"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">
                        Deliverable Review
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        Requested {formatDate(approval.requested_at || approval.created_at)}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground">
                      {approval.title}
                    </h3>
                  </div>
                  <StatusBadge status={approval.status} />
                </div>

                {approval.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {approval.description}
                  </p>
                )}

                {/* File Attachment Pill */}
                {fileUrl && (
                  <div className="p-3 bg-secondary/40 border border-border/80 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-mono text-foreground font-medium truncate max-w-sm">
                      📎 {fileName || "Review Asset File"}
                    </span>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-xs font-semibold rounded-lg bg-card border border-border hover:bg-secondary flex items-center gap-1 text-foreground transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Output
                    </a>
                  </div>
                )}

                {/* Client Feedback Log if already provided */}
                {approval.client_comment && (
                  <div className="p-4 rounded-xl bg-secondary/30 border border-border/70 space-y-1 text-xs">
                    <div className="flex items-center gap-2 font-semibold text-foreground">
                      <MessageSquare className="h-3.5 w-3.5 text-primary" />
                      <span>Stakeholder Feedback:</span>
                    </div>
                    <p className="text-muted-foreground italic pl-5">{approval.client_comment}</p>
                  </div>
                )}

                {/* Action Buttons for Sign-Off */}
                {isPending && canSignOff && (
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handleApprove(approval.id)}
                      disabled={isApproving}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                    >
                      {isApproving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      Approve & Authorize Next Phase
                    </button>
                    <button
                      onClick={() => setFeedbackModalId(approval.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors cursor-pointer"
                    >
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      Request Revision / Changes
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Revision Request Modal */}
      {feedbackModalId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 space-y-4"
          >
            <div className="space-y-1">
              <h2 className="text-base font-bold text-foreground">Request Deliverable Modifications</h2>
              <p className="text-xs text-muted-foreground">
                Detail the specific adjustments or considerations needed before sign-off.
              </p>
            </div>

            <textarea
              rows={4}
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              placeholder="e.g. Please increase contrast on primary action buttons and export SVG vectors for vector badges..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-secondary/30 text-foreground focus:outline-hidden"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setFeedbackModalId(null);
                  setFeedbackComment("");
                }}
                className="px-4 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg border border-border cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRequestingChanges}
                onClick={() => handleRequestChanges(feedbackModalId)}
                className="px-4 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isRequestingChanges && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Submit Revision Request
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
