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

  return {
    ...query,
    approvals: query.data || [],
    approveDeliverable: approveMutation.mutateAsync,
    requestChanges: requestChangesMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    isRequestingChanges: requestChangesMutation.isPending,
  };
}
