import { useState } from "react";
import { format } from "date-fns";
import { CalendarClock, CheckCircle2, Clock3, CreditCard, FileCheck2, LoaderCircle, ReceiptText, Upload } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { useInstallmentPlans } from "@/hooks/useInstallmentPlans";
import { formatCurrency } from "@/lib/utils";

const statusLabel: Record<string,string> = { pending_review: "Under review", changes_requested: "Terms updated", awaiting_client_acceptance: "Your approval needed", awaiting_down_payment: "Down payment due", active: "Active plan", declined: "Not approved", completed: "Paid in full" };

export function ClientInstallmentsPage() {
  const { plans, isLoading, acceptTerms, submitReceipt, requestPayoff, isSaving } = useInstallmentPlans();
  const [files, setFiles] = useState<Record<string, File | undefined>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const money = (amount: number) => formatCurrency(Number(amount || 0), "ETB");

  const handleReceipt = async (scheduleId: string) => {
    const file = files[scheduleId];
    if (!file) { toast.error("Choose a receipt image or PDF first."); return; }
    setUploading(scheduleId);
    try { await submitReceipt(scheduleId, file); setFiles((old) => ({ ...old, [scheduleId]: undefined })); toast.success("Receipt sent for verification."); }
    catch (error: any) { toast.error(error.message || "Could not submit receipt."); }
    finally { setUploading(null); }
  };

  const handleAccept = async (planId: string) => {
    try { await acceptTerms(planId); toast.success("Terms accepted. Your payment schedule is ready."); }
    catch (error: any) { toast.error(error.message || "Could not accept terms."); }
  };

  const handlePayoff = async (planId: string) => {
    try { await requestPayoff(planId); toast.success("Your remaining-balance bill is ready in the schedule."); }
    catch (error: any) { toast.error(error.message || "Could not create payoff bill."); }
  };

  return <div className="space-y-6">
    <PageHeader title="Installment plans" description="Review your payment terms, upcoming bills, and verified payments in one place." />
    {isLoading ? <div className="flex items-center justify-center rounded-2xl border bg-card py-16 text-sm text-muted-foreground"><LoaderCircle className="mr-2 h-4 w-4 animate-spin"/>Loading payment plans…</div>
    : plans.length === 0 ? <div className="rounded-2xl border bg-card p-10 text-center"><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><CreditCard className="h-6 w-6"/></div><h2 className="font-semibold">No installment plans yet</h2><p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Choose a fixed-price service in the catalog and select the installment option to send a proposal.</p></div>
    : <div className="space-y-5">{plans.map((plan: any) => {
      const schedule = plan.schedule || [];
      const paid = schedule.filter((row: any) => row.status === "paid").reduce((sum: number,row: any) => sum + Number(row.amount),0);
      const outstanding = Math.max(Number(plan.total_amount)-paid,0);
      const payoffPending = schedule.some((row: any) => row.sequence === -1 && ["due", "payment_submitted"].includes(row.status));
      return <section key={plan.id} className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div><div className="mb-2 flex flex-wrap items-center gap-2"><span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{statusLabel[plan.status] || plan.status}</span><span className="text-xs text-muted-foreground">ETB payment plan</span></div><h2 className="text-lg font-bold">{plan.request?.title || "Service plan"}</h2><p className="mt-1 text-sm text-muted-foreground">{plan.admin_notes || plan.client_notes || "Your proposal is being reviewed by the Furii team."}</p></div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-[290px]"><div className="rounded-xl bg-secondary/50 p-3"><p className="text-[11px] text-muted-foreground">Deal total</p><p className="mt-1 font-mono text-sm font-bold">{money(plan.proposed_total ?? plan.total_amount)}</p></div><div className="rounded-xl bg-secondary/50 p-3"><p className="text-[11px] text-muted-foreground">Balance left</p><p className="mt-1 font-mono text-sm font-bold">{money(outstanding)}</p></div></div>
        </div>
        {plan.status === "awaiting_client_acceptance" && <div className="flex flex-col gap-3 bg-amber-50/70 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-amber-950">Review the proposed schedule</p><p className="text-sm text-amber-900">Down payment {money(plan.proposed_down_payment)} · {plan.proposed_installment_count} monthly installments of at least 15,000 ETB.</p></div><button disabled={isSaving} onClick={() => handleAccept(plan.id)} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">Accept these terms</button></div>}
        {schedule.length > 0 && <div className="p-5 sm:p-6"><div className="mb-4 flex items-center justify-between"><h3 className="flex items-center gap-2 font-semibold"><CalendarClock className="h-4 w-4 text-primary"/>Payment schedule</h3>{["active","awaiting_down_payment"].includes(plan.status) && outstanding > 0 && !payoffPending && <button disabled={isSaving} onClick={() => handlePayoff(plan.id)} className="text-xs font-semibold text-primary hover:underline">Pay the remaining balance</button>}</div>{payoffPending&&<p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">Early payoff is in progress. Other unpaid bills are temporarily paused until it is verified.</p>}<div className="space-y-3">{schedule.map((row: any) => { const isDue = ["due","overdue"].includes(row.status) || (row.status === "upcoming" && new Date(`${row.due_date}T23:59:59`).getTime() <= Date.now()); const canPay = isDue && (!payoffPending || row.sequence === -1); return <div key={row.id} className="grid gap-3 rounded-xl border p-4 sm:grid-cols-[1fr_auto] sm:items-center"><div className="flex min-w-0 items-start gap-3"><div className={`mt-0.5 rounded-full p-2 ${row.status === "paid" ? "bg-emerald-100 text-emerald-700" : row.status === "payment_submitted" ? "bg-blue-100 text-blue-700" : "bg-secondary text-muted-foreground"}`}>{row.status === "paid" ? <CheckCircle2 className="h-4 w-4"/> : row.status === "payment_submitted" ? <FileCheck2 className="h-4 w-4"/> : <Clock3 className="h-4 w-4"/>}</div><div className="min-w-0"><p className="font-semibold">{row.label}</p><p className="text-xs text-muted-foreground">Due {format(new Date(`${row.due_date}T00:00:00`), "MMM d, yyyy")} · {isDue && row.status === "upcoming" ? "due" : row.status.replaceAll("_"," ")}</p>{row.payment_notes&&row.status!=="paid"&&<p className="mt-1 text-xs text-rose-700">{row.payment_notes}</p>}</div></div><div className="flex flex-col items-start gap-2 sm:items-end"><p className="font-mono font-bold">{money(row.amount)}</p>{canPay && <div className="flex flex-wrap items-center gap-2"><label className="cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-medium hover:bg-secondary"><input type="file" accept="image/*,.pdf" className="sr-only" onChange={(event) => setFiles((old) => ({...old,[row.id]:event.target.files?.[0]}))}/>{files[row.id]?.name || "Choose receipt"}</label><button onClick={() => handleReceipt(row.id)} disabled={!files[row.id] || uploading === row.id} className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50"><Upload className="h-3 w-3"/>{uploading === row.id ? "Sending…" : "Submit"}</button></div>}{row.status === "payment_submitted" && <span className="text-xs text-blue-700">Receipt under review</span>}{row.status === "paid" && <span className="flex items-center gap-1 text-xs text-emerald-700"><ReceiptText className="h-3 w-3"/>Verified payment</span>}</div></div>; })}</div><div className="mt-4 flex justify-between rounded-xl bg-secondary/40 px-4 py-3 text-sm"><span className="text-muted-foreground">Verified payments</span><span className="font-mono font-semibold">{money(paid)}</span></div></div>}
      </section>;
    })}</div>}
  </div>;
}
