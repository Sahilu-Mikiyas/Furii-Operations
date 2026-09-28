import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Client, ClientHealthStatus } from "@/types";

export function useClients() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["clients"],
    queryFn: async (): Promise<Client[]> => {
      const { data, error } = await supabase
        .from("clients")
        .select(`*, contacts:client_contacts(*)`)
        .is("deleted_at", null)
        .order("name", { ascending: true });

      if (error) {
        console.error("Clients query error:", error.message);
        return [];
      }
      return (data || []) as Client[];
    },
  });


  const createClientMutation = useMutation({
    mutationFn: async (newClient: Partial<Client>) => {
      // Fetch default organization id if not provided
      let orgId = newClient.organization_id;
      if (!orgId) {
        const { data: org } = await supabase.from("organizations").select("id").limit(1).single();
        orgId = org?.id || "72e3ff6d-96e6-4cc6-b904-d07327f43b29";
      }

      const payload = {
        organization_id: orgId,
        name: newClient.name,
        slug: newClient.slug || newClient.name?.toLowerCase().replace(/\s+/g, "-"),
        industry: newClient.industry || "Digital & Technology",
        description: newClient.description || "",
        website: newClient.website || null,
        status: newClient.status || "active",
        health_status: newClient.health_status || "on_track",
        start_date: newClient.start_date || new Date().toISOString().split("T")[0],
      };

      const { data, error } = await supabase.from("clients").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const updateHealthMutation = useMutation({
    mutationFn: async ({ id, health_status }: { id: string; health_status: ClientHealthStatus }) => {
      const { data, error } = await supabase
        .from("clients")
        .update({ health_status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const updateClientMutation = useMutation({

    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Client> }) => {
      const { data, error } = await supabase
        .from("clients")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const archiveClientMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("clients")
        .update({
          status: "archived",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("clients")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const provisionAccountMutation = useMutation({
    mutationFn: async ({
      email,
      password,
      fullName,
      clientId,
    }: {
      email: string;
      password: string;
      fullName: string;
      clientId: string;
    }) => {
      const { data, error } = await supabase.rpc("provision_client_account", {
        p_email: email,
        p_password: password,
        p_full_name: fullName,
        p_client_id: clientId,
      });
      if (error) throw error;
      return data;
    },
  });

  return {
    ...query,
    clients: query.data || [],
    createClient: createClientMutation.mutateAsync,
    updateClient: updateClientMutation.mutateAsync,
    archiveClient: archiveClientMutation.mutateAsync,
    deleteClient: deleteClientMutation.mutateAsync,
    updateHealth: updateHealthMutation.mutateAsync,
    provisionAccount: provisionAccountMutation.mutateAsync,
    isCreating: createClientMutation.isPending,
    isUpdating: updateClientMutation.isPending,
    isProvisioning: provisionAccountMutation.isPending,
  };
}

