// Daily Routine Blueprint (Wake-to-Sleep Common Tasks)
// Master timeline of recurring daily operational milestones with scheduled times attached.

import { useState, useEffect } from "react";

export type RoutineCategory =
  | "wake"
  | "health"
  | "deep_work"
  | "software"
  | "youtube"
  | "admin"
  | "sleep";

export interface RoutineTaskBlueprint {
  id: string;
  time: string; // 24-hour format "HH:MM" e.g. "06:00", "07:30", "22:30"
  label: string;
  estimatedMinutes: number;
  priority: "high" | "normal" | "low";
  category: RoutineCategory;
  enabled: boolean;
  notes?: string | undefined;
}

export const ROUTINE_CATEGORY_CONFIG: Record<
  RoutineCategory,
  { label: string; badgeClass: string; iconEmoji: string }
> = {
  wake: { label: "Wake Protocol", badgeClass: "border-amber-500/50 text-amber-400 bg-amber-950/20", iconEmoji: "🌅" },
  health: { label: "Health & Armor", badgeClass: "border-emerald-500/50 text-emerald-400 bg-emerald-950/20", iconEmoji: "💪" },
  deep_work: { label: "Apex Focus", badgeClass: "border-primary/50 text-primary bg-primary/10", iconEmoji: "⚡" },
  software: { label: "Software Agency", badgeClass: "border-cyan-500/50 text-cyan-400 bg-cyan-950/20", iconEmoji: "💻" },
  youtube: { label: "Media Empire", badgeClass: "border-rose-500/50 text-rose-400 bg-rose-950/20", iconEmoji: "🎬" },
  admin: { label: "Ops & Poland", badgeClass: "border-purple-500/50 text-purple-400 bg-purple-950/20", iconEmoji: "📋" },
  sleep: { label: "Sleep & Recovery", badgeClass: "border-blue-500/50 text-blue-400 bg-blue-950/20", iconEmoji: "🌙" },
};

export const DEFAULT_ROUTINE_BLUEPRINT: RoutineTaskBlueprint[] = [
  {
    id: "routine-wake",
    time: "06:00",
    label: "Wake Up, Cold Hydration & Natural Sunlight Exposure",
    estimatedMinutes: 15,
    priority: "normal",
    category: "wake",
    enabled: true,
    notes: "500ml water + electrolytes. View natural sunlight immediately to anchor circadian rhythm.",
  },
  {
    id: "routine-workout",
    time: "06:15",
    label: "Morning Physical Armor: Calisthenics & Mobility",
    estimatedMinutes: 45,
    priority: "normal",
    category: "health",
    enabled: true,
    notes: "Pushups, pullups, core circuit, mobility stretch. Cold shower transition.",
  },
  {
    id: "routine-fuel",
    time: "07:00",
    label: "High-Protein Fuel & Daily Strategic Blueprint Review",
    estimatedMinutes: 30,
    priority: "normal",
    category: "health",
    enabled: true,
    notes: "Clean nutrition. Review Today's mission objective and primary North Star goal.",
  },
  {
    id: "routine-apex-1",
    time: "07:30",
    label: "Apex Deep Work Block 1: Hardest Technical Deliverable",
    estimatedMinutes: 180,
    priority: "high",
    category: "deep_work",
    enabled: true,
    notes: "No notifications. High-leverage software engineering or complex architecture.",
  },
  {
    id: "routine-reset-1",
    time: "10:30",
    label: "Active Cognitive Reset: Walking & Hydration",
    estimatedMinutes: 15,
    priority: "low",
    category: "health",
    enabled: true,
    notes: "Step away from screens. Eye resting, posture reset, fresh water.",
  },
  {
    id: "routine-apex-2",
    time: "10:45",
    label: "Deep Work Block 2: Feature Execution & Systems Polish",
    estimatedMinutes: 120,
    priority: "high",
    category: "deep_work",
    enabled: true,
    notes: "Core development, refactoring, or client milestone progress.",
  },
  {
    id: "routine-lunch",
    time: "12:45",
    label: "Nutrient-Dense Lunch & Sunlight Walk",
    estimatedMinutes: 45,
    priority: "normal",
    category: "health",
    enabled: true,
    notes: "Whole food fuel. 15-minute outdoor walk for insulin sensitivity and alertness.",
  },
  {
    id: "routine-software",
    time: "13:30",
    label: "Software Pipeline: Client Outreach & Commercial Proposals",
    estimatedMinutes: 120,
    priority: "high",
    category: "software",
    enabled: true,
    notes: "15 cold outreach messages, follow-ups on active deals, send contracts.",
  },
  {
    id: "routine-youtube",
    time: "15:30",
    label: "YouTube Production: Scripting, Voiceover & B-Roll Editing",
    estimatedMinutes: 150,
    priority: "high",
    category: "youtube",
    enabled: true,
    notes: "High retention scripting, record teleprompter take, or edit timeline.",
  },
  {
    id: "routine-poland",
    time: "18:00",
    label: "Poland Relocation Ops: Language, Legal Dossier & Capital Allocation",
    estimatedMinutes: 45,
    priority: "normal",
    category: "admin",
    enabled: true,
    notes: "Polish language vocabulary drill, visa document check, update capital vault envelopes.",
  },
  {
    id: "routine-conditioning",
    time: "18:45",
    label: "Evening Physical Conditioning & Decompression Walk",
    estimatedMinutes: 45,
    priority: "normal",
    category: "health",
    enabled: true,
    notes: "Zone 2 aerobic walk or second workout session.",
  },
  {
    id: "routine-dinner",
    time: "19:30",
    label: "Dinner & Recovery Meal",
    estimatedMinutes: 60,
    priority: "normal",
    category: "health",
    enabled: true,
    notes: "Relaxation with clean evening fuel.",
  },
  {
    id: "routine-ops",
    time: "20:30",
    label: "Campaign Ops & Inbox Zero",
    estimatedMinutes: 45,
    priority: "normal",
    category: "admin",
    enabled: true,
    notes: "Clear all urgent communications, organize project files, clear tickets.",
  },
  {
    id: "routine-debrief",
    time: "21:15",
    label: "Tactical Evening Debrief: Log Snapshot & Tomorrow Setup",
    estimatedMinutes: 30,
    priority: "high",
    category: "admin",
    enabled: true,
    notes: "Run AI Tactical Debrief, check off daily score, stage top 3 priorities for tomorrow.",
  },
  {
    id: "routine-winddown",
    time: "21:45",
    label: "Digital Wind Down: Orange Light & Reading",
    estimatedMinutes: 45,
    priority: "normal",
    category: "sleep",
    enabled: true,
    notes: "Kill blue light screens. Read physical book or Kindle paperwhite.",
  },
  {
    id: "routine-sleep",
    time: "22:30",
    label: "Sleep Protocol: Blackout, Cold Room & 8h Deep Recovery",
    estimatedMinutes: 480,
    priority: "high",
    category: "sleep",
    enabled: true,
    notes: "Dark room, 18-19°C, sleep mask. Complete biological restoration.",
  },
];

