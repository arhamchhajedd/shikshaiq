import { ConceptId, MasteryStatus, PublicQuestion } from "../../types/curriculum";
import {
  AssessmentResult,
  ConceptResult,
  QuestionReviewItem,
  StudentAnswer,
} from "../../types/assessment";
import { CONCEPTS, CONCEPTS_LIST } from "../curriculum/concepts";
import { DIAGNOSTIC_QUESTIONS, ALL_QUESTIONS } from "../curriculum/questions";
import { ANSWER_KEYS } from "../curriculum/answerKeys.server";

export function evaluateMasteryStatus(
  correctCount: number,
  totalCount: number
): MasteryStatus {
  if (totalCount === 0 || correctCount === 0) {
    return "needs_revision";
  }
  const ratio = correctCount / totalCount;
  if (ratio >= 0.8) {
    return "mastered";
  }
  if (ratio >= 0.5) {
    return "partial";
  }
  return "needs_revision";
}

export function determineRecommendedNextStep(
  breakdown: Record<ConceptId, ConceptResult>
): { recommendation: string; conceptId: ConceptId } {
  // Prerequisite priority: Root gaps must be healed first!
  if (breakdown["fraction-basics"].status === "needs_revision") {
    return {
      recommendation:
        "Begin with Fraction Basics. Strengthening numerator and denominator fundamentals will build confidence for all subsequent topics.",
      conceptId: "fraction-basics",
    };
  }

  if (breakdown["common-multiples"].status === "needs_revision") {
    return {
      recommendation:
        "Revise Common Multiples & LCM first. Finding lowest common denominators is the essential prerequisite for adding fractions with unlike denominators.",
      conceptId: "common-multiples",
    };
  }

  if (breakdown["equivalent-fractions"].status === "needs_revision") {
    return {
      recommendation:
        "Practice Equivalent Fractions. Scaling numerators and denominators equally is critical for converting unlike fractions.",
      conceptId: "equivalent-fractions",
    };
  }

  if (breakdown["adding-fractions"].status === "needs_revision") {
    return {
      recommendation:
        "Work on Adding Fractions. Practice converting fractions to a shared LCM denominator before combining numerators.",
      conceptId: "adding-fractions",
    };
  }

  if (breakdown["mixed-fractions"].status === "needs_revision") {
    return {
      recommendation:
        "Practice Mixed Fraction Word Problems. Focus on converting improper fractions to mixed numbers and multi-step calculations.",
      conceptId: "mixed-fractions",
    };
  }

  // Address partial concepts in dependency order
  const partialOrder: ConceptId[] = [
    "common-multiples",
    "equivalent-fractions",
    "adding-fractions",
    "mixed-fractions",
    "fraction-basics",
  ];
  for (const cId of partialOrder) {
    if (breakdown[cId].status === "partial") {
      return {
        recommendation: `Refine your understanding of ${CONCEPTS[cId].shortTitle} with guided practice questions.`,
        conceptId: cId,
      };
    }
  }

  return {
    recommendation:
      "Outstanding foundational mastery! You are ready to advance to advanced Class 7 Mathematics enrichment exercises.",
    conceptId: "mixed-fractions",
  };
}

export function scoreAssessment(
  submittedAnswers: StudentAnswer[],
  customQuestionPool?: PublicQuestion[]
): AssessmentResult {
  const answerMap = new Map<string, string>();
  for (const ans of submittedAnswers) {
    answerMap.set(ans.questionId, ans.selectedOptionId);
  }

  // Determine target question pool:
  // 1. Explicit pool if provided
  // 2. Questions derived from submitted answers if any answer belongs to extended ALL_QUESTIONS
  // 3. Fallback to standard baseline DIAGNOSTIC_QUESTIONS
  let targetQuestions: PublicQuestion[];

  if (customQuestionPool && customQuestionPool.length > 0) {
    targetQuestions = customQuestionPool;
  } else {
    const allQuestionsMap = new Map<string, PublicQuestion>(
      ALL_QUESTIONS.map((q) => [q.id, q])
    );
    const derivedQuestions: PublicQuestion[] = [];
    let hasNonDiagnostic = false;

    const diagIds = new Set(DIAGNOSTIC_QUESTIONS.map((q) => q.id));
    for (const ans of submittedAnswers) {
      if (!diagIds.has(ans.questionId)) {
        hasNonDiagnostic = true;
      }
      const found = allQuestionsMap.get(ans.questionId);
      if (found) {
        derivedQuestions.push(found);
      }
    }

    if (hasNonDiagnostic && derivedQuestions.length > 0) {
      targetQuestions = derivedQuestions;
    } else {
      targetQuestions = DIAGNOSTIC_QUESTIONS;
    }
  }

  // Group target questions by concept
  const conceptQuestionsMap: Record<ConceptId, PublicQuestion[]> = {
    "fraction-basics": [],
    "common-multiples": [],
    "equivalent-fractions": [],
    "adding-fractions": [],
    "mixed-fractions": [],
  };

  for (const q of targetQuestions) {
    conceptQuestionsMap[q.conceptId].push(q);
  }

  let totalQuestionsCount = 0;
  let totalCorrectCount = 0;
  const questionReviews: QuestionReviewItem[] = [];

  const conceptBreakdown = {} as Record<ConceptId, ConceptResult>;

  for (const concept of CONCEPTS_LIST) {
    const questions = conceptQuestionsMap[concept.id];
    let conceptCorrect = 0;

    for (const q of questions) {
      totalQuestionsCount += 1;
      const key = ANSWER_KEYS[q.id];
      const selected = answerMap.get(q.id) || "";
      const isCorrect = Boolean(key && selected === key.correctAnswerId);

      if (isCorrect) {
        conceptCorrect += 1;
        totalCorrectCount += 1;
      }

      questionReviews.push({
        questionId: q.id,
        conceptId: q.conceptId,
        prompt: q.prompt,
        selectedOptionId: selected,
        correctOptionId: key ? key.correctAnswerId : "",
        isCorrect,
        explanation: key ? key.explanation : "No explanation available.",
      });
    }

    const percentage =
      questions.length > 0
        ? Math.round((conceptCorrect / questions.length) * 100)
        : 0;

    conceptBreakdown[concept.id] = {
      conceptId: concept.id,
      conceptTitle: concept.shortTitle,
      totalQuestions: questions.length,
      correctCount: conceptCorrect,
      percentage,
      status: evaluateMasteryStatus(conceptCorrect, questions.length),
    };
  }

  const strongConcepts: string[] = [];
  const revisionConcepts: string[] = [];

  for (const concept of CONCEPTS_LIST) {
    const res = conceptBreakdown[concept.id];
    if (res.status === "mastered") {
      strongConcepts.push(concept.shortTitle);
    } else if (res.status === "needs_revision" || res.status === "partial") {
      revisionConcepts.push(concept.shortTitle);
    }
  }

  const { recommendation, conceptId: recommendedConceptId } =
    determineRecommendedNextStep(conceptBreakdown);

  const overallPercentage =
    totalQuestionsCount > 0
      ? Math.round((totalCorrectCount / totalQuestionsCount) * 100)
      : 0;

  return {
    sessionId: `diag_${Date.now()}`,
    completedAt: new Date().toISOString(),
    totalQuestions: totalQuestionsCount,
    totalCorrect: totalCorrectCount,
    percentage: overallPercentage,
    conceptBreakdown,
    strongConcepts,
    revisionConcepts,
    recommendedNextStep: recommendation,
    recommendedConceptId,
    questionReviews,
  };
}
