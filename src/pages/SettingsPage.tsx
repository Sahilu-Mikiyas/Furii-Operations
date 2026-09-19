import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Users, Plus, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { UserRole } from "@/types";

export function SettingsPage() {
  const { currency, setCurrency, role, user } = useAuth();
  const [orgName, setOrgName] = useState("Furii");
  const [website, setWebsite] = useState("https://furii.agency");

  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("team_member");
  const [inviteTitle, setInviteTitle] = useState("");
  const [submittingInvite, setSubmittingInvite] = useState(false);

  const isSuperAdmin = role === "super_admin";

  const fetchTeam = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          email,
          title,
          memberships:memberships(role)
        `);

      if (!error && data && data.length > 0) {
        setTeamMembers(
          data.map((p: any) => ({
            id: p.id,
            full_name: p.full_name,
            email: p.email,
            title: p.title || "Specialist",
            role: p.memberships?.[0]?.role || "team_member",
          }))
        );
      }
    } catch (err) {
      console.warn("Team fetch notice:", err);
    } finally {
      setLoadingTeam(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleSaveAgency = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Agency identity updated successfully.");
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;
    setSubmittingInvite(true);

    try {
      // Create record in profiles table
      const newUserId = `user-${Date.now()}`;
      await supabase.from("profiles").insert({
        id: newUserId,
        organization_id: "72e3ff6d-96e6-4cc6-b904-d07327f43b29",
        email: inviteEmail,
        full_name: inviteName,
        title: inviteTitle || "Contributor",
      });

      await supabase.from("memberships").insert({
        organization_id: "72e3ff6d-96e6-4cc6-b904-d07327f43b29",
        user_id: newUserId,
        role: inviteRole,
        is_active: true,
      });

      toast.success(`Invitation created for ${inviteEmail}.`);
      setInviteName("");
      setInviteEmail("");
      setInviteTitle("");
      setShowInviteModal(false);
      fetchTeam();
    } catch (err: any) {
      toast.error(err.message || "Failed to create invitation.");
    } finally {
      setSubmittingInvite(false);
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
        title="Platform & Agency Settings"
        description="Configure agency identity, manage internal team roster, and set operational defaults."
      />

      {/* Organization Details */}
      <form onSubmit={handleSaveAgency} className="p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Agency Identity
          </h3>
          {!isSuperAdmin && (
            <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded border border-border">
              Read-Only (Super Admin Required)
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Company Name</label>
            <input
              type="text"
              disabled={!isSuperAdmin}
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden disabled:opacity-60"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Website URL</label>
            <input
              type="text"
              disabled={!isSuperAdmin}
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden disabled:opacity-60"
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
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary text-muted-foreground border-border"
              }`}
            >
              ETB — Ethiopian Birr
            </button>
            <button
              type="button"
              onClick={() => setCurrency("USD")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                currency === "USD"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary text-muted-foreground border-border"
              }`}
            >
              USD — United States Dollar
            </button>
          </div>
        </div>

        {isSuperAdmin && (
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Save Agency Profile
            </button>
          </div>
        )}
      </form>

      {/* Team Roster & Roles */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team Roster & Roles
            </h3>
            <p className="text-xs text-muted-foreground">Internal agency staff and operational roles.</p>
          </div>

          {isSuperAdmin && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Invite Member
            </button>
          )}
        </div>

        {loadingTeam ? (
          <div className="py-6 flex justify-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {teamMembers.map((member) => (
              <div key={member.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center">
                    {member.full_name ? member.full_name.slice(0, 2).toUpperCase() : "TM"}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{member.full_name}</p>
                    <p className="text-[11px] text-muted-foreground">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-secondary border border-border text-foreground">
                    {member.title}
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
                    {String(member.role).replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-4"
          >
            <h2 className="text-base font-bold text-foreground">Invite Team Member</h2>
            <form onSubmit={handleInviteMember} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Alazar Mengistu"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@furii.agency"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Platform Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  >
                    <option value="team_member">Team Member</option>
                    <option value="admin">Project Manager</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Job Title</label>
                  <input
                    type="text"
                    value={inviteTitle}
                    onChange={(e) => setInviteTitle(e.target.value)}
                    placeholder="e.g. UI/UX Designer"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg border border-border cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingInvite}
                  className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {submittingInvite && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Create Team Member
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
