// Campaign Focus Runs (10, 20, 30, 60 Day Sprints)
// High-intensity sprints centered on ONE primary North Star goal with supporting daily focal points.

import { useState, useEffect, useMemo } from "react";
import { todayISO } from "./mission";

export interface FocusRunFocalPoint {
  id: string;
  title: string;
  metricTarget?: string | undefined;
}

export interface FocusRunDayCheckin {
  date: string; // YYYY-MM-DD
  checkedFocalPointIds: string[];
  reflectionNote?: string | undefined;
  score?: number | undefined;
}

export interface FocusRun {
  id: string;
  title: string;
  durationDays: number; // 10, 20, 30, 60, or custom
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  primaryFocus: string; // The singular North Star goal
  focalPoints: FocusRunFocalPoint[];
  status: "active" | "completed" | "paused" | "abandoned";
  createdAt: string;
  checkins: Record<string, FocusRunDayCheckin>;
  completionNotes?: string | undefined;
}

const RUNS_STORAGE_KEY = "mission_focus_runs_v1";

export const INITIAL_DEFAULT_RUN: FocusRun = {
  id: "run-initial-surge",
  title: "Poznań War Chest & Client Acquisition Surge",
  durationDays: 30,
  startDate: todayISO(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]!,
  primaryFocus: "Close $5,000 Software Client Deals & Lock Down Poznań Studio Allocation",
  focalPoints: [
    {
      id: "fp-1",
      title: "16 Hours Daily Deep Focus Block Discipline",
      metricTarget: "16h / day",
    },
    {
      id: "fp-2",
      title: "15 Commercial Software Outreach Messages Sent Daily",
      metricTarget: "15 msgs / day",
    },
    {
      id: "fp-3",
      title: "Produce & Publish 2 High-Retention Videos Weekly",
      metricTarget: "2 vids / wk",
    },
    {
      id: "fp-4",
      title: "Daily Morning & Evening Physical Armor Conditioning",
      metricTarget: "2 sessions / day",
    },
  ],
  status: "active",
  createdAt: new Date().toISOString(),
  checkins: {},
};

export function getStoredRuns(): FocusRun[] {
  if (typeof window === "undefined") return [INITIAL_DEFAULT_RUN];
  try {
    const raw = localStorage.getItem(RUNS_STORAGE_KEY);
    if (!raw) return [INITIAL_DEFAULT_RUN];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [INITIAL_DEFAULT_RUN];
  } catch {
    return [INITIAL_DEFAULT_RUN];
  }
}

export function saveStoredRuns(runs: FocusRun[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(RUNS_STORAGE_KEY, JSON.stringify(runs));
    window.dispatchEvent(new CustomEvent("mission_focus_runs_updated"));
  } catch (err) {
    console.warn("Failed to persist focus runs", err);
  }
}

