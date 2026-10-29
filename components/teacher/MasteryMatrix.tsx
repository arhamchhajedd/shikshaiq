"use client";

import React from "react";
import { ConceptMasteryDistribution } from "@/types/teacherAnalytics";
import { Card } from "@/components/ui/Card";
import { CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";

interface MasteryMatrixProps {
  distributions: ConceptMasteryDistribution[];
  totalEnrolled: number;
}

export function MasteryMatrix({ distributions, totalEnrolled }: MasteryMatrixProps) {
  return (
    <Card className="p-6 border border-black/10 rounded-3xl bg-white shadow-xs mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-black/5">
        <div>
          <span className="text-[10px] font-semibold tracking-wider uppercase text-neutral-400 block mb-0.5">
            Class 7 Fractions Curriculum
          </span>
          <h3 className="text-base font-bold text-neutral-900 tracking-tight">
            Concept Mastery Matrix
          </h3>
        </div>

        {/* LEGEND */}
        <div className="flex items-center gap-3 text-[11px] text-neutral-600">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Mastered
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Partial
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Needs Revision
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-neutral-200" /> Not Started
          </span>
        </div>
      </div>

      <div className="pt-4 divide-y divide-black/5">
        {distributions.map((d) => {
          const total = totalEnrolled > 0 ? totalEnrolled : 1;
          const masteredPct = (d.masteredCount / total) * 100;
          const partialPct = (d.partialCount / total) * 100;
          const needsRevPct = (d.needsRevisionCount / total) * 100;
          const notStartedPct = (d.notStartedCount / total) * 100;

          return (
            <div key={d.conceptId} className="py-4 first:pt-2 last:pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-neutral-100 border border-black/5 text-[10px] font-mono font-bold text-neutral-700 flex items-center justify-center">
                    {d.order}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900">{d.conceptTitle}</h4>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {d.totalStudentsAssessed} of {totalEnrolled} students assessed ({d.masteryPercentage}% mastery rate)
                    </span>
                  </div>
                </div>

                {/* Micro Badges */}
                <div className="flex items-center gap-2 self-start sm:self-auto text-[11px] font-medium">
                  {d.masteredCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {d.masteredCount} Mastered
                    </span>
                  )}
                  {d.partialCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      {d.partialCount} Partial
                    </span>
                  )}
                  {d.needsRevisionCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200/60">
                      <XCircle className="w-3 h-3 text-rose-600" />
                      {d.needsRevisionCount} Needs Rev.
                    </span>
                  )}
                  {d.notStartedCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 border border-black/5">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      {d.notStartedCount} Not Started
                    </span>
                  )}
                </div>
              </div>

              {/* STACKED HORIZONTAL PROGRESS BAR */}
              <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden flex">
                <div
                  style={{ width: `${masteredPct}%` }}
                  className="h-full bg-emerald-500 transition-all duration-300"
                  title={`${d.masteredCount} Mastered`}
                />
                <div
                  style={{ width: `${partialPct}%` }}
                  className="h-full bg-amber-500 transition-all duration-300"
                  title={`${d.partialCount} Partial`}
                />
                <div
                  style={{ width: `${needsRevPct}%` }}
                  className="h-full bg-rose-500 transition-all duration-300"
                  title={`${d.needsRevisionCount} Needs Revision`}
                />
                <div
                  style={{ width: `${notStartedPct}%` }}
                  className="h-full bg-neutral-200 transition-all duration-300"
                  title={`${d.notStartedCount} Not Started`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
