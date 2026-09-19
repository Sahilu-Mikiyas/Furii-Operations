import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Service, ServiceStatus } from "@/types";

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
        console.error("Failed to fetch services:", error.message);
        return [];
      }

      return (data || []) as Service[];
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

  const createServiceMutation = useMutation({
    mutationFn: async (newService: Partial<Service>) => {
      let orgId = newService.organization_id;
      if (!orgId) {
        const { data: org } = await supabase.from("organizations").select("id").limit(1).single();
        orgId = org?.id || "72e3ff6d-96e6-4cc6-b904-d07327f43b29";
      }

      const payload = {
        organization_id: orgId,
        project_id: newService.project_id,
        client_id: newService.client_id,
        service_type: newService.service_type || "website",
        name: newService.name,
        description: newService.description || "",
        status: newService.status || "in_progress",
        current_phase: newService.current_phase || "Discovery & Planning",
        progress: newService.progress || 0,
        start_date: newService.start_date || new Date().toISOString().split("T")[0],
      };

      const { data, error } = await supabase.from("services").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("services")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  return {
    ...query,
    services: query.data || [],
    updateProgress: updateProgressMutation.mutateAsync,
    createService: createServiceMutation.mutateAsync,
    deleteService: deleteServiceMutation.mutateAsync,
    isCreatingService: createServiceMutation.isPending,
  };
}

