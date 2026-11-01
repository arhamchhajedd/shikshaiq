import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateStreak,
  formatLocalDate,
} from "../lib/gamification/streakEngine";
import {
  calculateConceptStars,
  evaluateGamification,
} from "../lib/gamification/badgeEngine";
import { ConceptMasteryRecord } from "../lib/adaptive";
import { ConceptId } from "../types/curriculum";

describe("Gamification Engine — Daily Learning Streak Calculation", () => {
  it("evaluates empty or null timestamps as 0 current streak", () => {
    const res = calculateStreak([]);
    assert.equal(res.currentStreak, 0);
    assert.equal(res.longestStreak, 0);
    assert.equal(res.practicedToday, false);
    assert.equal(res.practicedYesterday, false);
    assert.equal(res.weeklyActivity.length, 7);
  });

  it("evaluates practice today as 1-day active streak", () => {
    const today = new Date("2026-11-01T10:00:00Z");
    const res = calculateStreak(["2026-11-01T08:30:00Z"], today);
    assert.equal(res.currentStreak, 1);
    assert.equal(res.longestStreak, 1);
    assert.equal(res.practicedToday, true);
  });

  it("evaluates consecutive days practice as a continuous multi-day streak", () => {
    const anchor = new Date("2026-11-03T12:00:00Z");
    // Nov 1, Nov 2, Nov 3
    const timestamps = [
      "2026-11-01T09:00:00Z",
      "2026-11-01T14:00:00Z", // multiple attempts on same day
      "2026-11-02T10:15:00Z",
      "2026-11-03T07:45:00Z",
    ];
    const res = calculateStreak(timestamps, anchor);
    assert.equal(res.currentStreak, 3);
    assert.equal(res.longestStreak, 3);
    assert.equal(res.practicedToday, true);
    assert.equal(res.practicedYesterday, true);
  });

  it("allows yesterday practice to keep streak active before practicing today", () => {
    const anchor = new Date("2026-11-04T10:00:00Z");
    // Practiced on Nov 2 and Nov 3 (yesterday), but not yet on Nov 4 (today)
    const timestamps = [
      "2026-11-02T11:00:00Z",
      "2026-11-03T16:00:00Z",
    ];
    const res = calculateStreak(timestamps, anchor);
    assert.equal(res.currentStreak, 2);
    assert.equal(res.practicedToday, false);
    assert.equal(res.practicedYesterday, true);
  });

  it("detects streak breaks but preserves longest historical streak", () => {
    const anchor = new Date("2026-11-10T12:00:00Z");
    // 4-day streak in past (Nov 1-4), break, then 1 day today (Nov 10)
    const timestamps = [
      "2026-11-01T10:00:00Z",
      "2026-11-02T10:00:00Z",
      "2026-11-03T10:00:00Z",
      "2026-11-04T10:00:00Z",
      "2026-11-10T09:00:00Z",
    ];
    const res = calculateStreak(timestamps, anchor);
    assert.equal(res.currentStreak, 1);
    assert.equal(res.longestStreak, 4);
  });

  it("formats dates reliably in local format YYYY-MM-DD", () => {
    const d = new Date(2026, 10, 1); // Month 10 is November (0-indexed)
    assert.equal(formatLocalDate(d), "2026-11-01");
  });
});

