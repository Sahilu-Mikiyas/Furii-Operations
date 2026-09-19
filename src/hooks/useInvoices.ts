import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Invoice, Payment, PaymentMethod } from "@/types";
import { useAuth } from "@/lib/auth";

export function useInvoices(clientId?: string) {
  const queryClient = useQueryClient();
  const { user, role, currency } = useAuth();
  const isClientRole = role === "client" || role === "client_owner" || role === "client_member";

  const query = useQuery({
    queryKey: ["invoices", clientId || "all", role, user?.id, currency],
    queryFn: async (): Promise<{ invoices: Invoice[]; payments: Payment[] }> => {
      let invReq = supabase
        .from("invoices")
        .select(`*, items:invoice_items(*)`)
        .order("created_at", { ascending: false });
      let payReq = supabase
        .from("payments")
        .select("*")
        .order("payment_date", { ascending: false });

      if (clientId) {
        invReq = invReq.eq("client_id", clientId);
        payReq = payReq.eq("client_id", clientId);
      } else if (isClientRole && user?.client_id) {
        invReq = invReq.eq("client_id", user.client_id);
        payReq = payReq.eq("client_id", user.client_id);
      }

      const [{ data: invData, error: invErr }, { data: payData, error: payErr }] = await Promise.all([
        invReq,
        payReq,
      ]);

      if (invErr) console.error("Invoices fetch error:", invErr.message);
      if (payErr) console.error("Payments fetch error:", payErr.message);

      return {
        invoices: (invData || []) as Invoice[],
        payments: (payData || []) as Payment[],
      };
    },
  });

  // Admin marks an invoice as paid or records a payment
  const recordPaymentMutation = useMutation({
    mutationFn: async ({
      invoiceId,
      amount,
      method,
      reference,
      notes,
    }: {
      invoiceId: string;
      amount: number;
      method: PaymentMethod;
      reference?: string;
      notes?: string;
    }) => {
      // Find invoice
      const { data: inv, error: invError } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", invoiceId)
        .single();

      if (invError) throw invError;

      const newAmountPaid = Number(inv.amount_paid || 0) + Number(amount);
      const isFull = newAmountPaid >= Number(inv.total || inv.amount);
      const newStatus = isFull ? "paid" : "partially_paid";

      // 1. Insert payment
      const { data: payData, error: payErr } = await supabase
        .from("payments")
        .insert({
          organization_id: inv.organization_id,
          client_id: inv.client_id,
          project_id: inv.project_id,
          invoice_id: invoiceId,
          amount,
          currency: inv.currency || "ETB",
          payment_date: new Date().toISOString().split("T")[0],
          method,
          reference: reference || null,
          notes: notes || null,
          recorded_by: user?.id || null,
        })
        .select()
        .single();

      if (payErr) throw payErr;

      // 2. Update invoice status
      await supabase
        .from("invoices")
        .update({
          amount_paid: newAmountPaid,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", invoiceId);

      return payData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  return {
    ...query,
    invoices: query.data?.invoices || [],
    payments: query.data?.payments || [],
    recordPayment: recordPaymentMutation.mutateAsync,
    isRecordingPayment: recordPaymentMutation.isPending,
  };
}
