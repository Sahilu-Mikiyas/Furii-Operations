import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { WorkRecord, Visibility } from "@/types";
import { useAuth } from "@/lib/auth";

export function useWorkRecords(serviceId?: string, projectId?: string) {
  const queryClient = useQueryClient();
  const { user, role } = useAuth();
  const isClientRole = role === "client" || role === "client_owner" || role === "client_member";

  const query = useQuery({
    queryKey: ["work_records", serviceId || "all", projectId || "all", role, user?.id],
    queryFn: async (): Promise<WorkRecord[]> => {
      let req = supabase.from("work_records").select("*").order("work_date", { ascending: false });

      if (serviceId) req = req.eq("service_id", serviceId);
      if (projectId) req = req.eq("project_id", projectId);

      if (isClientRole) {
        req = req.eq("visibility", "client");
        if (user?.client_id) {
          req = req.eq("client_id", user.client_id);
        }
      }

      const { data, error } = await req;
      if (error) {
        console.error("Work records query error:", error.message);
        return [];
      }

      return (data || []) as WorkRecord[];
    },
  });

  const createRecordMutation = useMutation({
    mutationFn: async (newRecord: Partial<WorkRecord>) => {
      const payload = {
        organization_id: newRecord.organization_id || "furii-org-01",
        project_id: newRecord.project_id,
        service_id: newRecord.service_id,
        client_id: newRecord.client_id,
        title: newRecord.title,
        description: newRecord.description,
        changes: newRecord.changes || null,
        notes: newRecord.notes || null,
        work_date: newRecord.work_date || new Date().toISOString().split("T")[0],
        status: newRecord.status || "published",
        visibility: newRecord.visibility || "client",
        author_id: user?.id || null,
      };

      const { data, error } = await supabase.from("work_records").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work_records"] });
    },
  });

  const deleteRecordMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("work_records").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work_records"] });
    },
  });

  return {
    ...query,
    workRecords: query.data || [],
    records: query.data || [],
    createWorkRecord: createRecordMutation.mutateAsync,
    createRecord: createRecordMutation.mutateAsync,
    deleteWorkRecord: deleteRecordMutation.mutateAsync,
    deleteRecord: deleteRecordMutation.mutateAsync,
    isCreating: createRecordMutation.isPending,
    canCreate: !isClientRole,
  };
}
