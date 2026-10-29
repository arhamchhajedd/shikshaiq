import React from "react";
import { Users, AlertTriangle, SlidersHorizontal, ArrowRight, BarChart3 } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const TeacherCopilotSection: React.FC = () => {
  return (
    <section id="for-teachers" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Educator Intelligence"
          badgeVariant="default"
          title="Teacher Copilot."
          highlight="Total Classroom Clarity."
          description="Never wonder why a student struggles. ShikshaIQ delivers actionable classroom heatmaps, root cause analysis, and explainable recommendations teachers can review and override."
        />

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: 3 Key Copilot Capabilities */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="bg-white border-black/[0.06] p-6 rounded-2xl shadow-xs">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 shrink-0">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-zinc-900 tracking-tight mb-1">
                    Class-Wide Bottleneck Heatmaps
                  </h4>
                  <p className="text-xs text-zinc-600 leading-relaxed font-normal">
                    Instantly identify that 62% of students struggling with Adding Fractions are bottlenecked on finding LCM (Common Multiples). Group them for a 10-minute targeted mini-lesson.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-white border-black/[0.06] p-6 rounded-2xl shadow-xs">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-zinc-900 tracking-tight mb-1">
                    Misconception Radar
                  </h4>
                  <p className="text-xs text-zinc-600 leading-relaxed font-normal">
                    Distinguish arithmetic slips from conceptual errors (such as simply adding numerators and denominators directly: 1/2 + 1/3 = 2/5).
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-white border-black/[0.06] p-6 rounded-2xl shadow-xs">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 shrink-0">
                  <SlidersHorizontal className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-zinc-900 tracking-tight mb-1">
                    Explainable Recommendations & Override
                  </h4>
                  <p className="text-xs text-zinc-600 leading-relaxed font-normal">
                    Every recommendation shows its deterministic mathematical rationale. Teachers retain full agency to adjust student learning paths at any time.
                  </p>
                </div>
              </div>
            </Card>

            <div className="pt-2">
              <Button variant="primary" size="md" href="/teacher" className="w-full sm:w-auto">
                <span>Open Teacher Dashboard Demo</span>
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </div>

          {/* Right Column: Apple-style Teacher Window Snapshot */}
          <div className="lg:col-span-7">
            <Card className="bg-white border-black/[0.08] p-0 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.06)] rounded-3xl">
              {/* Dashboard Topbar */}
              <div className="px-5 py-3.5 bg-zinc-50 border-b border-black/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-zinc-700" />
                  <span className="text-xs font-semibold text-zinc-900">
                    Class 7-B • Mathematics • 42 Students Enrolled
                  </span>
                </div>
                <Badge variant="teal" size="sm">
                  Active Diagnostic
                </Badge>
              </div>

              {/* Classroom Concept Mastery Overview */}
              <div className="p-6 sm:p-7 space-y-6">
                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-500 mb-3">
                    <span className="font-semibold text-zinc-900">
                      Chapter 2: Fractions Mastery Distribution
                    </span>
                    <span>Class Median: 71%</span>
                  </div>

                  {/* Progress bars for concepts */}
                  <div className="space-y-3.5">
                    <div>
                      <div className="flex justify-between text-xs mb-1 font-medium">
                        <span className="text-zinc-800">C1: Fraction Basics</span>
                        <span className="text-emerald-700">39 / 42 Mastered (93%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full w-[93%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1 font-medium">
                        <span className="text-zinc-800">C2: Common Multiples & LCM</span>
                        <span className="text-rose-700">18 / 42 Need Support (43%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full w-[43%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1 font-medium">
                        <span className="text-zinc-800">C3: Equivalent Fractions</span>
                        <span className="text-amber-800">28 / 42 Developing (67%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full w-[67%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1 font-medium">
                        <span className="text-zinc-800">C4: Adding Fractions (Target Concept)</span>
                        <span className="text-rose-700">21 / 42 Need Support (50%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full w-[50%]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Copilot Alert Box */}
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <span className="font-semibold text-amber-900 block">
                      Copilot Bottleneck Alert: Common Multiples Deficit
                    </span>
                    <p className="text-zinc-700 leading-relaxed font-normal">
                      15 of the 21 students failing Adding Fractions lack mastery in Common Multiples (LCM). Recommended action: 15-minute group remediation on LCM before advancing.
                    </p>
                  </div>
                </div>

                {/* Actionable Student List Sample */}
                <div>
                  <h5 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2.5">
                    Flagged for Individual Attention (3 of 8)
                  </h5>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-black/[0.04] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-rose-500" />
                        <span className="font-medium text-zinc-900">Rohan Sharma</span>
                        <span className="text-zinc-500">· Root: C2 Common Multiples (45%)</span>
                      </div>
                      <span className="text-[11px] text-zinc-700 font-medium">Remediation Routed</span>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 border border-black/[0.04] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-rose-500" />
                        <span className="font-medium text-zinc-900">Pooja Verma</span>
                        <span className="text-zinc-500">· Root: C3 Equivalent Fractions (52%)</span>
                      </div>
                      <span className="text-[11px] text-zinc-700 font-medium">Remediation Routed</span>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 border border-black/[0.04] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        <span className="font-medium text-zinc-900">Vikram Rao</span>
                        <span className="text-zinc-500">· Direct Numerator Addition Error</span>
                      </div>
                      <span className="text-[11px] text-zinc-700 font-medium">Hint Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
