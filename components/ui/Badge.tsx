import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "saffron"
    | "teal"
    | "coral"
    | "amber"
    | "purple"
    | "outline";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center font-medium rounded-full transition-colors";

  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-[11px] leading-tight",
    md: "px-3 py-1 text-xs leading-normal",
  };

  const variantStyles = {
    default: "bg-zinc-100 text-zinc-700 border border-zinc-200/70",
    saffron: "bg-black text-white shadow-xs",
    teal: "bg-emerald-50 text-emerald-800 border border-emerald-200/80",
    coral: "bg-rose-50 text-rose-800 border border-rose-200/80",
    amber: "bg-amber-50 text-amber-900 border border-amber-200/80",
    purple: "bg-zinc-100 text-zinc-900 border border-zinc-200",
    outline: "border border-zinc-200/90 text-zinc-600 bg-white",
  };

  return (
    <span
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
};
