import { ConceptId, MasteryStatus } from "@/types/curriculum";

export type RecommendationType =
  | "prerequisite_remediation"
  | "guided_practice"
  | "advancement"
  | "curriculum_complete"
  | "diagnostic_needed";

export interface ConceptMasteryRecord {
  conceptId: ConceptId;
  masteryScore: number | null; // null if no valid evidence
  status: MasteryStatus;
  validEvidenceCount: number;
  lastEvaluatedAt?: string;
}

export interface PrerequisiteFinding {
  prerequisiteId: ConceptId;
  status: MasteryStatus;
  masteryScore: number | null;
  evidenceCount: number;
  isBlocker: boolean;
  message: string;
}

export interface AdaptiveRecommendation {
  targetConceptId: ConceptId;
  masteryScore: number | null;
  masteryStatus: MasteryStatus;
  recommendationType: RecommendationType;
  recommendedConceptId: ConceptId;
  reason: string;
  evidenceCount: number;
  prerequisiteFindings: PrerequisiteFinding[];
  timestamp: string;
}

export interface AdaptiveGraphNode {
  id: ConceptId;
  title: string;
  shortTitle: string;
  description: string;
  gradeLevel: number;
  order: number;
  prerequisites: ConceptId[];
}

export interface StudentAttemptInput {
  questionId: string;
  conceptId: ConceptId;
  selectedOptionId: string;
  isCorrect: boolean;
  attemptedAt?: string;
}
