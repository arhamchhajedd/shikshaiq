import { NextRequest, NextResponse } from "next/server";
import { validateSubmission } from "@/lib/assessment/validation";
import { scoreAssessment } from "@/lib/assessment/scoring";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  evaluateAllConceptMasteries,
  recommendNextAction,
  StudentAttemptInput,
} from "@/lib/adaptive";
import { ConceptId } from "@/types/curriculum";
import { DIAGNOSTIC_QUESTIONS } from "@/lib/curriculum/questions";
import { ANSWER_KEYS } from "@/lib/curriculum/answerKeys.server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateSubmission(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { answers, personaId } = validation.data;
    const sessionId = personaId || `session_${Date.now()}`;

    // Score assessment deterministically using server answer keys
    const result = scoreAssessment(answers);

    // If Supabase is configured, enforce authentication and persist to real database tables
    if (isSupabaseConfigured()) {
      const supabase = await createServerSupabaseClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json(
          {
            success: false,
            error: "Authentication required to submit diagnostic assessment.",
          },
          { status: 401 }
        );
      }

      // Map answers to StudentAttemptInput
      const questionMap = new Map(DIAGNOSTIC_QUESTIONS.map((q) => [q.id, q]));
      const attemptInputs: StudentAttemptInput[] = [];

      for (const a of answers) {
        const q = questionMap.get(a.questionId);
        const key = ANSWER_KEYS[a.questionId];
        if (q && key) {
          const isCorrect = a.selectedOptionId === key.correctAnswerId;
          attemptInputs.push({
            questionId: a.questionId,
            conceptId: q.conceptId,
            selectedOptionId: a.selectedOptionId,
            isCorrect,
            attemptedAt: new Date().toISOString(),
          });
        }
      }

      // Persist attempts into student_attempts
      const attemptsToInsert = attemptInputs.map((att) => ({
        student_id: user.id,
        session_id: sessionId,
        question_id: att.questionId,
        concept_id: att.conceptId,
        selected_option_id: att.selectedOptionId,
        is_correct: att.isCorrect,
      }));

      const { error: insertAttemptsError } = await supabase
        .from("student_attempts")
        .insert(attemptsToInsert);

      if (insertAttemptsError) {
        console.error("Failed to persist student attempts:", insertAttemptsError);
      }

      // Fetch all past attempts for this student to calculate comprehensive mastery
      const { data: allPastAttempts } = await supabase
        .from("student_attempts")
        .select("question_id, concept_id, selected_option_id, is_correct, attempted_at")
        .eq("student_id", user.id);

      const cumulativeInputs: StudentAttemptInput[] =
        allPastAttempts && allPastAttempts.length > 0
          ? allPastAttempts.map((row) => ({
              questionId: row.question_id,
              conceptId: row.concept_id as ConceptId,
              selectedOptionId: row.selected_option_id,
              isCorrect: row.is_correct,
              attemptedAt: row.attempted_at,
            }))
          : attemptInputs;

      // Evaluate mastery using adaptive engine
      const conceptIds: ConceptId[] = [
        "fraction-basics",
        "common-multiples",
        "equivalent-fractions",
        "adding-fractions",
        "mixed-fractions",
      ];
      const masteries = evaluateAllConceptMasteries(conceptIds, cumulativeInputs);

      // Upsert into student_mastery
      const masteryRows = Object.values(masteries).map((m) => ({
        student_id: user.id,
        concept_id: m.conceptId,
        mastery_score: m.masteryScore,
        status: m.status,
        valid_evidence_count: m.validEvidenceCount,
        last_evaluated_at: m.lastEvaluatedAt || new Date().toISOString(),
      }));

      const { error: upsertMasteryError } = await supabase
        .from("student_mastery")
        .upsert(masteryRows, { onConflict: "student_id,concept_id" });

      if (upsertMasteryError) {
        console.error("Failed to upsert student mastery:", upsertMasteryError);
      }

      // Generate explainable adaptive recommendation
      const recommendation = recommendNextAction({ masteries });

      return NextResponse.json(
        {
          success: true,
          result,
          recommendation,
          persisted: true,
        },
        { status: 200 }
      );
    }

    // Supabase not configured in current environment: return deterministic calculation
    return NextResponse.json(
      {
        success: true,
        result,
        persisted: false,
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to process assessment submission";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
