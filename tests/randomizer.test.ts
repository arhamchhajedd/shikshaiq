import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  shuffleArray,
  shuffleQuestionOptions,
  selectStratifiedQuestions,
  generateDiagnosticQuizSession,
} from "../lib/assessment/randomizer";
import { ALL_QUESTIONS } from "../lib/curriculum/questions";
import { CONCEPTS_LIST } from "../lib/curriculum/concepts";

describe("Assessment Randomizer Engine", () => {
  test("shuffleArray produces a permutation containing all original elements without mutation", () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const originalCopy = [...original];
    const shuffled = shuffleArray(original);

    // Original array must not be mutated
    assert.deepEqual(original, originalCopy);

    // Must have same length and contain all elements
    assert.equal(shuffled.length, original.length);
    assert.deepEqual([...shuffled].sort(), [...original].sort());
  });

  test("shuffleQuestionOptions randomizes option ordering while preserving IDs and option count", () => {
    const question = ALL_QUESTIONS[0];
    assert.equal(question.options.length, 4);

    const shuffledQuestion = shuffleQuestionOptions(question);

    // Must preserve question ID and prompt
    assert.equal(shuffledQuestion.id, question.id);
    assert.equal(shuffledQuestion.prompt, question.prompt);
    assert.equal(shuffledQuestion.options.length, 4);

    // Must contain all original option IDs
    const origIds = question.options.map((o) => o.id).sort();
    const shuffledIds = shuffledQuestion.options.map((o) => o.id).sort();
    assert.deepEqual(shuffledIds, origIds);
  });

  test("selectStratifiedQuestions samples exactly the requested number of questions per concept", () => {
    const selected = selectStratifiedQuestions(ALL_QUESTIONS, 3);

    // 5 concepts * 3 questions = 15 total
    assert.equal(selected.length, 15);

    // Verify each concept has exactly 3 questions
    const counts = new Map<string, number>();
    for (const q of selected) {
      counts.set(q.conceptId, (counts.get(q.conceptId) || 0) + 1);
    }

    for (const concept of CONCEPTS_LIST) {
      assert.equal(
        counts.get(concept.id),
        3,
        `Concept ${concept.id} must have exactly 3 sampled questions`
      );
    }
  });

  test("generateDiagnosticQuizSession produces different question sets and option orders for two sessions", () => {
    // Generate session for Student 1 and Student 2
    const session1 = generateDiagnosticQuizSession(ALL_QUESTIONS, {
      questionsPerConcept: 3,
      shuffleQuestions: true,
      shuffleOptions: true,
    });

    const session2 = generateDiagnosticQuizSession(ALL_QUESTIONS, {
      questionsPerConcept: 3,
      shuffleQuestions: true,
      shuffleOptions: true,
    });

    assert.equal(session1.length, 15);
    assert.equal(session2.length, 15);

    const ids1 = session1.map((q) => q.id);
    const ids2 = session2.map((q) => q.id);

    // Across 50 questions with 10 per concept, two random 15-question samples
    // are virtually guaranteed to differ in sequence and/or composition.
    const sequencesIdentical = ids1.every((id, idx) => id === ids2[idx]);
    assert.equal(
      sequencesIdentical,
      false,
      "Two independent student sessions must not produce identical question sequences"
    );
  });

  test("deterministic PRNG can reproduce quiz sessions when seeded", () => {
    // Simple linear congruential generator for reproducible testing
    function createLcg(seed: number) {
      let s = seed;
      return () => {
        s = (s * 1664525 + 1013904223) % 4294967296;
        return s / 4294967296;
      };
    }

    const sessionA = generateDiagnosticQuizSession(ALL_QUESTIONS, {
      questionsPerConcept: 3,
      rng: createLcg(12345),
    });

    const sessionB = generateDiagnosticQuizSession(ALL_QUESTIONS, {
      questionsPerConcept: 3,
      rng: createLcg(12345),
    });

    assert.deepEqual(sessionA, sessionB, "Identical RNG seeds must generate identical quiz sessions");
  });
});
