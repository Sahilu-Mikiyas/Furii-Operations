import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MOCK_APPROVALS, MOCK_DELIVERABLES } from "@/data/mock-data";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/utils";
import {
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Download,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { ApprovalStatus } from "@/types";

export const Route = createFileRoute("/approvals")({
  component: ApprovalsPage,
});

function ApprovalsPage() {
  const [approvals, setApprovals] = useState(MOCK_APPROVALS);
  const [feedbackModalId, setFeedbackModalId] = useState<string | null>(null);
  const [feedbackComment, setFeedbackComment] = useState("");

  const handleApprove = (approvalId: string) => {
    setApprovals((prev) =>
      prev.map((a) =>
        a.id === approvalId
          ? {
              ...a,
              status: "approved" as ApprovalStatus,
              reviewed_at: new Date().toISOString(),
            }
          : a
      )
    );
    toast.success("Deliverable successfully approved! Next phase unlocked.");
  };

  const handleRequestChanges = (approvalId: string) => {
    if (!feedbackComment.trim()) {
      toast.error("Please provide constructive feedback or change requests.");
      return;
    }

    setApprovals((prev) =>
      prev.map((a) =>
        a.id === approvalId
          ? {
              ...a,
              status: "changes_requested" as ApprovalStatus,
              client_comment: feedbackComment,
              reviewed_at: new Date().toISOString(),
            }
          : a
      )
    );
    setFeedbackModalId(null);
    setFeedbackComment("");
    toast.info("Changes requested. The Furii team has been notified.");
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

      {/* Review Queue Cards */}
      <div className="space-y-6">
        {approvals.map((approval) => {
          const deliverable = MOCK_DELIVERABLES.find((d) => d.id === approval.deliverable_id);
          const isPending = approval.status === "awaiting_review";

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
                      Requested {formatDate(approval.requested_at)}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground">
                    {approval.title}
                  </h3>
                </div>
                <StatusBadge status={approval.status} />
              </div>

              <p className="text-xs text-foreground/85 leading-relaxed max-w-3xl">
                {approval.description}
              </p>

              {/* Version details box */}
              {deliverable && (
                <div className="p-4 rounded-xl bg-secondary/40 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold">
                      Attached Output:
                    </span>
                    <p className="text-xs font-bold text-foreground">
                      {deliverable.name} (Version {deliverable.current_version})
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono">{deliverable.type}</p>
                  </div>
                  <button
                    onClick={() => toast.info("Opening asset preview...")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary hover:bg-secondary/80 border border-border text-foreground transition-colors shrink-0"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Preview Asset File
                  </button>
                </div>
              )}

              {/* Client comment if changes requested */}
              {approval.client_comment && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                  <div className="flex items-center gap-2 text-amber-900 text-xs font-bold font-mono uppercase">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Documented Client Feedback:
                  </div>
                  <p className="text-xs text-amber-950 leading-relaxed font-medium">
                    "{approval.client_comment}"
                  </p>
                </div>
              )}

              {/* Action Buttons for Client Approval */}
              {isPending && (
                <div className="pt-2 flex flex-wrap items-center gap-3 border-t border-border/80">
                  <button
                    onClick={() => handleApprove(approval.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve Deliverable
                  </button>

                  <button
                    onClick={() => setFeedbackModalId(approval.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-colors"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Request Changes
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Request Changes Modal */}
      {feedbackModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-foreground">Request Changes on Deliverable</h3>
            <p className="text-xs text-muted-foreground">
              Please specify the modifications needed. Your feedback will be permanently documented in the project history.
            </p>
            <textarea
              rows={4}
              required
              placeholder="e.g. Please refine the hero section padding and adjust typography weight..."
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-secondary/30 focus:outline-hidden"
            />
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setFeedbackModalId(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRequestChanges(feedbackModalId)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
