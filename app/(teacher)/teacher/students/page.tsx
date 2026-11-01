"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Search, School, ArrowRight, CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getTeacherClassrooms, getClassroomRoster } from "@/lib/classroom/classroomActions";
import { ClassroomWithStudentCount, ClassroomStudent } from "@/types/classroom";
import { isSupabaseConfigured } from "@/lib/supabase/config";

interface StudentWithClassMeta extends ClassroomStudent {
  classroomName: string;
}

export default function SupervisedStudentsDirectoryPage() {
  const isConfigured = isSupabaseConfigured();
  const [classrooms, setClassrooms] = useState<ClassroomWithStudentCount[]>([]);
  const [allStudents, setAllStudents] = useState<StudentWithClassMeta[]>([]);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(isConfigured);

  useEffect(() => {
    if (!isConfigured) return;

    let ignore = false;
    async function loadAllSupervisedStudents() {
      try {
        const classList = await getTeacherClassrooms();
        if (ignore) return;
        setClassrooms(classList);

        if (classList.length === 0) {
          setIsLoading(false);
          return;
        }

        // Fetch rosters for all classrooms in parallel
        const rosters = await Promise.all(
          classList.map(async (c) => {
            const res = await getClassroomRoster(c.id);
            if (res.success && res.students) {
              return res.students.map((s) => ({
                ...s,
                classroomName: c.name,
              }));
            }
            return [];
          })
        );

        if (!ignore) {
          const flatStudents = rosters.flat();
          // Deduplicate if a student is enrolled in multiple classes
          const uniqueStudentsMap = new Map<string, StudentWithClassMeta>();
          for (const s of flatStudents) {
            if (!uniqueStudentsMap.has(s.studentId)) {
              uniqueStudentsMap.set(s.studentId, s);
            }
          }
          setAllStudents(Array.from(uniqueStudentsMap.values()));
        }
      } catch (err) {
        console.error("Error loading students directory:", err);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void loadAllSupervisedStudents();
    return () => {
      ignore = true;
    };
  }, [isConfigured]);

  const filtered = allStudents.filter((s) => {
    const matchesSearch =
      s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass =
      selectedClassFilter === "all" || s.classroomId === selectedClassFilter;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff] text-neutral-900 font-sans">
      <Header />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 sm:py-12">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/teacher"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-black font-medium transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Teacher Dashboard</span>
          </Link>
        </div>

        {/* Header Section */}
        <div className="pb-6 border-b border-black/5 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-black/5 text-[11px] font-semibold text-neutral-800 mb-2 uppercase tracking-wide">
              Learner Directory
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
              Supervised Students
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Browse learner diagnostic profiles, concept mastery matrices, and prerequisite histories across all your cohorts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-neutral-500 bg-neutral-50 px-3 py-1.5 rounded-xl border border-black/10">
              {allStudents.length} Supervised {allStudents.length === 1 ? "Learner" : "Learners"}
            </span>
          </div>
        </div>

        {/* Filters Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedClassFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                selectedClassFilter === "all"
                  ? "bg-black text-white"
                  : "bg-neutral-100 text-neutral-600 hover:text-black hover:bg-neutral-200/60"
              }`}
            >
              All Cohorts ({allStudents.length})
            </button>
            {classrooms.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedClassFilter(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0 ${
                  selectedClassFilter === c.id
                    ? "bg-black text-white"
                    : "bg-neutral-100 text-neutral-600 hover:text-black hover:bg-neutral-200/60"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by student name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-black/10 focus:outline-hidden focus:ring-2 focus:ring-black/20 text-neutral-900 bg-white"
            />
          </div>
        </div>

        {/* Roster Content */}
        {isLoading ? (
          <div className="py-20 text-center text-xs text-neutral-500">
            Loading supervised students from Supabase...
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-10 text-center rounded-3xl border border-black/10 bg-neutral-50/50">
            <Users className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-neutral-900">No Students Found</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? "No learners match your search query."
                : "No students are currently enrolled in your classrooms. Share your 6-character join code with learners to connect them."}
            </p>
          </Card>
        ) : (
          <Card className="border border-black/10 rounded-3xl p-6 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-black/5 text-neutral-400 uppercase tracking-wider text-[10px]">
                    <th className="pb-3 font-semibold">Student Name</th>
                    <th className="pb-3 font-semibold">Cohort</th>
                    <th className="pb-3 font-semibold">Latest Activity</th>
                    <th className="pb-3 font-semibold">Mastery Distribution</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {filtered.map((s) => (
                    <tr key={s.studentId} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="py-3.5">
                        <span className="font-semibold text-neutral-900 block">{s.studentName}</span>
                        <span className="text-[11px] text-neutral-400 font-mono">{s.studentEmail}</span>
                      </td>

                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1 text-[11px] text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-md border border-black/5">
                          <School className="w-3 h-3 text-neutral-500" />
                          {s.classroomName}
                        </span>
                      </td>

                      <td className="py-3.5">
                        {s.latestActivityAt ? (
                          <span className="text-[11px] text-neutral-600 font-mono">
                            {new Date(s.latestActivityAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        ) : (
                          <span className="text-[11px] text-neutral-400">No attempts yet</span>
                        )}
                      </td>

                      <td className="py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {s.masteredConceptsCount > 0 && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-medium border border-emerald-200/60">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                              {s.masteredConceptsCount} Mastered
                            </span>
                          )}
                          {s.partialCount > 0 && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-medium border border-amber-200/60">
                              <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                              {s.partialCount} Partial
                            </span>
                          )}
                          {s.needsRevisionCount > 0 && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 text-[10px] font-medium border border-rose-200/60">
                              <XCircle className="w-2.5 h-2.5 text-rose-600" />
                              {s.needsRevisionCount} Needs Rev.
                            </span>
                          )}
                          {s.notStartedCount > 0 && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-500 text-[10px] font-medium border border-black/5">
                              <Clock className="w-2.5 h-2.5 text-neutral-400" />
                              {s.notStartedCount} Not Started
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 text-right">
                        <Link href={`/teacher/students/${s.studentId}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl border-black/10 text-xs px-3.5 py-1 font-semibold flex items-center gap-1 hover:bg-neutral-50 ml-auto"
                          >
                            <span>Inspect Learning Journey</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
