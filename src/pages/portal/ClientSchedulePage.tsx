import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProductionCalendarView } from "@/components/calendar/ProductionCalendarView";
import { motion } from "framer-motion";

export function ClientSchedulePage() {
  const { currentClient } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Production Schedule & Shoots"
        description="Key presentation dates, production shoots, call sheets, and milestone delivery deadlines."
      />

      <ProductionCalendarView
        clientId={currentClient?.id}
        title="Monthly Production Calendar"
        subtitle="Full calendar of upcoming shoot dates, client reviews, deliverables, and team comments."
        initialViewMode="month"
      />
    </motion.div>
  );
}
