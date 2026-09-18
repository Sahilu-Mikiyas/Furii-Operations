import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logAuditEvent } from "./audit-data";
import { syncWeeklyTodoDone, addWeeklyTodoDirectly } from "./weekly-todos-data";
import { getDescendantIds } from "./task-tree-utils";
import {
  todayISO,
  dailyScore,
  totalFocusedSeconds,
  type DayRow,
  type IdentityRow,
  type PillarRow,
  type SessionRow,
  type TaskRow,
} from "./mission";

export type MissionSettings = {
  user_id: string;
  departure_date: string;
  title: string;
  tagline: string;
  destination: string;
  deep_work_target_hours: number;
};

async function requireUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Not signed in");
  return data.user.id;
}

/** Creates settings, pillars and identities for a brand new account. */
export async function bootstrapMission() {
  try {
    await supabase.rpc("bootstrap_mission");
  } catch (err) {
    console.warn("Bootstrap mission RPC notice:", err);
  }
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async (): Promise<MissionSettings> => {
      try {
        await bootstrapMission();
        const { data } = await supabase.from("mission_settings").select("*").maybeSingle();
        if (data) {
          const settingsObj = { ...data } as MissionSettings;
          const currentHours = Number(settingsObj.deep_work_target_hours);
          if (!currentHours || currentHours < 16) {
            settingsObj.deep_work_target_hours = 16;
            // Permanently upgrade the database record to 16h
            try {
              (supabase.from as any)("mission_settings")
                .update({ deep_work_target_hours: 16 })
                .eq("user_id", settingsObj.user_id)
                .then(() => {});
            } catch {
              // ignore
            }
          }
          return settingsObj;
        }
      } catch (err) {
        console.warn("Settings query fallback:", err);
      }
      return {
        user_id: "default",
        departure_date: "2027-02-10",
        title: "MISSION POLAND",
        tagline: "Build the life. Earn the money. Make the move.",
        destination: "Poznań",
        deep_work_target_hours: 16,
      };
    },
  });
}

export function usePillars() {
  return useQuery({
    queryKey: ["pillars"],
    queryFn: async (): Promise<PillarRow[]> => {
      const { data, error } = await supabase
        .from("pillars")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as PillarRow[];
    },
  });
}

export function useIdentities() {
  return useQuery({
    queryKey: ["identities"],
    queryFn: async (): Promise<IdentityRow[]> => {
      const { data, error } = await supabase
        .from("identities")
        .select("*")
        .order("weekday", { ascending: true });
      if (error) throw error;
      return (data ?? []) as IdentityRow[];
    },
  });
}

export type DayBundle = { day: DayRow; tasks: TaskRow[]; sessions: SessionRow[] };

/** Loads (or generates) the mission day for a given date from that weekday's identity loop. */
export async function ensureDay(dateISO: string): Promise<DayBundle> {
  const userId = await requireUserId();
  const weekday = new Date(`${dateISO}T00:00:00`).getDay();

  const { data: existing, error: dayErr } = await supabase
    .from("days")
    .select("*")
    .eq("day_date", dateISO)
    .maybeSingle();
  if (dayErr) throw dayErr;

  let day = existing as DayRow | null;

  if (!day) {
    const { data: identity } = await supabase
      .from("identities")
      .select("*")
      .eq("weekday", weekday)
      .maybeSingle();
    const ident = identity as IdentityRow | null;

    const { data: created, error: createErr } = await supabase
      .from("days")
      .insert({
        user_id: userId,
        day_date: dateISO,
        identity_id: ident?.id ?? null,
        objective: ident?.mission ?? "",
      })
      .select("*")
      .single();
    if (createErr) throw createErr;
    day = created as DayRow;

    const loop = ident?.loop ?? [];
    if (loop.length) {
      const { error: taskErr } = await supabase.from("day_tasks").insert(
        loop.map((label, i) => ({
          user_id: userId,
          day_id: day!.id,
          label,
          position: i,
        })),
      );
      if (taskErr) throw taskErr;
    }
  }

  const [{ data: tasks }, { data: sessions }] = await Promise.all([
    supabase.from("day_tasks").select("*").eq("day_id", day.id).order("position"),
    supabase.from("work_sessions").select("*").eq("day_id", day.id).order("started_at"),
  ]);

  const loopTasks = ((tasks ?? []) as TaskRow[]).filter((t) => !t.label.startsWith("[TODO:"));

  return {
    day,
    tasks: loopTasks,
    sessions: (sessions ?? []) as SessionRow[],
  };
}

