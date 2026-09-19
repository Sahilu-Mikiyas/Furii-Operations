import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useFiles } from "@/hooks/useFiles";
import { PageHeader } from "@/components/shared/PageHeader";
import { formatDate } from "@/lib/utils";
import {
  FileText,
  FileCode,
  Download,
  Search,
  Loader2,
  FolderOpen,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";

export function ClientFilesPage() {
  const { currentClient } = useAuth();
  const { files, isLoading } = useFiles(currentClient?.id);

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
    if (mb < 1) {
      return `${(bytes / 1024).toFixed(0)} KB`;
    }
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
        title="Brand & Asset Vault"
        description="Official brand guidelines, high-resolution vector assets, approved contracts, and production exports."
        actions={
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-border text-[11px] font-medium text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Verified Client Repository
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search files..."
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
            <option value="pdf">PDF Guidelines</option>
            <option value="design">Vectors & Figma</option>
            <option value="contract">Agreements</option>
            <option value="image">Photography</option>
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
          <h3 className="text-sm font-bold text-foreground">No assets found</h3>
          <p className="text-xs text-muted-foreground">Approved assets and deliverables will appear here.</p>
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
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                    Approved
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
          ))}
        </div>
      )}
    </motion.div>
  );
}
