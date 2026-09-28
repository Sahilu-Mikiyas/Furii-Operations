import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CircularProgressProps {
  value: number; // 0 to 100
  size?: number; // diameter in px (default: 48)
  strokeWidth?: number; // ring stroke width in px (default: 4.5)
  showValue?: boolean;
  label?: string;
  sublabel?: string;
  className?: string;
  variant?: "auto" | "primary" | "emerald" | "amber";
  valueClassName?: string;
}

export function CircularProgress({
  value = 0,
  size = 48,
  strokeWidth = 4.5,
  showValue = true,
  label,
  sublabel,
  className,
  variant = "auto",
  valueClassName,
}: CircularProgressProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(value || 0)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  let strokeColor = "stroke-primary";
  let textColor = "text-primary";

  if (variant === "emerald" || (variant === "auto" && clamped === 100)) {
    strokeColor = "stroke-emerald-500";
    textColor = "text-emerald-600 dark:text-emerald-400";
  } else if (variant === "amber") {
    strokeColor = "stroke-amber-500";
    textColor = "text-amber-600 dark:text-amber-400";
  } else if (variant === "auto" && clamped === 0) {
    strokeColor = "stroke-muted-foreground/30";
    textColor = "text-muted-foreground";
  }

  return (
    <div className={cn("inline-flex items-center gap-2.5 min-w-0 max-w-full", className)}>
      <div
        className="relative shrink-0 flex items-center justify-center select-none"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 overflow-visible"
        >
          {/* Subtle inner background fill for visual depth */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="currentColor"
            className="text-secondary/50 dark:text-secondary/20"
          />

          {/* Background track ring with clean border contrast */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-border dark:text-border/70"
          />

          {/* Active progress ring */}
          {clamped > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={cn(strokeColor, "transition-all duration-700 ease-out")}
            />
          )}
        </svg>

        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {clamped === 100 && variant === "auto" ? (
              <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
            ) : (
              <span
                className={cn(
                  "font-mono font-bold leading-none select-none",
                  size >= 48 ? "text-xs" : size >= 38 ? "text-[10px]" : "text-[9px]",
                  textColor,
                  valueClassName
                )}
              >
                {clamped}%
              </span>
            )}
          </div>
        )}
      </div>

      {(label || sublabel) && (
        <div className="min-w-0 flex-1 flex flex-col justify-center overflow-hidden">
          {label && (
            <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground font-semibold block truncate">
              {label}
            </span>
          )}
          {sublabel && (
            <span
              title={sublabel}
              className="text-xs font-bold text-foreground block truncate"
            >
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
