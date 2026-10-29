import { ConceptId, MasteryStatus } from "./curriculum";

export interface StudentAnswer {
  questionId: string;
  selectedOptionId: string;
  timeSpentSeconds?: number;
}

export interface AssessmentSubmission {
  answers: StudentAnswer[];
  personaId?: string;
  submittedAt?: string;
}

export interface ConceptResult {
  conceptId: ConceptId;
  conceptTitle: string;
  totalQuestions: number;
  correctCount: number;
  percentage: number;
  status: MasteryStatus;
}

export interface QuestionReviewItem {
  questionId: string;
  conceptId: ConceptId;
  prompt: string;
  selectedOptionId: string;
  correctOptionId: string;
  isCorrect: boolean;
  explanation: string;
}

export interface AssessmentResult {
  sessionId: string;
  completedAt: string;
  totalQuestions: number;
  totalCorrect: number;
  percentage: number;
  conceptBreakdown: Record<ConceptId, ConceptResult>;
  strongConcepts: string[];
  revisionConcepts: string[];
  recommendedNextStep: string;
  recommendedConceptId: ConceptId;
  questionReviews: QuestionReviewItem[];
}
