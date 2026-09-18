import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";
import type { Currency, TaskStatus, ProjectStatus, ServiceStatus, ApprovalStatus, ClientHealthStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined, currency: Currency = "ETB"): string {
  if (amount == null) return "—";
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  return currency === "ETB" ? `${formatted} ETB` : `$${formatted}`;
}

export function formatDate(dateString: string | null | undefined, formatStr: string = "MMM d, yyyy"): string {
  if (!dateString) return "—";
  try {
    const date = typeof dateString === "string" ? parseISO(dateString) : new Date(dateString);
    if (!isValid(date)) return "—";
    return format(date, formatStr);
  } catch {
    return "—";
  }
}

export function formatRelativeDate(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  try {
    const date = typeof dateString === "string" ? parseISO(dateString) : new Date(dateString);
    if (!isValid(date)) return "—";
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return "—";
  }
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return "FU";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getStatusLabel(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getStatusColorClass(
  status: TaskStatus | ProjectStatus | ServiceStatus | ApprovalStatus | ClientHealthStatus | string
): { bg: string; text: string; border: string; dot: string } {
  switch (status) {
    case "completed":
    case "approved":
    case "active":
    case "on_track":
    case "paid":
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        dot: "bg-emerald-500",
      };
    case "in_progress":
    case "sent":
    case "partially_paid":
      return {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        dot: "bg-blue-500",
      };
    case "waiting_for_client":
    case "awaiting_review":
    case "attention_required":
    case "waiting":
      return {
        bg: "bg-amber-50",
        text: "text-amber-800",
        border: "border-amber-200",
        dot: "bg-amber-500",
      };
    case "changes_requested":
    case "overdue":
    case "delayed":
    case "urgent":
      return {
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-200",
        dot: "bg-rose-500",
      };
    case "draft":
    case "backlog":
    case "planned":
    case "not_started":
    case "inactive":
    default:
      return {
        bg: "bg-neutral-100",
        text: "text-neutral-600",
        border: "border-neutral-200",
        dot: "bg-neutral-400",
      };
  }
}
