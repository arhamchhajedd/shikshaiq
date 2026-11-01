import React from "react";
import { ArrowRight, CheckCircle2, Activity, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { StarRatingDisplay } from "@/components/gamification/StarRatingDisplay";

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-[#fbfbfd]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Tagline / Sub-badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-black/[0.08] text-xs font-medium text-zinc-700 mb-6 shadow-xs">
            <span className="flex h-1.5 w-1.5 rounded-full bg-black" />
            <span>Class 7 Mathematics • Fractions Adaptive Engine</span>
          </div>

          {/* Primary Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-950 leading-[1.1]">
            Every student learns differently.{" "}
            <span className="text-zinc-500 font-normal">
              Now learning does too.
            </span>
          </h1>

          {/* Supporting Copy */}
          <p className="mt-6 text-base sm:text-lg text-zinc-600 leading-relaxed font-normal max-w-2xl mx-auto">
            ShikshaIQ diagnoses concept-level learning gaps and builds an adaptive prerequisite pathway for every student. Powered by deterministic knowledge tracing and a server-side Socratic AI tutor.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button variant="primary" size="lg" href="/student">
              <span>Explore Student Demo</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            <Button variant="secondary" size="lg" href="#how-it-works">
              See How It Works
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500 font-normal">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-zinc-700" />
              Deterministic Mastery Rules
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-zinc-700" />
              Zero Hallucinated Grades
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-zinc-700" />
              Teacher In The Loop
            </span>
          </div>
        </div>

        {/* Apple-style Minimal Product Preview */}
        <div className="mt-14 max-w-4xl mx-auto">
          <Card className="p-0 border-black/[0.08] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)] rounded-3xl overflow-hidden ring-1 ring-black/[0.04]">
            {/* Window Topbar */}
            <div className="px-5 py-3.5 bg-zinc-50/80 border-b border-black/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
                <div className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
                <span className="ml-3 text-xs font-medium text-zinc-500">
                  Live Diagnostic Snapshot • Class 7-B
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 hidden sm:inline">
                  Student: Rohan Sharma
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-900">
                  🔥 3-Day Streak
                </span>
                <Badge variant="default" size="sm">
                  Active Session
                </Badge>
              </div>
            </div>

            {/* Window Content */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Concept Mastery Grid */}
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-black" />
                    Concept Diagnostic Status
                  </h3>
                  <span className="text-xs text-zinc-400">
                    NCERT Chapter 2
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Concept 1 */}
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-black/[0.05] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-zinc-400">C1</span>
                        <Badge variant="teal" size="sm">Mastered</Badge>
                      </div>
                      <h4 className="text-sm font-semibold text-zinc-900 mt-1.5">Fraction Basics</h4>
                      <div className="mt-1">
                        <StarRatingDisplay stars={3} size="sm" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-zinc-500 mb-1">
                        <span>Mastery</span>
                        <span className="font-semibold text-emerald-800">92%</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full w-[92%]" />
                      </div>
                    </div>
                  </div>

                  {/* Concept 2 */}
                  <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-200/60 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-rose-500">C2</span>
                        <Badge variant="coral" size="sm">Root Gap</Badge>
                      </div>
                      <h4 className="text-sm font-semibold text-zinc-900 mt-1.5">Common Multiples</h4>
                      <div className="mt-1">
                        <StarRatingDisplay stars={1} size="sm" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-zinc-500 mb-1">
                        <span>Mastery</span>
                        <span className="font-semibold text-rose-700">45%</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full w-[45%]" />
                      </div>
                    </div>
                  </div>

                  {/* Concept 3 */}
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-black/[0.05] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-zinc-400">C3</span>
                        <Badge variant="amber" size="sm">Developing</Badge>
                      </div>
                      <h4 className="text-sm font-semibold text-zinc-900 mt-1.5">Equivalent Fractions</h4>
                      <div className="mt-1">
                        <StarRatingDisplay stars={2} size="sm" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-zinc-500 mb-1">
                        <span>Mastery</span>
                        <span className="font-semibold text-amber-800">80%</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full w-[80%]" />
                      </div>
                    </div>
                  </div>

                  {/* Concept 4 */}
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-black/[0.05] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-zinc-400">C4</span>
                        <Badge variant="coral" size="sm">Blocked</Badge>
                      </div>
                      <h4 className="text-sm font-semibold text-zinc-900 mt-1.5">Adding Fractions</h4>
                      <div className="mt-1">
                        <StarRatingDisplay stars={1} size="sm" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-zinc-500 mb-1">
                        <span>Mastery</span>
                        <span className="font-semibold text-rose-700">50%</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full w-[50%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Adaptive Recommendation Card */}
              <div className="p-5 rounded-2xl bg-zinc-50 border border-black/[0.07] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="h-4 w-4 text-black" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-black">
                      Adaptive Recommendation
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-zinc-600 border border-black/[0.06]">
                      Prerequisite Intervention
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-800">
                    Rohan struggled with <strong className="text-black">Adding Fractions (C4)</strong> because the system detected an unmastered prerequisite: <strong className="text-black">Common Multiples (C2 at 45%)</strong>.
                  </p>
                  <p className="text-xs text-zinc-500">
                    Engine Action: Rerouted to 5-minute visual LCM refresher before attempting fraction addition.
                  </p>
                </div>
                <Button variant="primary" size="sm" href="/student" className="shrink-0">
                  <span>Start Refresher</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
