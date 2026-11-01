"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Classroom, ClassroomWithStudentCount, ClassroomStudent } from "@/types/classroom";
import { CONCEPTS } from "@/lib/curriculum/concepts";
import { ConceptMasteryRecord } from "@/lib/adaptive";
import { ConceptId } from "@/types/curriculum";

const createClassroomSchema = z.object({
  name: z.string().trim().min(3, "Classroom name must be at least 3 characters.").max(60),
  gradeLevel: z.number().int().min(1).max(12).default(7),
  subject: z.string().trim().min(2).max(60).default("Mathematics"),
  section: z.string().trim().max(30).nullable().optional(),
  academicYear: z.string().trim().max(20).default("2026-2027"),
});

const updateClassroomSchema = z.object({
  name: z.string().trim().min(3).max(60).optional(),
  section: z.string().trim().max(30).nullable().optional(),
  isArchived: z.boolean().optional(),
});

function generateSecureJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Server Action: Create a new classroom cohort.
 * Strictly restricted to authenticated active teachers or administrators.
 */
export async function createClassroomAction(
  rawInput: z.infer<typeof createClassroomSchema>
): Promise<{ success: boolean; error?: string; classroom?: Classroom }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Database not configured." };
  }

  const parsed = createClassroomSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input." };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Authentication required." };
  }

  // Verify caller profile & account status
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, account_status")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "teacher" && profile.role !== "admin")) {
    return { success: false, error: "Only educators and administrators can create classrooms." };
  }

  if (profile.role === "teacher" && profile.account_status !== "active") {
    return { success: false, error: "Your teacher account is pending administrator approval." };
  }

  const joinCode = generateSecureJoinCode();

  const { data: inserted, error: insertError } = await supabase
    .from("classrooms")
    .insert({
      name: parsed.data.name,
      teacher_id: user.id,
      grade_level: parsed.data.gradeLevel,
      subject: parsed.data.subject,
      section: parsed.data.section || null,
      academic_year: parsed.data.academicYear,
      join_code: joinCode,
      is_archived: false,
    })
    .select()
    .single();

  if (insertError || !inserted) {
    return { success: false, error: insertError?.message || "Failed to create classroom." };
  }

  // Record audit log entry if table exists
  try {
    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      action: "create_classroom",
      target_id: inserted.id,
      details: { name: inserted.name, joinCode: inserted.join_code },
    });
  } catch {
    // Audit log table might be pending migration; silent non-blocking
  }

  revalidatePath("/teacher");
  return {
    success: true,
    classroom: {
      id: inserted.id,
      name: inserted.name,
      teacherId: inserted.teacher_id,
      gradeLevel: inserted.grade_level,
      subject: inserted.subject || "Mathematics",
      section: inserted.section || null,
      academicYear: inserted.academic_year || "2026-2027",
      joinCode: inserted.join_code || joinCode,
      isArchived: inserted.is_archived || false,
      createdAt: inserted.created_at,
      updatedAt: inserted.updated_at,
    },
  };
}

/**
 * Server Action: Get classrooms managed by current teacher.
 */
export async function getTeacherClassrooms(): Promise<ClassroomWithStudentCount[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    let query = supabase.from("classrooms").select("*");
    if (profile?.role !== "admin") {
      query = query.eq("teacher_id", user.id);
    }

    const { data: rows, error } = await query
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    if (error || !rows) return [];

    const classroomIds = rows.map((r) => r.id);
    if (classroomIds.length === 0) return [];

    // Fetch student counts for each classroom
    const { data: studentRows } = await supabase
      .from("classroom_students")
      .select("classroom_id, student_id")
      .in("classroom_id", classroomIds);

    const countsMap = new Map<string, number>();
    const studentIds = new Set<string>();

    if (studentRows) {
      for (const row of studentRows) {
        countsMap.set(row.classroom_id, (countsMap.get(row.classroom_id) || 0) + 1);
        studentIds.add(row.student_id);
      }
    }

    // Determine active learners (those with attempts)
    let activeLearnerIds = new Set<string>();
    if (studentIds.size > 0) {
      const { data: attempts } = await supabase
        .from("student_attempts")
        .select("student_id")
        .in("student_id", Array.from(studentIds));

      if (attempts) {
        activeLearnerIds = new Set(attempts.map((a) => a.student_id));
      }
    }

    return rows.map((r) => {
      const totalStudents = countsMap.get(r.id) || 0;
      // Estimate active learners in this class
      const classStudentRows = studentRows?.filter((sr) => sr.classroom_id === r.id) || [];
      const activeInClass = classStudentRows.filter((sr) =>
        activeLearnerIds.has(sr.student_id)
      ).length;

      return {
        id: r.id,
        name: r.name,
        teacherId: r.teacher_id,
        gradeLevel: r.grade_level,
        subject: r.subject || "Mathematics",
        section: r.section || null,
        academicYear: r.academic_year || "2026-2027",
        joinCode: r.join_code || "PENDING",
        isArchived: r.is_archived || false,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        studentCount: totalStudents,
        activeLearnersCount: activeInClass,
      };
    });
  } catch (err) {
    console.error("Error fetching teacher classrooms:", err);
    return [];
  }
}

