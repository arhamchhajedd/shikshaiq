import React from "react";
import { BookOpen, HelpCircle, CheckSquare, ArrowRight, GitFork } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      step: "01",
      badge: "Step 1: Test",
      badgeVariant: "default" as const,
      icon: CheckSquare,
      title: "Diagnostic Assessment",
      description:
        "Students complete a targeted, low-stakes diagnostic quiz. The system analyzes answers at the atomic concept level—identifying not just what is incorrect, but which exact sub-skill failed.",
      detail: "Evaluates Class 7 Fractions across 5 discrete concept nodes",
    },
    {
      step: "02",
      badge: "Step 2: Solve",
      badgeVariant: "default" as const,
      icon: HelpCircle,
      title: "Prerequisite Evaluation",
      description:
        "The deterministic adaptive engine checks the prerequisite Directed Acyclic Graph (DAG). If a student fails Adding Fractions, the engine verifies whether Common Multiples and Equivalent Fractions are solid.",
      detail: "Mathematical rules verify dependencies; no arbitrary LLM decisions",
    },
    {
      step: "03",
      badge: "Step 3: Learn",
      badgeVariant: "default" as const,
      icon: BookOpen,
      title: "Targeted Micro-Learning",
      description:
        "The student receives a personalized learning path with interactive practice and step-by-step Socratic hints from the AI tutor. Once the prerequisite gap is cleared, they return to advance.",
      detail: "Adaptive progression with immediate positive reinforcement",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <SectionHeading
          badge="Adaptive Architecture"
          badgeVariant="default"
          title="Learn. Solve. Test."
          highlight="Deterministic Progression"
          description="Assessment results don't just assign a percentage score—they mathematically determine the exact concept the student needs to learn next."
        />

        {/* 3 Step Process Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card
                key={index}
                className="bg-white border-black/[0.06] p-7 sm:p-8 flex flex-col justify-between hover:border-black/[0.12] transition-all rounded-3xl shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="h-11 w-11 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-900">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-2xl font-bold text-zinc-300 font-mono">
                      {item.step}
                    </span>
                  </div>

                  <div className="mb-3">
                    <Badge variant={item.badgeVariant} size="sm">
                      {item.badge}
                    </Badge>
                  </div>

                  <h3 className="text-xl font-bold tracking-tight text-zinc-900 mb-2.5">
                    {item.title}
                  </h3>
                  <p className="text-sm text-zinc-600 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-black/[0.06] text-xs text-zinc-500 flex items-center gap-2">
                  <GitFork className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span>{item.detail}</span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Concept DAG Dependency Visualization Banner */}
        <div className="mt-10 p-7 sm:p-8 rounded-3xl bg-zinc-50 border border-black/[0.06] shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-black flex items-center gap-1.5">
                <GitFork className="h-3.5 w-3.5 text-black" />
                The Prerequisite DAG Rule
              </span>
              <h4 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
                Adding Fractions depends on Equivalent Fractions & Common Multiples
              </h4>
              <p className="text-xs sm:text-sm text-zinc-600 font-normal">
                Mixed fraction problems depend on adding fractions. If a student struggles at the top node, the engine traverses down the graph to heal the root bottleneck first.
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
              <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-white text-zinc-700 border border-black/[0.07] shadow-xs">
                C1: Basics
              </span>
              <ArrowRight className="h-3 w-3 text-zinc-400" />
              <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-white text-zinc-700 border border-black/[0.07] shadow-xs">
                C2: Multiples
              </span>
              <ArrowRight className="h-3 w-3 text-zinc-400" />
              <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-white text-zinc-700 border border-black/[0.07] shadow-xs">
                C3: Equiv.
              </span>
              <ArrowRight className="h-3 w-3 text-zinc-400" />
              <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-black text-white shadow-xs">
                C4: Addition
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