describe("Gamification Engine — Concept Stars & Badge Evaluation", () => {
  it("calculates 0 to 3 stars per concept based on mastery thresholds", () => {
    assert.equal(calculateConceptStars("not_started", null), 0);
    assert.equal(calculateConceptStars("needs_revision", 35), 1);
    assert.equal(calculateConceptStars("partial", 65), 2);
    assert.equal(calculateConceptStars("mastered", 85), 3);
    assert.equal(calculateConceptStars("mastered", 100), 3);
  });

  it("evaluates default unassessed state with 0 stars and locked badges", () => {
    const res = evaluateGamification({
      masteries: null,
      attemptCount: 0,
      currentStreak: 0,
      longestStreak: 0,
      completedLessons: [],
      overallAccuracy: null,
    });

    assert.equal(res.totalStars, 0);
    assert.equal(res.maxStars, 15);
    assert.equal(res.hasRootGapHealer, false);
    assert.equal(res.unlockedBadgeCount, 0);
  });

  it("awards the high-impact 'Root Gap Healer' badge when prerequisite bottleneck is resolved", () => {
    const mockMasteries: Record<ConceptId, ConceptMasteryRecord> = {
      "fraction-basics": {
        conceptId: "fraction-basics",
        masteryScore: 85,
        status: "mastered",
        validEvidenceCount: 3,
        lastEvaluatedAt: new Date().toISOString(),
      },
      "common-multiples": {
        conceptId: "common-multiples",
        masteryScore: 80,
        status: "mastered",
        validEvidenceCount: 3,
        lastEvaluatedAt: new Date().toISOString(),
      },
      "equivalent-fractions": {
        conceptId: "equivalent-fractions",
        masteryScore: 60,
        status: "partial",
        validEvidenceCount: 2,
        lastEvaluatedAt: new Date().toISOString(),
      },
      "adding-fractions": {
        conceptId: "adding-fractions",
        masteryScore: 40,
        status: "needs_revision",
        validEvidenceCount: 2,
        lastEvaluatedAt: new Date().toISOString(),
      },
      "mixed-fractions": {
        conceptId: "mixed-fractions",
        masteryScore: null,
        status: "not_started",
        validEvidenceCount: 0,
        lastEvaluatedAt: new Date().toISOString(),
      },
    };

    const res = evaluateGamification({
      masteries: mockMasteries,
      attemptCount: 15,
      currentStreak: 3,
      longestStreak: 3,
      completedLessons: ["fraction-basics"],
      overallAccuracy: 66,
    });

    assert.equal(res.hasRootGapHealer, true);
    const rootGapBadge = res.badges.find((b) => b.id === "root-gap-healer");
    assert.ok(rootGapBadge);
    assert.equal(rootGapBadge.isUnlocked, true);
    assert.equal(rootGapBadge.progressPercent, 100);

    // 3 stars (fb) + 3 stars (cm) + 2 stars (ef) + 1 star (af) + 0 (mf) = 9 stars
    assert.equal(res.totalStars, 9);

    // Star collector badge unlocked (>= 9 stars)
    const starBadge = res.badges.find((b) => b.id === "star-collector");
    assert.ok(starBadge?.isUnlocked);

    // Streak badge unlocked (>= 3 days)
    const streakBadge = res.badges.find((b) => b.id === "streak-pioneer");
    assert.ok(streakBadge?.isUnlocked);
  });

  it("locks 'Root Gap Healer' badge if foundational fraction-basics is still in needs_revision", () => {
    const mockMasteries: Record<ConceptId, ConceptMasteryRecord> = {
      "fraction-basics": {
        conceptId: "fraction-basics",
        masteryScore: 33,
        status: "needs_revision",
        validEvidenceCount: 3,
        lastEvaluatedAt: new Date().toISOString(),
      },
      "common-multiples": {
        conceptId: "common-multiples",
        masteryScore: 33,
        status: "needs_revision",
        validEvidenceCount: 3,
        lastEvaluatedAt: new Date().toISOString(),
      },
      "equivalent-fractions": {
        conceptId: "equivalent-fractions",
        masteryScore: null,
        status: "not_started",
        validEvidenceCount: 0,
        lastEvaluatedAt: new Date().toISOString(),
      },
      "adding-fractions": {
        conceptId: "adding-fractions",
        masteryScore: null,
        status: "not_started",
        validEvidenceCount: 0,
        lastEvaluatedAt: new Date().toISOString(),
      },
      "mixed-fractions": {
        conceptId: "mixed-fractions",
        masteryScore: null,
        status: "not_started",
        validEvidenceCount: 0,
        lastEvaluatedAt: new Date().toISOString(),
      },
    };

    const res = evaluateGamification({
      masteries: mockMasteries,
      attemptCount: 6,
      currentStreak: 1,
      longestStreak: 1,
      completedLessons: [],
      overallAccuracy: 33,
    });

    assert.equal(res.hasRootGapHealer, false);
    const rootGapBadge = res.badges.find((b) => b.id === "root-gap-healer");
    assert.equal(rootGapBadge?.isUnlocked, false);
  });
});
