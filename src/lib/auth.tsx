import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { UserRole, Profile, Membership, Client } from "@/types";

export interface AuthContextType {
  user: Profile | null;
  role: UserRole;
  currentClient: Client | null;
  setCurrentClient: (client: Client | null) => void;
  workspaceMode: "admin" | "client";
  setWorkspaceMode: (mode: "admin" | "client") => void;
  currency: "ETB" | "USD";
  setCurrency: (currency: "ETB" | "USD") => void;
  isLoading: boolean;
  signOut: () => Promise<void>;
  switchRole: (role: UserRole) => void;
}

// Default Furii Admin User for seamless initial experience and testing
export const DEMO_ADMIN: Profile = {
  id: "admin-furii-01",
  organization_id: "furii-org-01",
  email: "admin@furii.agency",
  full_name: "Mikiyas Sahilu",
  title: "Founder & Creative Director",
  avatar_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEMO_CLIENT: Client = {
  id: "client-ersas-01",
  organization_id: "furii-org-01",
  name: "Ersas Interiors",
  slug: "ersas-interiors",
  industry: "Interior Design & Architecture",
  description: "High-end contemporary interior architecture and residential renovations.",
  website: "https://ersasinteriors.com",
  status: "active",
  health_status: "on_track",
  start_date: "2026-08-01",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(DEMO_ADMIN);
  const [role, setRole] = useState<UserRole>("super_admin");
  const [currentClient, setCurrentClient] = useState<Client | null>(DEMO_CLIENT);
  const [workspaceMode, setWorkspaceMode] = useState<"admin" | "client">("admin");
  const [currency, setCurrency] = useState<"ETB" | "USD">("ETB");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check real Supabase session if present
    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const authUser = session.user;
          setUser((prev) => ({
            id: authUser.id,
            organization_id: prev?.organization_id || "furii-org-01",
            email: authUser.email || "user@furii.agency",
            full_name: (authUser.user_metadata?.full_name as string) || "Mikiyas Sahilu",
            title: (authUser.user_metadata?.title as string) || "Team Member",
            created_at: authUser.created_at,
            updated_at: new Date().toISOString(),
          }));
        }
      } catch (err) {
        console.warn("Auth session check notice:", err);
      }
    }
    checkSession();
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === "client_owner" || newRole === "client_member") {
      setWorkspaceMode("client");
    } else {
      setWorkspaceMode("admin");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        currentClient,
        setCurrentClient,
        workspaceMode,
        setWorkspaceMode,
        currency,
        setCurrency,
        isLoading,
        signOut,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
