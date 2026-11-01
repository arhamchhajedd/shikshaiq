"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sparkles,
  RefreshCw,
  Award,
  BookOpen,
  HelpCircle,
  AlertCircle,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MasteryBadge } from "@/components/curriculum/MasteryBadge";
import { StarRatingDisplay } from "@/components/gamification/StarRatingDisplay";
import { CONCEPTS } from "@/lib/curriculum/concepts";
import { ALL_QUESTIONS } from "@/lib/curriculum/questions";
import { ConceptId, PublicQuestion } from "@/types/curriculum";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  AdaptiveRecommendation,
  ConceptMasteryRecord,
} from "@/lib/adaptive";
import { SocraticTutorDrawer } from "@/components/tutor/SocraticTutorDrawer";
import { OfflineStatusBar } from "@/components/offline/OfflineStatusBar";
import { OfflineDownloadButton } from "@/components/offline/OfflineDownloadButton";
import { syncManager } from "@/lib/offline/syncManager";
import { CloudOff } from "lucide-react";

interface PracticePageProps {
  params: Promise<{
    conceptId: string;
  }>;
}

interface QuestionFeedback {
  isCorrect?: boolean;
  correctOptionId?: string;
  explanation?: string;
  isQueuedOffline?: boolean;
}

export default function PracticeConceptPage({ params }: PracticePageProps) {
  const resolvedParams = use(params);
  const conceptId = resolvedParams.conceptId as ConceptId;
  const conceptMeta = CONCEPTS[conceptId];

  // State
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<Record<string, QuestionFeedback>>({});
  const [sessionAnswers, setSessionAnswers] = useState<Record<string, { selected: string; isCorrect: boolean }>>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [updatedMastery, setUpdatedMastery] = useState<ConceptMasteryRecord | null>(null);
  const [recommendation, setRecommendation] = useState<AdaptiveRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sessionId] = useState<string>(() => `practice_${conceptId}_${Date.now()}`);
  const [studentUserId, setStudentUserId] = useState<string>("anonymous_offline_student");
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof window !== "undefined" ? syncManager.getOnlineStatus() : true
  );

  // Monitor online status & current authenticated user
  useEffect(() => {
    const unsub = syncManager.subscribe((st) => {
      setIsOnline(st.isOnline);
    });

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user?.id) {
          setStudentUserId(data.user.id);
          syncManager.setActiveUser(data.user.id);
        }
      });
    }

    return unsub;
  }, []);

  // Load questions for concept: checks local IndexedDB first when offline, or Supabase when online
  useEffect(() => {
    let ignore = false;

    async function loadQuestions() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        // If offline, check local IndexedDB first
        if (!syncManager.getOnlineStatus()) {
          const cached = await syncManager.getCachedQuestions(conceptId);
          if (!ignore && cached && cached.length > 0) {
            setQuestions(cached);
            setIsLoading(false);
            return;
          }
        }

        if (isSupabaseConfigured()) {
          const supabase = createClient();
          const { data: dbQuestions, error } = await supabase
            .from("questions")
            .select("id, concept_id, prompt, difficulty, question_type, options, learning_objective")
            .eq("concept_id", conceptId);

          if (!ignore) {
            if (!error && dbQuestions && dbQuestions.length > 0) {
              const formatted: PublicQuestion[] = dbQuestions.map((q) => ({
                id: q.id,
                conceptId: q.concept_id as ConceptId,
                prompt: q.prompt,
                difficulty: q.difficulty as "easy" | "medium" | "hard",
                options: q.options as Array<{ id: string; text: string }>,
                learningObjective: q.learning_objective || "",
              }));
              setQuestions(formatted);
              setIsLoading(false);
              return;
            }
          }
        }

        // Try local cache before fallback
        const localCached = await syncManager.getCachedQuestions(conceptId);
        if (!ignore && localCached && localCached.length > 0) {
          setQuestions(localCached);
          setIsLoading(false);
          return;
        }

        // Fallback to static verified curriculum questions for this concept
        const fallback = ALL_QUESTIONS.filter((q) => q.conceptId === conceptId);
        if (!ignore) {
          setQuestions(fallback);
          setIsLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Error loading questions:", err);
          const fallback = ALL_QUESTIONS.filter((q) => q.conceptId === conceptId);
          setQuestions(fallback);
          setIsLoading(false);
        }
      }
    }

    loadQuestions();
    return () => {
      ignore = true;
    };
  }, [conceptId]);

  if (!conceptMeta) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Concept Not Found</h1>
          <p className="text-sm text-neutral-600">This concept is not in the curriculum.</p>
          <Link href="/student">
            <Button className="bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold px-5 py-2.5">
              Return to Student Dashboard
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const hasFeedbackForCurrent = currentQuestion && !!submissionFeedback[currentQuestion.id];
  const currentFeedback = currentQuestion ? submissionFeedback[currentQuestion.id] : null;

  const handleSelectOption = (optionId: string) => {
    if (hasFeedbackForCurrent || isSubmitting) return;
    setSelectedOptionId(optionId);
  };

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !selectedOptionId || isSubmitting || hasFeedbackForCurrent) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    // If offline: queue locally into IndexedDB with client idempotency key
    if (!isOnline) {
      try {
        await syncManager.queueAttempt({
          questionId: currentQuestion.id,
          conceptId,
          selectedOptionId,
          userId: studentUserId,
          contentVersion: 1,
        });

        const offlineFeedback: QuestionFeedback = {
          isQueuedOffline: true,
          explanation:
            "Your answer has been saved securely to this device. When you reconnect to the internet, ShikshaIQ will validate your submission against the answer key and update your concept mastery.",
        };

        setSubmissionFeedback((prev) => ({ ...prev, [currentQuestion.id]: offlineFeedback }));
        setSessionAnswers((prev) => ({
          ...prev,
          [currentQuestion.id]: { selected: selectedOptionId, isCorrect: false },
        }));
        setIsSubmitting(false);
        return;
      } catch (queueErr) {
        console.error("Queue attempt error:", queueErr);
        setErrorMessage("Failed to queue attempt locally. Please check storage permissions.");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const response = await fetch("/api/practice/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          selectedOptionId,
          conceptId,
          sessionId,
          attemptType: "practice",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.error || "Failed to validate answer. Please try again.");
        setIsSubmitting(false);
        return;
      }

      const feedback: QuestionFeedback = {
        isCorrect: data.isCorrect,
        correctOptionId: data.correctOptionId,
        explanation: data.explanation,
      };

      setSubmissionFeedback((prev) => ({ ...prev, [currentQuestion.id]: feedback }));
      setSessionAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: { selected: selectedOptionId, isCorrect: data.isCorrect },
      }));

      if (data.updatedMastery) {
        setUpdatedMastery(data.updatedMastery);
      }
      if (data.recommendation) {
        setRecommendation(data.recommendation);
      }

      setIsSubmitting(false);
    } catch (err: unknown) {
      // Network interruption detected during submission -> fallback to offline queue
      try {
        await syncManager.queueAttempt({
          questionId: currentQuestion.id,
          conceptId,
          selectedOptionId,
          userId: studentUserId,
          contentVersion: 1,
        });

        const offlineFeedback: QuestionFeedback = {
          isQueuedOffline: true,
          explanation:
            "Network connection was interrupted. Your answer has been saved to your offline queue and will sync automatically upon reconnection.",
        };

        setSubmissionFeedback((prev) => ({ ...prev, [currentQuestion.id]: offlineFeedback }));
        setSessionAnswers((prev) => ({
          ...prev,
          [currentQuestion.id]: { selected: selectedOptionId, isCorrect: false },
        }));
      } catch {
        const msg = err instanceof Error ? err.message : "Network error. Please try again.";
        setErrorMessage(msg);
      }
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
    } else {
      setIsCompleted(true);
    }
  };

  const totalAnswered = Object.keys(sessionAnswers).length;
  const correctCount = Object.values(sessionAnswers).filter((a) => a.isCorrect).length;

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between selection:bg-neutral-900 selection:text-white">
      <Header />
      <OfflineStatusBar userId={studentUserId} />

      <main className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href={`/student/learn/${conceptId}`}
            className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Review Lesson</span>
          </Link>

          <div className="flex items-center gap-3">
            <OfflineDownloadButton conceptId={conceptId} />
            <span className="text-xs font-bold text-neutral-900">{conceptMeta.shortTitle}</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600">
              Guided Practice
            </span>
          </div>
        </div>

        {/* LOADING STATE */}
        {isLoading && (
          <Card className="p-12 text-center border border-black/5 rounded-3xl bg-neutral-50/50">
            <RefreshCw className="w-6 h-6 animate-spin text-neutral-400 mx-auto mb-3" />
            <div className="text-sm font-semibold text-neutral-700">
              Loading practice questions from Supabase...
            </div>
            <div className="text-xs text-neutral-400 mt-1">Filtering by {conceptMeta.title}</div>
          </Card>
        )}

        {/* EMPTY STATE */}
        {!isLoading && questions.length === 0 && (
          <Card className="p-12 text-center border border-black/5 rounded-3xl bg-neutral-50/50 space-y-4">
            <HelpCircle className="w-8 h-8 text-neutral-400 mx-auto" />
            <h2 className="text-base font-bold text-neutral-900">No Questions Found</h2>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              There are currently no practice questions registered for this concept in the database.
            </p>
            <Link href="/student">
              <Button className="bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold px-5 py-2.5">
                Back to Dashboard
              </Button>
            </Link>
          </Card>
        )}

        {/* ACTIVE PRACTICE SESSION */}
        {!isLoading && questions.length > 0 && !isCompleted && currentQuestion && (
          <div className="space-y-6">
            {/* Progress Header */}
            <div className="flex items-center justify-between text-xs text-neutral-500 font-mono">
              <span>
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="capitalize px-2 py-0.5 rounded bg-neutral-100 text-[10px] font-semibold text-neutral-700">
                Difficulty: {currentQuestion.difficulty}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-black transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question Card */}
            <Card className="p-6 sm:p-8 border border-black/10 rounded-3xl bg-white shadow-xs space-y-6">
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Problem Prompt
                </div>
                <h2 className="text-base sm:text-lg font-semibold text-neutral-900 leading-snug">
                  {currentQuestion.prompt}
                </h2>
              </div>

              {/* Options List */}
              <div className="space-y-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedOptionId === option.id;
                  const isCorrect = currentFeedback?.correctOptionId === option.id;
                  const isWrongSelected = hasFeedbackForCurrent && isSelected && !currentFeedback?.isCorrect && !currentFeedback?.isQueuedOffline;

                  let optionStyle = "border-black/10 bg-white hover:bg-neutral-50 text-neutral-900";

                  if (hasFeedbackForCurrent) {
                    if (currentFeedback?.isQueuedOffline) {
                      if (isSelected) {
                        optionStyle = "border-black bg-neutral-900 text-white font-medium ring-1 ring-black";
                      } else {
                        optionStyle = "border-black/5 bg-neutral-50/50 text-neutral-400";
                      }
                    } else if (isCorrect) {
                      optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-emerald-500";
                    } else if (isWrongSelected) {
                      optionStyle = "border-rose-400 bg-rose-50 text-rose-900 line-through ring-1 ring-rose-400";
                    } else {
                      optionStyle = "border-black/5 bg-neutral-50/50 text-neutral-400";
                    }
                  } else if (isSelected) {
                    optionStyle = "border-black bg-black text-white font-semibold ring-2 ring-black ring-offset-1";
                  }

                  return (
                    <button
                      key={option.id}
                      type="button"
                      id={`practice-option-${option.id}`}
                      onClick={() => handleSelectOption(option.id)}
                      disabled={hasFeedbackForCurrent || isSubmitting}
                      className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-3 cursor-pointer disabled:cursor-default ${optionStyle}`}
                    >
                      <span>{option.text}</span>
                      {hasFeedbackForCurrent && !currentFeedback?.isQueuedOffline && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {hasFeedbackForCurrent && !currentFeedback?.isQueuedOffline && isWrongSelected && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      {hasFeedbackForCurrent && currentFeedback?.isQueuedOffline && isSelected && (
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/20 text-white font-semibold">
                          Queued
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Immediate Server-Side Feedback or Offline Queue Notice */}
              {hasFeedbackForCurrent && currentFeedback && (
                <div
                  className={`p-5 rounded-2xl border space-y-2 transition-all ${
                    currentFeedback.isQueuedOffline
                      ? "bg-neutral-50 border-black/10 text-neutral-900"
                      : currentFeedback.isCorrect
                      ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                      : "bg-amber-50/80 border-amber-200 text-amber-950"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {currentFeedback.isQueuedOffline ? (
                      <>
                        <CloudOff className="w-4 h-4 text-neutral-700" />
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                          Attempt Queued Locally (Offline)
                        </span>
                      </>
                    ) : currentFeedback.isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                          Correct Solution!
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                          Not Quite Right
                        </span>
                      </>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm leading-relaxed text-neutral-800">
                    <span className="font-semibold">
                      {currentFeedback.isQueuedOffline ? "Sync Status: " : "Pedagogical Explanation: "}
                    </span>
                    {currentFeedback.explanation}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between">
                <div className="text-[11px] text-neutral-400 font-mono">
                  {selectedOptionId && !hasFeedbackForCurrent
                    ? isOnline
                      ? "Option selected. Ready to verify."
                      : "Option selected. Ready to queue offline."
                    : hasFeedbackForCurrent
                    ? currentFeedback?.isQueuedOffline
                      ? "Queued in local storage."
                      : "Answer submitted to Supabase."
                    : "Select an option to proceed."}
                </div>

                {!hasFeedbackForCurrent ? (
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={!selectedOptionId || isSubmitting}
                    className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold shadow-sm disabled:opacity-40"
                  >
                    {isSubmitting
                      ? "Saving Attempt..."
                      : isOnline
                      ? "Submit Answer"
                      : "Queue Answer Offline"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5"
                  >
                    <span>{currentIndex < questions.length - 1 ? "Next Question" : "Complete Practice"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* COMPLETION SUMMARY STATE */}
        {!isLoading && isCompleted && (() => {
          const queuedOfflineCount = Object.values(submissionFeedback).filter((f) => f.isQueuedOffline).length;
          const isEntirelyOffline = queuedOfflineCount > 0;

          if (isEntirelyOffline) {
            return (
              <Card className="p-8 sm:p-10 border border-black/10 rounded-3xl bg-white shadow-md space-y-8 text-center">
                <div className="w-14 h-14 rounded-full bg-neutral-100 border border-black/10 flex items-center justify-center mx-auto text-neutral-900">
                  <CloudOff className="w-7 h-7 text-neutral-800" />
                </div>

                <div className="space-y-2 max-w-lg mx-auto">
                  <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                    Offline Practice Completed
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    Your answers were saved securely to local storage with client idempotency keys. All attempts are clearly marked as <strong>Pending Sync</strong>.
                  </p>
                </div>

                {/* Offline Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
                  <div className="p-4 rounded-2xl bg-neutral-50 border border-black/5 text-center">
                    <div className="text-[10px] font-mono text-neutral-400 uppercase">Attempts Saved</div>
                    <div className="text-xl font-bold font-mono text-neutral-900">
                      {queuedOfflineCount} / {totalAnswered}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-50 border border-black/5 text-center">
                    <div className="text-[10px] font-mono text-neutral-400 uppercase">Sync State</div>
                    <div className="text-xs font-bold font-mono text-amber-700 bg-amber-50 border border-amber-200/80 rounded-lg px-2 py-1 mt-1 inline-block">
                      Pending Sync
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-50 border border-black/5 text-center">
                    <div className="text-[10px] font-mono text-neutral-400 uppercase">Mastery State</div>
                    <div className="text-xs font-semibold text-neutral-600 bg-neutral-100 rounded-lg px-2 py-1 mt-1 inline-block">
                      Awaiting Server
                    </div>
                  </div>
                </div>

                {/* Honest Explanatory Box */}
                <div className="p-4 rounded-2xl bg-neutral-50 border border-black/5 text-left max-w-lg mx-auto text-xs text-neutral-600 space-y-1">
                  <div className="font-semibold text-neutral-900">Authoritative Server Rule:</div>
                  <p className="leading-relaxed">
                    ShikshaIQ never alters mastery matrices on the client without server validation. Reconnect to the internet and your offline attempts will sync automatically to Supabase with zero duplicate submissions.
                  </p>
                </div>

                {/* Navigation Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Link href="/student" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold">
                      Student Dashboard
                    </Button>
                  </Link>

                  <Link href={`/student/learn/${conceptId}`} className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Review Lesson</span>
                    </Button>
                  </Link>

                  {isOnline && (
                    <Button
                      onClick={async () => {
                        try {
                          await syncManager.syncPendingAttempts(studentUserId);
                        } catch (err) {
                          console.error("Manual sync error:", err);
                        }
                      }}
                      className="w-full sm:w-auto px-6 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Sync Attempts Now</span>
                    </Button>
                  )}
                </div>
              </Card>
            );
          }

          return (
            <Card className="p-8 sm:p-10 border border-black/10 rounded-3xl bg-white shadow-md space-y-8 text-center">
              <div className="w-14 h-14 rounded-full bg-neutral-100 border border-black/10 flex items-center justify-center mx-auto text-neutral-900">
                <Award className="w-7 h-7" />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                  Practice Session Completed
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  Great effort! All your responses were recorded to Supabase and your mastery matrix was updated.
                </p>
              </div>

              {/* Score Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md mx-auto">
                <div className="p-4 rounded-2xl bg-neutral-50 border border-black/5 text-center">
                  <div className="text-[10px] font-mono text-neutral-400 uppercase">Correct</div>
                  <div className="text-xl font-bold font-mono text-neutral-900">
                    {correctCount} / {totalAnswered}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 border border-black/5 text-center">
                  <div className="text-[10px] font-mono text-neutral-400 uppercase">Accuracy</div>
                  <div className="text-xl font-bold font-mono text-neutral-900">
                    {totalAnswered > 0 ? `${Math.round((correctCount / totalAnswered) * 100)}%` : "0%"}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 border border-black/5 text-center col-span-2 sm:col-span-1">
                  <div className="text-[10px] font-mono text-neutral-400 uppercase">Mastery State</div>
                  <div className="pt-1 flex flex-col items-center gap-1.5 justify-center">
                    <MasteryBadge status={updatedMastery?.status || "partial"} />
                    <StarRatingDisplay
                      stars={
                        totalAnswered > 0
                          ? correctCount / totalAnswered >= 0.8
                            ? 3
                            : correctCount / totalAnswered >= 0.5
                            ? 2
                            : 1
                          : 0
                      }
                      size="sm"
                    />
                  </div>
                </div>
              </div>

              {/* Adaptive Recommendation Card */}
              {recommendation && (
                <div className="p-6 rounded-2xl bg-neutral-50 border border-black/10 text-left space-y-3 max-w-xl mx-auto">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-black/10 text-[10px] font-bold text-neutral-900 tracking-wide">
                    <Sparkles className="w-3 h-3" />
                    Next Recommendation
                  </div>
                  <div className="text-sm font-bold text-neutral-900">
                    {CONCEPTS[recommendation.recommendedConceptId]?.title || recommendation.recommendedConceptId}
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {recommendation.reason}
                  </p>
                </div>
              )}

              {/* Navigation Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <Link href="/student" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold">
                    Dashboard
                  </Button>
                </Link>

                <Link href={`/student/learn/${conceptId}`} className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Review Lesson</span>
                  </Button>
                </Link>

                {recommendation && recommendation.recommendedConceptId !== conceptId && (
                  <Link
                    href={`/student/learn/${recommendation.recommendedConceptId}`}
                    className="w-full sm:w-auto"
                  >
                    <Button className="w-full sm:w-auto px-6 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                      <span>Next: {CONCEPTS[recommendation.recommendedConceptId]?.shortTitle}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          );
        })()}
      </main>

      <SocraticTutorDrawer
        conceptId={conceptId}
        contextType="practice"
        currentQuestionId={currentQuestion?.id}
      />

      <Footer />
    </div>
  );
}
