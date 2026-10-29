"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ListFilter,
  BookOpen,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DIAGNOSTIC_QUESTIONS } from "@/lib/curriculum/questions";
import { PublicQuestion } from "@/types/curriculum";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { saveStoredResult } from "@/lib/demo/state";

export default function DiagnosticAssessmentPage() {
  const router = useRouter();

  // Questions State
  const [questions, setQuestions] = useState<PublicQuestion[]>(DIAGNOSTIC_QUESTIONS);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(true);

  // Assessment Runner State
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [startTime] = useState<number>(() => Date.now());
  const [isReviewMode, setIsReviewMode] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load questions from Supabase if configured
  useEffect(() => {
    async function fetchQuestions() {
      if (!isSupabaseConfigured()) {
        setIsLoadingQuestions(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("questions")
          .select("id, concept_id, prompt, difficulty, question_type, options, learning_objective")
          .order("id");

        if (error) {
          console.warn("Could not fetch questions from Supabase, using authored curriculum:", error.message);
        } else if (data && data.length > 0) {
          const mapped: PublicQuestion[] = data.map((row) => ({
            id: row.id,
            conceptId: row.concept_id,
            prompt: row.prompt,
            difficulty: row.difficulty,
            options: row.options as { id: string; text: string }[],
            learningObjective: row.learning_objective || undefined,
          }));
          setQuestions(mapped);
        }
      } catch (err) {
        console.warn("Error reading questions from database:", err);
      } finally {
        setIsLoadingQuestions(false);
      }
    }

    void fetchQuestions();
  }, []);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  // Handle option select
  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
    setErrorMessage(null);
  };

  // Navigation handlers
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsReviewMode(true);
    }
  };

  // Submit assessment to server endpoint
  const handleSubmitAssessment = async () => {
    if (answeredCount < totalQuestions) {
      setErrorMessage(
        `Please answer all ${totalQuestions} questions before submitting. (${totalQuestions - answeredCount} remaining)`
      );
      setIsReviewMode(true);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const submissionPayload = {
      answers: questions.map((q) => ({
        questionId: q.id,
        selectedOptionId: answers[q.id],
        timeSpentSeconds: Math.max(5, Math.round((Date.now() - startTime) / 1000 / totalQuestions)),
      })),
    };

    try {
      const response = await fetch("/api/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to process assessment submission.");
      }

      const data = await response.json();
      saveStoredResult(data.result);
      router.push("/student/results");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Submission failed. Please try again.";
      setErrorMessage(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfd] text-zinc-900 font-sans">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Top Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.06]">
          <Link
            href="/student"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Dashboard</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-600 bg-white px-3 py-1.5 rounded-full border border-black/[0.08] shadow-2xs">
              <Clock className="h-3.5 w-3.5 text-zinc-400" />
              <span>Self-Paced Diagnostic</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReviewMode(!isReviewMode)}
              className="text-xs"
            >
              <ListFilter className="h-3.5 w-3.5 mr-1.5" />
              <span>{isReviewMode ? "Return to Quiz" : "Review All"}</span>
            </Button>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-zinc-950 font-semibold">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span className="text-zinc-500 font-mono">
              {answeredCount} of {totalQuestions} answered
            </span>
          </div>

          <div
            className="h-2 w-full rounded-full bg-zinc-200/80 overflow-hidden"
            role="progressbar"
            aria-valuenow={currentIndex + 1}
            aria-valuemin={1}
            aria-valuemax={totalQuestions}
            aria-label={`Question ${currentIndex + 1} of ${totalQuestions}`}
          >
            <div
              className="h-full bg-black transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / Math.max(1, totalQuestions)) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question Selector Dots (Desktop & Tablet) */}
        <div className="mt-3 hidden sm:flex items-center justify-between gap-1 overflow-x-auto py-1">
          {questions.map((q, idx) => {
            const isAnswered = Boolean(answers[q.id]);
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  setCurrentIndex(idx);
                  setIsReviewMode(false);
                }}
                className={`h-7 w-7 rounded-lg text-xs font-mono font-medium transition-all flex items-center justify-center shrink-0 ${
                  isCurrent
                    ? "bg-black text-white shadow-2xs scale-105"
                    : isAnswered
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80"
                    : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                }`}
                aria-label={`Jump to question ${idx + 1}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Error message */}
        {errorMessage && (
          <div
            className="mt-6 p-4 rounded-2xl bg-rose-50 border border-rose-200/80 text-xs text-rose-900 flex items-start gap-3"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Submission Required</span>
              <p className="text-rose-800 text-[11px] mt-0.5 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Loading / Empty State */}
        {isLoadingQuestions ? (
          <Card className="mt-6 p-12 text-center bg-white border-black/[0.06] rounded-3xl">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-400 mx-auto mb-3" />
            <p className="text-xs text-neutral-500 font-medium">Loading curriculum diagnostic...</p>
          </Card>
        ) : totalQuestions === 0 ? (
          <Card className="mt-6 p-12 text-center bg-white border-black/[0.06] rounded-3xl">
            <BookOpen className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-neutral-900">Question Bank Empty</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
              No questions found for Class 7 Mathematics. Please ensure database seed migrations have been executed.
            </p>
          </Card>
        ) : isReviewMode ? (
          /* REVIEW MODE */
          <Card className="mt-6 bg-white border-black/[0.08] p-6 sm:p-8 space-y-6 shadow-[0_4px_25px_rgba(0,0,0,0.03)] rounded-3xl">
            <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-zinc-900">
                  Review Your Diagnostic Answers
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Check all {totalQuestions} questions before submitting for evaluation.
                </p>
              </div>
              <Badge variant="default" size="md">
                {answeredCount} / {totalQuestions} Answered
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {questions.map((q, idx) => {
                const answerId = answers[q.id];
                const isAnswered = Boolean(answerId);

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(idx);
                      setIsReviewMode(false);
                    }}
                    className={`p-3.5 rounded-2xl text-left border transition-all ${
                      isAnswered
                        ? "bg-zinc-50/70 border-black/[0.06] hover:border-black/[0.15]"
                        : "bg-rose-50/40 border-rose-200/80 hover:border-rose-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-mono font-semibold text-zinc-900">
                        Q{idx + 1}
                      </span>
                      {isAnswered ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" /> Answered
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600">
                          <AlertCircle className="h-3 w-3" /> Missing
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-600 line-clamp-1 font-medium">
                      {q.prompt}
                    </p>
                    <span className="text-[10px] text-zinc-400 block mt-1 capitalize">
                      {q.conceptId.replace(/-/g, " ")}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setIsReviewMode(false)}
              >
                Back to Questions
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={handleSubmitAssessment}
                disabled={isSubmitting || answeredCount < totalQuestions}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Grading with Server Engine...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Diagnostic Quiz</span>
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        ) : (
          /* QUESTION CARD */
          <Card className="mt-6 bg-white border-black/[0.08] p-6 sm:p-9 space-y-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] rounded-3xl">
            {/* Concept metadata pill */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 text-zinc-800 border border-black/[0.04] capitalize">
                Concept: {currentQuestion.conceptId.replace(/-/g, " ")}
              </span>

              <Badge
                variant={
                  currentQuestion.difficulty === "easy"
                    ? "teal"
                    : currentQuestion.difficulty === "medium"
                    ? "amber"
                    : "purple"
                }
                size="sm"
              >
                {currentQuestion.difficulty.toUpperCase()}
              </Badge>
            </div>

            {/* Question Prompt */}
            <div className="space-y-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-950 leading-snug">
                {currentQuestion.prompt}
              </h1>
            </div>

            {/* Options List */}
            <fieldset className="space-y-2.5" aria-label="Answer options">
              <legend className="sr-only">Select one option</legend>
              {currentQuestion.options.map((option) => {
                const isSelected = answers[currentQuestion.id] === option.id;

                return (
                  <label
                    key={option.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-zinc-50 border-black shadow-xs ring-1 ring-black"
                        : "bg-white border-black/[0.08] hover:bg-zinc-50 hover:border-black/20"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 pr-4">
                      <input
                        type="radio"
                        name={`question_${currentQuestion.id}`}
                        value={option.id}
                        checked={isSelected}
                        onChange={() => handleSelectOption(currentQuestion.id, option.id)}
                        className="sr-only"
                      />
                      <div
                        className={`h-7 w-7 rounded-xl flex items-center justify-center font-mono text-xs font-semibold shrink-0 transition-colors ${
                          isSelected
                            ? "bg-black text-white"
                            : "bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        {option.id.replace("opt_", "").toUpperCase()}
                      </div>
                      <span className="text-sm sm:text-base text-zinc-900 font-medium">
                        {option.text}
                      </span>
                    </div>

                    <div
                      className={`h-4 w-4 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                        isSelected
                          ? "border-black bg-black text-white"
                          : "border-black/20 bg-white"
                      }`}
                    >
                      {isSelected && (
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </div>
                  </label>
                );
              })}
            </fieldset>

            {/* Socratic Learning Focus */}
            {currentQuestion.learningObjective && (
              <div className="p-4 rounded-2xl bg-zinc-50/70 border border-black/[0.04] flex items-start gap-3">
                <HelpCircle className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <span className="font-semibold text-zinc-800 block">Learning Focus:</span>
                  <p className="text-zinc-600 leading-relaxed font-normal">
                    {currentQuestion.learningObjective}
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Controls */}
            <div className="pt-4 border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <ShieldCheck className="h-3.5 w-3.5 text-zinc-700" />
                <span>Answers scored deterministically on server</span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="flex-1 sm:flex-initial"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                  <span>Previous</span>
                </Button>

                {currentIndex === totalQuestions - 1 ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsReviewMode(true)}
                    className="flex-1 sm:flex-initial"
                  >
                    <span>Review & Submit</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleNext}
                    className="flex-1 sm:flex-initial"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
