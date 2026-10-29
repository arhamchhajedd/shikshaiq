"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { UserProfile, AccountStatus } from "@/types/auth";
import { AdminMetrics, AuditLogEntry, UserManagementFilter } from "@/types/admin";
import { ClassroomWithStudentCount } from "@/types/classroom";
import { QuestionWithAnswerKey } from "@/types/curriculum";
import { CONCEPTS } from "@/lib/curriculum/concepts";
import { ALL_QUESTIONS } from "@/lib/curriculum/questions";
import { ANSWER_KEYS } from "@/lib/curriculum/answerKeys.server";

/**
 * Internal helper to verify caller has active 'admin' role.
 */
async function verifyAdminCaller() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, account_status, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin" || profile.account_status !== "active") {
    throw new Error("Access restricted to active platform administrators.");
  }

  return { supabase, adminUser: user, adminProfile: profile };
}

/**
 * Server Action: Get real platform metrics from Supabase.
 */
export async function getAdminMetrics(): Promise<AdminMetrics> {
  if (!isSupabaseConfigured()) {
    return {
      totalUsers: 0,
      studentCount: 0,
      teacherCount: 0,
      adminCount: 0,
      pendingTeacherApprovals: 0,
      totalClassrooms: 0,
      totalAttemptsLogged: 0,
      totalCurriculumQuestions: ALL_QUESTIONS.length,
    };
  }

  try {
    const { supabase } = await verifyAdminCaller();

    const { data: profiles } = await supabase.from("profiles").select("role, account_status");

    let studentCount = 0;
    let teacherCount = 0;
    let adminCount = 0;
    let pendingTeacherApprovals = 0;

    if (profiles) {
      for (const p of profiles) {
        if (p.role === "student") studentCount++;
        if (p.role === "teacher") {
          teacherCount++;
          if (p.account_status === "pending_approval") pendingTeacherApprovals++;
        }
        if (p.role === "admin") adminCount++;
      }
    }

    const { count: classroomCount } = await supabase
      .from("classrooms")
      .select("*", { count: "exact", head: true });

    const { count: attemptCount } = await supabase
      .from("student_attempts")
      .select("*", { count: "exact", head: true });

    return {
      totalUsers: profiles?.length || 0,
      studentCount,
      teacherCount,
      adminCount,
      pendingTeacherApprovals,
      totalClassrooms: classroomCount || 0,
      totalAttemptsLogged: attemptCount || 0,
      totalCurriculumQuestions: ALL_QUESTIONS.length,
    };
  } catch (err) {
    console.error("Error fetching admin metrics:", err);
    return {
      totalUsers: 0,
      studentCount: 0,
      teacherCount: 0,
      adminCount: 0,
      pendingTeacherApprovals: 0,
      totalClassrooms: 0,
      totalAttemptsLogged: 0,
      totalCurriculumQuestions: ALL_QUESTIONS.length,
    };
  }
}

/**
 * Server Action: Fetch profiles with server-side filtering.
 */
export async function getAdminProfiles(
  filters?: UserManagementFilter
): Promise<UserProfile[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const { supabase } = await verifyAdminCaller();

    let query = supabase.from("profiles").select("*").order("created_at", { ascending: false });

    if (filters?.role && filters.role !== "all") {
      query = query.eq("role", filters.role);
    }

    if (filters?.status && filters.status !== "all") {
      query = query.eq("account_status", filters.status);
    }

    const { data: rows, error } = await query;
    if (error || !rows) return [];

    let filtered = rows;
    if (filters?.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.full_name?.toLowerCase().includes(q) ||
          r.email?.toLowerCase().includes(q) ||
          r.school_name?.toLowerCase().includes(q)
      );
    }

    return filtered.map((p) => ({
      id: p.id,
      email: p.email,
      fullName: p.full_name,
      role: p.role,
      accountStatus: p.account_status || "active",
      schoolName: p.school_name,
      gradeLevel: p.grade_level,
      avatarUrl: p.avatar_url,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));
  } catch (err) {
    console.error("Error fetching admin profiles:", err);
    return [];
  }
}

/**
 * Server Action: Approve a pending teacher request.
 */
export async function approveTeacherAction(
  teacherId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, adminUser } = await verifyAdminCaller();

    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .eq("id", teacherId)
      .single();

    if (!targetProfile || targetProfile.role !== "teacher") {
      return { success: false, error: "Target account is not a teacher." };
    }

    const { error } = await supabase
      .from("profiles")
      .update({ account_status: "active", updated_at: new Date().toISOString() })
      .eq("id", teacherId);

    if (error) return { success: false, error: error.message };

    // Record audit event
    await supabase.from("audit_logs").insert({
      actor_id: adminUser.id,
      action: "approve_teacher",
      target_id: teacherId,
      details: {
        teacherName: targetProfile.full_name,
        teacherEmail: targetProfile.email,
      },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Approval failed." };
  }
}

/**
 * Server Action: Reject a pending teacher request with a validated reason.
 */
