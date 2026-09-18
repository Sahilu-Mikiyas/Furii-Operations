import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Event } from "@/types";
import { MOCK_EVENTS } from "@/data/mock-data";
import { useAuth } from "@/lib/auth";

export function useCalendarEvents(clientId?: string) {
  const queryClient = useQueryClient();
  const { user, role } = useAuth();
  const isClientRole = role === "client_owner" || role === "client_member";

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
      if (error || !data || data.length === 0) {
        let list = MOCK_EVENTS;
        if (clientId) list = list.filter((e) => e.client_id === clientId);
        if (isClientRole) list = list.filter((e) => e.visibility === "client");
        return list;
      }

      // Map start_datetime / end_datetime to Event interface
      return data.map((d: any) => ({
        ...d,
        start_time: d.start_datetime || d.start_time,
        end_time: d.end_datetime || d.end_time,
      })) as Event[];
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (newEvent: Partial<Event>) => {
      const payload = {
        organization_id: newEvent.organization_id || "furii-org-01",
        client_id: newEvent.client_id || null,
        project_id: newEvent.project_id || null,
        service_id: newEvent.service_id || null,
        title: newEvent.title,
        description: newEvent.description || "",
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

  return {
    ...query,
    events: query.data || [],
    createEvent: createEventMutation.mutateAsync,
    isCreating: createEventMutation.isPending,
    canCreate: !isClientRole,
  };
}
