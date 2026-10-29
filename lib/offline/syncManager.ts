/**
 * ShikshaIQ Client Synchronization Manager
 *
 * Coordinates:
 * - Online/Offline status detection & event listeners
 * - Queueing practice attempts into IndexedDB with client UUIDs
 * - Batch synchronization with /api/practice/sync
 * - Local caching of approved curriculum lessons and public questions
 * - Subscriber notification for UI reactive updates
 */

import { ConceptId } from "@/types/curriculum";
import {
  CachedLesson,
  CachedQuestion,
  PendingAttempt,
  BatchSyncResponse,
  StudentSyncMetadata,
} from "@/types/offline";
import {
  savePendingAttempt,
  getPendingAttemptsForUser,
  updateAttemptStatus,
  removePendingAttempt,
  saveCachedLesson,
  getCachedLesson,
  getAllCachedLessons,
  saveCachedQuestions,
  getCachedQuestions,
  saveSyncMetadata,
  getSyncMetadata,
} from "./indexedDb";
import { CONCEPT_LESSONS } from "@/lib/curriculum/lessons";
import { ALL_QUESTIONS } from "@/lib/curriculum/questions";

type SyncListener = (state: {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncAt: string | null;
  lastError: string | null;
}) => void;

class SyncManager {
  private listeners: Set<SyncListener> = new Set();
  private isSyncing = false;
  private lastSyncAt: string | null = null;
  private lastError: string | null = null;
  private isOnline = typeof window !== "undefined" ? navigator.onLine : true;
  private activeUserId: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        this.isOnline = true;
        this.notify();
        // Auto-synchronize pending attempts for active student upon reconnection
        if (this.activeUserId) {
          void this.syncPendingAttempts(this.activeUserId).catch((err) => {
            console.warn("[SyncManager] Auto-sync on reconnect warning:", err);
          });
        }
      });

      window.addEventListener("offline", () => {
        this.isOnline = false;
        this.notify();
      });
    }
  }

  public setActiveUser(userId: string | null): void {
    this.activeUserId = userId;
  }

  public getActiveUser(): string | null {
    return this.activeUserId;
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(pendingCount = 0) {
    for (const listener of this.listeners) {
      listener({
        isOnline: this.isOnline,
        pendingCount,
        isSyncing: this.isSyncing,
        lastSyncAt: this.lastSyncAt,
        lastError: this.lastError,
      });
    }
  }

  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Generates a stable client-side UUID for attempt idempotency.
   */
  public generateIdempotencyKey(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Enqueue an offline practice attempt into IndexedDB.
   * Tagged strictly with studentId for multi-user isolation.
   */
  public async queueAttempt(params: {
    questionId: string;
    conceptId: ConceptId;
    selectedOptionId: string;
    userId: string;
    contentVersion?: number;
  }): Promise<PendingAttempt> {
    if (!params.userId || params.userId.trim() === "") {
      throw new Error("Student authentication ID is required to isolate offline attempts.");
    }

    const idempotencyKey = this.generateIdempotencyKey();
    const attempt: PendingAttempt = {
      idempotencyKey,
      questionId: params.questionId,
      conceptId: params.conceptId,
      contentVersion: params.contentVersion || 1,
      selectedOptionId: params.selectedOptionId,
      attemptedAt: new Date().toISOString(),
      userId: params.userId,
      status: "pending",
      attemptType: "practice",
    };

    await savePendingAttempt(attempt);

    // Update metadata
    const pendingList = await getPendingAttemptsForUser(params.userId);
    await saveSyncMetadata({
      userId: params.userId,
      pendingCount: pendingList.length,
      lastSyncAt: this.lastSyncAt,
      lastSyncError: null,
    });

    this.notify(pendingList.length);
    return attempt;
  }

  /**
   * Synchronize pending attempts for a specific student with Supabase.
   */
  public async syncPendingAttempts(
    userId: string
  ): Promise<BatchSyncResponse | null> {
    if (!this.isOnline || !userId || this.isSyncing) {
      return null;
    }

    const pendingAttempts = await getPendingAttemptsForUser(userId);
    if (pendingAttempts.length === 0) {
      this.notify(0);
      return null;
    }

    this.isSyncing = true;
    this.lastError = null;
    this.notify(pendingAttempts.length);

    try {
      // Mark attempts as syncing in IndexedDB
      for (const att of pendingAttempts) {
        await updateAttemptStatus(att.idempotencyKey, "syncing");
      }

      // Prepare batch payload (maximum 20 items)
      const batch = pendingAttempts.slice(0, 20).map((a) => ({
        idempotencyKey: a.idempotencyKey,
        questionId: a.questionId,
        conceptId: a.conceptId,
        contentVersion: a.contentVersion,
        selectedOptionId: a.selectedOptionId,
        attemptedAt: a.attemptedAt,
        attemptType: a.attemptType,
      }));

      const res = await fetch("/api/practice/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attempts: batch }),
      });

      const data: BatchSyncResponse = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Server rejected synchronization batch");
      }

      // Process results
      for (const itemResult of data.results) {
        if (itemResult.status === "synced" || itemResult.status === "already_processed") {
          // Permanently remove synced attempt from local queue
          await removePendingAttempt(itemResult.idempotencyKey);
        } else if (itemResult.status === "rejected") {
          await updateAttemptStatus(
            itemResult.idempotencyKey,
            "failed",
            itemResult.error || "Rejected by server"
          );
        }
      }

      this.lastSyncAt = new Date().toISOString();
      const remaining = await getPendingAttemptsForUser(userId);

      await saveSyncMetadata({
        userId,
        pendingCount: remaining.length,
        lastSyncAt: this.lastSyncAt,
        lastSyncError: null,
      });

      this.isSyncing = false;
      this.notify(remaining.length);
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sync network error";
      this.lastError = msg;

      // Revert in-flight attempts back to pending
      for (const att of pendingAttempts) {
        await updateAttemptStatus(att.idempotencyKey, "pending", msg);
      }

      const remaining = await getPendingAttemptsForUser(userId);
      await saveSyncMetadata({
        userId,
        pendingCount: remaining.length,
        lastSyncAt: this.lastSyncAt,
        lastSyncError: msg,
      });

      this.isSyncing = false;
      this.notify(remaining.length);
      throw err;
    }
  }

  /**
   * Cache approved curriculum lesson and questions for offline access.
   * Guaranteed ZERO answer key leakage.
   */
  public async cacheCurriculumConcept(conceptId: ConceptId): Promise<{
    lessonCached: boolean;
    questionsCount: number;
  }> {
    const lesson = CONCEPT_LESSONS[conceptId];
    if (!lesson) {
      throw new Error(`Lesson for concept ${conceptId} not found in curriculum.`);
    }

    const cachedLesson: CachedLesson = {
      conceptId,
      contentVersion: 1,
      lesson,
      cachedAt: new Date().toISOString(),
    };
    await saveCachedLesson(cachedLesson);

    // Filter public questions (strictly ZERO answer keys)
    const questions = ALL_QUESTIONS.filter((q) => q.conceptId === conceptId);
    const cachedQuestions: CachedQuestion[] = questions.map((q) => ({
      id: q.id,
      conceptId: q.conceptId,
      contentVersion: 1,
      prompt: q.prompt,
      options: q.options,
      difficulty: q.difficulty,
      learningObjective: q.learningObjective,
      cachedAt: new Date().toISOString(),
    }));

    await saveCachedQuestions(cachedQuestions);

    // Pre-cache HTML navigation routes in CacheStorage for complete offline access
    if (typeof window !== "undefined" && "caches" in window) {
      try {
        const cache = await window.caches.open("shikshaiq-v1-static");
        await Promise.allSettled([
          cache.add(`/student/learn/${conceptId}`),
          cache.add(`/student/practice/${conceptId}`),
        ]);
      } catch (cacheErr) {
        console.warn("[SyncManager] Cache pre-warm non-critical warning:", cacheErr);
      }
    }

    return {
      lessonCached: true,
      questionsCount: cachedQuestions.length,
    };
  }

  /**
   * Retrieve cached lesson from IndexedDB if available.
   */
  public async getCachedLesson(conceptId: ConceptId): Promise<CachedLesson | null> {
    return getCachedLesson(conceptId);
  }

  /**
   * Retrieve cached public questions from IndexedDB if available.
   */
  public async getCachedQuestions(conceptId: ConceptId): Promise<CachedQuestion[]> {
    return getCachedQuestions(conceptId);
  }

  /**
   * Check if a concept is cached locally.
   */
  public async isConceptCachedLocally(conceptId: ConceptId): Promise<boolean> {
    const lesson = await getCachedLesson(conceptId);
    return !!lesson;
  }

  /**
   * Get all concept IDs currently downloaded for offline access.
   */
  public async getDownloadedConceptIds(): Promise<ConceptId[]> {
    const all = await getAllCachedLessons();
    return all.map((c) => c.conceptId);
  }

  /**
   * Read sync metadata for user.
   */
  public async getMetadata(userId: string): Promise<StudentSyncMetadata | null> {
    return getSyncMetadata(userId);
  }
}

// Singleton export
export const syncManager = new SyncManager();
