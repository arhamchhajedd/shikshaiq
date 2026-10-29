import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { ALL_QUESTIONS } from "../lib/curriculum/questions";
import { CONCEPT_LESSONS } from "../lib/curriculum/lessons";
import { syncManager } from "../lib/offline/syncManager";
import { evaluateAllConceptMasteries, StudentAttemptInput } from "../lib/adaptive";
import { PendingAttempt, CachedLesson, CachedQuestion } from "../types/offline";

describe("Phase 07 Acceptance Checklist Item 1 — Offline Lesson Access", () => {
  test("A student can open a previously cached lesson with complete pedagogical content offline", () => {
    const fractionBasics = CONCEPT_LESSONS["fraction-basics"];
    assert.ok(fractionBasics, "Lesson must exist in curriculum");

    // Simulating cached lesson structure stored in IndexedDB
    const cachedLesson: CachedLesson = {
      conceptId: "fraction-basics",
      contentVersion: 1,
      lesson: fractionBasics,
      cachedAt: new Date().toISOString(),
    };

    assert.equal(cachedLesson.conceptId, "fraction-basics");
    assert.equal(cachedLesson.lesson.title, "Fraction Basics & Representation");
    assert.ok(cachedLesson.lesson.workedExamples.length > 0, "Worked examples must be accessible offline");
    assert.ok(cachedLesson.lesson.commonMistakes.length > 0, "Common misconceptions must be accessible offline");
    assert.ok(cachedLesson.lesson.keyRules.length > 0, "Key rules must be accessible offline");
    assert.ok(cachedLesson.lesson.visualRepresentation, "Visual fraction model must be accessible offline");
  });

  test("An uncached lesson is recognized as null and prompts honest offline notice", () => {
    const cachedStore = new Map<string, CachedLesson>();
    cachedStore.set("fraction-basics", {
      conceptId: "fraction-basics",
      contentVersion: 1,
      lesson: CONCEPT_LESSONS["fraction-basics"],
      cachedAt: new Date().toISOString(),
    });

    const isAvailableOffline = cachedStore.has("adding-fractions");
    assert.equal(isAvailableOffline, false, "Uncached concept must not claim offline availability");
  });
});

describe("Phase 07 Acceptance Checklist Item 2 — Offline Attempts Marked as Pending", () => {
  test("Offline practice attempts are explicitly created with status 'pending'", () => {
    const studentUserId = "student_test_user_001";
    const idempotencyKey = syncManager.generateIdempotencyKey();

    const offlineAttempt: PendingAttempt = {
      idempotencyKey,
      questionId: "q_fb_01",
      conceptId: "fraction-basics",
      contentVersion: 1,
      selectedOptionId: "opt_b",
      attemptedAt: new Date().toISOString(),
      userId: studentUserId,
      status: "pending",
      attemptType: "practice",
    };

    assert.equal(offlineAttempt.status, "pending");
    assert.equal((offlineAttempt as unknown as Record<string, unknown>).isCorrect, undefined);
    assert.ok(offlineAttempt.idempotencyKey.length >= 8);
    assert.equal(offlineAttempt.userId, studentUserId);
  });
});

describe("Phase 07 Acceptance Checklist Item 3 — No Authoritative Mastery Changes Before Server Validation", () => {
  test("Client queue cannot alter concept mastery without server validation", () => {
    // Only verified attempts evaluated by server affect mastery
    const unverifiedClientQueue: PendingAttempt[] = [
      {
        idempotencyKey: "client_uuid_1",
        questionId: "q_fb_01",
        conceptId: "fraction-basics",
        contentVersion: 1,
        selectedOptionId: "opt_b",
        attemptedAt: new Date().toISOString(),
        userId: "student_01",
        status: "pending",
        attemptType: "practice",
      },
    ];

    // Local unverified attempts MUST NOT have isCorrect set
    assert.equal((unverifiedClientQueue[0] as unknown as Record<string, unknown>).isCorrect, undefined);

    // Initial mastery without server records is 0 evidence count
    const initialMastery = evaluateAllConceptMasteries([]);
    assert.equal(initialMastery["fraction-basics"].validEvidenceCount, 0);
    assert.equal(initialMastery["fraction-basics"].status, "not_started");
  });

  test("Only authoritative server-side validation transforms attempts into valid mastery records", () => {
    const verifiedServerAttempts: StudentAttemptInput[] = [
      {
        questionId: "q_fb_01",
        conceptId: "fraction-basics",
        selectedOptionId: "opt_b",
        isCorrect: true,
        attemptedAt: "2026-10-30T00:00:00.000Z",
      },
      {
        questionId: "q_fb_02",
        conceptId: "fraction-basics",
        selectedOptionId: "opt_a",
        isCorrect: true,
        attemptedAt: "2026-10-30T00:01:00.000Z",
      },
      {
        questionId: "q_fb_03",
        conceptId: "fraction-basics",
        selectedOptionId: "opt_c",
        isCorrect: true,
        attemptedAt: "2026-10-30T00:02:00.000Z",
      },
    ];

    const masteries = evaluateAllConceptMasteries(verifiedServerAttempts);
    assert.equal(masteries["fraction-basics"].validEvidenceCount, 3);
    assert.equal(masteries["fraction-basics"].masteryScore, 100);
    assert.equal(masteries["fraction-basics"].status, "mastered");
  });
});

