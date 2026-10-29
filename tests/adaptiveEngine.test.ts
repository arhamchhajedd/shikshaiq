import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateConceptMastery,
  recommendNextAction,
  validateConceptGraph,
  ConceptGraphError,
  getDefaultGraphNodes,
  StudentAttemptInput,
  ConceptMasteryRecord,
  AdaptiveGraphNode,
} from "../lib/adaptive";
import { ConceptId } from "../types/curriculum";

describe("Adaptive Learning Engine — Mastery Calculation", () => {
  it("evaluates 0 attempts as not_started with null score", () => {
    const res = calculateConceptMastery("fraction-basics", []);
    assert.equal(res.status, "not_started");
    assert.equal(res.masteryScore, null);
    assert.equal(res.validEvidenceCount, 0);
  });

  it("evaluates below 50% as needs_revision", () => {
    const attempts: StudentAttemptInput[] = [
      { questionId: "q1", conceptId: "fraction-basics", selectedOptionId: "opt_a", isCorrect: true },
      { questionId: "q2", conceptId: "fraction-basics", selectedOptionId: "opt_b", isCorrect: false },
      { questionId: "q3", conceptId: "fraction-basics", selectedOptionId: "opt_c", isCorrect: false },
    ];
    const res = calculateConceptMastery("fraction-basics", attempts);
    assert.equal(res.status, "needs_revision");
    assert.equal(res.masteryScore, 33);
    assert.equal(res.validEvidenceCount, 3);
  });

  it("evaluates 50% to 79% as partial", () => {
    const attempts: StudentAttemptInput[] = [
      { questionId: "q1", conceptId: "common-multiples", selectedOptionId: "opt_a", isCorrect: true },
      { questionId: "q2", conceptId: "common-multiples", selectedOptionId: "opt_b", isCorrect: true },
      { questionId: "q3", conceptId: "common-multiples", selectedOptionId: "opt_c", isCorrect: false },
    ];
    const res = calculateConceptMastery("common-multiples", attempts);
    assert.equal(res.status, "partial");
    assert.equal(res.masteryScore, 67);
    assert.equal(res.validEvidenceCount, 3);
  });

  it("evaluates 80%+ with at least 2 attempts as mastered", () => {
    const attempts: StudentAttemptInput[] = [
      { questionId: "q1", conceptId: "equivalent-fractions", selectedOptionId: "opt_a", isCorrect: true },
      { questionId: "q2", conceptId: "equivalent-fractions", selectedOptionId: "opt_b", isCorrect: true },
    ];
    const res = calculateConceptMastery("equivalent-fractions", attempts);
    assert.equal(res.status, "mastered");
    assert.equal(res.masteryScore, 100);
    assert.equal(res.validEvidenceCount, 2);
  });

  it("classifies 100% with only 1 attempt as partial (insufficient evidence requirement)", () => {
    const attempts: StudentAttemptInput[] = [
      { questionId: "q1", conceptId: "mixed-fractions", selectedOptionId: "opt_a", isCorrect: true },
    ];
    const res = calculateConceptMastery("mixed-fractions", attempts);
    // Even though 100%, minimum 2 valid attempts are required for full mastery
    assert.equal(res.status, "partial");
    assert.equal(res.masteryScore, 100);
    assert.equal(res.validEvidenceCount, 1);
  });

  it("deduplicates multiple attempts on the same question without double counting", () => {
    const attempts: StudentAttemptInput[] = [
      { questionId: "q1", conceptId: "fraction-basics", selectedOptionId: "opt_a", isCorrect: false },
      { questionId: "q1", conceptId: "fraction-basics", selectedOptionId: "opt_b", isCorrect: true }, // latest attempt on q1
      { questionId: "q2", conceptId: "fraction-basics", selectedOptionId: "opt_a", isCorrect: true },
    ];
    const res = calculateConceptMastery("fraction-basics", attempts);
    assert.equal(res.validEvidenceCount, 2);
    assert.equal(res.masteryScore, 100);
    assert.equal(res.status, "mastered");
  });

  it("produces identical output for identical inputs (deterministic property)", () => {
    const attempts: StudentAttemptInput[] = [
      { questionId: "q1", conceptId: "adding-fractions", selectedOptionId: "opt_a", isCorrect: true },
      { questionId: "q2", conceptId: "adding-fractions", selectedOptionId: "opt_b", isCorrect: false },
      { questionId: "q3", conceptId: "adding-fractions", selectedOptionId: "opt_c", isCorrect: true },
    ];
    const res1 = calculateConceptMastery("adding-fractions", attempts);
    const res2 = calculateConceptMastery("adding-fractions", attempts);
    assert.deepEqual(res1.status, res2.status);
    assert.deepEqual(res1.masteryScore, res2.masteryScore);
    assert.deepEqual(res1.validEvidenceCount, res2.validEvidenceCount);
  });
});

