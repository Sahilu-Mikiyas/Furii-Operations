import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FuriiLogo } from "@/components/shared/FuriiLogo";

export function AuthPage() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (error) throw error;

        // If session is already created, navigate immediately
        if (data?.session) {
          toast.success("Account created! Welcome to Furii Operations.");
          navigate("/");
          return;
        }

        // Auto sign-in immediately with no verification wait
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInErr) {
          toast.success("Account created successfully! You can now log in.");
          setIsSignUp(false);
        } else {
          toast.success("Account created! Welcome to Furii Operations.");
          navigate("/");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Welcome back to Furii Operations.");
        navigate("/");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <FuriiLogo
          variant="stacked"
          className="h-16 mx-auto"
        />
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          {isSignUp ? "Create Furii Account" : "Client Operations Portal"}
        </h2>
        <p className="text-xs text-muted-foreground">
          Sign in to access your company's operational records, deliverables, and approvals.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4"
      >
        <div className="bg-card py-8 px-6 shadow-2xl rounded-2xl border border-border sm:px-10 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Mikiyas Sahilu"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In to Operations"}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-medium text-foreground hover:underline cursor-pointer"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Need an account invitation? Contact team"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
