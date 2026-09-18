// Weekly Quantitative Goals & Analytics Engine
// Powers 7-day quantitative quotas, character deployment tracking, category-by-category assessments, and brutally honest reviews.

import { useState, useEffect, useMemo, useCallback } from "react";
import { getCurrentISOWeekKey, getWeekDateRange, useWeeklyTodos, type WeeklyTodoItem } from "./weekly-todos-data";
import { useDaysHistory, useIdentities, type DayHistoryItem } from "./mission-data";
import { type IdentityRow } from "./mission";

export interface WeeklyQuantitativeGoals {
  weekKey: string;
  targetTasks: number; // e.g. 20
  targetFocusHours: number; // e.g. 45
  targetKeyObjectives: number; // e.g. 5
  targetHighPriority: number; // e.g. 8
  targetAvgScore?: number | undefined; // e.g. 80
  targetDeepSessions?: number | undefined; // e.g. 15 focus sessions started
  targetDaysLogged?: number | undefined; // e.g. 6 out of 7 days
  targetAvgDailyScore?: number | undefined; // e.g. 75 minimum average daily score
  targetOutputNotes?: number | undefined; // e.g. 5 days with output notes
}

export interface WeeklyActuals {
  completedTasks: number;
  totalTasks: number;
  focusedSeconds: number;
  focusedHours: number;
  keyObjectivesDone: number;
  highPriorityDone: number;
  daysLogged: number;
  avgDailyScore: number;
  deepSessionsCount: number; // total focus sessions started
  daysWithOutputNote: number; // days that have a non-empty output_note
  consistencyPct: number; // (daysLogged / 7) * 100
}

export interface CharacterWeeklyStats {
  identityId: string;
  name: string;
  color: string;
  emoji: string;
  daysActive: number;
  focusedSeconds: number;
  tasksDone: number;
  sharePercent: number;
}

export type CategoryStatus = "apex" | "combat_ready" | "acceptable" | "underperforming" | "critical";

export interface WeeklyCategoryExpandedMetric {
  label: string;
  actual: number | string;
  target: number | string;
  met: boolean;
}

export interface WeeklyCategoryEvaluation {
  category: "focus" | "tasks" | "characters" | "objectives";
  title: string;
  score: number; // 0-100
  status: CategoryStatus;
  statusLabel: string;
  badgeEmoji: string;
  colorClasses: {
    border: string;
    bg: string;
    text: string;
    badgeBg: string;
  };
  metricsSummary: string;
  diagnosis: string;
  verdict: string;
  expandedMetrics: WeeklyCategoryExpandedMetric[];
}

export interface WeeklyReviewDiagnosis {
  overallScore: number; // 0-100
  letterGrade: "S" | "A+" | "A" | "B" | "C" | "D";
  status: CategoryStatus;
  statusTitle: string;
  headline: string;
  brutalAssessment: string;
  keyWeakness: string;
  actionProtocol: string;
  allTargetsMet: boolean;
  projectedXPBonus: number;
  quotasCrushedCount: number; // how many of the 8 quotas were met
  totalQuotas: number; // always 8
}

/** Summary for a single historical week — used in the week-by-week calendar. */
export interface WeeklyHistorySummary {
  weekKey: string;           // "2026-W37"
  label: string;             // "Sep 1 – Sep 7"
  mondayDate: string;        // "2026-09-01"
  sundayDate: string;        // "2026-09-07"
  letterGrade: "S" | "A+" | "A" | "B" | "C" | "D";
  overallScore: number;      // 0-100
  status: CategoryStatus;
  completedTasks: number;
  totalTasks: number;
  focusedHours: number;
  daysLogged: number;
  keyObjectivesDone: number;
  avgDailyScore: number;
  quotasCrushed: number;     // out of 8
  totalQuotas: number;       // 8
  xpBonusEarned: number;
  dominantIdentity: { name: string; emoji: string } | null;
  headline: string;
  statusTitle: string;
  deepSessionsCount: number;
  daysWithOutputNote: number;
  highPriorityDone: number;
  consistencyPct: number;
}

const WEEKLY_GOALS_STORAGE_PREFIX = "mission_weekly_goals_";

export const DEFAULT_WEEKLY_GOALS: Omit<WeeklyQuantitativeGoals, "weekKey"> = {
  targetTasks: 20,
  targetFocusHours: 45,
  targetKeyObjectives: 5,
  targetHighPriority: 8,
  targetAvgScore: 80,
  targetDeepSessions: 15,
  targetDaysLogged: 6,
  targetAvgDailyScore: 75,
  targetOutputNotes: 5,
};

export function getLocalWeeklyGoals(weekKey: string): WeeklyQuantitativeGoals {
  if (typeof window === "undefined") {
    return { weekKey, ...DEFAULT_WEEKLY_GOALS };
  }
  try {
    const raw = localStorage.getItem(`${WEEKLY_GOALS_STORAGE_PREFIX}${weekKey}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { weekKey, ...DEFAULT_WEEKLY_GOALS, ...parsed };
    }
  } catch (err) {
    console.warn("Failed to load local weekly goals", err);
  }
  return { weekKey, ...DEFAULT_WEEKLY_GOALS };
}

export function saveLocalWeeklyGoals(weekKey: string, goals: WeeklyQuantitativeGoals): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${WEEKLY_GOALS_STORAGE_PREFIX}${weekKey}`, JSON.stringify(goals));
    window.dispatchEvent(
      new CustomEvent("mission_weekly_goals_updated", { detail: { weekKey } })
    );
  } catch (err) {
    console.warn("Failed to save local weekly goals", err);
  }
}

