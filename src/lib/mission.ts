export type PillarRow = {
  id: string;
  key: string;
  emoji: string;
  label: string;
  sublabel: string | null;
  unit: string;
  current_value: number;
  target_value: number;
  stretch_value: number | null;
  weight: number;
  sort_order: number;
};

export type IdentityRow = {
  id: string;
  weekday: number;
  emoji: string;
  name: string;
  description: string;
  mission: string;
  categories: string[];
  loop: string[];
  kpis: string[];
  completion_criteria: string;
};

export type DayRow = {
  id: string;
  day_date: string;
  identity_id: string | null;
  objective: string;
  output_note: string;
  key_objective_done: boolean;
  closed: boolean;
};

export type TaskRow = {
  id: string;
  day_id: string;
  label: string;
  position: number;
  done: boolean;
};

export type SessionRow = {
  id: string;
  day_id: string;
  label: string;
  started_at: string;
  ended_at: string | null;
  seconds: number;
  running: boolean;
  result_note: string;
};

export const WEEKDAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function todayISO(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function daysUntil(dateISO: string, from = new Date()): number {
  const [yStr, mStr, dStr] = dateISO.split("-");
  const y = Number(yStr) || 2027;
  const m = Number(mStr) || 2;
  const d = Number(dStr) || 10;
  const target = Date.UTC(y, m - 1, d);
  const start = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  return Math.max(0, Math.round((target - start) / 86_400_000));
}

export function pillarProgress(p: PillarRow): number {
  if (!p.target_value) return 0;
  return clamp01(p.current_value / p.target_value);
}

export function clamp01(n: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
}

export function missionProgress(pillars: PillarRow[]): number {
  const totalWeight = pillars.reduce((s, p) => s + (p.weight || 0), 0);
  if (!totalWeight) return 0;
  const weighted = pillars.reduce((s, p) => s + pillarProgress(p) * (p.weight || 0), 0);
  return clamp01(weighted / totalWeight);
}

export function formatValue(value: number, unit: string): string {
  if (unit === "USD") {
    return value >= 10000
      ? `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`
      : `$${Math.round(value).toLocaleString("en-US")}`;
  }
  if (unit === "ETB") {
    return value >= 1_000_000
      ? `${(value / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M ETB`
      : `${Math.round(value / 1000).toLocaleString("en-US")}K ETB`;
  }
  return `${Math.round(value).toLocaleString("en-US")} ${unit}`;
}

export type ContingencyStatus = "secure" | "acceptable" | "below";

export function contingency(p: PillarRow): ContingencyStatus {
  if (p.stretch_value && p.current_value >= p.stretch_value) return "secure";
  if (p.current_value >= p.target_value) return "secure";
  if (p.current_value >= p.target_value * 0.75) return "acceptable";
  return "below";
}

export function totalFocusedSeconds(sessions: SessionRow[], now = Date.now()): number {
  return sessions.reduce((sum, s) => {
    if (s.running) {
      return sum + s.seconds + Math.floor((now - new Date(s.started_at).getTime()) / 1000);
    }
    return sum + s.seconds;
  }, 0);
}

export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

export function formatClock(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

/**
 * Daily mission score, 0-100.
 * Loop completion 45 · deep work vs target 30 · key objective 15 · output logged 10
 */
export function dailyScore(input: {
  tasksDone: number;
  tasksTotal: number;
  focusedSeconds: number;
  deepWorkTargetHours: number;
  keyObjectiveDone: boolean;
  hasOutput: boolean;
}): number {
  const loop = input.tasksTotal ? input.tasksDone / input.tasksTotal : 0;
  const deep = clamp01(input.focusedSeconds / 3600 / Math.max(1, input.deepWorkTargetHours));
  return Math.round(
    loop * 45 + deep * 30 + (input.keyObjectiveDone ? 15 : 0) + (input.hasOutput ? 10 : 0),
  );
}

export function requiredMonthlySavings(remaining: number, daysLeft: number): number {
  const months = Math.max(1, daysLeft / 30.44);
  return remaining / months;
}

export type Alert = { tone: "red" | "green" | "amber"; text: string };

export function buildAlerts(
  pillars: PillarRow[],
  daysLeft: number,
  focusedSeconds: number,
  deepTargetHours: number,
): Alert[] {
  const effectiveTarget = Math.max(16, Number(deepTargetHours) || 16);
  const out: Alert[] = [];
  for (const p of pillars) {
    const pct = pillarProgress(p);
    const remaining = Math.max(0, p.target_value - p.current_value);
    if (pct >= 1) {
      out.push({ tone: "green", text: `${p.label} target reached — ${formatValue(p.target_value, p.unit)} secured.` });
      continue;
    }
    if (pct < 0.5) {
      out.push({
        tone: "red",
        text: `${p.label} is at ${Math.round(pct * 100)}% — ${formatValue(remaining, p.unit)} remaining, ${formatValue(
          requiredMonthlySavings(remaining, daysLeft),
          p.unit,
        )} per month needed.`,
      });
    } else {
      out.push({
        tone: "amber",
        text: `${p.label} at ${Math.round(pct * 100)}% — ${formatValue(remaining, p.unit)} left before ${daysLeft} days run out.`,
      });
    }
  }
  const hours = focusedSeconds / 3600;
  if (hours >= effectiveTarget) {
    out.push({ tone: "green", text: `Deep work target met — ${formatDuration(focusedSeconds)} focused today.` });
  } else {
    out.push({
      tone: "amber",
      text: `${formatDuration(focusedSeconds)} focused today · target ${effectiveTarget}h.`,
    });
  }
  return out;
}
