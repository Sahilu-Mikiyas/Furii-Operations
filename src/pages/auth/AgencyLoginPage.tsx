import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Shield, ArrowRight, Lock, Mail, Loader2 } from "lucide-react";

export function AgencyLoginPage() {
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

      // Verify role
      const { data: member } = await supabase
        .from("memberships")
        .select("role")
        .eq("user_id", data.user.id)
        .maybeSingle();

      const userRole = member?.role;

      if (userRole === "client" || userRole === "client_owner" || userRole === "client_member") {
        toast.success("Welcome to your Client Workspace.");
        navigate("/portal/overview");
        return;
      }

      toast.success("Welcome to Operations Command.");
      navigate("/admin/dashboard");

    } catch (err: any) {
      toast.error(err.message || "Failed to authenticate.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-neutral-800/40 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[11px] font-mono uppercase tracking-widest text-neutral-300">
          <Shield className="w-3.5 h-3.5 text-white" />
          Agency Command Auth
        </div>

        <img
          src="/brand/furii-logo-horizontal.jpg"
          alt="Furii"
          className="h-9 w-auto mx-auto object-contain my-3 invert brightness-200"
        />

        <h1 className="text-xl font-bold tracking-tight text-white">
          Internal Operations Access
        </h1>
        <p className="text-xs text-neutral-400 max-w-sm mx-auto">
          Reserved for Furii agency directors, project managers, and production engineers.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-[#1A1A1A] py-8 px-6 sm:px-8 shadow-2xl rounded-2xl border border-neutral-800 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-neutral-500" />
                Agency Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@furii.agency"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-500 focus:outline-hidden focus:border-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-neutral-500" />
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-500 focus:outline-hidden focus:border-white transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-white text-black hover:bg-neutral-200 transition-colors shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Verifying Credentials...
                </>
              ) : (
                <>
                  Enter Operations Center
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-neutral-800 text-center text-xs text-neutral-400">
            Are you a retained client stakeholder?{" "}
            <Link to="/portal/login" className="font-semibold text-white hover:underline block mt-1">
              Go to Dedicated Client Workspace Login →
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