describe("Adaptive Learning Engine — Concept Graph DAG Validation", () => {
  it("accepts valid default Class 7 Fractions DAG without errors", () => {
    const nodes = getDefaultGraphNodes();
    assert.doesNotThrow(() => validateConceptGraph(nodes));
  });

  it("detects and rejects self-loops in prerequisite graph", () => {
    const badNodes: AdaptiveGraphNode[] = [
      {
        id: "fraction-basics",
        title: "Fraction Basics",
        shortTitle: "Basics",
        description: "",
        gradeLevel: 7,
        order: 1,
        prerequisites: ["fraction-basics"], // self loop
      },
    ];
    assert.throws(() => validateConceptGraph(badNodes), ConceptGraphError);
  });

  it("detects and rejects cycles across multiple nodes", () => {
    const cyclicNodes: AdaptiveGraphNode[] = [
      {
        id: "fraction-basics",
        title: "Fraction Basics",
        shortTitle: "Basics",
        description: "",
        gradeLevel: 7,
        order: 1,
        prerequisites: ["equivalent-fractions"],
      },
      {
        id: "equivalent-fractions",
        title: "Equivalent Fractions",
        shortTitle: "Equiv",
        description: "",
        gradeLevel: 7,
        order: 2,
        prerequisites: ["fraction-basics"], // creates cycle
      },
    ];
    assert.throws(() => validateConceptGraph(cyclicNodes), /Cycle detected/);
  });

  it("detects and rejects unknown prerequisite references", () => {
    const brokenNodes: AdaptiveGraphNode[] = [
      {
        id: "adding-fractions",
        title: "Adding Fractions",
        shortTitle: "Adding",
        description: "",
        gradeLevel: 7,
        order: 1,
        prerequisites: ["non-existent-concept" as unknown as ConceptId],
      },
    ];
    assert.throws(() => validateConceptGraph(brokenNodes), /Unknown prerequisite/);
  });
});

