import type { DayHistoryItem } from "@/lib/mission-data";
import type { DealRow } from "@/lib/software-data";
import type { YouTubeVideoRow } from "@/lib/youtube-data";
import type { ContributionRow } from "@/lib/funds-data";
import { getCurrentISOWeekKey, type WeeklyTodoItem } from "@/lib/weekly-todos-data";
import { getLocalWeeklyGoals } from "@/lib/weekly-goals-data";

export type AchievementTier = "bronze" | "silver" | "gold" | "legendary";
export type AchievementCategory = "focus" | "revenue" | "youtube" | "poland" | "consistency";

export interface Achievement {
  id: string;
  title: string;
  emoji: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  xpReward: number;
  unlockedAt?: string | undefined;
  progress: number;
  target: number;
}

export const TIER_CONFIG: Record<
  AchievementTier,
  { label: string; border: string; bg: string; text: string; glow: string }
> = {
  bronze: {
    label: "BRONZE",
    border: "border-amber-700/60",
    bg: "bg-amber-950/20",
    text: "text-amber-500",
    glow: "shadow-amber-900/20",
  },
  silver: {
    label: "SILVER",
    border: "border-slate-400/60",
    bg: "bg-slate-900/30",
    text: "text-slate-300",
    glow: "shadow-slate-500/20",
  },
  gold: {
    label: "GOLD",
    border: "border-yellow-500/70",
    bg: "bg-yellow-950/30",
    text: "text-yellow-400",
    glow: "shadow-yellow-500/30",
  },
  legendary: {
    label: "LEGENDARY",
    border: "border-rose-500/80",
    bg: "bg-rose-950/40",
    text: "text-rose-400",
    glow: "shadow-rose-500/40",
  },
};

