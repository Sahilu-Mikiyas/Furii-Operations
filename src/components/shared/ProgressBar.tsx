import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0 - 100
  label?: string;
  showValue?: boolean;
  className?: string;
  barClassName?: string;
}

export function ProgressBar({ value, label, showValue = true, className, barClassName }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div className={cn("space-y-1.5 w-full", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs font-medium">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showValue && <span className="text-foreground font-mono font-semibold">{clamped}%</span>}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/80">
        <div
          className={cn("h-full bg-primary transition-all duration-500 rounded-full", barClassName)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