describe("Adaptive Learning Engine — Recommendation Generation", () => {
  it("recommends prerequisite remediation when a prerequisite gap blocks target concept", () => {
    // Rohan scenario: Trying to learn Adding Fractions, but Common Multiples (LCM) is weak
    const masteries: Record<string, ConceptMasteryRecord> = {
      "fraction-basics": {
        conceptId: "fraction-basics",
        masteryScore: 100,
        status: "mastered",
        validEvidenceCount: 3,
      },
      "common-multiples": {
        conceptId: "common-multiples",
        masteryScore: 33, // GAP
        status: "needs_revision",
        validEvidenceCount: 3,
      },
      "equivalent-fractions": {
        conceptId: "equivalent-fractions",
        masteryScore: 100,
        status: "mastered",
        validEvidenceCount: 3,
      },
      "adding-fractions": {
        conceptId: "adding-fractions",
        masteryScore: 33,
        status: "needs_revision",
        validEvidenceCount: 3,
      },
      "mixed-fractions": {
        conceptId: "mixed-fractions",
        masteryScore: 0,
        status: "needs_revision",
        validEvidenceCount: 3,
      },
    };

    const rec = recommendNextAction({
      masteries,
      currentTargetConceptId: "adding-fractions",
    });

    assert.equal(rec.recommendationType, "prerequisite_remediation");
    assert.equal(rec.recommendedConceptId, "common-multiples");
    assert.match(rec.reason, /Common Multiples/);
    assert.equal(rec.prerequisiteFindings.find((f) => f.prerequisiteId === "common-multiples")?.isBlocker, true);
  });

  it("uses deterministic tie-breaker when multiple prerequisites are weak (root concept first)", () => {
    // Both fraction-basics and equivalent-fractions are weak
    const masteries: Record<string, ConceptMasteryRecord> = {
      "fraction-basics": {
        conceptId: "fraction-basics",
        masteryScore: 33,
        status: "needs_revision",
        validEvidenceCount: 3,
      },
      "common-multiples": {
        conceptId: "common-multiples",
        masteryScore: 100,
        status: "mastered",
        validEvidenceCount: 3,
      },
      "equivalent-fractions": {
        conceptId: "equivalent-fractions",
        masteryScore: 33,
        status: "needs_revision",
        validEvidenceCount: 3,
      },
      "adding-fractions": {
        conceptId: "adding-fractions",
        masteryScore: 33,
        status: "needs_revision",
        validEvidenceCount: 3,
      },
      "mixed-fractions": {
        conceptId: "mixed-fractions",
        masteryScore: null,
        status: "not_started",
        validEvidenceCount: 0,
      },
    };

    const rec = recommendNextAction({
      masteries,
      currentTargetConceptId: "adding-fractions",
    });

    // fraction-basics has order 1 (root), equivalent-fractions has order 3 -> fraction-basics recommended first
    assert.equal(rec.recommendationType, "prerequisite_remediation");
    assert.equal(rec.recommendedConceptId, "fraction-basics");
  });

  it("recommends guided practice on target concept when all its prerequisites are mastered", () => {
    const masteries: Record<string, ConceptMasteryRecord> = {
      "fraction-basics": {
        conceptId: "fraction-basics",
        masteryScore: 100,
        status: "mastered",
        validEvidenceCount: 3,
      },
      "common-multiples": {
        conceptId: "common-multiples",
        masteryScore: 100,
        status: "mastered",
        validEvidenceCount: 3,
      },
      "equivalent-fractions": {
        conceptId: "equivalent-fractions",
        masteryScore: 100,
        status: "mastered",
        validEvidenceCount: 3,
      },
      "adding-fractions": {
        conceptId: "adding-fractions",
        masteryScore: 67, // Partial
        status: "partial",
        validEvidenceCount: 3,
      },
      "mixed-fractions": {
        conceptId: "mixed-fractions",
        masteryScore: null,
        status: "not_started",
        validEvidenceCount: 0,
      },
    };

    const rec = recommendNextAction({
      masteries,
      currentTargetConceptId: "adding-fractions",
    });

    assert.equal(rec.recommendationType, "guided_practice");
    assert.equal(rec.recommendedConceptId, "adding-fractions");
  });

  it("recommends advancement when current target concept is already mastered", () => {
    const masteries: Record<string, ConceptMasteryRecord> = {
      "fraction-basics": {
        conceptId: "fraction-basics",
        masteryScore: 100,
        status: "mastered",
        validEvidenceCount: 3,
      },
      "common-multiples": {
        conceptId: "common-multiples",
        masteryScore: 100,
        status: "mastered",
        validEvidenceCount: 3,
      },
      "equivalent-fractions": {
        conceptId: "equivalent-fractions",
        masteryScore: 100,
        status: "mastered",
        validEvidenceCount: 3,
      },
      "adding-fractions": {
        conceptId: "adding-fractions",
        masteryScore: 100,
        status: "mastered",
        validEvidenceCount: 3,
      },
      "mixed-fractions": {
        conceptId: "mixed-fractions",
        masteryScore: null,
        status: "not_started",
        validEvidenceCount: 0,
      },
    };

    const rec = recommendNextAction({
      masteries,
      currentTargetConceptId: "adding-fractions",
    });

    assert.equal(rec.recommendationType, "advancement");
    assert.equal(rec.recommendedConceptId, "mixed-fractions");
  });

  it("indicates curriculum complete when all graph nodes are mastered", () => {
    const masteries: Record<string, ConceptMasteryRecord> = {
      "fraction-basics": { conceptId: "fraction-basics", masteryScore: 100, status: "mastered", validEvidenceCount: 3 },
      "common-multiples": { conceptId: "common-multiples", masteryScore: 100, status: "mastered", validEvidenceCount: 3 },
      "equivalent-fractions": { conceptId: "equivalent-fractions", masteryScore: 100, status: "mastered", validEvidenceCount: 3 },
      "adding-fractions": { conceptId: "adding-fractions", masteryScore: 100, status: "mastered", validEvidenceCount: 3 },
      "mixed-fractions": { conceptId: "mixed-fractions", masteryScore: 100, status: "mastered", validEvidenceCount: 3 },
    };

    const rec = recommendNextAction({ masteries });
    assert.equal(rec.recommendationType, "curriculum_complete");
  });
});