export const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, "progress" | "unlockedAt">[] = [
  // Focus Discipline
  {
    id: "iron_will_streak",
    title: "The Iron Will",
    emoji: "🛡️",
    description: "Complete 3 consecutive 16-hour deep focus days (≥57,600s/day).",
    category: "focus",
    tier: "legendary",
    xpReward: 2500,
    target: 3,
  },
  {
    id: "marathon_focus",
    title: "Marathon Runner",
    emoji: "⚡",
    description: "Log an unbroken single focus session of 4 hours or longer.",
    category: "focus",
    tier: "gold",
    xpReward: 1000,
    target: 1,
  },
  {
    id: "century_focus_days",
    title: "Century Club",
    emoji: "🏛️",
    description: "Log 100 total operational days in Mission Command.",
    category: "focus",
    tier: "legendary",
    xpReward: 3000,
    target: 100,
  },
  {
    id: "ten_focus_days",
    title: "Vanguard Initiate",
    emoji: "🔰",
    description: "Log your first 10 operational mission days.",
    category: "focus",
    tier: "bronze",
    xpReward: 300,
    target: 10,
  },
  {
    id: "hundred_hours_focus",
    title: "Centurion of Work",
    emoji: "⏱️",
    description: "Accumulate 100 lifetime deep focus hours.",
    category: "focus",
    tier: "silver",
    xpReward: 750,
    target: 100,
  },

  // Deals & Revenue
  {
    id: "first_deal_closed",
    title: "First Blood",
    emoji: "💸",
    description: "Close your first won software contract in the pipeline.",
    category: "revenue",
    tier: "bronze",
    xpReward: 500,
    target: 1,
  },
  {
    id: "major_dealmaker",
    title: "The Dealmaker",
    emoji: "💼",
    description: "Close a single software deal worth $2,500+ (or 350,000+ ETB).",
    category: "revenue",
    tier: "gold",
    xpReward: 1500,
    target: 1,
  },
  {
    id: "million_birr_club",
    title: "Million Birr Club",
    emoji: "💰",
    description: "Accumulate 1,000,000+ ETB in closed software contracts.",
    category: "revenue",
    tier: "legendary",
    xpReward: 3500,
    target: 1000000,
  },
  {
    id: "pipeline_master",
    title: "Pipeline Commander",
    emoji: "📊",
    description: "Maintain 5 or more active prospects/proposals in the deals pipeline.",
    category: "revenue",
    tier: "silver",
    xpReward: 600,
    target: 5,
  },

  // YouTube Empire
  {
    id: "directors_cut",
    title: "Director's Cut",
    emoji: "🎬",
    description: "Publish 5 completed video projects across your channel portfolio.",
    category: "youtube",
    tier: "silver",
    xpReward: 800,
    target: 5,
  },
  {
    id: "content_machine",
    title: "Content Machine",
    emoji: "🎥",
    description: "Publish 20 completed video projects.",
    category: "youtube",
    tier: "gold",
    xpReward: 2000,
    target: 20,
  },
  {
    id: "four_channel_fleet",
    title: "Four Channel Fleet",
    emoji: "🚀",
    description: "Have at least 1 video project created for every channel archetype.",
    category: "youtube",
    tier: "silver",
    xpReward: 700,
    target: 4,
  },
  {
    id: "scriptmaster",
    title: "Scriptmaster",
    emoji: "📜",
    description: "Write and advance 3 video scripts into the production stage.",
    category: "youtube",
    tier: "bronze",
    xpReward: 400,
    target: 3,
  },

  // Poland Mission
  {
    id: "first_deposit",
    title: "Relocation Spark",
    emoji: "🇵🇱",
    description: "Log your first deposit into the Poland Relocation Fund.",
    category: "poland",
    tier: "bronze",
    xpReward: 300,
    target: 1,
  },
  {
    id: "halfway_poland",
    title: "Crossing the Vistula",
    emoji: "🧭",
    description: "Reach 50% ($5,000+) of the minimum Poland relocation gate.",
    category: "poland",
    tier: "silver",
    xpReward: 1000,
    target: 5000,
  },
  {
    id: "poznan_vanguard",
    title: "Poznań Vanguard",
    emoji: "👑",
    description: "Reach 100% ($10,000+) of the minimum relocation contingency gate.",
    category: "poland",
    tier: "legendary",
    xpReward: 5000,
    target: 10000,
  },

  // Consistency & Discipline
  {
    id: "week_warrior",
    title: "Week Warrior",
    emoji: "⚔️",
    description: "Maintain a 7-day unbroken operational logging streak.",
    category: "consistency",
    tier: "silver",
    xpReward: 800,
    target: 7,
  },
  {
    id: "monthly_machine",
    title: "Monthly Machine",
    emoji: "🎖️",
    description: "Maintain a 30-day unbroken operational logging streak.",
    category: "consistency",
    tier: "legendary",
    xpReward: 3000,
    target: 30,
  },
  {
    id: "perfect_century_score",
    title: "Flawless Execution",
    emoji: "💯",
    description: "Achieve a perfect 100/100 daily operational performance score.",
    category: "consistency",
    tier: "gold",
    xpReward: 1200,
    target: 1,
  },
  {
    id: "output_machine",
    title: "Tangible Builder",
    emoji: "📦",
    description: "Log tangible output notes on 15 different mission days.",
    category: "consistency",
    tier: "silver",
    xpReward: 750,
    target: 15,
  },
  // Weekly Quantitative Goals & Quotas
  {
    id: "weekly_quota_crusher",
    title: "Quota Crusher",
    emoji: "🎯",
    description: "Hit 100% of all quantitative weekly goals (Focus hours, tasks, key objectives).",
    category: "consistency",
    tier: "gold",
    xpReward: 1500,
    target: 1,
  },
  {
    id: "weekly_efficiency_master",
    title: "Efficiency Vanguard",
    emoji: "⚡",
    description: "Achieve an elite 90%+ weekly efficiency score.",
    category: "consistency",
    tier: "gold",
    xpReward: 1200,
    target: 1,
  },
  {
    id: "iron_week_focus",
    title: "Iron Focus Week",
    emoji: "🛡️",
    description: "Log 45+ hours of deep focus in a single operational week.",
    category: "focus",
    tier: "silver",
    xpReward: 1000,
    target: 45,
  },
  {
    id: "task_centurion_week",
    title: "Task Vanguard",
    emoji: "📋",
    description: "Complete 25+ tasks in a single operational week.",
    category: "focus",
    tier: "silver",
    xpReward: 800,
    target: 25,
  },
  {
    id: "triple_crown_weeks",
    title: "Triple Crown Strategist",
    emoji: "👑",
    description: "Crush all weekly quantitative quotas across 3 different weeks.",
    category: "consistency",
    tier: "legendary",
    xpReward: 3000,
    target: 3,
  },
  {
    id: "perfect_week_consistency",
    title: "Iron Rhythm Week",
    emoji: "🗓️",
    description: "Log active deep execution on all 7 days of an operational week.",
    category: "consistency",
    tier: "gold",
    xpReward: 1000,
    target: 1,
  },
  {
    id: "output_machine_week",
    title: "Output Heavyweight",
    emoji: "📦",
    description: "Log tangible end-of-day output deliverables on 6+ days in a single week.",
    category: "consistency",
    tier: "silver",
    xpReward: 800,
    target: 1,
  },
  {
    id: "score_discipline_week",
    title: "Discipline Vanguard",
    emoji: "🎖️",
    description: "Maintain an average daily composite score of 85%+ across an entire operational week.",
    category: "consistency",
    tier: "gold",
    xpReward: 1200,
    target: 1,
  },
];

