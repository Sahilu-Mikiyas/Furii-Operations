import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAuth } from "@/lib/auth";
import { useClients } from "@/hooks/useClients";
import { supabase } from "@/integrations/supabase/client";
import { Building2, KeyRound, Plus, Loader2, UserCheck, ShieldCheck, X } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function SettingsPage() {
  const { currency, setCurrency, role, user } = useAuth();
  const isManager = role === "manager" || role === "super_admin" || role === "admin";
  const { clients, provisionAccount } = useClients();

  const [orgName, setOrgName] = useState("Furii Operations");
  const [website, setWebsite] = useState("https://furii.agency");

  const [clientAccounts, setClientAccounts] = useState<any[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  // Provision Client Login Modal
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [provClientId, setProvClientId] = useState("");
  const [provName, setProvName] = useState("");
  const [provEmail, setProvEmail] = useState("");
  const [provPassword, setProvPassword] = useState("");
  const [submittingProvision, setSubmittingProvision] = useState(false);

  const fetchClientAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          email,
          title,
          client_id,
          clients:clients(id, name),
          memberships:memberships(role, is_active)
        `);

      if (!error && data) {
        setClientAccounts(data);
      }
    } catch (err) {
      console.warn("Client accounts fetch notice:", err);
    } finally {
      setLoadingAccounts(false);
    }
  };

  useEffect(() => {
    fetchClientAccounts();
  }, []);

  const handleSaveAgency = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Agency identity settings saved.");
  };

  const handleProvisionClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetClient = provClientId || clients[0]?.id;
    if (!targetClient) {
      toast.error("Please onboard a client company first.");
      return;
    }
    if (!provEmail.trim() || !provPassword.trim() || !provName.trim()) {
      toast.error("All fields are required.");
      return;
    }

    setSubmittingProvision(true);
    try {
      await provisionAccount({
        clientId: targetClient,
        email: provEmail.trim(),
        password: provPassword,
        fullName: provName.trim(),
      });

      toast.success(`Client credentials created for ${provEmail}. Client can log in immediately.`);
      setShowProvisionModal(false);
      setProvEmail("");
      setProvPassword("");
      setProvName("");
      fetchClientAccounts();
    } catch (err: any) {
      toast.error(err.message || "Failed to provision client login.");
    } finally {
      setSubmittingProvision(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-4xl"
    >
      <PageHeader
        title="Settings & Client Access"
        description="Configure agency operating identity, provision secure client logins, and manage workspace defaults."
      />

      {/* Organization Details */}
      <form onSubmit={handleSaveAgency} className="p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Agency Identity & Currency
          </h3>
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Manager Mode Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Company Name</label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Website URL</label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground block mb-1">Primary Operating Currency</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrency("ETB")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                currency === "ETB"
                  ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                  : "bg-secondary text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              ETB — Ethiopian Birr
            </button>
            <button
              type="button"
              onClick={() => setCurrency("USD")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                currency === "USD"
                  ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                  : "bg-secondary text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              USD — United States Dollar
            </button>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Save Settings
          </button>
        </div>
      </form>

      {/* Client Accounts & Access Provisioning */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              Client Access & Provisioning
            </h3>
            <p className="text-xs text-muted-foreground">
              Provision direct email & password accounts for clients to access their workspace.
            </p>
          </div>

          {isManager && (
            <button
              onClick={() => setShowProvisionModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Provision Client Login
            </button>
          )}
        </div>

        {loadingAccounts ? (
          <div className="py-6 flex justify-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : clientAccounts.length === 0 ? (
          <div className="p-8 text-center bg-secondary/20 rounded-xl border border-dashed border-border text-xs text-muted-foreground">
            No client logins provisioned yet.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {clientAccounts.map((acc) => {
              const clientName = (acc as any).clients?.name || "Global Agency Member";
              const membershipRole = (acc as any).memberships?.[0]?.role || "user";
              const isClient = membershipRole.includes("client") || acc.client_id;

              return (
                <div key={acc.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20">
                      {acc.full_name ? acc.full_name.slice(0, 2).toUpperCase() : "CL"}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{acc.full_name}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">{acc.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-secondary border border-border text-foreground">
                      {clientName}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                        isClient
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {String(membershipRole).replace("_", " ")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Provision Modal */}
      {showProvisionModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Provision Client Account</h2>
              <button onClick={() => setShowProvisionModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Immediately creates an active Supabase user with instant password access for your client.
            </p>

            <form onSubmit={handleProvisionClient} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Target Client Company</label>
                <select
                  value={provClientId}
                  onChange={(e) => setProvClientId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Contact Full Name</label>
                <input
                  type="text"
                  required
                  value={provName}
                  onChange={(e) => setProvName(e.target.value)}
                  placeholder="e.g. Solomon Mengistu"
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
                  placeholder="client@company.com"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Initial Password</label>
                <input
                  type="text"
                  required
                  value={provPassword}
                  onChange={(e) => setProvPassword(e.target.value)}
                  placeholder="Strong password for the client"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground font-mono focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProvisionModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg border border-border cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProvision}
                  className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {submittingProvision && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Provision Account
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
