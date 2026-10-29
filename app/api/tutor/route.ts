import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { CONCEPTS } from "@/lib/curriculum/concepts";
import { CONCEPT_LESSONS } from "@/lib/curriculum/lessons";
import { ALL_QUESTIONS } from "@/lib/curriculum/questions";
import { ConceptId } from "@/types/curriculum";
import { TutorApiResponse, TutorLanguage, TutorMessage } from "@/types/tutor";
import { buildTutorSystemPrompt } from "@/lib/tutor/prompts";
import { getTutorProvider } from "@/lib/tutor/provider";
import { checkTutorRateLimit } from "@/lib/tutor/rateLimiter";
import { getOrCreateTutorConversation, saveTutorMessage } from "@/lib/tutor/tutorActions";

const tutorRequestSchema = z.object({
  conceptId: z.enum([
    "fraction-basics",
    "common-multiples",
    "equivalent-fractions",
    "adding-fractions",
    "mixed-fractions",
  ] as const, {
    message: "Invalid or unsupported curriculum concept identifier.",
  }),
  contextType: z.enum(["learn", "practice", "assessment", "general"]).default("learn"),
  message: z
    .string()
    .trim()
    .min(1, "Message cannot be empty.")
    .max(500, "Message cannot exceed 500 characters."),
  language: z.enum(["en", "hi", "mr"]).default("en"),
  conversationId: z.string().optional(),
  currentQuestionId: z.string().optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse<TutorApiResponse>> {
  try {
    // 1. Parse and validate JSON payload
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body.", errorCode: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const parsed = tutorRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || "Invalid request parameters.",
          errorCode: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const { conceptId, contextType, message, language, currentQuestionId } = parsed.data;
    let conversationId = parsed.data.conversationId;

    // 2. Authentication & Authorization Check
    let userId = "demo_student";
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
            error: "Authentication required to access ShikshaIQ AI Tutor.",
            errorCode: "UNAUTHORIZED",
          },
          { status: 401 }
        );
      }

      userId = user.id;

      // Verify user account status
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, account_status")
        .eq("id", user.id)
        .single();

      if (profile && profile.account_status === "suspended") {
        return NextResponse.json(
          {
            success: false,
            error: "Your account is suspended. Please contact platform administrators.",
            errorCode: "UNAUTHORIZED",
          },
          { status: 403 }
        );
      }
    }

    // 3. Enforce Rate Limiting
    const rateCheck = checkTutorRateLimit(userId);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Rate limit reached. Please wait ${rateCheck.retryAfterSeconds} seconds before sending another question.`,
          errorCode: "RATE_LIMITED",
        },
        { status: 429 }
      );
    }

    // 4. Retrieve or Create Conversation in Supabase
    if (!conversationId) {
      const convRes = await getOrCreateTutorConversation(conceptId as ConceptId, contextType);
      if (convRes.success && convRes.conversation) {
        conversationId = convRes.conversation.id;
      }
    }

    // 5. Gather Authorized Curriculum Context (NEVER INCLUDE PROTECTED ANSWER KEYS!)
    const conceptMeta = CONCEPTS[conceptId as ConceptId];
    const lessonMeta = CONCEPT_LESSONS[conceptId as ConceptId];

    let currentQuestionPrompt: string | undefined;
    let currentQuestionOptions: string[] | undefined;

    if (currentQuestionId) {
      const q = ALL_QUESTIONS.find((item) => item.id === currentQuestionId && item.conceptId === conceptId);
      if (q) {
        currentQuestionPrompt = q.prompt;
        currentQuestionOptions = q.options.map((opt) => opt.text);
        // Note: ANSWER_KEYS is NEVER accessed or passed to the prompt!
      }
    }

    const systemPrompt = buildTutorSystemPrompt({
      conceptId: conceptId as ConceptId,
      conceptTitle: conceptMeta.title,
      learningObjective: lessonMeta?.learningObjective || conceptMeta.description,
      lessonSummary: lessonMeta ? lessonMeta.summary.slice(0, 300) : undefined,
      contextType,
      language: language as TutorLanguage,
      currentQuestionPrompt,
      currentQuestionOptions,
    });

    // 6. Check Provider Configuration
    const provider = getTutorProvider();
    if (!provider.isConfigured()) {
      return NextResponse.json(
        {
          success: false,
          conversationId,
          error:
            "ShikshaIQ AI Tutor is currently offline because no AI provider is configured. Please add GEMINI_API_KEY or OPENAI_API_KEY to your server environment (.env.local).",
          errorCode: "UNCONFIGURED",
        },
        { status: 503 }
      );
    }

    // 7. Save user message to persistent storage
    if (conversationId) {
      await saveTutorMessage(conversationId, "user", message, language as TutorLanguage);
    }

    // 8. Generate Socratic Response
    const providerResult = await provider.generateResponse({
      systemPrompt,
      userMessage: message,
      conversationHistory: [], // Recent history managed per conversation
      language: language as TutorLanguage,
    });

    const assistantMessage: TutorMessage = {
      id: `msg_${Date.now()}`,
      role: "assistant",
      content: providerResult.text,
      createdAt: new Date().toISOString(),
      language: language as TutorLanguage,
    };

    // 9. Save assistant message to persistent storage
    if (conversationId) {
      await saveTutorMessage(conversationId, "assistant", assistantMessage.content, language as TutorLanguage);
    }

    return NextResponse.json({
      success: true,
      conversationId,
      message: assistantMessage,
      suggestedActions: [
        "Give me another example",
        "Explain step-by-step",
        "Give me a hint",
      ],
    });
  } catch (err: unknown) {
    console.error("AI Tutor Route Error:", err);
    const message = err instanceof Error ? err.message : "An unexpected tutoring error occurred.";
    const isTimeout = message.toLowerCase().includes("timeout") || message.toLowerCase().includes("aborted");

    return NextResponse.json(
      {
        success: false,
        error: isTimeout
          ? "The AI Tutor request timed out. Please try asking again."
          : "The AI Tutor encountered a service error. Please try again shortly.",
        errorCode: isTimeout ? "TIMEOUT" : "PROVIDER_ERROR",
      },
      { status: isTimeout ? 504 : 502 }
    );
  }
}
