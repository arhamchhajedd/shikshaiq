"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  PlayCircle,
  ArrowRight,
  Database,
  RefreshCw,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MasteryBadge } from "@/components/curriculum/MasteryBadge";
import { CONCEPTS_LIST, CONCEPTS } from "@/lib/curriculum/concepts";
import { ConceptId, MasteryStatus } from "@/types/curriculum";
import { UserProfile } from "@/types/auth";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  AdaptiveRecommendation,
  ConceptMasteryRecord,
  recommendNextAction,
} from "@/lib/adaptive";
import { getCompletedLessons } from "@/lib/curriculum/lessonActions";
import { getActiveInterventionForStudent } from "@/lib/teacher/interventionActions";
import { TeacherIntervention } from "@/types/interventions";
import { TeacherInterventionBanner } from "@/components/student/TeacherInterventionBanner";
import { JoinClassroomCard } from "@/components/student/JoinClassroomCard";
import { OfflineStatusBar } from "@/components/offline/OfflineStatusBar";
import { OfflineDownloadButton } from "@/components/offline/OfflineDownloadButton";
import { syncManager } from "@/lib/offline/syncManager";
import { Download, HardDrive, CheckCircle2, Star } from "lucide-react";
import { calculateStreak } from "@/lib/gamification/streakEngine";
import { evaluateGamification } from "@/lib/gamification/badgeEngine";
import { StreakCard } from "@/components/gamification/StreakCard";
import { StarRatingDisplay } from "@/components/gamification/StarRatingDisplay";
import { AchievementBadges } from "@/components/gamification/AchievementBadges";
import { ParentReportButton } from "@/components/share/ParentReportButton";

