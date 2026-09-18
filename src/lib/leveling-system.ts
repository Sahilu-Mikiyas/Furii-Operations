// Operator Leveling & XP Progression Engine
// Calculates XP from daily scores, 16h focus targets, and operational milestones.

import type { DayHistoryItem } from "@/lib/mission-data";
import { getCurrentISOWeekKey, type WeeklyTodoItem } from "@/lib/weekly-todos-data";
import { getLocalWeeklyGoals } from "@/lib/weekly-goals-data";

export interface RankTier {
  minLevel: number;
  rank: string;
  badge: string;
  title: string;
  minXP: number;
}

export const RANK_TIERS: RankTier[] = [
  { minLevel: 1, rank: "Cadet", badge: "🔰", title: "Operational Recruit", minXP: 0 },
  { minLevel: 6, rank: "Operative", badge: "⚔️", title: "Frontline Executant", minXP: 2500 },
  { minLevel: 16, rank: "Commander", badge: "🎖️", title: "Mission Strategist", minXP: 15000 },
  { minLevel: 31, rank: "Strategist", badge: "🧠", title: "Campaign Architect", minXP: 50000 },
  { minLevel: 51, rank: "Titan", badge: "👑", title: "Master of Execution", minXP: 125000 },
];

export function xpForDay(item: DayHistoryItem): number {
  const score = item.score;
  let xp = 0;

  // Base score XP
  if (score >= 90) {
    xp += 750; // Perfect / Near-perfect day
  } else if (score >= 80) {
    xp += 500; // Elite execution
  } else if (score >= 60) {
    xp += 300; // Solid day
  } else if (score >= 40) {
    xp += 150; // Routine maintenance
  } else {
    xp += 50; // Presence recorded
  }

  // 16h Focus Milestone Bonus
  if (item.focusedSeconds >= 57600) {
    xp += 200;
  }

  // Primary Objective Completion Bonus
  if (item.key_objective_done) {
    xp += 100;
  }

  return xp;
}

export interface OperatorLevelProfile {
  totalXP: number;
  level: number;
  rank: string;
  badge: string;
  title: string;
  currentLevelXP: number;
  nextLevelXP: number;
  progressPercent: number;
  progress: number;
  daysLogged: number;
  eliteDaysCount: number;
  focusTargetMetCount: number;
  weeklyGoalsCrushedCount?: number | undefined;
  weeklyBonusXPEarned?: number | undefined;
  bestDays: { date: string; score: number; xp: number }[];
  timeline: { rank: string; badge: string; fromDate: string; toDate: string }[];
}

export type LifetimeXP = OperatorLevelProfile;

