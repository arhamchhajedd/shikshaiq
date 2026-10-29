"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Sparkles,
  School,
  ShieldAlert,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getStudentDetailForTeacher, StudentDetailPayload } from "@/lib/teacher/studentDetail";
import { InterventionModal } from "@/components/teacher/InterventionModal";
import { CONCEPTS } from "@/lib/curriculum/concepts";
import { dismissTeacherInterventionAction } from "@/lib/teacher/interventionActions";

interface StudentDetailPageProps {
  params: Promise<{ studentId: string }>;
}

export default function StudentDetailPage({ params }: StudentDetailPageProps) {
  const { studentId } = use(params);

  const [data, setData] = useState<StudentDetailPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function loadStudentDetail() {
      try {
        const res = await getStudentDetailForTeacher(studentId);
        if (!ignore) {
          if (!res.success || !res.data) {
            setError(res.error || "Failed to load student details.");
          } else {
            setData(res.data);
          }
        }
      } catch (err) {
        if (!ignore) {
          console.error("Error fetching student detail:", err);
          setError("Network or authorization error.");
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void loadStudentDetail();
    return () => {
      ignore = true;
    };
  }, [studentId]);

  const handleDismissIntervention = async (interventionId: string) => {
    if (confirm("Are you sure you want to dismiss this teacher override?")) {
      await dismissTeacherInterventionAction(interventionId);
      if (data) {
        setData({
          ...data,
          activeIntervention: null,
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff] text-neutral-900 font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/teacher/students"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-black font-medium transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Supervised Students</span>
          </Link>

          <Link
            href="/teacher"
            className="text-xs text-neutral-400 hover:text-neutral-700"
          >
            Teacher Dashboard
          </Link>
        </div>

        {isLoading ? (
          <div className="py-24 text-center text-xs text-neutral-500">
            Verifying teacher authorization and retrieving student records...
          </div>
        ) : error ? (
          /* UNAUTHORIZED OR NOT FOUND STATE */
          <Card className="p-10 text-center rounded-3xl border border-rose-200 bg-rose-50/50 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-white border border-rose-200 flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-6 h-6 text-rose-600" />
            </div>
            <h2 className="text-base font-bold text-rose-900">Access Restricted</h2>
            <p className="text-xs text-rose-700 mt-1 max-w-sm mx-auto leading-relaxed">
              {error}
            </p>
            <Link href="/teacher" className="mt-6 inline-block">
              <Button size="sm" variant="outline" className="text-xs rounded-xl border-rose-300">
                Return to Dashboard
              </Button>
            </Link>
          </Card>
        ) : data ? (
          <div>
            {/* Student Profile Header */}
            <section className="p-6 sm:p-8 rounded-3xl border border-black/10 bg-neutral-50/60 shadow-xs mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-semibold text-neutral-500 bg-white border border-black/10 px-2.5 py-0.5 rounded-full">
                    Class {data.student.gradeLevel || 7} Mathematics
                  </span>
                  {data.student.classroomName && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-700 bg-neutral-200/60 px-2 py-0.5 rounded-md">
                      <School className="w-3 h-3 text-neutral-500" />
                      {data.student.classroomName}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
                  {data.student.fullName}
                </h1>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">
                  {data.student.email}
                  {data.student.schoolName && ` • ${data.student.schoolName}`}
                </p>
              </div>

              {/* Action: Open Intervention Override Modal */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setIsInterventionModalOpen(true)}
                  className="rounded-2xl bg-black text-white hover:bg-neutral-800 text-xs px-5 py-2.5 font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Assign Pedagogical Override</span>
                </Button>
              </div>
            </section>

            {/* Active Teacher Intervention Banner (if exists) */}
            {data.activeIntervention && (
              <div className="p-5 rounded-3xl border border-amber-300/80 bg-amber-50/50 shadow-xs mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-200/80 text-[10px] font-semibold text-amber-900 tracking-wide uppercase mb-1.5">
                    <Sparkles className="w-3 h-3 text-amber-700" />
                    Active Teacher Override
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Assigned Activity: {data.activeIntervention.recommendedAction.toUpperCase()} on{" "}
                    {data.activeIntervention.conceptTitle || data.activeIntervention.targetConceptId}
                  </h3>
                  {data.activeIntervention.teacherNotes && (
                    <p className="text-xs text-neutral-600 mt-1 italic">
                      &ldquo;{data.activeIntervention.teacherNotes}&rdquo;
                    </p>
                  )}
                  <span className="text-[10px] text-neutral-400 block mt-1">
                    Assigned on {new Date(data.activeIntervention.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDismissIntervention(data.activeIntervention!.id)}
                  className="rounded-xl border-amber-300 text-xs text-amber-900 hover:bg-amber-100 self-start sm:self-auto shrink-0"
                >
                  Dismiss Override
                </Button>
              </div>
            )}

            {/* Adaptive System Recommendation Card */}
            <Card className="p-6 border border-black/10 rounded-3xl bg-white shadow-xs mb-8">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-black/5">
                <div>
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-neutral-400 block mb-0.5">
                    Deterministic Adaptive Recommendation
                  </span>
                  <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                    Next Step: {CONCEPTS[data.recommendation.recommendedConceptId]?.title || data.recommendation.recommendedConceptId}
                  </h3>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed max-w-2xl">
                    {data.recommendation.reason}
                  </p>
                </div>

                <div className="shrink-0 self-start">
                  <span
                    className={`text-[11px] font-semibold px-3 py-1 rounded-full border ${
                      data.recommendation.recommendationType === "prerequisite_remediation"
                        ? "bg-rose-50 text-rose-800 border-rose-200"
                        : data.recommendation.recommendationType === "advancement"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-neutral-100 text-neutral-800 border-black/10"
                    }`}
                  >
                    {data.recommendation.recommendationType.replace(/_/g, " ").toUpperCase()}
                  </span>
                </div>
              </div>

              {data.recommendation.prerequisiteFindings && data.recommendation.prerequisiteFindings.length > 0 && (
                <div className="pt-3 text-[11px] text-neutral-500 space-y-1">
                  <span className="font-semibold text-neutral-700 block">Prerequisite Analysis:</span>
                  {data.recommendation.prerequisiteFindings.map((f) => (
                    <div key={f.prerequisiteId} className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${f.isBlocker ? "bg-rose-500" : "bg-emerald-500"}`} />
                      <span>{f.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Concept-by-Concept Mastery Breakdown */}
            <Card className="p-6 border border-black/10 rounded-3xl bg-white shadow-xs mb-8">
              <div className="pb-4 border-b border-black/5">
                <span className="text-[10px] font-semibold tracking-wider uppercase text-neutral-400 block mb-0.5">
                  Class 7 Mathematics
                </span>
                <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                  Concept Mastery Breakdown
                </h3>
              </div>

              <div className="pt-4 divide-y divide-black/5">
                {Object.values(CONCEPTS).map((c) => {
                  const m = data.conceptMasteries[c.id];
                  const status = m?.status || "not_started";
                  const score = m?.masteryScore;
                  const evidenceCount = m?.validEvidenceCount || 0;

                  return (
                    <div key={c.id} className="py-4 first:pt-2 last:pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-lg bg-neutral-100 border border-black/5 text-xs font-mono font-bold text-neutral-700 flex items-center justify-center shrink-0 mt-0.5">
                          {c.order}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-neutral-900">{c.title}</h4>
                          <p className="text-[11px] text-neutral-500 mt-0.5 max-w-xl">
                            {c.description}
                          </p>
                          <span className="text-[10px] font-mono text-neutral-400 mt-1 block">
                            Valid Evidence: {evidenceCount} {evidenceCount === 1 ? "attempt" : "attempts"}
                            {m?.lastEvaluatedAt && ` • Evaluated: ${new Date(m.lastEvaluatedAt).toLocaleDateString()}`}
                          </span>
                        </div>
                      </div>

                      {/* Status & Score Pill */}
                      <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
                        {score !== null && score !== undefined && (
                          <span className="text-xs font-mono font-bold text-neutral-900">
                            {score.toFixed(0)}%
                          </span>
                        )}

                        {status === "mastered" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Mastered
                          </span>
                        ) : status === "partial" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            Developing (Partial)
                          </span>
                        ) : status === "needs_revision" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200/60">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            Needs Revision
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full border border-black/5">
                            <Clock className="w-3.5 h-3.5 text-neutral-400" />
                            Not Started
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Assessment & Practice Attempt History */}
            <Card className="p-6 border border-black/10 rounded-3xl bg-white shadow-xs mb-8">
              <div className="pb-4 border-b border-black/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-neutral-400 block mb-0.5">
                    Persisted Attempt Logs
                  </span>
                  <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                    Assessment &amp; Practice History ({data.recentAttempts.length})
                  </h3>
                </div>
              </div>

              {data.recentAttempts.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-500">
                  No learning attempts logged for this student yet.
                </div>
              ) : (
                <div className="overflow-x-auto pt-3">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-black/5 text-neutral-400 uppercase tracking-wider text-[10px]">
                        <th className="pb-3 font-semibold">Date &amp; Type</th>
                        <th className="pb-3 font-semibold">Concept</th>
                        <th className="pb-3 font-semibold">Question Prompt</th>
                        <th className="pb-3 font-semibold">Selected Answer</th>
                        <th className="pb-3 font-semibold text-right">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {data.recentAttempts.map((att) => (
                        <tr key={att.id} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="py-3 font-mono text-[11px] text-neutral-500">
                            <div>{new Date(att.attemptedAt).toLocaleDateString()}</div>
                            <span className="text-[10px] text-neutral-400">
                              {att.attemptType || "Diagnostic"}
                            </span>
                          </td>

                          <td className="py-3 font-medium text-neutral-900">
                            {att.conceptTitle}
                          </td>

                          <td className="py-3 text-neutral-700 max-w-xs truncate">
                            {att.prompt}
                          </td>

                          <td className="py-3 font-mono text-[11px] text-neutral-600">
                            {att.selectedOptionText}
                          </td>

                          <td className="py-3 text-right">
                            {att.isCorrect ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Correct
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
                                <XCircle className="w-3 h-3 text-rose-600" />
                                Incorrect
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* Intervention Modal */}
            <InterventionModal
              isOpen={isInterventionModalOpen}
              studentId={data.student.id}
              studentName={data.student.fullName}
              classroomId={data.student.classroomId}
              onClose={() => setIsInterventionModalOpen(false)}
              onInterventionSaved={(newIntervention) => {
                setData({
                  ...data,
                  activeIntervention: newIntervention,
                });
              }}
            />
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
