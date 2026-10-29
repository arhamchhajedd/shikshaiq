-- ==============================================================================
-- ShikshaIQ Migration: Phase 07 - Offline Learning, PWA & Reliable Sync
-- Adds idempotency support to student_attempts for offline attempt queues
-- ==============================================================================

-- 1. Add idempotency_key to student_attempts
ALTER TABLE public.student_attempts 
ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

-- 2. Unique index to guarantee that an offline attempt cannot be submitted more than once
--    per student, preventing duplicate records and double-counting adaptive mastery.
CREATE UNIQUE INDEX IF NOT EXISTS idx_student_attempts_idempotency 
ON public.student_attempts (student_id, idempotency_key) 
WHERE idempotency_key IS NOT NULL;

COMMENT ON COLUMN public.student_attempts.idempotency_key IS 
'Client-generated UUID idempotency key for reliable offline synchronization and retry deduplication';