/**
 * Filter days from history that belong to the specified ISO week (Monday through Sunday).
 */
export function getDaysForISOWeek(history: DayHistoryItem[], weekKey: string): DayHistoryItem[] {
  return history.filter((d) => getCurrentISOWeekKey(d.day_date) === weekKey);
}

/**
 * Computes character (identity) deployment statistics for the specified week.
 */
export function calculateCharacterWeeklyStats(
  daysInWeek: DayHistoryItem[],
  identities: IdentityRow[],
  weeklyTodos: WeeklyTodoItem[]
): {
  characterStats: CharacterWeeklyStats[];
  neglectedIdentities: IdentityRow[];
  mostActiveCharacter: CharacterWeeklyStats | null;
} {
  const totalDaysWithCharacter = daysInWeek.filter((d) => d.identity).length;

  const characterMap = new Map<
    string,
    {
      identity: IdentityRow;
      daysActive: number;
      focusedSeconds: number;
      tasksDone: number;
    }
  >();

  // Initialize with all known identities so neglected ones are tracked
  identities.forEach((ident) => {
    characterMap.set(ident.id, {
      identity: ident,
      daysActive: 0,
      focusedSeconds: 0,
      tasksDone: 0,
    });
  });

  // Aggregate stats from history days
  daysInWeek.forEach((day) => {
    const identId = day.identity?.id || day.identity_id;
    if (identId && characterMap.has(identId)) {
      const entry = characterMap.get(identId)!;
      entry.daysActive += 1;
      entry.focusedSeconds += day.focusedSeconds || 0;
      entry.tasksDone += day.tasksDone || 0;
    } else if (day.identity) {
      characterMap.set(day.identity.id, {
        identity: day.identity,
        daysActive: 1,
        focusedSeconds: day.focusedSeconds || 0,
        tasksDone: day.tasksDone || 0,
      });
    }
  });

  const characterStats: CharacterWeeklyStats[] = Array.from(characterMap.values()).map((entry) => {
    const sharePercent =
      totalDaysWithCharacter > 0
        ? Math.round((entry.daysActive / totalDaysWithCharacter) * 100)
        : 0;

    return {
      identityId: entry.identity.id,
      name: entry.identity.name,
      color: "amber",
      emoji: entry.identity.emoji || "👤",
      daysActive: entry.daysActive,
      focusedSeconds: entry.focusedSeconds,
      tasksDone: entry.tasksDone,
      sharePercent,
    };
  });

  // Sort by most active
  characterStats.sort((a, b) => b.daysActive - a.daysActive || b.focusedSeconds - a.focusedSeconds);

  const neglectedIdentities = identities.filter((ident) => {
    const stat = characterStats.find((s) => s.identityId === ident.id);
    return !stat || stat.daysActive === 0;
  });

  const mostActiveCharacter = characterStats.length > 0 && characterStats[0]!.daysActive > 0 ? characterStats[0]! : null;

  return {
    characterStats,
    neglectedIdentities,
    mostActiveCharacter,
  };
}

/**
 * Calculates current actual metrics for the week.
 */
export function calculateWeeklyActuals(
  weeklyTodos: WeeklyTodoItem[],
  daysInWeek: DayHistoryItem[]
): WeeklyActuals {
  const completedTasks = weeklyTodos.filter((t) => t.done).length;
  const totalTasks = weeklyTodos.length;
  const highPriorityDone = weeklyTodos.filter((t) => t.done && t.priority === "high").length;

  const focusedSeconds = daysInWeek.reduce((sum, d) => sum + (d.focusedSeconds || 0), 0);
  const focusedHours = Math.round((focusedSeconds / 3600) * 10) / 10;
  const keyObjectivesDone = daysInWeek.filter((d) => d.key_objective_done).length;
  const daysLogged = daysInWeek.length;

  const totalScore = daysInWeek.reduce((sum, d) => sum + (d.score || 0), 0);
  const avgDailyScore = daysLogged > 0 ? Math.round(totalScore / daysLogged) : 0;

  // New expanded metrics
  const deepSessionsCount = daysInWeek.reduce((sum, d) => sum + (d.sessions?.length || 0), 0);
  const daysWithOutputNote = daysInWeek.filter((d) => d.output_note && d.output_note.trim().length > 0).length;
  const consistencyPct = Math.round((daysLogged / 7) * 100);

  return {
    completedTasks,
    totalTasks,
    focusedSeconds,
    focusedHours,
    keyObjectivesDone,
    highPriorityDone,
    daysLogged,
    avgDailyScore,
    deepSessionsCount,
    daysWithOutputNote,
    consistencyPct,
  };
}

