import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Project } from "@/types";

export function useProjects(clientId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["projects", clientId || "all"],
    queryFn: async (): Promise<Project[]> => {
      let req = supabase
        .from("projects")
        .select(`*, services(id, name, service_type, status, progress)`)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      if (clientId) req = req.eq("client_id", clientId);
      const { data, error } = await req;
      if (error) {
        console.error("Projects query error:", error.message);
        return [];
      }
      return (data || []) as Project[];
    },
  });




  const createProjectMutation = useMutation({
    mutationFn: async (newProject: Partial<Project>) => {
      let orgId = newProject.organization_id;
      if (!orgId) {
        const { data: org } = await supabase.from("organizations").select("id").limit(1).single();
        orgId = org?.id || "furii-org-01";
      }

      const payload = {
        organization_id: orgId,
        client_id: newProject.client_id,
        name: newProject.name,
        description: newProject.description || "",
        status: newProject.status || "active",
        start_date: newProject.start_date || new Date().toISOString().split("T")[0],
        end_date: newProject.end_date || null,
        budget: newProject.budget || 0,
        budget_currency: newProject.budget_currency || "ETB",
        progress_override: newProject.progress_override ?? 10,
      };

      const { data, error } = await supabase.from("projects").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Project> }) => {
      const { data, error } = await supabase
        .from("projects")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("projects")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  return {
    ...query,
    projects: query.data || [],
    createProject: createProjectMutation.mutateAsync,
    updateProject: updateProjectMutation.mutateAsync,
    deleteProject: deleteProjectMutation.mutateAsync,
    isCreating: createProjectMutation.isPending,
    isUpdating: updateProjectMutation.isPending,
  };
}

