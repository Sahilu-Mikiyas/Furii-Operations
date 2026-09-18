import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Task, TaskStatus, TaskPriority } from "@/types";
import { MOCK_TASKS } from "@/data/mock-data";
import { useAuth } from "@/lib/auth";

export function useTasks(serviceId?: string, projectId?: string) {
  const queryClient = useQueryClient();
  const { user, role } = useAuth();

  const query = useQuery({
    queryKey: ["tasks", serviceId || "all", projectId || "all", role, user?.id],
    queryFn: async (): Promise<Task[]> => {
      let req = supabase.from("tasks").select("*").order("created_at", { ascending: false });

      if (serviceId) req = req.eq("service_id", serviceId);
      if (projectId) req = req.eq("project_id", projectId);

      // Role-based filtering
      if (role === "team_member" && user?.id) {
        req = req.eq("assignee_id", user.id);
      } else if (role === "client_owner" || role === "client_member") {
        if (user?.client_id) {
          req = req.eq("client_id", user.client_id);
        }
        req = req.eq("visibility", "client");
      }

      const { data, error } = await req;
      if (error) {
        console.warn("Tasks query notice, falling back:", error.message);
        let list = MOCK_TASKS;
        if (serviceId) list = list.filter((t) => t.service_id === serviceId);
        if (role === "team_member") list = list.filter((t) => t.assignee_id === user?.id);
        return list;
      }

      if (!data || data.length === 0) {
        let list = MOCK_TASKS;
        if (serviceId) list = list.filter((t) => t.service_id === serviceId);
        return list;
      }

      return data as Task[];
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

  return {
    ...query,
    tasks: query.data || [],
    updateStatus: updateStatusMutation.mutateAsync,
    createTask: createTaskMutation.mutateAsync,
    isUpdating: updateStatusMutation.isPending,
  };
}
