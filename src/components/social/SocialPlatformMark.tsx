import { Facebook, Instagram, Linkedin, Music2 } from "lucide-react";
import { SOCIAL_PLATFORMS, type SocialPlatform } from "@/lib/socialAnalytics";

const platformIcons = {
  tiktok: Music2,
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
};

export function SocialPlatformMark({ platform, size = "md" }: { platform: SocialPlatform; size?: "sm" | "md" | "lg" }) {
  const Icon = platformIcons[platform];
  const info = SOCIAL_PLATFORMS.find((item) => item.id === platform)!;
  const dimensions = size === "sm" ? "h-7 w-7 rounded-lg" : size === "lg" ? "h-14 w-14 rounded-2xl" : "h-10 w-10 rounded-xl";
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-7 w-7" : "h-5 w-5";

  return (
    <span aria-label={info.label} className={`inline-flex shrink-0 items-center justify-center ${dimensions}`} style={{ color: info.color, backgroundColor: info.soft }}>
      <Icon aria-hidden="true" className={iconSize} strokeWidth={2.2} />
    </span>
  );
}