/**
 * Generates category-by-category evaluations with diagnostic verdicts.
 */
export function evaluateWeeklyCategories(
  goals: WeeklyQuantitativeGoals,
  actuals: WeeklyActuals,
  characterStats: CharacterWeeklyStats[],
  neglectedIdentities: IdentityRow[]
): WeeklyCategoryEvaluation[] {
  // 1. Focus Volume (targetFocusHours)
  const focusPct = goals.targetFocusHours > 0 ? (actuals.focusedHours / goals.targetFocusHours) * 100 : 0;
  let focusStatus: CategoryStatus = "critical";
  let focusStatusLabel = "CRITICAL FAILURE";
  let focusBadge = "💀";
  let focusDiagnosis = `Only ${actuals.focusedHours}h of ${goals.targetFocusHours}h target logged (${Math.round(focusPct)}%). Severe deep work deficit.`;
  let focusVerdict = "You are losing momentum. At this rate, your strategic milestones and relocation timeline will slip drastically. Reclaim your focus schedule now.";

  if (focusPct >= 100) {
    focusStatus = "apex";
    focusStatusLabel = "APEX OUTPUT";
    focusBadge = "👑";
    focusDiagnosis = `Crushed quota with ${actuals.focusedHours}h / ${goals.targetFocusHours}h logged (${Math.round(focusPct)}%). Exceptional endurance.`;
    focusVerdict = "Dominant execution. You outworked the baseline standard. Maintain this disciplined barrier against distractions.";
  } else if (focusPct >= 85) {
    focusStatus = "combat_ready";
    focusStatusLabel = "COMBAT READY";
    focusBadge = "⚔️";
    focusDiagnosis = `Solid focus volume: ${actuals.focusedHours}h / ${goals.targetFocusHours}h (${Math.round(focusPct)}%). Near quota.`;
    focusVerdict = "Strong work rhythm. Push through the last few sprint blocks to hit complete 100% quota fulfillment.";
  } else if (focusPct >= 65) {
    focusStatus = "acceptable";
    focusStatusLabel = "ACCEPTABLE PACE";
    focusBadge = "⚡";
    focusDiagnosis = `Moderate output: ${actuals.focusedHours}h / ${goals.targetFocusHours}h (${Math.round(focusPct)}%). Passing, but leaves surplus on table.`;
    focusVerdict = "You are coasting in the middle. Cut afternoon drift and phone micro-distractions to convert acceptable into elite.";
  } else if (focusPct >= 45) {
    focusStatus = "underperforming";
    focusStatusLabel = "UNDERPERFORMING";
    focusBadge = "⚠️";
    focusDiagnosis = `Sub-par volume: ${actuals.focusedHours}h / ${goals.targetFocusHours}h (${Math.round(focusPct)}%). Falling significantly short.`;
    focusVerdict = "You spent more time reacting than executing. Eliminate low-leverage browsing and enforce unbroken 90-minute blocks.";
  }

  // 2. Task Velocity & Deliverables (targetTasks & targetHighPriority)
  const taskPct = goals.targetTasks > 0 ? (actuals.completedTasks / goals.targetTasks) * 100 : 0;
  const prioPct = goals.targetHighPriority > 0 ? (actuals.highPriorityDone / goals.targetHighPriority) * 100 : 0;
  const tasksComposite = Math.round((taskPct * 0.6) + (prioPct * 0.4));

  let taskStatus: CategoryStatus = "critical";
  let taskStatusLabel = "BOTTLENECKED";
  let taskBadge = "🛑";
  let taskDiagnosis = `Completed only ${actuals.completedTasks} / ${goals.targetTasks} tasks (${actuals.highPriorityDone} / ${goals.targetHighPriority} high priority).`;
  let taskVerdict = "High backlog accumulation. You planned tasks but failed to close them out. Stop over-planning and start shipping.";

  if (tasksComposite >= 100) {
    taskStatus = "apex";
    taskStatusLabel = "APEX VELOCITY";
    taskBadge = "🚀";
    taskDiagnosis = `Flawless pipeline clearance: ${actuals.completedTasks} / ${goals.targetTasks} tasks done with ${actuals.highPriorityDone} high priority strikes.`;
    taskVerdict = "Your execution velocity is lethal. Deliverables are clearing on schedule with zero backlog debt.";
  } else if (tasksComposite >= 80) {
    taskStatus = "combat_ready";
    taskStatusLabel = "STRONG MOMENTUM";
    taskBadge = "⚔️";
    taskDiagnosis = `High delivery rate: ${actuals.completedTasks} / ${goals.targetTasks} closed (${Math.round(taskPct)}%), ${actuals.highPriorityDone} critical items cleared.`;
    taskVerdict = "Reliable operational tempo. Keep aggressive focus on closing high-leverage deliverables before low-priority busywork.";
  } else if (tasksComposite >= 60) {
    taskStatus = "acceptable";
    taskStatusLabel = "ROUTINE FLOW";
    taskBadge = "📋";
    taskDiagnosis = `${actuals.completedTasks} / ${goals.targetTasks} tasks done. Essential functions executed, but secondary goals stalled.`;
    taskVerdict = "Average output. Avoid letting tasks linger in open loops for multiple days. Execute immediate check-offs.";
  } else if (tasksComposite >= 40) {
    taskStatus = "underperforming";
    taskStatusLabel = "LAGGING DELIVERY";
    taskBadge = "⚠️";
    taskDiagnosis = `Under-delivery: ${actuals.completedTasks} / ${goals.targetTasks} tasks completed. High-priority deliverables deferred.`;
    taskVerdict = "You are kicking the can down the road. High-priority items cannot wait for another week. Knock them out first.";
  }

  // 3. Strategic Objective Reliability (targetKeyObjectives)
  const objPct = goals.targetKeyObjectives > 0 ? (actuals.keyObjectivesDone / goals.targetKeyObjectives) * 100 : 0;
  let objStatus: CategoryStatus = "critical";
  let objStatusLabel = "MISSION FAILURE";
  let objBadge = "💥";
  let objDiagnosis = `Delivered only ${actuals.keyObjectivesDone} / ${goals.targetKeyObjectives} primary milestones. Commitment broken.`;
  let objVerdict = "The primary mission objectives were repeatedly missed. Daily focus without primary deliverable output is just busywork.";

  if (objPct >= 100) {
    objStatus = "apex";
    objStatusLabel = "STRATEGIC MASTERY";
    objBadge = "🎯";
    objDiagnosis = `Perfect milestone strike rate: ${actuals.keyObjectivesDone} / ${goals.targetKeyObjectives} key objectives accomplished.`;
    objVerdict = "100% strategic accountability. Every single primary objective was executed to completion.";
  } else if (objPct >= 80) {
    objStatus = "combat_ready";
    objStatusLabel = "MISSION RELIABLE";
    objBadge = "🎖️";
    objDiagnosis = `Strong delivery: ${actuals.keyObjectivesDone} / ${goals.targetKeyObjectives} daily primary objectives logged.`;
    objVerdict = "Great strategic discipline. Your daily North Star was respected on almost every operational day.";
  } else if (objPct >= 60) {
    objStatus = "acceptable";
    objStatusLabel = "PARTIAL DELIVERY";
    objBadge = "⏳";
    objDiagnosis = `${actuals.keyObjectivesDone} / ${goals.targetKeyObjectives} objectives logged. Key days had undefined or unverified targets.`;
    objVerdict = "Inconsistent strategic alignment. Ensure every morning begins with an inviolable single deliverable definition.";
  } else if (objPct >= 40) {
    objStatus = "underperforming";
    objStatusLabel = "PROMISES DROPPED";
    objBadge = "⚠️";
    objDiagnosis = `Only ${actuals.keyObjectivesDone} / ${goals.targetKeyObjectives} milestones met. Over half of critical days produced no key deliverable.`;
    objVerdict = "You are showing up without producing the day's core result. Redefine smaller, unmissable key objectives.";
  }

  // 4. Character (Identity) Deployment Balance
  const activeIdentitiesCount = characterStats.filter((c) => c.daysActive > 0).length;
  const totalIdentitiesCount = characterStats.length;
  const balanceRatio = totalIdentitiesCount > 0 ? activeIdentitiesCount / totalIdentitiesCount : 0;

  let charStatus: CategoryStatus = "underperforming";
  let charStatusLabel = "UNBALANCED DEPLOYMENT";
  let charBadge = "🎭";
  let charDiagnosis = `${activeIdentitiesCount} of ${totalIdentitiesCount} characters deployed. ${neglectedIdentities.length} identity roles were starved of attention.`;
  let charVerdict = `Neglected: ${neglectedIdentities.map((i) => i.name).join(", ") || "None"}. You became hyper-fixated on one character while other pillars stalled.`;

  if (activeIdentitiesCount >= Math.min(5, totalIdentitiesCount) && neglectedIdentities.length === 0) {
    charStatus = "apex";
    charStatusLabel = "HOLISTIC SYNERGY";
    charBadge = "🌐";
    charDiagnosis = `All ${totalIdentitiesCount} operational identities deployed across the week with zero starved roles.`;
    charVerdict = "Flawless multi-identity orchestration. Software, Content, and Relocation engines are advancing in lockstep.";
  } else if (activeIdentitiesCount >= 4) {
    charStatus = "combat_ready";
    charStatusLabel = "BALANCED CAMPAIGN";
    charBadge = "⚔️";
    charDiagnosis = `${activeIdentitiesCount} characters actively mobilized. High breadth across core mission frontiers.`;
    charVerdict = "Strong multi-role execution. Minor neglect in auxiliary identities, but core engines are moving smoothly.";
  } else if (activeIdentitiesCount >= 2) {
    charStatus = "acceptable";
    charStatusLabel = "SPECIALIZED FOCUS";
    charBadge = "⚡";
    charDiagnosis = `${activeIdentitiesCount} characters active. Good deep dive in primary role, but leaves ${neglectedIdentities.length} identities stagnant.`;
    charVerdict = "Heavy concentration on 1–2 identities. Make sure the neglected areas don't accumulate critical technical or relocation debt.";
  } else if (activeIdentitiesCount <= 1) {
    charStatus = "critical";
    charStatusLabel = "MONOLITHIC TUNNEL";
    charBadge = "🚨";
    charDiagnosis = `Only 1 single character operated all week. Complete starvation of remaining ${totalIdentitiesCount - 1} mission roles.`;
    charVerdict = "Tunnel vision failure. You locked into a single identity and ignored your full operational mandate. Diversify immediately.";
  }

  const colorStyles: Record<CategoryStatus, { border: string; bg: string; text: string; badgeBg: string }> = {
    apex: {
      border: "border-emerald-500/60",
      bg: "bg-emerald-950/20",
      text: "text-emerald-400",
      badgeBg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/40",
    },
    combat_ready: {
      border: "border-blue-500/60",
      bg: "bg-blue-950/20",
      text: "text-blue-400",
      badgeBg: "bg-blue-500/10 text-blue-300 border-blue-500/40",
    },
    acceptable: {
      border: "border-amber-500/60",
      bg: "bg-amber-950/20",
      text: "text-amber-400",
      badgeBg: "bg-amber-500/10 text-amber-300 border-amber-500/40",
    },
    underperforming: {
      border: "border-orange-500/60",
      bg: "bg-orange-950/20",
      text: "text-orange-400",
      badgeBg: "bg-orange-500/10 text-orange-300 border-orange-500/40",
    },
    critical: {
      border: "border-rose-500/70",
      bg: "bg-rose-950/30",
      text: "text-rose-400",
      badgeBg: "bg-rose-500/20 text-rose-300 border-rose-500/50 font-bold animate-pulse",
    },
  };

  const targetDeepSessions = goals.targetDeepSessions ?? 15;
  const targetDaysLogged = goals.targetDaysLogged ?? 6;
  const targetAvgDailyScore = goals.targetAvgDailyScore ?? 75;
  const targetOutputNotes = goals.targetOutputNotes ?? 5;

  return [
    {
      category: "focus",
      title: "Deep Work Volume",
      score: Math.min(100, Math.round(focusPct)),
      status: focusStatus,
      statusLabel: focusStatusLabel,
      badgeEmoji: focusBadge,
      colorClasses: colorStyles[focusStatus],
      metricsSummary: `${actuals.focusedHours}h / ${goals.targetFocusHours}h target`,
      diagnosis: focusDiagnosis,
      verdict: focusVerdict,
      expandedMetrics: [
        {
          label: "Total Focus Hours",
          actual: `${actuals.focusedHours}h`,
          target: `${goals.targetFocusHours}h`,
          met: actuals.focusedHours >= goals.targetFocusHours,
        },
        {
          label: "Deep Work Sessions",
          actual: actuals.deepSessionsCount,
          target: targetDeepSessions,
          met: actuals.deepSessionsCount >= targetDeepSessions,
        },
        {
          label: "Avg Daily Focus Rate",
          actual: `${actuals.daysLogged > 0 ? (actuals.focusedHours / actuals.daysLogged).toFixed(1) : 0}h/day`,
          target: `${(goals.targetFocusHours / 7).toFixed(1)}h/day`,
          met: (actuals.daysLogged > 0 ? actuals.focusedHours / actuals.daysLogged : 0) >= goals.targetFocusHours / 7,
        },
      ],
    },
    {
      category: "tasks",
      title: "Task Execution Velocity",
      score: Math.min(100, Math.round(tasksComposite)),
      status: taskStatus,
      statusLabel: taskStatusLabel,
      badgeEmoji: taskBadge,
      colorClasses: colorStyles[taskStatus],
      metricsSummary: `${actuals.completedTasks}/${goals.targetTasks} tasks (${actuals.highPriorityDone}/${goals.targetHighPriority} high)`,
      diagnosis: taskDiagnosis,
      verdict: taskVerdict,
      expandedMetrics: [
        {
          label: "Tasks Completed",
          actual: actuals.completedTasks,
          target: goals.targetTasks,
          met: actuals.completedTasks >= goals.targetTasks,
        },
        {
          label: "High Priority Deliverables",
          actual: actuals.highPriorityDone,
          target: goals.targetHighPriority,
          met: actuals.highPriorityDone >= goals.targetHighPriority,
        },
        {
          label: "Completion Ratio",
          actual: `${actuals.totalTasks > 0 ? Math.round((actuals.completedTasks / actuals.totalTasks) * 100) : 0}%`,
          target: "75%",
          met: actuals.totalTasks > 0 && (actuals.completedTasks / actuals.totalTasks) >= 0.75,
        },
      ],
    },
    {
      category: "objectives",
      title: "Key Milestone Strike Rate",
      score: Math.min(100, Math.round(objPct)),
      status: objStatus,
      statusLabel: objStatusLabel,
      badgeEmoji: objBadge,
      colorClasses: colorStyles[objStatus],
      metricsSummary: `${actuals.keyObjectivesDone} / ${goals.targetKeyObjectives} days delivered`,
      diagnosis: objDiagnosis,
      verdict: objVerdict,
      expandedMetrics: [
        {
          label: "Primary Milestones",
          actual: actuals.keyObjectivesDone,
          target: goals.targetKeyObjectives,
          met: actuals.keyObjectivesDone >= goals.targetKeyObjectives,
        },
        {
          label: "Output Notes Logged",
          actual: actuals.daysWithOutputNote,
          target: targetOutputNotes,
          met: actuals.daysWithOutputNote >= targetOutputNotes,
        },
        {
          label: "Average Daily Score",
          actual: `${actuals.avgDailyScore}%`,
          target: `${targetAvgDailyScore}%`,
          met: actuals.avgDailyScore >= targetAvgDailyScore,
        },
      ],
    },
    {
      category: "characters",
      title: "Identity Deployment Balance",
      score: Math.min(100, Math.round(balanceRatio * 100)),
      status: charStatus,
      statusLabel: charStatusLabel,
      badgeEmoji: charBadge,
      colorClasses: colorStyles[charStatus],
      metricsSummary: `${activeIdentitiesCount}/${totalIdentitiesCount} characters (${neglectedIdentities.length} neglected)`,
      diagnosis: charDiagnosis,
      verdict: charVerdict,
      expandedMetrics: [
        {
          label: "Active Identities",
          actual: activeIdentitiesCount,
          target: Math.min(4, totalIdentitiesCount),
          met: activeIdentitiesCount >= Math.min(4, totalIdentitiesCount),
        },
        {
          label: "Days Logged",
          actual: `${actuals.daysLogged} / 7`,
          target: `${targetDaysLogged} days`,
          met: actuals.daysLogged >= targetDaysLogged,
        },
        {
          label: "Consistency Rate",
          actual: `${actuals.consistencyPct}%`,
          target: `${Math.round((targetDaysLogged / 7) * 100)}%`,
          met: actuals.consistencyPct >= (targetDaysLogged / 7) * 100,
        },
      ],
    },
  ];
}

