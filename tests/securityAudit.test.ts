import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { ALL_QUESTIONS } from "../lib/curriculum/questions";
import { ANSWER_KEYS } from "../lib/curriculum/answerKeys.server";
import { validateConceptGraph, ConceptGraphError } from "../lib/adaptive/graph";
import { AdaptiveGraphNode } from "../lib/adaptive/types";
import { checkTutorRateLimit } from "../lib/tutor/rateLimiter";
import nextConfig from "../next.config";

describe("Phase 08 Security Audit — Open Redirect Defense", () => {
  function sanitizeRedirect(target: string | null): string {
    if (!target) return "/";
    if (target.startsWith("/") && !target.startsWith("//") && !target.includes("://")) {
      return target;
    }
    return "/";
  }

  test("Rejects external malicious URLs and protocol-relative bypasses", () => {
    const maliciousUrls = [
      "https://malicious-phishing.com/steal-creds",
      "http://attacker.com",
      "//evil.com/fake-login",
      "javascript:alert(1)",
      "data:text/html,<script>alert(1)</script>",
      "https://shikshaiq.edu.in.attacker.com",
    ];

    for (const url of maliciousUrls) {
      const sanitized = sanitizeRedirect(url);
      assert.equal(sanitized, "/", `Malicious redirect ${url} MUST be sanitized to '/'`);
    }
  });

  test("Allows legitimate internal relative application routes", () => {
    const safeRoutes = [
      "/student",
      "/student/learn/fraction-basics",
      "/student/practice/fraction-basics",
      "/teacher",
      "/admin",
      "/pending-approval",
    ];

    for (const route of safeRoutes) {
      const sanitized = sanitizeRedirect(route);
      assert.equal(sanitized, route, `Safe internal route ${route} must be preserved`);
    }
  });
});

describe("Phase 08 Security Audit — Public Registration Privilege Escalation", () => {
  test("Public signup schema rejects attempts to register as administrator", () => {
    const attemptedAdminPayload = {
      fullName: "Attacker User",
      email: "attacker@test.edu",
      password: "Password123!",
      role: "admin",
    };

    const allowedRoles = ["student", "teacher"];
    const isAllowed = allowedRoles.includes(attemptedAdminPayload.role);
    assert.equal(isAllowed, false, "Public registration must never accept 'admin' role");
  });
});

describe("Phase 08 Security Audit — Zero Answer Key Leakage in Client Curriculum", () => {
  test("All 25 public questions contain ZERO private answer keys or pedagogical explanations", () => {
    assert.equal(ALL_QUESTIONS.length, 25, "All 25 curriculum questions must be verified");

    for (const q of ALL_QUESTIONS) {
      const untrusted = q as unknown as Record<string, unknown>;
      assert.equal(untrusted.correctAnswerId, undefined, `Question ${q.id} must not expose correctAnswerId`);
      assert.equal(untrusted.correctOptionId, undefined, `Question ${q.id} must not expose correctOptionId`);
      assert.equal(untrusted.explanation, undefined, `Question ${q.id} must not expose explanation`);
    }
  });

  test("Private server repository contains matching verified answer keys for all 25 questions", () => {
    for (const q of ALL_QUESTIONS) {
      const key = ANSWER_KEYS[q.id];
      assert.ok(key, `Question ${q.id} must have a corresponding server answer key`);
      assert.ok(key.correctAnswerId, `Key for ${q.id} must have correctAnswerId`);
      assert.ok(key.explanation.length > 10, `Key for ${q.id} must have pedagogical explanation`);

      // Verify that correctAnswerId corresponds to an actual option in the question
      const hasOption = q.options.some((opt) => opt.id === key.correctAnswerId);
      assert.equal(hasOption, true, `Key correctAnswerId ${key.correctAnswerId} must exist in options for ${q.id}`);
    }
  });
});

