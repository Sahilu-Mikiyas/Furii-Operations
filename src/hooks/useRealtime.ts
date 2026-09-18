import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // 1. Approvals channel
    const approvalsChannel = supabase
      .channel("approvals_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "approvals" },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["approvals"] });
          queryClient.invalidateQueries({ queryKey: ["deliverables"] });

          if (payload.eventType === "UPDATE") {
            const status = (payload.new as any)?.status;
            if (status === "approved") {
              toast.success("Deliverable Approved", {
                description: `A deliverable was formally approved by the client.`,
              });
            } else if (status === "changes_requested") {
              toast.warning("Revision Requested", {
                description: `Client requested modifications on a deliverable.`,
              });
            }
          }
        }
      )
      .subscribe();

    // 2. Tasks channel
    const tasksChannel = supabase
      .channel("tasks_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["tasks"] });
        }
      )
      .subscribe();

    // 3. Work records channel
    const recordsChannel = supabase
      .channel("work_records_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "work_records" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["work_records"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(approvalsChannel);
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(recordsChannel);
    };
  }, [queryClient]);
}
