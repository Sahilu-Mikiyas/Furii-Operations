export type SocialPlatform = "tiktok" | "instagram" | "facebook" | "linkedin";
export type SocialMetric = { key: string; label: string; hint?: string; primary?: boolean };

export const SOCIAL_PLATFORMS: { id: SocialPlatform; label: string; color: string; soft: string }[] = [
  { id: "tiktok", label: "TikTok", color: "#0f8b88", soft: "#e5f4f3" },
  { id: "instagram", label: "Instagram", color: "#b21f67", soft: "#f8e9f0" },
  { id: "facebook", label: "Facebook", color: "#2858c9", soft: "#eaf0ff" },
  { id: "linkedin", label: "LinkedIn", color: "#98510d", soft: "#f8eee2" },
];

export const SOCIAL_METRICS: Record<SocialPlatform, SocialMetric[]> = {
  tiktok: [
    { key: "followers", label: "Followers", primary: true },
    { key: "net_followers", label: "Net followers", hint: "Gained minus lost during the reporting window" },
    { key: "video_views", label: "Video views", hint: "Views during the reporting window" },
    { key: "profile_views", label: "Profile views" },
    { key: "likes", label: "Likes" }, { key: "comments", label: "Comments" }, { key: "shares", label: "Shares" },
  ],
  instagram: [
    { key: "followers", label: "Followers", primary: true }, { key: "net_followers", label: "Net followers" },
    { key: "accounts_reached", label: "Accounts reached" }, { key: "views", label: "Views" },
    { key: "profile_visits", label: "Profile visits" }, { key: "interactions", label: "Interactions" },
    { key: "likes", label: "Likes" }, { key: "saves", label: "Saves" }, { key: "shares", label: "Shares" }, { key: "comments", label: "Comments" },
  ],
  facebook: [
    { key: "page_followers", label: "Page followers", primary: true }, { key: "net_followers", label: "Net followers" },
    { key: "reach", label: "Reach" }, { key: "page_views", label: "Page views" }, { key: "engagement", label: "Engagement" },
    { key: "reactions", label: "Reactions" }, { key: "comments", label: "Comments" }, { key: "shares", label: "Shares" }, { key: "link_clicks", label: "Link clicks" },
  ],
  linkedin: [
    { key: "followers", label: "Followers", primary: true }, { key: "net_followers", label: "Net followers" },
    { key: "impressions", label: "Impressions" }, { key: "reactions", label: "Reactions" },
    { key: "comments", label: "Comments" }, { key: "reposts", label: "Reposts" }, { key: "link_clicks", label: "Link clicks" },
  ],
};

export function formatSocialNumber(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);
}

export function isSocialServiceType(type: string) {
  return type === "social_media" || type === "content_production";
}

export function isActiveSocialService(type: string, status: string) {
  return isSocialServiceType(type) && ["not_started", "in_progress", "waiting_for_client"].includes(status);
}

export function addisDate(value = new Date()) {
  const parts = new Intl.DateTimeFormat("en", { timeZone: "Africa/Addis_Ababa", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(value);
  const part = (key: string) => parts.find((item) => item.type === key)?.value || "00";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function freshnessLabel(capturedAt?: string | null) {
  if (!capturedAt) return { text: "No data yet", tone: "muted" };
  const hours = Math.max(0, (Date.now() - new Date(capturedAt).getTime()) / 3_600_000);
  if (hours < 12) return { text: `Updated ${hours < 1 ? "less than an hour" : `${Math.floor(hours)}h`} ago`, tone: "good" };
  if (hours < 24) return { text: `Updated ${Math.floor(hours)}h ago`, tone: "warn" };
  return { text: `Data is ${Math.floor(hours / 24)}d old`, tone: "stale" };
}