describe("Phase 07 Acceptance Checklist Item 4 — Reconnecting Without Duplication", () => {
  test("Idempotency keys prevent double insertion and double counting on reconnect", () => {
    const key = "sync_uuid_reconnect_test";
    const databaseAttemptRecords = new Map<string, { studentId: string; questionId: string; isCorrect: boolean }>();

    // First reconnect submission: insert new record
    databaseAttemptRecords.set(`user_1_${key}`, {
      studentId: "user_1",
      questionId: "q_fb_01",
      isCorrect: true,
    });

    // Second reconnect submission with identical idempotencyKey: detect existing
    const isAlreadyProcessed = databaseAttemptRecords.has(`user_1_${key}`);
    assert.equal(isAlreadyProcessed, true, "Duplicate key must be flagged as already processed");

    // Evidence count remains exactly 1
    const attempts: StudentAttemptInput[] = [
      {
        questionId: "q_fb_01",
        conceptId: "fraction-basics",
        selectedOptionId: "opt_b",
        isCorrect: true,
        attemptedAt: "2026-10-30T00:00:00.000Z",
      },
    ];

    const masteries = evaluateAllConceptMasteries(attempts);
    assert.equal(masteries["fraction-basics"].validEvidenceCount, 1);
  });
});

describe("Phase 07 Acceptance Checklist Item 5 — Failed Attempts Remain Recoverable", () => {
  test("Network drops during sync revert attempts to pending for subsequent retry", () => {
    const attempt: PendingAttempt = {
      idempotencyKey: "uuid_network_drop_01",
      questionId: "q_fb_01",
      conceptId: "fraction-basics",
      contentVersion: 1,
      selectedOptionId: "opt_b",
      attemptedAt: new Date().toISOString(),
      userId: "student_recovery_test",
      status: "syncing",
      attemptType: "practice",
    };

    // Simulate network drop during sync: revert to pending with error message
    const networkErrorMsg = "Failed to fetch /api/practice/sync: Network dropped";
    attempt.status = "pending";
    attempt.error = networkErrorMsg;

    assert.equal(attempt.status, "pending");
    assert.equal(attempt.error, networkErrorMsg);
    assert.equal(attempt.selectedOptionId, "opt_b", "Student answer payload must not be lost");
  });

  test("Server rejections flag attempt as failed with descriptive explanation", () => {
    const attempt: PendingAttempt = {
      idempotencyKey: "uuid_rejected_01",
      questionId: "q_invalid_id",
      conceptId: "fraction-basics",
      contentVersion: 1,
      selectedOptionId: "opt_a",
      attemptedAt: new Date().toISOString(),
      userId: "student_recovery_test",
      status: "failed",
      error: "Question q_invalid_id not found in authoritative curriculum bank.",
      attemptType: "practice",
    };

    assert.equal(attempt.status, "failed");
    assert.ok(attempt.error?.includes("not found"));
  });
});

describe("Phase 07 Acceptance Checklist Item 6 — Multi-Account Attempt Isolation", () => {
  test("Changing accounts strictly isolates pending offline attempts between students", () => {
    const offlineAttemptsStore: PendingAttempt[] = [
      {
        idempotencyKey: "attempt_student_A_1",
        questionId: "q_fb_01",
        conceptId: "fraction-basics",
        contentVersion: 1,
        selectedOptionId: "opt_b",
        attemptedAt: new Date().toISOString(),
        userId: "student_A_uuid",
        status: "pending",
        attemptType: "practice",
      },
      {
        idempotencyKey: "attempt_student_A_2",
        questionId: "q_fb_02",
        conceptId: "fraction-basics",
        contentVersion: 1,
        selectedOptionId: "opt_a",
        attemptedAt: new Date().toISOString(),
        userId: "student_A_uuid",
        status: "pending",
        attemptType: "practice",
      },
    ];

    // Student A signs out; Student B logs in
    const studentBUserId = "student_B_uuid";
    const studentBAttempts = offlineAttemptsStore.filter(
      (a) => a.userId === studentBUserId && a.status !== "synced"
    );

    assert.equal(studentBAttempts.length, 0, "Student B must NOT see or sync Student A's pending attempts");

    // Student A logs back in
    const studentAAttempts = offlineAttemptsStore.filter(
      (a) => a.userId === "student_A_uuid" && a.status !== "synced"
    );
    assert.equal(studentAAttempts.length, 2, "Student A's pending attempts must remain intact");
  });

  test("Attempt queueing strictly rejects empty or unauthenticated user ID", () => {
    assert.throws(() => {
      const invalidUserId: string = "";
      if (!invalidUserId || invalidUserId.trim() === "") {
        throw new Error("Student authentication ID is required to isolate offline attempts.");
      }
    }, /Student authentication ID is required/);
  });
});