export function useFocusRuns() {
  const [runs, setRuns] = useState<FocusRun[]>(getStoredRuns);

  useEffect(() => {
    const handler = () => {
      setRuns(getStoredRuns());
    };
    window.addEventListener("mission_focus_runs_updated", handler);
    return () => window.removeEventListener("mission_focus_runs_updated", handler);
  }, []);

  const activeRun = useMemo(() => {
    return runs.find((r) => r.status === "active") || null;
  }, [runs]);

  const startNewRun = (data: {
    title: string;
    durationDays: number;
    startDate?: string;
    primaryFocus: string;
    focalPoints: Array<{ title: string; metricTarget?: string }>;
  }) => {
    const start = data.startDate || todayISO();
    const startDateObj = new Date(start);
    const endDateObj = new Date(startDateObj.getTime() + data.durationDays * 24 * 60 * 60 * 1000);
    const end = endDateObj.toISOString().split("T")[0]!;

    // If there's an existing active run, set it to completed or paused
    const updatedRuns = runs.map((r) =>
      r.status === "active" ? { ...r, status: "completed" as const } : r
    );

    const newRun: FocusRun = {
      id: `run-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: data.title.trim(),
      durationDays: data.durationDays,
      startDate: start,
      endDate: end,
      primaryFocus: data.primaryFocus.trim(),
      focalPoints: data.focalPoints.map((fp, i) => ({
        id: `fp-${Date.now()}-${i}`,
        title: fp.title.trim(),
        metricTarget: fp.metricTarget?.trim() || undefined,
      })),
      status: "active",
      createdAt: new Date().toISOString(),
      checkins: {},
    };

    const finalRuns = [newRun, ...updatedRuns];
    saveStoredRuns(finalRuns);
    setRuns(finalRuns);
    return newRun;
  };

  const checkinFocalPoint = (runId: string, focalPointId: string, isChecked: boolean, date = todayISO()) => {
    const run = runs.find((r) => r.id === runId);
    if (!run) return;

    const existingCheckin = run.checkins[date] || {
      date,
      checkedFocalPointIds: [],
    };

    let nextChecked: string[];
    if (isChecked) {
      nextChecked = Array.from(new Set([...existingCheckin.checkedFocalPointIds, focalPointId]));
    } else {
      nextChecked = existingCheckin.checkedFocalPointIds.filter((id) => id !== focalPointId);
    }

    const updatedCheckin: FocusRunDayCheckin = {
      ...existingCheckin,
      checkedFocalPointIds: nextChecked,
    };

    const updatedRun: FocusRun = {
      ...run,
      checkins: {
        ...run.checkins,
        [date]: updatedCheckin,
      },
    };

    const nextRuns = runs.map((r) => (r.id === runId ? updatedRun : r));
    saveStoredRuns(nextRuns);
    setRuns(nextRuns);
  };

  const completeRun = (runId: string, notes?: string) => {
    const nextRuns = runs.map((r) =>
      r.id === runId
        ? {
            ...r,
            status: "completed" as const,
            completionNotes: notes || "Run successfully completed!",
          }
        : r
    );
    saveStoredRuns(nextRuns);
    setRuns(nextRuns);
  };

  const deleteRun = (runId: string) => {
    const nextRuns = runs.filter((r) => r.id !== runId);
    saveStoredRuns(nextRuns);
    setRuns(nextRuns);
  };

  return {
    runs,
    activeRun,
    startNewRun,
    checkinFocalPoint,
    completeRun,
    deleteRun,
  };
}

export function calculateRunMetrics(run: FocusRun | null) {
  if (!run) return null;

  const today = todayISO();
  const startMs = new Date(run.startDate).getTime();
  const todayMs = new Date(today).getTime();
  const diffDays = Math.floor((todayMs - startMs) / (1000 * 60 * 60 * 24));

  const currentDayNumber = Math.max(1, Math.min(run.durationDays, diffDays + 1));
  const daysRemaining = Math.max(0, run.durationDays - currentDayNumber);
  const progressPercent = Math.min(100, Math.round((currentDayNumber / run.durationDays) * 100));

  const todayCheckin = run.checkins[today] || {
    date: today,
    checkedFocalPointIds: [],
  };

  const totalFocalPoints = run.focalPoints.length;
  const todayCheckedCount = todayCheckin.checkedFocalPointIds.length;
  const todayCompletionRate =
    totalFocalPoints > 0 ? Math.round((todayCheckedCount / totalFocalPoints) * 100) : 0;

  // Calculate check-in days count
  const checkinDaysCount = Object.keys(run.checkins).filter(
    (d) => run.checkins[d] && run.checkins[d]!.checkedFocalPointIds.length > 0
  ).length;

  return {
    currentDayNumber,
    totalDays: run.durationDays,
    daysRemaining,
    progressPercent,
    todayCheckin,
    totalFocalPoints,
    todayCheckedCount,
    todayCompletionRate,
    checkinDaysCount,
  };
}
