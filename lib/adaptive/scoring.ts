import { ConceptId, MasteryStatus } from "@/types/curriculum";
import { ADAPTIVE_CONFIG } from "./config";
import { ConceptMasteryRecord, StudentAttemptInput } from "./types";

/**
 * Calculates deterministic concept mastery from validated student attempts.
 *
 * Rules:
 * - 0 valid attempts: 'not_started', masteryScore is null.
 * - Score < 50%: 'needs_revision'.
 * - Score 50% to < 80%: 'partial'.
 * - Score >= 80%: 'mastered' ONLY when at least MIN_EVIDENCE_FOR_MASTERY (2) valid attempts exist.
 *   If >= 80% with only 1 attempt, classified as 'partial' (tentative evidence).
 */
export function calculateConceptMastery(
  conceptId: ConceptId,
  attempts: StudentAttemptInput[]
): ConceptMasteryRecord {
  // Filter attempts for this concept
  const relevantAttempts = attempts.filter((a) => a.conceptId === conceptId);

  // Prevent duplicate double-counting by deduplicating by questionId (keeping latest)
  const uniqueAttemptsMap = new Map<string, StudentAttemptInput>();
  for (const att of relevantAttempts) {
    uniqueAttemptsMap.set(att.questionId, att);
  }
  const validAttempts = Array.from(uniqueAttemptsMap.values());
  const evidenceCount = validAttempts.length;

  if (evidenceCount === 0) {
    return {
      conceptId,
      masteryScore: null,
      status: "not_started",
      validEvidenceCount: 0,
      lastEvaluatedAt: new Date().toISOString(),
    };
  }

  const correctCount = validAttempts.filter((a) => a.isCorrect).length;
  const ratio = correctCount / evidenceCount;
  const percentageScore = Math.round(ratio * 100);

  let status: MasteryStatus;

  if (ratio >= ADAPTIVE_CONFIG.MASTERY_THRESHOLD) {
    if (evidenceCount >= ADAPTIVE_CONFIG.MIN_EVIDENCE_FOR_MASTERY) {
      status = "mastered";
    } else {
      // High score but insufficient evidence: classified as partial / tentative
      status = "partial";
    }
  } else if (ratio >= ADAPTIVE_CONFIG.PARTIAL_THRESHOLD) {
    status = "partial";
  } else {
    status = "needs_revision";
  }

  return {
    conceptId,
    masteryScore: percentageScore,
    status,
    validEvidenceCount: evidenceCount,
    lastEvaluatedAt: new Date().toISOString(),
  };
}

const DEFAULT_CONCEPTS: ConceptId[] = [
  "fraction-basics",
  "common-multiples",
  "equivalent-fractions",
  "adding-fractions",
  "mixed-fractions",
];

/**
 * Evaluates mastery across curriculum concepts from a collection of attempts.
 * Supports both evaluateAllConceptMasteries(attempts) and evaluateAllConceptMasteries(conceptIds, attempts).
 */
export function evaluateAllConceptMasteries(
  conceptIdsOrAttempts: ConceptId[] | StudentAttemptInput[],
  maybeAttempts?: StudentAttemptInput[]
): Record<ConceptId, ConceptMasteryRecord> {
  let conceptIds: ConceptId[];
  let attempts: StudentAttemptInput[];

  if (
    Array.isArray(conceptIdsOrAttempts) &&
    conceptIdsOrAttempts.length > 0 &&
    typeof conceptIdsOrAttempts[0] === "string"
  ) {
    conceptIds = conceptIdsOrAttempts as ConceptId[];
    attempts = maybeAttempts || [];
  } else {
    conceptIds = DEFAULT_CONCEPTS;
    attempts = (conceptIdsOrAttempts || []) as StudentAttemptInput[];
  }

  const result: Partial<Record<ConceptId, ConceptMasteryRecord>> = {};
  for (const cId of conceptIds) {
    result[cId] = calculateConceptMastery(cId, attempts);
  }
  return result as Record<ConceptId, ConceptMasteryRecord>;
}