export function useDay(dateISO: string = todayISO()) {
  return useQuery({
    queryKey: ["day", dateISO],
    queryFn: () => ensureDay(dateISO),
  });
}

export type DayHistoryItem = {
  id: string;
  day_date: string;
  weekday: number;
  identity_id: string | null;
  identity: IdentityRow | null;
  objective: string;
  key_objective_done: boolean;
  output_note: string;
  closed: boolean;
  tasks: TaskRow[];
  sessions: SessionRow[];
  tasksDone: number;
  tasksTotal: number;
  focusedSeconds: number;
  score: number;
};

export function useDaysHistory() {
  return useQuery({
    queryKey: ["days_history"],
    queryFn: async (): Promise<DayHistoryItem[]> => {
      try {
        const [{ data: days }, { data: identities }, { data: tasks }, { data: sessions }] =
          await Promise.all([
            supabase.from("days").select("*").order("day_date", { ascending: false }),
            supabase.from("identities").select("*"),
            supabase.from("day_tasks").select("*").order("position"),
            supabase.from("work_sessions").select("*").order("started_at"),
          ]);

        const allDays = (days ?? []) as DayRow[];
        const allIdentities = (identities ?? []) as IdentityRow[];
        const allTasks = (tasks ?? []) as TaskRow[];
        const allSessions = (sessions ?? []) as SessionRow[];

        return allDays.map((d) => {
          const weekday = new Date(`${d.day_date}T00:00:00`).getDay();
          const dayIdentity =
            allIdentities.find((i) => i.id === d.identity_id) ||
            allIdentities.find((i) => i.weekday === weekday) ||
            null;
          
          const dbTasks = allTasks.filter((t) => t.day_id === d.id);
          const localTodos = getLocalDailyTodos(d.day_date);

          // Merge local daily todos if not already in dbTasks
          const mergedTasks: TaskRow[] = [...dbTasks];
          for (const lt of localTodos) {
            const cleanLt = lt.label.toLowerCase().trim();
            const exists = dbTasks.some((t) => {
              const cleanT = t.label.replace(/^\[TODO(?::(?:high|normal|low))?(?:\|[^\]]+)*\]\s*/i, "").toLowerCase().trim();
              return cleanT === cleanLt;
            });
            if (!exists) {
              const minsTag = lt.estimated_minutes ? `|mins:${lt.estimated_minutes}` : "";
              const deadlineTag = lt.deadline_time ? `|deadline:${lt.deadline_time}` : "";
              mergedTasks.push({
                id: lt.id,
                day_id: d.id,
                label: `[TODO:${lt.priority || "normal"}${minsTag}${deadlineTag}] ${lt.label}`,
                position: 1000,
                done: lt.done,
              });
            }
          }

          const daySessions = allSessions.filter((s) => s.day_id === d.id);

          const tasksDone = mergedTasks.filter((t) => t.done).length;
          const tasksTotal = mergedTasks.length;
          const focusedSeconds = totalFocusedSeconds(daySessions);
          const hasOutput = Boolean(d.output_note && d.output_note.trim().length > 0);

          const score = dailyScore({
            tasksDone,
            tasksTotal,
            focusedSeconds,
            deepWorkTargetHours: 16,
            keyObjectiveDone: d.key_objective_done,
            hasOutput,
          });

          return {
            id: d.id,
            day_date: d.day_date,
            weekday,
            identity_id: d.identity_id,
            identity: dayIdentity,
            objective: d.objective || "",
            key_objective_done: d.key_objective_done || false,
            output_note: d.output_note || "",
            closed: d.closed || false,
            tasks: mergedTasks,
            sessions: daySessions,
            tasksDone,
            tasksTotal,
            focusedSeconds,
            score,
          };
        });
      } catch (err) {
        console.warn("Days history fetch fallback:", err);
        return [];
      }
    },
  });
}

