import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { PageHeader } from "@/components/shared/PageHeader";
import { formatDate } from "@/lib/utils";
import { Clock, MapPin, Plus, Loader2, Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { EventType, Visibility } from "@/types";

export function CalendarPage() {
  const { role, currentClient } = useAuth();
  const targetClientId = role === "client_owner" || role === "client_member" ? currentClient?.id : undefined;
  const { events, createEvent, deleteEvent, isCreating, isLoading, canCreate } = useCalendarEvents(targetClientId);

  const [viewFilter, setViewFilter] = useState<"all" | "client" | "internal">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<EventType>("meeting");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("14:00");
  const [location, setLocation] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("client");

  const filteredEvents = events.filter((e) => {
    if (viewFilter === "all") return true;
    return e.visibility === viewFilter;
  });

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate) return;

    try {
      const startDateTime = new Date(`${startDate}T${startTime}:00`).toISOString();

      await createEvent({
        title,
        description,
        event_type: eventType,
        start_time: startDateTime,
        location: location || null,
        visibility,
        client_id: targetClientId || null,
      });

      toast.success(`Event "${title}" scheduled successfully.`);
      setTitle("");
      setDescription("");
      setLocation("");
      setShowCreateModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to schedule event.");
    }
  };

  const handleDeleteEvent = async (id: string, eventTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${eventTitle}"?`)) return;
    try {
      await deleteEvent(id);
      toast.success(`Event "${eventTitle}" deleted.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete event.");
    }
  };

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

            {canCreate && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Schedule Event
              </button>
            )}
          </div>
        }
      />

      {/* Events Agenda List */}
      {isLoading ? (
        <div className="p-12 flex justify-center text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-2xl border border-border space-y-2">
          <CalendarIcon className="w-8 h-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No events scheduled</h3>
          <p className="text-xs text-muted-foreground">Schedule upcoming milestone reviews or shoots.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="p-6 rounded-2xl bg-card border border-border shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
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

              <div className="flex items-center gap-3 shrink-0">
                <div className="space-y-1 text-right font-mono text-xs text-muted-foreground">
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

                {canCreate && (
                  <button
                    onClick={() => handleDeleteEvent(evt.id, evt.title)}
                    className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    title="Delete event"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl p-6 space-y-4"
          >
            <h2 className="text-base font-bold text-foreground">Schedule Production Event</h2>
            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Executive Board Presentation"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Type</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as EventType)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  >
                    <option value="presentation">Presentation</option>
                    <option value="shoot">Production Shoot</option>
                    <option value="review">Review Meeting</option>
                    <option value="deadline">Delivery Deadline</option>
                    <option value="meeting">General Meeting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Visibility</label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as Visibility)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  >
                    <option value="client">Client-Visible</option>
                    <option value="internal">Internal Team Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Location / Video Link</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Skylight Hotel / Google Meet"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Agenda items and attendee notes..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-secondary/30 text-foreground focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-lg border border-border cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isCreating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm Event
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
