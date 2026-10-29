"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { CONCEPTS } from "@/lib/curriculum/concepts";
import { ALL_QUESTIONS } from "@/lib/curriculum/questions";
import {
  evaluateAllConceptMasteries,
  recommendNextAction,
  ConceptMasteryRecord,
  AdaptiveRecommendation,
} from "@/lib/adaptive";
import { ConceptId } from "@/types/curriculum";
import { TeacherIntervention } from "@/types/interventions";
import { getActiveInterventionForStudent } from "./interventionActions";

export interface StudentAttemptDetail {
  id: string;
  questionId: string;
  conceptId: string;
  conceptTitle: string;
  prompt: string;
  selectedOptionText: string;
  isCorrect: boolean;
  attemptedAt: string;
  attemptType?: string;
}

export interface StudentDetailPayload {
  student: {
    id: string;
    fullName: string;
    email: string;
    gradeLevel: number | null;
    schoolName: string | null;
    classroomName?: string;
    classroomId?: string;
  };
  conceptMasteries: Record<string, ConceptMasteryRecord>;
  recentAttempts: StudentAttemptDetail[];
  recommendation: AdaptiveRecommendation;
  activeIntervention: TeacherIntervention | null;
}

/**
 * Server Action: Retrieve verified student detail for an authorized teacher.
 * Strictly verifies teacher teaches the student before returning any data.
 */
export async function getStudentDetailForTeacher(
  studentId: string
): Promise<{ success: boolean; error?: string; data?: StudentDetailPayload }> {
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

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role, account_status")
    .eq("id", user.id)
    .single();

  if (
    !callerProfile ||
    (callerProfile.role !== "teacher" && callerProfile.role !== "admin")
  ) {
    return { success: false, error: "Unauthorized access." };
  }

  // If teacher, verify teacher has this student enrolled in at least one of their classrooms
  let matchingClassroomName: string | undefined;
  let matchingClassroomId: string | undefined;

  if (callerProfile.role === "teacher") {
    const { data: classRows } = await supabase
      .from("classrooms")
      .select("id, name")
      .eq("teacher_id", user.id)
      .eq("is_archived", false);

    if (!classRows || classRows.length === 0) {
      return { success: false, error: "You do not supervise this student." };
    }

    const teacherClassIds = classRows.map((c) => c.id);
    const { data: membership } = await supabase
      .from("classroom_students")
      .select("classroom_id")
      .eq("student_id", studentId)
      .in("classroom_id", teacherClassIds)
      .limit(1)
      .maybeSingle();

    if (!membership) {
      return {
        success: false,
        error: "Access denied. Student is not enrolled in your classrooms.",
      };
    }

    const matched = classRows.find((c) => c.id === membership.classroom_id);
    matchingClassroomName = matched?.name;
    matchingClassroomId = matched?.id;
  }

  // Fetch student profile
  const { data: studentProfile, error: profErr } = await supabase
    .from("profiles")
    .select("id, full_name, email, grade_level, school_name")
    .eq("id", studentId)
    .single();

  if (profErr || !studentProfile) {
    return { success: false, error: "Student profile not found." };
  }

  // Fetch attempts
  const { data: attempts } = await supabase
    .from("student_attempts")
    .select("*")
    .eq("student_id", studentId)
    .order("attempted_at", { ascending: false });

  // Map attempts to Question metadata
  const questionMap = new Map(ALL_QUESTIONS.map((q) => [q.id, q]));
  const recentAttempts: StudentAttemptDetail[] = (attempts || []).map((att) => {
    const q = questionMap.get(att.question_id);
    const chosenOpt = q?.options.find((o) => o.id === att.selected_option_id);
    const c = CONCEPTS[att.concept_id as keyof typeof CONCEPTS];

    return {
      id: att.id,
      questionId: att.question_id,
      conceptId: att.concept_id,
      conceptTitle: c?.shortTitle || att.concept_id,
      prompt: q?.prompt || "Class 7 Fractions Assessment Question",
      selectedOptionText: chosenOpt ? `${chosenOpt.id.toUpperCase()}: ${chosenOpt.text}` : att.selected_option_id,
      isCorrect: att.is_correct,
      attemptedAt: att.attempted_at,
      attemptType: att.session_id?.startsWith("prac_") ? "Guided Practice" : "Diagnostic Quiz",
    };
  });

  // Calculate concept masteries from real attempts
  const normalizedAttempts = (attempts || []).map((a) => ({
    questionId: a.question_id,
    conceptId: a.concept_id as ConceptId,
    selectedOptionId: a.selected_option_id,
    isCorrect: a.is_correct,
    attemptedAt: a.attempted_at,
  }));

  const conceptIds = Object.keys(CONCEPTS) as ConceptId[];
  const masteries = evaluateAllConceptMasteries(conceptIds, normalizedAttempts);

  // Compute adaptive recommendation
  const recommendation = recommendNextAction({ masteries });

  // Fetch active teacher intervention
  const activeIntervention = await getActiveInterventionForStudent(studentId);

  return {
    success: true,
    data: {
      student: {
        id: studentProfile.id,
        fullName: studentProfile.full_name,
        email: studentProfile.email,
        gradeLevel: studentProfile.grade_level,
        schoolName: studentProfile.school_name,
        classroomName: matchingClassroomName,
        classroomId: matchingClassroomId,
      },
      conceptMasteries: masteries,
      recentAttempts,
      recommendation,
      activeIntervention,
    },
  };
}
