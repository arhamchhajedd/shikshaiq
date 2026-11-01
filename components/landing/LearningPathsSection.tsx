import React from "react";
import { UserCheck, Sparkles, TrendingUp, RefreshCcw, ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const LearningPathsSection: React.FC = () => {
  const personas = [
    {
      student: "Aarav Gupta",
      tag: "Advanced",
      badgeVariant: "teal" as const,
      initialState: "Diagnostic: 94% on Fraction Addition",
      diagnosis:
        "Fluent in Equivalent Fractions and LCM calculations. Solves standard algorithmic problems in under 30 seconds.",
      pathTitle: "Accelerated Enrichment",
      pathDescription:
        "Bypasses repetitive procedural drills and advances directly to multi-step Mixed Fraction word problems and real-world algebraic applications.",
      icon: TrendingUp,
      actionText: "Mixed Fraction Problems",
    },
    {
      student: "Diya Patel",
      tag: "On-Grade",
      badgeVariant: "amber" as const,
      initialState: "Diagnostic: 72% on Fraction Addition",
      diagnosis:
        "Understands common denominators conceptually, but makes occasional sign and simplifying errors on unlike denominators.",
      pathTitle: "Guided Scaffolding",
      pathDescription:
        "Receives targeted visual fraction bar exercises and step-by-step Socratic hints highlighting common reduction mistakes without spoiling answers.",
      icon: Sparkles,
      actionText: "Guided Practice with Tutor",
    },
    {
      student: "Rohan Sharma",
      tag: "Root Gap",
      badgeVariant: "coral" as const,
      initialState: "Diagnostic: 48% on Fraction Addition",
      diagnosis:
        "The system's prerequisite engine identifies that the failure is NOT fraction addition itself, but an unmastered prerequisite: Common Multiples (LCM at 45%).",
      pathTitle: "Prerequisite Remediation",
      pathDescription:
        "Instead of forcing repeated failed addition attempts, Rohan is routed to a 5-minute visual LCM module. Once mastered, he returns to succeed in fraction addition.",
      icon: RefreshCcw,
      actionText: "Revise Common Multiples (C2)",
    },
  ];

  return (
    <section id="learning-paths" className="py-20 lg:py-28 bg-[#f5f5f7] border-y border-black/[0.05]">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <SectionHeading
          badge="Three Learning Paths"
          badgeVariant="default"
          title="Same Diagnostic Quiz."
          highlight="Three Tailored Journeys."
          description="See how ShikshaIQ transforms a single Class 7 Fractions assessment into three individualized learning trajectories."
        />

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {personas.map((persona, index) => {
            const Icon = persona.icon;
            return (
              <Card
                key={index}
                className="bg-white border-black/[0.06] p-7 sm:p-8 flex flex-col justify-between hover:border-black/[0.12] transition-all rounded-3xl shadow-xs"
              >
                <div>
                  {/* Student Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-zinc-100 border border-black/[0.06] flex items-center justify-center font-semibold text-zinc-900 text-xs">
                        {persona.student.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900">
                          {persona.student}
                        </h4>
                        <span className="text-[11px] text-zinc-400">Class 7-B</span>
                      </div>
                    </div>
                    <Badge variant={persona.badgeVariant} size="sm">
                      {persona.tag}
                    </Badge>
                  </div>

                  {/* Initial State / Diagnostic Flag */}
                  <div className="mt-5 p-3.5 rounded-2xl bg-zinc-50 border border-black/[0.04] text-xs">
                    <div className="font-medium text-zinc-800 mb-1 flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-zinc-400" />
                      {persona.initialState}
                    </div>
                    <p className="text-zinc-500 text-[11px] leading-relaxed">
                      {persona.diagnosis}
                    </p>
                  </div>

                  {/* Adaptive Pathway */}
                  <div className="mt-5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-900">
                      <Icon className="h-3.5 w-3.5 text-black" />
                      <span>{persona.pathTitle}</span>
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed font-normal">
                      {persona.pathDescription}
                    </p>
                  </div>
                </div>

                {/* Path CTA */}
                <div className="mt-8 pt-4 border-t border-black/[0.06]">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-between text-xs font-medium"
                    href="/student"
                  >
                    <span>{persona.actionText}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