export function useWeek() {
  return useQuery({
    queryKey: ["week"],
    queryFn: async () => {
      const now = new Date();
      const monday = new Date(now);
      const offset = (now.getDay() + 6) % 7;
      monday.setDate(now.getDate() - offset);
      const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return todayISO(d);
      });

      const [{ data: identities }, { data: days }] = await Promise.all([
        supabase.from("identities").select("*"),
        supabase.from("days").select("*").in("day_date", dates),
      ]);

      const dayRows = (days ?? []) as DayRow[];
      const taskRows = dayRows.length
        ? (
            await supabase
              .from("day_tasks")
              .select("*")
              .in(
                "day_id",
                dayRows.map((d) => d.id),
              )
          ).data ?? []
        : [];

      return dates.map((date) => {
        const weekday = new Date(`${date}T00:00:00`).getDay();
        const identity = ((identities ?? []) as IdentityRow[]).find((i) => i.weekday === weekday);
        const day = dayRows.find((d) => d.day_date === date) ?? null;
        const tasks = (taskRows as TaskRow[]).filter((t) => t.day_id === day?.id);
        return {
          date,
          weekday,
          identity: identity ?? null,
          day,
          tasksDone: tasks.filter((t) => t.done).length,
          tasksTotal: tasks.length,
        };
      });
    },
  });
}

export function useParkedIdeas() {
  return useQuery({
    queryKey: ["parked"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parked_ideas")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as { id: string; note: string; status: string; created_at: string }[];
    },
  });
}

export function useParkIdea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (note: string) => {
      const userId = await requireUserId();
      const { error } = await supabase.from("parked_ideas").insert({ user_id: userId, note });
      if (error) throw error;

      logAuditEvent({
        entity_type: "settings",
        action: "CREATE",
        title: "Idea Parked in Lot",
        details: note,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["parked"] });
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
    },
  });
}

export function useSwitchDayIdentity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      dayId: string;
      identityId: string;
      identityName: string;
      identityEmoji: string;
      adoptLoop?: boolean;
      loopTasks?: string[];
      objective?: string;
      dateISO?: string;
    }) => {
      const userId = await requireUserId();
      const updates: any = { identity_id: input.identityId };
      if (input.objective) {
        updates.objective = input.objective;
      }

      // Update days table
      const { error: dayErr } = await supabase
        .from("days")
        .update(updates)
        .eq("id", input.dayId);
      if (dayErr) throw dayErr;

      // If user chose to adopt the new identity's routine loop
      if (input.adoptLoop && input.loopTasks && input.loopTasks.length > 0) {
        // Remove existing incomplete tasks
        await supabase.from("day_tasks").delete().eq("day_id", input.dayId);

        // Insert new identity routine steps
        const taskPayload = input.loopTasks.map((label, i) => ({
          user_id: userId,
          day_id: input.dayId,
          label,
          position: i,
          done: false,
        }));
        const { error: insertErr } = await supabase.from("day_tasks").insert(taskPayload);
        if (insertErr) throw insertErr;
      }

      // Log system audit event
      logAuditEvent({
        entity_type: "identity",
        action: "UPDATE",
        title: `Active Character Swapped: ${input.identityName}`,
        details: `Swapped today's operational archetype to ${input.identityEmoji} ${input.identityName}${
          input.adoptLoop ? " (Adopted full routine loop)" : " (Preserved custom tasks)"
        }`,
      });
    },
    onSuccess: (_data, vars) => {
      if (vars.dateISO) {
        qc.invalidateQueries({ queryKey: ["day", vars.dateISO] });
      } else {
        qc.invalidateQueries({ queryKey: ["day"] });
      }
      qc.invalidateQueries({ queryKey: ["week"] });
      qc.invalidateQueries({ queryKey: ["identities"] });
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
    },
  });
}

