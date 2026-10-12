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

      const rawRole = (member?.role as UserRole) || null;
      
      // Normalize: all admin-type roles → "manager", all client-type → "client"
      // NOTE: No fallback to user_metadata — users can self-edit metadata.
      // No membership row = null role = "account not set up" screen.
      const normalizeRole = (r: UserRole | null): UserRole | null => {
        if (r === "super_admin" || r === "admin" || r === "manager" || r === "team_member" || r === "operations_manager") return "manager";
        if (r === "client_owner" || r === "client_member" || r === "client") return "client";
        return null; // no membership = no role = no access
      };
      const resolvedRole = normalizeRole(rawRole);
      const resolvedClientId = member?.client_id || prof?.client_id || null;

      // Determine if user is truly an internal agency staff member (has a membership with an admin/team role)
      const isInternalStaff = rawRole === "super_admin" || rawRole === "admin" || rawRole === "manager" || rawRole === "team_member" || rawRole === "operations_manager";

      // No membership row at all → show "account not set up" screen
      if (!member && !prof) {
        setUser(null);
        setRole(null);
        setCurrentClient(null);
        setIsLoading(false);
        return;
      }

      const userProfile: Profile = prof || {
        id: authUser.id,
        organization_id: member?.organization_id || "",
        client_id: resolvedClientId,
        email: authUser.email || "",
        full_name: (authUser.user_metadata?.full_name as string) || "Furii User",
        title: (authUser.user_metadata?.title as string) || "",
        created_at: authUser.created_at,
        updated_at: new Date().toISOString(),
      };

      setUser(userProfile);
      setRole(resolvedRole);

      // Load client data based on actual role
      if (resolvedClientId) {
        // Client user with a bound client_id — load ONLY their company
        const { data: clientData } = await supabase
          .from("clients")
          .select("*")
          .eq("id", resolvedClientId)
          .maybeSingle();

        if (clientData) {
          setCurrentClient(clientData as Client);
        }
      } else if (isInternalStaff) {
        // Agency internal roles only: fetch all clients for management views
        const { data: allClients } = await supabase.from("clients").select("*").order("name");
        if (allClients && allClients.length > 0) {
          setAvailableClients(allClients as Client[]);
          setCurrentClient(allClients[0] as Client);
        }
      } else {
        // Client user with no client_id binding — show empty state, NOT another client's data
        setCurrentClient(null);
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
