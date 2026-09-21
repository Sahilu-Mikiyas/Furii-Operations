import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, Lock, Building, Loader2 } from "lucide-react";

export function ClientLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Verify membership
      const { data: member } = await supabase
        .from("memberships")
        .select("role, client_id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      const userRole = member?.role;

      if (userRole === "manager" || userRole === "super_admin" || userRole === "admin" || userRole === "team_member") {
        toast.success("Welcome to Operations Command.");
        navigate("/admin/dashboard");
        return;
      }

      toast.success("Welcome to your Client Workspace.");
      navigate("/portal/overview");
    } catch (err: any) {
      toast.error(err.message || "Invalid client portal credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-border/80 text-[11px] font-medium text-muted-foreground shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Private Client Operations Portal
        </div>

        <img
          src="/brand/furii-logo-horizontal.jpg"
          alt="Furii"
          className="h-9 w-auto mx-auto object-contain my-2"
        />

        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Client Workspace Login
        </h1>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Access your real-time deliverables, work logs, project milestones, and formal review queues.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-border sm:px-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-muted-foreground" />
                Work Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="executive@yourcompany.com"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border/80 bg-[#FAFAFA] text-foreground focus:outline-hidden focus:border-foreground/40 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border/80 bg-[#FAFAFA] text-foreground focus:outline-hidden focus:border-foreground/40 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#111111] text-white hover:bg-black transition-colors shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Enter Client Workspace
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-muted-foreground pt-2 border-t border-border/60">
            Looking for internal agency operations?{" "}
            <Link to="/auth/agency" className="font-semibold text-foreground hover:underline block mt-1">
              Agency Staff Login →
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