export interface AchievementEvaluationInput {
  history: DayHistoryItem[];
  deals: DealRow[];
  videos: YouTubeVideoRow[];
  contributions: ContributionRow[];
  fundBalanceUSD: number;
}

export function evaluateAchievements(input: AchievementEvaluationInput): Achievement[] {
  const { history = [], deals = [], videos = [], contributions = [], fundBalanceUSD = 0 } = input;

  // 1. Focus stats
  const totalDays = history.length;
  const totalFocusHours = history.reduce((sum, d) => sum + (d.focusedSeconds || 0), 0) / 3600;

  let maxConsecutive16h = 0;
  let currentConsecutive16h = 0;
  const sortedHistoryAsc = [...history].sort((a, b) => a.day_date.localeCompare(b.day_date));
  for (const d of sortedHistoryAsc) {
    if ((d.focusedSeconds || 0) >= 57600) {
      currentConsecutive16h += 1;
      if (currentConsecutive16h > maxConsecutive16h) maxConsecutive16h = currentConsecutive16h;
    } else {
      currentConsecutive16h = 0;
    }
  }

  const maxStreak = history.length;
  const hasPerfectScore = history.some((d) => (d.score || 0) >= 100);
  const daysWithOutput = history.filter((d) => Boolean(d.output_note && d.output_note.trim().length > 0)).length;

  // 2. Deals stats
  const wonDeals = deals.filter((d) => d.stage === "Won");
  const wonCount = wonDeals.length;
  const totalClosedETB = wonDeals.reduce((sum, d) => sum + Number(d.deal_value || 0), 0);
  const hasMajorDeal = wonDeals.some((d) => Number(d.deal_value || 0) >= 350000);
  const activePipelineDeals = deals.filter((d) => d.stage !== "Lost" && d.stage !== "Won").length;

  // 3. YouTube stats
  const publishedVideos = videos.filter((v) => v.stage === "Published").length;
  const uniqueChannelsWithVideos = new Set(videos.map((v) => v.channel_key)).size;
  const advancedScripts = videos.filter((v) => ["Production", "Editing", "Thumbnail", "Scheduled", "Published"].includes(v.stage)).length;

  // 4. Poland stats
  const totalDeposits = contributions.length;

  // 5. Weekly Quota & Efficiency stats
  const weeklyMap = new Map<
    string,
    {
      totalHours: number;
      daysCount: number;
      keyObjectives: number;
      tasksDone: number;
      totalScore: number;
      deepSessions: number;
      daysWithOutput: number;
    }
  >();

  for (const d of history) {
    const wKey = getCurrentISOWeekKey(d.day_date);
    const curr = weeklyMap.get(wKey) || {
      totalHours: 0,
      daysCount: 0,
      keyObjectives: 0,
      tasksDone: 0,
      totalScore: 0,
      deepSessions: 0,
      daysWithOutput: 0,
    };
    curr.totalHours += (d.focusedSeconds || 0) / 3600;
    curr.daysCount += 1;
    if (d.key_objective_done) curr.keyObjectives += 1;
    curr.tasksDone += d.tasksDone || 0;
    curr.totalScore += d.score || 0;
    curr.deepSessions += d.sessions?.length || 0;
    if (d.output_note && d.output_note.trim().length > 0) curr.daysWithOutput += 1;
    weeklyMap.set(wKey, curr);
  }

  let maxWeeklyHours = 0;
  let maxWeeklyTasks = 0;
  let weeksWithHighEfficiency = 0;
  let weeksQuotasCrushed = 0;
  let perfectConsistencyWeeks = 0;
  let outputHeavyweightWeeks = 0;
  let scoreDisciplineWeeks = 0;

  weeklyMap.forEach((w, wKey) => {
    if (w.totalHours > maxWeeklyHours) maxWeeklyHours = w.totalHours;
    if (w.tasksDone > maxWeeklyTasks) maxWeeklyTasks = w.tasksDone;
    const avgScore = w.daysCount > 0 ? Math.round(w.totalScore / w.daysCount) : 0;
    if (avgScore >= 90) weeksWithHighEfficiency += 1;
    if (w.daysCount >= 7) perfectConsistencyWeeks += 1;
    if (w.daysWithOutput >= 6) outputHeavyweightWeeks += 1;
    if (avgScore >= 85 && w.daysCount >= 5) scoreDisciplineWeeks += 1;

    // Check against configured goals for quota crushing
    const goals = getLocalWeeklyGoals(wKey);
    let tasksCompleted = w.tasksDone;
    let highPriorityCompleted = 0;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(`mission_weekly_todos_${wKey}`);
        if (raw) {
          const parsed: WeeklyTodoItem[] = JSON.parse(raw);
          tasksCompleted = Math.max(tasksCompleted, parsed.filter((t) => t.done).length);
          highPriorityCompleted = parsed.filter((t) => t.done && t.priority === "high").length;
        }
      } catch {
        // fallback
      }
    }

    const targetDeepSessions = goals.targetDeepSessions ?? 15;
    const targetDaysLogged = goals.targetDaysLogged ?? 6;
    const targetAvgDailyScore = goals.targetAvgDailyScore ?? 75;
    const targetOutputNotes = goals.targetOutputNotes ?? 5;

    const quotasMet = [
      tasksCompleted >= goals.targetTasks,
      w.totalHours >= goals.targetFocusHours,
      w.keyObjectives >= goals.targetKeyObjectives,
      highPriorityCompleted >= goals.targetHighPriority,
      w.deepSessions >= targetDeepSessions,
      w.daysCount >= targetDaysLogged,
      avgScore >= targetAvgDailyScore,
      w.daysWithOutput >= targetOutputNotes,
    ].filter(Boolean).length;

    if (quotasMet >= 7) {
      weeksQuotasCrushed += 1;
    }
  });

  return ACHIEVEMENT_DEFINITIONS.map((def): Achievement => {
    let progress = 0;
    let unlockedAt: string | undefined = undefined;

    switch (def.id) {
      case "iron_will_streak":
        progress = maxConsecutive16h;
        if (progress >= def.target) unlockedAt = "Achieved";
        break;
      case "marathon_focus":
        progress = history.some((d) => (d.focusedSeconds || 0) >= 14400) ? 1 : 0;
        if (progress >= def.target) unlockedAt = "Achieved";
        break;
      case "century_focus_days":
        progress = totalDays;
        if (progress >= def.target) unlockedAt = "Achieved";
        break;
      case "ten_focus_days":
        progress = totalDays;
        if (progress >= def.target) unlockedAt = "Achieved";
        break;
      case "hundred_hours_focus":
        progress = Math.floor(totalFocusHours);
        if (progress >= def.target) unlockedAt = "Achieved";
        break;

      case "first_deal_closed":
        progress = wonCount;
        if (progress >= def.target) unlockedAt = "Achieved";
        break;
      case "major_dealmaker":
        progress = hasMajorDeal ? 1 : 0;
        if (progress >= def.target) unlockedAt = "Achieved";
        break;
      case "million_birr_club":
        progress = totalClosedETB;
        if (progress >= def.target) unlockedAt = "Achieved";
        break;
      case "pipeline_master":
        progress = activePipelineDeals;
        if (progress >= def.target) unlockedAt = "Achieved";
        break;

      case "directors_cut":
        progress = publishedVideos;
        if (progress >= def.target) unlockedAt = "Achieved";
        break;
      case "content_machine":
        progress = publishedVideos;
        if (progress >= def.target) unlockedAt = "Achieved";
        break;
      case "four_channel_fleet":
        progress = uniqueChannelsWithVideos;
        if (progress >= def.target) unlockedAt = "Achieved";
        break;
      case "scriptmaster":
        progress = advancedScripts;
        if (progress >= def.target) unlockedAt = "Achieved";
        break;

      case "first_deposit":
        progress = totalDeposits;
        if (progress >= def.target) unlockedAt = "Achieved";
        break;
      case "halfway_poland":
        progress = Math.floor(fundBalanceUSD);
        if (progress >= def.target) unlockedAt = "Achieved";
        break;
      case "poznan_vanguard":
        progress = Math.floor(fundBalanceUSD);
        if (progress >= def.target) unlockedAt = "Achieved";
        break;

      case "week_warrior":
        progress = maxStreak;
        if (progress >= def.target) unlockedAt = "Achieved";
        break;
      case "monthly_machine":
        progress = maxStreak;
        if (progress >= def.target) unlockedAt = "Achieved";
        break;
      case "perfect_century_score":
        progress = hasPerfectScore ? 1 : 0;
        if (progress >= def.target) unlockedAt = "Achieved";
        break;
      case "output_machine":
        progress = daysWithOutput;
        if (progress >= def.target) unlockedAt = "Achieved";
        break;

      // Weekly Quantitative Goals
      case "weekly_quota_crusher":
        progress = weeksQuotasCrushed;
        if (progress >= def.target) unlockedAt = "Achieved";
        break;
      case "weekly_efficiency_master":
        progress = weeksWithHighEfficiency;
        if (progress >= def.target) unlockedAt = "Achieved";
        break;
      case "iron_week_focus":
        progress = Math.floor(maxWeeklyHours);
        if (progress >= def.target) unlockedAt = "Achieved";
        break;
      case "task_centurion_week":
        progress = maxWeeklyTasks;
        if (progress >= def.target) unlockedAt = "Achieved";
        break;
      case "triple_crown_weeks":
        progress = weeksQuotasCrushed;
        if (progress >= def.target) unlockedAt = "Achieved";
        break;
      case "perfect_week_consistency":
        progress = perfectConsistencyWeeks;
        if (progress >= def.target) unlockedAt = "Achieved";
        break;
      case "output_machine_week":
        progress = outputHeavyweightWeeks;
        if (progress >= def.target) unlockedAt = "Achieved";
        break;
      case "score_discipline_week":
        progress = scoreDisciplineWeeks;
        if (progress >= def.target) unlockedAt = "Achieved";
        break;

      default:
        progress = 0;
    }

    return {
      ...def,
      progress: Math.min(progress, def.target),
      unlockedAt,
    };
  });
}

const SEEN_ACHIEVEMENTS_KEY = "mission_seen_achievements";

export function getSeenAchievements(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SEEN_ACHIEVEMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markAchievementsSeen(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const seen = new Set([...getSeenAchievements(), ...ids]);
    localStorage.setItem(SEEN_ACHIEVEMENTS_KEY, JSON.stringify(Array.from(seen)));
  } catch (err) {
    console.warn("Failed to save seen achievements", err);
  }
}
