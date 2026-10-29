-- ==============================================================================
-- ShikshaIQ: Phase 06 Schema Migration
-- Socratic AI Tutor Conversations & Messages Persistence with RLS
-- ==============================================================================

-- 1. Tutor Conversations Table
CREATE TABLE IF NOT EXISTS public.tutor_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  concept_id TEXT REFERENCES public.concepts(id) ON DELETE SET NULL,
  context_type TEXT NOT NULL DEFAULT 'learn' CHECK (context_type IN ('learn', 'practice', 'assessment', 'general')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tutor_conv_student ON public.tutor_conversations(student_id);
CREATE INDEX IF NOT EXISTS idx_tutor_conv_concept ON public.tutor_conversations(concept_id);
CREATE INDEX IF NOT EXISTS idx_tutor_conv_updated ON public.tutor_conversations(updated_at DESC);

-- 2. Tutor Messages Table
CREATE TABLE IF NOT EXISTS public.tutor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.tutor_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 4000),
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'hi', 'mr')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tutor_msg_conv ON public.tutor_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_tutor_msg_created ON public.tutor_messages(created_at ASC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.tutor_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_messages ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies: Students can strictly read, insert, and update only their own conversations
DROP POLICY IF EXISTS "Students manage own tutor conversations" ON public.tutor_conversations;
CREATE POLICY "Students manage own tutor conversations" ON public.tutor_conversations
  FOR ALL TO authenticated
  USING (student_id = auth.uid() OR public.is_admin())
  WITH CHECK (student_id = auth.uid() OR public.is_admin());

-- Students can strictly read and insert messages in their own conversations
DROP POLICY IF EXISTS "Students manage own tutor messages" ON public.tutor_messages;
CREATE POLICY "Students manage own tutor messages" ON public.tutor_messages
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tutor_conversations c
      WHERE c.id = conversation_id AND (c.student_id = auth.uid() OR public.is_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tutor_conversations c
      WHERE c.id = conversation_id AND (c.student_id = auth.uid() OR public.is_admin())
    )
  );

-- Comments for documentation
COMMENT ON TABLE public.tutor_conversations IS 'Tracks individual Socratic AI tutoring sessions bound to authenticated student and target concept.';
COMMENT ON TABLE public.tutor_messages IS 'Stores user prompts and tutor pedagogical responses isolated by conversation.';
