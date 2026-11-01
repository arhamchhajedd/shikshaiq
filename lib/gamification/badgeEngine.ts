/**
 * Gamification Engine: Badge & Star Rating System
 * Evaluates student achievement badges including the high-impact
 * "Root Gap Healer" badge, streak awards, and concept star ratings.
 */

import { ConceptId, MasteryStatus } from "@/types/curriculum";
import { ConceptMasteryRecord } from "@/lib/adaptive";

export interface ConceptStarRating {
  conceptId: ConceptId;
  stars: 0 | 1 | 2 | 3;
  label: string;
}

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  iconType: "root_gap" | "streak" | "star" | "diagnostic" | "master" | "lesson";
  category: "mastery" | "engagement" | "remediation";
  isUnlocked: boolean;
  unlockedAtLabel?: string;
  progressPercent: number;
}

export interface GamificationSummary {
  totalStars: number;
  maxStars: number; // 15 (5 concepts * 3 stars)
  starRatings: Record<ConceptId, ConceptStarRating>;
  badges: BadgeDefinition[];
  unlockedBadgeCount: number;
  hasRootGapHealer: boolean;
}

/**
 * Calculates 0-3 star rating for a single concept.
 */
export function calculateConceptStars(
  status: MasteryStatus | undefined,
  score: number | null | undefined
): 0 | 1 | 2 | 3 {
  if (!status || status === "not_started" || score === null || score === undefined) {
    return 0;
  }
  if (status === "mastered" || score >= 80) {
    return 3;
  }
  if (status === "partial" || (score >= 50 && score < 80)) {
    return 2;
  }
  return 1; // has attempts or needs revision
}

export interface BadgeEvaluationInput {
  masteries: Record<ConceptId, ConceptMasteryRecord> | null;
  attemptCount: number;
  currentStreak: number;
  longestStreak: number;
  completedLessons: ConceptId[];
  overallAccuracy: number | null;
}

/**
 * Evaluates all curriculum stars and unlocked achievement badges.
 */
