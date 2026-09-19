import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useFiles } from "@/hooks/useFiles";
import { useClients } from "@/hooks/useClients";
import { PageHeader } from "@/components/shared/PageHeader";
import { formatDate } from "@/lib/utils";
import {
  FileText,
  FileCode,
  Download,
  Upload,
  Search,
  Loader2,
  ShieldCheck,
  FolderOpen,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { Visibility } from "@/types";

export function FilesPage() {
  const { role, currentClient } = useAuth();
  const targetClientId = role === "client_owner" || role === "client_member" ? currentClient?.id : undefined;
  const { files, uploadFile, deleteFile, isUploading, isLoading, canUpload } = useFiles(targetClientId);
  const { clients } = useClients();

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadClientId, setUploadClientId] = useState("");
  const [uploadCategory, setUploadCategory] = useState("document");
  const [uploadVisibility, setUploadVisibility] = useState<Visibility>("client");

  const filteredFiles = files.filter((f) => {
    const matchesCategory = categoryFilter === "all" || f.category === categoryFilter;
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatFileSize = (bytes: number | null | undefined) => {
    if (!bytes) return "—";
    const mb = bytes / (1024 * 1024);
    if (mb < 1) {
      return `${(bytes / 1024).toFixed(0)} KB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  const handleDeleteFile = async (file: { id: string; name: string; file_key?: string | null }) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${file.name}"?`)) return;
    try {
      await deleteFile({ id: file.id, file_key: file.file_key });
      toast.success(`Deleted "${file.name}".`);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete file.");
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a file to upload.");
      return;
    }

    const targetClient = uploadClientId || clients[0]?.id || "client-solomon";

    try {
      await uploadFile({
        file: selectedFile,
        clientId: targetClient,
        category: uploadCategory,
        visibility: uploadVisibility,
      });

      toast.success(`File "${selectedFile.name}" uploaded successfully.`);
      setSelectedFile(null);
      setShowUploadModal(false);
    } catch (err: any) {
      toast.error(err.message || "File upload failed.");
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
        title="Files & Asset Vault"
        description="Centralized project assets, vector deliverables, client contracts, design specifications, and archives."
        actions={
          canUpload ? (
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              Upload Asset
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/80 border border-border text-[11px] font-medium text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Download-Only Mode
            </div>
          )
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search assets by file name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-secondary/50 border border-border/80 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-muted-foreground">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-secondary/70 border border-border/80 rounded-lg px-2.5 py-1.5 text-foreground focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="pdf">PDF Documents</option>
            <option value="design">Design & Vectors</option>
            <option value="contract">Legal & Contracts</option>
            <option value="image">Photography & Images</option>
            <option value="document">Technical Specs</option>
          </select>
        </div>
      </div>

      {/* Files Grid */}
      {isLoading ? (
        <div className="p-12 flex justify-center text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-2xl border border-border space-y-2">
          <FolderOpen className="w-8 h-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No files found</h3>
          <p className="text-xs text-muted-foreground">Upload assets or adjust search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="p-5 rounded-2xl bg-card border border-border shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-primary shrink-0 border border-border">
                    {file.category === "design" ? (
                      <FileCode className="h-5 w-5" />
                    ) : (
                      <FileText className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                      file.visibility === "internal"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {file.visibility === "internal" ? "Internal" : "Client"}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-foreground leading-snug line-clamp-2">
                    {file.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] font-mono text-muted-foreground">
                    <span>{formatFileSize(file.file_size)}</span>
                    <span>•</span>
                    <span>{formatDate(file.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border/80 flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-muted-foreground font-semibold">
                  {file.category}
                </span>
                <div className="flex items-center gap-2">
                  {canUpload && (
                    <button
                      onClick={() => handleDeleteFile(file)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors border border-border"
                      title="Delete file"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <a
                    href={file.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground transition-colors border border-border"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal (Internal Staff Only) */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-4"
          >
            <h2 className="text-base font-bold text-foreground">Upload Asset to Storage Vault</h2>
            <form onSubmit={handleUploadSubmit} className="space-y-3">
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
                <label className="block text-xs font-semibold text-foreground mb-1">Assign to Client</label>
                <select
                  value={uploadClientId}
                  onChange={(e) => setUploadClientId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  >
                    <option value="document">Document</option>
                    <option value="design">Design / Figma</option>
                    <option value="pdf">PDF Guide</option>
                    <option value="contract">Legal Agreement</option>
                    <option value="image">Photography</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Visibility</label>
                  <select
                    value={uploadVisibility}
                    onChange={(e) => setUploadVisibility(e.target.value as Visibility)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  >
                    <option value="client">Client & Internal</option>
                    <option value="internal">Internal Only</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
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
                  Upload to Supabase
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
