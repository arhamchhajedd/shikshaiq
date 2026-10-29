/**
 * ShikshaIQ: Class-Level Pedagogical Analytics Engine
 * Framework-independent, deterministic evaluation of classroom mastery and insights.
 */

import { Concept } from "@/types/curriculum";
import { ConceptMasteryRecord } from "@/lib/adaptive";
import {
  ConceptMasteryDistribution,
  ClassroomInsight,
  ClassroomAnalyticsSummary,
} from "@/types/teacherAnalytics";

export interface StudentMasteryOverview {
  studentId: string;
  studentName: string;
  masteries: Record<string, ConceptMasteryRecord>;
}

/**
 * Computes concept-by-concept mastery distribution across enrolled students.
 */
export function calculateConceptMasteryDistributions(
  concepts: Concept[],
  students: StudentMasteryOverview[]
): ConceptMasteryDistribution[] {

  return concepts.map((concept) => {
    let masteredCount = 0;
    let partialCount = 0;
    let needsRevisionCount = 0;
    let notStartedCount = 0;

    for (const student of students) {
      const record = student.masteries[concept.id];
      if (!record || record.status === "not_started" || record.validEvidenceCount === 0) {
        notStartedCount++;
      } else if (record.status === "mastered") {
        masteredCount++;
      } else if (record.status === "partial") {
        partialCount++;
      } else if (record.status === "needs_revision") {
        needsRevisionCount++;
      }
    }

    const totalStudentsAssessed = masteredCount + partialCount + needsRevisionCount;
    const masteryPercentage =
      totalStudentsAssessed > 0
        ? Math.round((masteredCount / totalStudentsAssessed) * 100)
        : 0;

    return {
      conceptId: concept.id,
      conceptTitle: concept.title,
      shortTitle: concept.shortTitle,
      order: concept.order,
      totalStudentsAssessed,
      masteredCount,
      partialCount,
      needsRevisionCount,
      notStartedCount,
      masteryPercentage,
    };
  });
}

/**
 * Deterministically generates explainable classroom insights based on student evidence.
 * Strict rule: Never invent insights without data. Use explicit confidence levels.
 */
