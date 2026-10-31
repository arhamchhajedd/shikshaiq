import { PublicQuestion, ConceptId } from "../../types/curriculum";

/**
 * Standard Fisher-Yates array shuffle.
 * Returns a new shuffled array without mutating the original.
 * Optional custom PRNG function (e.g. for deterministic seeding in tests).
 */
export function shuffleArray<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Shuffles the visual order of options for a question while preserving
 * the option IDs (opt_a, opt_b, etc.) so server-side scoring is unaffected.
 */
export function shuffleQuestionOptions(
  question: PublicQuestion,
  rng: () => number = Math.random
): PublicQuestion {
  return {
    ...question,
    options: shuffleArray(question.options, rng),
  };
}

export interface QuizSessionOptions {
  /**
   * Number of questions to pick per concept (default: 3).
   * With 5 concepts, 3 per concept gives a 15-question diagnostic assessment.
   */
  questionsPerConcept?: number;
  /**
   * Whether to shuffle the question sequence across concepts (default: true).
   */
  shuffleQuestions?: boolean;
  /**
   * Whether to shuffle options inside each question (default: true).
   */
  shuffleOptions?: boolean;
  /**
   * Optional custom PRNG for testing.
   */
  rng?: () => number;
}

/**
 * Performs stratified sampling: selects a balanced number of questions from each
 * concept so every prerequisite node is fairly evaluated.
 */
export function selectStratifiedQuestions(
  pool: PublicQuestion[],
  questionsPerConcept = 3,
  rng: () => number = Math.random
): PublicQuestion[] {
  // Group questions by concept
  const conceptGroups = new Map<ConceptId, PublicQuestion[]>();

  for (const q of pool) {
    const list = conceptGroups.get(q.conceptId) || [];
    list.push(q);
    conceptGroups.set(q.conceptId, list);
  }

  const selected: PublicQuestion[] = [];

  // Pick questionsPerConcept for each concept group
  for (const [, group] of conceptGroups) {
    const shuffledGroup = shuffleArray(group, rng);
    const chosen = shuffledGroup.slice(0, questionsPerConcept);
    selected.push(...chosen);
  }

  return selected;
}

/**
 * Generates a randomized diagnostic quiz session for a student.
 * 1. Samples balanced questions across all concepts.
 * 2. Shuffles the questions so student order is random.
 * 3. Shuffles the options inside each question to prevent adjacent copying.
 */
export function generateDiagnosticQuizSession(
  pool: PublicQuestion[],
  options: QuizSessionOptions = {}
): PublicQuestion[] {
  const {
    questionsPerConcept = 3,
    shuffleQuestions = true,
    shuffleOptions = true,
    rng = Math.random,
  } = options;

  // 1. Stratified sampling across all concepts
  const sampled = selectStratifiedQuestions(pool, questionsPerConcept, rng);

  // 2. Shuffle question order
  const orderedQuestions = shuffleQuestions ? shuffleArray(sampled, rng) : sampled;

  // 3. Shuffle options inside each question
  if (shuffleOptions) {
    return orderedQuestions.map((q) => shuffleQuestionOptions(q, rng));
  }

  return orderedQuestions;
}
