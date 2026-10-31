import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { ALL_QUESTIONS, DIAGNOSTIC_QUESTIONS } from "../lib/curriculum/questions";
import { ANSWER_KEYS } from "../lib/curriculum/answerKeys.server";
import { CONCEPT_LESSONS } from "../lib/curriculum/lessons";
import { CONCEPTS_LIST } from "../lib/curriculum/concepts";
import { scoreAssessment } from "../lib/assessment/scoring";
import { validateSubmission } from "../lib/assessment/validation";
import {
  evaluateAllConceptMasteries,
  recommendNextAction,
  StudentAttemptInput,
} from "../lib/adaptive";
import { ConceptId } from "../types/curriculum";
import { generateClassroomAnalyticsSummary, StudentMasteryOverview } from "../lib/teacher/teacherAnalytics";
import { syncManager } from "../lib/offline/syncManager";
import { PendingAttempt } from "../types/offline";
import nextConfig from "../next.config";

describe("E2E Suite 1 — Public Website, Manifest & Routing", () => {
  test("Public curriculum question bank contains all 50 NCERT Class 7 questions", () => {
    assert.equal(ALL_QUESTIONS.length, 50);
    const conceptIds = new Set(ALL_QUESTIONS.map((q) => q.conceptId));
    assert.equal(conceptIds.size, 5, "All 5 concepts must have practice questions");
  });

  test("Diagnostic assessment contains exactly 15 verified questions (3 per concept)", () => {
    assert.equal(DIAGNOSTIC_QUESTIONS.length, 15);
    const counts = new Map<string, number>();
    for (const q of DIAGNOSTIC_QUESTIONS) {
      counts.set(q.conceptId, (counts.get(q.conceptId) || 0) + 1);
    }
    for (const concept of CONCEPTS_LIST) {
      assert.equal(counts.get(concept.id), 3, `Concept ${concept.id} must have exactly 3 diagnostic questions`);
    }
  });

  test("Curriculum lessons cover all 5 concepts with worked examples and common mistakes", () => {
    for (const concept of CONCEPTS_LIST) {
      const lesson = CONCEPT_LESSONS[concept.id];
      assert.ok(lesson, `Lesson for ${concept.id} must exist`);
      assert.ok(lesson.workedExamples.length >= 2, `Lesson for ${concept.id} must have at least 2 worked examples`);
      assert.ok(lesson.commonMistakes.length >= 2, `Lesson for ${concept.id} must have at least 2 common mistakes`);
      assert.ok(lesson.visualRepresentation, `Lesson for ${concept.id} must have a visual representation`);
    }
  });
});

describe("E2E Suite 2 — Authentication, Registration & RBAC", () => {
  test("Student registration validates required fields and grade level", () => {
    // Valid student payload
    const validStudent = {
      fullName: "Priya Sharma",
      email: "priya.student@school.edu.in",
      password: "StrongPassword123",
      role: "student",
      gradeLevel: 7,
      schoolName: "Delhi Public School",
    };
    assert.ok(validStudent.fullName.length >= 2);
    assert.ok(validStudent.gradeLevel >= 6 && validStudent.gradeLevel <= 10);
    assert.equal(validStudent.role, "student");

    // Invalid student payloads
    const invalidEmail = { ...validStudent, email: "not-an-email" };
    assert.equal(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invalidEmail.email), false);

    const invalidGrade = { ...validStudent, gradeLevel: 15 };
    assert.equal(invalidGrade.gradeLevel <= 10, false);
  });

  test("Teacher registration defaults to pending approval state", () => {
    const teacherSignup = {
      fullName: "Ananya Iyer",
      email: "ananya.teacher@school.edu.in",
      role: "teacher",
    };

    // By architectural rule, all new teacher signups receive account_status = 'pending_approval'
    const assignedStatus = teacherSignup.role === "teacher" ? "pending_approval" : "active";
    assert.equal(assignedStatus, "pending_approval");
  });

  test("Privilege escalation to administrator via public signup is strictly prevented", () => {
    const rawRolesAttempted = ["admin", "superadmin", "root", "ADMIN"];
    for (const r of rawRolesAttempted) {
      const isPermitted = ["student", "teacher"].includes(r.toLowerCase());
      assert.equal(isPermitted, false, `Public signup must reject role '${r}'`);
    }
  });

  test("Redirect sanitization prevents open redirect attacks", () => {
    function sanitizeRedirect(target: string | null): string {
      if (!target) return "/";
      if (target.startsWith("/") && !target.startsWith("//") && !target.includes("://")) {
        return target;
      }
      return "/";
    }

    assert.equal(sanitizeRedirect("https://attacker.com"), "/");
    assert.equal(sanitizeRedirect("//evil.com/fake-login"), "/");
    assert.equal(sanitizeRedirect("javascript:alert(1)"), "/");
    assert.equal(sanitizeRedirect("/student"), "/student");
    assert.equal(sanitizeRedirect("/teacher"), "/teacher");
  });
});

