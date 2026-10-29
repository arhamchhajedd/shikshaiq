/**
 * Adaptive Learning Engine: Configurable Thresholds & Parameters
 * All scoring rules are centralized here for auditable, deterministic operation.
 */

export const ADAPTIVE_CONFIG = {
  /** Minimum score ratio required to earn 'mastered' status (e.g. 0.80 = 80%) */
  MASTERY_THRESHOLD: 0.8,

  /** Score ratio below which status is 'needs_revision' (0.50 = 50%) */
  PARTIAL_THRESHOLD: 0.5,

  /** Minimum number of valid question attempts required to award 'mastered' status */
  MIN_EVIDENCE_FOR_MASTERY: 2,

  /** Minimum number of valid attempts required before making definitive claims of a knowledge gap */
  MIN_EVIDENCE_FOR_DEFINITIVE_GAP: 2,

  /** Default Class 7 Mathematics curriculum concepts */
  DEFAULT_GRAPH_NODES: [
    "fraction-basics",
    "common-multiples",
    "equivalent-fractions",
    "adding-fractions",
    "mixed-fractions",
  ] as const,
} as const;
