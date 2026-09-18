import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MOCK_FILES } from "@/data/mock-data";
import { PageHeader } from "@/components/shared/PageHeader";
import { formatDate } from "@/lib/utils";
import {
  FolderOpen,
  FileText,
  FileCode,
  Download,
  Upload,
  Search,
  Lock,
  Eye,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/files")({
  component: FilesPage,
});

function FilesPage() {
  const [files, setFiles] = useState(MOCK_FILES);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filteredFiles = files.filter((f) => {
    const matchesCategory = categoryFilter === "all" || f.category === categoryFilter;
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatFileSize = (bytes: number | null | undefined) => {
    if (!bytes) return "—";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
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
          <button
            onClick={() => toast.info("Upload modal will open file selector.")}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs"
          >
            <Upload className="h-4 w-4" />
            Upload Asset
          </button>
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
            <option value="design">Design & Figma</option>
            <option value="contract">Legal & Contracts</option>
            <option value="image">Photography & Images</option>
            <option value="video">Video & Motion</option>
          </select>
        </div>
      </div>

      {/* Files Grid */}
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
                    file.visibility === "client"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-secondary text-muted-foreground border-border"
                  }`}
                >
                  {file.visibility === "client" ? "Client Visible" : "Internal"}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-foreground truncate" title={file.name}>
                  {file.name}
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono mt-1">
                  <span>{formatFileSize(file.file_size)}</span>
                  <span>•</span>
                  <span>v{file.version || 1}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border/60 flex items-center justify-between">
              <span className="text-[10px] font-mono text-muted-foreground">
                {formatDate(file.created_at)}
              </span>
              <button
                onClick={() => toast.success(`Downloading ${file.name}...`)}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-secondary hover:bg-secondary/80 border border-border rounded-lg text-foreground transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