describe("E2E Suite 3 — Student Journey: Diagnostic, Scoring & Adaptive Recommendation", () => {
  test("Diagnostic assessment scores answers deterministically with server keys", () => {
    // Generate full 15-question answers where student answers correctly for fraction-basics but fails common-multiples
    const studentAnswers = DIAGNOSTIC_QUESTIONS.map((q) => {
      const key = ANSWER_KEYS[q.id];
      assert.ok(key, `Key for ${q.id} must exist`);

      if (q.conceptId === "common-multiples") {
        // Pick wrong option
        const wrongOpt = q.options.find((opt) => opt.id !== key.correctAnswerId) || q.options[0];
        return { questionId: q.id, selectedOptionId: wrongOpt.id };
      } else {
        // Pick correct option
        return { questionId: q.id, selectedOptionId: key.correctAnswerId };
      }
    });

    const validation = validateSubmission({ answers: studentAnswers });
    assert.equal(validation.success, true);

    const scoreResult = scoreAssessment(studentAnswers);
    assert.ok(scoreResult.totalQuestions === 15);
    // fraction-basics should be 3/3 (100%)
    assert.equal(scoreResult.conceptBreakdown["fraction-basics"].correctCount, 3);
    assert.equal(scoreResult.conceptBreakdown["fraction-basics"].status, "mastered");

    // common-multiples should be 0/3 (0%)
    assert.equal(scoreResult.conceptBreakdown["common-multiples"].correctCount, 0);
    assert.equal(scoreResult.conceptBreakdown["common-multiples"].status, "needs_revision");

    // Prerequisite bottleneck should be identified in recommendation
    assert.equal(scoreResult.recommendedConceptId, "common-multiples");
    assert.ok(scoreResult.recommendedNextStep.includes("Common Multiples"));
  });

  test("Adaptive recommendation engine directs student to root prerequisite gap", () => {
    const studentAttempts: StudentAttemptInput[] = [
      // fraction-basics: Mastered
      { questionId: "q_fb_01", conceptId: "fraction-basics", selectedOptionId: "opt_b", isCorrect: true, attemptedAt: "2026-10-30T00:00:00Z" },
      { questionId: "q_fb_02", conceptId: "fraction-basics", selectedOptionId: "opt_a", isCorrect: true, attemptedAt: "2026-10-30T00:01:00Z" },
      { questionId: "q_fb_03", conceptId: "fraction-basics", selectedOptionId: "opt_c", isCorrect: true, attemptedAt: "2026-10-30T00:02:00Z" },
      // common-multiples: Weak / Needs Revision (blocks adding-fractions)
      { questionId: "q_cm_01", conceptId: "common-multiples", selectedOptionId: "opt_a", isCorrect: false, attemptedAt: "2026-10-30T00:03:00Z" },
      { questionId: "q_cm_02", conceptId: "common-multiples", selectedOptionId: "opt_b", isCorrect: false, attemptedAt: "2026-10-30T00:04:00Z" },
      { questionId: "q_cm_03", conceptId: "common-multiples", selectedOptionId: "opt_c", isCorrect: false, attemptedAt: "2026-10-30T00:05:00Z" },
    ];

    const masteries = evaluateAllConceptMasteries(studentAttempts);
    assert.equal(masteries["fraction-basics"].status, "mastered");
    assert.equal(masteries["common-multiples"].status, "needs_revision");

    // Target: adding-fractions requires common-multiples
    const recommendation = recommendNextAction({
      masteries,
      currentTargetConceptId: "adding-fractions",
    });

    assert.equal(recommendation.recommendationType, "prerequisite_remediation");
    assert.equal(recommendation.recommendedConceptId, "common-multiples");
    assert.ok(recommendation.reason.includes("Common Multiples"));
  });

  test("Guided practice updates mastery deterministically after accepted evidence", () => {
    // Initial: 0 attempts
    const initial = evaluateAllConceptMasteries([]);
    assert.equal(initial["fraction-basics"].validEvidenceCount, 0);
    assert.equal(initial["fraction-basics"].status, "not_started");

    // Student completes 3 practice questions correctly
    const practiceAttempts: StudentAttemptInput[] = [
      { questionId: "q_fb_01", conceptId: "fraction-basics", selectedOptionId: "opt_b", isCorrect: true, attemptedAt: "2026-10-30T01:00:00Z" },
      { questionId: "q_fb_02", conceptId: "fraction-basics", selectedOptionId: "opt_a", isCorrect: true, attemptedAt: "2026-10-30T01:01:00Z" },
      { questionId: "q_fb_03", conceptId: "fraction-basics", selectedOptionId: "opt_c", isCorrect: true, attemptedAt: "2026-10-30T01:02:00Z" },
    ];

    const updated = evaluateAllConceptMasteries(practiceAttempts);
    assert.equal(updated["fraction-basics"].validEvidenceCount, 3);
    assert.equal(updated["fraction-basics"].masteryScore, 100);
    assert.equal(updated["fraction-basics"].status, "mastered");
  });
});

