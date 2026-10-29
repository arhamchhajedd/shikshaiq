import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "dark" | "surface" | "glass" | "bordered";
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "surface", interactive = false, children, ...props }, ref) => {
    const variantStyles = {
      surface: "bg-white border border-black/[0.06] text-zinc-900 shadow-[0_2px_12px_rgba(0,0,0,0.03)]",
      dark: "bg-white border border-black/[0.07] text-zinc-900 shadow-[0_4px_20px_rgba(0,0,0,0.04)]",
      glass:
        "bg-white/80 backdrop-blur-xl border border-black/[0.06] text-zinc-900 shadow-sm",
      bordered: "bg-transparent border border-zinc-200 text-zinc-900",
    };

    const interactiveStyles = interactive
      ? "transition-all duration-200 hover:border-black/[0.12] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] cursor-pointer hover:-translate-y-0.5"
      : "";

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl sm:rounded-3xl p-6 sm:p-7 relative overflow-hidden",
          variantStyles[variant],
          interactiveStyles,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
