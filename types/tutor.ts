/**
 * Types for ShikshaIQ Phase 06: Socratic AI Tutor
 */

import { ConceptId } from "./curriculum";

export type TutorLanguage = "en" | "hi" | "mr";

export type TutorContextType = "learn" | "practice" | "assessment" | "general";

export type TutorMessageRole = "user" | "assistant";

export interface TutorMessage {
  id: string;
  role: TutorMessageRole;
  content: string;
  createdAt: string;
  language?: TutorLanguage;
}

export interface TutorConversation {
  id: string;
  studentId: string;
  conceptId: ConceptId | null;
  contextType: TutorContextType;
  createdAt: string;
  updatedAt: string;
  messages?: TutorMessage[];
}

export interface TutorCurriculumContext {
  conceptId: ConceptId;
  conceptTitle: string;
  learningObjective: string;
  lessonSummary?: string;
  contextType: TutorContextType;
  language: TutorLanguage;
  currentQuestionPrompt?: string;
  currentQuestionOptions?: string[];
  masteryStatus?: string;
}

export interface TutorApiRequest {
  conceptId: ConceptId;
  contextType: TutorContextType;
  message: string;
  language: TutorLanguage;
  conversationId?: string;
  currentQuestionId?: string;
}

export type TutorErrorCode =
  | "UNAUTHORIZED"
  | "UNCONFIGURED"
  | "RATE_LIMITED"
  | "TIMEOUT"
  | "PROVIDER_ERROR"
  | "VALIDATION_ERROR"
  | "NOT_FOUND";

export interface TutorApiResponse {
  success: boolean;
  conversationId?: string;
  message?: TutorMessage;
  suggestedActions?: string[];
  error?: string;
  errorCode?: TutorErrorCode;
}