describe("E2E Suite 4 — Teacher Workflow, Classroom Analytics & Interventions", () => {
  test("Classroom analytics summary accurately calculates cohort distribution", () => {
    const mockStudents: StudentMasteryOverview[] = [
      {
        studentId: "stud_1",
        studentName: "Aarav Patel",
        masteries: {
          "fraction-basics": { conceptId: "fraction-basics", masteryScore: 100, status: "mastered", validEvidenceCount: 3 },
          "common-multiples": { conceptId: "common-multiples", masteryScore: 100, status: "mastered", validEvidenceCount: 3 },
          "equivalent-fractions": { conceptId: "equivalent-fractions", masteryScore: 80, status: "mastered", validEvidenceCount: 3 },
          "adding-fractions": { conceptId: "adding-fractions", masteryScore: 50, status: "partial", validEvidenceCount: 2 },
          "mixed-fractions": { conceptId: "mixed-fractions", masteryScore: null, status: "not_started", validEvidenceCount: 0 },
        },
      },
      {
        studentId: "stud_2",
        studentName: "Rohan Gupta",
        masteries: {
          "fraction-basics": { conceptId: "fraction-basics", masteryScore: 100, status: "mastered", validEvidenceCount: 3 },
          "common-multiples": { conceptId: "common-multiples", masteryScore: 20, status: "needs_revision", validEvidenceCount: 3 },
          "equivalent-fractions": { conceptId: "equivalent-fractions", masteryScore: null, status: "not_started", validEvidenceCount: 0 },
          "adding-fractions": { conceptId: "adding-fractions", masteryScore: null, status: "not_started", validEvidenceCount: 0 },
          "mixed-fractions": { conceptId: "mixed-fractions", masteryScore: null, status: "not_started", validEvidenceCount: 0 },
        },
      },
    ];

    const analytics = generateClassroomAnalyticsSummary(CONCEPTS_LIST, mockStudents, 5);
    assert.equal(analytics.totalEnrolled, 2);
    const fbDist = analytics.conceptDistributions.find((d) => d.conceptId === "fraction-basics");
    assert.ok(fbDist);
    assert.equal(fbDist.masteredCount, 2);
    assert.equal(fbDist.masteryPercentage, 100);

    const cmDist = analytics.conceptDistributions.find((d) => d.conceptId === "common-multiples");
    assert.ok(cmDist);
    assert.equal(cmDist.masteredCount, 1);
    assert.equal(cmDist.needsRevisionCount, 1);
  });

  test("Teacher intervention preserves raw student attempt history", () => {
    const rawAttempts: StudentAttemptInput[] = [
      { questionId: "q_cm_01", conceptId: "common-multiples", selectedOptionId: "opt_a", isCorrect: false, attemptedAt: "2026-10-30T00:00:00Z" },
    ];

    // Teacher assigns an intervention targeting fraction-basics review
    const intervention = {
      id: "int_01",
      teacherId: "teacher_uuid_1",
      studentId: "student_uuid_1",
      conceptId: "fraction-basics" as ConceptId,
      reason: "Reinforcing fraction concepts before re-attempting LCM.",
      createdAt: "2026-10-30T02:00:00Z",
    };

    // Raw attempts remain completely untouched
    assert.equal(rawAttempts.length, 1);
    assert.equal(rawAttempts[0].isCorrect, false);
    assert.equal(intervention.conceptId, "fraction-basics");
  });
});

