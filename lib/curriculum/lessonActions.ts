"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ConceptId } from "@/types/curriculum";

export interface LessonCompletionResult {
  success: boolean;
  conceptId: ConceptId;
  completedAt?: string;
  error?: string;
}

/**
 * Server Action to mark a curriculum lesson as completed for the authenticated student.
 */
export async function markLessonCompleted(
  conceptId: ConceptId
): Promise<LessonCompletionResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: true,
      conceptId,
      completedAt: new Date().toISOString(),
    };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        conceptId,
        error: "Authentication required to mark lesson completion.",
      };
    }

    const { error: insertError } = await supabase
      .from("student_lesson_completions")
      .upsert(
        {
          student_id: user.id,
          concept_id: conceptId,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "student_id,concept_id" }
      );

    if (insertError) {
      // If table doesn't exist yet in Supabase (pending migration execution), log and return gracefully
      if (insertError.code === "42P01" || insertError.message.includes("does not exist")) {
        console.warn(
          "student_lesson_completions table not yet created in Supabase. Run migration 20261030010000_phase04_learning_journey.sql."
        );
        return {
          success: true,
          conceptId,
          completedAt: new Date().toISOString(),
        };
      }
      return {
        success: false,
        conceptId,
        error: insertError.message,
      };
    }

    return {
      success: true,
      conceptId,
      completedAt: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return {
      success: false,
      conceptId,
      error: message,
    };
  }
}

/**
 * Server Action to get all completed lesson concept IDs for the current student.
 */
export async function getCompletedLessons(): Promise<ConceptId[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) return [];

    const { data, error } = await supabase
      .from("student_lesson_completions")
      .select("concept_id")
      .eq("student_id", user.id);

    if (error || !data) return [];

    return data.map((row) => row.concept_id as ConceptId);
  } catch {
    return [];
  }
}
