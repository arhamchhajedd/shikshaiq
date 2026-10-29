export type ConceptId =
  | "fraction-basics"
  | "common-multiples"
  | "equivalent-fractions"
  | "adding-fractions"
  | "mixed-fractions";

export type MasteryStatus =
  | "mastered"
  | "partial"
  | "needs_revision"
  | "not_started";

export interface Concept {
  id: ConceptId;
  title: string;
  shortTitle: string;
  description: string;
  gradeLevel: number;
  order: number;
  prerequisites: ConceptId[];
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface PublicQuestion {
  id: string;
  conceptId: ConceptId;
  prompt: string;
  options: QuestionOption[];
  difficulty: "easy" | "medium" | "hard";
  learningObjective: string;
}

export interface PrivateAnswerKey {
  questionId: string;
  correctAnswerId: string;
  explanation: string;
}

export interface WorkedExample {
  id: string;
  problem: string;
  steps: string[];
  solution: string;
  tip?: string;
}

export interface CommonMistake {
  id: string;
  misconception: string;
  correction: string;
  explanation: string;
}

export interface VisualRepresentation {
  type: "fraction_strip" | "grid" | "number_line" | "circle_division";
  title: string;
  description: string;
  data: Record<string, unknown>;
}

export interface ConceptLesson {
  conceptId: ConceptId;
  title: string;
  shortTitle: string;
  gradeLevel: number;
  subject: string;
  learningObjective: string;
  summary: string;
  introduction: string;
  visualRepresentation: VisualRepresentation;
  keyRules: string[];
  workedExamples: WorkedExample[];
  commonMistakes: CommonMistake[];
  estimatedMinutes: number;
}

export interface LessonCompletion {
  id: string;
  studentId: string;
  conceptId: ConceptId;
  completedAt: string;
}

export interface QuestionWithAnswerKey extends PublicQuestion {
  correctOptionId: string;
  explanation: string;
}

