import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "./Badge";

export interface SectionHeadingProps {
  badge?: string;
  badgeVariant?: "default" | "saffron" | "teal" | "coral" | "amber" | "purple";
  title: string;
  highlight?: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  badge,
  badgeVariant = "default",
  title,
  highlight,
  description,
  align = "center",
  className,
}) => {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className
      )}
    >
      {badge && (
        <div className="mb-4">
          <Badge variant={badgeVariant}>{badge}</Badge>
        </div>
      )}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 leading-[1.15]">
        {title}{" "}
        {highlight && (
          <span className="text-zinc-500 font-normal">
            {highlight}
          </span>
        )}
      </h2>
      {description && (
        <p className="mt-4 text-base sm:text-lg text-zinc-500 leading-relaxed font-normal">
          {description}
        </p>
      )}
    </div>
  );
};