export type DailyTodoItem = {
  id: string;
  day_id?: string | undefined;
  date: string;
  label: string;
  priority: "high" | "normal" | "low";
  done: boolean;
  created_at: string;
  estimated_minutes?: number | undefined;
  deadline_time?: string | undefined;
  started_at?: string | undefined;
  time_spent_seconds?: number | undefined;
  weekly_todo_id?: string | undefined;
  parent_id?: string | undefined;
};

const LOCAL_TODOS_PREFIX = "mission_daily_todos_";

function getLocalDailyTodos(date: string): DailyTodoItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${LOCAL_TODOS_PREFIX}${date}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalDailyTodos(date: string, todos: DailyTodoItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${LOCAL_TODOS_PREFIX}${date}`, JSON.stringify(todos));
  } catch (err) {
    console.warn("Failed to persist local daily todos", err);
  }
}

export function useDailyTodos(dateISO: string) {
  return useQuery({
    queryKey: ["daily_todos", dateISO],
    queryFn: async (): Promise<DailyTodoItem[]> => {
      let dbTodos: DailyTodoItem[] = [];
      try {
        const { data: day } = await supabase
          .from("days")
          .select("id")
          .eq("day_date", dateISO)
          .maybeSingle();

        if (day) {
          const { data: tasks } = await supabase
            .from("day_tasks")
            .select("*")
            .eq("day_id", day.id)
            .like("label", "[TODO:%")
            .order("created_at", { ascending: true });

          if (tasks && tasks.length > 0) {
            dbTodos = tasks.map((t: any) => {
              const match = t.label.match(/^\[TODO:(high|normal|low)(?:\|mins:(\d+))?(?:\|deadline:([^\]]+))?(?:\|weekly:([^\]|]+))?(?:\|parent:([^\]|]+))?\]\s*(.*)$/);
              const weeklyMatch = t.label.match(/\|weekly:([^\]|]+)/);
              const parentMatch = t.label.match(/\|parent:([^\]|]+)/);
              const weeklyTodoId = weeklyMatch ? weeklyMatch[1] : undefined;
              const parentId = parentMatch ? parentMatch[1] : undefined;
              return {
                id: t.id,
                day_id: t.day_id,
                date: dateISO,
                label: match ? match[6] : t.label.replace(/^\[TODO.*?\]\s*/, ""),
                priority: (match ? match[1] : "normal") as "high" | "normal" | "low",
                estimated_minutes: match && match[2] ? Number(match[2]) : undefined,
                deadline_time: match && match[3] ? match[3] : undefined,
                weekly_todo_id: weeklyTodoId,
                parent_id: parentId,
                done: Boolean(t.done),
                created_at: t.created_at || new Date().toISOString(),
              };
            });
          }
        }
      } catch (err) {
        console.warn("DB Daily todos fetch fallback:", err);
      }

      const local = getLocalDailyTodos(dateISO);
      const merged = [...dbTodos];
      for (const loc of local) {
        const existingIdx = merged.findIndex((m) => m.id === loc.id || (m.label === loc.label && m.date === loc.date));
        if (existingIdx === -1) {
          merged.push(loc);
        } else {
          // Merge local properties (like time_spent_seconds, estimated_minutes) into db object
          merged[existingIdx] = { ...merged[existingIdx], ...loc };
        }
      }

      // If local order exists, preserve exact user ordering
      if (local.length > 0) {
        const localOrderMap = new Map(local.map((item, index) => [item.id, index]));
        return merged.sort((a, b) => {
          const orderA = localOrderMap.has(a.id) ? localOrderMap.get(a.id)! : 9999;
          const orderB = localOrderMap.has(b.id) ? localOrderMap.get(b.id)! : 9999;
          if (orderA !== orderB) return orderA - orderB;
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });
      }

      return merged.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    },
  });
}

export function useReorderDailyTodos() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ date, todos }: { date: string; todos: DailyTodoItem[] }) => {
      saveLocalDailyTodos(date, todos);
      return todos;
    },
    onMutate: async ({ date, todos }) => {
      await qc.cancelQueries({ queryKey: ["daily_todos", date] });
      const prev = qc.getQueryData<DailyTodoItem[]>(["daily_todos", date]);
      qc.setQueryData(["daily_todos", date], todos);
      return { prev };
    },
    onError: (_err, { date }, context) => {
      if (context?.prev) {
        qc.setQueryData(["daily_todos", date], context.prev);
      }
    },
    onSettled: (_data, _err, { date }) => {
      qc.invalidateQueries({ queryKey: ["daily_todos", date] });
    },
  });
}

export function useAddDailyTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      date: string;
      dayId?: string | undefined;
      label: string;
      priority?: "high" | "normal" | "low" | undefined;
      estimated_minutes?: number | undefined;
      deadline_time?: string | undefined;
      weekly_todo_id?: string | undefined;
      parent_id?: string | undefined;
      done?: boolean | undefined;
    }) => {
      // Parse out and clean any embedded [TODO:...] tags
      const match = input.label.match(/^\[TODO:(high|normal|low)(?:\|mins:(\d+))?(?:\|deadline:([^\]]+))?(?:\|weekly:([^\]|]+))?(?:\|parent:([^\]|]+))?\]\s*(.*)$/i);
      const cleanLabel = match && match[6] !== undefined
        ? match[6].trim()
        : input.label.replace(/^\[TODO(?::(?:high|normal|low))?(?:\|[^\]]+)*\]\s*/i, "").trim();
      const priority = input.priority || (match && match[1] ? (match[1].toLowerCase() as any) : "normal");
      const estimated_minutes = input.estimated_minutes !== undefined ? input.estimated_minutes : (match && match[2] ? Number(match[2]) : undefined);
      const deadline_time = input.deadline_time !== undefined ? input.deadline_time : (match && match[3] ? match[3] : undefined);
      const weeklyTodoId = input.weekly_todo_id || (match && match[4] ? match[4] : undefined);
      const parentId = input.parent_id !== undefined ? input.parent_id : (match && match[5] ? match[5] : undefined);
      const isDone = input.done ?? false;

      // Automatically record every daily task into weekly strategic objectives
      let effectiveWeeklyId = weeklyTodoId;
      if (!effectiveWeeklyId) {
        try {
          const syncedWeekly = addWeeklyTodoDirectly({
            label: cleanLabel || input.label.trim(),
            priority,
            estimated_minutes,
            done: isDone,
            date: input.date,
          });
          effectiveWeeklyId = syncedWeekly.id;
        } catch (err) {
          console.warn("Failed to auto-add daily task to weekly todos", err);
        }
      }

      const newTodo: DailyTodoItem = {
        id: `todo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        ...(input.dayId ? { day_id: input.dayId } : {}),
        date: input.date,
        label: cleanLabel || input.label.trim(),
        priority,
        done: isDone,
        created_at: new Date().toISOString(),
        ...(estimated_minutes !== undefined ? { estimated_minutes } : {}),
        ...(deadline_time ? { deadline_time } : {}),
        ...(effectiveWeeklyId ? { weekly_todo_id: effectiveWeeklyId } : {}),
        ...(parentId ? { parent_id: parentId } : {}),
        time_spent_seconds: 0,
      };

      // Save locally immediately
      const existing = getLocalDailyTodos(input.date);
      saveLocalDailyTodos(input.date, [...existing, newTodo]);

      // Sync to Supabase if dayId is present or resolve dayId from date
      let targetDayId = input.dayId;
      if (!targetDayId) {
        try {
          const { data: dayRow } = await supabase
            .from("days")
            .select("id")
            .eq("day_date", input.date)
            .maybeSingle();
          if (dayRow?.id) {
            targetDayId = dayRow.id;
          }
        } catch {}
      }

      if (targetDayId) {
        try {
          const { data: userData } = await supabase.auth.getUser();
          const userId = userData?.user?.id || "guest-user";
          const deadlineTag = deadline_time ? `|deadline:${deadline_time}` : "";
          const minsTag = estimated_minutes ? `|mins:${estimated_minutes}` : "";
          const weeklyTag = effectiveWeeklyId ? `|weekly:${effectiveWeeklyId}` : "";
          const parentTag = parentId ? `|parent:${parentId}` : "";
          await supabase.from("day_tasks").insert({
            user_id: userId,
            day_id: targetDayId,
            label: `[TODO:${priority}${minsTag}${deadlineTag}${weeklyTag}${parentTag}] ${cleanLabel || input.label.trim()}`,
            position: 1000 + (Date.now() % 1000),
            done: isDone,
          });
        } catch {
          // Keep local fallback
        }
      }

      // Log to System Audit Trail
      logAuditEvent({
        entity_type: "identity",
        action: "CREATE",
        title: `Daily Todo: "${newTodo.label}"`,
        details: `Added todo (${priority.toUpperCase()}${estimated_minutes ? ` · ${estimated_minutes}m target` : ""}${deadline_time ? ` · by ${deadline_time}` : ""}${weeklyTodoId ? " · weekly goal" : ""}${parentId ? " · subtask" : ""}) for ${input.date}`,
      });

      return newTodo;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["daily_todos", vars.date] });
      qc.invalidateQueries({ queryKey: ["day", vars.date] });
      qc.invalidateQueries({ queryKey: ["days_history"] });
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
    },
  });
}

