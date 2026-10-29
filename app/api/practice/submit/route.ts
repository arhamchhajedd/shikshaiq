import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ANSWER_KEYS } from "@/lib/curriculum/answerKeys.server";
import { CONCEPTS_LIST } from "@/lib/curriculum/concepts";
import {
  evaluateAllConceptMasteries,
  recommendNextAction,
  StudentAttemptInput,
} from "@/lib/adaptive";
import { ConceptId } from "@/types/curriculum";

const practiceSubmissionSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
  selectedOptionId: z.string().min(1, "Selected option ID is required"),
  conceptId: z.enum([
    "fraction-basics",
    "common-multiples",
    "equivalent-fractions",
    "adding-fractions",
    "mixed-fractions",
  ]),
  sessionId: z.string().min(1, "Session ID is required"),
  attemptType: z.enum(["practice", "concept_test", "diagnostic"]).default("practice"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = practiceSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid submission" },
        { status: 400 }
      );
    }

    const { questionId, selectedOptionId, conceptId, sessionId, attemptType } = parsed.data;

    // Check server answer key
    const answerKey = ANSWER_KEYS[questionId];
    if (!answerKey) {
      return NextResponse.json(
        { success: false, error: "Question not found in curriculum answer repository." },
        { status: 404 }
      );
    }

    const isCorrect = selectedOptionId === answerKey.correctAnswerId;

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        isCorrect,
        correctOptionId: answerKey.correctAnswerId,
        explanation: answerKey.explanation,
        updatedMastery: {
          conceptId,
          masteryScore: isCorrect ? 100 : 0,
          status: isCorrect ? "partial" : "needs_revision",
          validEvidenceCount: 1,
        },
      });
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Authentication required to submit practice attempt." },
        { status: 401 }
      );
    }

    // Persist attempt to Supabase
    // Note: If attempt_type column is not yet migrated, fall back without attempt_type
    const attemptRecord = {
      student_id: user.id,
      session_id: sessionId,
      question_id: questionId,
      concept_id: conceptId,
      selected_option_id: selectedOptionId,
      is_correct: isCorrect,
      attempt_type: attemptType,
    };

    const { error: insertError } = await supabase
      .from("student_attempts")
      .insert(attemptRecord);

    if (insertError) {
      // If error is due to attempt_type column missing in database, retry without attempt_type
      if (insertError.message.includes("attempt_type")) {
        const { error: retryError } = await supabase.from("student_attempts").insert({
          student_id: user.id,
          session_id: sessionId,
          question_id: questionId,
          concept_id: conceptId,
          selected_option_id: selectedOptionId,
          is_correct: isCorrect,
        });
        if (retryError) {
          console.error("Retry insert student_attempt failed:", retryError);
        }
      } else {
        console.error("Failed to insert student_attempt:", insertError);
      }
    }

    // Fetch all student attempts to recalculate comprehensive mastery
    const { data: allPastAttempts, error: fetchErr } = await supabase
      .from("student_attempts")
      .select("question_id, concept_id, selected_option_id, is_correct, attempted_at")
      .eq("student_id", user.id);

    if (fetchErr) {
      console.error("Failed to fetch past attempts:", fetchErr);
    }

    const attemptInputs: StudentAttemptInput[] =
      allPastAttempts && allPastAttempts.length > 0
        ? allPastAttempts.map((row) => ({
            questionId: row.question_id,
            conceptId: row.concept_id as ConceptId,
            selectedOptionId: row.selected_option_id,
            isCorrect: row.is_correct,
            attemptedAt: row.attempted_at,
          }))
        : [
            {
              questionId,
              conceptId,
              selectedOptionId,
              isCorrect,
              attemptedAt: new Date().toISOString(),
            },
          ];

    // Compute updated deterministic masteries across all concepts
    const allMasteries = evaluateAllConceptMasteries(attemptInputs);
    const updatedConceptMastery = allMasteries[conceptId];

    // Persist updated mastery score to student_mastery
    const { error: upsertMasteryError } = await supabase.from("student_mastery").upsert(
      {
        student_id: user.id,
        concept_id: conceptId,
        mastery_score: updatedConceptMastery.masteryScore,
        status: updatedConceptMastery.status,
        valid_evidence_count: updatedConceptMastery.validEvidenceCount,
        last_evaluated_at: new Date().toISOString(),
      },
      { onConflict: "student_id,concept_id" }
    );

    if (upsertMasteryError) {
      console.error("Failed to update student_mastery:", upsertMasteryError);
    }

    // Generate updated recommendation
    const recommendation = recommendNextAction(allMasteries, CONCEPTS_LIST, conceptId);

    return NextResponse.json({
      success: true,
      isCorrect,
      correctOptionId: answerKey.correctAnswerId,
      explanation: answerKey.explanation,
      updatedMastery: updatedConceptMastery,
      recommendation,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