const BLUEPRINT_STORAGE_KEY = "mission_daily_routine_blueprint_v1";

export function getRoutineBlueprint(): RoutineTaskBlueprint[] {
  if (typeof window === "undefined") return DEFAULT_ROUTINE_BLUEPRINT;
  try {
    const raw = localStorage.getItem(BLUEPRINT_STORAGE_KEY);
    if (!raw) return DEFAULT_ROUTINE_BLUEPRINT;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ROUTINE_BLUEPRINT;
  } catch {
    return DEFAULT_ROUTINE_BLUEPRINT;
  }
}

export function saveRoutineBlueprint(blueprint: RoutineTaskBlueprint[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BLUEPRINT_STORAGE_KEY, JSON.stringify(blueprint));
    window.dispatchEvent(new CustomEvent("mission_blueprint_updated"));
  } catch (err) {
    console.warn("Failed to persist routine blueprint", err);
  }
}

export function resetRoutineBlueprintToDefault(): RoutineTaskBlueprint[] {
  saveRoutineBlueprint(DEFAULT_ROUTINE_BLUEPRINT);
  return DEFAULT_ROUTINE_BLUEPRINT;
}

export function useRoutineBlueprint() {
  const [blueprint, setBlueprint] = useState<RoutineTaskBlueprint[]>(getRoutineBlueprint);

  useEffect(() => {
    const handler = () => {
      setBlueprint(getRoutineBlueprint());
    };
    window.addEventListener("mission_blueprint_updated", handler);
    return () => window.removeEventListener("mission_blueprint_updated", handler);
  }, []);

  const updateBlueprint = (newBlueprint: RoutineTaskBlueprint[]) => {
    saveRoutineBlueprint(newBlueprint);
    setBlueprint(newBlueprint);
  };

  const addTask = (task: Omit<RoutineTaskBlueprint, "id">) => {
    const newTask: RoutineTaskBlueprint = {
      ...task,
      id: `routine-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    const updated = [...blueprint, newTask].sort((a, b) => a.time.localeCompare(b.time));
    updateBlueprint(updated);
    return newTask;
  };

  const editTask = (id: string, updates: Partial<RoutineTaskBlueprint>) => {
    const updated = blueprint.map((t) => (t.id === id ? { ...t, ...updates } : t));
    updateBlueprint(updated.sort((a, b) => a.time.localeCompare(b.time)));
  };

  const deleteTask = (id: string) => {
    const updated = blueprint.filter((t) => t.id !== id);
    updateBlueprint(updated);
  };

  const resetToDefault = () => {
    const def = resetRoutineBlueprintToDefault();
    setBlueprint(def);
  };

  return {
    blueprint,
    updateBlueprint,
    addTask,
    editTask,
    deleteTask,
    resetToDefault,
  };
}
