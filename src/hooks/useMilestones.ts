import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Milestone, MilestoneStatus } from "@/types";

export function useMilestones(serviceId?: string, projectId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["milestones", serviceId || "all", projectId || "all"],
    queryFn: async (): Promise<Milestone[]> => {
      let req = supabase.from("milestones").select("*").order("due_date", { ascending: true });

      if (serviceId) req = req.eq("service_id", serviceId);
      if (projectId) req = req.eq("project_id", projectId);

      const { data, error } = await req;
      if (error || !data || data.length === 0) {
        return [];
      }

      return data as Milestone[];
    },
  });

  const updateMilestoneMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: MilestoneStatus }) => {
      const updateData: Record<string, any> = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (status === "completed") {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("milestones")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["milestones"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  const createMilestoneMutation = useMutation({
    mutationFn: async (newMilestone: Partial<Milestone>) => {
      const payload = {
        organization_id: newMilestone.organization_id || "72e3ff6d-96e6-4cc6-b904-d07327f43b29",
        project_id: newMilestone.project_id,
        service_id: newMilestone.service_id,
        client_id: newMilestone.client_id,
        title: newMilestone.title,
        description: newMilestone.description || "",
        status: newMilestone.status || "planned",
        due_date: newMilestone.due_date || null,
        order_index: newMilestone.order_index ?? 0,
      };

      const { data, error } = await supabase.from("milestones").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["milestones"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  const deleteMilestoneMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("milestones").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["milestones"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });

  return {
    ...query,
    milestones: query.data || [],
    updateMilestoneStatus: updateMilestoneMutation.mutateAsync,
    createMilestone: createMilestoneMutation.mutateAsync,
    deleteMilestone: deleteMilestoneMutation.mutateAsync,
  };
}

