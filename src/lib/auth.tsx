import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { UserRole, Profile, Membership, Client } from "@/types";
import { MOCK_PROFILES, MOCK_CLIENTS } from "@/data/mock-data";

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
  switchRole: (role: UserRole, clientSlug?: string) => void;
  availableClients: Client[];
}

// Preset profiles for instant testing & development
export const ROLE_PRESETS: Record<UserRole, { profile: Profile; defaultMode: "admin" | "client"; clientSlug?: string }> = {
  super_admin: {
    profile: {
      id: "user-mikiyas",
      organization_id: "furii-org-01",
      email: "mikiyas@furii.agency",
      full_name: "Mikiyas Sahilu",
      title: "Founder & Creative Director",
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    defaultMode: "admin",
  },
  admin: {
    profile: {
      id: "user-bezawit",
      organization_id: "furii-org-01",
      email: "bezawit@furii.agency",
      full_name: "Bezawit Habte",
      title: "Head of Project Operations",
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    defaultMode: "admin",
  },
  team_member: {
    profile: {
      id: "user-dawi",
      organization_id: "furii-org-01",
      email: "dawi@furii.agency",
      full_name: "Dawit K.",
      title: "Senior Full-Stack Developer",
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    defaultMode: "admin",
  },
  client_owner: {
    profile: {
      id: "user-solomon-owner",
      organization_id: "furii-org-01",
      client_id: "client-solomon",
      email: "director@solomongold.et",
      full_name: "Solomon T.",
      title: "Managing Director",
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    defaultMode: "client",
    clientSlug: "solomon-gold",
  },
  client_member: {
    profile: {
      id: "user-abyssinia-member",
      organization_id: "furii-org-01",
      client_id: "client-abyssinia",
      email: "ops@abyssiniacoffee.com",
      full_name: "Hanna B.",
      title: "Export & Brand Specialist",
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    defaultMode: "client",
    clientSlug: "abyssinia-coffee",
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(ROLE_PRESETS.super_admin.profile);
  const [role, setRole] = useState<UserRole>("super_admin");
  const [currentClient, setCurrentClient] = useState<Client | null>(MOCK_CLIENTS[0] || null);
  const [workspaceMode, setWorkspaceMode] = useState<"admin" | "client">("admin");
  const [currency, setCurrencyState] = useState<"ETB" | "USD">(() => {
    return (localStorage.getItem("furii_currency") as "ETB" | "USD") || "ETB";
  });
  const [isLoading, setIsLoading] = useState(false);
  const [availableClients, setAvailableClients] = useState<Client[]>(MOCK_CLIENTS);

  const setCurrency = (c: "ETB" | "USD") => {
    localStorage.setItem("furii_currency", c);
    setCurrencyState(c);
  };

  // Load clients from DB on mount
  useEffect(() => {
    async function loadClients() {
      const { data } = await supabase.from("clients").select("*").order("name");
      if (data && data.length > 0) {
        setAvailableClients(data as Client[]);
        setCurrentClient((prev) => prev || (data[0] as Client));
      }
    }
    loadClients();
  }, []);

  // Sync Supabase Auth session
  useEffect(() => {
    async function checkSession() {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const authUser = session.user;
          
          // Check profile & membership from database
          const [{ data: prof }, { data: member }] = await Promise.all([
            supabase.from("profiles").select("*").eq("id", authUser.id).single(),
            supabase.from("memberships").select("*").eq("user_id", authUser.id).single(),
          ]);

          const userProfile: Profile = prof || {
            id: authUser.id,
            organization_id: member?.organization_id || "furii-org-01",
            client_id: member?.client_id || null,
            email: authUser.email || "user@furii.agency",
            full_name: (authUser.user_metadata?.full_name as string) || "Team Member",
            title: (authUser.user_metadata?.title as string) || "Contributor",
            created_at: authUser.created_at,
            updated_at: new Date().toISOString(),
          };

          setUser(userProfile);

          if (member?.role) {
            setRole(member.role as UserRole);
            if (member.role === "client_owner" || member.role === "client_member") {
              setWorkspaceMode("client");
            } else {
              setWorkspaceMode("admin");
            }
          }

          if (member?.client_id) {
            const { data: clientData } = await supabase.from("clients").select("*").eq("id", member.client_id).single();
            if (clientData) setCurrentClient(clientData as Client);
          }
        }
      } catch (err) {
        console.warn("Auth initialization notice:", err);
      } finally {
        setIsLoading(false);
      }
    }

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        checkSession();
      } else {
        // Reset to default super admin demo
        setUser(ROLE_PRESETS.super_admin.profile);
        setRole("super_admin");
        setWorkspaceMode("admin");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setUser(ROLE_PRESETS.super_admin.profile);
    setRole("super_admin");
    setWorkspaceMode("admin");
  };

  const switchRole = (newRole: UserRole, clientSlug?: string) => {
    setRole(newRole);
    const preset = ROLE_PRESETS[newRole];
    setUser(preset.profile);
    setWorkspaceMode(preset.defaultMode);

    if (preset.defaultMode === "client") {
      const targetSlug = clientSlug || preset.clientSlug || "solomon-gold";
      const targetClient = availableClients.find((c) => c.slug === targetSlug) || availableClients[0];
      if (targetClient) setCurrentClient(targetClient);
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
        availableClients,
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
