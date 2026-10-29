/**
 * ShikshaIQ IndexedDB Persistence Layer
 *
 * Provides typed, transactional access to:
 * 1. cached_lessons: Approved curriculum lessons stored locally.
 * 2. cached_questions: Public practice questions (ZERO answer keys or solutions).
 * 3. pending_attempts: Queued offline practice attempts with client idempotency keys.
 * 4. sync_metadata: Per-student queue statistics and last sync timestamps.
 */

import {
  CachedLesson,
  CachedQuestion,
  PendingAttempt,
  AttemptSyncStatus,
  StudentSyncMetadata,
} from "@/types/offline";
import { ConceptId } from "@/types/curriculum";

const DB_NAME = "shikshaiq_offline_v1";
const DB_VERSION = 1;

const STORES = {
  LESSONS: "cached_lessons",
  QUESTIONS: "cached_questions",
  ATTEMPTS: "pending_attempts",
  METADATA: "sync_metadata",
} as const;

function isIndexedDBAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.indexedDB !== "undefined";
}

/**
 * Open or upgrade the ShikshaIQ IndexedDB database.
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBAvailable()) {
      return reject(new Error("IndexedDB is not supported or available in this environment."));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Lessons store: keyPath = conceptId
      if (!db.objectStoreNames.contains(STORES.LESSONS)) {
        db.createObjectStore(STORES.LESSONS, { keyPath: "conceptId" });
      }

      // 2. Questions store: keyPath = id, index on conceptId
      if (!db.objectStoreNames.contains(STORES.QUESTIONS)) {
        const questionStore = db.createObjectStore(STORES.QUESTIONS, { keyPath: "id" });
        questionStore.createIndex("by_concept", "conceptId", { unique: false });
      }

      // 3. Pending attempts store: keyPath = idempotencyKey, index on userId, status
      if (!db.objectStoreNames.contains(STORES.ATTEMPTS)) {
        const attemptStore = db.createObjectStore(STORES.ATTEMPTS, { keyPath: "idempotencyKey" });
        attemptStore.createIndex("by_user", "userId", { unique: false });
        attemptStore.createIndex("by_status", "status", { unique: false });
        attemptStore.createIndex("by_user_status", ["userId", "status"], { unique: false });
      }

      // 4. Sync metadata store: keyPath = userId
      if (!db.objectStoreNames.contains(STORES.METADATA)) {
        db.createObjectStore(STORES.METADATA, { keyPath: "userId" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Failed to open IndexedDB"));
  });
}

// -----------------------------------------------------------------------------
// LESSON CACHING
// -----------------------------------------------------------------------------

export async function saveCachedLesson(cachedLesson: CachedLesson): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.LESSONS, "readwrite");
    const store = tx.objectStore(STORES.LESSONS);
    const req = store.put(cachedLesson);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getCachedLesson(conceptId: ConceptId): Promise<CachedLesson | null> {
  if (!isIndexedDBAvailable()) return null;
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.LESSONS, "readonly");
    const store = tx.objectStore(STORES.LESSONS);
    const req = store.get(conceptId);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllCachedLessons(): Promise<CachedLesson[]> {
  if (!isIndexedDBAvailable()) return [];
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.LESSONS, "readonly");
    const store = tx.objectStore(STORES.LESSONS);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

// -----------------------------------------------------------------------------
// QUESTION CACHING (Zero answer keys, public text only)
// -----------------------------------------------------------------------------

export async function saveCachedQuestions(questions: CachedQuestion[]): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.QUESTIONS, "readwrite");
    const store = tx.objectStore(STORES.QUESTIONS);

    for (const q of questions) {
      store.put(q);
    }

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCachedQuestions(conceptId: ConceptId): Promise<CachedQuestion[]> {
  if (!isIndexedDBAvailable()) return [];
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.QUESTIONS, "readonly");
    const store = tx.objectStore(STORES.QUESTIONS);
    const index = store.index("by_concept");
    const req = index.getAll(conceptId);
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllCachedQuestions(): Promise<CachedQuestion[]> {
  if (!isIndexedDBAvailable()) return [];
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.QUESTIONS, "readonly");
    const store = tx.objectStore(STORES.QUESTIONS);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

// -----------------------------------------------------------------------------
// PENDING PRACTICE ATTEMPTS (Account Isolated)
// -----------------------------------------------------------------------------

export async function savePendingAttempt(attempt: PendingAttempt): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.ATTEMPTS, "readwrite");
    const store = tx.objectStore(STORES.ATTEMPTS);
    const req = store.put(attempt);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getPendingAttemptsForUser(userId: string): Promise<PendingAttempt[]> {
  if (!isIndexedDBAvailable() || !userId) return [];
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.ATTEMPTS, "readonly");
    const store = tx.objectStore(STORES.ATTEMPTS);
    const index = store.index("by_user");
    const req = index.getAll(userId);
    req.onsuccess = () => {
      const allForUser = (req.result || []) as PendingAttempt[];
      // Return attempts that are either pending, syncing, or failed (not yet fully synced)
      resolve(allForUser.filter((a) => a.status !== "synced"));
    };
    req.onerror = () => reject(req.error);
  });
}

export async function updateAttemptStatus(
  idempotencyKey: string,
  status: AttemptSyncStatus,
  error?: string
): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.ATTEMPTS, "readwrite");
    const store = tx.objectStore(STORES.ATTEMPTS);
    const getReq = store.get(idempotencyKey);

    getReq.onsuccess = () => {
      const attempt = getReq.result as PendingAttempt | undefined;
      if (!attempt) {
        return resolve();
      }
      attempt.status = status;
      if (error !== undefined) {
        attempt.error = error;
      }
      const putReq = store.put(attempt);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    };

    getReq.onerror = () => reject(getReq.error);
  });
}

export async function removePendingAttempt(idempotencyKey: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.ATTEMPTS, "readwrite");
    const store = tx.objectStore(STORES.ATTEMPTS);
    const req = store.delete(idempotencyKey);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getPendingCountForUser(userId: string): Promise<number> {
  const attempts = await getPendingAttemptsForUser(userId);
  return attempts.length;
}

export async function clearSyncedAttemptsForUser(userId: string): Promise<void> {
  if (!isIndexedDBAvailable() || !userId) return;
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.ATTEMPTS, "readwrite");
    const store = tx.objectStore(STORES.ATTEMPTS);
    const index = store.index("by_user");
    const req = index.getAll(userId);

    req.onsuccess = () => {
      const allUserAttempts = (req.result || []) as PendingAttempt[];
      for (const a of allUserAttempts) {
        if (a.status === "synced") {
          store.delete(a.idempotencyKey);
        }
      }
      resolve();
    };

    req.onerror = () => reject(req.error);
  });
}

// -----------------------------------------------------------------------------
// METADATA TRACKING
// -----------------------------------------------------------------------------

export async function saveSyncMetadata(metadata: StudentSyncMetadata): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.METADATA, "readwrite");
    const store = tx.objectStore(STORES.METADATA);
    const req = store.put(metadata);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getSyncMetadata(userId: string): Promise<StudentSyncMetadata | null> {
  if (!isIndexedDBAvailable() || !userId) return null;
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.METADATA, "readonly");
    const store = tx.objectStore(STORES.METADATA);
    const req = store.get(userId);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}
