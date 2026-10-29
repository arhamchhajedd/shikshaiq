import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  scoreAssessment,
  evaluateMasteryStatus,
} from "../lib/assessment/scoring";
import { ANSWER_KEYS } from "../lib/curriculum/answerKeys.server";
import { DIAGNOSTIC_QUESTIONS } from "../lib/curriculum/questions";
import { ROHAN_ANSWERS, AARAV_ANSWERS } from "../lib/demo/personas";
import { StudentAnswer } from "../types/assessment";

describe("evaluateMasteryStatus", () => {
  test("evaluates 3 of 3 as mastered (100%)", () => {
    assert.equal(evaluateMasteryStatus(3, 3), "mastered");
  });

  test("evaluates 4 of 5 as mastered (80%)", () => {
    assert.equal(evaluateMasteryStatus(4, 5), "mastered");
  });

  test("evaluates 2 of 3 as partial (~67%)", () => {
    assert.equal(evaluateMasteryStatus(2, 3), "partial");
  });

  test("evaluates 1 of 3 as needs_revision (~33%)", () => {
    assert.equal(evaluateMasteryStatus(1, 3), "needs_revision");
  });

  test("evaluates 0 of 3 as needs_revision (0%)", () => {
    assert.equal(evaluateMasteryStatus(0, 3), "needs_revision");
  });
});

describe("scoreAssessment", () => {
  test("scores a perfect submission correctly", () => {
    const perfectAnswers: StudentAnswer[] = DIAGNOSTIC_QUESTIONS.map((q) => ({
      questionId: q.id,
      selectedOptionId: ANSWER_KEYS[q.id].correctAnswerId,
    }));

    const result = scoreAssessment(perfectAnswers);

    assert.equal(result.totalQuestions, 15);
    assert.equal(result.totalCorrect, 15);
    assert.equal(result.percentage, 100);
    assert.equal(result.strongConcepts.length, 5);
    assert.equal(result.revisionConcepts.length, 0);

    for (const conceptId of Object.keys(result.conceptBreakdown)) {
      const item = result.conceptBreakdown[conceptId as keyof typeof result.conceptBreakdown];
      assert.equal(item.status, "mastered");
      assert.equal(item.correctCount, 3);
      assert.equal(item.totalQuestions, 3);
    }
  });

  test("scores an all-incorrect submission correctly", () => {
    const allWrongAnswers: StudentAnswer[] = DIAGNOSTIC_QUESTIONS.map((q) => ({
      questionId: q.id,
      selectedOptionId: "opt_wrong",
    }));

    const result = scoreAssessment(allWrongAnswers);

    assert.equal(result.totalQuestions, 15);
    assert.equal(result.totalCorrect, 0);
    assert.equal(result.percentage, 0);
    assert.equal(result.strongConcepts.length, 0);
    assert.equal(result.revisionConcepts.length, 5);

    // Root gap recommendation should flag Fraction Basics first
    assert.equal(result.recommendedConceptId, "fraction-basics");
  });

  test("correctly detects prerequisite bottleneck for Rohan persona", () => {
    const result = scoreAssessment(ROHAN_ANSWERS);

    assert.equal(result.totalQuestions, 15);
    assert.equal(result.totalCorrect, 6);
    assert.equal(result.percentage, 40);

    // Fraction basics should be mastered (3/3)
    assert.equal(result.conceptBreakdown["fraction-basics"].status, "mastered");
    assert.equal(result.conceptBreakdown["fraction-basics"].correctCount, 3);

    // Common multiples should need revision (0/3)
    assert.equal(result.conceptBreakdown["common-multiples"].status, "needs_revision");
    assert.equal(result.conceptBreakdown["common-multiples"].correctCount, 0);

    // Adding fractions should need revision (1/3)
    assert.equal(result.conceptBreakdown["adding-fractions"].status, "needs_revision");

    // The recommendation must route to Common Multiples first!
    assert.equal(result.recommendedConceptId, "common-multiples");
    assert.match(result.recommendedNextStep, /Common Multiples/i);
  });

  test("scores Aarav persona as high mastery", () => {
    const result = scoreAssessment(AARAV_ANSWERS);

    assert.equal(result.totalQuestions, 15);
    assert.equal(result.totalCorrect, 14);
    assert.equal(result.percentage, 93);
    assert.ok(result.strongConcepts.includes("Fraction Basics"));
    assert.ok(result.strongConcepts.includes("Common Multiples"));
    assert.ok(result.strongConcepts.includes("Adding Fractions"));
  });
});
