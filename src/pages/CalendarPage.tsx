import { useState } from "react";
import { MOCK_EVENTS } from "@/data/mock-data";
import { PageHeader } from "@/components/shared/PageHeader";
import { formatDate } from "@/lib/utils";
import { Clock, MapPin, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function CalendarPage() {
  const [events] = useState(MOCK_EVENTS);
  const [viewFilter, setViewFilter] = useState<"all" | "client" | "internal">("all");

  const filteredEvents = events.filter((e) => {
    if (viewFilter === "all") return true;
    return e.visibility === viewFilter;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Operations Schedule"
        description="Chronological schedule of presentations, client reviews, shoot dates, milestones, and payment deadlines."
        actions={
          <div className="flex items-center gap-3">
            <select
              value={viewFilter}
              onChange={(e) => setViewFilter(e.target.value as any)}
              className="text-xs bg-card font-semibold border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Events</option>
              <option value="client">Client Visible Only</option>
              <option value="internal">Internal Team Only</option>
            </select>

            <button
              onClick={() => toast.info("Schedule event modal will open.")}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Schedule Event
            </button>
          </div>
        }
      />

      {/* Events Agenda List */}
      <div className="space-y-4">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            className="p-6 rounded-2xl bg-card border border-border shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-secondary flex flex-col items-center justify-center text-foreground font-mono shrink-0 border border-border">
                <span className="text-[10px] uppercase text-muted-foreground font-semibold">
                  {formatDate(evt.start_datetime, "MMM")}
                </span>
                <span className="text-base font-bold text-foreground">
                  {formatDate(evt.start_datetime, "d")}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase bg-secondary px-2 py-0.5 rounded text-muted-foreground font-semibold border border-border">
                    {evt.event_type}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                      evt.visibility === "client"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-neutral-100 text-neutral-700 border-neutral-200"
                    }`}
                  >
                    {evt.visibility === "client" ? "Client-Visible" : "Internal"}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-foreground">{evt.title}</h3>
                {evt.description && (
                  <p className="text-xs text-muted-foreground">{evt.description}</p>
                )}
              </div>
            </div>

            <div className="space-y-1 text-right shrink-0 font-mono text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 justify-end">
                <Clock className="h-3 w-3" />
                <span>{formatDate(evt.start_datetime, "h:mm a")}</span>
              </div>
              {evt.location && (
                <div className="flex items-center gap-1.5 justify-end text-[11px]">
                  <MapPin className="h-3 w-3" />
                  <span>{evt.location}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
