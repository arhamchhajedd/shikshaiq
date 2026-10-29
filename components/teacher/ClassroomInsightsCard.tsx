"use client";

import React from "react";
import { ClassroomInsight } from "@/types/teacherAnalytics";
import { Card } from "@/components/ui/Card";
import {
  Lightbulb,
  AlertOctagon,
  TrendingUp,
  Sparkles,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

interface ClassroomInsightsCardProps {
  insights: ClassroomInsight[];
}

export function ClassroomInsightsCard({ insights }: ClassroomInsightsCardProps) {
  return (
    <Card className="p-6 border border-black/10 rounded-3xl bg-white shadow-xs mb-8">
      <div className="pb-4 border-b border-black/5 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold tracking-wider uppercase text-neutral-400 block mb-0.5">
            Deterministic Prerequisite Engine
          </span>
          <h3 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Classroom Pedagogical Insights
          </h3>
        </div>
      </div>

      <div className="pt-4 space-y-4">
        {insights.map((insight) => {
          const isBottleneck = insight.type === "prerequisite_bottleneck";
          const isStruggle = insight.type === "concept_struggle_alert";
          const isMastery = insight.type === "concept_mastery_high";
          const isEnrichment = insight.type === "acceleration_ready";

          return (
            <div
              key={insight.id}
              className={`p-4 rounded-2xl border transition-all ${
                isBottleneck
                  ? "bg-rose-50/40 border-rose-200/70"
                  : isStruggle
                  ? "bg-amber-50/40 border-amber-200/70"
                  : isMastery
                  ? "bg-emerald-50/40 border-emerald-200/70"
                  : isEnrichment
                  ? "bg-neutral-50 border-black/10"
                  : "bg-neutral-50/50 border-black/5"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5">
                    {isBottleneck ? (
                      <AlertOctagon className="w-4 h-4 text-rose-600" />
                    ) : isStruggle ? (
                      <AlertOctagon className="w-4 h-4 text-amber-600" />
                    ) : isMastery ? (
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    ) : isEnrichment ? (
                      <Sparkles className="w-4 h-4 text-neutral-900" />
                    ) : (
                      <HelpCircle className="w-4 h-4 text-neutral-400" />
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-neutral-900">{insight.title}</h4>
                    <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                </div>

                {/* Confidence Pill */}
                <div className="self-start shrink-0">
                  <span
                    className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border ${
                      insight.confidence === "high"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : insight.confidence === "moderate"
                        ? "bg-neutral-100 text-neutral-700 border-neutral-200"
                        : insight.confidence === "tentative"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-neutral-100 text-neutral-500 border-neutral-200"
                    }`}
                  >
                    {insight.confidence === "insufficient_evidence"
                      ? "Needs Evidence"
                      : `${insight.confidence} Confidence`}
                  </span>
                </div>
              </div>

              {/* Affected Students Pill Strip */}
              {insight.affectedStudentNames.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-black/5 flex flex-wrap items-center gap-1.5 text-[11px] text-neutral-500">
                  <span className="font-medium text-neutral-700">Affected Learners:</span>
                  {insight.affectedStudentNames.map((name) => (
                    <span
                      key={name}
                      className="px-2 py-0.5 rounded-md bg-white border border-black/10 text-neutral-800 font-medium"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              )}

              {/* Suggested Pedagogical Intervention */}
              <div className="mt-3 p-2.5 rounded-xl bg-white/80 border border-black/5 text-[11px] text-neutral-700 flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-neutral-900 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-neutral-900">Recommended Action: </span>
                  <span>{insight.suggestedAction}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
