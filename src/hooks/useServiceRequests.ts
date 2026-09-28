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

      return (data || []) as ServiceRequest[];
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
    }: {
      requestId: string;
      file: File;
      notes?: string;
    }) => {
      // 0. Verify request is still eligible (only pending and no prior receipt allowed)
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

      // 2. Update service_requests record: receipt_url, payment_notes, status = 'payment_review'
      const { data, error: updateError } = await supabase
        .from("service_requests")
        .update({
          receipt_url: receiptUrl,
          payment_notes: notes || "",
          payment_submitted_at: new Date().toISOString(),
          status: "payment_review",
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId)
        .select()
        .single();

      if (updateError) throw updateError;
      return data as ServiceRequest;
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

  // Manager approves and converts request into a real active project + service
  const approveAndLaunchProjectMutation = useMutation({
    mutationFn: async (request: ServiceRequest) => {
      const { data: org } = await supabase.from("organizations").select("id").limit(1).single();
      const orgId = org?.id || request.organization_id || "72e3ff6d-96e6-4cc6-b904-d07327f43b29";

      // 1. Create the Project
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

      // 2. Map service type
      let serviceType = "website";
      if (request.request_type === "branding") serviceType = "branding";
      else if (request.request_type === "production") serviceType = "content_production";
      else if (request.request_type === "development") serviceType = "website";

      // 3. Create the Service
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
          current_phase: "Phase 1: Discovery & Strategy",
          progress: 15,
        })
        .select()
        .single();

      if (servError) throw servError;

      // 4. Create initial Kickoff Tasks for the team & client visibility
      await supabase.from("tasks").insert([
        {
          organization_id: orgId,
          client_id: request.client_id,
          project_id: project.id,
          service_id: service.id,
          title: "Kickoff & Project Scope Alignment",
          description: "Review catalog specifications, client brief and confirm deliverables.",
          status: "in_progress",
          priority: "high",
          visibility: "client",
          due_date: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
        },
        {
          organization_id: orgId,
          client_id: request.client_id,
          project_id: project.id,
          service_id: service.id,
          title: "Initial Asset Collection & Briefing",
          description: "Gather high-res brand assets, copy requirements, and access credentials.",
          status: "planned",
          priority: "medium",
          visibility: "client",
          due_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
        },
      ]);

      // 5. Create initial Milestones
      await supabase.from("milestones").insert([
        {
          organization_id: orgId,
          project_id: project.id,
          service_id: service.id,
          title: "Phase 1: Discovery & Architecture",
          order_index: 1,
          status: "in_progress",
          target_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
        },
        {
          organization_id: orgId,
          project_id: project.id,
          service_id: service.id,
          title: "Phase 2: Creative Production & Engineering",
          order_index: 2,
          status: "not_started",
          target_date: new Date(Date.now() + 21 * 86400000).toISOString().split("T")[0],
        },
        {
          organization_id: orgId,
          project_id: project.id,
          service_id: service.id,
          title: "Phase 3: Final Delivery & Handover",
          order_index: 3,
          status: "not_started",
          target_date: new Date(Date.now() + 35 * 86400000).toISOString().split("T")[0],
        },
      ]);

      // 6. Create settled Invoice & Payment record for official accounting
      try {
        const invNum = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
        const { data: inv } = await supabase
          .from("invoices")
          .insert({
            organization_id: orgId,
            client_id: request.client_id,
            project_id: project.id,
            invoice_number: invNum,
            title: request.title,
            total: request.estimated_total,
            amount: request.estimated_total,
            amount_paid: request.estimated_total,
            currency: request.currency || "ETB",
            due_date: new Date().toISOString().split("T")[0],
            notes: request.description || `Settled engagement for ${request.title}`,
            status: "paid",
          })
          .select()
          .single();

        if (inv) {
          // Record payment
          await supabase.from("payments").insert({
            organization_id: orgId,
            client_id: request.client_id,
            project_id: project.id,
            invoice_id: inv.id,
            amount: request.estimated_total,
            currency: request.currency || "ETB",
            payment_date: request.payment_submitted_at
              ? request.payment_submitted_at.split("T")[0]
              : new Date().toISOString().split("T")[0],
            method: "bank_transfer",
            reference: request.payment_notes || `REC-${request.id.slice(0, 8).toUpperCase()}`,
            receipt_url: request.receipt_url || null,
            notes: "Verified & cleared upon service launch",
          });
        }
      } catch (finErr) {
        console.warn("Auto-ledger sync note:", finErr);
      }

      // 7. Mark Service Request as 'approved'
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
