import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, GitFork, CheckCircle2, Sparkles, Layers } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { conceptPagePath } from "@/lib/seo/routes";
import {
  buildBreadcrumbNode,
  buildCourseNode,
  buildGraph,
} from "@/lib/seo/structuredData";
import { CONCEPTS_LIST, CONCEPTS } from "@/lib/curriculum/concepts";
import { CONCEPT_LESSONS } from "@/lib/curriculum/lessons";

export const metadata: Metadata = buildPageMetadata({
  title: "NCERT Class 7 Maths Fractions Syllabus & Concept Graph",
  description:
    "Explore the complete NCERT Class 7 Fractions concept graph. Understand prerequisites, learning objectives, and progression from Fraction Basics to Mixed Numbers.",
  path: "/curriculum",
  keywords: [
    "NCERT Class 7 fractions syllabus",
    "CBSE Class 7 maths fractions",
    "fractions concept graph",
    "fractions prerequisites",
    "equivalent fractions Class 7",
    "adding fractions LCM",
  ],
});

export default function CurriculumPage() {
  const breadcrumbData = buildBreadcrumbNode([
    { name: "Home", path: "/" },
    { name: "Curriculum", path: "/curriculum" },
  ]);

  const courseData = buildCourseNode(
    "Comprehensive NCERT Class 7 Mathematics Fractions curriculum featuring a 5-node directed acyclic graph (DAG) of foundational and advanced concepts."
  );

  const structuredData = buildGraph([breadcrumbData, courseData]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfd] text-zinc-900 selection:bg-black selection:text-white">
      <JsonLd data={structuredData} />
      <Header />

      <main className="flex-1">
        {/* Breadcrumb Navigation */}
        <div className="border-b border-black/[0.06] bg-white">
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-3">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-500">
              <Link href="/" className="hover:text-black transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-zinc-900 font-medium">Curriculum</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-black/[0.06] bg-white">
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-black/[0.06] text-xs font-medium text-zinc-800 mb-6 shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-black" />
              <span>NCERT / CBSE Class 7 Mathematics</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-950 leading-[1.15]">
              Fractions Concept Graph & Learning Pathways
            </h1>

            <p className="mt-5 text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed font-normal">
              Unlike static textbooks, ShikshaIQ structures Chapter 2 (Fractions and Decimals) into a Directed Acyclic Graph (DAG) of prerequisite concepts. Master root foundations before advancing.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button variant="primary" size="lg" href="/student/assessment">
                <span>Start Diagnostic Assessment</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
              <Button variant="secondary" size="lg" href="/faq#concept-order">
                <span>View Learning Order Rules</span>
              </Button>
            </div>
          </div>
        </section>

        {/* Concept DAG Overview */}
        <section className="py-16 sm:py-20 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-6xl mx-auto">
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <Badge variant="default" className="mb-3">
              Topology
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
              The 5 Foundational Concepts
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              Explore each concept, understand its prerequisites, and read micro-lessons with verified visual models.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CONCEPTS_LIST.map((concept) => {
              const lesson = CONCEPT_LESSONS[concept.id];
              const prereqList = concept.prerequisites.map((pId) => CONCEPTS[pId].shortTitle);

              return (
                <Card
                  key={concept.id}
                  variant="surface"
                  className="flex flex-col justify-between hover:border-black/20 transition-all p-6 sm:p-7"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-800 border border-black/[0.06]">
                        Step {concept.order}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {lesson?.estimatedMinutes || 8} min read
                      </span>
                    </div>

                    <h3 className="text-lg font-bold tracking-tight text-zinc-950 mb-2">
                      {concept.title}
                    </h3>

                    <p className="text-xs text-zinc-600 leading-relaxed mb-4">
                      {concept.description}
                    </p>

                    {/* Prerequisite Tags */}
                    <div className="pt-3 border-t border-black/[0.06] mb-4">
                      <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1.5">
                        Prerequisites:
                      </span>
                      {prereqList.length === 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" /> None (Foundational Root)
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {prereqList.map((prereq, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 text-[11px] text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200"
                            >
                              <GitFork className="h-2.5 w-2.5" />
                              {prereq}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between">
                    <Link
                      href={conceptPagePath(concept.id)}
                      className="text-xs font-semibold text-black inline-flex items-center gap-1 hover:underline"
                    >
                      <span>Read Concept Lesson</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                    <Link
                      href={`/student/practice/${concept.id}`}
                      className="text-xs text-zinc-500 hover:text-black transition-colors"
                    >
                      Practice →
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Why Prerequisites Matter Section */}
        <section className="py-16 bg-[#f5f5f7] border-t border-black/[0.06]">
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
                Why Prerequisite Bottleneck Tracing Works
              </h2>
              <p className="mt-2 text-sm text-zinc-600 max-w-xl mx-auto">
                Research shows that 70% of student struggles in advanced fractions stem from unnoticed gaps in basic LCM or equivalent fractions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card variant="surface" className="p-6">
                <div className="h-9 w-9 rounded-xl bg-black text-white flex items-center justify-center mb-3">
                  <GitFork className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-zinc-950 mb-1.5">Zero Guesswork</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Instead of drilling students on problems they cannot solve, ShikshaIQ isolates the exact missing building block.
                </p>
              </Card>

              <Card variant="surface" className="p-6">
                <div className="h-9 w-9 rounded-xl bg-black text-white flex items-center justify-center mb-3">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-zinc-950 mb-1.5">Socratic Support</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Our companion AI explains concepts using intuitive Indian analogies (rotis, dosas, cricket runs) without giving away the answer.
                </p>
              </Card>

              <Card variant="surface" className="p-6">
                <div className="h-9 w-9 rounded-xl bg-black text-white flex items-center justify-center mb-3">
                  <Layers className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-zinc-950 mb-1.5">Classroom Visibility</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Teachers see cluster bottlenecks across 40–60 students instantly, enabling targeted group interventions.
                </p>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
