import { useState } from "react";
import { useDeliverables } from "@/hooks/useDeliverables";
import { useProjects } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/utils";
import { Upload, Download, Loader2, FileCheck2, Plus, Trash2, X } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { Deliverable, DeliverableStatus, FileCategory } from "@/types";

export function TeamDeliverablesPage() {
  const {
    deliverables,
    uploadNewVersion,
    createDeliverable,
    deleteDeliverable,
    isUploading,
    isCreating,
    isLoading,
  } = useDeliverables();

  const { projects } = useProjects();
  const { clients } = useClients();

  // Upload Revision State
  const [uploadDeliverableId, setUploadDeliverableId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");

  // Create Deliverable State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newProjectId, setNewProjectId] = useState("");
  const [newType, setNewType] = useState("Document");
  const [newCategory, setNewCategory] = useState<FileCategory>("pdf");
  const [newStatus, setNewStatus] = useState<DeliverableStatus>("awaiting_review");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newFileNotes, setNewFileNotes] = useState("");

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newProjectId) {
      toast.error("Please provide a title and select a project.");
      return;
    }

    const proj = projects.find((p) => p.id === newProjectId);

    try {
      await createDeliverable({
        organization_id: proj?.organization_id || "72e3ff6d-96e6-4cc6-b904-d07327f43b29",
        project_id: newProjectId,
        client_id: proj?.client_id || "",
        name: newTitle.trim(),
        title: newTitle.trim(),
        description: newDesc.trim(),
        type: newType,
        category: newCategory,
        status: newStatus,
        file: newFile,
        fileNotes: newFileNotes || "Initial release publication.",
      });

      toast.success(`Deliverable "${newTitle}" created successfully.`);
      setShowCreateModal(false);
      setNewTitle("");
      setNewDesc("");
      setNewProjectId("");
      setNewFile(null);
      setNewFileNotes("");
    } catch (err: any) {
      toast.error(err.message || "Failed to create deliverable.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete deliverable "${name}"?`)) return;
    try {
      await deleteDeliverable(id);
      toast.success(`Deliverable "${name}" deleted.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete deliverable.");
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
        actions={
          <button
            onClick={() => {
              if (projects.length > 0 && !newProjectId) {
                setNewProjectId(projects[0].id);
              }
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Publish Deliverable</span>
          </button>
        }
      />

      {isLoading ? (
        <div className="p-12 flex justify-center text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : deliverables.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-2xl border border-border space-y-3">
          <FileCheck2 className="w-8 h-8 text-muted-foreground mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">No deliverables found</h3>
            <p className="text-xs text-muted-foreground">Deliverables assigned to active projects will appear here.</p>
          </div>
          <button
            onClick={() => {
              if (projects.length > 0 && !newProjectId) {
                setNewProjectId(projects[0].id);
              }
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Publish First Deliverable</span>
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {deliverables.map((deliv) => {
            const client = clients.find((c) => c.id === deliv.client_id);
            const project = projects.find((p) => p.id === deliv.project_id);

            return (
              <div
                key={deliv.id}
                className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono uppercase bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">
                        Current Version: v{deliv.current_version}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        Type: {deliv.type || deliv.category || "Asset"}
                      </span>
                      {client && (
                        <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded border border-border">
                          {client.name}
                        </span>
                      )}
                      {project && (
                        <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded border border-border">
                          {project.name}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-foreground">{deliv.name || deliv.title}</h3>
                    {deliv.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed">{deliv.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={deliv.status} />
                    <button
                      onClick={() => setUploadDeliverableId(deliv.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Revision
                    </button>
                    <button
                      onClick={() => handleDelete(deliv.id, deliv.name || deliv.title || "Deliverable")}
                      className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                      title="Delete deliverable"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
                          className="flex items-center justify-between text-xs bg-card p-2 rounded-lg border border-border/60"
                        >
                          <div className="flex items-center gap-2 truncate min-w-0 pr-2">
                            <span className="font-mono font-bold text-primary shrink-0">v{ver.version_number}</span>
                            <span className="font-mono text-foreground font-medium truncate">{ver.file_name}</span>
                            {ver.notes && <span className="text-muted-foreground italic truncate">— {ver.notes}</span>}
                          </div>
                          <a
                            href={ver.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded bg-secondary hover:bg-secondary/80 text-foreground font-medium text-[11px] flex items-center gap-1 transition-colors border border-border shrink-0 cursor-pointer"
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
            );
          })}
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
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Upload Deliverable Revision</h2>
              <button
                onClick={() => {
                  setUploadDeliverableId(null);
                  setSelectedFile(null);
                  setNotes("");
                }}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Deliverable File (Master Asset) *
                </label>
                <input
                  type="file"
                  required
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-border file:bg-secondary file:text-xs file:font-semibold cursor-pointer"
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
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden resize-none"
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
                  className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isUploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Submit Version
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Create Deliverable Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Publish Deliverable</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Target Project *</label>
                <select
                  required
                  value={newProjectId}
                  onChange={(e) => setNewProjectId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden cursor-pointer"
                >
                  <option value="">-- Select Project --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Deliverable Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Master Production Cut & Social Video Suite"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden cursor-pointer"
                  >
                    <option value="Document">Document / PDF</option>
                    <option value="Design">Design / Vector</option>
                    <option value="Video">Video / Master Cut</option>
                    <option value="Presentation">Presentation / Deck</option>
                    <option value="Audio">Audio / Sound Track</option>
                    <option value="Code">Software / Code Package</option>
                    <option value="Archive">Archive / Assets ZIP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as DeliverableStatus)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden cursor-pointer"
                  >
                    <option value="awaiting_review">Awaiting Client Review</option>
                    <option value="draft">Internal Draft</option>
                    <option value="approved">Approved</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Technical details, formats, or notes for client review..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden resize-none"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-secondary/20 border border-border/80 space-y-2">
                <label className="block text-xs font-semibold text-foreground">
                  Initial File Upload (Optional)
                </label>
                <input
                  type="file"
                  onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                />
                {newFile && (
                  <div className="pt-1">
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Version 1 Notes
                    </label>
                    <input
                      type="text"
                      value={newFileNotes}
                      onChange={(e) => setNewFileNotes(e.target.value)}
                      placeholder="e.g. Master release v1.0"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-hidden"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg border border-border cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isCreating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Publish Deliverable
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
