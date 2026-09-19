import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Task, TaskStatus, TaskPriority } from "@/types";
import { useAuth } from "@/lib/auth";

export function useTasks(serviceId?: string, projectId?: string) {
  const queryClient = useQueryClient();
  const { user, role } = useAuth();
  const isClientRole = role === "client" || role === "client_owner" || role === "client_member";

  const query = useQuery({
    queryKey: ["tasks", serviceId || "all", projectId || "all", role, user?.id],
    queryFn: async (): Promise<Task[]> => {
      let req = supabase.from("tasks").select("*").is("deleted_at", null).order("created_at", { ascending: false });

      if (serviceId) req = req.eq("service_id", serviceId);
      if (projectId) req = req.eq("project_id", projectId);

      // Client filtering: only viewable client tasks belonging to their client ID
      if (isClientRole) {
        if (user?.client_id) {
          req = req.eq("client_id", user.client_id);
        }
        req = req.eq("visibility", "client");
      }

      const { data, error } = await req;
      if (error) {
        console.error("Tasks query error:", error.message);
        return [];
      }

      return (data || []) as Task[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      const updatePayload: Record<string, any> = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (status === "completed") {
        updatePayload.completed_at = new Date().toISOString();
      } else {
        updatePayload.completed_at = null;
      }

      const { data, error } = await supabase
        .from("tasks")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (newTask: Partial<Task>) => {
      let orgId = newTask.organization_id;
      if (!orgId) {
        const { data: org } = await supabase.from("organizations").select("id").limit(1).single();
        orgId = org?.id || "furii-org-01";
      }

      const payload = {
        organization_id: orgId,
        project_id: newTask.project_id,
        service_id: newTask.service_id || null,
        client_id: newTask.client_id,
        title: newTask.title,
        description: newTask.description || "",
        status: newTask.status || "planned",
        priority: newTask.priority || "medium",
        due_date: newTask.due_date || null,
        assignee_id: newTask.assignee_id || null,
        creator_id: user?.id || null,
        visibility: newTask.visibility || "client",
      };

      const { data, error } = await supabase.from("tasks").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      const { data, error } = await supabase
        .from("tasks")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tasks")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  return {
    ...query,
    tasks: query.data || [],
    updateStatus: updateStatusMutation.mutateAsync,
    createTask: createTaskMutation.mutateAsync,
    updateTask: updateTaskMutation.mutateAsync,
    deleteTask: deleteTaskMutation.mutateAsync,
    isUpdating: updateStatusMutation.isPending || updateTaskMutation.isPending,
  };
}

