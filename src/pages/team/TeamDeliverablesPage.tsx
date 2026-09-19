import { useState } from "react";
import { useDeliverables } from "@/hooks/useDeliverables";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/utils";
import { Upload, Download, Loader2, FileCheck2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function TeamDeliverablesPage() {
  const { deliverables, uploadNewVersion, isUploading, isLoading } = useDeliverables();

  const [uploadDeliverableId, setUploadDeliverableId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadDeliverableId || !selectedFile) return;

    try {
      await uploadNewVersion({
        deliverableId: uploadDeliverableId,
        file: selectedFile,
        notes,
      });

      toast.success("New revision uploaded and submitted for review.");
      setUploadDeliverableId(null);
      setSelectedFile(null);
      setNotes("");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload deliverable revision.");
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
        title="Deliverable Production & Versioning"
        description="Upload revised versions, view file histories, and monitor client review feedback."
      />

      {isLoading ? (
        <div className="p-12 flex justify-center text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : deliverables.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-2xl border border-border space-y-2">
          <FileCheck2 className="w-8 h-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No deliverables found</h3>
          <p className="text-xs text-muted-foreground">Deliverables assigned to active projects will appear here.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {deliverables.map((deliv) => (
            <div
              key={deliv.id}
              className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">
                      Current Version: v{deliv.current_version}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      Category: {deliv.category || "Asset"}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground">{deliv.name || deliv.title}</h3>
                  <p className="text-xs text-muted-foreground">{deliv.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={deliv.status} />
                  <button
                    onClick={() => setUploadDeliverableId(deliv.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload Revision
                  </button>
                </div>
              </div>

              {/* Version History List */}
              {deliv.versions && deliv.versions.length > 0 && (
                <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/70 space-y-2">
                  <span className="text-[11px] font-mono font-bold uppercase text-muted-foreground block">
                    Version Archive:
                  </span>
                  <div className="space-y-2">
                    {deliv.versions.map((ver: any) => (
                      <div
                        key={ver.id}
                        className="flex items-center justify-between text-xs bg-card p-2.5 rounded-lg border border-border/60"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono font-bold text-primary shrink-0">
                            v{ver.version_number}
                          </span>
                          <span className="font-mono text-foreground font-medium truncate">
                            {ver.file_name}
                          </span>
                          {ver.notes && (
                            <span className="text-muted-foreground italic truncate hidden sm:inline">
                              — {ver.notes}
                            </span>
                          )}
                        </div>

                        <a
                          href={ver.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded bg-secondary hover:bg-secondary/80 text-foreground font-medium text-[11px] flex items-center gap-1 transition-colors border border-border shrink-0"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Revision Modal */}
      {uploadDeliverableId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-4"
          >
            <h2 className="text-base font-bold text-foreground">Upload Deliverable Revision</h2>
            <form onSubmit={handleUpload} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Select File</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-border file:bg-secondary file:text-xs file:font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Revision Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Summary of adjustments made in this revision..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUploadDeliverableId(null);
                    setSelectedFile(null);
                    setNotes("");
                  }}
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
                  Submit Version
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
