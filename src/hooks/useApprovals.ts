import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Approval, ApprovalStatus } from "@/types";
import { useAuth } from "@/lib/auth";

export function useApprovals(clientId?: string) {
  const queryClient = useQueryClient();
  const { user, role } = useAuth();
  const isClientRole = role === "client" || role === "client_owner" || role === "client_member";

  const query = useQuery({
    queryKey: ["approvals", clientId || "all", role, user?.id],
    queryFn: async (): Promise<Approval[]> => {
      let req = supabase
        .from("approvals")
        .select(`
          *,
          deliverable:deliverables(id, name, title, category, status, current_version),
          deliverable_version:deliverable_versions(id, version_number, file_url, file_name, file_size, notes)
        `)
        .order("created_at", { ascending: false });

      if (clientId) {
        req = req.eq("client_id", clientId);
      } else if (isClientRole && user?.client_id) {
        req = req.eq("client_id", user.client_id);
      }

      const { data, error } = await req;
      if (error) {
        console.error("Approvals query error:", error.message);
        return [];
      }

      return (data || []) as unknown as Approval[];
    },
  });

  // Client owner approves deliverable
  const approveMutation = useMutation({
    mutationFn: async ({ id, comment }: { id: string; comment?: string }) => {
      const { data, error } = await supabase
        .from("approvals")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id || null,
          client_comment: comment || "Approved without conditions.",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Also update deliverable status if present
      if (data.deliverable_id) {
        await supabase
          .from("deliverables")
          .update({ status: "approved", updated_at: new Date().toISOString() })
          .eq("id", data.deliverable_id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
      queryClient.invalidateQueries({ queryKey: ["deliverables"] });
    },
  });

  // Client owner requests changes
  const requestChangesMutation = useMutation({
    mutationFn: async ({ id, comment }: { id: string; comment: string }) => {
      const { data, error } = await supabase
        .from("approvals")
        .update({
          status: "changes_requested",
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id || null,
          client_comment: comment,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Also update deliverable status
      if (data.deliverable_id) {
        await supabase
          .from("deliverables")
          .update({ status: "changes_requested", updated_at: new Date().toISOString() })
          .eq("id", data.deliverable_id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
      queryClient.invalidateQueries({ queryKey: ["deliverables"] });
    },
  });

  // Create new approval request
  const createApprovalMutation = useMutation({
    mutationFn: async (payload: {
      client_id: string;
      project_id: string;
      service_id?: string | null;
      deliverable_id?: string | null;
      deliverable_version_id?: string | null;
      title: string;
      description?: string | null;
      status?: ApprovalStatus;
    }) => {
      const { data: clientRow } = await supabase
        .from("clients")
        .select("organization_id")
        .eq("id", payload.client_id)
        .single();

      const insertPayload: any = {
        organization_id: clientRow?.organization_id || "72e3ff6d-96e6-4cc6-b904-d07327f43b29",
        client_id: payload.client_id,
        project_id: payload.project_id,
        service_id: payload.service_id || null,
        deliverable_id: payload.deliverable_id || null,
        deliverable_version_id: payload.deliverable_version_id || null,
        title: payload.title,
        description: payload.description || null,
        status: payload.status || "awaiting_review",
        requested_by: user?.id || null,
        requested_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("approvals")
        .insert(insertPayload)
        .select(`
          *,
          deliverable:deliverables(id, name, title, category, status, current_version),
          deliverable_version:deliverable_versions(id, version_number, file_url, file_name, file_size, notes)
        `)
        .single();

      if (error) throw error;

      // Update linked deliverable status to in_review if provided
      if (payload.deliverable_id) {
        await supabase
          .from("deliverables")
          .update({ status: "in_review", updated_at: new Date().toISOString() })
          .eq("id", payload.deliverable_id);
      }

      return data as unknown as Approval;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
      queryClient.invalidateQueries({ queryKey: ["deliverables"] });
    },
  });

  // Update approval info or status
  const updateApprovalMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Approval>) => {
      const { data, error } = await supabase
        .from("approvals")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select(`
          *,
          deliverable:deliverables(id, name, title, category, status, current_version),
          deliverable_version:deliverable_versions(id, version_number, file_url, file_name, file_size, notes)
        `)
        .single();

      if (error) throw error;
      return data as unknown as Approval;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
      queryClient.invalidateQueries({ queryKey: ["deliverables"] });
    },
  });

  // Delete approval
  const deleteApprovalMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("approvals").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
    },
  });

  return {
    ...query,
    approvals: query.data || [],
    approveDeliverable: approveMutation.mutateAsync,
    requestChanges: requestChangesMutation.mutateAsync,
    createApproval: createApprovalMutation.mutateAsync,
    updateApproval: updateApprovalMutation.mutateAsync,
    deleteApproval: deleteApprovalMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    isRequestingChanges: requestChangesMutation.isPending,
    isCreatingApproval: createApprovalMutation.isPending,
    isUpdatingApproval: updateApprovalMutation.isPending,
  };
}
