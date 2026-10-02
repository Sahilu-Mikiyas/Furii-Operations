import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export interface ContractAgreement {
  id: string;
  service_id?: string;
  project_id?: string;
  client_id?: string;
  title: string;
  document_url: string;
  file_name: string;
  file_size?: number;
  status: "pending_signature" | "signed" | "executed";
  version: number;
  created_at: string;
  agreed_terms: boolean;
  signed_by_name?: string | null;
  signed_by_title?: string | null;
  signed_at?: string | null;
  signature_hash?: string | null;
}

export function useContracts(serviceId?: string, projectId?: string, clientId?: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const storageKey = `furii_contract_sig_${serviceId || projectId || "default"}`;

  const query = useQuery({
    queryKey: ["contracts", serviceId || "all", projectId || "all", clientId || "all"],
    queryFn: async (): Promise<ContractAgreement[]> => {
      // 1. Check if contract files exist in Supabase files table
      let req = supabase
        .from("files")
        .select("*")
        .eq("category", "contract")
        .order("created_at", { ascending: false });

      if (serviceId) req = req.eq("service_id", serviceId);
      else if (projectId) req = req.eq("project_id", projectId);
      if (clientId) req = req.eq("client_id", clientId);

      const { data: fileRows } = await req;

      // 2. Read local stored signatures for this contract/service
      let localSig: any = null;
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) localSig = JSON.parse(raw);
      } catch (err) {
        // ignore
      }

      if (fileRows && fileRows.length > 0) {
        return fileRows.map((f, idx) => {
          const fileSigKey = `furii_contract_sig_${f.id}`;
          let fSig: any = localSig;
          try {
            const rawFileSig = localStorage.getItem(fileSigKey);
            if (rawFileSig) fSig = JSON.parse(rawFileSig);
          } catch (e) {
            // ignore
          }

          const isSigned = !!(fSig && fSig.signed_at);

          return {
            id: f.id,
            service_id: f.service_id || serviceId,
            project_id: f.project_id || projectId,
            client_id: f.client_id || clientId,
            title: f.name.replace(/^Contract:\s*/i, ""),
            document_url: f.file_url,
            file_name: f.name,
            file_size: f.file_size || 0,
            status: isSigned ? "signed" : "pending_signature",
            version: f.version || idx + 1,
            created_at: f.created_at,
            agreed_terms: !!(fSig && fSig.agreed_terms),
            signed_by_name: fSig?.signed_by_name || null,
            signed_by_title: fSig?.signed_by_title || null,
            signed_at: fSig?.signed_at || null,
            signature_hash: fSig?.signature_hash || null,
          };
        });
      }

      // If no custom file is uploaded yet, return the default Master Services Agreement
      const defaultSigned = !!(localSig && localSig.signed_at);
      const defaultContract: ContractAgreement = {
        id: `default-contract-${serviceId || projectId || "msa"}`,
        service_id: serviceId,
        project_id: projectId,
        client_id: clientId,
        title: "Social Media & Content Production Retainer Agreement",
        document_url: "/contracts/social-media-content-production-retainer-agreement.pdf",
        file_name: "Social_Media_Content_Production_Retainer_Agreement.pdf",
        file_size: 924740,
        status: defaultSigned ? "signed" : "pending_signature",
        version: 1,
        created_at: new Date().toISOString(),
        agreed_terms: !!(localSig && localSig.agreed_terms),
        signed_by_name: localSig?.signed_by_name || null,
        signed_by_title: localSig?.signed_by_title || null,
        signed_at: localSig?.signed_at || null,
        signature_hash: localSig?.signature_hash || null,
      };

      return [defaultContract];
    },
  });

  // Sign contract mutation
  const signContractMutation = useMutation({
    mutationFn: async ({
      contractId,
      signerName,
      signerTitle,
    }: {
      contractId: string;
      signerName: string;
      signerTitle?: string;
    }) => {
      const now = new Date().toISOString();
      const hash = `SIG-FURII-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

      const sigPayload = {
        contractId,
        signed_by_name: signerName.trim(),
        signed_by_title: signerTitle?.trim() || "Authorized Client Signatory",
        signed_at: now,
        signature_hash: hash,
        agreed_terms: true,
        user_id: user?.id,
      };

      // Save to localStorage under specific contract and service
      localStorage.setItem(`furii_contract_sig_${contractId}`, JSON.stringify(sigPayload));
      localStorage.setItem(storageKey, JSON.stringify(sigPayload));

      // Try logging approval record in Supabase approvals table
      if (clientId && projectId) {
        try {
          await supabase.from("approvals").insert({
            organization_id: "72e3ff6d-96e6-4cc6-b904-d07327f43b29",
            client_id: clientId,
            project_id: projectId,
            service_id: serviceId || null,
            title: `Executed Contract: ${signerName}`,
            description: `Contract agreement digitally executed by ${signerName} (${signerTitle || "Signatory"}) on ${new Date().toLocaleDateString()}. Verification hash: ${hash}`,
            status: "approved",
            requested_by: user?.id || null,
            requested_at: now,
            reviewed_by: user?.id || null,
            reviewed_at: now,
            client_comment: `Digitally signed by ${signerName}. Hash: ${hash}`,
          });
        } catch (dbErr) {
          console.warn("DB contract sign log error (ignored):", dbErr);
        }
      }

      return sigPayload;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
    },
  });

  // Upload custom contract PDF mutation
  const uploadContractMutation = useMutation({
    mutationFn: async ({
      file,
      title,
    }: {
      file: File;
      title: string;
    }) => {
      const targetClient = clientId || "client-default";
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filePath = `${targetClient}/contracts/${Date.now()}_${sanitizedName}`;

      const { error: uploadErr } = await supabase.storage
        .from("files")
        .upload(filePath, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: publicUrl } = supabase.storage.from("files").getPublicUrl(filePath);

      const { data: fileRow, error: insertErr } = await supabase
        .from("files")
        .insert({
          organization_id: "72e3ff6d-96e6-4cc6-b904-d07327f43b29",
          client_id: clientId || null,
          project_id: projectId || null,
          service_id: serviceId || null,
          name: title.trim() || file.name,
          file_url: publicUrl.publicUrl,
          file_key: filePath,
          file_size: file.size,
          file_type: file.type || "application/pdf",
          category: "contract",
          visibility: "client",
          uploaded_by: user?.id || null,
        })
        .select()
        .single();

      if (insertErr) throw insertErr;
      return fileRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });

  // Reset signature mutation
  const resetSignatureMutation = useMutation({
    mutationFn: async (contractId: string) => {
      localStorage.removeItem(`furii_contract_sig_${contractId}`);
      localStorage.removeItem(storageKey);
      return contractId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });

  return {
    ...query,
    contracts: query.data || [],
    activeContract: query.data?.[0] || null,
    signContract: signContractMutation.mutateAsync,
    isSigning: signContractMutation.isPending,
    uploadContract: uploadContractMutation.mutateAsync,
    isUploading: uploadContractMutation.isPending,
    resetSignature: resetSignatureMutation.mutateAsync,
  };
}
