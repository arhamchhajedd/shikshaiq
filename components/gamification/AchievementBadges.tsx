"use client";

import React from "react";
import {
  ShieldCheck,
  Flame,
  Star,
  Target,
  Crown,
  BookOpen,
  Lock,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { BadgeDefinition } from "@/lib/gamification/badgeEngine";

interface AchievementBadgesProps {
  badges: BadgeDefinition[];
  totalStars: number;
  maxStars: number;
}

export function AchievementBadges({
  badges,
  totalStars,
  maxStars,
}: AchievementBadgesProps) {
  const getBadgeIcon = (type: BadgeDefinition["iconType"], isUnlocked: boolean) => {
    const className = `w-5 h-5 ${
      isUnlocked ? "text-neutral-900" : "text-neutral-400"
    }`;

    switch (type) {
      case "root_gap":
        return <ShieldCheck className={`w-5 h-5 ${isUnlocked ? "text-emerald-700" : "text-neutral-400"}`} />;
      case "streak":
        return <Flame className={`w-5 h-5 ${isUnlocked ? "text-amber-600 fill-amber-500/20" : "text-neutral-400"}`} />;
      case "star":
        return <Star className={`w-5 h-5 ${isUnlocked ? "text-amber-500 fill-amber-400/20" : "text-neutral-400"}`} />;
      case "diagnostic":
        return <Target className={className} />;
      case "master":
        return <Crown className={`w-5 h-5 ${isUnlocked ? "text-amber-600" : "text-neutral-400"}`} />;
      case "lesson":
        return <BookOpen className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-100 border border-black/5 text-[10px] font-semibold text-neutral-800 uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3 text-neutral-700" />
            Milestones & Gamification
          </div>
          <h3 className="text-base font-bold text-neutral-900 tracking-tight">
            Learning Badges & Curriculum Stars
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-black/10 text-xs font-mono font-medium text-neutral-800 shadow-2xs">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>
              {totalStars} / {maxStars} Stars
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 text-white text-xs font-mono font-medium shadow-2xs">
            <span>
              {unlockedCount} / {badges.length} Unlocked
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {badges.map((badge) => {
          const isRootGap = badge.id === "root-gap-healer";

          return (
            <Card
              key={badge.id}
              className={`p-4.5 rounded-2xl border transition-all ${
                badge.isUnlocked
                  ? isRootGap
                    ? "bg-emerald-50/40 border-emerald-200/80 shadow-xs"
                    : "bg-white border-black/10 shadow-xs"
                  : "bg-neutral-50/60 border-black/5 opacity-80"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    badge.isUnlocked
                      ? isRootGap
                        ? "bg-emerald-100/80 border-emerald-300"
                        : "bg-neutral-100 border-black/10"
                      : "bg-neutral-100 border-black/5"
                  }`}
                >
                  {badge.isUnlocked ? (
                    getBadgeIcon(badge.iconType, true)
                  ) : (
                    <Lock className="w-4 h-4 text-neutral-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-xs font-bold truncate ${
                        badge.isUnlocked
                          ? isRootGap
                            ? "text-emerald-950 font-semibold"
                            : "text-neutral-900"
                          : "text-neutral-600"
                      }`}
                    >
                      {badge.title}
                    </span>

                    {badge.isUnlocked ? (
                      <span
                        className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                          isRootGap
                            ? "bg-emerald-600 text-white"
                            : "bg-neutral-900 text-white"
                        }`}
                      >
                        Earned
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-neutral-400 shrink-0">
                        {badge.progressPercent}%
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-neutral-500 mt-1 leading-snug line-clamp-2">
                    {badge.description}
                  </p>

                  {/* Progress bar if locked */}
                  {!badge.isUnlocked && (
                    <div className="w-full bg-neutral-200/70 h-1 rounded-full mt-2.5 overflow-hidden">
                      <div
                        className="bg-neutral-900 h-full rounded-full transition-all"
                        style={{ width: `${badge.progressPercent}%` }}
                      />
                    </div>
                  )}

                  {/* Unlocked status subtitle */}
                  {badge.isUnlocked && badge.unlockedAtLabel && (
                    <div
                      className={`text-[10px] font-medium mt-2 flex items-center gap-1 ${
                        isRootGap ? "text-emerald-800" : "text-neutral-600"
                      }`}
                    >
                      <span>✓ {badge.unlockedAtLabel}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
