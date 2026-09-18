import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Client, ClientHealthStatus } from "@/types";
import { MOCK_CLIENTS } from "@/data/mock-data";

export function useClients() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["clients"],
    queryFn: async (): Promise<Client[]> => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.warn("Failed to fetch clients from Supabase, using fallback:", error.message);
        return MOCK_CLIENTS;
      }

      if (!data || data.length === 0) {
        return MOCK_CLIENTS;
      }

      return data as Client[];
    },
  });

  const createClientMutation = useMutation({
    mutationFn: async (newClient: Partial<Client>) => {
      // Fetch default organization id if not provided
      let orgId = newClient.organization_id;
      if (!orgId) {
        const { data: org } = await supabase.from("organizations").select("id").limit(1).single();
        orgId = org?.id || "furii-org-01";
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

  return {
    ...query,
    clients: query.data || [],
    createClient: createClientMutation.mutateAsync,
    updateHealth: updateHealthMutation.mutateAsync,
    isCreating: createClientMutation.isPending,
  };
}
