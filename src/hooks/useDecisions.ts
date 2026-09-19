import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Decision } from "@/types";
import { useAuth } from "@/lib/auth";

export function useDecisions(serviceId?: string, projectId?: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["decisions", serviceId || "all", projectId || "all"],
    queryFn: async (): Promise<Decision[]> => {
      let req = supabase.from("decisions").select("*").order("decision_date", { ascending: false });

      if (serviceId) req = req.eq("service_id", serviceId);
      if (projectId) req = req.eq("project_id", projectId);

      const { data, error } = await req;
      if (error || !data || data.length === 0) {
        return [];
      }

      return data as Decision[];
    },
  });

  const createDecisionMutation = useMutation({
    mutationFn: async (newDec: Partial<Decision>) => {
      const payload = {
        organization_id: newDec.organization_id || "72e3ff6d-96e6-4cc6-b904-d07327f43b29",
        project_id: newDec.project_id,
        service_id: newDec.service_id,
        client_id: newDec.client_id,
        title: newDec.title,
        description: newDec.description,
        decision_date: newDec.decision_date || new Date().toISOString().split("T")[0],
        made_by: newDec.made_by || user?.full_name || "Operations Lead",
      };

      const { data, error } = await supabase.from("decisions").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decisions"] });
    },
  });

  const deleteDecisionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("decisions").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decisions"] });
    },
  });

  return {
    ...query,
    decisions: query.data || [],
    createDecision: createDecisionMutation.mutateAsync,
    deleteDecision: deleteDecisionMutation.mutateAsync,
    isCreating: createDecisionMutation.isPending,
  };
}

