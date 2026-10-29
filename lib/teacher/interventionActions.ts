"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  CreateInterventionInput,
  TeacherIntervention,
  InterventionAction,
} from "@/types/interventions";
import { CONCEPTS } from "@/lib/curriculum/concepts";
import { ConceptId } from "@/types/curriculum";

const interventionSchema = z.object({
  studentId: z.string().uuid("Invalid student ID."),
  classroomId: z.string().uuid("Invalid classroom ID.").nullable().optional(),
  targetConceptId: z.string().refine((val) => val in CONCEPTS, {
    message: "Invalid target concept ID.",
  }),
  recommendedAction: z.enum(["learn", "practice", "assessment"] as const),
  teacherNotes: z.string().trim().max(300, "Notes cannot exceed 300 characters.").optional(),
  originalRecommendation: z.any().optional(),
});

/**
 * Server Action: Create an authorized teacher intervention/override.
 * Enforces teacher supervision check; logs audit event.
 */
export async function createTeacherInterventionAction(
  rawInput: CreateInterventionInput
): Promise<{ success: boolean; error?: string; intervention?: TeacherIntervention }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Database not configured." };
  }

  const parsed = interventionSchema.safeParse(rawInput);
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

  // Verify teacher role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, account_status, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "teacher" && profile.role !== "admin")) {
    return { success: false, error: "Only educators can assign learning interventions." };
  }

  if (profile.role === "teacher" && profile.account_status !== "active") {
    return { success: false, error: "Your account is pending administrator approval." };
  }

  // Deactivate any existing active intervention for this student on this concept
  await supabase
    .from("teacher_interventions")
    .update({ status: "dismissed", updated_at: new Date().toISOString() })
    .eq("student_id", parsed.data.studentId)
    .eq("status", "active");

  const { data: inserted, error: insertError } = await supabase
    .from("teacher_interventions")
    .insert({
      teacher_id: user.id,
      student_id: parsed.data.studentId,
      classroom_id: parsed.data.classroomId || null,
      target_concept_id: parsed.data.targetConceptId,
      recommended_action: parsed.data.recommendedAction,
      teacher_notes: parsed.data.teacherNotes || null,
      original_recommendation: parsed.data.originalRecommendation || null,
      status: "active",
    })
    .select()
    .single();

  if (insertError || !inserted) {
    return { success: false, error: insertError?.message || "Failed to persist intervention." };
  }

  // Record audit log
  try {
    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      action: "create_intervention",
      target_id: parsed.data.studentId,
      details: {
        interventionId: inserted.id,
        targetConceptId: parsed.data.targetConceptId,
        recommendedAction: parsed.data.recommendedAction,
        teacherNotes: parsed.data.teacherNotes,
      },
    });
  } catch {
    // Non-blocking if table pending migration
  }

  revalidatePath("/teacher");
  revalidatePath(`/teacher/students/${parsed.data.studentId}`);
  revalidatePath("/student");

  return {
    success: true,
    intervention: {
      id: inserted.id,
      teacherId: inserted.teacher_id,
      studentId: inserted.student_id,
      classroomId: inserted.classroom_id,
      targetConceptId: inserted.target_concept_id,
      recommendedAction: inserted.recommended_action as InterventionAction,
      teacherNotes: inserted.teacher_notes,
      originalRecommendation: inserted.original_recommendation,
      status: inserted.status,
      createdAt: inserted.created_at,
      updatedAt: inserted.updated_at,
      teacherName: profile.full_name,
      conceptTitle: CONCEPTS[inserted.target_concept_id as ConceptId]?.title,
    },
  };
}

/**
 * Server Action: Dismiss an active teacher intervention.
 */
export async function dismissTeacherInterventionAction(
  interventionId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Database not configured." };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Authentication required." };

  const { error } = await supabase
    .from("teacher_interventions")
    .update({ status: "dismissed", updated_at: new Date().toISOString() })
    .eq("id", interventionId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/teacher");
  revalidatePath("/student");
  return { success: true };
}

/**
 * Server Action: Fetch active intervention for a student (visible to student or teacher).
 */
export async function getActiveInterventionForStudent(
  studentId: string
): Promise<TeacherIntervention | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createServerSupabaseClient();
    const { data: row } = await supabase
      .from("teacher_interventions")
      .select("*, profiles:teacher_id(full_name)")
      .eq("student_id", studentId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!row) return null;

    const teacherName =
      (row.profiles as unknown as { full_name?: string })?.full_name || "Your Teacher";

    return {
      id: row.id,
      teacherId: row.teacher_id,
      studentId: row.student_id,
      classroomId: row.classroom_id,
      targetConceptId: row.target_concept_id,
      recommendedAction: row.recommended_action as InterventionAction,
      teacherNotes: row.teacher_notes,
      originalRecommendation: row.original_recommendation,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      teacherName,
      conceptTitle: CONCEPTS[row.target_concept_id as ConceptId]?.title || row.target_concept_id,
    };
  } catch (err) {
    console.error("Error fetching active intervention:", err);
    return null;
  }
}
