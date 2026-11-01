"use client";

import React, { useEffect, useState, useTransition } from "react";
import {
  Shield,
  Users,
  School,
  Database,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  BookOpen,
  Key,
  UserCheck,
  Ban,
  RotateCcw,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { UserProfile, AccountStatus } from "@/types/auth";
import { AdminMetrics, AuditLogEntry } from "@/types/admin";
import { ClassroomWithStudentCount } from "@/types/classroom";
import { QuestionWithAnswerKey, QuestionOption } from "@/types/curriculum";
import {
  getAdminMetrics,
  getAdminProfiles,
  getAdminAuditLogs,
  getAllClassroomsAdmin,
  getAdminCurriculumInspector,
  updateUserAccountStatusAction,
} from "@/lib/admin/adminActions";
import { TeacherApprovalQueue } from "@/components/admin/TeacherApprovalQueue";
import { AdminAuditTimeline } from "@/components/admin/AdminAuditTimeline";

type AdminTab = "teachers" | "users" | "classrooms" | "curriculum" | "audit";

export default function AdminDashboardPage() {
  const isConfigured = isSupabaseConfigured();
  const [activeTab, setActiveTab] = useState<AdminTab>("teachers");
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [classrooms, setClassrooms] = useState<ClassroomWithStudentCount[]>([]);
  const [curriculumData, setCurriculumData] = useState<{
    questions: QuestionWithAnswerKey[];
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(isConfigured);
  const [, startTransition] = useTransition();

  const refreshAdminData = async () => {
    try {
      const [m, p, l, c, q] = await Promise.all([
        getAdminMetrics(),
        getAdminProfiles(),
        getAdminAuditLogs(50),
        getAllClassroomsAdmin(),
        getAdminCurriculumInspector(),
      ]);

      setMetrics(m);
      setProfiles(p);
      setAuditLogs(l);
      setClassrooms(c);
      setCurriculumData(q);
    } catch (err) {
      console.error("Error loading admin data:", err);
    }
  };

  useEffect(() => {
    if (!isConfigured) return;
    let ignore = false;

    async function initData() {
      try {
        const [m, p, l, c, q] = await Promise.all([
          getAdminMetrics(),
          getAdminProfiles(),
          getAdminAuditLogs(50),
          getAllClassroomsAdmin(),
          getAdminCurriculumInspector(),
        ]);

        if (!ignore) {
          setMetrics(m);
          setProfiles(p);
          setAuditLogs(l);
          setClassrooms(c);
          setCurriculumData(q);
        }
      } catch (err) {
        console.error("Error loading admin data:", err);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void initData();

    return () => {
      ignore = true;
    };
  }, [isConfigured]);

  const handleStatusChange = (userId: string, newStatus: AccountStatus) => {
    const actionWord = newStatus === "suspended" ? "suspend" : "restore";
    if (confirm(`Are you sure you want to ${actionWord} this user account?`)) {
      startTransition(async () => {
        const res = await updateUserAccountStatusAction(userId, newStatus);
        if (res.success) {
          setProfiles((prev) =>
            prev.map((p) => (p.id === userId ? { ...p, accountStatus: newStatus } : p))
          );
          void refreshAdminData();
        } else {
          alert(res.error || "Failed to update account status.");
        }
      });
    }
  };

  const pendingTeachers = profiles.filter(
    (p) => p.role === "teacher" && p.accountStatus === "pending_approval"
  );

  const filteredProfiles = profiles.filter((p) => {
    const matchesSearch =
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.schoolName && p.schoolName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === "all" || p.role === roleFilter;
    const matchesStatus = statusFilter === "all" || p.accountStatus === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff] text-neutral-900 font-sans">
      <Header />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 sm:py-12">
        {/* Missing Supabase Env Alert */}
        {!isConfigured && (
          <div className="mb-8 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-3">
            <Database className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Database Connection Required</span>
              <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
                Connect Supabase credentials to manage platform-wide user accounts, vet educators, and inspect curriculum records.
              </p>
            </div>
          </div>
        )}

        {/* Top Header */}
        <section className="pb-6 border-b border-black/5 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-black/5 text-[11px] font-semibold text-neutral-800 mb-2 uppercase tracking-wide">
              <Shield className="w-3.5 h-3.5" />
              Platform Administration
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
              Admin Governance Center
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Teacher identity vetting, platform cohort oversight, protected curriculum inspection, and immutable audit logs.
            </p>
          </div>
        </section>

        {isLoading ? (
          <div className="py-24 text-center text-xs text-neutral-500">
            Loading platform governance metrics from Supabase...
          </div>
        ) : (
          <div>
            {/* PLATFORM METRICS OVERVIEW */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 mb-8">
              <Card className="p-4 border border-black/10 rounded-2xl bg-white shadow-xs">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wide block">
                  Total Users
                </span>
                <div className="text-2xl font-bold font-mono text-neutral-900 mt-0.5">
                  {metrics?.totalUsers || 0}
                </div>
                <span className="text-[10px] text-neutral-400 mt-0.5 block">
                  {metrics?.studentCount || 0} students • {metrics?.teacherCount || 0} teachers
                </span>
              </Card>

              <Card className="p-4 border border-black/10 rounded-2xl bg-white shadow-xs">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wide block">
                  Pending Approvals
                </span>
                <div className="text-2xl font-bold font-mono text-amber-600 mt-0.5">
                  {pendingTeachers.length}
                </div>
                <span className="text-[10px] text-neutral-400 mt-0.5 block">
                  Educator vetting queue
                </span>
              </Card>

              <Card className="p-4 border border-black/10 rounded-2xl bg-white shadow-xs">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wide block">
                  Classrooms
                </span>
                <div className="text-2xl font-bold font-mono text-neutral-900 mt-0.5">
                  {metrics?.totalClassrooms || 0}
                </div>
                <span className="text-[10px] text-neutral-400 mt-0.5 block">
                  Teaching cohorts
                </span>
              </Card>

              <Card className="p-4 border border-black/10 rounded-2xl bg-white shadow-xs">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wide block">
                  Attempts Logged
                </span>
                <div className="text-2xl font-bold font-mono text-neutral-900 mt-0.5">
                  {metrics?.totalAttemptsLogged || 0}
                </div>
                <span className="text-[10px] text-neutral-400 mt-0.5 block">
                  Verified answers
                </span>
              </Card>

              <Card className="p-4 border border-black/10 rounded-2xl bg-white shadow-xs">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wide block">
                  Questions Bank
                </span>
                <div className="text-2xl font-bold font-mono text-neutral-900 mt-0.5">
                  {metrics?.totalCurriculumQuestions || 25}
                </div>
                <span className="text-[10px] text-neutral-400 mt-0.5 block">
                  5 Fractions concepts
                </span>
              </Card>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex items-center gap-2 border-b border-black/5 pb-3 mb-6 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("teachers")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === "teachers"
                    ? "bg-black text-white"
                    : "bg-neutral-100 text-neutral-600 hover:text-black hover:bg-neutral-200/60"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Pending Teachers ({pendingTeachers.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("users")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === "users"
                    ? "bg-black text-white"
                    : "bg-neutral-100 text-neutral-600 hover:text-black hover:bg-neutral-200/60"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>All Accounts ({profiles.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("classrooms")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === "classrooms"
                    ? "bg-black text-white"
                    : "bg-neutral-100 text-neutral-600 hover:text-black hover:bg-neutral-200/60"
                }`}
              >
                <School className="w-3.5 h-3.5" />
                <span>Classroom Oversight ({classrooms.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("curriculum")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === "curriculum"
                    ? "bg-black text-white"
                    : "bg-neutral-100 text-neutral-600 hover:text-black hover:bg-neutral-200/60"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Curriculum &amp; Keys</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("audit")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === "audit"
                    ? "bg-black text-white"
                    : "bg-neutral-100 text-neutral-600 hover:text-black hover:bg-neutral-200/60"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Audit Trail ({auditLogs.length})</span>
              </button>
            </div>

            {/* TAB CONTENT */}

            {/* TAB 1: TEACHER APPROVAL QUEUE */}
            {activeTab === "teachers" && (
              <Card className="p-6 border border-black/10 rounded-3xl bg-white shadow-xs">
                <div className="pb-4 border-b border-black/5 mb-4">
                  <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                    Educator Access Applications
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Newly registered teachers require administrator approval before accessing classroom cohorts and learner records.
                  </p>
                </div>

                <TeacherApprovalQueue
                  pendingTeachers={pendingTeachers}
                  onActionComplete={refreshAdminData}
                />
              </Card>
            )}

            {/* TAB 2: USER MANAGEMENT */}
            {activeTab === "users" && (
              <Card className="p-6 border border-black/10 rounded-3xl bg-white shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                      Platform User Directory
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Inspect account permissions and manage active or suspended credentials.
                    </p>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative w-48">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-2.5 py-1 text-xs rounded-xl border border-black/10 bg-neutral-50 focus:outline-hidden focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="text-xs rounded-xl border border-black/10 px-2 py-1 bg-white text-neutral-800"
                    >
                      <option value="all">All Roles</option>
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="text-xs rounded-xl border border-black/10 px-2 py-1 bg-white text-neutral-800"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="pending_approval">Pending</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-black/5 text-neutral-400 uppercase tracking-wider text-[10px]">
                        <th className="pb-3 font-semibold">User</th>
                        <th className="pb-3 font-semibold">Role</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">School / Grade</th>
                        <th className="pb-3 font-semibold">Registered</th>
                        <th className="pb-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {filteredProfiles.map((p) => (
                        <tr key={p.id} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="py-3">
                            <span className="font-semibold text-neutral-900 block">{p.fullName}</span>
                            <span className="text-[11px] text-neutral-400 font-mono">{p.email}</span>
                          </td>

                          <td className="py-3">
                            <span
                              className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md border ${
                                p.role === "admin"
                                  ? "bg-purple-50 text-purple-800 border-purple-200"
                                  : p.role === "teacher"
                                  ? "bg-blue-50 text-blue-800 border-blue-200"
                                  : "bg-neutral-100 text-neutral-800 border-black/5"
                              }`}
                            >
                              {p.role}
                            </span>
                          </td>

                          <td className="py-3">
                            {p.accountStatus === "active" ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Active
                              </span>
                            ) : p.accountStatus === "pending_approval" ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                Pending
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
                                <XCircle className="w-3 h-3 text-rose-600" />
                                Suspended
                              </span>
                            )}
                          </td>

                          <td className="py-3 text-neutral-600">
                            {p.schoolName || (p.gradeLevel ? `Class ${p.gradeLevel}` : "—")}
                          </td>

                          <td className="py-3 text-[11px] font-mono text-neutral-400">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </td>

                          <td className="py-3 text-right">
                            {p.role !== "admin" && (
                              <div className="flex items-center justify-end gap-1.5">
                                {p.accountStatus === "active" ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStatusChange(p.id, "suspended")}
                                    className="rounded-lg text-[10px] border-rose-200 text-rose-700 hover:bg-rose-50 px-2 py-0.5 h-7"
                                    title="Suspend User Access"
                                  >
                                    <Ban className="w-3 h-3 mr-1" />
                                    Suspend
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStatusChange(p.id, "active")}
                                    className="rounded-lg text-[10px] border-emerald-200 text-emerald-800 hover:bg-emerald-50 px-2 py-0.5 h-7"
                                    title="Restore User Access"
                                  >
                                    <RotateCcw className="w-3 h-3 mr-1" />
                                    Restore
                                  </Button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* TAB 3: CLASSROOM OVERSIGHT */}
            {activeTab === "classrooms" && (
              <Card className="p-6 border border-black/10 rounded-3xl bg-white shadow-xs">
                <div className="pb-4 border-b border-black/5 mb-4">
                  <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                    Platform Classrooms Oversight
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Monitor all active teaching cohorts, grade levels, join codes, and student enrollments.
                  </p>
                </div>

                {classrooms.length === 0 ? (
                  <div className="py-12 text-center text-xs text-neutral-500">
                    No classroom cohorts currently active on the platform.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-black/5 text-neutral-400 uppercase tracking-wider text-[10px]">
                          <th className="pb-3 font-semibold">Classroom Name</th>
                          <th className="pb-3 font-semibold">Subject &amp; Grade</th>
                          <th className="pb-3 font-semibold">Section</th>
                          <th className="pb-3 font-semibold">Join Code</th>
                          <th className="pb-3 font-semibold">Enrolled</th>
                          <th className="pb-3 font-semibold">Created</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {classrooms.map((c) => (
                          <tr key={c.id} className="hover:bg-neutral-50/50 transition-colors">
                            <td className="py-3 font-semibold text-neutral-900">{c.name}</td>
                            <td className="py-3 text-neutral-600">
                              {c.subject} (Class {c.gradeLevel})
                            </td>
                            <td className="py-3 text-neutral-500">{c.section || "—"}</td>
                            <td className="py-3 font-mono font-bold text-neutral-900 tracking-widest">
                              <span className="px-2 py-0.5 bg-neutral-100 rounded-md border border-black/5">
                                {c.joinCode}
                              </span>
                            </td>
                            <td className="py-3 font-mono text-neutral-700">
                              {c.studentCount} {c.studentCount === 1 ? "student" : "students"}
                            </td>
                            <td className="py-3 text-[11px] font-mono text-neutral-400">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            )}

            {/* TAB 4: CURRICULUM & PROTECTED ANSWER KEYS */}
            {activeTab === "curriculum" && (
              <Card className="p-6 border border-black/10 rounded-3xl bg-white shadow-xs">
                <div className="pb-4 border-b border-black/5 mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                      Curriculum Bank &amp; Protected Answer Keys
                    </h3>
                    <span className="text-[10px] font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                      Admin Privilege Level
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Answer keys and pedagogical rationale are strictly protected server-side and only visible to authorized administrators.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  {curriculumData?.questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl bg-neutral-50/70 border border-black/5 text-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-neutral-400">
                            #{idx + 1} ({q.id})
                          </span>
                          <span className="font-semibold text-neutral-900">{q.conceptId}</span>
                        </div>
                        <span className="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded-md bg-white border border-black/10">
                          {q.difficulty}
                        </span>
                      </div>

                      <p className="font-medium text-neutral-900 mb-3">{q.prompt}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                        {q.options.map((opt: QuestionOption) => {
                          const isCorrect = opt.id === q.correctOptionId;
                          return (
                            <div
                              key={opt.id}
                              className={`p-2 rounded-xl border flex items-start gap-2 ${
                                isCorrect
                                  ? "bg-emerald-50/80 border-emerald-300 text-emerald-900 font-semibold"
                                  : "bg-white border-black/5 text-neutral-700"
                              }`}
                            >
                              <span className="font-mono uppercase font-bold text-[10px] mt-0.5">
                                {opt.id}.
                              </span>
                              <span>{opt.text}</span>
                              {isCorrect && (
                                <Key className="w-3 h-3 text-emerald-600 ml-auto shrink-0 mt-0.5" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-black/5 text-[11px] text-neutral-600">
                        <span className="font-semibold text-neutral-900">Pedagogical Rationale: </span>
                        <span>{q.explanation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* TAB 5: AUDIT LOG TIMELINE */}
            {activeTab === "audit" && (
              <Card className="p-6 border border-black/10 rounded-3xl bg-white shadow-xs">
                <div className="pb-4 border-b border-black/5 mb-4">
                  <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                    Platform Security &amp; Administrative Audit Trail
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Immutable chronological record of administrator approvals, rejections, suspensions, and teacher interventions.
                  </p>
                </div>

                <AdminAuditTimeline logs={auditLogs} />
              </Card>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
