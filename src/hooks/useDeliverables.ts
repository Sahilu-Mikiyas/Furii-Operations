import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Deliverable } from "@/types";
import { useAuth } from "@/lib/auth";

export function useDeliverables(serviceId?: string, projectId?: string) {
  const queryClient = useQueryClient();
  const { user, role } = useAuth();
  const isClientRole = role === "client" || role === "client_owner" || role === "client_member";

  const query = useQuery({
    queryKey: ["deliverables", serviceId || "all", projectId || "all", role],
    queryFn: async (): Promise<Deliverable[]> => {
      let req = supabase
        .from("deliverables")
        .select(`
          *,
          versions:deliverable_versions(*)
        `)
        .order("created_at", { ascending: false });

      if (serviceId) req = req.eq("service_id", serviceId);
      if (projectId) req = req.eq("project_id", projectId);

      if (isClientRole && user?.client_id) {
        req = req.eq("client_id", user.client_id);
      }

      const { data, error } = await req;
      if (error) {
        console.error("Deliverables query error:", error.message);
        return [];
      }

      return (data || []) as unknown as Deliverable[];
    },
  });

  // Upload deliverable file to Supabase storage and create version record
  const uploadDeliverableMutation = useMutation({
    mutationFn: async ({
      deliverableId,
      file,
      notes,
    }: {
      deliverableId: string;
      file: File;
      notes?: string;
    }) => {
      const fileExt = file.name.split(".").pop();
      const filePath = `deliverables/${deliverableId}_v_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("deliverables")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("deliverables")
        .getPublicUrl(filePath);

      // Get latest version count
      const { data: currentDeliv } = await supabase
        .from("deliverables")
        .select("current_version, organization_id")
        .eq("id", deliverableId)
        .single();

      const nextVersion = (currentDeliv?.current_version || 1) + 1;

      const { data: versionData, error: versionError } = await supabase
        .from("deliverable_versions")
        .insert({
          deliverable_id: deliverableId,
          organization_id: currentDeliv?.organization_id,
          version_number: nextVersion,
          file_url: publicUrlData.publicUrl,
          file_name: file.name,
          file_size: file.size,
          notes: notes || "New revision uploaded.",
          uploaded_by: user?.id || null,
        })
        .select()
        .single();

      if (versionError) throw versionError;

      await supabase
        .from("deliverables")
        .update({
          current_version: nextVersion,
          status: "awaiting_review",
          updated_at: new Date().toISOString(),
        })
        .eq("id", deliverableId);

      return versionData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliverables"] });
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
    },
  });

  return {
    ...query,
    deliverables: query.data || [],
    uploadNewVersion: uploadDeliverableMutation.mutateAsync,
    isUploading: uploadDeliverableMutation.isPending,
  };
}
