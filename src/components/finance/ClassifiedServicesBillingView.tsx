import React from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Calendar,
  Layers,
  Clock,
  Building2,
  ExternalLink,
  ShieldCheck,
  Receipt,
  FileCheck2,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  Download,
} from "lucide-react";
import type { Currency } from "@/types";
import { downloadContractPdf } from "@/lib/contractPdfGenerator";

interface RetainerItem {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  month: string;
  amount: number;
  currency: string;
  nextBillingDate?: string | null;
  isDue: boolean;
  status: string;
  receiptUrl?: string | null;
  contractAccepted?: boolean;
}

interface OneTimeItem {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  duration: string;
  amount: number;
  currency: string;
  status: string;
  startDate?: string | null;
  targetDate?: string | null;
  receiptUrl?: string | null;
  contractAccepted?: boolean;
}

interface ClassifiedServicesBillingViewProps {
  viewMode: "monthly_retainers" | "one_time";
  retainersByClientAndMonth: Record<
    string,
    { clientName: string; months: Record<string, RetainerItem[]> }
  >;
  oneTimeByClient: Record<string, { clientName: string; services: OneTimeItem[] }>;
  currency: Currency;
  onOpenReceipt?: (url: string) => void;
}

export function ClassifiedServicesBillingView({
  viewMode,
  retainersByClientAndMonth,
  oneTimeByClient,
  currency,
  onOpenReceipt,
}: ClassifiedServicesBillingViewProps) {
  if (viewMode === "monthly_retainers") {
    const clientEntries = Object.entries(retainersByClientAndMonth);

    if (clientEntries.length === 0) {
      return (
        <div className="p-12 text-center bg-card rounded-2xl border border-dashed border-border space-y-3">
          <Calendar className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
          <h3 className="text-sm font-bold text-foreground">No Monthly Retainers Recorded</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Ongoing services classified as Monthly Retainers will automatically appear here,
            grouped by client and organized across monthly billing cycles.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-mono font-bold uppercase">
              <Calendar className="w-3.5 h-3.5" />
              Monthly Retainer Accounts Ledger
            </div>
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              Retainer Billing Cadence (Organized by Client & Month)
            </h2>
            <p className="text-xs text-muted-foreground">
              Monitors 30-day monthly cycles, automated receipt renewal prompts, and clearance statuses.
            </p>
          </div>
        </div>

        {clientEntries.map(([clientId, clientData]) => {
          const monthEntries = Object.entries(clientData.months);
          const totalClientRetainerVolume = monthEntries.reduce(
            (acc, [_, items]) => acc + items.reduce((s, it) => s + it.amount, 0),
            0
          );

          return (
            <div
              key={clientId}
              className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-5"
            >
              {/* Client Group Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">{clientData.clientName}</h3>
                    <span className="text-xs text-muted-foreground font-mono">
                      {monthEntries.length} Billing Month(s) Tracked
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                    Combined Monthly Volume
                  </span>
                  <span className="text-base font-bold font-mono text-purple-600 dark:text-purple-400">
                    {formatCurrency(totalClientRetainerVolume, currency)}
                  </span>
                </div>
              </div>

              {/* Monthly Breakdowns */}
              <div className="space-y-4">
                {monthEntries.map(([monthName, items]) => (
                  <div
                    key={monthName}
                    className="rounded-xl border border-border/80 bg-secondary/15 overflow-hidden"
                  >
                    {/* Month Sub-Header */}
                    <div className="px-4 py-2.5 bg-secondary/40 border-b border-border/60 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span className="text-xs font-bold font-mono text-foreground uppercase tracking-wide">
                          {monthName}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {items.length} Retainer Engagement(s)
                      </span>
                    </div>

                    {/* Services within Month */}
                    <div className="divide-y divide-border/60 p-1 sm:p-2">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 sm:p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-foreground text-sm">{item.name}</h4>
                              {item.contractAccepted && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                  <ShieldCheck className="w-3 h-3" />
                                  MSA Terms Signed
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono flex-wrap">
                              {item.nextBillingDate && (
                                <span>Cycle Due Date: {formatDate(item.nextBillingDate)}</span>
                              )}
                              <span>•</span>
                              <span>Cadence: 30-Day Auto Renewal</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                            <div className="text-left md:text-right">
                              <div className="font-mono font-bold text-sm text-foreground">
                                {formatCurrency(item.amount, currency)}
                              </div>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md inline-block mt-0.5 ${
                                  item.isDue
                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold"
                                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                }`}
                              >
                                {item.status}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                downloadContractPdf({
                                  dealNumber: `DEAL-${item.id.slice(0, 8).toUpperCase()}`,
                                  serviceTitle: item.name,
                                  client: {
                                    name: item.clientName,
                                    company: item.clientName,
                                  },
                                  billingType: "monthly_retainer",
                                  duration: "Monthly Ongoing",
                                  totalAmount: item.amount,
                                  currency: (item.currency as any) || currency,
                                  receiptFileName: item.receiptUrl ? "Payment Slip Verified" : undefined,
                                  signedDate: item.month,
                                  signerName: item.clientName,
                                });
                              }}
                              className="px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-secondary text-foreground font-semibold text-xs flex items-center gap-1 shadow-2xs transition-colors shrink-0 cursor-pointer"
                              title="Download Signed Deal Agreement PDF"
                            >
                              <Download className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                              <span>Deal PDF</span>
                            </button>

                            <a
                              href="/contracts/social-media-content-production-retainer-agreement.pdf"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-secondary text-foreground font-semibold text-xs flex items-center gap-1 shadow-2xs transition-colors shrink-0"
                              title="Inspect Full Contract Agreement Document (PDF)"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                              <span>Inspect Doc ↗</span>
                            </a>

                            {item.receiptUrl && (
                              <a
                                href={item.receiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-secondary text-primary font-semibold text-xs flex items-center gap-1 shadow-2xs transition-colors shrink-0"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Receipt ↗</span>
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // viewMode === "one_time"
  const clientEntries = Object.entries(oneTimeByClient);

  if (clientEntries.length === 0) {
    return (
      <div className="p-12 text-center bg-card rounded-2xl border border-dashed border-border space-y-3">
        <Layers className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
        <h3 className="text-sm font-bold text-foreground">No One-Time Services Recorded</h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          One-Time engagements will automatically appear here, grouped by client and sorted by
          delivery duration and service name.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-mono font-bold uppercase">
            <Layers className="w-3.5 h-3.5" />
            One-Time Offers Ledger
          </div>
          <h2 className="text-base sm:text-lg font-bold text-foreground">
            One-Time Engagements (Organized by Duration & Name)
          </h2>
          <p className="text-xs text-muted-foreground">
            Fixed-scope milestone contracts classified by delivery sprint length and deliverables package.
          </p>
        </div>
      </div>

      {clientEntries.map(([clientId, clientData]) => {
        const totalOneTimeVolume = clientData.services.reduce((s, it) => s + it.amount, 0);

        return (
          <div
            key={clientId}
            className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-2xs space-y-4"
          >
            {/* Client Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">{clientData.clientName}</h3>
                  <span className="text-xs text-muted-foreground font-mono">
                    {clientData.services.length} One-Time Offer(s)
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                  Total Contract Value
                </span>
                <span className="text-base font-bold font-mono text-blue-600 dark:text-blue-400">
                  {formatCurrency(totalOneTimeVolume, currency)}
                </span>
              </div>
            </div>

            {/* List Sorted by Duration & Name */}
            <div className="divide-y divide-border/60">
              {clientData.services.map((item) => (
                <div
                  key={item.id}
                  className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        <Clock className="w-3 h-3" />
                        Duration: {item.duration}
                      </span>
                      <h4 className="font-bold text-foreground text-sm">{item.name}</h4>
                    </div>

                    <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground font-mono flex-wrap">
                      {item.startDate && <span>Started: {formatDate(item.startDate)}</span>}
                      {item.targetDate && <span>Target: {formatDate(item.targetDate)}</span>}
                      {item.contractAccepted && (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <ShieldCheck className="w-3 h-3" />
                          Contract Executed
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                    <div className="text-left md:text-right">
                      <div className="font-mono font-bold text-sm text-foreground">
                        {formatCurrency(item.amount, currency)}
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-secondary text-muted-foreground inline-block mt-0.5">
                        {item.status}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        downloadContractPdf({
                          dealNumber: `DEAL-${item.id.slice(0, 8).toUpperCase()}`,
                          serviceTitle: item.name,
                          client: {
                            name: item.clientName,
                            company: item.clientName,
                          },
                          billingType: "one_time",
                          duration: item.duration,
                          totalAmount: item.amount,
                          currency: (item.currency as any) || currency,
                          receiptFileName: item.receiptUrl ? "Payment Slip Verified" : undefined,
                          signedDate: formatDate(item.startDate || new Date().toISOString()),
                          signerName: item.clientName,
                        });
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-secondary text-foreground font-semibold text-xs flex items-center gap-1 shadow-2xs transition-colors shrink-0 cursor-pointer"
                      title="Download Signed Deal Agreement PDF"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>Deal PDF</span>
                    </button>

                    <a
                      href="/contracts/social-media-content-production-retainer-agreement.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-secondary text-foreground font-semibold text-xs flex items-center gap-1 shadow-2xs transition-colors shrink-0"
                      title="Inspect Full Contract Agreement Document (PDF)"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>Inspect Doc ↗</span>
                    </a>

                    {item.receiptUrl && (
                      <a
                        href={item.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-lg border border-border bg-secondary/50 hover:bg-secondary text-primary font-semibold text-xs flex items-center gap-1 shadow-2xs transition-colors shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Receipt ↗</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
