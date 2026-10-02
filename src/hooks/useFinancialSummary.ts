import { useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { useInvoices } from "@/hooks/useInvoices";
import { useProjects } from "@/hooks/useProjects";
import { useServiceRequests } from "@/hooks/useServiceRequests";
import { useServices } from "@/hooks/useServices";
import { CURATED_PACKAGES } from "@/data/catalog";
import type { Payment, Service } from "@/types";

export interface ServiceFinancialData {
  totalBilled: number;
  totalPaid: number;
  remaining: number;
  isFullySettled: boolean;
}

export interface FinancialLedgerItem {
  id: string;
  title: string;
  type: string;
  date: string;
  amount: number;
  status: "paid" | "payment_review" | "pending";
  receipt_url?: string | null;
  isProject?: boolean;
  requestId?: string;
  rawRequest?: any;
  rawProject?: any;
  rawInvoice?: any;
  rawPayment?: Payment;
}

export function useFinancialSummary(clientIdOverride?: string) {
  const { currentClient, role } = useAuth();
  const isClientRole = role === "client" || role === "client_owner" || role === "client_member";
  const activeClientId = clientIdOverride || (isClientRole ? currentClient?.id : undefined);

  const { invoices, payments, isLoading: invoicesLoading } = useInvoices(activeClientId);
  const { projects, isLoading: projectsLoading } = useProjects(activeClientId);
  const { requests, isLoading: requestsLoading } = useServiceRequests(activeClientId);
  const { services, isLoading: servicesLoading } = useServices(undefined, activeClientId);

  const isLoading = invoicesLoading || projectsLoading || requestsLoading || servicesLoading;

  const financialData = useMemo(() => {
    const paid: FinancialLedgerItem[] = [];
    const outstanding: FinancialLedgerItem[] = [];

    // 1. Recorded payment rows are the cash ledger. Keep invoice-level fallback
    // only for legacy invoices that predate payment records.
    const paymentsByInvoice = new Map<string, Payment[]>();
    payments.forEach((payment) => {
      if (!payment.invoice_id) return;
      const invoicePayments = paymentsByInvoice.get(payment.invoice_id) || [];
      invoicePayments.push(payment);
      paymentsByInvoice.set(payment.invoice_id, invoicePayments);
    });

    payments.forEach((payment) => {
      const invoice = invoices.find((item) => item.id === payment.invoice_id);
      paid.push({
        id: `payment-${payment.id}`,
        title: invoice?.title || payment.reference || "Verified Payment",
        type: invoice ? `PAYMENT FOR ${invoice.invoice_number}` : "VERIFIED PAYMENT",
        date: payment.payment_date,
        amount: Number(payment.amount) || 0,
        status: "paid",
        ...(payment.receipt_url !== undefined ? { receipt_url: payment.receipt_url } : {}),
        ...(invoice ? { rawInvoice: invoice } : {}),
        rawPayment: payment,
      });
    });

    // 2. Process legacy formal invoices with no payment rows.
    invoices.forEach((inv) => {
      if ((paymentsByInvoice.get(inv.id)?.length || 0) > 0) return;
      if (inv.status === "paid" || (inv.amount_paid && inv.amount_paid > 0)) {
        const amt = Number(inv.amount_paid || inv.total || inv.amount || 0);
        paid.push({
          id: `inv-${inv.id}`,
          title: inv.title || `Invoice ${inv.invoice_number}`,
          type: `INVOICE ${inv.invoice_number}`,
          date: inv.created_at,
          amount: amt,
          status: "paid",
          rawInvoice: inv,
        });
      }
    });

    // 3. Process Pending & Under-Review Service Requests
    // (When client requests a service and it's not approved yet, it is OUTSTANDING)
    const pendingRequests = requests.filter(
      (r) => r.status === "pending" || r.status === "payment_review"
    );

    pendingRequests.forEach((req) => {
      outstanding.push({
        id: `pending-${req.id}`,
        title: req.title,
        type: req.request_type ? `${req.request_type.toUpperCase()} REQUIREMENT` : "SERVICE REQUIREMENT",
        date: req.created_at,
        amount: Number(req.estimated_total) || 0,
        status: req.status === "payment_review" ? "payment_review" : "pending",
        receipt_url: req.receipt_url,
        requestId: req.id,
        rawRequest: req,
      });
    });

    // 4. Process Formal Invoices (Unpaid Balances)
    invoices.forEach((inv) => {
      if (inv.status !== "paid" && inv.status !== "cancelled") {
        const remaining = Number(inv.total || inv.amount || 0) - Number(inv.amount_paid || 0);
        if (remaining > 0) {
          outstanding.push({
            id: `unpaid-inv-${inv.id}`,
            title: inv.title || `Invoice ${inv.invoice_number}`,
            type: `UNPAID INVOICE ${inv.invoice_number}`,
            date: inv.due_date || inv.created_at,
            amount: remaining,
            status: "pending",
            requestId: inv.id,
            rawInvoice: inv,
          });
        }
      }
    });

    const totalPaidSum = paid.reduce((acc, item) => acc + item.amount, 0);
    const totalOutstandingSum = outstanding.reduce((acc, item) => acc + item.amount, 0);
    const totalCommitmentSum = totalPaidSum + totalOutstandingSum;

    // Combined ledger items sorted newest first
    const combinedLedger = [...paid, ...outstanding].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Real Overall Delivery Progress
    const overallDeliveryPct =
      services.length > 0
        ? Math.round(
            services.reduce((acc, s) => acc + (s.progress || 0), 0) / services.length
          )
        : projects.length > 0
        ? Math.round(
            projects.reduce((acc, p) => acc + (p.progress_override || 0), 0) / projects.length
          )
        : 0;

    return {
      paidItems: paid,
      outstandingItems: outstanding,
      allLedgerItems: combinedLedger,
      totalPaid: totalPaidSum,
      totalOutstanding: totalOutstandingSum,
      totalCommitment: totalCommitmentSum,
      totalContract: totalCommitmentSum,
      overallDeliveryPct,
    };
  }, [invoices, payments, projects, requests, services]);

  // Helper to extract real financial figures for any specific service
  const getServiceFinancials = (service: Service | null | undefined): ServiceFinancialData => {
    if (!service) {
      return { totalBilled: 0, totalPaid: 0, remaining: 0, isFullySettled: true };
    }

    // 1. Check linked invoices
    const linkedInvoices = invoices.filter(
      (i) => i.service_id === service.id || (service.project_id && i.project_id === service.project_id)
    );

    if (linkedInvoices.length > 0) {
      const billed = linkedInvoices.reduce((acc, i) => acc + Number(i.total || i.amount || 0), 0);
      const paid = linkedInvoices.reduce((acc, invoice) => {
        const invoicePayments = payments.filter((payment) => payment.invoice_id === invoice.id);
        if (invoicePayments.length > 0) {
          return acc + invoicePayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
        }
        return acc + Number(invoice.amount_paid || (invoice.status === "paid" ? (invoice.total || invoice.amount || 0) : 0));
      }, 0);
      return {
        totalBilled: billed,
        totalPaid: paid,
        remaining: Math.max(0, billed - paid),
        isFullySettled: paid >= billed,
      };
    }

    // 2. Check service's project budget
    const proj = projects.find((p) => p.id === service.project_id) || service.project;
    if (proj && proj.budget && Number(proj.budget) > 0) {
      const budget = Number(proj.budget);
      return {
        totalBilled: budget,
        totalPaid: 0,
        remaining: budget,
        isFullySettled: false,
      };
    }

    // 3. Check matching approved service request
    const matchingReq = requests.find(
      (r) =>
        (r.status === "approved" || r.status === "converted") &&
        (r.project_id === service.project_id ||
          r.title.toLowerCase().trim() === service.name.toLowerCase().trim() ||
          service.name.toLowerCase().includes(r.title.toLowerCase()))
    );

    if (matchingReq && matchingReq.estimated_total) {
      const amount = Number(matchingReq.estimated_total);
      return {
        totalBilled: amount,
        totalPaid: 0,
        remaining: amount,
        isFullySettled: false,
      };
    }

    // 4. Check catalog package price fallback
    const matchedPkg = CURATED_PACKAGES.find(
      (pkg) =>
        service.name.toLowerCase().includes(pkg.name.toLowerCase()) ||
        pkg.name.toLowerCase().includes(service.name.toLowerCase())
    );

    if (matchedPkg && matchedPkg.price) {
      return {
        totalBilled: matchedPkg.price,
        totalPaid: 0,
        remaining: matchedPkg.price,
        isFullySettled: false,
      };
    }

    return {
      totalBilled: 0,
      totalPaid: 0,
      remaining: 0,
      isFullySettled: true,
    };
  };

  return {
    ...financialData,
    getServiceFinancials,
    invoices,
    payments,
    projects,
    requests,
    services,
    isLoading,
  };
}
