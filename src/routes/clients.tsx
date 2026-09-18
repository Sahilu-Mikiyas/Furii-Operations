import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MOCK_CLIENTS, MOCK_PROJECTS } from "@/data/mock-data";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/utils";
import {
  Building2,
  Search,
  Plus,
  Globe,
  MapPin,
  Mail,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/clients")({
  component: ClientsPage,
});

function ClientsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreating, setIsCreating] = useState(false);
  const [clients, setClients] = useState(MOCK_CLIENTS);

  // New Client Form State
  const [newName, setNewName] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  const [newWebsite, setNewWebsite] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.industry?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const created = {
      id: `client-${Date.now()}`,
      organization_id: "furii-org-01",
      name: newName,
      slug: newName.toLowerCase().replace(/\s+/g, "-"),
      industry: newIndustry || "Technology & Design",
      description: newDesc || "Client onboarded into Furii operations.",
      website: newWebsite || "https://example.com",
      status: "active" as const,
      health_status: "on_track" as const,
      start_date: new Date().toISOString().split("T")[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setClients([created, ...clients]);
    setNewName("");
    setNewIndustry("");
    setNewWebsite("");
    setNewDesc("");
    setIsCreating(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Client Accounts"
        description="Comprehensive management of client profiles, company contacts, and operational health."
        actions={
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs"
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
            className="text-xs bg-secondary/70 border border-border/80 rounded-lg px-2.5 py-1.5 text-foreground focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Clients</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Create Client Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground">Onboard New Client</h2>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Hospitality Group"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Industry</label>
                <input
                  type="text"
                  placeholder="e.g. Luxury Real Estate & Hotels"
                  value={newIndustry}
                  onChange={(e) => setNewIndustry(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Website URL</label>
                <input
                  type="url"
                  placeholder="https://apexhospitality.com"
                  value={newWebsite}
                  onChange={(e) => setNewWebsite(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Brief Description</label>
                <textarea
                  rows={3}
                  placeholder="Core business, target audience, and primary engagement scope..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClients.map((client) => {
          const clientProjects = MOCK_PROJECTS.filter((p) => p.client_id === client.id);

          return (
            <div
              key={client.id}
              className="p-5 rounded-2xl bg-card border border-border shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-primary font-bold text-sm border border-border">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{client.name}</h3>
                      <p className="text-[11px] text-muted-foreground">{client.industry}</p>
                    </div>
                  </div>
                  <StatusBadge status={client.health_status || "on_track"} />
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {client.description}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
                  {client.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-3 w-3 shrink-0" />
                      <a
                        href={client.website}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline text-foreground truncate flex items-center gap-1"
                      >
                        {client.website.replace(/^https?:\/\//, "")}
                        <ExternalLink className="h-2.5 w-2.5 text-muted-foreground" />
                      </a>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{client.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                <span className="font-mono text-muted-foreground">
                  {clientProjects.length} active project(s)
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Since {formatDate(client.start_date, "MMM yyyy")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