export function calculateLifetimeXP(history: DayHistoryItem[]): OperatorLevelProfile {
  let totalXP = 0;
  let eliteDaysCount = 0;
  let focusTargetMetCount = 0;

  const perDay: { date: string; score: number; xp: number }[] = [];
  const timeline: { rank: string; badge: string; fromDate: string; toDate: string }[] = [];
  let lastRank = "";

  const sortedHistory = [...history].sort((a, b) => a.day_date.localeCompare(b.day_date));

  for (const item of sortedHistory) {
    const gained = xpForDay(item);
    totalXP += gained;
    if (item.score >= 80) eliteDaysCount++;
    if (item.focusedSeconds >= 57600) focusTargetMetCount++;
    perDay.push({ date: item.day_date, score: item.score, xp: gained });

    const currentLvl = Math.max(1, Math.floor(totalXP / 500) + 1);
    let itemTier = RANK_TIERS[0]!;
    for (const tier of RANK_TIERS) {
      if (currentLvl >= tier.minLevel) itemTier = tier;
    }

    if (itemTier.rank !== lastRank) {
      timeline.push({ rank: itemTier.rank, badge: itemTier.badge, fromDate: item.day_date, toDate: item.day_date });
      lastRank = itemTier.rank;
    } else if (timeline.length) {
      timeline[timeline.length - 1]!.toDate = item.day_date;
    }
  }

  // Group history by ISO week to award weekly quota fulfillment bonuses based on actual configured goals
  const weeksMap = new Map<string, {
    totalHours: number;
    daysCount: number;
    keyObjectives: number;
    totalScore: number;
    deepSessions: number;
    daysWithOutput: number;
  }>();

  for (const item of sortedHistory) {
    const wKey = getCurrentISOWeekKey(item.day_date);
    const curr = weeksMap.get(wKey) || {
      totalHours: 0,
      daysCount: 0,
      keyObjectives: 0,
      totalScore: 0,
      deepSessions: 0,
      daysWithOutput: 0,
    };
    curr.totalHours += (item.focusedSeconds || 0) / 3600;
    curr.daysCount += 1;
    if (item.key_objective_done) curr.keyObjectives += 1;
    curr.totalScore += item.score || 0;
    curr.deepSessions += item.sessions?.length || 0;
    if (item.output_note && item.output_note.trim().length > 0) curr.daysWithOutput += 1;
    weeksMap.set(wKey, curr);
  }

  let weeklyGoalsCrushedCount = 0;
  let weeklyBonusXPEarned = 0;

  weeksMap.forEach((w, wKey) => {
    const goals = getLocalWeeklyGoals(wKey);
    const avgScore = w.daysCount > 0 ? Math.round(w.totalScore / w.daysCount) : 0;

    let tasksCompleted = 0;
    let highPriorityCompleted = 0;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(`mission_weekly_todos_${wKey}`);
        if (raw) {
          const parsed: WeeklyTodoItem[] = JSON.parse(raw);
          tasksCompleted = parsed.filter((t) => t.done).length;
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

    let bonus = 0;
    if (quotasMet >= 8) {
      bonus = 2500;
      weeklyGoalsCrushedCount++;
    } else if (quotasMet >= 7) {
      bonus = 2000;
      weeklyGoalsCrushedCount++;
    } else if (quotasMet >= 6) {
      bonus = 1500;
      weeklyGoalsCrushedCount++;
    } else if (quotasMet >= 5) {
      bonus = 1200;
    } else if (quotasMet >= 4) {
      bonus = 800;
    } else if (quotasMet >= 3) {
      bonus = 400;
    }

    weeklyBonusXPEarned += bonus;
    totalXP += bonus;
  });

  // Level curve: 500 XP per level
  const level = Math.max(1, Math.floor(totalXP / 500) + 1);
  const currentLevelXP = totalXP % 500;
  const nextLevelXP = 500;
  const progressPercent = Math.min(100, Math.round((currentLevelXP / nextLevelXP) * 100));

  // Determine Rank Tier
  let activeTier: RankTier = RANK_TIERS[0]!;
  for (const tier of RANK_TIERS) {
    if (level >= tier.minLevel) {
      activeTier = tier;
    }
  }

  return {
    totalXP,
    level,
    rank: activeTier.rank,
    badge: activeTier.badge,
    title: activeTier.title,
    currentLevelXP,
    nextLevelXP,
    progressPercent,
    progress: progressPercent,
    daysLogged: history.length,
    eliteDaysCount,
    focusTargetMetCount,
    weeklyGoalsCrushedCount,
    weeklyBonusXPEarned,
    bestDays: [...perDay].sort((a, b) => b.score - a.score || b.xp - a.xp).slice(0, 5),
    timeline,
  };
}

export function getBestDays(history: DayHistoryItem[], limit: number = 5): Array<DayHistoryItem & { xpEarned: number }> {
  return [...history]
    .map((h) => ({ ...h, xpEarned: xpForDay(h) }))
    .sort((a, b) => b.xpEarned - a.xpEarned)
    .slice(0, limit);
}

export function checkLevelUp(prevXP: number, newXP: number) {
  const prevLevel = Math.max(1, Math.floor(prevXP / 500) + 1);
  const newLevel = Math.max(1, Math.floor(newXP / 500) + 1);
  let tier = RANK_TIERS[0]!;
  for (const t of RANK_TIERS) {
    if (newLevel >= t.minLevel) tier = t;
  }
  return {
    leveled: newLevel > prevLevel,
    newLevel,
    newRank: tier.rank,
    badge: tier.badge,
  };
}

// ═══════════════════════════════════════════════════════════════════
// CAMPAIGN EPOCH & REQUIREMENT-GATED LEVELING LADDER
// ═══════════════════════════════════════════════════════════════════

export type CampaignEpoch = "pre_poland" | "post_poland";

export interface CampaignLevelTier {
  id: string;
  epoch: CampaignEpoch;
  tierNumber: string; // "1.1", "1.2", "1.3", "2.1", "2.2", "2.3"
  name: string;
  badge: string;
  description: string;
  targetAllocatedUSD: number;
  requiredEnvelopes?: { key: string; targetUSD: number; label: string }[];
  requiredChecklistKeys: string[];
}

export const CAMPAIGN_LEVELS: CampaignLevelTier[] = [
  {
    id: "lvl-1-1",
    epoch: "pre_poland",
    tierNumber: "1.1",
    name: "Campaign Foundation",
    badge: "🔰",
    description: "Establish baseline war chest, ring-fence flight/visa capital, and lock down 16h focus discipline.",
    targetAllocatedUSD: 5000,
    requiredEnvelopes: [
      { key: "flight_visa", targetUSD: 1500, label: "Flight & Visa Fund" },
      { key: "tech_mobile_core", targetUSD: 1500, label: "Mobile Core Tech Fund" },
    ],
    requiredChecklistKeys: ["passport_valid"],
  },
  {
    id: "lvl-1-2",
    epoch: "pre_poland",
    tierNumber: "1.2",
    name: "Studio & Logistics Lock",
    badge: "⚔️",
    description: "100% Pre-fund the Poznań Studio procurement envelope ($2,500) and sworn document translations.",
    targetAllocatedUSD: 10000,
    requiredEnvelopes: [
      { key: "poznan_studio_hardware", targetUSD: 2500, label: "Poznań Studio Hardware Fund" },
      { key: "flight_visa", targetUSD: 1500, label: "Flight & Visa Fund" },
    ],
    requiredChecklistKeys: ["passport_valid", "sworn_translations"],
  },
  {
    id: "lvl-1-3",
    epoch: "pre_poland",
    tierNumber: "1.3",
    name: "Citadel War Chest (Pre-Flight)",
    badge: "🚀",
    description: "Complete $15,500 total capital allocation across all 5 envelopes, visa stamped in passport, departure greenlight.",
    targetAllocatedUSD: 15500,
    requiredEnvelopes: [
      { key: "flight_visa", targetUSD: 1500, label: "Flight & Visa Fund" },
      { key: "living_deposit", targetUSD: 7500, label: "6-Mo Living & Deposit Fund" },
      { key: "tech_mobile_core", targetUSD: 3000, label: "Tech & Mobile Core" },
      { key: "poznan_studio_hardware", targetUSD: 2500, label: "Poznań Studio Hardware" },
      { key: "emergency_buffer", targetUSD: 1000, label: "Emergency Buffer" },
    ],
    requiredChecklistKeys: ["passport_valid", "sworn_translations", "visa_d_type", "flight_ticket"],
  },
  {
    id: "lvl-2-1",
    epoch: "post_poland",
    tierNumber: "2.1",
    name: "Poznań Citadel Landfall",
    badge: "🇵🇱",
    description: "Landfall in Poznań, 12-month apartment lease signed, PESEL & Meldunek issued, Polish bank account active.",
    targetAllocatedUSD: 15500,
    requiredChecklistKeys: [
      "apartment_lease_signed",
      "meldunek_pesel_issued",
      "polish_bank_active",
      "fiber_internet_installed",
    ],
  },
  {
    id: "lvl-2-2",
    epoch: "post_poland",
    tierNumber: "2.2",
    name: "Broadcast Fortress",
    badge: "🎙️",
    description: "Pre-funded studio hardware delivered from Allegro, acoustic treatment mounted, first video published from Poland.",
    targetAllocatedUSD: 18000,
    requiredChecklistKeys: [
      "apartment_lease_signed",
      "allegro_gear_ordered",
      "studio_assembled",
      "first_video_published",
    ],
  },
  {
    id: "lvl-2-3",
    epoch: "post_poland",
    tierNumber: "2.3",
    name: "European Sovereignty",
    badge: "👑",
    description: "Polish JDG / EU B2B entity active, European client contracts in EUR/USD, Karta Pobytu filed, total net worth $25,000+.",
    targetAllocatedUSD: 25000,
    requiredChecklistKeys: [
      "apartment_lease_signed",
      "trc_karta_pobytu_filed",
      "eu_b2b_entity_active",
      "first_video_published",
    ],
  },
];

export interface CampaignLevelProfile {
  currentLevel: CampaignLevelTier;
  nextLevel: CampaignLevelTier | null;
  epoch: CampaignEpoch;
  totalAllocatedUSD: number;
  levelProgressPercent: number;
  unlockedTiersCount: number;
  pendingRequirements: { label: string; isMet: boolean }[];
}

export function calculateCampaignLevel(
  envelopes: Record<string, number>,
  checklist: Record<string, boolean>
): CampaignLevelProfile {
  const totalAllocated = Object.values(envelopes).reduce((sum, v) => sum + (v || 0), 0);

  let currentTierIndex = 0;

  for (let i = 0; i < CAMPAIGN_LEVELS.length; i++) {
    const tier = CAMPAIGN_LEVELS[i]!;
    let canPass = true;

    // Check financial threshold
    if (totalAllocated < tier.targetAllocatedUSD) {
      canPass = false;
    }

    // Check envelope specific thresholds
    if (tier.requiredEnvelopes) {
      for (const reqEnv of tier.requiredEnvelopes) {
        if ((envelopes[reqEnv.key] || 0) < reqEnv.targetUSD) {
          canPass = false;
          break;
        }
      }
    }

    // Check required checklist items
    for (const chkKey of tier.requiredChecklistKeys) {
      if (!checklist[chkKey]) {
        canPass = false;
        break;
      }
    }

    if (canPass) {
      currentTierIndex = i;
    } else {
      break;
    }
  }

  const currentLevel = CAMPAIGN_LEVELS[currentTierIndex] || CAMPAIGN_LEVELS[0]!;
  const nextLevel = CAMPAIGN_LEVELS[currentTierIndex + 1] || null;

  // Calculate pending requirements for next level
  const pendingRequirements: { label: string; isMet: boolean }[] = [];

  if (nextLevel) {
    // Capital requirement
    pendingRequirements.push({
      label: `$${nextLevel.targetAllocatedUSD.toLocaleString()} USD Total Capital Allocated ($${totalAllocated.toLocaleString()} / $${nextLevel.targetAllocatedUSD.toLocaleString()})`,
      isMet: totalAllocated >= nextLevel.targetAllocatedUSD,
    });

    // Envelopes requirement
    if (nextLevel.requiredEnvelopes) {
      for (const reqEnv of nextLevel.requiredEnvelopes) {
        const cur = envelopes[reqEnv.key] || 0;
        pendingRequirements.push({
          label: `${reqEnv.label}: $${reqEnv.targetUSD.toLocaleString()} Allocated ($${cur.toLocaleString()} / $${reqEnv.targetUSD.toLocaleString()})`,
          isMet: cur >= reqEnv.targetUSD,
        });
      }
    }

    // Checklist requirements
    const CHECKLIST_LABELS: Record<string, string> = {
      passport_valid: "Passport Valid for 2+ Years",
      sworn_translations: "Sworn Polish Translations Completed (Tłumacz Przysięgły)",
      visa_d_type: "D-Type National Polish Visa Stamped in Passport",
      flight_ticket: "Flight Ticket Addis → Poznań Confirmed",
      apartment_lease_signed: "12-Month Poznań Apartment Lease Signed (Umowa Najmu)",
      meldunek_pesel_issued: "PESEL Number & Address Registration (Meldunek) Issued",
      polish_bank_active: "Polish Bank Account (PLN & EUR IBAN) Active",
      fiber_internet_installed: "Gigabit Fiber Internet Active",
      allegro_gear_ordered: "Pre-Funded Studio Gear Ordered on Allegro/Amazon.pl",
      studio_assembled: "Studio Assembled & Acoustic Isolation Complete",
      first_video_published: "First YouTube Video Recorded & Published from Poland",
      trc_karta_pobytu_filed: "Temporary Residence Card (Karta Pobytu) Filed",
      eu_b2b_entity_active: "Polish JDG / EU B2B Entity Registered & Active",
    };

    for (const key of nextLevel.requiredChecklistKeys) {
      pendingRequirements.push({
        label: CHECKLIST_LABELS[key] || key,
        isMet: Boolean(checklist[key]),
      });
    }
  }

  const metCount = pendingRequirements.filter((r) => r.isMet).length;
  const levelProgressPercent =
    pendingRequirements.length > 0 ? Math.round((metCount / pendingRequirements.length) * 100) : 100;

  return {
    currentLevel,
    nextLevel,
    epoch: currentLevel.epoch,
    totalAllocatedUSD: totalAllocated,
    levelProgressPercent,
    unlockedTiersCount: currentTierIndex + 1,
    pendingRequirements,
  };
}

