"use client";

import React from "react";
import { Star } from "lucide-react";

interface StarRatingDisplayProps {
  stars: 0 | 1 | 2 | 3;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function StarRatingDisplay({
  stars,
  size = "md",
  showLabel = false,
}: StarRatingDisplayProps) {
  const iconSize =
    size === "sm" ? "w-3 h-3" : size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";

  return (
    <div className="inline-flex items-center gap-1.5" title={`${stars} of 3 stars`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3].map((num) => {
          const isFilled = num <= stars;
          return (
            <Star
              key={num}
              className={`${iconSize} transition-colors ${
                isFilled
                  ? "text-amber-400 fill-amber-400"
                  : "text-neutral-200 fill-neutral-100"
              }`}
            />
          );
        })}
      </div>

      {showLabel && (
        <span className="text-[11px] font-mono font-medium text-neutral-500">
          {stars}/3 Stars
        </span>
      )}
    </div>
  );
}
