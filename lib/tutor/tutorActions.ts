"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { TutorConversation, TutorLanguage, TutorMessage } from "@/types/tutor";
import { ConceptId } from "@/types/curriculum";

/**
 * Server Action: Get or create an active tutor conversation for the authenticated student.
 */
export async function getOrCreateTutorConversation(
  conceptId: ConceptId,
  contextType: "learn" | "practice" | "assessment" | "general" = "learn"
): Promise<{ success: boolean; conversation?: TutorConversation; error?: string }> {
  if (!isSupabaseConfigured()) {
    return {
      success: true,
      conversation: {
        id: `ephemeral_${conceptId}`,
        studentId: "ephemeral_user",
        conceptId,
        contextType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      },
    };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required to access tutor history." };
    }

    // Lookup existing conversation for this concept & context
    const { data: existing, error: fetchError } = await supabase
      .from("tutor_conversations")
      .select("*")
      .eq("student_id", user.id)
      .eq("concept_id", conceptId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.warn("Could not query tutor_conversations:", fetchError.message);
    }

    let conversationRecord = existing;

    if (!conversationRecord) {
      // Create new conversation
      const { data: created, error: createError } = await supabase
        .from("tutor_conversations")
        .insert({
          student_id: user.id,
          concept_id: conceptId,
          context_type: contextType,
        })
        .select()
        .single();

      if (createError) {
        console.warn("Could not insert tutor_conversations:", createError.message);
        // Fallback to ephemeral session if table is missing or write fails
        return {
          success: true,
          conversation: {
            id: `temp_${Date.now()}`,
            studentId: user.id,
            conceptId,
            contextType,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messages: [],
          },
        };
      }
      conversationRecord = created;
    }

    // Fetch messages for this conversation
    const { data: messageRows } = await supabase
      .from("tutor_messages")
      .select("id, role, content, language, created_at")
      .eq("conversation_id", conversationRecord.id)
      .order("created_at", { ascending: true })
      .limit(30);

    const messages: TutorMessage[] = (messageRows || []).map((row) => ({
      id: row.id,
      role: row.role as "user" | "assistant",
      content: row.content,
      createdAt: row.created_at,
      language: (row.language as TutorLanguage) || "en",
    }));

    return {
      success: true,
      conversation: {
        id: conversationRecord.id,
        studentId: conversationRecord.student_id,
        conceptId: conversationRecord.concept_id as ConceptId,
        contextType: conversationRecord.context_type,
        createdAt: conversationRecord.created_at,
        updatedAt: conversationRecord.updated_at,
        messages,
      },
    };
  } catch (err) {
    console.error("Error in getOrCreateTutorConversation:", err);
    return { success: false, error: "Failed to load tutor conversation." };
  }
}

/**
 * Server Action: Save a message to the persistent tutor conversation.
 */
export async function saveTutorMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  language: TutorLanguage = "en"
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!isSupabaseConfigured() || conversationId.startsWith("ephemeral_") || conversationId.startsWith("temp_")) {
    return { success: true, messageId: `msg_${Date.now()}` };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Authentication required." };
    }

    const { data: inserted, error: insertError } = await supabase
      .from("tutor_messages")
      .insert({
        conversation_id: conversationId,
        role,
        content,
        language,
      })
      .select("id")
      .single();

    if (insertError) {
      console.warn("Could not persist tutor message:", insertError.message);
      return { success: false, error: insertError.message };
    }

    // Touch conversation updated_at
    await supabase
      .from("tutor_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    return { success: true, messageId: inserted?.id };
  } catch (err) {
    console.error("Error in saveTutorMessage:", err);
    return { success: false, error: "Failed to save message." };
  }
}
