import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  calculateConceptMasteryDistributions,
  generateClassroomInsights,
  generateClassroomAnalyticsSummary,
  StudentMasteryOverview,
} from "../lib/teacher/teacherAnalytics";
import { CONCEPTS } from "../lib/curriculum/concepts";

const FRACTION_CONCEPTS = Object.values(CONCEPTS);

describe("Teacher Analytics Engine — Mastery Distribution", () => {
  test("returns 0% mastery and 100% not_started when students have no assessments", () => {
    const students: StudentMasteryOverview[] = [
      {
        studentId: "s-1",
        studentName: "Aarav Sharma",
        masteries: {},
      },
      {
        studentId: "s-2",
        studentName: "Rohan Patel",
        masteries: {},
      },
    ];

    const distributions = calculateConceptMasteryDistributions(
      FRACTION_CONCEPTS,
      students
    );

    assert.equal(distributions.length, 5);
    for (const dist of distributions) {
      assert.equal(dist.totalStudentsAssessed, 0);
      assert.equal(dist.masteredCount, 0);
      assert.equal(dist.notStartedCount, 2);
      assert.equal(dist.masteryPercentage, 0);
    }
  });

  test("calculates accurate distributions for mixed student masteries", () => {
    const students: StudentMasteryOverview[] = [
      {
        studentId: "s-1",
        studentName: "Aarav",
        masteries: {
          "fraction-basics": {
            conceptId: "fraction-basics",
            masteryScore: 100,
            status: "mastered",
            validEvidenceCount: 3,
            lastEvaluatedAt: new Date().toISOString(),
          },
          "common-multiples": {
            conceptId: "common-multiples",
            masteryScore: 85,
            status: "mastered",
            validEvidenceCount: 3,
            lastEvaluatedAt: new Date().toISOString(),
          },
        },
      },
      {
        studentId: "s-2",
        studentName: "Rohan",
        masteries: {
          "fraction-basics": {
            conceptId: "fraction-basics",
            masteryScore: 80,
            status: "mastered",
            validEvidenceCount: 3,
            lastEvaluatedAt: new Date().toISOString(),
          },
          "common-multiples": {
            conceptId: "common-multiples",
            masteryScore: 33,
            status: "needs_revision",
            validEvidenceCount: 3,
            lastEvaluatedAt: new Date().toISOString(),
          },
        },
      },
      {
        studentId: "s-3",
        studentName: "Priya",
        masteries: {
          "fraction-basics": {
            conceptId: "fraction-basics",
            masteryScore: 66,
            status: "partial",
            validEvidenceCount: 3,
            lastEvaluatedAt: new Date().toISOString(),
          },
          "common-multiples": {
            conceptId: "common-multiples",
            masteryScore: 25,
            status: "needs_revision",
            validEvidenceCount: 4,
            lastEvaluatedAt: new Date().toISOString(),
          },
        },
      },
    ];

    const distributions = calculateConceptMasteryDistributions(
      FRACTION_CONCEPTS,
      students
    );

    const fb = distributions.find((d) => d.conceptId === "fraction-basics");
    assert.ok(fb);
    assert.equal(fb.totalStudentsAssessed, 3);
    assert.equal(fb.masteredCount, 2);
    assert.equal(fb.partialCount, 1);
    assert.equal(fb.needsRevisionCount, 0);
    assert.equal(fb.masteryPercentage, 67); // 2/3 = 67%

    const cm = distributions.find((d) => d.conceptId === "common-multiples");
    assert.ok(cm);
    assert.equal(cm.totalStudentsAssessed, 3);
    assert.equal(cm.masteredCount, 1);
    assert.equal(cm.needsRevisionCount, 2);
    assert.equal(cm.masteryPercentage, 33);
  });
});

describe("Teacher Analytics Engine — Explainable Insights", () => {
  test("generates insufficient_data insight when no students are enrolled", () => {
    const insights = generateClassroomInsights(FRACTION_CONCEPTS, [], []);
    assert.equal(insights.length, 1);
    assert.equal(insights[0].type, "insufficient_data");
    assert.equal(insights[0].confidence, "insufficient_evidence");
  });

  test("generates diagnostic baseline recommendation when students have no attempts", () => {
    const students: StudentMasteryOverview[] = [
      { studentId: "s-1", studentName: "Student 1", masteries: {} },
    ];
    const dist = calculateConceptMasteryDistributions(FRACTION_CONCEPTS, students);
    const insights = generateClassroomInsights(FRACTION_CONCEPTS, students, dist);

    assert.equal(insights.length, 1);
    assert.equal(insights[0].type, "insufficient_data");
    assert.equal(insights[0].suggestedAction.includes("Diagnostic Assessment"), true);
  });

  test("detects prerequisite bottleneck when multiple students struggle with common multiples", () => {
    const students: StudentMasteryOverview[] = [
      {
        studentId: "s-1",
        studentName: "Rohan Patel",
        masteries: {
          "common-multiples": {
            conceptId: "common-multiples",
            masteryScore: 30,
            status: "needs_revision",
            validEvidenceCount: 3,
            lastEvaluatedAt: new Date().toISOString(),
          },
          "adding-fractions": {
            conceptId: "adding-fractions",
            masteryScore: 20,
            status: "needs_revision",
            validEvidenceCount: 3,
            lastEvaluatedAt: new Date().toISOString(),
          },
        },
      },
      {
        studentId: "s-2",
        studentName: "Priya Sharma",
        masteries: {
          "common-multiples": {
            conceptId: "common-multiples",
            masteryScore: 25,
            status: "needs_revision",
            validEvidenceCount: 4,
            lastEvaluatedAt: new Date().toISOString(),
          },
          "adding-fractions": {
            conceptId: "adding-fractions",
            masteryScore: 33,
            status: "needs_revision",
            validEvidenceCount: 3,
            lastEvaluatedAt: new Date().toISOString(),
          },
        },
      },
    ];

    const dist = calculateConceptMasteryDistributions(FRACTION_CONCEPTS, students);
    const insights = generateClassroomInsights(FRACTION_CONCEPTS, students, dist);

    const bottleneck = insights.find((i) => i.type === "prerequisite_bottleneck");
    assert.ok(bottleneck);
    assert.equal(bottleneck.conceptId, "common-multiples");
    assert.equal(bottleneck.affectedStudentCount, 2);
    assert.deepEqual(bottleneck.affectedStudentNames, ["Rohan Patel", "Priya Sharma"]);
  });

  test("identifies acceleration ready when a student masters all concepts", () => {
    const students: StudentMasteryOverview[] = [
      {
        studentId: "s-top",
        studentName: "Ananya Iyer",
        masteries: Object.fromEntries(
          FRACTION_CONCEPTS.map((c) => [
            c.id,
            {
              conceptId: c.id,
              masteryScore: 95,
              status: "mastered" as const,
              validEvidenceCount: 3,
              lastEvaluatedAt: new Date().toISOString(),
            },
          ])
        ),
      },
    ];

    const summary = generateClassroomAnalyticsSummary(FRACTION_CONCEPTS, students, 12);
    assert.equal(summary.totalEnrolled, 1);
    assert.equal(summary.activeLearners, 1);
    const enrichmentInsight = summary.insights.find((i) => i.type === "acceleration_ready");
    assert.ok(enrichmentInsight);
    assert.equal(enrichmentInsight.affectedStudentNames.includes("Ananya Iyer"), true);
  });
});