/**
 * Server Action: Get detailed roster for a classroom, verifying teacher permissions.
 */
export async function getClassroomRoster(
  classroomId: string
): Promise<{ success: boolean; error?: string; students?: ClassroomStudent[] }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Database not configured." };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Authentication required." };
  }

  // Verify teacher owns the classroom or is admin
  const { data: classroom } = await supabase
    .from("classrooms")
    .select("id, teacher_id")
    .eq("id", classroomId)
    .single();

  if (!classroom) {
    return { success: false, error: "Classroom not found." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (classroom.teacher_id !== user.id && profile?.role !== "admin") {
    return { success: false, error: "Unauthorized access to classroom roster." };
  }

  // Fetch enrolled students
  const { data: memberships, error: memError } = await supabase
    .from("classroom_students")
    .select("classroom_id, student_id, joined_at")
    .eq("classroom_id", classroomId);

  if (memError || !memberships) {
    return { success: false, error: memError?.message || "Failed to load memberships." };
  }

  if (memberships.length === 0) {
    return { success: true, students: [] };
  }

  const studentIds = memberships.map((m) => m.student_id);

  // Fetch profiles
  const { data: studentProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, grade_level")
    .in("id", studentIds);

  const profileMap = new Map(studentProfiles?.map((p) => [p.id, p]) || []);

  // Fetch mastery records
  const { data: masteries } = await supabase
    .from("student_mastery")
    .select("student_id, concept_id, status, mastery_score, valid_evidence_count, last_evaluated_at")
    .in("student_id", studentIds);

  // Fetch latest activity timestamp
  const { data: latestAttempts } = await supabase
    .from("student_attempts")
    .select("student_id, attempted_at")
    .in("student_id", studentIds)
    .order("attempted_at", { ascending: false });

  const latestActivityMap = new Map<string, string>();
  if (latestAttempts) {
    for (const att of latestAttempts) {
      if (!latestActivityMap.has(att.student_id)) {
        latestActivityMap.set(att.student_id, att.attempted_at);
      }
    }
  }

  const roster: ClassroomStudent[] = memberships.map((m) => {
    const prof = profileMap.get(m.student_id);
    const studentMasteries = masteries?.filter((sm) => sm.student_id === m.student_id) || [];

    const masteredCount = studentMasteries.filter((sm) => sm.status === "mastered").length;
    const partialCount = studentMasteries.filter((sm) => sm.status === "partial").length;
    const needsRevisionCount = studentMasteries.filter(
      (sm) => sm.status === "needs_revision"
    ).length;
    const notStartedCount =
      Object.keys(CONCEPTS).length - (masteredCount + partialCount + needsRevisionCount);

    const conceptRecords: Record<string, ConceptMasteryRecord> = {};
    for (const sm of studentMasteries) {
      conceptRecords[sm.concept_id] = {
        conceptId: sm.concept_id as ConceptId,
        masteryScore: sm.mastery_score ?? (sm.status === "mastered" ? 85 : sm.status === "partial" ? 65 : 35),
        status: sm.status,
        validEvidenceCount: sm.valid_evidence_count ?? 1,
        lastEvaluatedAt: sm.last_evaluated_at || new Date().toISOString(),
      };
    }

    return {
      classroomId: m.classroom_id,
      studentId: m.student_id,
      joinedAt: m.joined_at,
      studentName: prof?.full_name || "Student",
      studentEmail: prof?.email || "",
      gradeLevel: prof?.grade_level || 7,
      latestActivityAt: latestActivityMap.get(m.student_id) || null,
      masteredConceptsCount: masteredCount,
      needsRevisionCount,
      partialCount,
      notStartedCount: Math.max(0, notStartedCount),
      conceptRecords,
    };
  });

  return { success: true, students: roster };
}

/**
 * Server Action: Student enrolls in classroom using 6-character join code.
 */
export async function enrollInClassroomAction(
  joinCode: string
): Promise<{ success: boolean; error?: string; classroomName?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Database not configured." };
  }

  const sanitized = joinCode.trim().toUpperCase();
  if (sanitized.length < 4 || sanitized.length > 10) {
    return { success: false, error: "Please enter a valid 6-character classroom join code." };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Authentication required to enroll in a classroom." };
  }

  // Lookup classroom
  const { data: classroom, error: classErr } = await supabase
    .from("classrooms")
    .select("id, name, is_archived")
    .eq("join_code", sanitized)
    .single();

  if (classErr || !classroom) {
    return { success: false, error: "No active classroom found matching this join code." };
  }

  if (classroom.is_archived) {
    return { success: false, error: "This classroom has been archived by the educator." };
  }

  // Check existing membership
  const { data: existing } = await supabase
    .from("classroom_students")
    .select("student_id")
    .eq("classroom_id", classroom.id)
    .eq("student_id", user.id)
    .maybeSingle();

  if (existing) {
    return {
      success: true,
      classroomName: classroom.name,
      error: "You are already enrolled in this classroom.",
    };
  }

  // Insert membership
  const { error: insertErr } = await supabase.from("classroom_students").insert({
    classroom_id: classroom.id,
    student_id: user.id,
    joined_at: new Date().toISOString(),
  });

  if (insertErr) {
    return { success: false, error: insertErr.message };
  }

  revalidatePath("/student");
  return { success: true, classroomName: classroom.name };
}

/**
 * Server Action: Teacher removes a student from a classroom roster.
 */
export async function removeStudentFromClassroomAction(
  classroomId: string,
  studentId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Database not configured." };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Authentication required." };
  }

  // Verify ownership
  const { data: classroom } = await supabase
    .from("classrooms")
    .select("id, teacher_id")
    .eq("id", classroomId)
    .single();

  if (!classroom) return { success: false, error: "Classroom not found." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (classroom.teacher_id !== user.id && profile?.role !== "admin") {
    return { success: false, error: "Unauthorized." };
  }

  const { error: delErr } = await supabase
    .from("classroom_students")
    .delete()
    .eq("classroom_id", classroomId)
    .eq("student_id", studentId);

  if (delErr) {
    return { success: false, error: delErr.message };
  }

  revalidatePath("/teacher");
  return { success: true };
}

