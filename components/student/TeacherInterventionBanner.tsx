"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, MessageSquareQuote } from "lucide-react";
import { TeacherIntervention } from "@/types/interventions";
import { Button } from "@/components/ui/Button";

interface TeacherInterventionBannerProps {
  intervention: TeacherIntervention;
}

export function TeacherInterventionBanner({ intervention }: TeacherInterventionBannerProps) {
  const targetUrl =
    intervention.recommendedAction === "learn"
      ? `/student/learn/${intervention.targetConceptId}`
      : intervention.recommendedAction === "practice"
      ? `/student/practice/${intervention.targetConceptId}`
      : `/student/assessment`;

  const actionLabel =
    intervention.recommendedAction === "learn"
      ? "Start Assigned Lesson"
      : intervention.recommendedAction === "practice"
      ? "Start Assigned Practice"
      : "Start Assessment";

  return (
    <div className="p-5 sm:p-6 rounded-3xl border border-black/10 bg-neutral-50/80 shadow-xs mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black text-white text-[10px] font-semibold tracking-wide uppercase mb-2">
            <Sparkles className="w-3 h-3" />
            Teacher Assigned Activity
          </div>
          <h3 className="text-base font-bold text-neutral-900 tracking-tight">
            Target Focus: {intervention.conceptTitle || intervention.targetConceptId}
          </h3>
          <p className="text-xs text-neutral-600 mt-0.5">
            Assigned by <span className="font-semibold text-neutral-900">{intervention.teacherName || "Your Teacher"}</span>
          </p>

          {intervention.teacherNotes && (
            <div className="mt-3 p-3 rounded-2xl bg-white border border-black/5 text-xs text-neutral-700 flex items-start gap-2 max-w-xl">
              <MessageSquareQuote className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
              <p className="italic leading-relaxed">&ldquo;{intervention.teacherNotes}&rdquo;</p>
            </div>
          )}
        </div>

        <Link href={targetUrl} className="self-start md:self-auto shrink-0">
          <Button className="rounded-2xl bg-black text-white hover:bg-neutral-800 text-xs px-5 py-2.5 font-semibold flex items-center gap-1.5 shadow-xs">
            <span>{actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
