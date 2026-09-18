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

  return {
    ...query,
    milestones: query.data || [],
    updateMilestoneStatus: updateMilestoneMutation.mutateAsync,
  };
}
