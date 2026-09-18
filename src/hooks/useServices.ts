import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Service, ServiceStatus } from "@/types";
import { MOCK_SERVICES } from "@/data/mock-data";

export function useServices(projectId?: string, clientId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["services", projectId || "all", clientId || "all"],
    queryFn: async (): Promise<Service[]> => {
      let req = supabase.from("services").select("*").order("created_at", { ascending: true });
      if (projectId) req = req.eq("project_id", projectId);
      if (clientId) req = req.eq("client_id", clientId);

      const { data, error } = await req;
      if (error) {
        console.warn("Failed to fetch services, using fallback:", error.message);
        let list = MOCK_SERVICES;
        if (projectId) list = list.filter((s) => s.project_id === projectId);
        if (clientId) list = list.filter((s) => s.client_id === clientId);
        return list;
      }

      if (!data || data.length === 0) {
        let list = MOCK_SERVICES;
        if (projectId) list = list.filter((s) => s.project_id === projectId);
        if (clientId) list = list.filter((s) => s.client_id === clientId);
        return list;
      }

      return data as Service[];
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ id, progress, status, current_phase }: { id: string; progress: number; status?: ServiceStatus; current_phase?: string }) => {
      const updateData: Record<string, any> = { progress, updated_at: new Date().toISOString() };
      if (status) updateData.status = status;
      if (current_phase) updateData.current_phase = current_phase;

      const { data, error } = await supabase
        .from("services")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  return {
    ...query,
    services: query.data || [],
    updateProgress: updateProgressMutation.mutateAsync,
  };
}