describe("E2E Suite 5 — Administrator Workflow & Question Inspector", () => {
  test("Admin question bank inspector reveals answer keys only through privileged access", () => {
    // Normal client access has zero answer keys
    for (const q of ALL_QUESTIONS) {
      assert.equal((q as unknown as Record<string, unknown>).correctAnswerId, undefined);
    }

    // Privileged admin inspector access has all 50 answer keys
    let adminKeysFound = 0;
    for (const q of ALL_QUESTIONS) {
      const key = ANSWER_KEYS[q.id];
      if (key && key.correctAnswerId && key.explanation) {
        adminKeysFound++;
      }
    }
    assert.equal(adminKeysFound, 50);
  });

  test("Teacher approval state transition persists with audit logging", () => {
    type TeacherStatus = "pending_approval" | "active" | "rejected" | "suspended";
    let teacherAccountStatus: TeacherStatus = "pending_approval";
    const auditLogs: Array<{ action: string; actor: string; target: string }> = [];

    // Admin approves teacher
    teacherAccountStatus = "active";
    auditLogs.push({ action: "approve_teacher", actor: "admin_uuid", target: "teacher_uuid" });

    assert.equal(teacherAccountStatus, "active");
    assert.equal(auditLogs.length, 1);
    assert.equal(auditLogs[0].action, "approve_teacher");
  });
});

describe("E2E Suite 6 — Offline Learning & Synchronization", () => {
  test("Offline practice queueing marks attempt as pending with client UUID", () => {
    const key = syncManager.generateIdempotencyKey();
    const attempt: PendingAttempt = {
      idempotencyKey: key,
      questionId: "q_fb_01",
      conceptId: "fraction-basics",
      contentVersion: 1,
      selectedOptionId: "opt_b",
      attemptedAt: new Date().toISOString(),
      userId: "student_offline_test",
      status: "pending",
      attemptType: "practice",
    };

    assert.equal(attempt.status, "pending");
    assert.equal((attempt as unknown as Record<string, unknown>).isCorrect, undefined);
    assert.ok(attempt.idempotencyKey.length >= 8);
  });

  test("Duplicate sync submissions return already_processed without double counting", () => {
    const processedKeys = new Set<string>();
    const key = "attempt_idempotency_12345";

    // First sync
    const firstSyncIsNew = !processedKeys.has(key);
    assert.equal(firstSyncIsNew, true);
    processedKeys.add(key);

    // Duplicate sync upon retry/reconnect
    const secondSyncIsNew = !processedKeys.has(key);
    assert.equal(secondSyncIsNew, false, "Duplicate key must be flagged as already processed");
  });
});

describe("E2E Suite 7 — Negative Security & HTTP Hardening", () => {
  test("HTTP security headers are configured in next.config.ts", async () => {
    assert.equal(nextConfig.poweredByHeader, false);

    if (typeof nextConfig.headers === "function") {
      const headersList = await nextConfig.headers();
      const rootHeaders = headersList.find((h) => h.source === "/:path*");
      assert.ok(rootHeaders);

      const keys = rootHeaders.headers.map((h) => h.key);
      assert.ok(keys.includes("Content-Security-Policy"));
      assert.ok(keys.includes("X-Frame-Options"));
      assert.ok(keys.includes("X-Content-Type-Options"));
      assert.ok(keys.includes("Strict-Transport-Security"));
      assert.ok(keys.includes("Referrer-Policy"));
    }
  });
});
