import { useState } from "react";
import { MOCK_PROFILES } from "@/data/mock-data";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAuth } from "@/lib/auth";
import { Building2, Users } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function SettingsPage() {
  const { currency, setCurrency } = useAuth();
  const [orgName, setOrgName] = useState("Furii");
  const [website, setWebsite] = useState("https://furii.agency");
  const [teamMembers] = useState(MOCK_PROFILES);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Organization settings updated successfully.");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-4xl"
    >
      <PageHeader
        title="Platform & Team Settings"
        description="Configure organization details, team roles, default currencies, and security policies."
      />

      {/* Organization Details */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Agency Identity
        </h3>

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

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </form>

      {/* Team Roster & Roles */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono flex items-center gap-2">
          <Users className="h-4 w-4" />
          Team Roster & Role-Based Access
        </h3>

        <div className="divide-y divide-border/60">
          {teamMembers.map((member) => (
            <div key={member.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center">
                  {member.full_name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">{member.full_name}</p>
                  <p className="text-[11px] text-muted-foreground">{member.email}</p>
                </div>
              </div>

              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-secondary border border-border text-foreground">
                {member.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
