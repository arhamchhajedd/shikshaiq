import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, GitFork, ArrowDown, Zap } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { JsonLd } from "@/components/seo/JsonLd";
import { CONCEPTS_LIST } from "@/lib/curriculum/concepts";
import { CONCEPT_LESSONS } from "@/lib/curriculum/lessons";

export const metadata = {
  title: "Curriculum Syllabus & Concept DAG | ShikshaIQ",
  description:
    "Explore the NCERT Class 7 Fractions and Decimals concept dependency graph, prerequisite hierarchy, learning objectives, and worked examples.",
};

export default function CurriculumPage() {
  const curriculumJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "NCERT Class 7 Mathematics: Chapter 2 Fractions and Decimals",
    description: "Adaptive concept graph syllabus with deterministic prerequisite dependency tracking.",
    provider: {
      "@type": "EducationalOrganization",
      name: "ShikshaIQ",
      url: "https://shikshaiq.vercel.app",
    },
    educationalLevel: "Class 7 (CBSE / NCERT)",
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "blended",
      courseWorkload: "PT5H",
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff] text-neutral-900 font-sans">
      <JsonLd data={curriculumJsonLd} />
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Hero Section */}
        <section className="space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-black/5 text-[11px] font-semibold text-neutral-800 uppercase tracking-wide">
            <GitFork className="w-3.5 h-3.5" />
            Class 7 Mathematics Topology
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
            Chapter 2: Fractions & Decimals Concept Graph
          </h1>
          <p className="text-sm text-neutral-500 max-w-2xl leading-relaxed">
            Unlike static textbooks, ShikshaIQ structures mathematics as an interconnected Directed Acyclic Graph (DAG). Mastery of advanced concepts requires verifiable evidence across foundational prerequisites.
          </p>
        </section>

        {/* DAG Flow Visualizer Card */}
        <section className="mb-14 p-6 sm:p-8 rounded-3xl border border-black/10 bg-neutral-50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-500">
              Prerequisite Dependency Map
            </h2>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white border border-black/5 text-neutral-600">
              5 Nodes • 50 Verified Questions
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
            {CONCEPTS_LIST.map((c, idx) => (
              <div key={c.id} className="flex flex-col items-center">
                <div className="w-full p-4 rounded-2xl bg-white border border-black/10 shadow-2xs space-y-2 text-center h-full flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-neutral-400 block mb-1">
                      Step 0{idx + 1}
                    </span>
                    <h3 className="text-xs font-bold text-neutral-900 leading-tight">
                      {c.title}
                    </h3>
                  </div>
                  <div className="text-[10px] text-neutral-500 font-mono">
                    {c.prerequisites.length === 0 ? "Root Concept" : `Requires: ${c.prerequisites.length} node(s)`}
                  </div>
                </div>
                {idx < CONCEPTS_LIST.length - 1 && (
                  <div className="sm:hidden my-2 text-neutral-300">
                    <ArrowDown className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Detailed Concept Syllabus Breakdown */}
        <section className="space-y-6 mb-16">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
              Detailed Concept Syllabus & Learning Objectives
            </h2>
            <span className="text-xs text-neutral-400 font-mono">NCERT Aligned</span>
          </div>

          <div className="space-y-4">
            {CONCEPTS_LIST.map((c, index) => {
              const lesson = CONCEPT_LESSONS[c.id];
              return (
                <Card
                  key={c.id}
                  className="p-6 border border-black/[0.08] rounded-3xl bg-white shadow-2xs hover:border-black/20 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/5 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 rounded-lg bg-black text-white items-center justify-center text-xs font-mono font-bold">
                          {index + 1}
                        </span>
                        <h3 className="text-base font-bold text-neutral-900">{c.title}</h3>
                      </div>
                      <p className="text-xs text-neutral-500">{c.description}</p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <Link
                        href={`/student/learn/${c.id}`}
                        className="px-3 py-1.5 rounded-xl border border-black/10 hover:bg-neutral-50 text-[11px] font-semibold text-neutral-700 transition-colors"
                      >
                        Read Lesson
                      </Link>
                      <Link
                        href={`/student/practice/${c.id}`}
                        className="px-3 py-1.5 rounded-xl bg-black hover:bg-neutral-800 text-[11px] font-semibold text-white transition-colors shadow-2xs"
                      >
                        Practice
                      </Link>
                    </div>
                  </div>

                  {lesson && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-2xl bg-neutral-50 border border-black/5 space-y-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">
                          Learning Objective
                        </span>
                        <p className="text-neutral-700 font-medium leading-relaxed">
                          {lesson.learningObjective}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-rose-600 block">
                          Diagnosed Misconceptions
                        </span>
                        <p className="text-rose-900 leading-relaxed">
                          {lesson.commonMistakes[0]?.misconception ||
                            "Arithmetic errors vs conceptual prerequisite gaps."}
                        </p>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </section>

        {/* Diagnostic Assessment CTA */}
        <div className="p-8 rounded-3xl bg-neutral-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-xl font-bold tracking-tight">Evaluate Your Class 7 Fractions Mastery</h3>
            <p className="text-xs text-neutral-400 max-w-lg leading-relaxed">
              Take our verified 15-question diagnostic baseline. Our engine will map your strengths and pinpoint any prerequisite gaps.
            </p>
          </div>
          <Link
            href="/student/assessment"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black hover:bg-neutral-100 text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <Zap className="h-4 w-4" />
            <span>Start Diagnostic</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
