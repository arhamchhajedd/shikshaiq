"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  Users,
  BookOpen,
  PlusCircle,
  Database,
  School,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ClassroomWithStudentCount, ClassroomStudent, Classroom } from "@/types/classroom";
import {
  getTeacherClassrooms,
  getClassroomRoster,
  removeStudentFromClassroomAction,
} from "@/lib/classroom/classroomActions";
import { ClassroomSelector } from "@/components/teacher/ClassroomSelector";
import { CreateClassroomModal } from "@/components/teacher/CreateClassroomModal";
import { MasteryMatrix } from "@/components/teacher/MasteryMatrix";
import { ClassroomInsightsCard } from "@/components/teacher/ClassroomInsightsCard";
import { StudentRosterTable } from "@/components/teacher/StudentRosterTable";
import { InterventionModal } from "@/components/teacher/InterventionModal";
import { generateClassroomAnalyticsSummary } from "@/lib/teacher/teacherAnalytics";
import { CONCEPTS } from "@/lib/curriculum/concepts";
import { ConceptMasteryRecord } from "@/lib/adaptive";

export default function TeacherCopilotPage() {
  const isConfigured = isSupabaseConfigured();
  const [classrooms, setClassrooms] = useState<ClassroomWithStudentCount[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string | null>(null);
  const [students, setStudents] = useState<ClassroomStudent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(isConfigured);
  const [isRosterLoading, setIsRosterLoading] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [interventionStudent, setInterventionStudent] = useState<{ id: string; name: string } | null>(
    null
  );
  const [, startTransition] = useTransition();

  // Load teacher classrooms on initial mount
  useEffect(() => {
    if (!isConfigured) return;

    let ignore = false;
    async function loadData() {
      try {
        const classList = await getTeacherClassrooms();
        if (!ignore) {
          setClassrooms(classList);
          if (classList.length > 0) {
            setSelectedClassroomId(classList[0].id);
          }
        }
      } catch (err) {
        console.error("Error loading teacher classrooms:", err);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void loadData();
    return () => {
      ignore = true;
    };
  }, [isConfigured]);

  // Load roster when selected classroom changes
  useEffect(() => {
    let ignore = false;

    async function loadRoster() {
      if (!selectedClassroomId) {
        if (!ignore) setStudents([]);
        return;
      }

      setIsRosterLoading(true);
      try {
        const res = await getClassroomRoster(selectedClassroomId);
        if (!ignore && res.success && res.students) {
          setStudents(res.students);
        }
      } catch (err) {
        console.error("Error loading roster:", err);
      } finally {
        if (!ignore) setIsRosterLoading(false);
      }
    }

    void loadRoster();
    return () => {
      ignore = true;
    };
  }, [selectedClassroomId]);

  const handleClassroomCreated = (newClass: Classroom) => {
    const withCount: ClassroomWithStudentCount = {
      ...newClass,
      studentCount: 0,
      activeLearnersCount: 0,
    };
    setClassrooms((prev) => [withCount, ...prev]);
    setSelectedClassroomId(newClass.id);
  };

  const handleRemoveStudent = (studentId: string) => {
    if (!selectedClassroomId) return;
    startTransition(async () => {
      const res = await removeStudentFromClassroomAction(selectedClassroomId, studentId);
      if (res.success) {
        setStudents((prev) => prev.filter((s) => s.studentId !== studentId));
        setClassrooms((prev) =>
          prev.map((c) =>
            c.id === selectedClassroomId
              ? { ...c, studentCount: Math.max(0, c.studentCount - 1) }
              : c
          )
        );
      }
    });
  };

  // Convert student masteries for classroom analytics engine
  const conceptsList = Object.values(CONCEPTS);
  const studentMasteryOverviews = students.map((s) => {
    const records: Record<string, ConceptMasteryRecord> = {};
    for (const c of conceptsList) {
      records[c.id] = {
        conceptId: c.id,
        masteryScore: s.masteredConceptsCount > 0 ? 80 : null,
        status: s.masteredConceptsCount > 0 ? "mastered" : "not_started",
        validEvidenceCount: s.masteredConceptsCount > 0 ? 3 : 0,
        lastEvaluatedAt: s.latestActivityAt || new Date().toISOString(),
      };
    }
    return {
      studentId: s.studentId,
      studentName: s.studentName,
      masteries: records,
    };
  });

  const analyticsSummary = generateClassroomAnalyticsSummary(
    conceptsList,
    studentMasteryOverviews,
    students.filter((s) => s.latestActivityAt !== null).length
  );

  const selectedClass = classrooms.find((c) => c.id === selectedClassroomId);

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff] text-neutral-900 font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Missing Supabase Env Alert */}
        {!isConfigured && (
          <div className="mb-8 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-3">
            <Database className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Supabase Connection Required</span>
              <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
                Connect your database to manage live classrooms, monitor student prerequisite heatmaps, and assign diagnostic assessments.
              </p>
            </div>
          </div>
        )}

        {/* Header Section */}
        <section className="mb-8 pb-6 border-b border-black/5 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-black/5 text-[11px] font-semibold text-neutral-800 mb-3 tracking-wide uppercase">
              Classroom Copilot
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
              Teacher Dashboard
            </h1>
            <p className="text-sm text-neutral-500 mt-1 max-w-xl">
              Real-time student learning gap monitoring, prerequisite bottleneck alerts, and pedagogical overrides.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/teacher/students">
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-black/10 text-neutral-700 hover:text-black rounded-xl px-4"
              >
                <Users className="w-3.5 h-3.5 mr-1.5" />
                All Students Directory
              </Button>
            </Link>

            <Button
              size="sm"
              className="text-xs bg-black text-white hover:bg-neutral-800 rounded-xl px-4 font-semibold"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
              New Classroom Cohort
            </Button>
          </div>
        </section>

        {isLoading ? (
          <div className="py-24 text-center text-xs text-neutral-500">
            Loading classroom data from Supabase...
          </div>
        ) : classrooms.length === 0 ? (
          /* EMPTY CLASSROOMS STATE */
          <Card className="p-10 sm:p-14 border border-black/10 rounded-3xl bg-neutral-50/50 text-center shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-white border border-black/10 flex items-center justify-center mx-auto mb-5 shadow-xs">
              <School className="w-8 h-8 text-neutral-800" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
              Create Your First Classroom Cohort
            </h2>

            <p className="text-sm text-neutral-600 max-w-lg mx-auto mt-2 leading-relaxed">
              Set up your Class 7 Mathematics section to generate a unique 6-character student join code. When learners enter your code, their diagnostic test results, prerequisite bottleneck heatmaps, and mastery matrices will appear here in real time.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="rounded-2xl bg-black text-white hover:bg-neutral-800 text-xs px-6 py-2.5 font-semibold flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4 mr-1" />
                <span>Create Classroom Cohort</span>
              </Button>

              <Link href="/student">
                <Button variant="outline" className="text-xs border-black/10 rounded-2xl px-5 py-2.5">
                  Preview Student Diagnostic Flow
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          /* ACTIVE CLASSROOM INTERFACE */
          <div>
            {/* Cohort Selector Tabs */}
            <ClassroomSelector
              classrooms={classrooms}
              selectedClassroomId={selectedClassroomId}
              onSelectClassroom={(id) => setSelectedClassroomId(id)}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
            />

            {/* Metrics Overview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
              <Card className="p-5 border border-black/10 rounded-2xl shadow-xs bg-white">
                <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                  <span>Enrolled Learners</span>
                  <Users className="w-4 h-4 text-neutral-400" />
                </div>
                <div className="text-3xl font-bold font-mono text-neutral-900">
                  {selectedClass?.studentCount || 0}
                </div>
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  Cohort size on record
                </span>
              </Card>

              <Card className="p-5 border border-black/10 rounded-2xl shadow-xs bg-white">
                <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                  <span>Assessed Students</span>
                  <TrendingUp className="w-4 h-4 text-neutral-400" />
                </div>
                <div className="text-3xl font-bold font-mono text-neutral-900">
                  {students.filter((s) => s.latestActivityAt !== null).length}
                </div>
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  With verified attempts
                </span>
              </Card>

              <Card className="p-5 border border-black/10 rounded-2xl shadow-xs bg-white">
                <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                  <span>Curriculum Scope</span>
                  <BookOpen className="w-4 h-4 text-neutral-400" />
                </div>
                <div className="text-3xl font-bold font-mono text-neutral-900">
                  5 Concepts
                </div>
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  Class 7 Fractions DAG
                </span>
              </Card>

              <Card className="p-5 border border-black/10 rounded-2xl shadow-xs bg-white">
                <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                  <span>Active Insights</span>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-3xl font-bold font-mono text-neutral-900">
                  {analyticsSummary.insights.length}
                </div>
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  Explainable alerts
                </span>
              </Card>
            </div>

            {/* Explainable Pedagogical Insights */}
            <ClassroomInsightsCard insights={analyticsSummary.insights} />

            {/* Concept Mastery Matrix */}
            <MasteryMatrix
              distributions={analyticsSummary.conceptDistributions}
              totalEnrolled={selectedClass?.studentCount || 0}
            />

            {/* Supervised Student Roster Table */}
            {isRosterLoading ? (
              <div className="py-16 text-center text-xs text-neutral-500">
                Updating classroom roster...
              </div>
            ) : students.length === 0 ? (
              /* EMPTY ROSTER FOR THIS CLASS */
              <Card className="p-8 sm:p-12 border border-black/10 rounded-3xl bg-neutral-50/50 text-center shadow-xs mb-8">
                <div className="w-12 h-12 rounded-2xl bg-white border border-black/10 flex items-center justify-center mx-auto mb-4 shadow-xs">
                  <Users className="w-6 h-6 text-neutral-700" />
                </div>
                <h3 className="text-lg font-bold tracking-tight text-neutral-900">
                  No Students Enrolled in {selectedClass?.name || "this classroom"} Yet
                </h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1 leading-relaxed">
                  Share student join code <span className="font-mono font-bold text-neutral-900 px-1.5 py-0.5 rounded-md bg-white border border-black/10">{selectedClass?.joinCode}</span> with your students so they can connect from their student dashboard.
                </p>
              </Card>
            ) : (
              <StudentRosterTable
                students={students}
                classroomId={selectedClassroomId!}
                onOpenInterventionModal={(student) => setInterventionStudent(student)}
                onRemoveStudent={handleRemoveStudent}
              />
            )}
          </div>
        )}
      </main>

      {/* Create Classroom Modal */}
      <CreateClassroomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onClassroomCreated={handleClassroomCreated}
      />

      {/* Teacher Intervention Modal */}
      {interventionStudent && (
        <InterventionModal
          isOpen={true}
          studentId={interventionStudent.id}
          studentName={interventionStudent.name}
          classroomId={selectedClassroomId || undefined}
          onClose={() => setInterventionStudent(null)}
          onInterventionSaved={() => {
            alert(`Intervention successfully assigned for ${interventionStudent.name}!`);
          }}
        />
      )}

      <Footer />
    </div>
  );
}