export function useUpdateDailyTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      date: string;
      label?: string | undefined;
      priority?: "high" | "normal" | "low" | undefined;
      time_spent_seconds?: number | undefined;
      started_at?: string | undefined;
      estimated_minutes?: number | undefined;
      deadline_time?: string | undefined;
      parent_id?: string | null | undefined;
      done?: boolean | undefined;
    }) => {
      const existing = getLocalDailyTodos(input.date);
      const targetTodo = existing.find((t) => t.id === input.id);
      
      const cleanLabel = input.label !== undefined
        ? input.label.replace(/^\[TODO(?::(?:high|normal|low))?(?:\|[^\]]+)*\]\s*/i, "").trim()
        : (targetTodo?.label || "");
      const effectivePriority = input.priority || targetTodo?.priority || "normal";
      const effectiveMins = input.estimated_minutes !== undefined ? input.estimated_minutes : targetTodo?.estimated_minutes;
      const effectiveDeadline = input.deadline_time !== undefined ? input.deadline_time : targetTodo?.deadline_time;
      const effectiveParentId = input.parent_id !== undefined
        ? (input.parent_id === null ? undefined : input.parent_id)
        : targetTodo?.parent_id;

      let linkedWeeklyId: string | undefined = undefined;
      const updated: DailyTodoItem[] = existing.map((t) => {
        if (t.id === input.id) {
          linkedWeeklyId = t.weekly_todo_id;
          const item: DailyTodoItem = {
            ...t,
            label: cleanLabel || t.label,
            priority: effectivePriority,
            parent_id: effectiveParentId,
            ...(input.time_spent_seconds !== undefined ? { time_spent_seconds: input.time_spent_seconds } : {}),
            ...(input.started_at !== undefined ? { started_at: input.started_at } : {}),
            ...(input.done !== undefined ? { done: input.done } : {}),
            ...(effectiveMins !== undefined ? { estimated_minutes: effectiveMins } : {}),
            ...(effectiveDeadline !== undefined ? { deadline_time: effectiveDeadline } : {}),
          };
          return item;
        }
        return t;
      });
      saveLocalDailyTodos(input.date, updated);

      if (linkedWeeklyId && input.done !== undefined) {
        syncWeeklyTodoDone(linkedWeeklyId, input.done);
      }

      // Sync to Supabase if DB id
      if (input.id && !input.id.startsWith("todo_")) {
        try {
          const finalLabel = cleanLabel || targetTodo?.label || "";
          const deadlineTag = effectiveDeadline ? `|deadline:${effectiveDeadline}` : "";
          const minsTag = effectiveMins ? `|mins:${effectiveMins}` : "";
          const weeklyTag = targetTodo?.weekly_todo_id ? `|weekly:${targetTodo.weekly_todo_id}` : "";
          const parentTag = effectiveParentId ? `|parent:${effectiveParentId}` : "";
          const newDbLabel = `[TODO:${effectivePriority}${minsTag}${deadlineTag}${weeklyTag}${parentTag}] ${finalLabel}`;
          
          const updatePayload: any = {
            label: newDbLabel,
          };
          if (input.done !== undefined) {
            updatePayload.done = input.done;
          }

          await supabase.from("day_tasks").update(updatePayload).eq("id", input.id);
        } catch (err) {
          console.warn("DB task update fallback:", err);
        }
      }

      // Log to Audit Trail if modifying label or settings
      if (input.label || input.priority || input.estimated_minutes !== undefined || input.deadline_time !== undefined || input.parent_id !== undefined) {
        logAuditEvent({
          entity_type: "identity",
          action: "UPDATE",
          title: `Daily Todo Modified: "${cleanLabel || targetTodo?.label}"`,
          details: `Updated task settings (${effectivePriority.toUpperCase()}${effectiveMins ? ` · ${effectiveMins}m target` : ""}${effectiveDeadline ? ` · by ${effectiveDeadline}` : ""}${effectiveParentId ? ` · subtask` : ""}) on ${input.date}`,
        });
      }
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["daily_todos", vars.date] });
      qc.invalidateQueries({ queryKey: ["day", vars.date] });
      qc.invalidateQueries({ queryKey: ["days_history"] });
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
    },
  });
}

