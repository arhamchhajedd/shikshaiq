"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  ArrowRight,
  PlayCircle,
  RefreshCw,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MasteryBadge } from "@/components/curriculum/MasteryBadge";
import { StarRatingDisplay } from "@/components/gamification/StarRatingDisplay";
import { ParentReportButton } from "@/components/share/ParentReportButton";
import { getStoredResult, clearStoredAssessment } from "@/lib/demo/state";
import { ALL_QUESTIONS } from "@/lib/curriculum/questions";
import { CONCEPTS } from "@/lib/curriculum/concepts";
import { AssessmentResult, ConceptResult, QuestionReviewItem } from "@/types/assessment";
import { ConceptId, QuestionOption } from "@/types/curriculum";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function AssessmentResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  // Load results from state or Supabase on mount
  useEffect(() => {
    let ignore = false;

    async function loadResult() {
      // 1. Check in-memory session result from immediate test submission
      const stored = getStoredResult();
      if (stored) {
        if (!ignore) {
          setResult(stored);
          setIsLoading(false);
        }
        return;
      }

      // 2. Otherwise check Supabase for student's recorded attempts
      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user) {
            // Check student_attempts
            const { data: attempts } = await supabase
              .from("student_attempts")
              .select("question_id, selected_option_id")
              .eq("student_id", user.id)
              .order("attempted_at", { ascending: false })
              .limit(15);

            if (attempts && attempts.length >= 15 && !ignore) {
              const res = await fetch("/api/assessment/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  answers: attempts.map((a) => ({
                    questionId: a.question_id,
                    selectedOptionId: a.selected_option_id,
                  })),
                }),
              });

              if (res.ok) {
                const data = await res.json();
                if (!ignore) {
                  setResult(data.result);
                }
              }
            }
          }
        } catch (err) {
          console.error("Error loading student assessment results:", err);
        }
      }

      if (!ignore) {
        setIsLoading(false);
      }
    }

    void loadResult();

    return () => {
      ignore = true;
    };
  }, []);

  const handleRetake = () => {
    clearStoredAssessment();
    router.push("/student/assessment");
  };

  const toggleAccordion = (qId: string) => {
    setExpandedQuestionId(expandedQuestionId === qId ? null : qId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfd] text-zinc-900 font-sans">
      <Header />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 sm:py-12">
        {/* Breadcrumb Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.06]">
          <Link
            href="/student"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Student Dashboard</span>
          </Link>

          {result && (
            <div className="flex flex-wrap items-center gap-2">
              <ParentReportButton
                studentName="Student"
                overallAccuracy={result.percentage}
                stars={Math.round((result.percentage / 100) * 15)}
                maxStars={15}
                masteredCount={result.strongConcepts.length}
                recommendedConcept={
                  CONCEPTS[result.recommendedConceptId]?.shortTitle || result.recommendedConceptId
                }
              />

              <Button
                variant="outline"
                size="sm"
                onClick={handleRetake}
                className="text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                <span>Retake Assessment</span>
              </Button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-neutral-400 mx-auto mb-3" />
            <p className="text-xs text-neutral-500 font-medium">Loading assessment evaluation...</p>
          </div>
        ) : !result ? (
          /* EMPTY STATE */
          <Card className="mt-8 p-12 text-center bg-white border-black/[0.06] rounded-3xl shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-neutral-50 border border-black/5 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-neutral-700" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-neutral-900">
              No Assessment Results Found
            </h2>
            <p className="text-xs text-neutral-500 max-w-md mx-auto mt-2 leading-relaxed">
              You haven&apos;t completed a diagnostic quiz yet. Complete the 15-question Class 7 Fractions Diagnostic to view your concept breakdown and recommendations.
            </p>
            <div className="mt-6">
              <Link href="/student/assessment">
                <Button className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl shadow-sm inline-flex items-center gap-2">
                  <PlayCircle className="w-4 h-4" />
                  Take Diagnostic Assessment
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          /* RESULTS VIEW */
          <div className="mt-6 space-y-8">
            {/* Top Score Summary Banner */}
            <Card className="bg-white border-black/[0.08] p-7 sm:p-9 shadow-[0_12px_40px_rgba(0,0,0,0.04)] rounded-3xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-black/[0.06]">
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Diagnostic Report • Class 7 Mathematics
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">
                    Assessment Evaluation Complete
                  </h1>
                  <p className="text-xs text-zinc-600">
                    Evaluated on server across 5 NCERT Class 7 concept nodes
                  </p>
                </div>

                {/* Score Big Display */}
                <div className="flex items-center gap-4 bg-zinc-50 px-6 py-4 rounded-2xl border border-black/[0.06] shrink-0 self-start md:self-auto">
                  <div className="text-right">
                    <span className="text-3xl font-extrabold text-zinc-950 font-mono">
                      {result.percentage}%
                    </span>
                    <span className="block text-[11px] text-zinc-500 font-medium">
                      {result.totalCorrect} of {result.totalQuestions} Correct
                    </span>
                  </div>
                  <div
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-sm ${
                      result.percentage >= 80
                        ? "bg-emerald-100 text-emerald-800"
                        : result.percentage >= 50
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {result.percentage >= 80 ? "A" : result.percentage >= 50 ? "B" : "C"}
                  </div>
                </div>
              </div>

              {/* Recommended Next Action */}
              <div className="p-5 sm:p-6 rounded-2xl bg-neutral-50/80 border border-black/5 space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900">
                  <Sparkles className="h-4 w-4 text-zinc-900 shrink-0" />
                  <span>Adaptive Recommendation</span>
                </div>
                <p className="text-sm font-medium text-zinc-900 leading-relaxed">
                  {result.recommendedNextStep}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link href={`/student/learn/${result.recommendedConceptId}`}>
                    <Button variant="outline" className="text-xs px-4 py-2 rounded-xl flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Review Concept Lesson</span>
                    </Button>
                  </Link>
                  <Link href={`/student/practice/${result.recommendedConceptId}`}>
                    <Button className="text-xs px-4 py-2 rounded-xl bg-black text-white hover:bg-neutral-800 flex items-center gap-1.5">
                      <span>Start Guided Practice</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Concept Mastered vs Needs Revision Lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mastered concepts */}
                <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Demonstrated Strengths</span>
                  </div>
                  {result.strongConcepts.length > 0 ? (
                    <ul className="space-y-1.5 pt-1">
                      {result.strongConcepts.map((cId) => {
                        const conceptKey = cId as ConceptId;
                        const concept = CONCEPTS[conceptKey];
                        const breakdown = result.conceptBreakdown[conceptKey];
                        return (
                          <li
                            key={cId}
                            className="text-xs text-emerald-950 font-medium flex items-center justify-between"
                          >
                            <span>{concept?.title || cId}</span>
                            {breakdown && (
                              <span className="font-mono text-[11px] text-emerald-700">
                                {breakdown.correctCount} / {breakdown.totalQuestions}
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-xs text-emerald-800/80 italic pt-1">
                      No concepts reached 80% mastery in this diagnostic attempt.
                    </p>
                  )}
                </div>

                {/* Revision needed concepts */}
                <div className="p-4 rounded-2xl border border-rose-100 bg-rose-50/40 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
                    <AlertCircle className="h-4 w-4 text-rose-600" />
                    <span>Target Focus &amp; Prerequisite Gaps</span>
                  </div>
                  {result.revisionConcepts.length > 0 ? (
                    <ul className="space-y-1.5 pt-1">
                      {result.revisionConcepts.map((cId) => {
                        const conceptKey = cId as ConceptId;
                        const concept = CONCEPTS[conceptKey];
                        const breakdown = result.conceptBreakdown[conceptKey];
                        return (
                          <li
                            key={cId}
                            className="text-xs text-rose-950 font-medium flex items-center justify-between"
                          >
                            <span>{concept?.title || cId}</span>
                            {breakdown && (
                              <span className="font-mono text-[11px] text-rose-700 font-semibold">
                                {breakdown.correctCount} / {breakdown.totalQuestions}
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-xs text-rose-800/80 italic pt-1">
                      All tested concepts demonstrated satisfactory preliminary performance.
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Concept Breakdown Table */}
            <Card className="bg-white border-black/[0.08] p-6 sm:p-8 space-y-5 shadow-xs rounded-3xl">
              <h2 className="text-lg font-bold tracking-tight text-zinc-950">
                Detailed Concept Breakdown
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-black/[0.06] text-zinc-500 uppercase tracking-wider text-[10px]">
                      <th className="pb-3 font-semibold">Concept Name</th>
                      <th className="pb-3 font-semibold text-center">Score</th>
                      <th className="pb-3 font-semibold text-center">Accuracy</th>
                      <th className="pb-3 font-semibold text-center">Mastery State</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04]">
                    {Object.values(result.conceptBreakdown).map((item: ConceptResult) => (
                      <tr key={item.conceptId} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="py-3.5 pr-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-zinc-900">
                              {item.conceptTitle}
                            </span>
                            <StarRatingDisplay
                              stars={item.percentage >= 80 ? 3 : item.percentage >= 50 ? 2 : 1}
                              size="sm"
                            />
                          </div>
                          <div className="text-[11px] text-zinc-500 font-normal mt-0.5">
                            {CONCEPTS[item.conceptId]?.description}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-medium text-zinc-700">
                          {item.correctCount} / {item.totalQuestions}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-zinc-900">
                          {item.percentage}%
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <MasteryBadge status={item.status} />
                        </td>
                        <td className="py-3.5 pl-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link href={`/student/learn/${item.conceptId}`}>
                              <Button variant="outline" className="text-[11px] px-2.5 py-1 rounded-xl">
                                Learn
                              </Button>
                            </Link>
                            <Link href={`/student/practice/${item.conceptId}`}>
                              <Button className="text-[11px] px-2.5 py-1 rounded-xl bg-black text-white hover:bg-neutral-800">
                                Practice
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Question by Question Review Accordion */}
            <Card className="bg-white border-black/[0.08] p-6 sm:p-8 space-y-6 shadow-xs rounded-3xl">
              <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-zinc-950">
                    Question-by-Question Review
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Review your answers, correct options, and pedagogical step-by-step explanations
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {result.questionReviews.map((item: QuestionReviewItem, idx: number) => {
                  const isExpanded = expandedQuestionId === item.questionId;
                  const questionMeta = ALL_QUESTIONS.find((q) => q.id === item.questionId);

                  return (
                    <div
                      key={item.questionId}
                      className={`rounded-2xl border transition-all overflow-hidden ${
                        item.isCorrect
                          ? "border-black/[0.06] bg-zinc-50/40"
                          : "border-rose-200/80 bg-rose-50/20"
                      }`}
                    >
                      {/* Accordion Header */}
                      <button
                        type="button"
                        onClick={() => toggleAccordion(item.questionId)}
                        className="w-full p-4 flex items-center justify-between text-left gap-4 hover:bg-black/[0.02] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-6 w-6 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                              item.isCorrect
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            Q{idx + 1}
                          </div>

                          <div>
                            <span className="text-xs font-semibold text-zinc-900 line-clamp-1">
                              {item.prompt}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono capitalize">
                              {item.conceptId.replace(/-/g, " ")}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                              item.isCorrect
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200/60"
                                : "bg-rose-50 text-rose-800 border border-rose-200/60"
                            }`}
                          >
                            {item.isCorrect ? "Correct" : "Needs Review"}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-zinc-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-zinc-400" />
                          )}
                        </div>
                      </button>

                      {/* Accordion Content */}
                      {isExpanded && (
                        <div className="p-4 pt-1 border-t border-black/[0.04] space-y-3 bg-white">
                          <div className="text-xs font-medium text-zinc-800">
                            {item.prompt}
                          </div>

                          {/* Options breakdown */}
                          {questionMeta && (
                            <div className="space-y-1.5 pt-1">
                              {questionMeta.options.map((opt: QuestionOption) => {
                                const isUserSelected = opt.id === item.selectedOptionId;
                                const isCorrect = opt.id === item.correctOptionId;

                                return (
                                  <div
                                    key={opt.id}
                                    className={`p-2.5 rounded-xl text-xs flex items-center justify-between ${
                                      isCorrect
                                        ? "bg-emerald-50 text-emerald-950 border border-emerald-200/80 font-medium"
                                        : isUserSelected
                                        ? "bg-rose-50 text-rose-950 border border-rose-200/80 font-medium"
                                        : "bg-zinc-50/60 text-zinc-600 border border-transparent"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono font-semibold uppercase text-[10px]">
                                        {opt.id.replace("opt_", "")}:
                                      </span>
                                      <span>{opt.text}</span>
                                    </div>

                                    {isCorrect && (
                                      <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                                        Correct Key
                                      </span>
                                    )}
                                    {!isCorrect && isUserSelected && (
                                      <span className="text-[10px] font-bold text-rose-700 bg-white px-2 py-0.5 rounded-full border border-rose-200">
                                        Your Choice
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Pedagogical Explanation */}
                          <div className="p-3.5 rounded-xl bg-zinc-50 border border-black/[0.04] space-y-1">
                            <span className="text-[11px] font-bold text-zinc-800 block">
                              Pedagogical Explanation:
                            </span>
                            <p className="text-xs text-zinc-600 leading-relaxed font-normal">
                              {item.explanation}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Bottom Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link href="/student">
                <Button variant="secondary" size="md">
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  <span>Return to Student Dashboard</span>
                </Button>
              </Link>

              <Button
                variant="primary"
                size="md"
                onClick={handleRetake}
              >
                <span>Take Another Assessment</span>
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
