import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ActivityLog } from "@/types";

export function useActivityLogs() {
  const query = useQuery({
    queryKey: ["activity_logs"],
    queryFn: async (): Promise<ActivityLog[]> => {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error || !data || data.length === 0) {
        return [];
      }

      return data as ActivityLog[];
    },
  });

  return {
    ...query,
    activities: query.data || [],
  };
}