export function useToggleDailyTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      date: string;
      dayId?: string | undefined;
      done: boolean;
      label: string;
    }) => {
      // Update local storage
      const existing = getLocalDailyTodos(input.date);
      const descendantIds = new Set(getDescendantIds(input.id, existing));

      // 1. Cascade done down to all descendants if true
      // 2. If false, unmark target and also unmark ancestors if they were done
      const ancestorIds = new Set<string>();
      if (!input.done) {
        let curr = existing.find((t) => t.id === input.id);
        while (curr && curr.parent_id) {
          ancestorIds.add(curr.parent_id);
          curr = existing.find((t) => t.id === curr!.parent_id);
        }
      }

      const affectedIds = new Set<string>([input.id]);
      if (input.done) {
        descendantIds.forEach((id) => affectedIds.add(id));
      } else {
        ancestorIds.forEach((id) => affectedIds.add(id));
      }

      let updated = existing.map((t) => {
        if (t.id === input.id) {
          return { ...t, done: input.done };
        }
        if (input.done && descendantIds.has(t.id)) {
          return { ...t, done: true };
        }
        if (!input.done && ancestorIds.has(t.id)) {
          return { ...t, done: false };
        }
        return t;
      });

      // Check upward if all siblings of target's parent are now done -> auto-complete parent
      if (input.done) {
        let target = updated.find((t) => t.id === input.id);
        while (target && target.parent_id) {
          const parentId = target.parent_id;
          const siblings = updated.filter((t) => t.parent_id === parentId);
          const allSiblingsDone = siblings.length > 0 && siblings.every((s) => s.done);
          if (allSiblingsDone) {
            affectedIds.add(parentId);
            updated = updated.map((t) => (t.id === parentId ? { ...t, done: true } : t));
            target = updated.find((t) => t.id === parentId);
          } else {
            break;
          }
        }
      }

      saveLocalDailyTodos(input.date, updated);

      // Bi-directional weekly sync & Supabase sync
      for (const t of updated) {
        if (affectedIds.has(t.id)) {
          if (t.weekly_todo_id) {
            syncWeeklyTodoDone(t.weekly_todo_id, t.done);
          }
          if (t.id && !t.id.startsWith("todo_")) {
            supabase.from("day_tasks").update({ done: t.done }).eq("id", t.id).then(() => {}).catch(() => {});
          }
        }
      }

      // Log to System Audit Trail
      logAuditEvent({
        entity_type: "identity",
        action: "STATUS_CHANGE",
        title: input.done ? `Daily Todo Completed: "${input.label}"` : `Daily Todo Reopened: "${input.label}"`,
        details: `Task status updated on ${input.date}`,
      });
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["daily_todos", vars.date] });
      qc.invalidateQueries({ queryKey: ["day", vars.date] });
      qc.invalidateQueries({ queryKey: ["days_history"] });
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
    },
  });
}

