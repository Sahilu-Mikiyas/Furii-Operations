import { useAuth } from "@/lib/auth";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { PageHeader } from "@/components/shared/PageHeader";
import { formatDate } from "@/lib/utils";
import { Clock, MapPin, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function ClientSchedulePage() {
  const { currentClient } = useAuth();
  const { events, isLoading } = useCalendarEvents(currentClient?.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Production Timeline & Meetings"
        description="Key presentation dates, production shoots, and milestone delivery deadlines."
      />

      {isLoading ? (
        <div className="p-12 flex justify-center text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-2xl border border-border space-y-2">
          <CalendarIcon className="w-8 h-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No upcoming events</h3>
          <p className="text-xs text-muted-foreground">Scheduled reviews and shoots will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-secondary flex flex-col items-center justify-center text-foreground font-mono shrink-0 border border-border">
                  <span className="text-[10px] uppercase text-muted-foreground font-semibold">
                    {formatDate(evt.start_time, "MMM")}
                  </span>
                  <span className="text-base font-bold text-foreground">
                    {formatDate(evt.start_time, "d")}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase bg-secondary px-2 py-0.5 rounded text-muted-foreground font-semibold border border-border">
                      {evt.event_type}
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
                  <span>{formatDate(evt.start_time, "h:mm a")}</span>
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
      )}
    </motion.div>
  );
}
