import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import type { ServiceRequest, ServiceRequestStatus, ServiceRequestType } from "@/types";

export function useServiceRequests(clientId?: string) {
  const queryClient = useQueryClient();
  const { user, currentClient, role } = useAuth();
  const isClientRole = role === "client" || role === "client_owner" || role === "client_member";
  const activeClientId = clientId || (isClientRole ? currentClient?.id : undefined);

  const query = useQuery({
    queryKey: ["service_requests", activeClientId || "all"],
    queryFn: async (): Promise<ServiceRequest[]> => {
      let req = supabase
        .from("service_requests")
        .select(`
          *,
          client:clients(id, name, logo_url, industry)
        `)
        .order("created_at", { ascending: false });

      if (activeClientId) {
        req = req.eq("client_id", activeClientId);
      }

      const { data, error } = await req;
      if (error) {
        console.error("Failed to fetch service requests:", error.message);
        return [];
      }

      return (data || []).map((row: any) => {
        let contract_accepted = row.contract_accepted ?? false;
        let contract_accepted_at = row.contract_accepted_at ?? null;
        let billing_type = row.billing_type ?? "one_time";
        let billing_cycle_month = row.billing_cycle_month ?? null;
        let duration = row.duration ?? null;
        let cleanNotes = row.payment_notes || "";

        if (cleanNotes.includes("[META:")) {
          try {
            const match = cleanNotes.match(/\[META:(.*?)\]/);
            if (match && match[1]) {
              const meta = JSON.parse(match[1]);
              if (meta.contract_accepted !== undefined) contract_accepted = meta.contract_accepted;
              if (meta.contract_accepted_at) contract_accepted_at = meta.contract_accepted_at;
              if (meta.billing_type) billing_type = meta.billing_type;
              if (meta.billing_cycle_month) billing_cycle_month = meta.billing_cycle_month;
              if (meta.duration) duration = meta.duration;
              cleanNotes = cleanNotes.replace(/\[META:.*?\]/, "").trim();
            }
          } catch (e) {
            // ignore
          }
        }

        return {
          ...row,
          contract_accepted,
          contract_accepted_at,
          billing_type,
          billing_cycle_month,
          duration,
          payment_notes: cleanNotes,
        };
      }) as ServiceRequest[];
    },
  });

  const createRequestMutation = useMutation({
    mutationFn: async (payload: {
      client_id?: string;
      request_type: ServiceRequestType;
      title: string;
      description?: string;
      catalog_items?: any[];
      estimated_total: number;
      currency?: string;
      urgency?: "low" | "normal" | "high" | "urgent";
    }) => {
      const cId = payload.client_id || currentClient?.id;
      if (!cId) throw new Error("Client ID is required");

      const { data: org } = await supabase.from("organizations").select("id").limit(1).single();
      const orgId = org?.id || "72e3ff6d-96e6-4cc6-b904-d07327f43b29";

      const { data, error } = await supabase
        .from("service_requests")
        .insert({
          organization_id: orgId,
          client_id: cId,
          requested_by: user?.id,
          request_type: payload.request_type,
          title: payload.title,
          description: payload.description || "",
          catalog_items: payload.catalog_items || [],
          estimated_total: payload.estimated_total,
          currency: payload.currency || "ETB",
          urgency: payload.urgency || "normal",
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return data as ServiceRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service_requests"] });
    },
  });

  const submitReceiptMutation = useMutation({
    mutationFn: async ({
      requestId,
      file,
      notes,
      contractAccepted = true,
      contractAcceptedAt = new Date().toISOString(),
      billingType = "one_time",
      billingCycleMonth,
      duration,
    }: {
      requestId: string;
      file: File;
      notes?: string;
      contractAccepted?: boolean;
      contractAcceptedAt?: string;
      billingType?: BillingType;
      billingCycleMonth?: string;
      duration?: string;
    }) => {
      // 0. Verify request is still eligible (only select basic safe columns)
      const { data: existingReq, error: fetchError } = await supabase
        .from("service_requests")
        .select("status, receipt_url")
        .eq("id", requestId)
        .single();

      if (fetchError) throw fetchError;

      if (existingReq?.status === "approved" || existingReq?.status === "converted") {
        throw new Error(
          "This service has already been approved and launched into the ongoing phase. Receipts cannot be submitted again."
        );
      }

      if (existingReq?.status === "payment_review" || existingReq?.receipt_url) {
        throw new Error(
          "A receipt has already been attached for this service. Receipts can only be submitted once per service."
        );
      }

      // 1. Upload file to Supabase storage bucket 'receipts'
      const fileExt = file.name.split(".").pop();
      const fileName = `receipt-${requestId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Receipt upload failed: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from("receipts")
        .getPublicUrl(filePath);

      const receiptUrl = publicUrlData.publicUrl;

      // 2. Pack contract & billing metadata into payment_notes for resilience
      const currentMonthStr = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
      const metaJson = JSON.stringify({
        contract_accepted: contractAccepted,
        contract_accepted_at: contractAcceptedAt,
        billing_type: billingType,
        billing_cycle_month: billingCycleMonth || currentMonthStr,
        duration: duration || (billingType === "monthly_retainer" ? "Monthly Ongoing" : "4-Week Sprint"),
      });

      const packedNotes = notes ? `${notes} [META:${metaJson}]` : `[META:${metaJson}]`;

      const safePayload = {
        receipt_url: receiptUrl,
        payment_notes: packedNotes,
        payment_submitted_at: new Date().toISOString(),
        status: "payment_review",
        updated_at: new Date().toISOString(),
      };

      // Try with dedicated columns first; if DB schema cache lacks columns, fallback to safePayload
      let updateRes = await supabase
        .from("service_requests")
        .update({
          ...safePayload,
          contract_accepted: contractAccepted,
          contract_accepted_at: contractAcceptedAt,
          billing_type: billingType,
          billing_cycle_month: billingCycleMonth || currentMonthStr,
          duration: duration,
        })
        .eq("id", requestId)
        .select()
        .maybeSingle();

      if (updateRes.error && updateRes.error.message.includes("column")) {
        updateRes = await supabase
          .from("service_requests")
          .update(safePayload)
          .eq("id", requestId)
          .select()
          .single();
      }

      if (updateRes.error) throw updateRes.error;

      return {
        ...updateRes.data,
        contract_accepted: contractAccepted,
        contract_accepted_at: contractAcceptedAt,
        billing_type: billingType,
        billing_cycle_month: billingCycleMonth || currentMonthStr,
        duration: duration,
        payment_notes: notes || "",
      } as ServiceRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service_requests"] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      manager_notes,
    }: {
      id: string;
      status: ServiceRequestStatus;
      manager_notes?: string;
    }) => {
      const updateData: Record<string, any> = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (manager_notes !== undefined) updateData.manager_notes = manager_notes;

      const { data, error } = await supabase
        .from("service_requests")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as ServiceRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service_requests"] });
    },
  });

  // Manager approves and converts request into a real active project + service atomically
  const approveAndLaunchProjectMutation = useMutation({
    mutationFn: async (request: ServiceRequest) => {
      // 1. Primary: Run as a single database transaction via RPC
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "approve_service_request",
        { p_request_id: request.id }
      );

      if (!rpcError && rpcData?.success) {
        return rpcData;
      }

      // 2. Resilient fallback if RPC is ever unreachable or pending migration
      const orgId = request.organization_id || "72e3ff6d-96e6-4cc6-b904-d07327f43b29";

      const { data: project, error: projError } = await supabase
        .from("projects")
        .insert({
          organization_id: orgId,
          client_id: request.client_id,
          name: request.title,
          description: request.description || `Originating from service request (${request.request_type})`,
          status: "active",
          budget: request.estimated_total,
          budget_currency: request.currency || "ETB",
          start_date: new Date().toISOString().split("T")[0],
          progress_override: 15,
        })
        .select()
        .single();

      if (projError) throw projError;

      let serviceType = "website";
      if (request.request_type === "branding") serviceType = "branding";
      else if (request.request_type === "production") serviceType = "content_production";
      else if (request.request_type === "development") serviceType = "website";
      else if (request.request_type === "social_media") serviceType = "social_media";

      const isRetainer = request.billing_type === "monthly_retainer";
      const startDate = new Date().toISOString().split("T")[0];
      const nextDate = isRetainer
        ? new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]
        : null;

      const { data: service, error: servError } = await supabase
        .from("services")
        .insert({
          organization_id: orgId,
          client_id: request.client_id,
          project_id: project.id,
          name: request.title,
          service_type: serviceType,
          description: request.description || "Active client delivery stream",
          status: "in_progress",
          current_phase: null,
          progress: 0,
          start_date: startDate,
          billing_type: request.billing_type || "one_time",
          billing_start_date: startDate,
          next_billing_date: nextDate,
          billing_cycle_day: new Date().getDate(),
          duration: request.duration || (isRetainer ? "Monthly Retainer" : "One-Time Engagement"),
        })
        .select()
        .single();

      if (servError) throw servError;

      const { error: reqUpdateError } = await supabase
        .from("service_requests")
        .update({
          status: "approved",
          manager_notes: `Approved and launched into Project: ${project.name}`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", request.id);

      if (reqUpdateError) throw reqUpdateError;

      return { project, service };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service_requests"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["milestones"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });

  // Admin: Delete a single service request
  const deleteRequestMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("service_requests")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service_requests"] });
    },
  });

  // Admin: Wipe out all service requests & application history for a specific client
  const wipeClientRequestsMutation = useMutation({
    mutationFn: async (clientId: string) => {
      const { error } = await supabase
        .from("service_requests")
        .delete()
        .eq("client_id", clientId);

      if (error) throw error;
      return clientId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service_requests"] });
    },
  });

  // Admin: Edit single request details
  const editRequestMutation = useMutation({
    mutationFn: async (payload: {
      id: string;
      title?: string;
      description?: string;
      estimated_total?: number;
      currency?: string;
      urgency?: "low" | "normal" | "high" | "urgent";
      status?: ServiceRequestStatus;
      manager_notes?: string;
      receipt_url?: string;
    }) => {
      const { id, ...updates } = payload;
      const { data, error } = await supabase
        .from("service_requests")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as ServiceRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service_requests"] });
    },
  });

  // Admin: Create request on behalf of any client
  const createRequestAsAdminMutation = useMutation({
    mutationFn: async (payload: {
      client_id: string;
      request_type: ServiceRequestType;
      title: string;
      description?: string;
      estimated_total: number;
      currency?: string;
      urgency?: "low" | "normal" | "high" | "urgent";
      status?: ServiceRequestStatus;
      manager_notes?: string;
      catalog_items?: any[];
      autoLaunch?: boolean;
    }) => {
      const { data: org } = await supabase.from("organizations").select("id").limit(1).single();
      const orgId = org?.id || "72e3ff6d-96e6-4cc6-b904-d07327f43b29";

      const initialStatus = payload.status || (payload.autoLaunch ? "approved" : "pending");

      const { data: createdReq, error } = await supabase
        .from("service_requests")
        .insert({
          organization_id: orgId,
          client_id: payload.client_id,
          requested_by: user?.id,
          request_type: payload.request_type,
          title: payload.title,
          description: payload.description || "",
          catalog_items: payload.catalog_items || [],
          estimated_total: payload.estimated_total,
          currency: payload.currency || "ETB",
          urgency: payload.urgency || "normal",
          status: initialStatus,
          manager_notes: payload.manager_notes || "Created directly by agency administrator.",
        })
        .select()
        .single();

      if (error) throw error;

      // If marked as approved or auto-launch requested, spawn the project and service immediately
      if (initialStatus === "approved" || payload.autoLaunch) {
        await approveAndLaunchProjectMutation.mutateAsync(createdReq as ServiceRequest);
      }

      return createdReq as ServiceRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service_requests"] });
    },
  });

  return {
    requests: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createRequest: createRequestMutation.mutateAsync,
    isCreating: createRequestMutation.isPending,
    createRequestAsAdmin: createRequestAsAdminMutation.mutateAsync,
    isCreatingAsAdmin: createRequestAsAdminMutation.isPending,
    submitReceipt: submitReceiptMutation.mutateAsync,
    isSubmittingReceipt: submitReceiptMutation.isPending,
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
    editRequest: editRequestMutation.mutateAsync,
    isEditingRequest: editRequestMutation.isPending,
    deleteRequest: deleteRequestMutation.mutateAsync,
    isDeletingRequest: deleteRequestMutation.isPending,
    wipeClientRequests: wipeClientRequestsMutation.mutateAsync,
    isWipingClientRequests: wipeClientRequestsMutation.isPending,
    approveAndLaunchProject: approveAndLaunchProjectMutation.mutateAsync,
    isApprovingAndLaunching: approveAndLaunchProjectMutation.isPending,
    refetch: query.refetch,
  };
}
