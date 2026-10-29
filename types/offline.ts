import { ConceptId, ConceptLesson, QuestionOption } from "./curriculum";
import { ConceptMasteryRecord, AdaptiveRecommendation } from "@/lib/adaptive/types";

/**
 * Public representation of a curriculum question stored in local IndexedDB.
 * Crucial Security Guarantee: Contains ZERO answer keys, solutions, or private credentials.
 */
export interface CachedQuestion {
  id: string;
  conceptId: ConceptId;
  contentVersion: number;
  prompt: string;
  options: QuestionOption[];
  difficulty: "easy" | "medium" | "hard";
  learningObjective: string;
  cachedAt: string;
}

/**
 * Cached lesson metadata and pedagogical content stored in IndexedDB.
 */
export interface CachedLesson {
  conceptId: ConceptId;
  contentVersion: number;
  lesson: ConceptLesson;
  cachedAt: string;
}

/**
 * Status of a local offline practice attempt in the queue.
 */
export type AttemptSyncStatus = "pending" | "syncing" | "synced" | "failed";

/**
 * Pending practice attempt stored in client IndexedDB.
 * Associated strictly with the owning authenticated student ID.
 */
export interface PendingAttempt {
  idempotencyKey: string; // Stable UUID generated on client
  questionId: string;
  conceptId: ConceptId;
  contentVersion: number;
  selectedOptionId: string;
  attemptedAt: string;
  userId: string; // Owning student ID for account isolation
  status: AttemptSyncStatus;
  error?: string;
  attemptType: "practice";
}

/**
 * Per-attempt synchronization outcome returned from the server sync endpoint.
 */
export interface SyncResultItem {
  idempotencyKey: string;
  questionId: string;
  success: boolean;
  status: "synced" | "already_processed" | "rejected";
  isCorrect?: boolean;
  correctOptionId?: string;
  explanation?: string;
  error?: string;
}

/**
 * Server response for batch practice synchronization.
 */
export interface BatchSyncResponse {
  success: boolean;
  results: SyncResultItem[];
  updatedMasteries?: Record<string, ConceptMasteryRecord>;
  recommendation?: AdaptiveRecommendation;
  error?: string;
}

/**
 * Metadata tracking offline queue statistics per student in IndexedDB.
 */
export interface StudentSyncMetadata {
  userId: string;
  pendingCount: number;
  lastSyncAt: string | null;
  lastSyncError: string | null;
}