const rejectSchema = z.object({
  teacherId: z.string().uuid("Invalid teacher ID."),
  rejectionReason: z
    .string()
    .trim()
    .min(5, "Please provide a rejection reason (at least 5 characters).")
    .max(250, "Reason cannot exceed 250 characters."),
});

export async function rejectTeacherAction(
  rawInput: z.infer<typeof rejectSchema>
): Promise<{ success: boolean; error?: string }> {
  const parsed = rejectSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  try {
    const { supabase, adminUser } = await verifyAdminCaller();

    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .eq("id", parsed.data.teacherId)
      .single();

    if (!targetProfile || targetProfile.role !== "teacher") {
      return { success: false, error: "Target account is not a teacher." };
    }

    // Set status to suspended or delete if preferred
    const { error } = await supabase
      .from("profiles")
      .update({ account_status: "suspended", updated_at: new Date().toISOString() })
      .eq("id", parsed.data.teacherId);

    if (error) return { success: false, error: error.message };

    // Record audit event
    await supabase.from("audit_logs").insert({
      actor_id: adminUser.id,
      action: "reject_teacher",
      target_id: parsed.data.teacherId,
      details: {
        teacherName: targetProfile.full_name,
        teacherEmail: targetProfile.email,
        reason: parsed.data.rejectionReason,
      },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Rejection failed." };
  }
}

/**
 * Server Action: Suspend or restore a user account.
 */
export async function updateUserAccountStatusAction(
  userId: string,
  newStatus: AccountStatus,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, adminUser } = await verifyAdminCaller();

    // Prevent admin self-suspension
    if (userId === adminUser.id) {
      return { success: false, error: "Administrators cannot suspend their own account." };
    }

    const { data: target } = await supabase
      .from("profiles")
      .select("id, role, full_name, email")
      .eq("id", userId)
      .single();

    if (!target) return { success: false, error: "User not found." };

    const { error } = await supabase
      .from("profiles")
      .update({ account_status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) return { success: false, error: error.message };

    await supabase.from("audit_logs").insert({
      actor_id: adminUser.id,
      action: newStatus === "suspended" ? "suspend_user" : "restore_user",
      target_id: userId,
      details: {
        targetName: target.full_name,
        targetEmail: target.email,
        targetRole: target.role,
        reason: reason || "Administrative action",
      },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Update failed." };
  }
}

/**
 * Server Action: Get immutable platform audit logs.
 */
export async function getAdminAuditLogs(limit = 50): Promise<AuditLogEntry[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const { supabase } = await verifyAdminCaller();

    const { data: rows, error } = await supabase
      .from("audit_logs")
      .select("*, profiles:actor_id(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !rows) return [];

    return rows.map((r) => {
      const actor = r.profiles as unknown as { full_name?: string; email?: string } | null;
      return {
        id: r.id,
        actorId: r.actor_id,
        actorName: actor?.full_name || "Admin",
        actorEmail: actor?.email || "",
        action: r.action,
        targetId: r.target_id,
        details: r.details || {},
        createdAt: r.created_at,
      };
    });
  } catch (err) {
    console.error("Error fetching audit logs:", err);
    return [];
  }
}

/**
 * Server Action: Get all classrooms on the platform with teacher and student counts.
 */
export async function getAllClassroomsAdmin(): Promise<ClassroomWithStudentCount[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const { supabase } = await verifyAdminCaller();

    const { data: rows, error } = await supabase
      .from("classrooms")
      .select("*, profiles:teacher_id(full_name)")
      .order("created_at", { ascending: false });

    if (error || !rows) return [];

    const classroomIds = rows.map((r) => r.id);
    const { data: studentRows } = await supabase
      .from("classroom_students")
      .select("classroom_id")
      .in("classroom_id", classroomIds);

    const countsMap = new Map<string, number>();
    if (studentRows) {
      for (const row of studentRows) {
        countsMap.set(row.classroom_id, (countsMap.get(row.classroom_id) || 0) + 1);
      }
    }

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      teacherId: r.teacher_id,
      gradeLevel: r.grade_level,
      subject: r.subject || "Mathematics",
      section: r.section || null,
      academicYear: r.academic_year || "2026-2027",
      joinCode: r.join_code || "N/A",
      isArchived: r.is_archived || false,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      studentCount: countsMap.get(r.id) || 0,
      activeLearnersCount: countsMap.get(r.id) || 0,
    }));
  } catch (err) {
    console.error("Error fetching admin classrooms:", err);
    return [];
  }
}

/**
 * Server Action: Protected question bank inspector for administrators.
 * Returns curriculum questions along with verified answer keys & pedagogical rationale.
 */
export async function getAdminCurriculumInspector(): Promise<{
  concepts: typeof CONCEPTS;
  questions: QuestionWithAnswerKey[];
}> {
  await verifyAdminCaller();

  const questionsWithKeys: QuestionWithAnswerKey[] = ALL_QUESTIONS.map((q) => {
    const key = ANSWER_KEYS[q.id];
    return {
      ...q,
      correctOptionId: key ? key.correctAnswerId : "",
      explanation: key ? key.explanation : "No explanation provided.",
    };
  });

  return {
    concepts: CONCEPTS,
    questions: questionsWithKeys,
  };
}
