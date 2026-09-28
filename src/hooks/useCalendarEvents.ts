import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Event, CalendarEventComment } from "@/types";
import { useAuth } from "@/lib/auth";

export const METADATA_DELIMITER = "\n\n---FURII_METADATA---\n";

export interface EventMetadata {
  comments?: CalendarEventComment[];
  call_sheet?: string | null;
}

export function parseEventDescription(rawDescription?: string | null): {
  cleanDescription: string;
  comments: CalendarEventComment[];
  callSheet: string | null;
} {
  if (!rawDescription) {
    return { cleanDescription: "", comments: [], callSheet: null };
  }

  const parts = rawDescription.split(METADATA_DELIMITER);
  const cleanDescription = parts[0]?.trim() || "";

  if (parts.length > 1 && parts[1]) {
    try {
      const meta = JSON.parse(parts[1]) as EventMetadata;
      return {
        cleanDescription,
        comments: Array.isArray(meta.comments) ? meta.comments : [],
        callSheet: meta.call_sheet || null,
      };
    } catch {
      return { cleanDescription: rawDescription, comments: [], callSheet: null };
    }
  }

  return { cleanDescription, comments: [], callSheet: null };
}

export function buildEventDescription(
  cleanDescription: string,
  comments?: CalendarEventComment[],
  callSheet?: string | null
): string {
  const meta: EventMetadata = {};
  if (comments && comments.length > 0) meta.comments = comments;
  if (callSheet && callSheet.trim()) meta.call_sheet = callSheet.trim();

  if (Object.keys(meta).length > 0) {
    return `${cleanDescription.trim()}${METADATA_DELIMITER}${JSON.stringify(meta)}`;
  }
  return cleanDescription.trim();
}

