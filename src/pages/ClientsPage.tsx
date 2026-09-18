import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/utils";
import type { ClientHealthStatus } from "@/types";
import { toast } from "sonner";
import {
  Building2,
  Search,
  Plus,
  Globe,
  MapPin,
  ExternalLink,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

export function ClientsPage() {
  const { role, setCurrentClient, setWorkspaceMode } = useAuth();
  const { clients, createClient, updateHealth, isCreating } = useClients();
  const { projects } = useProjects();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  // New Client Form State
  const [newName, setNewName] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  const [newWebsite, setNewWebsite] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Restrict client roles from seeing all agency clients
  if (role === "client_owner" || role === "client_member") {
    return <Navigate to="/" replace />;
  }

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.industry?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSubmitting(true);

    try {
      await createClient({
        name: newName,
        industry: newIndustry || "Digital Services",
        description: newDesc || "Client onboarded into Furii operations.",
        website: newWebsite || null,
        status: "active",
        health_status: "on_track",
      });

      toast.success(`Client "${newName}" onboarded successfully.`);
      setNewName("");
      setNewIndustry("");
      setNewWebsite("");
      setNewDesc("");
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create client.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleHealthChange = async (clientId: string, health_status: ClientHealthStatus) => {
    try {
      await updateHealth({ id: clientId, health_status });
      toast.success("Client health status updated.");
    } catch (err: any) {
      toast.error(err.message || "Failed to update status.");
    }
  };

  const handleOpenClientWorkspace = (client: any) => {
    setCurrentClient(client);
    setWorkspaceMode("client");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Client Directory"
        description="Operational accounts, company profiles, and real-time project streams."
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add New Client
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by company or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-secondary/50 border border-border/80 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-muted-foreground">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-secondary/50 border border-border/80 rounded-lg px-2.5 py-1 text-foreground focus:outline-hidden"
          >
            <option value="all">All Accounts</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClients.map((client) => {
          const clientProjects = projects.filter((p) => p.client_id === client.id);

          return (
            <div
              key={client.id}
              className="p-5 rounded-2xl bg-card border border-border/90 hover:border-primary/40 transition-all shadow-2xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-secondary border border-border flex items-center justify-center font-bold text-sm text-foreground">
                      {client.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground leading-snug">{client.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">{client.industry}</p>
                    </div>
                  </div>
                  <StatusBadge status={client.status} />
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {client.description || "No description provided."}
                </p>

                {/* Operational Health Selector */}
                <div className="pt-1 flex items-center justify-between text-xs bg-secondary/40 p-2 rounded-lg border border-border/60">
                  <span className="text-[11px] font-semibold text-muted-foreground font-mono">Health:</span>
                  <select
                    value={client.health_status || "on_track"}
                    onChange={(e) => handleHealthChange(client.id, e.target.value as ClientHealthStatus)}
                    className="text-[11px] font-medium bg-transparent text-foreground cursor-pointer focus:outline-hidden"
                  >
                    <option value="on_track">🟢 On Track</option>
                    <option value="waiting_for_client">🟡 Waiting for Client</option>
                    <option value="attention_required">🟠 Attention Required</option>
                    <option value="delayed">🔴 Delayed</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-border/80 flex items-center justify-between text-xs">
                <span className="font-mono text-muted-foreground font-medium">
                  {clientProjects.length} Active Project(s)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenClientWorkspace(client)}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-secondary hover:bg-secondary/80 text-foreground transition-colors cursor-pointer"
                  >
                    Client View
                  </button>
                  <Link
                    to="/projects"
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Workspaces →
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Client Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-4"
          >
            <h2 className="text-base font-bold text-foreground">Onboard New Client Account</h2>
            <form onSubmit={handleCreateClient} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Oromia Agro Industry"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Industry</label>
                <input
                  type="text"
                  value={newIndustry}
                  onChange={(e) => setNewIndustry(e.target.value)}
                  placeholder="e.g. Agriculture & Export"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Website URL</label>
                <input
                  type="url"
                  value={newWebsite}
                  onChange={(e) => setNewWebsite(e.target.value)}
                  placeholder="https://company.com"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Operational Scope</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Summary of retained digital assistance services..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg border border-border cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Create Client
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