/**
 * Generates an unfiltered, brutally honest review diagnosis based on performance.
 */
export function generateHonestReview(
  goals: WeeklyQuantitativeGoals,
  actuals: WeeklyActuals,
  categories: WeeklyCategoryEvaluation[]
): WeeklyReviewDiagnosis {
  const avgCategoryScore = Math.round(
    categories.reduce((sum, c) => sum + c.score, 0) / Math.max(1, categories.length)
  );

  const targetDeepSessions = goals.targetDeepSessions ?? 15;
  const targetDaysLogged = goals.targetDaysLogged ?? 6;
  const targetAvgDailyScore = goals.targetAvgDailyScore ?? 75;
  const targetOutputNotes = goals.targetOutputNotes ?? 5;

  const quotaChecks = [
    actuals.completedTasks >= goals.targetTasks,
    actuals.focusedHours >= goals.targetFocusHours,
    actuals.keyObjectivesDone >= goals.targetKeyObjectives,
    actuals.highPriorityDone >= goals.targetHighPriority,
    actuals.deepSessionsCount >= targetDeepSessions,
    actuals.daysLogged >= targetDaysLogged,
    actuals.avgDailyScore >= targetAvgDailyScore,
    actuals.daysWithOutputNote >= targetOutputNotes,
  ];
  const quotasCrushedCount = quotaChecks.filter(Boolean).length;
  const totalQuotas = 8;
  const allTargetsMet = quotasCrushedCount === totalQuotas;

  let letterGrade: "S" | "A+" | "A" | "B" | "C" | "D" = "D";
  let status: CategoryStatus = "critical";
  let statusTitle = "CRITICAL OPERATIONAL SLACK";
  let headline = "Zero excuses: You failed to meet standard this week.";
  let brutalAssessment =
    "Your weekly execution was plagued by procrastination and dropped commitments. You logged a fraction of the deep focus hours you pledged and let high-priority deliverables rot in the queue. Dreams of European relocation and software mastery do not materialize through wishful thinking. You sucked this week. Face reality, discard excuses, and rebuild your work discipline starting now.";
  let keyWeakness = "Total breakdown in sustained deep work volume and task completion.";
  let actionProtocol = "Enforce a mandatory phone-in-drawer protocol, lock in two 4-hour morning sprints daily, and clear all backlog debt.";
  let projectedXPBonus = 0;

  if (quotasCrushedCount >= 8 && avgCategoryScore >= 92) {
    letterGrade = "S";
    status = "apex";
    statusTitle = "SUPREME TITAN EXECUTION";
    headline = "God-tier operational dominance. All 8 quantitative quotas crushed.";
    brutalAssessment =
      "Unflinching discipline. You did not just meet your commitments—you dismantled them. Focus volume was relentless, key milestones were met every single day, and your multi-character fleet advanced on all fronts. This is the caliber of execution that turns ambitious relocation and software empires into cold, hard reality.";
    keyWeakness = "None. Fatigue management is your only vulnerability. Do not burnout.";
    actionProtocol = "Replicate this exact routine next week. Take 1 evening of full passive rest to recharge neural energy.";
    projectedXPBonus = 2500;
  } else if (quotasCrushedCount >= 6 || avgCategoryScore >= 85) {
    letterGrade = "A+";
    status = "apex";
    statusTitle = "APEX OPERATOR";
    headline = `Elite performance. ${quotasCrushedCount}/8 quotas crushed with high tactical velocity.`;
    brutalAssessment =
      "High-grade operational tempo. You showed up with serious intent, locked into high-leverage focus sessions, and cleared the vast majority of critical bottlenecks. Minor task drag exists, but overall execution was formidable. You are operating in the top 5% percentile.";
    keyWeakness = "Minor task carryover in secondary pipeline items.";
    actionProtocol = "Tighten end-of-day debriefs and close lingering small tasks within the same day.";
    projectedXPBonus = 2000;
  } else if (quotasCrushedCount >= 5 || avgCategoryScore >= 75) {
    letterGrade = "A";
    status = "combat_ready";
    statusTitle = "COMBAT READY EXECUTION";
    headline = `Strong baseline output (${quotasCrushedCount}/8 quotas), but noticeable operational leakage.`;
    brutalAssessment =
      "A respectable week of execution. You delivered substantial deep work hours and hit the core benchmarks. However, you let friction creep into key objectives, and certain character roles were neglected. Acceptable is the enemy of greatness—stop settling for 'good enough' when you have the capacity for dominance.";
    keyWeakness = "Character deployment imbalance and missed secondary deliverables.";
    actionProtocol = "Rotate attention into neglected identity roles and eliminate mid-day attention residue.";
    projectedXPBonus = 1200;
  } else if (quotasCrushedCount >= 3 || avgCategoryScore >= 60) {
    letterGrade = "B";
    status = "acceptable";
    statusTitle = "COASTING IN THE MEDIOCRE ZONE";
    headline = `You did enough to avoid disaster (${quotasCrushedCount}/8 quotas), but you are coasting.`;
    brutalAssessment =
      "You survived the week, but you did not conquer it. You logged just enough hours to feel busy, but your key milestone completion was spotty and high-priority deliverables were delayed. Being busy is not the same as being effective. You are bleeding valuable days while your target deadlines approach.";
    keyWeakness = "Allowing low-priority busywork to substitute for intense high-priority deep work.";
    actionProtocol = "Ruthlessly kill non-essential tasks. The first 4 hours of every day must belong exclusively to your #1 priority.";
    projectedXPBonus = 600;
  } else if (quotasCrushedCount >= 2 || avgCategoryScore >= 45) {
    letterGrade = "C";
    status = "underperforming";
    statusTitle = "SLACKING & DRIFTING DANGER";
    headline = `Major commitments dropped. Only ${quotasCrushedCount}/8 quotas secured.`;
    brutalAssessment =
      "Be honest with yourself: this was a weak week. You missed over a third of your target focus hours, skipped vital milestone deliverables, and let identity responsibilities languish. If this becomes a habit, your entire trajectory is compromised. Stop negotiating with weakness.";
    keyWeakness = "Lack of focus endurance and vulnerability to micro-distractions.";
    actionProtocol = "Slash target scope in half and guarantee 100% completion of the remaining core. Consistency beats broken ambition.";
    projectedXPBonus = 250;
  }

  return {
    overallScore: avgCategoryScore,
    letterGrade,
    status,
    statusTitle,
    headline,
    brutalAssessment,
    keyWeakness,
    actionProtocol,
    allTargetsMet,
    projectedXPBonus,
    quotasCrushedCount,
    totalQuotas,
  };
}

