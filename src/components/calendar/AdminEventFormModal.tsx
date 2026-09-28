import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { X, Calendar as CalendarIcon, Clock, MapPin, Film, CheckCircle2, Eye, Users, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Event, EventType, Visibility } from "@/types";

interface AdminEventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: Event | null;
  defaultDate?: string; // YYYY-MM-DD
  defaultClientId?: string;
}

export function AdminEventFormModal({
  isOpen,
  onClose,
  eventToEdit,
  defaultDate,
  defaultClientId,
}: AdminEventFormModalProps) {
  const { clients } = useClients();
  const { projects } = useProjects();
  const { createEvent, updateEvent, isCreating, isUpdating } = useCalendarEvents();

  const isEditing = !!eventToEdit;

  // Form states
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState<EventType>("shoot");
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("17:00");
  const [isAllDay, setIsAllDay] = useState(false);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [callSheet, setCallSheet] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("client");

  // Populate form
  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title || "");
      setEventType(eventToEdit.event_type || "shoot");
      setClientId(eventToEdit.client_id || "");
      setProjectId(eventToEdit.project_id || "");
      
      const start = new Date(eventToEdit.start_datetime || eventToEdit.start_time || "");
      if (!isNaN(start.getTime())) {
        setStartDate(start.toISOString().split("T")[0]);
        setStartTime(start.toTimeString().slice(0, 5));
      }
      
      if (eventToEdit.end_datetime || eventToEdit.end_time) {
        const end = new Date(eventToEdit.end_datetime || eventToEdit.end_time || "");
        if (!isNaN(end.getTime())) {
          setEndDate(end.toISOString().split("T")[0]);
          setEndTime(end.toTimeString().slice(0, 5));
        }
      } else {
        setEndDate("");
        setEndTime("");
      }

      setIsAllDay(!!eventToEdit.is_all_day);
      setLocation(eventToEdit.location || "");
      setDescription(eventToEdit.clean_description || eventToEdit.description || "");
      setCallSheet(eventToEdit.call_sheet || "");
      setVisibility(eventToEdit.visibility || "client");
    } else {
      // New Event Default
      setTitle("");
      setEventType("shoot");
      setClientId(defaultClientId || (clients[0]?.id ?? ""));
      setProjectId("");
      
      const initialDate = defaultDate || new Date().toISOString().split("T")[0];
      setStartDate(initialDate);
      setStartTime("09:00");
      setEndDate(initialDate);
      setEndTime("17:00");
      setIsAllDay(false);
      setLocation("");
      setDescription("");
      setCallSheet("");
      setVisibility("client");
    }
  }, [eventToEdit, defaultDate, defaultClientId, isOpen, clients]);

  if (!isOpen) return null;

  const clientProjects = projects.filter((p) => !clientId || p.client_id === clientId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please provide a title for the production event.");
      return;
    }
    if (!startDate) {
      toast.error("Please pick a start date.");
      return;
    }

    try {
      const startDateTime = isAllDay
        ? new Date(`${startDate}T00:00:00`).toISOString()
        : new Date(`${startDate}T${startTime || "09:00"}:00`).toISOString();

      let endDateTime: string | null = null;
      if (endDate) {
        endDateTime = isAllDay
          ? new Date(`${endDate}T23:59:59`).toISOString()
          : new Date(`${endDate}T${endTime || "17:00"}:00`).toISOString();
      }

      if (isEditing && eventToEdit) {
        await updateEvent({
          id: eventToEdit.id,
          title: title.trim(),
          event_type: eventType,
          client_id: clientId || null,
          project_id: projectId || null,
          start_datetime: startDateTime,
          end_datetime: endDateTime,
          location: location.trim() || null,
          is_all_day: isAllDay,
          visibility,
          clean_description: description.trim(),
          call_sheet: callSheet.trim() || null,
        });
        toast.success(`Production event "${title}" updated successfully.`);
      } else {
        await createEvent({
          title: title.trim(),
          event_type: eventType,
          client_id: clientId || null,
          project_id: projectId || null,
          start_datetime: startDateTime,
          end_datetime: endDateTime,
          location: location.trim() || null,
          is_all_day: isAllDay,
          visibility,
          clean_description: description.trim(),
          call_sheet: callSheet.trim() || null,
        });
        toast.success(`Production event "${title}" scheduled successfully.`);
      }

      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to save production event.");
    }
  };

  const isSaving = isCreating || isUpdating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-foreground">
              {isEditing ? "Edit Production Event" : "Schedule Production Shoot / Event"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Configure daily production schedule, call sheets, locations, and client visibility.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Event Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Commercial Video Shoot - Studio Day 1"
              className="w-full text-xs bg-secondary/50 border border-border rounded-xl px-3.5 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Event Type & Visibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Event Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as EventType)}
                className="w-full text-xs bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer font-medium"
              >
                <option value="shoot">🎬 Production Shoot</option>
                <option value="delivery">📦 Final Delivery / Milestone</option>
                <option value="review">👁️ Client Review & Feedback</option>
                <option value="meeting">📞 Coordination Meeting</option>
                <option value="deadline">⚠️ Hard Deadline</option>
                <option value="launch">🚀 Public Launch</option>
                <option value="other">📌 Other Event</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Audience Visibility</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as Visibility)}
                className="w-full text-xs bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer font-medium"
              >
                <option value="client">Client & Team Visible (Shows in Portal)</option>
                <option value="internal">Internal Team Only (Confidential)</option>
              </select>
            </div>
          </div>

          {/* Client & Project Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Client Partner</label>
              <select
                value={clientId}
                onChange={(e) => {
                  setClientId(e.target.value);
                  setProjectId("");
                }}
                className="w-full text-xs bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="">-- General / No Client Specified --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Project Link (Optional)</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full text-xs bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="">-- Standalone Production Event --</option>
                {clientProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time Range */}
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Timeline & Call Time</span>
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAllDay}
                  onChange={(e) => setIsAllDay(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
                All-Day Shoot / Event
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Start Date *</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-hidden"
                />
              </div>

              {!isAllDay && (
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">Call Time (Start)</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full text-xs bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-hidden"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">End Date (Optional)</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-hidden"
                />
              </div>

              {!isAllDay && (
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">Wrap Time (End)</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full text-xs bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-hidden"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              Location / Studio / Venue
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Furii Soundstage A, Bole Road or Skylight Hotel"
              className="w-full text-xs bg-secondary/50 border border-border rounded-xl px-3.5 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Objective & Overview</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of this production day, milestones to cover, or meeting agenda..."
              className="w-full text-xs bg-secondary/50 border border-border rounded-xl px-3.5 py-2 text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          {/* Production Call Sheet / Shoot Specs */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
              <Film className="w-3.5 h-3.5" />
              Call Sheet & Production Notes (Crew, Equipment, Scene Breakdown)
            </label>
            <textarea
              rows={4}
              value={callSheet}
              onChange={(e) => setCallSheet(e.target.value)}
              placeholder={`Scene 1: Interior product closeups with macro lens.
Wardrobe: Business modern neutral tones.
Gear: RED Komodo 6K, Aputure 600d key light.
Client presence: 11:00 AM for live monitor playback sign-off.`}
              className="w-full text-xs bg-amber-500/5 border border-amber-500/20 rounded-xl px-3.5 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-amber-500 resize-none font-mono text-[11px]"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Production Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
