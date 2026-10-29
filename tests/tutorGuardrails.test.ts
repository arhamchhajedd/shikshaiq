import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { buildTutorSystemPrompt, TUTOR_QUICK_ACTIONS } from "../lib/tutor/prompts";
import {
  NullTutorProvider,
  GeminiTutorProvider,
  OpenAITutorProvider,
  getTutorProvider,
} from "../lib/tutor/provider";
import { checkTutorRateLimit, resetTutorRateLimit } from "../lib/tutor/rateLimiter";
import { TutorCurriculumContext } from "../types/tutor";
import { ANSWER_KEYS } from "../lib/curriculum/answerKeys.server";

describe("Phase 06 AI Tutor — Provider Abstraction & Configuration", () => {
  test("NullTutorProvider returns false for isConfigured and throws clear error", async () => {
    const nullProvider = new NullTutorProvider();
    assert.equal(nullProvider.isConfigured(), false);
    assert.equal(nullProvider.getProviderName(), "unconfigured");

    await assert.rejects(
      async () => {
        await nullProvider.generateResponse({
          systemPrompt: "test",
          userMessage: "hello",
          conversationHistory: [],
          language: "en",
        });
      },
      {
        message: /AI Tutor provider is not configured/,
      }
    );
  });

  test("GeminiTutorProvider and OpenAITutorProvider reflect configuration state correctly", () => {
    const unconfiguredGemini = new GeminiTutorProvider("");
    assert.equal(unconfiguredGemini.isConfigured(), false);

    const configuredGemini = new GeminiTutorProvider("test-key-123", "gemini-1.5-flash");
    assert.equal(configuredGemini.isConfigured(), true);
    assert.equal(configuredGemini.getProviderName(), "google-gemini (gemini-1.5-flash)");

    const unconfiguredOpenAI = new OpenAITutorProvider("");
    assert.equal(unconfiguredOpenAI.isConfigured(), false);

    const configuredOpenAI = new OpenAITutorProvider("sk-test-456", "gpt-4o-mini");
    assert.equal(configuredOpenAI.isConfigured(), true);
    assert.equal(configuredOpenAI.getProviderName(), "openai (gpt-4o-mini)");
  });

  test("getTutorProvider falls back to NullTutorProvider when no env vars set", () => {
    const originalGemini = process.env.GEMINI_API_KEY;
    const originalOpenAI = process.env.OPENAI_API_KEY;
    try {
      delete process.env.GEMINI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      const provider = getTutorProvider();
      assert.equal(provider.isConfigured(), false);
    } finally {
      if (originalGemini) process.env.GEMINI_API_KEY = originalGemini;
      if (originalOpenAI) process.env.OPENAI_API_KEY = originalOpenAI;
    }
  });
});

describe("Phase 06 AI Tutor — Socratic Prompts & Guardrails", () => {
  const baseContext: TutorCurriculumContext = {
    conceptId: "common-multiples",
    conceptTitle: "Common Multiples",
    learningObjective: "Calculate LCM of small integers.",
    contextType: "learn",
    language: "en",
    lessonSummary: "A common multiple is a shared multiple of two or more numbers.",
  };

  test("builds system prompt with concept, objective, and Socratic instructions in English", () => {
    const prompt = buildTutorSystemPrompt(baseContext);

    assert.ok(prompt.includes("Common Multiples"));
    assert.ok(prompt.includes("Calculate LCM of small integers."));
    assert.ok(prompt.includes("Socratic Guidance: Never just hand out the final answer."));
    assert.ok(prompt.includes("Relatable Indian Analogies"));
    assert.ok(prompt.includes("Prompt Injection Defense"));
    assert.ok(prompt.includes("Answer Key Protection"));
  });

  test("supports Hindi and Marathi language instructions accurately", () => {
    const hindiPrompt = buildTutorSystemPrompt({ ...baseContext, language: "hi" });
    assert.ok(hindiPrompt.includes("Hindi (हिंदी)"));
    assert.ok(hindiPrompt.includes("ल.स.प."));

    const marathiPrompt = buildTutorSystemPrompt({ ...baseContext, language: "mr" });
    assert.ok(marathiPrompt.includes("Marathi (मराठी)"));
    assert.ok(marathiPrompt.includes("अपूर्णांक"));
  });

  test("NEVER includes protected answer keys in practice context prompts", () => {
    const practiceContext: TutorCurriculumContext = {
      ...baseContext,
      contextType: "practice",
      currentQuestionPrompt: "What is the LCM of 4 and 6?",
      currentQuestionOptions: ["A: 2", "B: 12", "C: 24", "D: 10"],
    };

    const prompt = buildTutorSystemPrompt(practiceContext);

    // Verify prompt contains question stem and options
    assert.ok(prompt.includes("What is the LCM of 4 and 6?"));
    assert.ok(prompt.includes("B: 12"));

    // Verify it instructs model NOT to reveal correct option
    assert.ok(prompt.includes("DO NOT REVEAL THE CORRECT OPTION"));

    // Verify answer key from ANSWER_KEYS is not injected into the prompt
    const realKey = ANSWER_KEYS["q_cm_01"];
    assert.equal(realKey.correctAnswerId, "opt_b");
    assert.ok(!prompt.includes("opt_b is correct"));
    assert.ok(!prompt.includes("correctOption: opt_b"));
  });

  test("quick action prompts are defined for English, Hindi, and Marathi", () => {
    assert.equal(TUTOR_QUICK_ACTIONS.en.length, 4);
    assert.equal(TUTOR_QUICK_ACTIONS.hi.length, 4);
    assert.equal(TUTOR_QUICK_ACTIONS.mr.length, 4);

    assert.equal(TUTOR_QUICK_ACTIONS.en[0].label, "Explain simply");
    assert.equal(TUTOR_QUICK_ACTIONS.hi[0].label, "सरल भाषा में समझाएं");
    assert.equal(TUTOR_QUICK_ACTIONS.mr[0].label, "सोप्या भाषेत सांगा");
  });
});

describe("Phase 06 AI Tutor — Rate Limiting", () => {
  const testUserId = "test-student-rate-limit-123";

  test("allows requests up to the 15 per minute threshold", () => {
    resetTutorRateLimit(testUserId);

    for (let i = 0; i < 15; i++) {
      const res = checkTutorRateLimit(testUserId);
      assert.equal(res.allowed, true, `Request ${i + 1} should be allowed`);
    }

    // 16th request must be blocked
    const blocked = checkTutorRateLimit(testUserId);
    assert.equal(blocked.allowed, false);
    assert.equal(blocked.remaining, 0);
    assert.ok((blocked.retryAfterSeconds || 0) > 0);

    resetTutorRateLimit(testUserId);
  });
});