/**
 * Primary reactive hook for weekly quantitative targets and live performance analytics.
 */
export function useWeeklyAnalytics(customWeekKey?: string) {
  const weekKey = useMemo(() => customWeekKey || getCurrentISOWeekKey(), [customWeekKey]);
  const weekRange = useMemo(() => getWeekDateRange(new Date()), []);
  const { data: history = [] } = useDaysHistory();
  const { data: identities = [] } = useIdentities();
  const { weeklyTodos } = useWeeklyTodos(weekKey);

  const [goals, setGoals] = useState<WeeklyQuantitativeGoals>(() => getLocalWeeklyGoals(weekKey));

  // Sync goals on local changes or external events
  useEffect(() => {
    setGoals(getLocalWeeklyGoals(weekKey));
    const handler = (e: Event) => {
      const customEvt = e as CustomEvent;
      if (!customEvt.detail || customEvt.detail.weekKey === weekKey) {
        setGoals(getLocalWeeklyGoals(weekKey));
      }
    };
    window.addEventListener("mission_weekly_goals_updated", handler);
    return () => window.removeEventListener("mission_weekly_goals_updated", handler);
  }, [weekKey]);

  // Days belonging to this ISO week
  const daysInWeek = useMemo(() => getDaysForISOWeek(history, weekKey), [history, weekKey]);

  // Actual metrics
  const actuals = useMemo(
    () => calculateWeeklyActuals(weeklyTodos, daysInWeek),
    [weeklyTodos, daysInWeek]
  );

  // Character deployment breakdown
  const { characterStats, neglectedIdentities, mostActiveCharacter } = useMemo(
    () => calculateCharacterWeeklyStats(daysInWeek, identities, weeklyTodos),
    [daysInWeek, identities, weeklyTodos]
  );

  // Category-by-category evaluations
  const categoryEvaluations = useMemo(
    () => evaluateWeeklyCategories(goals, actuals, characterStats, neglectedIdentities),
    [goals, actuals, characterStats, neglectedIdentities]
  );

  // Brutally honest diagnosis
  const diagnosis = useMemo(
    () => generateHonestReview(goals, actuals, categoryEvaluations),
    [goals, actuals, categoryEvaluations]
  );

  // Update goals callback
  const updateGoals = useCallback(
    (updates: Partial<WeeklyQuantitativeGoals>) => {
      const updated: WeeklyQuantitativeGoals = { ...goals, ...updates };
      saveLocalWeeklyGoals(weekKey, updated);
      setGoals(updated);
    },
    [weekKey, goals]
  );

  return {
    weekKey,
    weekRange,
    goals,
    actuals,
    characterStats,
    neglectedIdentities,
    mostActiveCharacter,
    categoryEvaluations,
    diagnosis,
    updateGoals,
    daysInWeek,
  };
}