export function evaluateGamification(input: BadgeEvaluationInput): GamificationSummary {
  const {
    masteries,
    attemptCount,
    currentStreak,
    longestStreak,
    completedLessons,
  } = input;

  const conceptIds: ConceptId[] = [
    "fraction-basics",
    "common-multiples",
    "equivalent-fractions",
    "adding-fractions",
    "mixed-fractions",
  ];

  // 1. Calculate stars per concept
  const starRatings: Record<ConceptId, ConceptStarRating> = {
    "fraction-basics": { conceptId: "fraction-basics", stars: 0, label: "Not Started" },
    "common-multiples": { conceptId: "common-multiples", stars: 0, label: "Not Started" },
    "equivalent-fractions": { conceptId: "equivalent-fractions", stars: 0, label: "Not Started" },
    "adding-fractions": { conceptId: "adding-fractions", stars: 0, label: "Not Started" },
    "mixed-fractions": { conceptId: "mixed-fractions", stars: 0, label: "Not Started" },
  };

  let totalStars = 0;
  let masteredCount = 0;

  for (const cid of conceptIds) {
    const record = masteries ? masteries[cid] : undefined;
    const stars = calculateConceptStars(record?.status, record?.masteryScore);
    totalStars += stars;

    if (stars === 3) masteredCount++;

    const label =
      stars === 3
        ? "Mastered (3 Stars)"
        : stars === 2
        ? "Proficient (2 Stars)"
        : stars === 1
        ? "Developing (1 Star)"
        : "Not Started (0 Stars)";

    starRatings[cid] = { conceptId: cid, stars, label };
  }

  // 2. Evaluate Root Gap Healer Badge:
  // True when the foundational prerequisite 'fraction-basics' is mastered (score >= 80)
  // and student has continued practicing downstream concepts without root blockers.
  const fractionBasicsMastered = starRatings["fraction-basics"].stars === 3;
  const commonMultiplesMastered = starRatings["common-multiples"].stars === 3;
  const hasDownstreamProgress =
    starRatings["equivalent-fractions"].stars >= 1 ||
    starRatings["adding-fractions"].stars >= 1 ||
    starRatings["mixed-fractions"].stars >= 1 ||
    masteredCount >= 2;

  const isRootGapHealed = fractionBasicsMastered && (hasDownstreamProgress || commonMultiplesMastered);

  // 3. Assemble badges
  const badges: BadgeDefinition[] = [
    {
      id: "root-gap-healer",
      title: "Root Gap Healer",
      description: "Healed the foundational prerequisite bottleneck in Fraction Basics to unlock advanced arithmetic.",
      iconType: "root_gap",
      category: "remediation",
      isUnlocked: isRootGapHealed,
      unlockedAtLabel: isRootGapHealed ? "Unlocked! Prerequisite Healed" : undefined,
      progressPercent: isRootGapHealed
        ? 100
        : fractionBasicsMastered
        ? 75
        : Math.min(100, Math.round(((masteries?.["fraction-basics"]?.masteryScore || 0) / 80) * 100)),
    },
    {
      id: "streak-pioneer",
      title: "3-Day Learning Streak",
      description: "Maintained active NCERT mathematics practice for 3 or more consecutive days.",
      iconType: "streak",
      category: "engagement",
      isUnlocked: currentStreak >= 3 || longestStreak >= 3,
      unlockedAtLabel:
        currentStreak >= 3 || longestStreak >= 3
          ? `${Math.max(currentStreak, longestStreak)} Days Active`
          : undefined,
      progressPercent: Math.min(100, Math.round((Math.max(currentStreak, longestStreak) / 3) * 100)),
    },
    {
      id: "star-collector",
      title: "Star Collector (9+ Stars)",
      description: "Earned 9 or more stars across the Class 7 Fractions concept curriculum matrix.",
      iconType: "star",
      category: "mastery",
      isUnlocked: totalStars >= 9,
      unlockedAtLabel: totalStars >= 9 ? `${totalStars} Stars Earned` : undefined,
      progressPercent: Math.min(100, Math.round((totalStars / 9) * 100)),
    },
    {
      id: "diagnostic-champion",
      title: "Diagnostic Pioneer",
      description: "Completed the verified 15-question diagnostic assessment across all 5 concept nodes.",
      iconType: "diagnostic",
      category: "engagement",
      isUnlocked: attemptCount >= 15 || totalStars >= 3,
      unlockedAtLabel: attemptCount >= 15 || totalStars >= 3 ? "Diagnostic Verified" : undefined,
      progressPercent: attemptCount >= 15 || totalStars >= 3 ? 100 : Math.min(100, Math.round((attemptCount / 15) * 100)),
    },
    {
      id: "curious-scholar",
      title: "Interactive Scholar",
      description: "Completed interactive conceptual lessons with worked examples and misconception alerts.",
      iconType: "lesson",
      category: "engagement",
      isUnlocked: completedLessons.length >= 1,
      unlockedAtLabel: completedLessons.length >= 1 ? `${completedLessons.length}/5 Lessons Completed` : undefined,
      progressPercent: Math.min(100, Math.round((completedLessons.length / 5) * 100)),
    },
    {
      id: "fraction-grandmaster",
      title: "Fraction Grandmaster",
      description: "Achieved full mastery across all 5 Class 7 Fractions nodes in the curriculum graph.",
      iconType: "master",
      category: "mastery",
      isUnlocked: masteredCount === 5,
      unlockedAtLabel: masteredCount === 5 ? "15/15 Stars — Grandmaster!" : undefined,
      progressPercent: Math.min(100, Math.round((masteredCount / 5) * 100)),
    },
  ];

  return {
    totalStars,
    maxStars: 15,
    starRatings,
    badges,
    unlockedBadgeCount: badges.filter((b) => b.isUnlocked).length,
    hasRootGapHealer: isRootGapHealed,
  };
}
