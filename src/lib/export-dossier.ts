export interface DebriefData {
  dateISO: string;
  identityName: string;
  identityEmoji: string;
  score: number;
  focusedSeconds: number;
  targetHours: number;
  tasksDone: number;
  tasksTotal: number;
  keyObjectiveDone: boolean;
  outputNote?: string | undefined;
  topSessions: { label: string; duration: string }[];
  firstStrikeRecommendation: string;
}

export function generateDossierMarkdown(data: DebriefData): string {
  const hours = (data.focusedSeconds / 3600).toFixed(1);
  const targetPct = Math.min(100, Math.round((data.focusedSeconds / (data.targetHours * 3600)) * 100));

  return `═══════════════════════════════════════════════════════
🎖️ MISSION POLAND — DAILY OPERATIONAL DOSSIER
Date: ${data.dateISO} | Identity: ${data.identityEmoji} ${data.identityName}
═══════════════════════════════════════════════════════

📊 PERFORMANCE TELEMETRY:
• Operational Score: ${data.score}/100
• Deep Focus Volume: ${hours}h / ${data.targetHours}h (${targetPct}% compliance)
• Action Items Closed: ${data.tasksDone} / ${data.tasksTotal} (${data.tasksTotal > 0 ? Math.round((data.tasksDone / data.tasksTotal) * 100) : 0}%)
• Primary Objective: ${data.keyObjectiveDone ? "✅ EXECUTED" : "❌ INCOMPLETE"}

📦 TANGIBLE DELIVERABLES:
${data.outputNote ? `"${data.outputNote}"` : "No tangible output logged."}

⏱️ TOP FOCUS MISSIONS:
${data.topSessions.length > 0 ? data.topSessions.map((s, i) => `  ${i + 1}. ${s.label} (${s.duration})`).join("\n") : "  No dedicated sessions logged."}

⚔️ TOMORROW'S RECOMMENDED FIRST STRIKE:
"${data.firstStrikeRecommendation}"

═══════════════════════════════════════════════════════
Destination: Poznań | March 2027
Build the life. Earn the money. Make the move.
═══════════════════════════════════════════════════════`;
}

export function copyDossierToClipboard(data: DebriefData): Promise<boolean> {
  const text = generateDossierMarkdown(data);
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  }
  return Promise.resolve(false);
}
