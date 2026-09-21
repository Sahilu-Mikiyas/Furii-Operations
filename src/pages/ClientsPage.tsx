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
  Edit3,
  Trash2,
  KeyRound,
  Archive,
  Receipt,
  Clock,
  FileCheck2,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { useServiceRequests } from "@/hooks/useServiceRequests";


export function ClientsPage() {
  const { role, setCurrentClient } = useAuth();
  const {
    clients,
    createClient,
    updateClient,
    deleteClient,
    archiveClient,
    updateHealth,
    provisionAccount,
    isCreating,
    isUpdating,
    isProvisioning,
  } = useClients();
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

  // Edit Client Modal State
  const [editClientModal, setEditClientModal] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editIndustry, setEditIndustry] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editStatus, setEditStatus] = useState<any>("active");

  // Provision Client Login Modal State
  const [provisionModal, setProvisionModal] = useState<any | null>(null);
  const [provEmail, setProvEmail] = useState("");
  const [provPassword, setProvPassword] = useState("");
  const [provName, setProvName] = useState("");

  // Service Requests Modal State
  const { requests, approveAndLaunchProject, isApprovingAndLaunching, updateStatus } = useServiceRequests();
  const [requestClientModal, setRequestClientModal] = useState<any | null>(null);


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

  const handleEditClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editClientModal || !editName.trim()) return;
    try {
      await updateClient({
        id: editClientModal.id,
        updates: {
          name: editName,
          industry: editIndustry,
          website: editWebsite || null,
          description: editDesc,
          status: editStatus,
        },
      });
      toast.success(`Client "${editName}" updated successfully.`);
      setEditClientModal(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to update client.");
    }
  };

  const handleDeleteClient = async (client: any) => {
    if (!confirm(`Are you sure you want to delete "${client.name}"? This moves the client to archived history.`)) return;
    try {
      await deleteClient(client.id);
      toast.success(`Client "${client.name}" removed.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete client.");
    }
  };

  const handleProvisionAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provisionModal || !provEmail.trim() || !provPassword.trim()) return;
    try {
      await provisionAccount({
        email: provEmail.trim(),
        password: provPassword.trim(),
        fullName: provName.trim() || provisionModal.name,
        clientId: provisionModal.id,
      });
      toast.success(`Client portal account created for ${provEmail}!`);
      setProvisionModal(null);
      setProvEmail("");
      setProvPassword("");
      setProvName("");
    } catch (err: any) {
      toast.error(err.message || "Failed to provision client account.");
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
          const clientRequests = requests.filter((r) => r.client_id === client.id);

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

              {/* Card Action Controls */}
              <div className="pt-3 border-t border-border/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setEditClientModal(client);
                      setEditName(client.name);
                      setEditIndustry(client.industry || "");
                      setEditWebsite(client.website || "");
                      setEditDesc(client.description || "");
                      setEditStatus(client.status || "active");
                    }}
                    title="Edit Client Details"
                    className="p-1.5 rounded-lg border border-border bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      setProvisionModal(client);
                      setProvName(client.name);
                      setProvEmail("");
                      setProvPassword("");
                    }}
                    title="Provision Client Portal Login"
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px] transition-colors cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Login</span>
                  </button>

                  <button
                    onClick={() => setRequestClientModal(client)}
                    title="View Client Service Requests & Receipts"
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border font-semibold text-[11px] transition-colors cursor-pointer ${
                      clientRequests.filter((r) => r.status === "payment_review" || r.status === "pending").length > 0
                        ? "border-amber-500/40 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                        : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Requests ({clientRequests.length})</span>
                  </button>

                  <button
                    onClick={() => handleDeleteClient(client)}
                    title="Delete / Archive Client"
                    className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 justify-end">
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

      {/* Edit Client Modal */}
      {editClientModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Edit Client Profile</h2>
              <StatusBadge status={editStatus} />
            </div>

            <form onSubmit={handleEditClient} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Industry</label>
                  <input
                    type="text"
                    value={editIndustry}
                    onChange={(e) => setEditIndustry(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Website URL</label>
                <input
                  type="url"
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Operational Scope & Notes</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditClientModal(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg border border-border cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Provision Client Login Modal */}
      {provisionModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-foreground">Provision Client Account</h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Instantly create login credentials for <span className="font-semibold text-foreground">{provisionModal.name}</span>.
              </p>
            </div>

            <form onSubmit={handleProvisionAccount} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Contact Name</label>
                <input
                  type="text"
                  required
                  value={provName}
                  onChange={(e) => setProvName(e.target.value)}
                  placeholder="e.g. Solomon Haile"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Login Email</label>
                <input
                  type="email"
                  required
                  value={provEmail}
                  onChange={(e) => setProvEmail(e.target.value)}
                  placeholder="executive@clientcompany.com"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Initial Password</label>
                <input
                  type="text"
                  required
                  minLength={8}
                  value={provPassword}
                  onChange={(e) => setProvPassword(e.target.value)}
                  placeholder="At least 8 characters..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground font-mono focus:outline-hidden"
                />
                <span className="text-[10px] text-muted-foreground block mt-1">
                  The client will log in at <span className="font-mono text-foreground">/portal/login</span>.
                </span>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setProvisionModal(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg border border-border cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProvisioning}
                  className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  {isProvisioning && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Create & Activate Account
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Service Requests & Payment Approvals Modal */}
      {requestClientModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-2xl rounded-2xl border border-border shadow-2xl p-6 space-y-5 max-h-[85vh] flex flex-col"
          >
            <div className="flex items-start justify-between gap-4 border-b border-border/80 pb-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-foreground">
                    Service Requests & Receipts
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground">
                  Review requirements and attached payment slips for{" "}
                  <span className="font-semibold text-foreground">{requestClientModal.name}</span>.
                </p>
              </div>

              <button
                onClick={() => setRequestClientModal(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Requests List */}
            <div className="overflow-y-auto space-y-4 pr-1 flex-1">
              {requests.filter((r) => r.client_id === requestClientModal.id).length === 0 ? (
                <div className="p-8 text-center bg-secondary/30 rounded-xl border border-border space-y-2">
                  <Clock className="w-7 h-7 text-muted-foreground mx-auto" />
                  <div className="text-xs font-semibold text-foreground">No Service Requests</div>
                  <p className="text-[11px] text-muted-foreground">
                    This client has not submitted any service catalog requests yet.
                  </p>
                </div>
              ) : (
                requests
                  .filter((r) => r.client_id === requestClientModal.id)
                  .map((req) => {
                    const isPaymentReview = req.status === "payment_review";
                    const isApproved = req.status === "approved";

                    return (
                      <div
                        key={req.id}
                        className="p-4 rounded-xl border border-border bg-secondary/20 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-secondary text-muted-foreground font-semibold">
                                {req.request_type}
                              </span>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                                  isPaymentReview
                                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                                    : isApproved
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                }`}
                              >
                                {req.status.replace("_", " ")}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-foreground mt-1">{req.title}</h4>
                            {req.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">{req.description}</p>
                            )}
                          </div>

                          <div className="text-left sm:text-right shrink-0">
                            <div className="text-[10px] text-muted-foreground uppercase">Amount</div>
                            <div className="text-base font-bold font-mono text-foreground">
                              {Number(req.estimated_total).toLocaleString()} {req.currency || "ETB"}
                            </div>
                          </div>
                        </div>

                        {/* Attached Receipt Section */}
                        {req.receipt_url && (
                          <div className="p-3 bg-card rounded-lg border border-border/80 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                                <FileCheck2 className="w-3.5 h-3.5 text-purple-500" />
                                Payment Receipt Attached
                              </span>
                              <a
                                href={req.receipt_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                              >
                                View File ↗
                              </a>
                            </div>

                            {req.payment_notes && (
                              <div className="text-xs text-muted-foreground">
                                <span className="font-semibold text-foreground">Notes: </span>
                                {req.payment_notes}
                              </div>
                            )}

                            {req.payment_submitted_at && (
                              <div className="text-[10px] text-muted-foreground">
                                Submitted: {new Date(req.payment_submitted_at).toLocaleString()}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-muted-foreground">
                            Date: {new Date(req.created_at).toLocaleDateString()}
                          </span>

                          <div className="flex items-center gap-2">
                            {!isApproved && (
                              <>
                                <button
                                  onClick={async () => {
                                    try {
                                      await updateStatus({ id: req.id, status: "declined" });
                                      toast.success("Request marked as declined.");
                                    } catch (err: any) {
                                      toast.error(err.message);
                                    }
                                  }}
                                  className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
                                >
                                  Decline
                                </button>

                                <button
                                  disabled={isApprovingAndLaunching}
                                  onClick={async () => {
                                    try {
                                      await approveAndLaunchProject(req);
                                      toast.success(
                                        `Approved! Created Project "${req.title}" in Client's Ongoing stream!`
                                      );
                                    } catch (err: any) {
                                      toast.error(err.message || "Failed to approve and launch project.");
                                    }
                                  }}
                                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5 shadow-2xs"
                                >
                                  <Zap className="w-3.5 h-3.5" />
                                  {isApprovingAndLaunching ? "Launching..." : "Approve & Launch Project"}
                                </button>
                              </>
                            )}

                            {isApproved && (
                              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 flex items-center gap-1">
                                ✓ Approved & Live in Ongoing Tab
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            <div className="pt-3 border-t border-border/80 flex justify-end">
              <button
                onClick={() => setRequestClientModal(null)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-border hover:bg-secondary text-foreground transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>

  );
}