export function useDeleteDailyTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; date: string; label: string }) => {
      const existing = getLocalDailyTodos(input.date);
      const descendantIds = getDescendantIds(input.id, existing);
      const allIdsToDelete = new Set([input.id, ...descendantIds]);

      // Remove from local storage
      const filtered = existing.filter((t) => !allIdsToDelete.has(t.id));
      saveLocalDailyTodos(input.date, filtered);

      // Remove from Supabase
      for (const delId of allIdsToDelete) {
        if (!delId.startsWith("todo_")) {
          supabase.from("day_tasks").delete().eq("id", delId).then(() => {}).catch(() => {});
        }
      }

      // Log to System Audit Trail
      logAuditEvent({
        entity_type: "identity",
        action: "DELETE",
        title: `Daily Todo Removed: "${input.label}"`,
        details: `Deleted task from ${input.date}`,
      });
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["daily_todos", vars.date] });
      qc.invalidateQueries({ queryKey: ["day", vars.date] });
      qc.invalidateQueries({ queryKey: ["days_history"] });
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
    },
  });
}

export function useDeleteWorkSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; dateISO: string; label: string; seconds: number }) => {
      const { error } = await supabase.from("work_sessions").delete().eq("id", input.id);
      if (error) throw error;

      // Log to Audit Trail
      logAuditEvent({
        entity_type: "identity",
        action: "DELETE",
        title: `Work Session Deleted: "${input.label}"`,
        details: `Deleted session (${Math.round(input.seconds / 60)}m) for ${input.dateISO}`,
      });
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["day", vars.dateISO] });
      qc.invalidateQueries({ queryKey: ["day"] });
      qc.invalidateQueries({ queryKey: ["days_history"] });
      qc.invalidateQueries({ queryKey: ["week"] });
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
    },
  });
}