export function generateClassroomInsights(
  concepts: Concept[],
  students: StudentMasteryOverview[],
  distributions: ConceptMasteryDistribution[]
): ClassroomInsight[] {
  const insights: ClassroomInsight[] = [];
  const totalEnrolled = students.length;

  if (totalEnrolled === 0) {
    return [
      {
        id: "insight-no-students",
        type: "insufficient_data",
        title: "No Students Enrolled",
        description: "Share your classroom join code with students to start monitoring real learning data.",
        affectedStudentCount: 0,
        affectedStudentNames: [],
        confidence: "insufficient_evidence",
        suggestedAction: "Distribute your 6-character classroom join code to learners.",
      },
    ];
  }

  // Count active assessed learners
  const assessedStudents = students.filter((s) =>
    Object.values(s.masteries).some(
      (m) => m.validEvidenceCount > 0 && m.status !== "not_started"
    )
  );

  if (assessedStudents.length === 0) {
    return [
      {
        id: "insight-no-assessments",
        type: "insufficient_data",
        title: "Baseline Diagnostic Needed",
        description:
          "All enrolled learners have not completed diagnostic assessments or practice yet.",
        affectedStudentCount: totalEnrolled,
        affectedStudentNames: students.map((s) => s.studentName),
        confidence: "insufficient_evidence",
        suggestedAction:
          "Assign the Class 7 Diagnostic Assessment to establish baseline concept mastery.",
      },
    ];
  }

  // 1. Prerequisite Bottleneck Detection (e.g. Common Multiples blocking Adding Fractions)
  // Check each concept that has prerequisites
  for (const concept of concepts) {
    if (!concept.prerequisites || concept.prerequisites.length === 0) continue;

    for (const prereqId of concept.prerequisites) {
      const prereqConcept = concepts.find((c) => c.id === prereqId);
      if (!prereqConcept) continue;

      const bottleneckStudents: string[] = [];

      for (const student of students) {
        const prereqRecord = student.masteries[prereqId];
        const targetRecord = student.masteries[concept.id];

        // Bottleneck criteria: prerequisite is weak (needs_revision or not_started with 0 score)
        // while target is struggling
        if (
          prereqRecord &&
          prereqRecord.status === "needs_revision" &&
          (!targetRecord || targetRecord.status !== "mastered")
        ) {
          bottleneckStudents.push(student.studentName);
        }
      }

      if (bottleneckStudents.length > 0) {
        const count = bottleneckStudents.length;
        const confidence =
          count >= 3 ? "high" : count >= 2 ? "moderate" : "tentative";

        insights.push({
          id: `bottleneck-${prereqId}-${concept.id}`,
          type: "prerequisite_bottleneck",
          title: `Prerequisite Gap: ${prereqConcept.title}`,
          description: `${count} ${count === 1 ? "student struggles" : "students struggle"} with ${concept.title} due to unmastered fundamentals in ${prereqConcept.title}.`,
          conceptId: prereqId,
          affectedStudentCount: count,
          affectedStudentNames: bottleneckStudents,
          confidence,
          suggestedAction: `Assign remedial practice on ${prereqConcept.title} before continuing with ${concept.title}.`,
        });
      }
    }
  }

  // 2. High Class-Wide Struggle Alert (> 35% needs_revision among assessed)
  for (const dist of distributions) {
    if (dist.totalStudentsAssessed >= 2) {
      const struggleRatio = dist.needsRevisionCount / dist.totalStudentsAssessed;
      if (struggleRatio >= 0.35) {
        const strugglingStudentNames = students
          .filter((s) => s.masteries[dist.conceptId]?.status === "needs_revision")
          .map((s) => s.studentName);

        insights.push({
          id: `struggle-${dist.conceptId}`,
          type: "concept_struggle_alert",
          title: `Class Difficulty in ${dist.shortTitle}`,
          description: `${dist.needsRevisionCount} of ${dist.totalStudentsAssessed} assessed students require revision in ${dist.conceptTitle}.`,
          conceptId: dist.conceptId,
          affectedStudentCount: dist.needsRevisionCount,
          affectedStudentNames: strugglingStudentNames,
          confidence: dist.totalStudentsAssessed >= 3 ? "high" : "tentative",
          suggestedAction: `Conduct an interactive visual worked-example session on ${dist.conceptTitle}.`,
        });
      }
    }
  }

  // 3. High Mastery / Advancement Ready (>= 75% mastered among assessed)
  for (const dist of distributions) {
    if (dist.totalStudentsAssessed >= 2 && dist.masteryPercentage >= 75) {
      const masteredStudentNames = students
        .filter((s) => s.masteries[dist.conceptId]?.status === "mastered")
        .map((s) => s.studentName);

      insights.push({
        id: `mastery-${dist.conceptId}`,
        type: "concept_mastery_high",
        title: `Strong Mastery in ${dist.shortTitle}`,
        description: `${dist.masteryPercentage}% of assessed students (${dist.masteredCount}/${dist.totalStudentsAssessed}) have mastered ${dist.conceptTitle}.`,
        conceptId: dist.conceptId,
        affectedStudentCount: dist.masteredCount,
        affectedStudentNames: masteredStudentNames,
        confidence: dist.totalStudentsAssessed >= 3 ? "high" : "moderate",
        suggestedAction: `Cohort is ready for advanced application and multi-step problem solving.`,
      });
    }
  }

  // 4. Individual Enrichment Alert (Students who mastered all 5 concepts)
  const fullyMasteredStudents = students.filter((s) =>
    concepts.every((c) => s.masteries[c.id]?.status === "mastered")
  );

  if (fullyMasteredStudents.length > 0) {
    insights.push({
      id: "enrichment-ready",
      type: "acceleration_ready",
      title: "Students Ready for Curriculum Enrichment",
      description: `${fullyMasteredStudents.length} ${fullyMasteredStudents.length === 1 ? "student has" : "students have"} mastered all Class 7 Fractions concepts.`,
      affectedStudentCount: fullyMasteredStudents.length,
      affectedStudentNames: fullyMasteredStudents.map((s) => s.studentName),
      confidence: "high",
      suggestedAction: `Assign Class 8 Rational Numbers or Olympiad-level mixed fraction word problems.`,
    });
  }

  return insights;
}

/**
 * Computes full classroom analytics summary.
 */
export function generateClassroomAnalyticsSummary(
  concepts: Concept[],
  students: StudentMasteryOverview[],
  recentActivityCount = 0
): ClassroomAnalyticsSummary {
  const conceptDistributions = calculateConceptMasteryDistributions(concepts, students);
  const insights = generateClassroomInsights(concepts, students, conceptDistributions);
  const activeLearners = students.filter((s) =>
    Object.values(s.masteries).some(
      (m) => m.validEvidenceCount > 0 && m.status !== "not_started"
    )
  ).length;

  return {
    totalEnrolled: students.length,
    activeLearners,
    conceptDistributions,
    insights,
    recentActivityCount,
  };
}
