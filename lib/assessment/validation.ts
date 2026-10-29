import { z } from "zod";
import { AssessmentSubmission } from "../../types/assessment";

export const studentAnswerSchema = z.object({
  questionId: z.string().trim().min(1, "Question ID is required"),
  selectedOptionId: z.string().trim().min(1, "Selected option ID is required"),
  timeSpentSeconds: z.number().nonnegative().optional(),
});

export const assessmentSubmissionSchema = z.object({
  answers: z
    .array(studentAnswerSchema)
    .min(1, "At least one answer must be submitted")
    .max(50, "Answer submission exceeds maximum size"),
  personaId: z.string().trim().optional(),
  submittedAt: z.string().datetime().optional(),
});

export type ValidatedSubmission = z.infer<typeof assessmentSubmissionSchema>;

export function validateSubmission(
  rawInput: unknown
): { success: true; data: AssessmentSubmission } | { success: false; error: string } {
  const result = assessmentSubmissionSchema.safeParse(rawInput);
  if (!result.success) {
    const errorMessages = result.error.issues.map((issue) => issue.message).join(", ");
    return { success: false, error: errorMessages || "Invalid submission format" };
  }
  return { success: true, data: result.data };
}