/**
 * Hook to retrieve full historical week summaries for the calendar/timeline component.
 * Aggregates all logged days grouped by ISO week key, computes actuals, diagnoses, and letter grades.
 */
export function useWeeklyHistory(): {
  historicalWeeks: WeeklyHistorySummary[];
  totalWeeksLogged: number;
  avgGradeScore: number;
  totalXPBonusEarned: number;
} {
  const { data: history = [] } = useDaysHistory();
  const { data: identities = [] } = useIdentities();

  return useMemo(() => {
    if (history.length === 0) {
      return {
        historicalWeeks: [],
        totalWeeksLogged: 0,
        avgGradeScore: 0,
        totalXPBonusEarned: 0,
      };
    }

    // Group history items by ISO week key
    const weekGroups = new Map<string, DayHistoryItem[]>();
    history.forEach((d) => {
      const wKey = getCurrentISOWeekKey(d.day_date);
      const existing = weekGroups.get(wKey) || [];
      existing.push(d);
      weekGroups.set(wKey, existing);
    });

    const summaries: WeeklyHistorySummary[] = [];
    let totalScoreSum = 0;
    let totalXPSum = 0;

    // Convert map to sorted list (descending by weekKey)
    const sortedKeys = Array.from(weekGroups.keys()).sort((a, b) => b.localeCompare(a));

    sortedKeys.forEach((wKey) => {
      const days = weekGroups.get(wKey) || [];
      const goals = getLocalWeeklyGoals(wKey);
      
      // Calculate actuals for this historical week
      // (Since weeklyTodos in localStorage are per weekKey, try to read if browser available)
      let storedTodos: WeeklyTodoItem[] = [];
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem(`mission_weekly_todos_${wKey}`);
          if (raw) storedTodos = JSON.parse(raw);
        } catch {
          // ignore
        }
      }

      const actuals = calculateWeeklyActuals(storedTodos, days);
      const { characterStats, neglectedIdentities, mostActiveCharacter } = calculateCharacterWeeklyStats(
        days,
        identities,
        storedTodos
      );
      const categoryEvaluations = evaluateWeeklyCategories(goals, actuals, characterStats, neglectedIdentities);
      const diagnosis = generateHonestReview(goals, actuals, categoryEvaluations);

      // Date range labels from first day of week
      const firstDayDate = days.length > 0 ? new Date(`${days[0]!.day_date}T00:00:00`) : new Date();
      const range = getWeekDateRange(firstDayDate);

      const summary: WeeklyHistorySummary = {
        weekKey: wKey,
        label: range.label,
        mondayDate: range.mondayDate.toISOString().slice(0, 10),
        sundayDate: range.sundayDate.toISOString().slice(0, 10),
        letterGrade: diagnosis.letterGrade,
        overallScore: diagnosis.overallScore,
        status: diagnosis.status,
        statusTitle: diagnosis.statusTitle,
        completedTasks: actuals.completedTasks,
        totalTasks: actuals.totalTasks,
        focusedHours: actuals.focusedHours,
        daysLogged: actuals.daysLogged,
        keyObjectivesDone: actuals.keyObjectivesDone,
        avgDailyScore: actuals.avgDailyScore,
        quotasCrushed: diagnosis.quotasCrushedCount,
        totalQuotas: diagnosis.totalQuotas,
        xpBonusEarned: diagnosis.projectedXPBonus,
        dominantIdentity: mostActiveCharacter ? { name: mostActiveCharacter.name, emoji: mostActiveCharacter.emoji } : null,
        headline: diagnosis.headline,
        deepSessionsCount: actuals.deepSessionsCount,
        daysWithOutputNote: actuals.daysWithOutputNote,
        highPriorityDone: actuals.highPriorityDone,
        consistencyPct: actuals.consistencyPct,
      };

      summaries.push(summary);
      totalScoreSum += diagnosis.overallScore;
      totalXPSum += diagnosis.projectedXPBonus;
    });

    return {
      historicalWeeks: summaries,
      totalWeeksLogged: summaries.length,
      avgGradeScore: summaries.length > 0 ? Math.round(totalScoreSum / summaries.length) : 0,
      totalXPBonusEarned: totalXPSum,
    };
  }, [history, identities]);
}
