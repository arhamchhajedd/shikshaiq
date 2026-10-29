import React from "react";
import { CheckCircle2, TrendingUp, AlertCircle, CircleDashed } from "lucide-react";
import { MasteryStatus } from "@/types/curriculum";
import { cn } from "@/lib/utils";

interface MasteryBadgeProps {
  status: MasteryStatus;
  size?: "sm" | "md";
  className?: string;
}

export const MasteryBadge: React.FC<MasteryBadgeProps> = ({
  status,
  size = "md",
  className,
}) => {
  const configs: Record<
    MasteryStatus,
    { label: string; icon: React.ElementType; containerClass: string; iconClass: string }
  > = {
    mastered: {
      label: "Mastered",
      icon: CheckCircle2,
      containerClass: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
      iconClass: "text-emerald-700",
    },
    partial: {
      label: "Partial",
      icon: TrendingUp,
      containerClass: "bg-amber-50 text-amber-900 border-amber-200/80",
      iconClass: "text-amber-700",
    },
    needs_revision: {
      label: "Needs revision",
      icon: AlertCircle,
      containerClass: "bg-rose-50 text-rose-800 border-rose-200/80",
      iconClass: "text-rose-700",
    },
    not_started: {
      label: "Not started",
      icon: CircleDashed,
      containerClass: "bg-zinc-100 text-zinc-600 border-zinc-200",
      iconClass: "text-zinc-400",
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  const sizeClasses =
    size === "sm"
      ? "text-[11px] px-2.5 py-0.5 gap-1.5"
      : "text-xs px-3 py-1 gap-1.5";

  const iconSizes = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border shadow-2xs select-none",
        sizeClasses,
        config.containerClass,
        className
      )}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      <Icon className={cn(iconSizes, config.iconClass, "shrink-0")} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
};
