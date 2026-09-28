import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { useWorkRecords } from "@/hooks/useWorkRecords";
import { useDeliverables } from "@/hooks/useDeliverables";
import { useInvoices } from "@/hooks/useInvoices";
import { useFinancialSummary } from "@/hooks/useFinancialSummary";
import { PageHeader } from "@/components/shared/PageHeader";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Download, CheckCircle2, Layers, Receipt, Printer, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { FuriiLogo } from "@/components/shared/FuriiLogo";

export function ReportsPage() {
  const { role, currentClient, currency } = useAuth();
  const { clients } = useClients();

  const isClient = role === "client_owner" || role === "client_member";
  const [selectedClientId, setSelectedClientId] = useState(currentClient?.id || "client-solomon");

  const activeClient =
    (isClient ? currentClient : clients.find((c) => c.id === selectedClientId)) ||
    clients[0] || {
      id: "client-solomon",
      name: "Solomon Gold Mining",
      industry: "Mining & Resources",
    };

  const { projects } = useProjects(activeClient.id);
  const { workRecords, isLoading: recordsLoading } = useWorkRecords(undefined, projects[0]?.id);
  const { deliverables } = useDeliverables(undefined, projects[0]?.id);
  const { invoices } = useInvoices(activeClient.id);

  const { totalPaid, totalOutstanding: totalBalance } = useFinancialSummary(activeClient.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Executive Client Debrief"
        description="Comprehensive periodic summaries of work completed, outputs delivered, metrics, and roadmap for the next sprint."
        actions={
          <div className="flex items-center gap-3">
            {!isClient && clients.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono">Client:</span>
                <select
                  value={activeClient.id}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="text-xs bg-card font-semibold border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-hidden cursor-pointer"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              Print / Save PDF
            </button>
          </div>
        }
      />

      {/* Report Document Preview */}
      <div className="p-8 sm:p-10 rounded-2xl bg-card border border-border shadow-2xs space-y-8 max-w-4xl print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b border-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FuriiLogo className="h-6" />
              <span className="text-muted-foreground">•</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                Operations Debrief
              </span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">{activeClient.name}</h2>
            <p className="text-xs text-muted-foreground font-mono">
              Industry: {activeClient.industry} • Project: {projects[0]?.name || "Enterprise Operations"}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-bold text-foreground block">Reporting Date</span>
            <span className="text-xs text-muted-foreground font-mono">
              {formatDate(new Date().toISOString(), "MMMM d, yyyy")}
            </span>
          </div>
        </div>

        {/* Work Completed Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            1. Work Completed & Technical Execution
          </h3>
          {recordsLoading ? (
            <div className="py-4 text-center text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            </div>
          ) : workRecords.length === 0 ? (
            <p className="text-xs text-muted-foreground italic pl-6">No published work records for this period.</p>
          ) : (
            <ul className="space-y-3 text-xs text-foreground/90 pl-6 list-disc leading-relaxed">
              {workRecords.map((rec) => (
                <li key={rec.id}>
                  <strong>{rec.title}:</strong> {rec.description}
                  {rec.changes && <p className="text-[11px] text-muted-foreground mt-0.5">{rec.changes}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Deliverables Submitted */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            2. Deliverables Submitted & Review Status
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {deliverables.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No formal deliverables submitted yet.</p>
            ) : (
              deliverables.map((deliv) => (
                <div key={deliv.id} className="p-3.5 rounded-xl bg-secondary/40 border border-border/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground block">{deliv.name || deliv.title}</span>
                    <span className="text-[10px] font-mono uppercase font-bold text-primary">v{deliv.current_version}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{deliv.description}</p>
                  <div className="pt-1 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-muted-foreground capitalize">Status: {deliv.status.replace("_", " ")}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Financial Summary */}
        {role !== "team_member" && role !== "client_member" && (
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" />
              3. Financial & Retainer Overview
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/80">
                <span className="text-[10px] font-mono uppercase text-muted-foreground block">Verified Paid</span>
                <span className="text-sm font-bold font-mono text-emerald-600">
                  {formatCurrency(totalPaid, currency)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/80">
                <span className="text-[10px] font-mono uppercase text-muted-foreground block">Outstanding Balance</span>
                <span className="text-sm font-bold font-mono text-foreground">
                  {formatCurrency(totalBalance, currency)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/80">
                <span className="text-[10px] font-mono uppercase text-muted-foreground block">Currency</span>
                <span className="text-sm font-bold font-mono text-foreground">{currency}</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-6 border-t border-border/80 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
          <span>Furii Client Operations Platform</span>
          <span>Verified Document • Confidential</span>
        </div>
      </div>
    </motion.div>
  );
}