export function useCalendarEvents(clientId?: string) {
  const queryClient = useQueryClient();
  const { user, role } = useAuth();
  const isClientRole = role === "client" || role === "client_owner" || role === "client_member";
  const canManage = role === "admin" || role === "super_admin" || role === "manager";

  const query = useQuery({
    queryKey: ["calendar_events", clientId || "all", role, user?.id],
    queryFn: async (): Promise<Event[]> => {
      let req = supabase.from("calendar_events").select("*").order("start_datetime", { ascending: true });

      if (clientId) {
        req = req.eq("client_id", clientId);
      } else if (isClientRole && user?.client_id) {
        req = req.eq("client_id", user.client_id);
      }

      if (isClientRole) {
        req = req.eq("visibility", "client");
      }

      const { data, error } = await req;
      if (error) {
        console.error("Calendar events query error:", error.message);
        return [];
      }

      return (data || []).map((d: any) => {
        const { cleanDescription, comments, callSheet } = parseEventDescription(d.description);
        return {
          ...d,
          start_time: d.start_time || d.start_datetime,
          end_time: d.end_time || d.end_datetime,
          clean_description: cleanDescription,
          comments,
          call_sheet: callSheet,
        };
      }) as Event[];
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (newEvent: Partial<Event> & { call_sheet?: string | null }) => {
      const serializedDescription = buildEventDescription(
        newEvent.clean_description || newEvent.description || "",
        newEvent.comments || [],
        newEvent.call_sheet
      );

      const payload = {
        organization_id: newEvent.organization_id || "72e3ff6d-96e6-4cc6-b904-d07327f43b29",
        client_id: newEvent.client_id || null,
        project_id: newEvent.project_id || null,
        service_id: newEvent.service_id || null,
        title: newEvent.title,
        description: serializedDescription,
        event_type: newEvent.event_type || "meeting",
        start_datetime: (newEvent as any).start_datetime || (newEvent as any).start_time || new Date().toISOString(),
        end_datetime: (newEvent as any).end_datetime || (newEvent as any).end_time || null,
        location: newEvent.location || null,
        is_all_day: newEvent.is_all_day || false,
        visibility: newEvent.visibility || "client",
        created_by: user?.id || null,
      };

      const { data, error } = await supabase.from("calendar_events").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar_events"] });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async (updatedEvent: Partial<Event> & { id: string; call_sheet?: string | null }) => {
      // Find current event if needed to keep existing comments
      const currentList = queryClient.getQueryData<Event[]>(["calendar_events", clientId || "all", role, user?.id]) || [];
      const current = currentList.find((e) => e.id === updatedEvent.id);

      const existingComments = updatedEvent.comments !== undefined ? updatedEvent.comments : (current?.comments || []);
      const existingCallSheet = updatedEvent.call_sheet !== undefined ? updatedEvent.call_sheet : (current?.call_sheet || null);
      const cleanDesc = updatedEvent.clean_description !== undefined ? updatedEvent.clean_description : (current?.clean_description || updatedEvent.description || "");

      const serializedDescription = buildEventDescription(
        cleanDesc,
        existingComments,
        existingCallSheet
      );

      const payload: any = {
        updated_at: new Date().toISOString(),
      };

      if (updatedEvent.title !== undefined) payload.title = updatedEvent.title;
      payload.description = serializedDescription;
      if (updatedEvent.event_type !== undefined) payload.event_type = updatedEvent.event_type;
      if (updatedEvent.start_datetime !== undefined) payload.start_datetime = updatedEvent.start_datetime;
      else if ((updatedEvent as any).start_time !== undefined) payload.start_datetime = (updatedEvent as any).start_time;
      if (updatedEvent.end_datetime !== undefined) payload.end_datetime = updatedEvent.end_datetime;
      else if ((updatedEvent as any).end_time !== undefined) payload.end_datetime = (updatedEvent as any).end_time;
      if (updatedEvent.location !== undefined) payload.location = updatedEvent.location;
      if (updatedEvent.is_all_day !== undefined) payload.is_all_day = updatedEvent.is_all_day;
      if (updatedEvent.visibility !== undefined) payload.visibility = updatedEvent.visibility;
      if (updatedEvent.client_id !== undefined) payload.client_id = updatedEvent.client_id;
      if (updatedEvent.project_id !== undefined) payload.project_id = updatedEvent.project_id;
      if (updatedEvent.service_id !== undefined) payload.service_id = updatedEvent.service_id;

      const { data, error } = await supabase
        .from("calendar_events")
        .update(payload)
        .eq("id", updatedEvent.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar_events"] });
    },
  });

  const addEventCommentMutation = useMutation({
    mutationFn: async ({
      eventId,
      content,
      authorName,
      authorRole,
      authorId,
    }: {
      eventId: string;
      content: string;
      authorName: string;
      authorRole: "client" | "agency" | "admin";
      authorId: string;
    }) => {
      // Fetch latest row for the event
      const { data: latestEvent, error: fetchErr } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (fetchErr) throw fetchErr;

      const { cleanDescription, comments, callSheet } = parseEventDescription(latestEvent.description);

      const newComment: CalendarEventComment = {
        id: `cmt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        author_id: authorId,
        author_name: authorName,
        author_role: authorRole,
        content: content.trim(),
        created_at: new Date().toISOString(),
      };

      const updatedComments = [...comments, newComment];
      const serializedDescription = buildEventDescription(cleanDescription, updatedComments, callSheet);

      const { data, error: updateErr } = await supabase
        .from("calendar_events")
        .update({
          description: serializedDescription,
          updated_at: new Date().toISOString(),
        })
        .eq("id", eventId)
        .select()
        .single();

      if (updateErr) throw updateErr;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar_events"] });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("calendar_events").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar_events"] });
    },
  });

  return {
    ...query,
    events: query.data || [],
    createEvent: createEventMutation.mutateAsync,
    updateEvent: updateEventMutation.mutateAsync,
    addEventComment: addEventCommentMutation.mutateAsync,
    deleteEvent: deleteEventMutation.mutateAsync,
    isCreating: createEventMutation.isPending,
    isUpdating: updateEventMutation.isPending,
    isAddingComment: addEventCommentMutation.isPending,
    isDeleting: deleteEventMutation.isPending,
    canCreate: !isClientRole,
    canManage,
  };
}