/**
 * Server Action: Regenerate a revocable classroom join code.
 */
export async function regenerateJoinCodeAction(
  classroomId: string
): Promise<{ success: boolean; newJoinCode?: string; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Database not configured." };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Authentication required." };

  const { data: classroom } = await supabase
    .from("classrooms")
    .select("id, teacher_id")
    .eq("id", classroomId)
    .single();

  if (!classroom || classroom.teacher_id !== user.id) {
    return { success: false, error: "Unauthorized." };
  }

  const newCode = generateSecureJoinCode();
  const { error } = await supabase
    .from("classrooms")
    .update({ join_code: newCode, updated_at: new Date().toISOString() })
    .eq("id", classroomId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/teacher");
  return { success: true, newJoinCode: newCode };
}

/**
 * Server Action: Update classroom details or archive status.
 */
export async function updateClassroomAction(
  classroomId: string,
  rawInput: z.infer<typeof updateClassroomSchema>
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: false, error: "Database not configured." };

  const parsed = updateClassroomSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Authentication required." };

  const { data: classroom } = await supabase
    .from("classrooms")
    .select("id, teacher_id")
    .eq("id", classroomId)
    .single();

  if (!classroom || classroom.teacher_id !== user.id) {
    return { success: false, error: "Unauthorized." };
  }

  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (parsed.data.name !== undefined) updatePayload.name = parsed.data.name;
  if (parsed.data.section !== undefined) updatePayload.section = parsed.data.section;
  if (parsed.data.isArchived !== undefined) updatePayload.is_archived = parsed.data.isArchived;

  const { error } = await supabase
    .from("classrooms")
    .update(updatePayload)
    .eq("id", classroomId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/teacher");
  return { success: true };
}
