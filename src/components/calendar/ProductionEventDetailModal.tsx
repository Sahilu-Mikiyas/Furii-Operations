import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Film,
  MessageSquare,
  Send,
  Edit2,
  Trash2,
  User,
  ShieldCheck,
  CheckCircle2,
  Eye,
  Users,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import type { Event, EventType } from "@/types";

interface ProductionEventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  onEdit?: (event: Event) => void;
}

export function ProductionEventDetailModal({
  isOpen,
  onClose,
  event,
  onEdit,
}: ProductionEventDetailModalProps) {
  const { user, role, currentClient } = useAuth();
  const { addEventComment, deleteEvent, isAddingComment, canManage } = useCalendarEvents();
  const [commentText, setCommentText] = useState("");

  if (!isOpen || !event) return null;

  const isClientRole = role === "client" || role === "client_owner" || role === "client_member";
  const authorRole: "client" | "agency" | "admin" = isClientRole ? "client" : canManage ? "admin" : "agency";
  const authorName = user?.email?.split("@")[0] || currentClient?.name || (isClientRole ? "Client Partner" : "Operations Team");

  const comments = event.comments || [];

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await addEventComment({
        eventId: event.id,
        content: commentText.trim(),
        authorName,
        authorRole,
        authorId: user?.id || "guest",
      });
      setCommentText("");
      toast.success("Comment posted to production event.");
    } catch (err: any) {
      toast.error(err.message || "Failed to post comment.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to remove event "${event.title}"?`)) return;
    try {
      await deleteEvent(event.id);
      toast.success("Event deleted.");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete event.");
    }
  };

  const getBadgeConfig = (type: EventType) => {
    switch (type) {
      case "shoot":
        return {
          label: "Production Shoot",
          icon: Film,
          className: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
        };
      case "delivery":
        return {
          label: "Delivery & Sign-Off",
          icon: CheckCircle2,
          className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
        };
      case "review":
        return {
          label: "Client Review",
          icon: Eye,
          className: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
        };
      case "meeting":
        return {
          label: "Coordination Meeting",
          icon: Users,
          className: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
        };
      case "deadline":
        return {
          label: "Hard Deadline",
          icon: AlertTriangle,
          className: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
        };
      default:
        return {
          label: type.toUpperCase(),
          icon: CalendarIcon,
          className: "bg-secondary text-foreground border-border",
        };
    }
  };

  const badge = getBadgeConfig(event.event_type);
  const BadgeIcon = badge.icon;

  const startTimeStr = event.start_datetime || event.start_time;
  const endTimeStr = event.end_datetime || event.end_time;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-xl overflow-hidden my-8 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border bg-muted/20">
          <div className="space-y-2 max-w-[85%]">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.className}`}
              >
                <BadgeIcon className="w-3.5 h-3.5" />
                {badge.label}
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                {event.visibility === "client" ? "Client-Visible" : "Internal Only"}
              </span>
            </div>
            <h2 className="text-xl font-bold text-foreground tracking-tight leading-snug">
              {event.title}
            </h2>
          </div>

          <div className="flex items-center gap-1">
            {canManage && onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(event);
                }}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                title="Edit Event"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {canManage && (
              <button
                onClick={handleDelete}
                className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                title="Delete Event"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date & Time */}
            <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/80 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] uppercase font-mono text-muted-foreground font-semibold block">
                  Date & Time
                </span>
                <p className="text-xs font-bold text-foreground">
                  {startTimeStr ? formatDate(startTimeStr, "EEEE, MMMM d, yyyy") : "Date TBD"}
                </p>
                <p className="text-[11px] text-muted-foreground font-mono">
                  {event.is_all_day
                    ? "All-Day Schedule"
                    : startTimeStr
                    ? `${formatDate(startTimeStr, "h:mm a")} ${
                        endTimeStr ? `→ ${formatDate(endTimeStr, "h:mm a")}` : ""
                      }`
                    : ""}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/80 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] uppercase font-mono text-muted-foreground font-semibold block">
                  Location / Studio
                </span>
                <p className="text-xs font-bold text-foreground truncate">
                  {event.location || "Production Studio / Virtual"}
                </p>
                {event.location && (
                  <span className="text-[11px] text-muted-foreground block truncate">
                    On-site confirmation active
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {event.clean_description && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                Production Objective
              </h4>
              <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                {event.clean_description}
              </p>
            </div>
          )}

          {/* Call Sheet / Shoot Specs Card */}
          {event.call_sheet && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs">
                <Film className="w-4 h-4" />
                <span>Shoot Call Sheet & Crew Instructions</span>
              </div>
              <pre className="text-xs font-mono text-foreground/90 whitespace-pre-wrap leading-relaxed bg-card/60 p-3 rounded-lg border border-amber-500/20">
                {event.call_sheet}
              </pre>
            </div>
          )}

          {/* Dedicated Comment Box Section */}
          <div className="pt-4 border-t border-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <h4 className="text-xs font-bold text-foreground uppercase font-mono tracking-wider">
                  Production Comments & Logistics ({comments.length})
                </h4>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">
                Real-time collaboration
              </span>
            </div>

            {/* Comment Thread */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-secondary/20 border border-dashed border-border space-y-1">
                  <p className="text-xs font-medium text-foreground">No comments yet</p>
                  <p className="text-[11px] text-muted-foreground">
                    Have questions about call times, props, or wardrobe? Post below.
                  </p>
                </div>
              ) : (
                comments.map((cmt) => {
                  const isClient = cmt.author_role === "client";
                  return (
                    <div
                      key={cmt.id}
                      className="p-3.5 rounded-xl bg-secondary/30 border border-border/70 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold uppercase">
                            {cmt.author_name.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-foreground">
                            {cmt.author_name}
                          </span>
                          <span
                            className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${
                              isClient
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : "bg-primary/10 text-primary border-primary/20"
                            }`}
                          >
                            {isClient ? "Client Partner" : "Furii Team"}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {formatRelativeDate(cmt.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-foreground/90 pl-8 whitespace-pre-wrap leading-relaxed">
                        {cmt.content}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Comment Input Box */}
            <form onSubmit={handleAddComment} className="space-y-2">
              <div className="relative">
                <textarea
                  rows={2}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={`Write a comment or question regarding this ${badge.label.toLowerCase()}...`}
                  className="w-full text-xs bg-secondary/40 border border-border rounded-xl px-3.5 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary resize-none pr-10"
                />
                <button
                  type="submit"
                  disabled={isAddingComment || !commentText.trim()}
                  className="absolute right-2.5 bottom-2.5 p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 cursor-pointer shadow-2xs"
                  title="Post comment"
                >
                  {isAddingComment ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Comments are saved instantly and notify both client leads and production managers.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
