import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useClients } from "@/hooks/useClients";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProductionCalendarView } from "@/components/calendar/ProductionCalendarView";
import { motion } from "framer-motion";

export function CalendarPage() {
  const { role, currentClient } = useAuth();
  const { clients } = useClients();
  const isClientRole = role === "client" || role === "client_owner" || role === "client_member";

  const [selectedClientId, setSelectedClientId] = useState<string>(
    isClientRole ? currentClient?.id || "" : "all"
  );

  const activeClientId = selectedClientId === "all" ? undefined : selectedClientId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Operations & Production Calendar"
        description="Comprehensive master schedule of production shoot dates, call sheets, client reviews, and delivery deadlines."
        actions={
          !isClientRole ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono">Client Filter:</span>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="text-xs bg-card font-semibold border border-border rounded-xl px-3 py-1.5 text-foreground focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Clients Master Schedule</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null
        }
      />

      <ProductionCalendarView
        clientId={activeClientId}
        showAdminControls={!isClientRole}
        initialViewMode="month"
        title={
          selectedClientId === "all"
            ? "Agency Master Production Calendar"
            : `${clients.find((c) => c.id === selectedClientId)?.name || "Client"} Production Schedule`
        }
        subtitle="Manage daily shoot logistics, call times, location specs, and collaborate with clients via dedicated comment threads."
      />
    </motion.div>
  );
}
