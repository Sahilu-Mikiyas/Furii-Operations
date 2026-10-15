import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export function useInstallmentPlans() {
  const queryClient = useQueryClient();
  const { currentClient } = useAuth();
  const plansQuery = useQuery({
    queryKey: ["installment-plans", currentClient?.id],
    enabled: Boolean(currentClient?.id),
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("installment_plans").select("*, request:service_requests(id,title,description,request_type), schedule:installment_schedule(*)").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).filter((plan: any) => plan.client_id === currentClient?.id).map((plan: any) => ({ ...plan, schedule: [...(plan.schedule || [])].sort((a: any,b: any) => a.sequence - b.sequence) }));
    },
  });

  const rpcMutation = useMutation({
    mutationFn: async ({ name, args }: { name: string; args: Record<string, unknown> }) => {
      const { data, error } = await (supabase as any).rpc(name, args);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["installment-plans"] });
      queryClient.invalidateQueries({ queryKey: ["service_requests"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });

  const submitRequest = async (payload: { title: string; description: string; requestType: string; items: unknown[]; total: number; down: number; count: number }) => rpcMutation.mutateAsync({ name: "submit_installment_request", args: { p_title: payload.title, p_description: payload.description, p_request_type: payload.requestType, p_catalog_items: payload.items, p_total: payload.total, p_down: payload.down, p_count: payload.count, p_notes: null } });
  const acceptTerms = (planId: string) => rpcMutation.mutateAsync({ name: "accept_installment_terms", args: { p_plan_id: planId } });
  const submitReceipt = async (scheduleId: string, file: File) => {
    if (!currentClient?.id) throw new Error("Client workspace is not available");
    const ext = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "bin";
    const path = `${currentClient.id}/installments/${scheduleId}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("receipts").upload(path, file, { upsert: false, ...(file.type ? { contentType: file.type } : {}) });
    if (uploadError) throw uploadError;
    try {
      await rpcMutation.mutateAsync({ name: "submit_installment_payment", args: { p_schedule_id: scheduleId, p_receipt_url: path, p_reference: null, p_notes: null } });
    } catch (error) {
      await supabase.storage.from("receipts").remove([path]);
      throw error;
    }
  };
  const requestPayoff = (planId: string) => rpcMutation.mutateAsync({ name: "request_installment_payoff", args: { p_plan_id: planId } });
  return { plans: plansQuery.data || [], isLoading: plansQuery.isLoading, error: plansQuery.error, submitRequest, acceptTerms, submitReceipt, requestPayoff, isSaving: rpcMutation.isPending, refetch: plansQuery.refetch };
}
