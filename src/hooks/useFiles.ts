import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { FileRecord, Visibility } from "@/types";
import { useAuth } from "@/lib/auth";

export function useFiles(clientId?: string, serviceId?: string) {
  const queryClient = useQueryClient();
  const { user, role } = useAuth();

  const isClientRole = role === "client" || role === "client_owner" || role === "client_member";

  const query = useQuery({
    queryKey: ["files", clientId || "all", serviceId || "all", role, user?.id],
    queryFn: async (): Promise<FileRecord[]> => {
      let req = supabase.from("files").select("*").order("created_at", { ascending: false });

      if (clientId) req = req.eq("client_id", clientId);
      if (serviceId) req = req.eq("service_id", serviceId);

      // Clients only see files with visibility = 'client'
      if (isClientRole) {
        req = req.eq("visibility", "client");
        if (user?.client_id) {
          req = req.eq("client_id", user.client_id);
        }
      }

      const { data, error } = await req;
      if (error) {
        console.error("Files query error:", error.message);
        return [];
      }

      return (data || []) as FileRecord[];
    },
  });

  // Upload file (Only internal Furii team can upload; clients are download only)
  const uploadFileMutation = useMutation({
    mutationFn: async ({
      file,
      clientId,
      projectId,
      serviceId,
      visibility = "client",
      category = "document",
    }: {
      file: File;
      clientId: string;
      projectId?: string;
      serviceId?: string;
      visibility?: Visibility;
      category?: string;
    }) => {
      if (isClientRole) {
        throw new Error("Clients are granted download-only access to files.");
      }

      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filePath = `${clientId}/${Date.now()}_${sanitizedName}`;

      const { error: uploadErr } = await supabase.storage
        .from("files")
        .upload(filePath, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: publicUrl } = supabase.storage.from("files").getPublicUrl(filePath);

      // Fetch org id
      const { data: clientRow } = await supabase
        .from("clients")
        .select("organization_id")
        .eq("id", clientId)
        .single();

      const { data: fileRow, error: insertErr } = await supabase
        .from("files")
        .insert({
          organization_id: clientRow?.organization_id || "furii-org-01",
          client_id: clientId,
          project_id: projectId || null,
          service_id: serviceId || null,
          name: file.name,
          file_url: publicUrl.publicUrl,
          file_key: filePath,
          file_size: file.size,
          file_type: file.type || "application/octet-stream",
          category,
          visibility,
          uploaded_by: user?.id || null,
        })
        .select()
        .single();

      if (insertErr) throw insertErr;
      return fileRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });

  // Delete file (internal manager only)
  const deleteFileMutation = useMutation({
    mutationFn: async (file: { id: string; file_key?: string | null }) => {
      if (isClientRole) {
        throw new Error("Clients are not permitted to delete files.");
      }

      if (file.file_key) {
        try {
          await supabase.storage.from("files").remove([file.file_key]);
        } catch (storageErr) {
          console.warn("Storage deletion error (ignored):", storageErr);
        }
      }

      const { error } = await supabase.from("files").delete().eq("id", file.id);
      if (error) throw error;
      return file.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });

  return {
    ...query,
    files: query.data || [],
    uploadFile: uploadFileMutation.mutateAsync,
    isUploading: uploadFileMutation.isPending,
    deleteFile: deleteFileMutation.mutateAsync,
    isDeleting: deleteFileMutation.isPending,
    canUpload: !isClientRole,
  };
}
