/**
 * In-memory sliding-window rate limiter for AI Tutor endpoints.
 * Enforces per-student limits to prevent abuse and runaway token spend.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const windowMs = 60 * 1000; // 1 minute window
const maxRequestsPerWindow = 15; // Max 15 requests per minute

const userRequestStore = new Map<string, RateLimitRecord>();

/**
 * Checks whether the given user has exceeded their rate limit.
 * Automatically evicts timestamps older than 1 minute.
 */
export function checkTutorRateLimit(userId: string): { allowed: boolean; remaining: number; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = userRequestStore.get(userId) || { timestamps: [] };

  // Evict timestamps older than window
  const validTimestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (validTimestamps.length >= maxRequestsPerWindow) {
    const oldest = validTimestamps[0];
    const retryAfterSeconds = Math.ceil((oldest + windowMs - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, retryAfterSeconds),
    };
  }

  validTimestamps.push(now);
  userRequestStore.set(userId, { timestamps: validTimestamps });

  // Periodically clean up idle users (every 50 calls)
  if (userRequestStore.size > 200) {
    for (const [key, val] of userRequestStore.entries()) {
      if (val.timestamps.every((ts) => now - ts >= windowMs)) {
        userRequestStore.delete(key);
      }
    }
  }

  return {
    allowed: true,
    remaining: maxRequestsPerWindow - validTimestamps.length,
  };
}

/**
 * Reset rate limit for a user (primarily used in automated tests).
 */
export function resetTutorRateLimit(userId: string): void {
  userRequestStore.delete(userId);
}
