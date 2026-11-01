"use client";

import React from "react";
import { Flame, Check, Zap } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StreakSummary } from "@/lib/gamification/streakEngine";

interface StreakCardProps {
  streak: StreakSummary;
}

export function StreakCard({ streak }: StreakCardProps) {
  const displayStreak = Math.max(streak.currentStreak, 0);

  return (
    <Card className="p-5 sm:p-6 border border-black/10 rounded-3xl bg-white shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Streak Main Stats */}
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shrink-0 shadow-xs relative">
            <Flame className="w-7 h-7 text-amber-400 fill-amber-400" />
            {streak.practicedToday && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white" />
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-neutral-900 font-mono">
                {displayStreak} {displayStreak === 1 ? "Day" : "Days"}
              </span>
              <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-neutral-100 border border-black/5 text-neutral-800">
                Learning Streak
              </span>
            </div>

            <p className="text-xs text-neutral-500 mt-0.5">
              {streak.practicedToday
                ? "You practiced today! Keep up the daily NCERT momentum."
                : streak.practicedYesterday
                ? "Complete 1 practice question or quiz today to keep your streak alive!"
                : "Start a new practice session today to build your streak."}
            </p>
          </div>
        </div>

        {/* Weekly Progress Tracker (Mon-Sun) */}
        <div className="flex items-center gap-1.5 sm:gap-2 self-start md:self-auto bg-neutral-50/80 p-2 sm:p-2.5 rounded-2xl border border-black/5">
          {streak.weeklyActivity.map((day) => (
            <div
              key={day.dateString}
              className={`flex flex-col items-center justify-center w-8 sm:w-9 py-1 rounded-xl transition-all ${
                day.isToday
                  ? "bg-white border border-black/10 shadow-2xs"
                  : ""
              }`}
            >
              <span className="text-[10px] font-mono font-medium text-neutral-400 uppercase">
                {day.dayName.charAt(0)}
              </span>

              <div
                className={`w-5 h-5 rounded-full mt-1 flex items-center justify-center transition-all ${
                  day.active
                    ? "bg-neutral-900 text-white"
                    : day.isToday
                    ? "border border-dashed border-neutral-400 text-neutral-400"
                    : "bg-neutral-200/70 text-transparent"
                }`}
              >
                {day.active ? (
                  <Check className="w-3 h-3 stroke-[3]" />
                ) : day.isToday ? (
                  <Zap className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                )}
              </div>
            </div>
          ))}

          <div className="border-l border-black/10 pl-2 ml-1 text-right hidden sm:block">
            <span className="text-[10px] text-neutral-400 block font-mono">Longest</span>
            <span className="text-xs font-bold text-neutral-800 font-mono">
              {Math.max(streak.longestStreak, displayStreak)}d
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
