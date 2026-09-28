import { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { formatDate } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Film,
  CheckCircle2,
  Eye,
  Users,
  AlertTriangle,
  Plus,
  MessageSquare,
  Clock,
  MapPin,
  List,
  Grid,
} from "lucide-react";
import { ProductionEventDetailModal } from "./ProductionEventDetailModal";
import { AdminEventFormModal } from "./AdminEventFormModal";
import type { Event, EventType } from "@/types";

interface ProductionCalendarViewProps {
  clientId?: string;
  showAdminControls?: boolean;
  initialViewMode?: "month" | "agenda";
  title?: string;
  subtitle?: string;
}

export function ProductionCalendarView({
  clientId,
  showAdminControls = false,
  initialViewMode = "month",
  title = "Production Timeline & Shoots",
  subtitle = "Interactive schedule of shoot days, call sheets, review milestones, and client logistics.",
}: ProductionCalendarViewProps) {
  const { role } = useAuth();
  const isManager = role === "manager" || role === "super_admin" || role === "admin";
  const canManage = showAdminControls && isManager;

  const { events, isLoading } = useCalendarEvents(clientId);

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<"month" | "agenda">(initialViewMode);
  const [filterType, setFilterType] = useState<string>("all");

  // Modals state
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [prefilledDate, setPrefilledDate] = useState<string | undefined>(undefined);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      if (filterType !== "all" && evt.event_type !== filterType) return false;
      return true;
    });
  }, [events, filterType]);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = useMemo(() => {
    return new Date(year, month + 1, 0).getDate();
  }, [year, month]);

  const firstDayOfWeek = useMemo(() => {
    // 0 = Sunday, 1 = Monday, etc. Adjust for Monday start (0 = Mon, 6 = Sun)
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  }, [year, month]);

  const prevMonthDays = useMemo(() => {
    const prevDays = new Date(year, month, 0).getDate();
    const days: number[] = [];
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push(prevDays - i);
    }
    return days;
  }, [year, month, firstDayOfWeek]);

  const totalGridSlots = 42; // 6 weeks standard grid
  const nextMonthDaysCount = useMemo(() => {
    return totalGridSlots - (firstDayOfWeek + daysInMonth);
  }, [firstDayOfWeek, daysInMonth]);

  // Map events by date (YYYY-MM-DD)
  const eventsByDate = useMemo(() => {
    const map = new Map<string, Event[]>();
    filteredEvents.forEach((evt) => {
      const dStr = evt.start_datetime || evt.start_time;
      if (!dStr) return;
      const dateKey = new Date(dStr).toISOString().split("T")[0];
      const list = map.get(dateKey) || [];
      list.push(evt);
      map.set(dateKey, list);
    });
    return map;
  }, [filteredEvents]);

  const todayStr = new Date().toISOString().split("T")[0];

  const handleOpenEvent = (evt: Event) => {
    setSelectedEvent(evt);
    setIsDetailModalOpen(true);
  };

  const handleCreateOnDate = (dateKey: string) => {
    if (!canManage) return;
    setPrefilledDate(dateKey);
    setEventToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleEditEvent = (evt: Event) => {
    setEventToEdit(evt);
    setIsFormModalOpen(true);
  };

  const getEventStyle = (type: EventType) => {
    switch (type) {
      case "shoot":
        return {
          bg: "bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border-amber-500/30",
          dot: "bg-amber-500",
          icon: Film,
          label: "Shoot",
        };
      case "delivery":
        return {
          bg: "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
          dot: "bg-emerald-500",
          icon: CheckCircle2,
          label: "Delivery",
        };
      case "review":
        return {
          bg: "bg-purple-500/15 hover:bg-purple-500/25 text-purple-800 dark:text-purple-300 border-purple-500/30",
          dot: "bg-purple-500",
          icon: Eye,
          label: "Review",
        };
      case "meeting":
        return {
          bg: "bg-blue-500/15 hover:bg-blue-500/25 text-blue-800 dark:text-blue-300 border-blue-500/30",
          dot: "bg-blue-500",
          icon: Users,
          label: "Meeting",
        };
      case "deadline":
        return {
          bg: "bg-rose-500/15 hover:bg-rose-500/25 text-rose-800 dark:text-rose-300 border-rose-500/30",
          dot: "bg-rose-500",
          icon: AlertTriangle,
          label: "Deadline",
        };
      default:
        return {
          bg: "bg-secondary hover:bg-secondary/80 text-foreground border-border",
          dot: "bg-muted-foreground",
          icon: CalendarIcon,
          label: type,
        };
    }
  };

  const weekDayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="rounded-2xl bg-card border border-border shadow-2xs overflow-hidden space-y-4">
      {/* Top Bar with Title, Controls, and Navigation */}
      <div className="p-4 sm:p-5 border-b border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              {title}
            </h2>
            <span className="text-[10px] font-mono uppercase bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">
              {formatDate(currentDate.toISOString(), "MMMM yyyy")}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>

        {/* View Switcher, Today, Navigation, and Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-secondary/60 p-1 rounded-xl border border-border text-xs">
            <button
              onClick={() => setViewMode("month")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === "month"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Month</span>
            </button>
            <button
              onClick={() => setViewMode("agenda")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === "agenda"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Agenda</span>
            </button>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center bg-secondary/60 p-1 rounded-xl border border-border">
            <button
              onClick={prevMonth}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToToday}
              className="px-2 py-0.5 text-xs font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Admin Add Event Button */}
          {canManage && (
            <button
              onClick={() => {
                setPrefilledDate(undefined);
                setEventToEdit(null);
                setIsFormModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Shoot</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="px-4 sm:px-5 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-mono text-muted-foreground shrink-0 uppercase font-semibold">
          Filters:
        </span>
        {[
          { key: "all", label: "All Events" },
          { key: "shoot", label: "🎬 Shoots", color: "text-amber-700 dark:text-amber-300" },
          { key: "delivery", label: "📦 Deliveries", color: "text-emerald-700 dark:text-emerald-300" },
          { key: "review", label: "👁️ Reviews", color: "text-purple-700 dark:text-purple-300" },
          { key: "meeting", label: "📞 Meetings", color: "text-blue-700 dark:text-blue-300" },
          { key: "deadline", label: "⚠️ Deadlines", color: "text-rose-700 dark:text-rose-300" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilterType(f.key)}
            className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition-all border cursor-pointer ${
              filterType === f.key
                ? "bg-foreground text-background border-foreground shadow-2xs"
                : "bg-secondary/40 text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* VIEW MODE 1: FULL MONTH CALENDAR GRID */}
      {viewMode === "month" && (
        <div className="p-3 sm:p-5 pt-0">
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-border bg-muted/40 text-center">
              {weekDayLabels.map((day) => (
                <div key={day} className="py-2 text-[11px] font-mono font-bold uppercase text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days 7-column Grid */}
            <div className="grid grid-cols-7 divide-x divide-y divide-border/60">
              {/* Previous Month Padding Days */}
              {prevMonthDays.map((d) => (
                <div
                  key={`prev-${d}`}
                  className="min-h-20 sm:min-h-28 p-1.5 sm:p-2 bg-secondary/15 text-muted-foreground/30 opacity-60"
                >
                  <span className="text-xs font-mono font-semibold">{d}</span>
                </div>
              ))}

              {/* Current Month Days (Every single day of the month) */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                const isToday = dateKey === todayStr;
                const dayEvents = eventsByDate.get(dateKey) || [];

                return (
                  <div
                    key={`curr-${dayNum}`}
                    onClick={() => canManage && dayEvents.length === 0 && handleCreateOnDate(dateKey)}
                    className={`min-h-20 sm:min-h-28 p-1.5 sm:p-2 transition-all flex flex-col justify-between group ${
                      isToday
                        ? "bg-primary/5"
                        : dayEvents.length > 0
                        ? "bg-card hover:bg-secondary/20"
                        : "bg-card hover:bg-secondary/10"
                    } ${canManage && dayEvents.length === 0 ? "cursor-pointer" : ""}`}
                  >
                    {/* Day Number Header */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs font-mono font-bold inline-flex items-center justify-center rounded-full ${
                          isToday
                            ? "h-6 w-6 bg-primary text-primary-foreground shadow-2xs"
                            : "text-foreground group-hover:text-primary transition-colors"
                        }`}
                      >
                        {dayNum}
                      </span>

                      {/* Small Quick-Add Button on Day Hover for Admin */}
                      {canManage && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreateOnDate(dateKey);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-opacity cursor-pointer"
                          title={`Schedule shoot on ${dateKey}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Day Events Stack */}
                    <div className="space-y-1 flex-1 overflow-hidden">
                      {dayEvents.slice(0, 3).map((evt) => {
                        const style = getEventStyle(evt.event_type);
                        const commentsCount = evt.comments?.length || 0;
                        const startTime = evt.start_datetime || evt.start_time;

                        return (
                          <div
                            key={evt.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEvent(evt);
                            }}
                            className={`p-1 sm:p-1.5 rounded-lg border text-[11px] leading-tight transition-all cursor-pointer shadow-2xs ${style.bg} flex items-center justify-between gap-1`}
                            title={evt.title}
                          >
                            <div className="truncate flex items-center gap-1 min-w-0">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
                              <span className="font-semibold truncate text-[11px]">{evt.title}</span>
                            </div>

                            {/* Comment indicator badge */}
                            {commentsCount > 0 && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-mono font-bold bg-card/80 px-1 py-0.2 rounded border border-border shrink-0">
                                <MessageSquare className="w-2.5 h-2.5 text-primary" />
                                {commentsCount}
                              </span>
                            )}
                          </div>
                        );
                      })}

                      {dayEvents.length > 3 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEvent(dayEvents[0]);
                          }}
                          className="text-[10px] font-mono text-muted-foreground hover:text-primary font-semibold block text-left"
                        >
                          +{dayEvents.length - 3} more...
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Next Month Padding Days */}
              {Array.from({ length: Math.max(0, nextMonthDaysCount) }).map((_, idx) => (
                <div
                  key={`next-${idx + 1}`}
                  className="min-h-20 sm:min-h-28 p-1.5 sm:p-2 bg-secondary/15 text-muted-foreground/30 opacity-60"
                >
                  <span className="text-xs font-mono font-semibold">{idx + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: CHRONOLOGICAL AGENDA LIST */}
      {viewMode === "agenda" && (
        <div className="p-4 sm:p-5 pt-0 space-y-3">
          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center bg-secondary/10 rounded-xl border border-dashed border-border space-y-2">
              <CalendarIcon className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-xs font-semibold text-foreground">No events found for this filter</p>
              <p className="text-[11px] text-muted-foreground">
                Scheduled shoot dates, deliveries, and reviews will appear here.
              </p>
            </div>
          ) : (
            filteredEvents.map((evt) => {
              const style = getEventStyle(evt.event_type);
              const startTime = evt.start_datetime || evt.start_time;
              const commentsCount = evt.comments?.length || 0;

              return (
                <div
                  key={evt.id}
                  onClick={() => handleOpenEvent(evt)}
                  className="p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-all cursor-pointer shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    {/* Date Block */}
                    <div className="h-12 w-12 rounded-xl bg-secondary flex flex-col items-center justify-center text-foreground font-mono shrink-0 border border-border">
                      <span className="text-[10px] uppercase text-muted-foreground font-semibold">
                        {startTime ? formatDate(startTime, "MMM") : "TBD"}
                      </span>
                      <span className="text-base font-bold text-foreground">
                        {startTime ? formatDate(startTime, "d") : "-"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${style.bg}`}
                        >
                          <style.icon className="w-3 h-3" />
                          {style.label}
                        </span>
                        {evt.call_sheet && (
                          <span className="text-[10px] font-mono text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-bold">
                            Call Sheet Active
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-foreground">{evt.title}</h3>
                      {evt.clean_description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {evt.clean_description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 sm:self-center justify-between sm:justify-end">
                    <div className="space-y-0.5 text-left sm:text-right font-mono text-xs text-muted-foreground">
                      {startTime && (
                        <div className="flex items-center gap-1.5 sm:justify-end">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatDate(startTime, "h:mm a")}</span>
                        </div>
                      )}
                      {evt.location && (
                        <div className="flex items-center gap-1.5 sm:justify-end text-[11px] truncate max-w-48">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{evt.location}</span>
                        </div>
                      )}
                    </div>

                    {commentsCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-mono font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-lg border border-primary/20">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {commentsCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Production Event Detail Modal with Dedicated Comment Box */}
      <ProductionEventDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onEdit={handleEditEvent}
      />

      {/* Admin Event Form Modal (Create & Edit) */}
      <AdminEventFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEventToEdit(null);
          setPrefilledDate(undefined);
        }}
        eventToEdit={eventToEdit}
        defaultDate={prefilledDate}
        defaultClientId={clientId}
      />
    </div>
  );
}
