import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { UserRole, Profile, Client } from "@/types";

export interface AuthContextType {
  user: Profile | null;
  role: UserRole | null;
  currentClient: Client | null;
  setCurrentClient: (client: Client | null) => void;
  currency: "ETB" | "USD";
  setCurrency: (currency: "ETB" | "USD") => void;
  isLoading: boolean;
  signOut: () => Promise<void>;
  availableClients: Client[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [availableClients, setAvailableClients] = useState<Client[]>([]);
  const [currency, setCurrencyState] = useState<"ETB" | "USD">(() => {
    return (localStorage.getItem("furii_currency") as "ETB" | "USD") || "ETB";
  });
  const [isLoading, setIsLoading] = useState(true);

  const setCurrency = (c: "ETB" | "USD") => {
    localStorage.setItem("furii_currency", c);
    setCurrencyState(c);
  };

  // Sync Supabase Auth Session
  const syncSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setUser(null);
        setRole(null);
        setCurrentClient(null);
        setIsLoading(false);
        return;
      }

      const authUser = session.user;

      // 1. Fetch Profile and Membership from live database
      const [{ data: prof }, { data: member }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", authUser.id).maybeSingle(),
        supabase.from("memberships").select("*").eq("user_id", authUser.id).maybeSingle(),
      ]);

      const rawRole = (member?.role as UserRole) || (authUser.user_metadata?.role as UserRole) || "client";
      
      // Normalize: all admin-type roles → "manager", all client-type → "client"
      const normalizeRole = (r: UserRole): UserRole => {
        if (r === "super_admin" || r === "admin" || r === "manager") return "manager";
        if (r === "client_owner" || r === "client_member" || r === "client") return "client";
        return "client"; // safe fallback
      };
      const resolvedRole = normalizeRole(rawRole);
      const resolvedClientId = member?.client_id || prof?.client_id || null;


      const userProfile: Profile = prof || {
        id: authUser.id,
        organization_id: member?.organization_id || "72e3ff6d-96e6-4cc6-b904-d07327f43b29",
        client_id: resolvedClientId,
        email: authUser.email || "",
        full_name: (authUser.user_metadata?.full_name as string) || prof?.full_name || "Furii Operator",
        title: (authUser.user_metadata?.title as string) || prof?.title || "Specialist",
        created_at: authUser.created_at,
        updated_at: new Date().toISOString(),
      };

      setUser(userProfile);
      setRole(resolvedRole);

      // If client role, load their company record
      if (resolvedClientId) {
        const { data: clientData } = await supabase
          .from("clients")
          .select("*")
          .eq("id", resolvedClientId)
          .maybeSingle();

        if (clientData) {
          setCurrentClient(clientData as Client);
        }
      } else {
        // Agency internal roles: fetch all clients
        const { data: allClients } = await supabase.from("clients").select("*").order("name");
        if (allClients && allClients.length > 0) {
          setAvailableClients(allClients as Client[]);
          setCurrentClient(allClients[0] as Client);
        }
      }
    } catch (err) {
      console.warn("Auth sync error:", err);
      setUser(null);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    syncSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await syncSession();
      } else {
        setUser(null);
        setRole(null);
        setCurrentClient(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Sign out error:", err);
    } finally {
      setUser(null);
      setRole(null);
      setCurrentClient(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        currentClient,
        setCurrentClient,
        currency,
        setCurrency,
        isLoading,
        signOut,
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