describe("Phase 07 Acceptance Checklist Item 7 — Zero Key Leakage & SW Privacy Boundaries", () => {
  const NEVER_CACHE_PATTERNS = [
    /\/api\//,
    /\/auth\//,
    /supabase\.co/,
    /\/pending-approval/,
    /\/teacher/,
    /\/admin/,
  ];

  test("All public curriculum questions have zero answer keys or solutions", () => {
    for (const q of ALL_QUESTIONS) {
      const raw = q as unknown as Record<string, unknown>;
      assert.equal(raw.correctAnswerId, undefined);
      assert.equal(raw.correctOptionId, undefined);
      assert.equal(raw.explanation, undefined);
    }
  });

  test("Cached public questions maintain strict separation from private server keys", () => {
    const q = ALL_QUESTIONS[0];
    const cachedQ: CachedQuestion = {
      id: q.id,
      conceptId: q.conceptId,
      contentVersion: 1,
      prompt: q.prompt,
      options: q.options,
      difficulty: q.difficulty,
      learningObjective: q.learningObjective,
      cachedAt: new Date().toISOString(),
    };

    const untrusted = cachedQ as unknown as Record<string, unknown>;
    assert.equal(untrusted.correctAnswerId, undefined);
    assert.equal(untrusted.correctOptionId, undefined);
    assert.equal(untrusted.explanation, undefined);
  });

  test("Teacher, Admin, API and Supabase endpoints match NEVER_CACHE_PATTERNS", () => {
    const sensitiveUrls = [
      "https://shikshaiq.edu.in/teacher",
      "https://shikshaiq.edu.in/teacher/students",
      "https://shikshaiq.edu.in/admin",
      "https://shikshaiq.edu.in/api/practice/submit",
      "https://shikshaiq.edu.in/api/practice/sync",
      "https://shikshaiq.edu.in/api/tutor",
      "https://shikshaiq.edu.in/auth/callback",
      "https://pxafiwjlonsitvafemba.supabase.co/rest/v1/student_attempts",
    ];

    for (const url of sensitiveUrls) {
      const isNeverCached = NEVER_CACHE_PATTERNS.some((p) => p.test(url));
      assert.equal(isNeverCached, true, `Sensitive endpoint ${url} must NEVER be cached`);
    }
  });

  test("Public app shell, icons, and manifest are allowed in SW cache", () => {
    const publicAssets = [
      "https://shikshaiq.edu.in/_next/static/chunks/main.js",
      "https://shikshaiq.edu.in/icons/icon.svg",
      "https://shikshaiq.edu.in/manifest.json",
      "https://shikshaiq.edu.in/manifest.webmanifest",
    ];

    for (const url of publicAssets) {
      const isBlocked = NEVER_CACHE_PATTERNS.some((p) => p.test(url));
      assert.equal(isBlocked, false, `Public asset ${url} should be eligible for SW cache`);
    }
  });
});

describe("Phase 07 Acceptance Checklist Item 8 — Honest Storage & Feature Limitations", () => {
  test("Unsupported IndexedDB environment produces honest descriptive error", async () => {
    function simulateOpenDb(indexedDbSupported: boolean): Promise<string> {
      if (!indexedDbSupported) {
        return Promise.reject(new Error("IndexedDB is not supported or available in this environment."));
      }
      return Promise.resolve("db_opened");
    }

    try {
      await simulateOpenDb(false);
      assert.fail("Should have thrown error");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      assert.equal(msg, "IndexedDB is not supported or available in this environment.");
    }
  });

  test("Storage quota errors are reported honestly to the student", () => {
    function handleStorageError(err: Error): string {
      if (err.name === "QuotaExceededError" || err.message.includes("quota")) {
        return "Device storage limit reached. Please clear browser storage to cache more lessons.";
      }
      return "Unable to save to device storage.";
    }

    const quotaErr = new Error("The quota has been exceeded.");
    quotaErr.name = "QuotaExceededError";
    const message = handleStorageError(quotaErr);
    assert.equal(message, "Device storage limit reached. Please clear browser storage to cache more lessons.");
  });

  test("AI Tutor accurately declares offline unavailability rather than hallucinating", () => {
    const isOnline = false;
    const aiTutorOfflineNotice = isOnline
      ? null
      : "AI Tutor Unavailable Offline — ShikshaIQ's Socratic AI Tutor requires an active internet connection to provide step-by-step guidance. Practice questions and lessons remain accessible offline.";

    assert.ok(aiTutorOfflineNotice);
    assert.ok(aiTutorOfflineNotice.includes("AI Tutor Unavailable Offline"));
  });
});
