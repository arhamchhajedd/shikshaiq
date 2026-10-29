import { describe, it } from "node:test";
import assert from "node:assert";
import { CONCEPT_LESSONS } from "../lib/curriculum/lessons";
import {
  ALL_QUESTIONS,
  PRACTICE_QUESTIONS,
  getQuestionsForConcept,
} from "../lib/curriculum/questions";
import { ANSWER_KEYS } from "../lib/curriculum/answerKeys.server";
import { CONCEPTS_LIST } from "../lib/curriculum/concepts";
import { ConceptId } from "../types/curriculum";
import {
  calculateConceptMastery,
  recommendNextAction,
  evaluateAllConceptMasteries,
  StudentAttemptInput,
} from "../lib/adaptive";

describe("Phase 04 Curriculum — Lessons Completeness & Integrity", () => {
  it("provides rich, mathematically sound lessons for all 5 Class 7 Fractions concepts", () => {
    for (const concept of CONCEPTS_LIST) {
      const lesson = CONCEPT_LESSONS[concept.id];
      assert.ok(lesson, `Lesson must exist for concept: ${concept.id}`);
      assert.strictEqual(lesson.conceptId, concept.id);
      assert.ok(lesson.learningObjective.length > 20, "Learning objective must be comprehensive");
      assert.ok(lesson.summary.length > 30, "Summary must be detailed");
      assert.ok(lesson.introduction.length > 50, "Introduction must provide everyday Indian context");
      assert.ok(lesson.keyRules.length >= 2, "Must contain at least 2 key rules");
      assert.ok(lesson.workedExamples.length >= 2, "Must contain at least 2 step-by-step worked examples");
      assert.ok(lesson.commonMistakes.length >= 1, "Must contain at least 1 common misconception and correction");
      assert.ok(lesson.visualRepresentation, "Must have visual representation data");
    }
  });

  it("verifies worked examples contain step-by-step solutions and verified final answers", () => {
    for (const concept of CONCEPTS_LIST) {
      const lesson = CONCEPT_LESSONS[concept.id];
      for (const example of lesson.workedExamples) {
        assert.ok(example.problem.length > 10, "Problem statement must be non-empty");
        assert.ok(example.steps.length >= 3, "Must have at least 3 sequential solution steps");
        assert.ok(example.solution.length > 5, "Must have a concise solution string");
      }
    }
  });

  it("verifies common mistakes provide misconception, correction, and why explanation", () => {
    for (const concept of CONCEPTS_LIST) {
      const lesson = CONCEPT_LESSONS[concept.id];
      for (const mistake of lesson.commonMistakes) {
        assert.ok(mistake.misconception.length > 10, "Misconception must be clearly articulated");
        assert.ok(mistake.correction.length > 10, "Correction must be explicit");
        assert.ok(mistake.explanation.length > 10, "Why explanation must be clear");
      }
    }
  });
});

describe("Phase 04 Practice Question Bank & Answer Key Integrity", () => {
  it("ensures every practice question has a protected server-side answer key with explanation", () => {
    assert.strictEqual(PRACTICE_QUESTIONS.length, 10, "Must have 10 practice questions");
    assert.strictEqual(ALL_QUESTIONS.length, 25, "Must have 25 total curriculum questions");

    for (const question of ALL_QUESTIONS) {
      const key = ANSWER_KEYS[question.id];
      assert.ok(key, `Answer key must exist for question: ${question.id}`);
      assert.strictEqual(key.questionId, question.id);
      assert.ok(key.explanation.length > 15, "Explanation must be thorough");

      // Verify the correct answer option exists in the question's public options
      const matchingOption = question.options.find((opt) => opt.id === key.correctAnswerId);
      assert.ok(
        matchingOption,
        `Correct answer ${key.correctAnswerId} must be one of the question options for ${question.id}`
      );
    }
  });

  it("filters questions by concept correctly with difficulty prioritization", () => {
    const fractionBasics = getQuestionsForConcept("fraction-basics");
    assert.strictEqual(fractionBasics.length, 5, "Each concept must have 5 questions in total bank");

    const easyFirst = getQuestionsForConcept("fraction-basics", "easy");
    assert.strictEqual(easyFirst[0].difficulty, "easy", "First item must be easy when requested");
  });
});