export default function StudentDashboardPage() {
  const isConfigured = isSupabaseConfigured();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [masteries, setMasteries] = useState<Record<ConceptId, ConceptMasteryRecord> | null>(null);
  const [recommendation, setRecommendation] = useState<AdaptiveRecommendation | null>(null);
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [attemptTimestamps, setAttemptTimestamps] = useState<string[]>([]);
  const [completedLessons, setCompletedLessons] = useState<ConceptId[]>([]);
  const [activeIntervention, setActiveIntervention] = useState<TeacherIntervention | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(isConfigured);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState<number>(0);
  const [downloadedCount, setDownloadedCount] = useState<number>(0);
  const [isDownloadingAll, setIsDownloadingAll] = useState<boolean>(false);
  const [downloadAllFeedback, setDownloadAllFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!isConfigured) return;

    let ignore = false;

    async function loadStudentData() {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error: authErr,
        } = await supabase.auth.getUser();

        if (authErr || !user || ignore) {
          if (!ignore) setIsLoading(false);
          return;
        }

        // 1. Fetch user profile
        const { data: userProfile, error: profileErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileErr && profileErr.code !== "PGRST116") {
          console.error("Error loading student profile:", profileErr);
        }

        if (userProfile && !ignore) {
          syncManager.setActiveUser(userProfile.id);
          setProfile({
            id: userProfile.id,
            email: userProfile.email,
            fullName: userProfile.full_name,
            role: userProfile.role,
            accountStatus: userProfile.account_status || "active",
            gradeLevel: userProfile.grade_level,
            schoolName: userProfile.school_name,
            avatarUrl: userProfile.avatar_url,
            createdAt: userProfile.created_at,
            updatedAt: userProfile.updated_at,
          });
        }

        // 2. Fetch student concept mastery records
        const { data: masteryRows, error: masteryErr } = await supabase
          .from("student_mastery")
          .select("*")
          .eq("student_id", user.id);

        if (masteryErr) {
          throw new Error(masteryErr.message);
        }

        // 3. Count total student attempts & fetch timestamps for streak calculation
        const { data: attemptRows, count: totalAttempts } = await supabase
          .from("student_attempts")
          .select("attempted_at", { count: "exact" })
          .eq("student_id", user.id)
          .order("attempted_at", { ascending: false });

        if (!ignore) {
          setAttemptCount(totalAttempts || 0);
          if (attemptRows) {
            setAttemptTimestamps(attemptRows.map((r) => r.attempted_at));
          }
        }

        // 4. Load completed lessons
        const completed = await getCompletedLessons();
        if (!ignore) {
          setCompletedLessons(completed);
        }

        // 5. Load active teacher intervention
        const intervention = await getActiveInterventionForStudent(user.id);
        if (!ignore) {
          setActiveIntervention(intervention);
        }

        // If user has mastery records, build the mastery map
        if (masteryRows && masteryRows.length > 0 && !ignore) {
          const masteryMap: Record<ConceptId, ConceptMasteryRecord> = {
            "fraction-basics": {
              conceptId: "fraction-basics",
              masteryScore: null,
              status: "not_started",
              validEvidenceCount: 0,
            },
            "common-multiples": {
              conceptId: "common-multiples",
              masteryScore: null,
              status: "not_started",
              validEvidenceCount: 0,
            },
            "equivalent-fractions": {
              conceptId: "equivalent-fractions",
              masteryScore: null,
              status: "not_started",
              validEvidenceCount: 0,
            },
            "adding-fractions": {
              conceptId: "adding-fractions",
              masteryScore: null,
              status: "not_started",
              validEvidenceCount: 0,
            },
            "mixed-fractions": {
              conceptId: "mixed-fractions",
              masteryScore: null,
              status: "not_started",
              validEvidenceCount: 0,
            },
          };

          for (const row of masteryRows) {
            const cId = row.concept_id as ConceptId;
            if (masteryMap[cId]) {
              masteryMap[cId] = {
                conceptId: cId,
                masteryScore: row.mastery_score !== null ? Number(row.mastery_score) : null,
                status: row.status as MasteryStatus,
                validEvidenceCount: row.valid_evidence_count,
                lastEvaluatedAt: row.last_evaluated_at,
              };
            }
          }

          setMasteries(masteryMap);
          const rec = recommendNextAction({ masteries: masteryMap });
          setRecommendation(rec);
        } else if (!ignore) {
          setMasteries(null);
          setRecommendation(null);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Error loading student learning data:", err);
          setLoadError(
            err instanceof Error ? err.message : "Failed to load learning data from Supabase."
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadStudentData();

    return () => {
      ignore = true;
    };
  }, [isConfigured, refreshCount]);

  // Load offline downloaded concepts count
  useEffect(() => {
    syncManager.getDownloadedConceptIds().then((ids) => {
      setDownloadedCount(ids.length);
    });
  }, []);

  const handleDownloadAll = async () => {
    setIsDownloadingAll(true);
    setDownloadAllFeedback(null);
    try {
      for (const c of CONCEPTS_LIST) {
        await syncManager.cacheCurriculumConcept(c.id);
      }
      const ids = await syncManager.getDownloadedConceptIds();
      setDownloadedCount(ids.length);
      setDownloadAllFeedback("All 5 concepts downloaded for offline practice!");
      setTimeout(() => setDownloadAllFeedback(null), 4000);
    } catch (err) {
      console.error("Download all concepts error:", err);
      setDownloadAllFeedback("Failed to cache all concepts.");
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const hasMasteryData = masteries !== null && Object.values(masteries).some((m) => m.status !== "not_started");

  // Calculate stats from real database mastery
  const masteredConcepts = hasMasteryData
    ? Object.values(masteries).filter((c) => c.status === "mastered")
    : [];

  const needsRevisionConcepts = hasMasteryData
    ? Object.values(masteries).filter((c) => c.status === "needs_revision")
    : [];

  const evaluatedConceptsWithScore = hasMasteryData
    ? Object.values(masteries).filter((c) => c.masteryScore !== null)
    : [];

  const overallAccuracy =
    evaluatedConceptsWithScore.length > 0
      ? Math.round(
          evaluatedConceptsWithScore.reduce((acc, c) => acc + (c.masteryScore || 0), 0) /
            evaluatedConceptsWithScore.length
        )
      : null;

  // Compute Gamification, Badges & Learning Streak
  const streakSummary = calculateStreak(attemptTimestamps);
  const gamification = evaluateGamification({
    masteries,
    attemptCount,
    currentStreak: streakSummary.currentStreak,
    longestStreak: streakSummary.longestStreak,
    completedLessons,
    overallAccuracy,
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff] text-neutral-900">
      <Header />
      <OfflineStatusBar
        userId={profile?.id}
        onSyncComplete={() => {
          setIsLoading(true);
          setRefreshCount((c) => c + 1);
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Public Overview
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsLoading(true);
              setRefreshCount((c) => c + 1);
            }}
            disabled={isLoading}
            className="text-xs flex items-center gap-1.5 border-black/10 text-neutral-700 hover:text-black"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Missing Supabase Configuration Alert */}
        {!isConfigured && (
          <div className="mb-8 p-5 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-3">
            <Database className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-sm">Supabase Credentials Required</span>
              <p className="text-amber-800 text-xs mt-1 leading-relaxed">
                To load live student records, configure{" "}
                <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
                <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in{" "}
                <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">.env.local</code> and run the migration in Supabase SQL Editor.
              </p>
            </div>
          </div>
        )}

        {/* Database Load Error Alert */}
        {loadError && (
          <div className="mb-8 p-5 rounded-2xl bg-red-50 border border-red-200/80 text-xs text-red-900 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-sm">Error Loading Learning Records</span>
              <p className="text-red-800 text-xs mt-1 leading-relaxed">{loadError}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsLoading(true);
                  setRefreshCount((c) => c + 1);
                }}
                className="mt-3 text-xs border-red-300 text-red-900 bg-white hover:bg-red-50"
              >
                Retry Request
              </Button>
            </div>
          </div>
        )}

        {/* Header Section */}
        <section className="mb-8 pb-6 border-b border-black/5 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-black/5 text-[11px] font-semibold text-neutral-800 mb-3 tracking-wide uppercase">
              Class 7 Mathematics
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
              Welcome back, {profile?.fullName || "Student"}
            </h1>
            <p className="text-sm text-neutral-500 mt-1 max-w-xl">
              Track your concept mastery across the NCERT Fractions curriculum graph. Real progress derived from validated assessments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {hasMasteryData && (
              <ParentReportButton
                studentName={profile?.fullName || "Student"}
                overallAccuracy={overallAccuracy}
                stars={gamification.totalStars}
                maxStars={gamification.maxStars}
                streak={streakSummary.currentStreak}
                masteredCount={masteredConcepts.length}
                badgesCount={gamification.unlockedBadgeCount}
                recommendedConcept={
                  recommendation
                    ? CONCEPTS[recommendation.recommendedConceptId]?.shortTitle ||
                      recommendation.recommendedConceptId
                    : "Fraction Basics"
                }
              />
            )}

            <Link href="/student/assessment">
              <Button className="bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-medium px-4 py-2.5 flex items-center gap-2 shadow-sm">
                <PlayCircle className="w-4 h-4" />
                {hasMasteryData ? "Retake Diagnostic Quiz" : "Start Diagnostic Quiz"}
              </Button>
            </Link>
          </div>
        </section>

        {/* Teacher Assigned Intervention Banner (if active) */}
        {activeIntervention && (
          <TeacherInterventionBanner intervention={activeIntervention} />
        )}

        {/* Join Classroom Card */}
        <JoinClassroomCard onEnrolled={() => setRefreshCount((c) => c + 1)} />

        {/* Loading State */}
        {isLoading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-neutral-400 mx-auto mb-3" />
            <p className="text-xs text-neutral-500 font-medium">Fetching verified records from Supabase...</p>
          </div>
        ) : !hasMasteryData ? (
          /* EMPTY STATE: New Student with No Assessments Yet */
          <div className="space-y-8">
            {/* Learning Practice Streak Banner */}
            <StreakCard streak={streakSummary} />

            <Card className="p-8 sm:p-12 border border-black/5 rounded-3xl bg-neutral-50/50 text-center shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
              <div className="w-16 h-16 rounded-2xl bg-white border border-black/10 flex items-center justify-center mx-auto mb-5 shadow-xs">
                <BookOpen className="w-8 h-8 text-neutral-800" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                No Diagnostic Assessment Completed Yet
              </h2>

              <p className="text-sm text-neutral-600 max-w-lg mx-auto mt-2 leading-relaxed">
                Take your initial 15-question Class 7 Fractions Diagnostic Assessment to measure your understanding across the concept graph and unlock your personalized adaptive learning plan.
              </p>

              <div className="my-8 max-w-md mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                <div className="p-3 bg-white rounded-2xl border border-black/5 text-xs">
                  <div className="font-semibold text-neutral-900">15 Questions</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">3 questions per concept node</div>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-black/5 text-xs">
                  <div className="font-semibold text-neutral-900">~15 Minutes</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">Self-paced diagnostic</div>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-black/5 text-xs">
                  <div className="font-semibold text-neutral-900">Prerequisite DAG</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">Pinpoints root bottlenecks</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/student/assessment">
                  <Button className="px-6 py-3 bg-black hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl shadow-sm inline-flex items-center gap-2">
                    <PlayCircle className="w-4 h-4" />
                    Begin Diagnostic Assessment
                  </Button>
                </Link>
                <Link href="/student/learn/fraction-basics">
                  <Button variant="outline" className="px-6 py-3 rounded-xl text-xs font-semibold inline-flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Start Lesson 1: Fraction Basics
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Achievement Badges Showcase */}
            <AchievementBadges
              badges={gamification.badges}
              totalStars={gamification.totalStars}
              maxStars={gamification.maxStars}
            />

            {/* Initial Concept Roster (All Not Started) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                  Class 7 Mathematics Curriculum (Fractions)
                </h3>
                <span className="text-xs text-neutral-400 font-mono">0 / 5 Evaluated</span>
              </div>

              <Card className="border border-black/5 rounded-3xl overflow-hidden shadow-xs">
                <div className="divide-y divide-black/5">
                  {CONCEPTS_LIST.map((c) => (
                    <div key={c.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-neutral-900">{c.title}</span>
                          <StarRatingDisplay stars={0} size="sm" />
                        </div>
                        <div className="text-[11px] text-neutral-500 leading-relaxed max-w-xl">
                          {c.description}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <OfflineDownloadButton
                          conceptId={c.id}
                          onCached={() =>
                            syncManager.getDownloadedConceptIds().then((ids) => setDownloadedCount(ids.length))
                          }
                        />
                        <Link href={`/student/learn/${c.id}`}>
                          <Button variant="outline" className="text-[11px] px-3 py-1 rounded-xl">
                            Learn
                          </Button>
                        </Link>
                        <Link href={`/student/practice/${c.id}`}>
                          <Button className="text-[11px] px-3 py-1 rounded-xl bg-black text-white hover:bg-neutral-800">
                            Practice
                          </Button>
                        </Link>
                        <div className="w-24 flex justify-end">
                          <MasteryBadge status="not_started" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        ) : (
          /* ACTIVE STATE: Real Supabase Mastery & Recommendations */
          <div className="space-y-8">
            {/* Learning Practice Streak Banner */}
            <StreakCard streak={streakSummary} />

            {/* Progress & Overview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              <Card className="p-5 border border-black/5 rounded-2xl shadow-xs bg-white">
                <div className="text-xs font-medium text-neutral-500 mb-1">Overall Accuracy</div>
                <div className="text-3xl font-bold font-mono text-neutral-900">
                  {overallAccuracy !== null ? `${overallAccuracy}%` : "—"}
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">Across evaluated concepts</div>
              </Card>

              <Card className="p-5 border border-black/5 rounded-2xl shadow-xs bg-white">
                <div className="text-xs font-medium text-neutral-500 mb-1">Mastered Nodes</div>
                <div className="text-3xl font-bold font-mono text-neutral-900">
                  {masteredConcepts.length} <span className="text-sm font-normal text-neutral-400">/ 5</span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">Demonstrated &ge; 80% mastery</div>
              </Card>

              <Card className="p-5 border border-black/5 rounded-2xl shadow-xs bg-white">
                <div className="text-xs font-medium text-neutral-500 mb-1">Curriculum Stars</div>
                <div className="text-3xl font-bold font-mono text-neutral-900 flex items-center gap-1.5">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span>{gamification.totalStars}</span>
                  <span className="text-sm font-normal text-neutral-400">/ {gamification.maxStars}</span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">Earned across 5 concepts</div>
              </Card>

              <Card className="p-5 border border-black/5 rounded-2xl shadow-xs bg-white">
                <div className="text-xs font-medium text-neutral-500 mb-1">Needs Revision</div>
                <div className="text-3xl font-bold font-mono text-neutral-900">
                  {needsRevisionConcepts.length}
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">Prerequisite bottlenecks</div>
              </Card>

              <Card className="p-5 border border-black/5 rounded-2xl shadow-xs bg-white">
                <div className="text-xs font-medium text-neutral-500 mb-1">Lessons Done</div>
                <div className="text-3xl font-bold font-mono text-neutral-900">
                  {completedLessons.length} <span className="text-sm font-normal text-neutral-400">/ 5</span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">Curriculum progress</div>
              </Card>

              <Card className="p-5 border border-black/5 rounded-2xl shadow-xs bg-white sm:col-span-2 lg:col-span-1">
                <div className="text-xs font-medium text-neutral-500 mb-1">Total Attempts</div>
                <div className="text-3xl font-bold font-mono text-neutral-900">
                  {attemptCount}
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">Recorded responses</div>
              </Card>
            </div>

            {/* Achievement Badges Showcase */}
            <AchievementBadges
              badges={gamification.badges}
              totalStars={gamification.totalStars}
              maxStars={gamification.maxStars}
            />

            {/* Recommended Next Activity from Adaptive Engine */}
            {recommendation && (
              <Card className="p-6 sm:p-8 border border-black/10 rounded-3xl bg-neutral-50/70 shadow-xs">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-3 max-w-2xl">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-black/10 text-[11px] font-semibold text-neutral-900 tracking-wide">
                      <Sparkles className="w-3.5 h-3.5" />
                      Adaptive Recommendation
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                      Focus Area: {CONCEPTS[recommendation.recommendedConceptId]?.shortTitle || recommendation.recommendedConceptId}
                    </h2>

                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                      {recommendation.reason}
                    </p>

                    {recommendation.prerequisiteFindings.some((f) => f.isBlocker) && (
                      <div className="pt-1 flex items-center gap-2 text-xs font-medium text-amber-900">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        <span>Prerequisite dependency blocking downstream arithmetic.</span>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    {recommendation.recommendationType === "prerequisite_remediation" ? (
                      <Link href={`/student/learn/${recommendation.recommendedConceptId}`}>
                        <Button className="px-6 py-3 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          <span>Review Prerequisite Lesson</span>
                        </Button>
                      </Link>
                    ) : recommendation.recommendationType === "advancement" ? (
                      <Link href={`/student/learn/${recommendation.recommendedConceptId}`}>
                        <Button className="px-6 py-3 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2">
                          <span>Start Next Lesson</span>
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/student/practice/${recommendation.recommendedConceptId}`}>
                        <Button className="px-6 py-3 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2">
                          <span>Start Guided Practice</span>
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Concept Mastery Breakdown Table */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                    Concept Mastery Matrix
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Evaluated against the Class 7 NCERT prerequisite directed acyclic graph
                  </p>
                </div>
              </div>

              <Card className="border border-black/5 rounded-3xl overflow-hidden shadow-xs bg-white">
                <div className="divide-y divide-black/5">
                  {CONCEPTS_LIST.map((concept) => {
                    const m = masteries[concept.id];
                    const status = m?.status || "not_started";
                    const score = m?.masteryScore;
                    const evidence = m?.validEvidenceCount || 0;
                    const isLessonDone = completedLessons.includes(concept.id);

                    return (
                      <div
                        key={concept.id}
                        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/50 transition-colors"
                      >
                        <div className="space-y-1 max-w-lg">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-neutral-900">{concept.title}</span>
                            <StarRatingDisplay
                              stars={gamification.starRatings[concept.id]?.stars || 0}
                              size="sm"
                            />
                            {concept.prerequisites.length > 0 && (
                              <span className="text-[10px] text-neutral-400 font-mono">
                                Requires {concept.prerequisites.length} prereq{concept.prerequisites.length > 1 ? "s" : ""}
                              </span>
                            )}
                            {isLessonDone && (
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                                Lesson ✓
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-neutral-500 leading-relaxed">
                            {concept.description}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 sm:gap-6 self-start sm:self-auto">
                          <div className="text-right">
                            <div className="text-xs font-mono font-bold text-neutral-900">
                              {score !== null && score !== undefined ? `${score}%` : "—"}
                            </div>
                            <div className="text-[10px] text-neutral-400 font-mono">
                              {evidence} {evidence === 1 ? "attempt" : "attempts"}
                            </div>
                          </div>

                          <div className="w-24 flex justify-end">
                            <MasteryBadge status={status} />
                          </div>

                          <div className="flex items-center gap-2 border-l border-black/5 pl-3">
                            <OfflineDownloadButton
                              conceptId={concept.id}
                              onCached={() =>
                                syncManager.getDownloadedConceptIds().then((ids) => setDownloadedCount(ids.length))
                              }
                            />
                            <Link href={`/student/learn/${concept.id}`}>
                              <Button variant="outline" className="text-[11px] px-2.5 py-1 rounded-xl">
                                Learn
                              </Button>
                            </Link>
                            <Link href={`/student/practice/${concept.id}`}>
                              <Button className="text-[11px] px-2.5 py-1 rounded-xl bg-black text-white hover:bg-neutral-800">
                                Practice
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Offline Device Storage Card */}
            <Card className="p-6 border border-black/5 rounded-3xl bg-neutral-50/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-neutral-800" />
                  <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    Offline Device Storage
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white border border-black/5 text-neutral-700">
                    {downloadedCount} / 5 Concepts Cached
                  </span>
                </div>
                <p className="text-xs text-neutral-500 max-w-xl">
                  Cache lessons and practice questions on this device to study offline in rural classrooms or during network interruptions. Offline attempts queue locally and sync automatically when reconnected.
                </p>
                {downloadAllFeedback && (
                  <div className="text-xs font-medium text-emerald-800 mt-1">
                    {downloadAllFeedback}
                  </div>
                )}
              </div>

              <Button
                onClick={handleDownloadAll}
                disabled={isDownloadingAll || downloadedCount === 5}
                variant="outline"
                className="text-xs font-medium rounded-xl shrink-0 bg-white border-black/10 hover:bg-neutral-100 flex items-center gap-2 shadow-2xs"
              >
                {isDownloadingAll ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-neutral-600" />
                    <span>Downloading Curriculum...</span>
                  </>
                ) : downloadedCount === 5 ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>All Lessons Cached</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-neutral-700" />
                    <span>Download All for Offline</span>
                  </>
                )}
              </Button>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
