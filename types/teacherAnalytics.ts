/**
 * ShikshaIQ: Class-Level Analytics & Pedagogical Insights Types
 * Phase 05: Explainable Insights & Mastery Distribution
 */

export interface ConceptMasteryDistribution {
  conceptId: string;
  conceptTitle: string;
  shortTitle: string;
  order: number;
  totalStudentsAssessed: number;
  masteredCount: number;
  partialCount: number;
  needsRevisionCount: number;
  notStartedCount: number;
  masteryPercentage: number; // % of assessed students who are mastered
}

export type InsightConfidence = "high" | "moderate" | "tentative" | "insufficient_evidence";
export type InsightType =
  | "prerequisite_bottleneck"
  | "concept_mastery_high"
  | "concept_struggle_alert"
  | "insufficient_data"
  | "acceleration_ready";

export interface ClassroomInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  conceptId?: string;
  affectedStudentCount: number;
  affectedStudentNames: string[];
  confidence: InsightConfidence;
  suggestedAction: string;
}

export interface ClassroomAnalyticsSummary {
  totalEnrolled: number;
  activeLearners: number;
  conceptDistributions: ConceptMasteryDistribution[];
  insights: ClassroomInsight[];
  recentActivityCount: number;
}
