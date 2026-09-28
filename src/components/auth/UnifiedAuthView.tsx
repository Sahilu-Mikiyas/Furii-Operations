import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
  Loader2,
  Eye,
  EyeOff,
  Building,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { FuriiLogo } from "@/components/shared/FuriiLogo";

interface UnifiedAuthViewProps {
  initialRole?: "agency" | "client";
}

const DEMO_PRESETS = [
  {
    label: "Admin Command",
    email: "admin@furii.agency",
    role: "agency" as const,
    name: "Mikiyas",
  },
  {
    label: "Operations PM",
    email: "pm@furii.agency",
    role: "agency" as const,
    name: "Bezawit",
  },
  {
    label: "Client Partner",
    email: "client@solomongold.et",
    role: "client" as const,
    name: "Solomon Gold",
  },
  {
    label: "Ersas Client",
    email: "mickeysahilu@gmail.com",
    role: "client" as const,
    name: "Ersas Interiors",
  },
];

export function UnifiedAuthView({ initialRole = "agency" }: UnifiedAuthViewProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"agency" | "client">(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showQuickFill, setShowQuickFill] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        const msg = error.message || "";
        if (msg.toLowerCase().includes("invalid login credentials")) {
          throw new Error("Invalid email or password. Please verify your credentials.");
        }
        if (msg.toLowerCase().includes("email not confirmed")) {
          throw new Error("Email confirmation pending. Please contact your operations admin.");
        }
        throw error;
      }

      // Check membership role for correct redirect
      const { data: member } = await supabase
        .from("memberships")
        .select("role, client_id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      const userRole = member?.role;

      if (
        userRole === "client" ||
        userRole === "client_owner" ||
        userRole === "client_member"
      ) {
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

  const handleSelectPreset = (preset: (typeof DEMO_PRESETS)[0]) => {
    setActiveTab(preset.role);
    setEmail(preset.email);
    setPassword("password123");
    toast.info(`Filled credentials for ${preset.label}`);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#111111] flex flex-col justify-between relative overflow-x-hidden selection:bg-neutral-900 selection:text-white">
      {/* Subtle Architectural Dot Pattern (Light & Non-intrusive) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(#000000 1.2px, transparent 1.2px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Top Architecture Header */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 pt-6 sm:pt-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FuriiLogo theme="dark" variant="horizontal" className="h-6 sm:h-7" />
          <div className="hidden sm:block h-4 w-px bg-neutral-200" />
          <span className="hidden sm:inline-block text-[11px] font-mono tracking-tight text-neutral-400">
            Operations Architecture
          </span>
        </div>

        {/* Live System Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-neutral-200 text-[11px] font-mono text-neutral-600 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden xs:inline">System Live</span>
          <span className="text-neutral-300">·</span>
          <span>Encrypted Auth</span>
        </div>
      </header>

      {/* Center Main Stage (No Overlaps, Generous Responsive Spacing) */}
      <main className="relative z-10 w-full max-w-md mx-auto px-4 py-8 sm:py-12 flex flex-col items-center">
        {/* Modern Role Mode Switcher Tabs */}
        <div className="w-full mb-6 p-1 rounded-2xl bg-neutral-100/90 border border-neutral-200/80 flex items-center shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab("agency")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === "agency"
                ? "bg-white text-black shadow-xs font-bold"
                : "text-neutral-500 hover:text-black"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Agency Command</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("client")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === "client"
                ? "bg-white text-black shadow-xs font-bold"
                : "text-neutral-500 hover:text-black"
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Client Workspace</span>
          </button>
        </div>

        {/* Focal White Elevation Card */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full bg-white rounded-3xl border border-neutral-200/90 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.02)] p-6 sm:p-8 space-y-6"
        >
          {/* Card Header */}
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-neutral-100 border border-neutral-200 text-[10px] font-mono uppercase tracking-wider text-neutral-600 mb-1">
              {activeTab === "agency" ? (
                <>
                  <ShieldCheck className="w-3 h-3 text-neutral-800" />
                  <span>Authorized Personnel Only</span>
                </>
              ) : (
                <>
                  <Building className="w-3 h-3 text-neutral-800" />
                  <span>Client Stakeholder Portal</span>
                </>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
              {activeTab === "agency" ? "Sign in to Operations" : "Client Portal Access"}
            </h1>
            <p className="text-xs text-neutral-500 leading-relaxed">
              {activeTab === "agency"
                ? "Access live deliverables, team sprints, financial pipelines, and contracts."
                : "Review milestones, sign off on deliverables, inspect statements, and track shoots."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-700 flex items-center justify-between">
                <span>Work Email</span>
                <span className="text-[10px] text-neutral-400 font-normal font-mono">
                  {activeTab === "agency" ? "@furii.agency" : "corporate domain"}
                </span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    activeTab === "agency"
                      ? "name@furii.agency"
                      : "executive@company.com"
                  }
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-200 bg-neutral-50/60 text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-black focus:ring-1 focus:ring-black/10 focus:outline-hidden transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-neutral-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-neutral-500 hover:text-black font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="w-3 h-3" />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3" />
                      <span>Show</span>
                    </>
                  )}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-200 bg-neutral-50/60 text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-black focus:ring-1 focus:ring-black/10 focus:outline-hidden transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-black text-white hover:bg-neutral-800 active:scale-[0.99] transition-all shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>
                    {activeTab === "agency"
                      ? "Enter Operations Command"
                      : "Enter Client Workspace"}
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Section */}
          <div className="pt-2 border-t border-neutral-100 space-y-2">
            <button
              type="button"
              onClick={() => setShowQuickFill(!showQuickFill)}
              className="w-full flex items-center justify-between text-[11px] font-semibold text-neutral-500 hover:text-black py-1 cursor-pointer transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-amber-500" />
                Quick Test Credentials
              </span>
              <span className="font-mono text-[10px] text-neutral-400">
                {showQuickFill ? "Hide ▲" : "Show ▼"}
              </span>
            </button>

            <AnimatePresence>
              {showQuickFill && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden space-y-1.5 pt-1"
                >
                  <p className="text-[10px] text-neutral-400">
                    Click any preset below to auto-populate credentials:
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {DEMO_PRESETS.map((preset) => (
                      <button
                        key={preset.email}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          email === preset.email
                            ? "border-black bg-neutral-900 text-white shadow-2xs"
                            : "border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-800"
                        }`}
                      >
                        <div className="text-[11px] font-semibold truncate">
                          {preset.label}
                        </div>
                        <div className="text-[10px] opacity-70 truncate font-mono">
                          {preset.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>

      {/* Bottom Architecture Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 pb-6 sm:pb-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-neutral-400 font-mono">
        <div className="flex items-center gap-2">
          <span>Furii Agency Inc.</span>
          <span>·</span>
          <span>Client Operations v2.4</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-neutral-500">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Zero-Trust Session Guard
          </span>
        </div>
      </footer>
    </div>
  );
}
