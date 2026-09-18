// Weekly Todos Data Layer
// Persists weekly strategic objectives across all 7 days of the current ISO week (Mon - Sun).

import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { playTaskAlertTone } from "./task-timer-sound";
import { getDescendantIds } from "./task-tree-utils";

export interface WeeklyTodoItem {
  id: string;
  week_key: string; // e.g. "2026-W37"
  label: string;
  priority: "high" | "normal" | "low";
  done: boolean;
  created_at: string;
  estimated_minutes?: number | undefined;
  target_day?: string | undefined; // e.g. "Friday", "Mid-Week", "All Week"
  started_at?: string | undefined;
  time_spent_seconds?: number | undefined;
  parent_id?: string | undefined;
}

const WEEKLY_TODOS_STORAGE_PREFIX = "mission_weekly_todos_";

/**
 * Returns standard ISO-8601 week key: "YYYY-Www", e.g. "2026-W37".
 * Guaranteed consistent for every day from Monday 00:00 to Sunday 23:59.
 */
export function getCurrentISOWeekKey(targetDate: Date | string = new Date()): string {
  const d = typeof targetDate === "string" ? new Date(targetDate) : new Date(targetDate);
  const dateCopy = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Day of week in UTC (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayNum = dateCopy.getUTCDay() || 7;
  // Set to nearest Thursday: current date + 4 - current day number
  dateCopy.setUTCDate(dateCopy.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(dateCopy.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((dateCopy.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${dateCopy.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

/**
 * Returns ISO week key of the previous week (7 days prior).
 */
export function getPreviousISOWeekKey(targetDateOrKey?: Date | string): string {
  let d: Date;
  if (!targetDateOrKey) {
    d = new Date();
  } else if (typeof targetDateOrKey === "string" && targetDateOrKey.includes("-W")) {
    const parts = targetDateOrKey.split("-W");
    const year = parseInt(parts[0]!, 10);
    const week = parseInt(parts[1]!, 10);
    const simple = new Date(Date.UTC(year, 0, 4));
    const dayOfWeek = simple.getUTCDay() || 7;
    const mondayWeek1 = new Date(simple.getTime() - (dayOfWeek - 1) * 86400000);
    d = new Date(mondayWeek1.getTime() + (week - 1) * 7 * 86400000);
  } else {
    d = new Date(targetDateOrKey);
  }
  const prevDate = new Date(d.getTime() - 7 * 86400000);
  return getCurrentISOWeekKey(prevDate);
}

/**
 * Returns ISO week key of the next week (7 days later).
 */
export function getNextISOWeekKey(targetDateOrKey?: Date | string): string {
  let d: Date;
  if (!targetDateOrKey) {
    d = new Date();
  } else if (typeof targetDateOrKey === "string" && targetDateOrKey.includes("-W")) {
    const parts = targetDateOrKey.split("-W");
    const year = parseInt(parts[0]!, 10);
    const week = parseInt(parts[1]!, 10);
    const simple = new Date(Date.UTC(year, 0, 4));
    const dayOfWeek = simple.getUTCDay() || 7;
    const mondayWeek1 = new Date(simple.getTime() - (dayOfWeek - 1) * 86400000);
    d = new Date(mondayWeek1.getTime() + (week - 1) * 7 * 86400000);
  } else {
    d = new Date(targetDateOrKey);
  }
  const nextDate = new Date(d.getTime() + 7 * 86400000);
  return getCurrentISOWeekKey(nextDate);
}

/**
 * Roll over all incomplete weekly todos from a previous week into a target week.
 * Avoids duplicate creation if an objective with the same label is already present.
 */
export function rolloverIncompleteWeeklyTodos(fromWeekKey: string, toWeekKey: string): WeeklyTodoItem[] {
  if (typeof window === "undefined") return [];
  const fromTodos = getLocalWeeklyTodos(fromWeekKey);
  const incomplete = fromTodos.filter((t) => !t.done);
  if (incomplete.length === 0) return [];

  const currentTodos = getLocalWeeklyTodos(toWeekKey);
  const existingLabels = new Set(currentTodos.map((t) => t.label.trim().toLowerCase()));

  // Map old IDs to new rolled IDs to preserve subtask hierarchy
  const idMap = new Map<string, string>();
  const itemsToRoll: { original: WeeklyTodoItem; newId: string }[] = [];

  for (const item of incomplete) {
    if (existingLabels.has(item.label.trim().toLowerCase())) continue;
    const newId = `wtodo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    idMap.set(item.id, newId);
    itemsToRoll.push({ original: item, newId });
  }

  const newRolledItems: WeeklyTodoItem[] = itemsToRoll.map(({ original: item, newId }) => {
    const remappedParentId = item.parent_id && idMap.has(item.parent_id)
      ? idMap.get(item.parent_id)
      : undefined;

    const rolled: WeeklyTodoItem = {
      id: newId,
      week_key: toWeekKey,
      label: item.label,
      priority: item.priority,
      done: false,
      created_at: new Date().toISOString(),
      ...(item.estimated_minutes !== undefined ? { estimated_minutes: item.estimated_minutes } : {}),
      ...(item.target_day ? { target_day: item.target_day } : { target_day: "Unassigned" }),
      ...(remappedParentId ? { parent_id: remappedParentId } : {}),
      time_spent_seconds: 0,
    };
    return rolled;
  });

  if (newRolledItems.length > 0) {
    const updated = [...currentTodos, ...newRolledItems];
    saveLocalWeeklyTodos(toWeekKey, updated);
  }

  try {
    localStorage.setItem(`mission_weekly_rollover_dismissed_${toWeekKey}`, "true");
  } catch {}

  return newRolledItems;
}

/**
 * Roll an uncompleted weekly todo (and any of its nested subtasks) from current week into next week.
 * Removes the items from current week and schedules them for next week preserving hierarchy.
 */
export function rollSingleWeeklyTodoToNextWeek(
  todoId: string,
  currentWeekKey?: string
): { success: boolean; nextWeekKey: string; taskLabel: string } {
  if (typeof window === "undefined") return { success: false, nextWeekKey: "", taskLabel: "" };

  const cKey = currentWeekKey || getCurrentISOWeekKey();
  const nKey = getNextISOWeekKey(cKey);

  const currentTodos = getLocalWeeklyTodos(cKey);
  const targetTodo = currentTodos.find((t) => t.id === todoId);
  if (!targetTodo) {
    return { success: false, nextWeekKey: nKey, taskLabel: "" };
  }

  // Find all descendants of targetTodo
  const descendantIds = getDescendantIds(todoId, currentTodos);
  const allIdsToMove = new Set([todoId, ...descendantIds]);
  const itemsToMove = currentTodos.filter((t) => allIdsToMove.has(t.id));

  // Remove from current week
  const updatedCurrent = currentTodos.filter((t) => !allIdsToMove.has(t.id));
  saveLocalWeeklyTodos(cKey, updatedCurrent);

  // Remap IDs for next week
  const idMap = new Map<string, string>();
  for (const item of itemsToMove) {
    idMap.set(item.id, `wtodo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`);
  }

  const rolledItems: WeeklyTodoItem[] = itemsToMove.map((item) => {
    const newId = idMap.get(item.id)!;
    const newParentId = item.parent_id && idMap.has(item.parent_id)
      ? idMap.get(item.parent_id)
      : undefined;

    return {
      ...item,
      id: newId,
      week_key: nKey,
      done: false,
      created_at: new Date().toISOString(),
      ...(newParentId ? { parent_id: newParentId } : {}),
      time_spent_seconds: 0,
    };
  });

  // Add to next week
  const nextTodos = getLocalWeeklyTodos(nKey);
  saveLocalWeeklyTodos(nKey, [...nextTodos, ...rolledItems]);

  return {
    success: true,
    nextWeekKey: nKey,
    taskLabel: targetTodo.label,
  };
}

/**
 * Returns the Monday and Sunday date range for a given date or ISO week.
 */
export function getWeekDateRange(targetDate: Date | string = new Date()): {
  weekKey: string;
  weekNumber: number;
  mondayDate: Date;
  sundayDate: Date;
  label: string;
} {
  const d = typeof targetDate === "string" ? new Date(targetDate) : new Date(targetDate);
  const day = d.getDay();
  // Distance to Monday (if Sunday (0), distance is -6; otherwise 1 - day)
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const weekKey = getCurrentISOWeekKey(d);
  const weekNumberMatch = weekKey.match(/W(\d+)/);
  const weekNumber = weekNumberMatch ? parseInt(weekNumberMatch[1]!, 10) : 1;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const startStr = `${monthNames[monday.getMonth()]} ${monday.getDate()}`;
  const endStr = `${monthNames[sunday.getMonth()]} ${sunday.getDate()}`;

  return {
    weekKey,
    weekNumber,
    mondayDate: monday,
    sundayDate: sunday,
    label: `Week ${weekNumber} • ${startStr} – ${endStr}`,
  };
}

export function getLocalWeeklyTodos(weekKey: string): WeeklyTodoItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${WEEKLY_TODOS_STORAGE_PREFIX}${weekKey}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalWeeklyTodos(weekKey: string, todos: WeeklyTodoItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${WEEKLY_TODOS_STORAGE_PREFIX}${weekKey}`, JSON.stringify(todos));
    window.dispatchEvent(
      new CustomEvent("mission_weekly_todos_updated", { detail: { weekKey } })
    );
  } catch (err) {
    console.warn("Failed to persist weekly todos", err);
  }
}

export function useWeeklyTodos(customWeekKey?: string) {
  const weekKey = useMemo(() => customWeekKey || getCurrentISOWeekKey(), [customWeekKey]);
  const previousWeekKey = useMemo(() => getPreviousISOWeekKey(weekKey), [weekKey]);
  const nextWeekKey = useMemo(() => getNextISOWeekKey(weekKey), [weekKey]);

  const [weeklyTodos, setWeeklyTodos] = useState<WeeklyTodoItem[]>(() => getLocalWeeklyTodos(weekKey));
  const [incompleteLastWeekTodos, setIncompleteLastWeekTodos] = useState<WeeklyTodoItem[]>(() => {
    return getLocalWeeklyTodos(previousWeekKey).filter((t) => !t.done);
  });
  const [rolloverDismissed, setRolloverDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(`mission_weekly_rollover_dismissed_${weekKey}`) === "true";
  });

  useEffect(() => {
    setWeeklyTodos(getLocalWeeklyTodos(weekKey));
    setIncompleteLastWeekTodos(getLocalWeeklyTodos(previousWeekKey).filter((t) => !t.done));
    if (typeof window !== "undefined") {
      setRolloverDismissed(
        localStorage.getItem(`mission_weekly_rollover_dismissed_${weekKey}`) === "true"
      );
    }

    const handler = (e: Event) => {
      const customEvt = e as CustomEvent;
      if (!customEvt.detail || customEvt.detail.weekKey === weekKey) {
        setWeeklyTodos(getLocalWeeklyTodos(weekKey));
      }
      if (!customEvt.detail || customEvt.detail.weekKey === previousWeekKey) {
        setIncompleteLastWeekTodos(getLocalWeeklyTodos(previousWeekKey).filter((t) => !t.done));
      }
    };
    window.addEventListener("mission_weekly_todos_updated", handler);
    return () => window.removeEventListener("mission_weekly_todos_updated", handler);
  }, [weekKey, previousWeekKey]);

  const rolloverFromLastWeek = useCallback(() => {
    const rolled = rolloverIncompleteWeeklyTodos(previousWeekKey, weekKey);
    setRolloverDismissed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem(`mission_weekly_rollover_dismissed_${weekKey}`, "true");
    }
    setWeeklyTodos(getLocalWeeklyTodos(weekKey));
    if (rolled.length > 0) {
      playTaskAlertTone("todo_check");
      toast.success(`Rolled over ${rolled.length} strategic objective${rolled.length > 1 ? "s" : ""} from last week!`);
    } else {
      toast.info("No new objectives needed to roll over.");
    }
    return rolled;
  }, [previousWeekKey, weekKey]);

  const dismissRollover = useCallback(() => {
    setRolloverDismissed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem(`mission_weekly_rollover_dismissed_${weekKey}`, "true");
    }
  }, [weekKey]);

  const rollTodoToNextWeek = useCallback(
    (todoId: string) => {
      const result = rollSingleWeeklyTodoToNextWeek(todoId, weekKey);
      if (result.success) {
        setWeeklyTodos(getLocalWeeklyTodos(weekKey));
        playTaskAlertTone("todo_check");
        toast.success(`Rolled "${result.taskLabel}" into next week (${result.nextWeekKey})!`);
      }
      return result;
    },
    [weekKey]
  );

  const addWeeklyTodo = useCallback(
    (input: {
      label: string;
      priority?: "high" | "normal" | "low" | undefined;
      estimated_minutes?: number | undefined;
      target_day?: string | undefined;
      parent_id?: string | undefined;
    }) => {
      const cleanLabel = input.label.trim();
      if (!cleanLabel) return null;

      const newTodo: WeeklyTodoItem = {
        id: `wtodo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        week_key: weekKey,
        label: cleanLabel,
        priority: input.priority || "normal",
        done: false,
        created_at: new Date().toISOString(),
        ...(input.estimated_minutes !== undefined ? { estimated_minutes: input.estimated_minutes } : {}),
        ...(input.target_day ? { target_day: input.target_day } : {}),
        ...(input.parent_id ? { parent_id: input.parent_id } : {}),
        time_spent_seconds: 0,
      };

      const existing = getLocalWeeklyTodos(weekKey);
      const next = [...existing, newTodo];
      saveLocalWeeklyTodos(weekKey, next);
      setWeeklyTodos(next);
      playTaskAlertTone("todo_check");
      toast.success(input.parent_id ? "Strategic subtask added!" : "Strategic weekly objective added for this week!");
      return newTodo;
    },
    [weekKey]
  );

  const toggleWeeklyTodo = useCallback(
    (todoId: string) => {
      const existing = getLocalWeeklyTodos(weekKey);
      const targetTodo = existing.find((t) => t.id === todoId);
      if (!targetTodo) return;

      const newDone = !targetTodo.done;
      const descendantIds = new Set(getDescendantIds(todoId, existing));

      // If unchecking, uncheck ancestors that were checked
      const ancestorIds = new Set<string>();
      if (!newDone) {
        let curr = targetTodo;
        while (curr && curr.parent_id) {
          ancestorIds.add(curr.parent_id);
          curr = existing.find((t) => t.id === curr!.parent_id)!;
        }
      }

      const affectedIds = new Set<string>([todoId]);
      if (newDone) {
        descendantIds.forEach((id) => affectedIds.add(id));
      } else {
        ancestorIds.forEach((id) => affectedIds.add(id));
      }

      let updated = existing.map((t) => {
        if (t.id === todoId) {
          return { ...t, done: newDone };
        }
        if (newDone && descendantIds.has(t.id)) {
          return { ...t, done: true };
        }
        if (!newDone && ancestorIds.has(t.id)) {
          return { ...t, done: false };
        }
        return t;
      });

      // Check upward if all siblings of target's parent are now done -> auto-complete parent
      if (newDone) {
        let target = updated.find((t) => t.id === todoId);
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

      saveLocalWeeklyTodos(weekKey, updated);
      setWeeklyTodos(updated);

      // Bi-directional check-off sync for all affected tasks
      for (const t of updated) {
        if (affectedIds.has(t.id)) {
          syncDailyTodoDoneFromWeekly(t.id, t.done);
        }
      }

      if (newDone) {
        playTaskAlertTone("todo_check");
        toast.success("Weekly objective accomplished!");
      }
    },
    [weekKey]
  );

  const updateWeeklyTodo = useCallback(
    (todoId: string, updates: Partial<WeeklyTodoItem>) => {
      const existing = getLocalWeeklyTodos(weekKey);
      const next = existing.map((t) => (t.id === todoId ? { ...t, ...updates } : t));
      saveLocalWeeklyTodos(weekKey, next);
      setWeeklyTodos(next);
    },
    [weekKey]
  );

  const deleteWeeklyTodo = useCallback(
    (todoId: string) => {
      const existing = getLocalWeeklyTodos(weekKey);
      const descendantIds = getDescendantIds(todoId, existing);
      const allIdsToDelete = new Set([todoId, ...descendantIds]);

      const next = existing.filter((t) => !allIdsToDelete.has(t.id));
      saveLocalWeeklyTodos(weekKey, next);
      setWeeklyTodos(next);
      toast.info(descendantIds.length > 0 ? `Removed objective and ${descendantIds.length} subtask(s).` : "Weekly todo removed.");
    },
    [weekKey]
  );

  const reorderWeeklyTodos = useCallback(
    (todos: WeeklyTodoItem[]) => {
      saveLocalWeeklyTodos(weekKey, todos);
      setWeeklyTodos(todos);
    },
    [weekKey]
  );

  const weekRange = useMemo(() => getWeekDateRange(), []);

  return {
    weekKey,
    previousWeekKey,
    nextWeekKey,
    weekRange,
    weeklyTodos,
    incompleteLastWeekTodos,
    rolloverDismissed,
    rolloverFromLastWeek,
    dismissRollover,
    rollTodoToNextWeek,
    addWeeklyTodo,
    toggleWeeklyTodo,
    updateWeeklyTodo,
    deleteWeeklyTodo,
    reorderWeeklyTodos,
  };
}

/**
 * Synchronize weekly todo completion state when a daily todo is checked/unchecked.
 */
export function syncWeeklyTodoDone(weeklyTodoId: string, done: boolean): void {
  if (typeof window === "undefined" || !weeklyTodoId) return;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(WEEKLY_TODOS_STORAGE_PREFIX)) {
        const raw = localStorage.getItem(key);
        if (raw && raw.includes(weeklyTodoId)) {
          const todos: WeeklyTodoItem[] = JSON.parse(raw);
          let modified = false;
          const updated = todos.map((item) => {
            if (item.id === weeklyTodoId && item.done !== done) {
              modified = true;
              return { ...item, done };
            }
            return item;
          });
          if (modified) {
            localStorage.setItem(key, JSON.stringify(updated));
            const weekKey = key.replace(WEEKLY_TODOS_STORAGE_PREFIX, "");
            window.dispatchEvent(
              new CustomEvent("mission_weekly_todos_updated", { detail: { weekKey } })
            );
          }
        }
      }
    }
  } catch (err) {
    console.warn("Failed to sync weekly todo completion from daily todo:", err);
  }
}

/**
 * Synchronize daily todo completion state when a weekly todo is checked/unchecked.
 */
export function syncDailyTodoDoneFromWeekly(weeklyTodoId: string, done: boolean): void {
  if (typeof window === "undefined" || !weeklyTodoId) return;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("mission_daily_todos_")) {
        const raw = localStorage.getItem(key);
        if (raw && raw.includes(weeklyTodoId)) {
          const todos: any[] = JSON.parse(raw);
          let modified = false;
          const updated = todos.map((item) => {
            if (item.weekly_todo_id === weeklyTodoId && item.done !== done) {
              modified = true;
              // If it's stored in Supabase, update async
              if (item.id && !item.id.startsWith("todo_")) {
                import("@/integrations/supabase/client").then(({ supabase }) => {
                  supabase.from("day_tasks").update({ done }).eq("id", item.id).then(() => {});
                }).catch(() => {});
              }
              return { ...item, done };
            }
            return item;
          });
          if (modified) {
            localStorage.setItem(key, JSON.stringify(updated));
            const dateStr = key.replace("mission_daily_todos_", "");
            window.dispatchEvent(
              new CustomEvent("mission_daily_todos_updated", { detail: { date: dateStr } })
            );
          }
        }
      }
    }
  } catch (err) {
    console.warn("Failed to sync daily todo completion from weekly todo:", err);
  }
}

/**
 * Directly add or sync a weekly todo from an external source (e.g. daily todo creation).
 * Ensures every task added to daily is automatically recorded in weekly todos.
 */
export function addWeeklyTodoDirectly(input: {
  id?: string | undefined;
  label: string;
  priority?: "high" | "normal" | "low" | undefined;
  estimated_minutes?: number | undefined;
  target_day?: string | undefined;
  parent_id?: string | undefined;
  done?: boolean | undefined;
  date?: string | undefined;
}): WeeklyTodoItem {
  const weekKey = getCurrentISOWeekKey(input.date || new Date());
  const cleanLabel = input.label.trim();
  const existing = getLocalWeeklyTodos(weekKey);

  // Check if already exists in this week (by label or id)
  const found = existing.find(
    (t) => (input.id && t.id === input.id) || t.label.toLowerCase() === cleanLabel.toLowerCase()
  );
  if (found) {
    return found;
  }

  // Derive day of week if date provided and target_day not specified
  let targetDay = input.target_day;
  if (!targetDay && input.date) {
    const d = new Date(input.date);
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    targetDay = dayNames[d.getDay()] || "All Week";
  }

  const newWeeklyTodo: WeeklyTodoItem = {
    id: input.id || `wtodo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    week_key: weekKey,
    label: cleanLabel,
    priority: input.priority || "normal",
    done: Boolean(input.done),
    created_at: new Date().toISOString(),
    ...(input.estimated_minutes !== undefined ? { estimated_minutes: input.estimated_minutes } : {}),
    ...(targetDay ? { target_day: targetDay } : {}),
    ...(input.parent_id ? { parent_id: input.parent_id } : {}),
    time_spent_seconds: 0,
  };

  const next = [...existing, newWeeklyTodo];
  saveLocalWeeklyTodos(weekKey, next);
  return newWeeklyTodo;
}