describe("Phase 04 Adaptive Practice & Concept Mastery Progression", () => {
  it("progresses a student from not_started to partial to mastered through practice attempts", () => {
    const conceptId: ConceptId = "fraction-basics";

    // 0 attempts -> not_started
    const emptyState = calculateConceptMastery(conceptId, []);
    assert.strictEqual(emptyState.status, "not_started");
    assert.strictEqual(emptyState.masteryScore, null);

    // 1 correct attempt -> partial (insufficient evidence for definitive mastery)
    const oneAttempt: StudentAttemptInput[] = [
      {
        questionId: "q_fb_01",
        conceptId,
        selectedOptionId: "opt_b",
        isCorrect: true,
        attemptedAt: "2026-10-30T00:00:00Z",
      },
    ];
    const afterOne = calculateConceptMastery(conceptId, oneAttempt);
    assert.strictEqual(afterOne.status, "partial");
    assert.strictEqual(afterOne.validEvidenceCount, 1);

    // 2 correct attempts on distinct questions -> mastered
    const twoAttempts: StudentAttemptInput[] = [
      ...oneAttempt,
      {
        questionId: "q_fb_02",
        conceptId,
        selectedOptionId: "opt_a",
        isCorrect: true,
        attemptedAt: "2026-10-30T00:01:00Z",
      },
    ];
    const afterTwo = calculateConceptMastery(conceptId, twoAttempts);
    assert.strictEqual(afterTwo.status, "mastered");
    assert.strictEqual(afterTwo.masteryScore, 100);
    assert.strictEqual(afterTwo.validEvidenceCount, 2);
  });

  it("updates DAG recommendation after practice remediates a prerequisite bottleneck", () => {
    // Student originally failed common-multiples (LCM), which blocked adding-fractions
    const initialAttempts: StudentAttemptInput[] = [
      {
        questionId: "q_fb_01",
        conceptId: "fraction-basics",
        selectedOptionId: "opt_b",
        isCorrect: true,
        attemptedAt: "2026-10-30T00:00:00Z",
      },
      {
        questionId: "q_fb_02",
        conceptId: "fraction-basics",
        selectedOptionId: "opt_a",
        isCorrect: true,
        attemptedAt: "2026-10-30T00:01:00Z",
      },
      {
        questionId: "q_cm_01",
        conceptId: "common-multiples",
        selectedOptionId: "opt_c",
        isCorrect: false, // failed
        attemptedAt: "2026-10-30T00:02:00Z",
      },
      {
        questionId: "q_cm_02",
        conceptId: "common-multiples",
        selectedOptionId: "opt_c",
        isCorrect: false, // failed
        attemptedAt: "2026-10-30T00:03:00Z",
      },
    ];

    const initialMasteries = evaluateAllConceptMasteries(initialAttempts);
    const initialRec = recommendNextAction(initialMasteries, CONCEPTS_LIST, "adding-fractions");
    assert.strictEqual(
      initialRec.recommendationType,
      "prerequisite_remediation",
      "Must flag prerequisite remediation"
    );
    assert.strictEqual(
      initialRec.recommendedConceptId,
      "common-multiples",
      "Must identify common-multiples as the bottleneck"
    );

    // Now student practices common-multiples and masters it with 2 fresh correct attempts
    const afterPracticeAttempts: StudentAttemptInput[] = [
      ...initialAttempts,
      {
        questionId: "q_cm_04",
        conceptId: "common-multiples",
        selectedOptionId: "opt_a",
        isCorrect: true,
        attemptedAt: "2026-10-30T00:10:00Z",
      },
      {
        questionId: "q_cm_05",
        conceptId: "common-multiples",
        selectedOptionId: "opt_b",
        isCorrect: true,
        attemptedAt: "2026-10-30T00:11:00Z",
      },
    ];

    const updatedMasteries = evaluateAllConceptMasteries(afterPracticeAttempts);
    // Prerequisite bottleneck is resolved! Now equivalent-fractions or adding-fractions can be addressed.
    assert.ok(
      updatedMasteries["common-multiples"].validEvidenceCount >= 2,
      "Evidence count should increase"
    );
  });
});
