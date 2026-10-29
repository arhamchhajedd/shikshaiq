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
  ConceptMasteryRecord,
  AdaptiveRecommendation,
} from "@/lib/adaptive";
import { ConceptId } from "@/types/curriculum";
import { SyncResultItem, BatchSyncResponse } from "@/types/offline";

const syncItemSchema = z.object({
  idempotencyKey: z
    .string()
    .min(6, "Idempotency key must be at least 6 characters")
    .max(128, "Idempotency key too long"),
  questionId: z.string().min(1, "Question ID is required"),
  conceptId: z.enum([
    "fraction-basics",
    "common-multiples",
    "equivalent-fractions",
    "adding-fractions",
    "mixed-fractions",
  ]),
  contentVersion: z.number().int().min(1).default(1),
  selectedOptionId: z.string().min(1, "Selected option ID is required"),
  attemptedAt: z.string().optional(),
  attemptType: z.literal("practice").default("practice"),
});

const batchSyncSchema = z.object({
  attempts: z
    .array(syncItemSchema)
    .min(1, "At least one attempt is required to sync")
    .max(20, "Batch size exceeds limit of 20 attempts"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = batchSyncSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || "Invalid batch synchronization request payload.",
          results: [],
        },
        { status: 400 }
      );
    }

    const { attempts } = parsed.data;

    // Check Supabase configuration
    if (!isSupabaseConfigured()) {
      // In unconfigured / local isolated test mode, validate purely server-side
      const testResults: SyncResultItem[] = attempts.map((att) => {
        const key = ANSWER_KEYS[att.questionId];
        if (!key) {
          return {
            idempotencyKey: att.idempotencyKey,
            questionId: att.questionId,
            success: false,
            status: "rejected",
            error: "Unknown question ID",
          };
        }
        const isCorrect = att.selectedOptionId === key.correctAnswerId;
        return {
          idempotencyKey: att.idempotencyKey,
          questionId: att.questionId,
          success: true,
          status: "synced",
          isCorrect,
          correctOptionId: key.correctAnswerId,
          explanation: key.explanation,
        };
      });

      return NextResponse.json({
        success: true,
        results: testResults,
      } as BatchSyncResponse);
    }

    // Authenticate user session
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required to synchronize offline practice attempts.",
          results: [],
        },
        { status: 401 }
      );
    }

    const results: SyncResultItem[] = [];
    let hasNewAttempts = false;

    // Process each queued attempt with strict idempotency and server answer-key validation
    for (const item of attempts) {
      const answerKey = ANSWER_KEYS[item.questionId];

      if (!answerKey) {
        results.push({
          idempotencyKey: item.idempotencyKey,
          questionId: item.questionId,
          success: false,
          status: "rejected",
          error: `Question ${item.questionId} not found in authoritative curriculum bank.`,
        });
        continue;
      }

      // Check if attempt with this idempotency key already exists for this student
      const { data: existingAttempts, error: checkErr } = await supabase
        .from("student_attempts")
        .select("id, is_correct, selected_option_id")
        .eq("student_id", user.id)
        .eq("idempotency_key", item.idempotencyKey)
        .limit(1);

      if (!checkErr && existingAttempts && existingAttempts.length > 0) {
        // Idempotency guarantee: already processed!
        const existing = existingAttempts[0];
        results.push({
          idempotencyKey: item.idempotencyKey,
          questionId: item.questionId,
          success: true,
          status: "already_processed",
          isCorrect: existing.is_correct,
          correctOptionId: answerKey.correctAnswerId,
          explanation: answerKey.explanation,
        });
        continue;
      }

      // Authoritative server-side correctness check
      const isCorrect = item.selectedOptionId === answerKey.correctAnswerId;
      const recordedAt = item.attemptedAt || new Date().toISOString();

      // Persist attempt with idempotency key
      const { error: insertErr } = await supabase.from("student_attempts").insert({
        student_id: user.id,
        session_id: `offline_sync_${item.idempotencyKey.slice(0, 16)}`,
        question_id: item.questionId,
        concept_id: item.conceptId,
        selected_option_id: item.selectedOptionId,
        is_correct: isCorrect,
        attempt_type: item.attemptType,
        attempted_at: recordedAt,
        idempotency_key: item.idempotencyKey,
      });

      if (insertErr) {
        // If unique constraint conflict occurred concurrently
        if (insertErr.code === "23505" || insertErr.message.includes("unique")) {
          results.push({
            idempotencyKey: item.idempotencyKey,
            questionId: item.questionId,
            success: true,
            status: "already_processed",
            isCorrect,
            correctOptionId: answerKey.correctAnswerId,
            explanation: answerKey.explanation,
          });
          continue;
        }

        console.error("Failed to insert offline synced attempt:", insertErr);
        results.push({
          idempotencyKey: item.idempotencyKey,
          questionId: item.questionId,
          success: false,
          status: "rejected",
          error: "Database persistence error while saving attempt.",
        });
        continue;
      }

      hasNewAttempts = true;
      results.push({
        idempotencyKey: item.idempotencyKey,
        questionId: item.questionId,
        success: true,
        status: "synced",
        isCorrect,
        correctOptionId: answerKey.correctAnswerId,
        explanation: answerKey.explanation,
      });
    }

    // Recalculate deterministic mastery and recommendation if new attempts were inserted
    let updatedMasteries: Record<ConceptId, ConceptMasteryRecord> | undefined;
    let recommendation: AdaptiveRecommendation | undefined;

    if (hasNewAttempts) {
      const { data: allPastAttempts, error: fetchErr } = await supabase
        .from("student_attempts")
        .select("question_id, concept_id, selected_option_id, is_correct, attempted_at")
        .eq("student_id", user.id);

      if (!fetchErr && allPastAttempts && allPastAttempts.length > 0) {
        const attemptInputs: StudentAttemptInput[] = allPastAttempts.map((row) => ({
          questionId: row.question_id,
          conceptId: row.concept_id as ConceptId,
          selectedOptionId: row.selected_option_id,
          isCorrect: row.is_correct,
          attemptedAt: row.attempted_at,
        }));

        const evaluatedMasteries = evaluateAllConceptMasteries(attemptInputs);
        updatedMasteries = evaluatedMasteries;

        // Persist each updated mastery row to student_mastery
        for (const concept of CONCEPTS_LIST) {
          const m = evaluatedMasteries[concept.id];
          if (m && m.validEvidenceCount > 0) {
            await supabase.from("student_mastery").upsert(
              {
                student_id: user.id,
                concept_id: concept.id,
                mastery_score: m.masteryScore,
                status: m.status,
                valid_evidence_count: m.validEvidenceCount,
                last_evaluated_at: new Date().toISOString(),
              },
              { onConflict: "student_id,concept_id" }
            );
          }
        }

        // Recommend next learning action
        recommendation = recommendNextAction(evaluatedMasteries, CONCEPTS_LIST);
      }
    }

    const responsePayload: BatchSyncResponse = {
      success: true,
      results,
      updatedMasteries,
      recommendation,
    };

    return NextResponse.json(responsePayload);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server synchronization error";
    console.error("Batch synchronization error:", err);
    return NextResponse.json(
      {
        success: false,
        error: message,
        results: [],
      },
      { status: 500 }
    );
  }
}
