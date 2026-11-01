"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  WifiOff,
  HardDrive,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CONCEPT_LESSONS } from "@/lib/curriculum/lessons";
import { CONCEPTS } from "@/lib/curriculum/concepts";
import { ConceptId } from "@/types/curriculum";
import { VisualFractionModel } from "@/components/curriculum/VisualFractionModel";
import {
  markLessonCompleted,
  getCompletedLessons,
} from "@/lib/curriculum/lessonActions";
import { SocraticTutorDrawer } from "@/components/tutor/SocraticTutorDrawer";
import { OfflineStatusBar } from "@/components/offline/OfflineStatusBar";
import { OfflineDownloadButton } from "@/components/offline/OfflineDownloadButton";
import { syncManager } from "@/lib/offline/syncManager";

interface LearnPageProps {
  params: Promise<{
    conceptId: string;
  }>;
}

export default function LearnConceptPage({ params }: LearnPageProps) {
  const resolvedParams = use(params);
  const conceptId = resolvedParams.conceptId as ConceptId;

  const lesson = CONCEPT_LESSONS[conceptId];
  const conceptMeta = CONCEPTS[conceptId];

  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isMarking, setIsMarking] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof window !== "undefined" ? syncManager.getOnlineStatus() : true
  );
  const [isLessonCached, setIsLessonCached] = useState<boolean>(false);

  useEffect(() => {
    let ignore = false;
    async function checkStatus() {
      try {
        const completed = await getCompletedLessons();
        if (!ignore && completed.includes(conceptId)) {
          setIsCompleted(true);
        }
      } catch {
        // Ignore background load error
      }
    }
    checkStatus();

    syncManager.isConceptCachedLocally(conceptId).then((cached) => {
      if (!ignore) setIsLessonCached(cached);
    });

    const unsub = syncManager.subscribe((st) => {
      setIsOnline(st.isOnline);
    });

    return () => {
      ignore = true;
      unsub();
    };
  }, [conceptId]);

  if (!lesson || !conceptMeta) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Concept Not Found
          </h1>
          <p className="text-sm text-neutral-600">
            The requested concept identifier is not part of the NCERT Class 7 Fractions curriculum.
          </p>
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

  // If offline and the concept was not previously cached to this device
  if (!isOnline && !isLessonCached) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between">
        <Header />
        <OfflineStatusBar />
        <main className="max-w-2xl mx-auto px-4 py-20 text-center space-y-5">
          <div className="w-12 h-12 rounded-full bg-neutral-100 border border-black/10 flex items-center justify-center mx-auto text-neutral-800">
            <WifiOff className="w-6 h-6 text-neutral-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Lesson Unavailable Offline
            </h1>
            <p className="text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
              &quot;{conceptMeta.title}&quot; has not been downloaded for offline study on this device. Reconnect to the internet to access it, or open previously downloaded lessons.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link href="/student">
              <Button className="bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold px-5 py-2.5">
                Back to Student Dashboard
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleMarkComplete = async () => {
    if (isCompleted || isMarking) return;
    if (!isOnline) {
      setFeedbackMessage("You are currently offline. Lesson completion recording requires an active connection to save to Supabase.");
      return;
    }
    setIsMarking(true);
    setFeedbackMessage(null);

    const res = await markLessonCompleted(conceptId);
    setIsMarking(false);

    if (res.success) {
      setIsCompleted(true);
      setFeedbackMessage("Lesson progress recorded! Ready for guided practice.");
    } else {
      setFeedbackMessage(res.error || "Unable to save progress. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between selection:bg-neutral-900 selection:text-white">
      <Header />
      <OfflineStatusBar />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 sm:py-12 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/student"
            className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Student Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-neutral-400">Class 7 Mathematics</span>
            <span className="text-neutral-300">•</span>
            <span className="text-[11px] font-semibold text-neutral-700">NCERT Chapter 2</span>
          </div>
        </div>

        {/* Lesson Header Banner */}
        <div className="space-y-4 border-b border-black/10 pb-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 text-[11px] font-semibold tracking-wide uppercase">
                Micro-Lesson
              </span>
              {!isOnline && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 border border-black/10 text-[11px] font-semibold">
                  <HardDrive className="w-3.5 h-3.5 text-neutral-600" />
                  Offline Mode • Device Cache
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-black/10 text-neutral-600 text-[11px] font-mono">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                ~{lesson.estimatedMinutes} min read
              </span>
              {isCompleted && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Lesson Completed
                </span>
              )}
            </div>

            <OfflineDownloadButton
              conceptId={conceptId}
              onCached={() => setIsLessonCached(true)}
            />
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-neutral-900">
            {lesson.title}
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-3xl">
            {lesson.summary}
          </p>

          <div className="p-4 rounded-2xl bg-neutral-50/80 border border-black/5 flex items-start gap-3">
            <Lightbulb className="w-4 h-4 text-neutral-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                Learning Objective
              </div>
              <div className="text-xs text-neutral-600 leading-relaxed">
                {lesson.learningObjective}
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Introduction */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold tracking-tight text-neutral-900">
            1. Understanding the Concept
          </h2>
          <Card className="p-6 border border-black/5 rounded-3xl bg-white shadow-xs">
            <p className="text-sm text-neutral-700 leading-relaxed">
              {lesson.introduction}
            </p>
          </Card>
        </section>

        {/* Section 2: Visual Representation Model */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold tracking-tight text-neutral-900">
            2. Visual Model
          </h2>
          <VisualFractionModel model={lesson.visualRepresentation} />
        </section>

        {/* Section 3: Key Mathematical Rules */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold tracking-tight text-neutral-900">
            3. Key Rules & Principles
          </h2>
          <Card className="p-6 border border-black/5 rounded-3xl bg-white shadow-xs">
            <ul className="space-y-3">
              {lesson.keyRules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-neutral-700 leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-neutral-100 border border-black/10 text-neutral-900 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        {/* Section 4: Worked Examples */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold tracking-tight text-neutral-900">
            4. Step-by-Step Worked Examples
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {lesson.workedExamples.map((ex, exIdx) => (
              <Card key={ex.id} className="p-6 border border-black/5 rounded-3xl bg-white shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-black text-white text-[10px] font-mono font-bold uppercase">
                    Example {exIdx + 1}
                  </span>
                </div>

                <div className="text-xs sm:text-sm font-semibold text-neutral-900">
                  {ex.problem}
                </div>

                <div className="space-y-2 pt-1 border-t border-black/5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    Step-by-Step Solution:
                  </div>
                  <div className="space-y-2">
                    {ex.steps.map((step, sIdx) => (
                      <div key={sIdx} className="p-3 rounded-xl bg-neutral-50/70 border border-black/5 text-xs text-neutral-700 font-mono leading-relaxed">
                        {step}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-100/70 border border-black/10 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
                  <div className="text-xs font-semibold text-neutral-900">
                    Final Answer: <span className="font-normal text-neutral-700">{ex.solution}</span>
                  </div>
                </div>

                {ex.tip && (
                  <div className="text-[11px] text-neutral-500 italic pl-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Pro Tip: {ex.tip}</span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* Section 5: Common Mistakes */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold tracking-tight text-neutral-900">
            5. Common Mistakes & Pitfalls
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lesson.commonMistakes.map((mistake) => (
              <Card key={mistake.id} className="p-5 border border-black/5 rounded-3xl bg-neutral-50/50 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wide">Common Misconception</span>
                </div>

                <div className="text-xs font-semibold text-neutral-900 line-through decoration-rose-500">
                  {mistake.misconception}
                </div>

                <div className="p-3 rounded-xl bg-white border border-black/5 space-y-1">
                  <div className="text-[11px] font-bold text-neutral-900 flex items-center gap-1">
                    <span className="text-emerald-600 font-bold">✓</span> Correct Way:
                  </div>
                  <div className="text-xs text-neutral-700 leading-relaxed">
                    {mistake.correction}
                  </div>
                </div>

                <p className="text-[11px] text-neutral-500 leading-relaxed italic">
                  Why: {mistake.explanation}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Bottom Action Footer Card */}
        <Card className="p-6 sm:p-8 border border-black/10 rounded-3xl bg-neutral-900 text-white shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[11px] font-mono text-neutral-300">
                <BookOpen className="w-3.5 h-3.5" />
                Lesson Conclusion
              </div>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                Ready to put this into practice?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Complete this lesson to log your curriculum progress, then test your understanding with adaptive practice questions.
              </p>
              {feedbackMessage && (
                <div className="text-xs font-medium text-emerald-300 pt-1">
                  {feedbackMessage}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto shrink-0">
              <Button
                onClick={handleMarkComplete}
                disabled={isCompleted || isMarking || !isOnline}
                variant="outline"
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isCompleted
                    ? "bg-white/10 text-neutral-300 border-white/20 cursor-default"
                    : !isOnline
                    ? "bg-white/5 text-neutral-400 border-white/10 cursor-not-allowed"
                    : "bg-white/5 hover:bg-white/10 text-white border-white/20"
                }`}
              >
                {isMarking
                  ? "Saving..."
                  : isCompleted
                  ? "Lesson Completed ✓"
                  : !isOnline
                  ? "Offline (Connect to save)"
                  : "Mark as Completed"}
              </Button>

              <Link href={`/student/practice/${conceptId}`}>
                <Button className="w-full sm:w-auto px-6 py-2.5 bg-white text-black hover:bg-neutral-100 rounded-xl text-xs font-semibold shadow-sm flex items-center justify-center gap-2">
                  <span>Start Practice</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </main>

      <SocraticTutorDrawer conceptId={conceptId} contextType="learn" />

      <Footer />
    </div>
  );
}
