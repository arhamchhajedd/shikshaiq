import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, AlertCircle, GitFork } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { VisualFractionModel } from "@/components/curriculum/VisualFractionModel";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { conceptPagePath } from "@/lib/seo/routes";
import {
  buildBreadcrumbNode,
  buildGraph,
  buildLearningResourceNode,
} from "@/lib/seo/structuredData";
import { CONCEPTS, CONCEPTS_LIST } from "@/lib/curriculum/concepts";
import { CONCEPT_LESSONS } from "@/lib/curriculum/lessons";
import { ConceptId } from "@/types/curriculum";

interface ConceptPageProps {
  params: Promise<{ conceptId: string }>;
}

export async function generateStaticParams() {
  return CONCEPTS_LIST.map((concept) => ({
    conceptId: concept.id,
  }));
}

export async function generateMetadata({ params }: ConceptPageProps): Promise<Metadata> {
  const { conceptId } = await params;
  const concept = CONCEPTS[conceptId as ConceptId];

  if (!concept) {
    return {
      title: "Concept Not Found",
    };
  }

  const lesson = CONCEPT_LESSONS[concept.id];

  return buildPageMetadata({
    title: `${concept.title} — NCERT Class 7 Mathematics`,
    description: lesson?.summary || concept.description,
    path: conceptPagePath(concept.id),
    keywords: [
      concept.title,
      `${concept.shortTitle} Class 7`,
      "NCERT Class 7 Maths Fractions",
      "CBSE Fractions explanation",
      "worked examples fractions",
    ],
  });
}

