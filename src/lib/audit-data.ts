import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AuditLogEntry = {
  id: string;
  user_id?: string;
  entity_type: "contribution" | "deal" | "project" | "video" | "document" | "contact" | "milestone" | "settings" | "identity";
  action: "CREATE" | "UPDATE" | "DELETE" | "ALLOCATE" | "STATUS_CHANGE";
  title: string;
  details: string;
  created_at: string;
};

const LOCAL_AUDIT_KEY = "mission_command_audit_logs";

function getLocalLogs(): AuditLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_AUDIT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalLog(entry: AuditLogEntry) {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalLogs();
    const updated = [entry, ...existing].slice(0, 100);
    localStorage.setItem(LOCAL_AUDIT_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to persist local audit log", err);
  }
}

export function logAuditEvent(entry: Omit<AuditLogEntry, "id" | "created_at">) {
  const newEntry: AuditLogEntry = {
    ...entry,
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
  };

  saveLocalLog(newEntry);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("mission_audit_logged", { detail: newEntry }));
  }

  // Attempt sync to Supabase table if available
  try {
    (supabase.from as any)("audit_logs")
      .insert(newEntry)
      .then(() => {})
      .catch(() => {});
  } catch {
    // Ignore schema errors gracefully
  }

  return newEntry;
}

export function useAuditLogs() {
  const qc = useQueryClient();

  return useQuery({
    queryKey: ["audit_logs"],
    queryFn: async (): Promise<AuditLogEntry[]> => {
      let dbLogs: AuditLogEntry[] = [];
      try {
        const { data, error } = await (supabase.from as any)("audit_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);
        if (!error && data && data.length > 0) {
          dbLogs = data;
        }
      } catch {
        // Fallback to local logs
      }

      const localLogs = getLocalLogs();
      const merged = [...dbLogs, ...localLogs];
      const seen = new Set<string>();
      const deduped: AuditLogEntry[] = [];

      for (const item of merged) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          deduped.push(item);
        }
      }

      return deduped.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
  });
}
