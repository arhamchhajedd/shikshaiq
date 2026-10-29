/**
 * ShikshaIQ: Teacher Interventions & Pedagogical Overrides Types
 * Phase 05: Actionable Insights & Teacher Overrides
 */

import { AdaptiveRecommendation } from "@/lib/adaptive";

export type InterventionAction = "learn" | "practice" | "assessment";
export type InterventionStatus = "active" | "completed" | "dismissed";

export interface TeacherIntervention {
  id: string;
  teacherId: string;
  studentId: string;
  classroomId: string | null;
  targetConceptId: string;
  recommendedAction: InterventionAction;
  teacherNotes: string | null;
  originalRecommendation: AdaptiveRecommendation | null;
  status: InterventionStatus;
  createdAt: string;
  updatedAt: string;
  // Joined presentation data
  teacherName?: string;
  studentName?: string;
  conceptTitle?: string;
}

export interface CreateInterventionInput {
  studentId: string;
  classroomId?: string | null;
  targetConceptId: string;
  recommendedAction: InterventionAction;
  teacherNotes?: string;
  originalRecommendation?: AdaptiveRecommendation | null;
}