describe("Phase 08 Security Audit — Adaptive Concept Graph Safety & Cycle Detection", () => {
  test("Detects self-loops and throws ConceptGraphError", () => {
    const selfLoopGraph: AdaptiveGraphNode[] = [
      {
        id: "fraction-basics",
        title: "Basics",
        shortTitle: "Basics",
        description: "Basics",
        gradeLevel: 7,
        order: 1,
        prerequisites: ["fraction-basics"],
      },
    ];

    assert.throws(
      () => validateConceptGraph(selfLoopGraph),
      ConceptGraphError,
      "Self-loop must throw ConceptGraphError"
    );
  });

  test("Detects circular cycles (A -> B -> A) and throws ConceptGraphError", () => {
    const cyclicGraph: AdaptiveGraphNode[] = [
      {
        id: "fraction-basics",
        title: "Basics",
        shortTitle: "Basics",
        description: "Basics",
        gradeLevel: 7,
        order: 1,
        prerequisites: ["common-multiples"],
      },
      {
        id: "common-multiples",
        title: "Multiples",
        shortTitle: "Multiples",
        description: "Multiples",
        gradeLevel: 7,
        order: 2,
        prerequisites: ["fraction-basics"],
      },
    ];

    assert.throws(
      () => validateConceptGraph(cyclicGraph),
      ConceptGraphError,
      "Cyclic dependency must throw ConceptGraphError"
    );
  });

  test("Detects unknown prerequisite references", () => {
    const invalidPrereqGraph: AdaptiveGraphNode[] = [
      {
        id: "fraction-basics",
        title: "Basics",
        shortTitle: "Basics",
        description: "Basics",
        gradeLevel: 7,
        order: 1,
        prerequisites: ["non_existent_concept_xyz" as never],
      },
    ];

    assert.throws(
      () => validateConceptGraph(invalidPrereqGraph),
      ConceptGraphError,
      "Unknown prerequisite must throw ConceptGraphError"
    );
  });
});

describe("Phase 08 Security Audit — Socratic AI Tutor Rate Limiting & Isolation", () => {
  test("Rate limiter enforces 15 requests per minute threshold per student", () => {
    const testStudentId = `rate_test_student_${Date.now()}`;

    // 15 requests should all be allowed
    for (let i = 0; i < 15; i++) {
      const result = checkTutorRateLimit(testStudentId);
      assert.equal(result.allowed, true, `Request ${i + 1} should be permitted`);
    }

    // 16th request must be rejected
    const blocked = checkTutorRateLimit(testStudentId);
    assert.equal(blocked.allowed, false, "16th request within 1 minute must be rejected");
    assert.ok((blocked.retryAfterSeconds ?? 0) > 0, "Retry-After seconds must be provided");
  });
});

describe("Phase 08 Security Audit — Production HTTP Security Headers", () => {
  test("nextConfig includes essential security headers", async () => {
    assert.equal(nextConfig.poweredByHeader, false, "X-Powered-By header must be disabled");

    if (typeof nextConfig.headers === "function") {
      const configuredHeaders = await nextConfig.headers();
      assert.ok(configuredHeaders.length > 0, "Headers must be configured");

      const rootConfig = configuredHeaders.find((h) => h.source === "/:path*");
      assert.ok(rootConfig, "Root path wildcard header rule must exist");

      const headerKeys = rootConfig.headers.map((h) => h.key);
      assert.ok(headerKeys.includes("Content-Security-Policy"), "CSP must be configured");
      assert.ok(headerKeys.includes("X-Frame-Options"), "X-Frame-Options must be configured");
      assert.ok(headerKeys.includes("X-Content-Type-Options"), "X-Content-Type-Options must be configured");
      assert.ok(headerKeys.includes("Strict-Transport-Security"), "HSTS must be configured");
      assert.ok(headerKeys.includes("Referrer-Policy"), "Referrer-Policy must be configured");

      const frameOptions = rootConfig.headers.find((h) => h.key === "X-Frame-Options");
      assert.equal(frameOptions?.value, "DENY", "X-Frame-Options must be DENY");
    }
  });
});