export default async function PublicConceptLessonPage({ params }: ConceptPageProps) {
  const { conceptId } = await params;
  const concept = CONCEPTS[conceptId as ConceptId];
  const lesson = CONCEPT_LESSONS[conceptId as ConceptId];

  if (!concept || !lesson) {
    notFound();
  }

  const breadcrumbData = buildBreadcrumbNode([
    { name: "Home", path: "/" },
    { name: "Curriculum", path: "/curriculum" },
    { name: concept.shortTitle, path: conceptPagePath(concept.id) },
  ]);

  const learningResourceData = buildLearningResourceNode(lesson);
  const structuredData = buildGraph([breadcrumbData, learningResourceData]);

  const directPrereqs = concept.prerequisites.map((pId) => CONCEPTS[pId]);
  const currentIndex = CONCEPTS_LIST.findIndex((c) => c.id === concept.id);
  const nextConcept = CONCEPTS_LIST[currentIndex + 1];
  const prevConcept = CONCEPTS_LIST[currentIndex - 1];

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
              <Link href="/curriculum" className="hover:text-black transition-colors">
                Curriculum
              </Link>
              <span>/</span>
              <span className="text-zinc-900 font-medium">{concept.shortTitle}</span>
            </nav>
          </div>
        </div>

        {/* Lesson Header */}
        <header className="pt-10 pb-12 sm:pt-14 sm:pb-16 border-b border-black/[0.06] bg-white">
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <Badge variant="default">Step {concept.order} of 5</Badge>
              <Badge variant="outline">{lesson.subject} · Class {lesson.gradeLevel}</Badge>
              <span className="text-xs text-zinc-500 ml-auto">
                {lesson.estimatedMinutes} min read
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-950 leading-[1.15]">
              {lesson.title}
            </h1>

            <p className="mt-4 text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
              {lesson.summary}
            </p>

            {/* Prerequisite Alert if any */}
            {directPrereqs.length > 0 && (
              <div className="mt-6 p-4 rounded-2xl bg-zinc-50 border border-black/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-zinc-700">
                  <GitFork className="h-4 w-4 text-zinc-500 shrink-0" />
                  <span>
                    Prerequisite foundational knowledge:{" "}
                    <strong>{directPrereqs.map((p) => p.shortTitle).join(", ")}</strong>
                  </span>
                </div>
                <Link
                  href={conceptPagePath(directPrereqs[0].id)}
                  className="font-semibold text-black hover:underline shrink-0"
                >
                  Review {directPrereqs[0].shortTitle} →
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Lesson Body Content */}
        <article className="py-12 sm:py-16 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-4xl mx-auto space-y-12">
          {/* Learning Objective */}
          <section className="p-6 rounded-3xl bg-white border border-black/[0.06] shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
              Learning Objective
            </h2>
            <p className="text-sm sm:text-base font-medium text-zinc-900 leading-relaxed">
              {lesson.learningObjective}
            </p>
          </section>

          {/* Conceptual Introduction */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">
              Introduction & Everyday Concept
            </h2>
            <div className="text-sm sm:text-base text-zinc-700 leading-relaxed bg-white p-6 sm:p-7 rounded-3xl border border-black/[0.06] space-y-4">
              <p>{lesson.introduction}</p>
            </div>
          </section>

          {/* Visual Model */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 flex items-center gap-2">
              <span>Interactive Visual Model</span>
              <span className="text-xs font-normal text-zinc-500">
                (Geometric Representation)
              </span>
            </h2>
            <VisualFractionModel model={lesson.visualRepresentation} />
          </section>

          {/* Key Mathematical Rules */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">
              Key Rules & Principles
            </h2>
            <div className="space-y-2.5">
              {lesson.keyRules.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white border border-black/[0.06] flex items-start gap-3 shadow-xs"
                >
                  <span className="h-5 w-5 rounded-full bg-zinc-100 text-zinc-700 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-zinc-800 leading-relaxed">
                    {rule}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Worked Examples */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">
              Step-by-Step Worked Examples
            </h2>
            <div className="space-y-6">
              {lesson.workedExamples.map((example, idx) => (
                <Card key={example.id} variant="surface" className="p-6 sm:p-7 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-black text-white text-[11px] font-bold">
                      Example {idx + 1}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-zinc-950">
                      {example.problem}
                    </h3>
                  </div>

                  <div className="pl-3 border-l-2 border-black/10 space-y-2 py-1">
                    {example.steps.map((step, sIdx) => (
                      <p key={sIdx} className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
                        {step}
                      </p>
                    ))}
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-50 border border-black/[0.06] text-xs font-medium text-zinc-900">
                    <strong>Solution:</strong> {example.solution}
                  </div>

                  {example.tip && (
                    <div className="text-[11px] text-zinc-500 italic">
                      💡 <strong>Teacher Tip:</strong> {example.tip}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </section>

          {/* Common Mistakes & Misconceptions */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 flex items-center gap-2">
              <span>Common Student Misconceptions</span>
            </h2>
            <div className="space-y-4">
              {lesson.commonMistakes.map((mistake) => (
                <div
                  key={mistake.id}
                  className="p-5 sm:p-6 rounded-3xl bg-white border border-rose-100 space-y-3 shadow-xs"
                >
                  <div className="flex items-start gap-2.5 text-rose-800">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block">
                        Common Misconception
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-zinc-950 mt-0.5">
                        &ldquo;{mistake.misconception}&rdquo;
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-rose-50 text-xs sm:text-sm text-zinc-700 space-y-1.5 pl-6">
                    <p>
                      <strong className="text-emerald-700">Correction:</strong> {mistake.correction}
                    </p>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      {mistake.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Next Steps CTA */}
          <section className="p-8 rounded-3xl bg-white border border-black/[0.08] text-center space-y-4 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">
              Ready to test your understanding of {concept.shortTitle}?
            </h2>
            <p className="text-sm text-zinc-600 max-w-lg mx-auto">
              Start interactive guided practice with instant feedback and Socratic tutoring, or explore the next concept.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Button variant="primary" size="lg" href={`/student/practice/${concept.id}`}>
                <span>Start Practice Questions</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
              {nextConcept && (
                <Button variant="secondary" size="lg" href={conceptPagePath(nextConcept.id)}>
                  <span>Next: {nextConcept.shortTitle}</span>
                </Button>
              )}
            </div>
          </section>

          {/* Navigation between concepts */}
          <nav aria-label="Concept Navigation" className="pt-8 border-t border-black/[0.06] flex items-center justify-between">
            {prevConcept ? (
              <Link
                href={conceptPagePath(prevConcept.id)}
                className="text-xs text-zinc-600 hover:text-black inline-flex items-center gap-1.5 font-medium"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>Previous: {prevConcept.shortTitle}</span>
              </Link>
            ) : (
              <span />
            )}

            {nextConcept && (
              <Link
                href={conceptPagePath(nextConcept.id)}
                className="text-xs text-zinc-600 hover:text-black inline-flex items-center gap-1.5 font-medium ml-auto"
              >
                <span>Next: {nextConcept.shortTitle}</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </nav>
        </article>
      </main>

      <Footer />
    </div>
  );
}