export function useUpdateWorkSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      dateISO: string;
      label: string;
      seconds: number;
      result_note?: string | undefined;
    }) => {
      const updatePayload: any = {
        label: input.label.trim(),
        seconds: Math.max(0, input.seconds),
      };
      if (input.result_note !== undefined) {
        updatePayload.result_note = input.result_note.trim();
      }

      const { error } = await supabase.from("work_sessions").update(updatePayload).eq("id", input.id);
      if (error) throw error;

      // Log to Audit Trail
      logAuditEvent({
        entity_type: "identity",
        action: "UPDATE",
        title: `Work Session Modified: "${input.label}"`,
        details: `Updated session duration to ${Math.round(input.seconds / 60)}m (${input.result_note ? `Note: ${input.result_note}` : "No note"}) on ${input.dateISO}`,
      });
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["day", vars.dateISO] });
      qc.invalidateQueries({ queryKey: ["day"] });
      qc.invalidateQueries({ queryKey: ["days_history"] });
      qc.invalidateQueries({ queryKey: ["week"] });
      qc.invalidateQueries({ queryKey: ["audit_logs"] });
    },
  });
}

export function useInvalidateDay(dateISO: string) {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["day", dateISO] });
    qc.invalidateQueries({ queryKey: ["daily_todos", dateISO] });
    qc.invalidateQueries({ queryKey: ["week"] });
  };
}
