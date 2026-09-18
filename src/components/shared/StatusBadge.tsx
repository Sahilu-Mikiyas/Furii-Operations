import React from "react";
import { cn, getStatusColorClass, getStatusLabel } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({ status, className, showDot = true }: StatusBadgeProps) {
  const { bg, text, border, dot } = getStatusColorClass(status);
  const label = getStatusLabel(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide",
        bg,
        text,
        border,
        className
      )}
    >
      {showDot && <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dot)} />}
      <span>{label}</span>
    </span>
  );
}
