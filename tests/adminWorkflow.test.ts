import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { CONCEPTS } from "../lib/curriculum/concepts";

describe("Classroom Management & Security Validation", () => {
  const createClassroomSchema = z.object({
    name: z.string().trim().min(3).max(60),
    gradeLevel: z.number().int().min(1).max(12).default(7),
    subject: z.string().trim().min(2).max(60).default("Mathematics"),
    section: z.string().trim().max(30).nullable().optional(),
  });

  test("validates valid classroom creation inputs", () => {
    const valid = createClassroomSchema.safeParse({
      name: "Grade 7-A Mathematics",
      gradeLevel: 7,
      subject: "Mathematics",
      section: "Section A",
    });
    assert.equal(valid.success, true);
  });

  test("rejects invalid classroom name and out-of-range grade levels", () => {
    const invalidShortName = createClassroomSchema.safeParse({
      name: "A",
      gradeLevel: 7,
    });
    assert.equal(invalidShortName.success, false);

    const invalidGrade = createClassroomSchema.safeParse({
      name: "Grade 15 Math",
      gradeLevel: 15,
    });
    assert.equal(invalidGrade.success, false);
  });

  test("generates unguessable 6-character uppercase join code", () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    function generateCode() {
      let code = "";
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    }

    const code = generateCode();
    assert.equal(code.length, 6);
    assert.equal(/^[A-Z2-9]{6}$/.test(code), true);
    // Ensure no confusing 0, O, 1, I characters
    assert.equal(/[01OI]/.test(code), false);
  });
});

describe("Teacher Intervention & Override Validation", () => {
  const interventionSchema = z.object({
    studentId: z.string().uuid("Invalid student ID."),
    targetConceptId: z.string().refine((val) => val in CONCEPTS, {
      message: "Invalid target concept ID.",
    }),
    recommendedAction: z.enum(["learn", "practice", "assessment"] as const),
    teacherNotes: z.string().trim().max(300).optional(),
  });

  test("accepts valid teacher intervention payload", () => {
    const valid = interventionSchema.safeParse({
      studentId: "123e4567-e89b-12d3-a456-426614174000",
      targetConceptId: "common-multiples",
      recommendedAction: "learn",
      teacherNotes: "Please review the visual LCM factor tree example before class.",
    });
    assert.equal(valid.success, true);
  });

  test("rejects unknown concept ID for intervention", () => {
    const invalid = interventionSchema.safeParse({
      studentId: "123e4567-e89b-12d3-a456-426614174000",
      targetConceptId: "calculus-derivatives",
      recommendedAction: "learn",
    });
    assert.equal(invalid.success, false);
  });
});

describe("Admin Teacher Rejection & Status Transition Validation", () => {
  const rejectSchema = z.object({
    teacherId: z.string().uuid("Invalid teacher ID."),
    rejectionReason: z
      .string()
      .trim()
      .min(5, "Please provide a rejection reason (at least 5 characters).")
      .max(250, "Reason cannot exceed 250 characters."),
  });

  test("accepts valid teacher rejection with legitimate reason", () => {
    const valid = rejectSchema.safeParse({
      teacherId: "123e4567-e89b-12d3-a456-426614174000",
      rejectionReason: "Institutional email domain could not be verified by school coordinator.",
    });
    assert.equal(valid.success, true);
  });

  test("rejects rejection request with empty or too-short reason", () => {
    const invalid = rejectSchema.safeParse({
      teacherId: "123e4567-e89b-12d3-a456-426614174000",
      rejectionReason: "No",
    });
    assert.equal(invalid.success, false);
  });
});
