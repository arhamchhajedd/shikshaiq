import React from "react";
import { AlertCircle, Clock, EyeOff, Layers } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";

export const ProblemSection: React.FC = () => {
  const problems = [
    {
      icon: Clock,
      tag: "Advanced Students",
      title: "Fast learners become bored",
      description:
        "Students who have already mastered fraction equivalents are forced to repeat uniform drills at the pace of the median student, causing disengagement and wasted learning potential.",
      stat: "15–20% of class time lost to repetitive exercises",
    },
    {
      icon: AlertCircle,
      tag: "Struggling Students",
      title: "Foundational gaps multiply over time",
      description:
        "A student who never learned how to find the Least Common Multiple (LCM) in Class 6 cannot add fractions with unlike denominators in Class 7. They fall further behind every week.",
      stat: "Root gaps in prerequisites remain invisible without diagnostics",
    },
    {
      icon: EyeOff,
      tag: "Educators",
      title: "Teachers lack granular visibility",
      description:
        "Managing 45 to 60 students per classroom, teachers only see aggregate exam scores. They cannot easily identify which specific concept sub-skill caused each individual failure.",
      stat: "Over 40 students per teacher makes manual diagnosis impossible",
    },
  ];

  return (
    <section id="features" className="py-20 lg:py-28 bg-[#f5f5f7] border-y border-black/[0.05]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="The Classroom Reality"
          badgeVariant="default"
          title="One lesson cannot serve"
          highlight="fifty different learners"
          description="In Indian school classrooms, wide variations in foundational readiness turn one-size-fits-all instruction into a daily compromise."
        />

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {problems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card
                key={idx}
                className="bg-white border-black/[0.06] flex flex-col justify-between hover:border-black/[0.12] transition-all rounded-3xl p-7 sm:p-8 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-800">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-black/[0.06]">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-zinc-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-zinc-600 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-black/[0.06] text-xs text-zinc-500 flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span>{item.stat}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
