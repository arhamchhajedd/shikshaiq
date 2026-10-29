-- ==============================================================================
-- ShikshaIQ: Phase 03 Schema Migration
-- 1. Profiles Update: Account Status & Teacher Approval Flow
-- 2. Curriculum Tables: Concepts, Prerequisites, Questions, Protected Answer Keys
-- 3. Learning Records: Student Attempts, Student Mastery
-- 4. Classroom Structures: Classrooms, Classroom Students
-- 5. Row Level Security (RLS) & Security Definer Functions
-- 6. Idempotent Curriculum Seed: Class 7 Fractions (5 Concepts, 15 Questions)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Account Status Enum & Profiles Upgrade
-- ------------------------------------------------------------------------------

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_status') THEN
    CREATE TYPE public.account_status AS ENUM ('active', 'pending_approval', 'suspended');
  END IF;
END $$;

-- Add account_status column to profiles if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'account_status'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN account_status public.account_status NOT NULL DEFAULT 'active';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON public.profiles(account_status);

-- Upgrade the handle_new_user() trigger:
-- Enforces:
-- 1. Students default to 'active'.
-- 2. Teachers default to 'pending_approval' (must be approved by admin).
-- 3. Public registration attempting 'admin' is strictly forced to 'student' (admin provisioning is privileged).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.user_role := 'student';
  v_status public.account_status := 'active';
  v_raw_role TEXT;
  v_grade_level INTEGER := NULL;
BEGIN
  v_raw_role := LOWER(COALESCE(new.raw_user_meta_data->>'role', 'student'));
  
  -- Public registration can ONLY request 'student' or 'teacher'.
  -- Any attempt to self-declare 'admin' is forced to 'student'.
  IF v_raw_role = 'teacher' THEN
    v_role := 'teacher'::public.user_role;
    v_status := 'pending_approval'::public.account_status;
  ELSE
    v_role := 'student'::public.user_role;
    v_status := 'active'::public.account_status;
  END IF;

  -- Validate grade level for students (Classes 6-10)
  IF (new.raw_user_meta_data->>'grade_level') IS NOT NULL AND (new.raw_user_meta_data->>'grade_level') ~ '^[0-9]+$' THEN
    v_grade_level := (new.raw_user_meta_data->>'grade_level')::INTEGER;
    IF v_grade_level < 6 OR v_grade_level > 10 THEN
      v_grade_level := NULL;
    END IF;
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    account_status,
    grade_level,
    school_name,
    avatar_url,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    COALESCE(new.email, ''),
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    v_role,
    v_status,
    v_grade_level,
    new.raw_user_meta_data->>'school_name',
    new.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();

  RETURN new;
END;
$$;

-- ------------------------------------------------------------------------------
-- 2. Curriculum Tables
-- ------------------------------------------------------------------------------

-- Concepts Table
CREATE TABLE IF NOT EXISTS public.concepts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  short_title TEXT NOT NULL,
  description TEXT NOT NULL,
  grade_level INTEGER NOT NULL DEFAULT 7 CHECK (grade_level >= 1 AND grade_level <= 12),
  subject TEXT NOT NULL DEFAULT 'Mathematics',
  concept_order INTEGER NOT NULL DEFAULT 1,
  learning_objective TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_concepts_grade_order ON public.concepts(grade_level, concept_order);

-- Concept Prerequisites Table (supports multi-prerequisite DAGs)
CREATE TABLE IF NOT EXISTS public.concept_prerequisites (
  concept_id TEXT NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  prerequisite_concept_id TEXT NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (concept_id, prerequisite_concept_id),
  CONSTRAINT chk_no_self_prerequisite CHECK (concept_id <> prerequisite_concept_id)
);

CREATE INDEX IF NOT EXISTS idx_prereq_concept_id ON public.concept_prerequisites(concept_id);
CREATE INDEX IF NOT EXISTS idx_prereq_target_id ON public.concept_prerequisites(prerequisite_concept_id);

-- Questions Table (Public metadata, choices, stems - NO answer keys)
CREATE TABLE IF NOT EXISTS public.questions (
  id TEXT PRIMARY KEY,
  concept_id TEXT NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_type TEXT NOT NULL DEFAULT 'single_choice' CHECK (question_type IN ('single_choice', 'multiple_choice')),
  options JSONB NOT NULL, -- Array of { id: string, text: string }
  learning_objective TEXT,
  content_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_concept_id ON public.questions(concept_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions(difficulty);

-- Protected Answer Keys Table (NEVER publicly queryable)
CREATE TABLE IF NOT EXISTS public.question_answer_keys (
  question_id TEXT PRIMARY KEY REFERENCES public.questions(id) ON DELETE CASCADE,
  correct_option_id TEXT NOT NULL,
  explanation TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. Learning Records: Attempts & Mastery
-- ------------------------------------------------------------------------------

-- Student Attempts Table
CREATE TABLE IF NOT EXISTS public.student_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  question_id TEXT NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  concept_id TEXT NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  selected_option_id TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attempts_student_concept ON public.student_attempts(student_id, concept_id);
CREATE INDEX IF NOT EXISTS idx_attempts_session ON public.student_attempts(student_id, session_id);
CREATE INDEX IF NOT EXISTS idx_attempts_student_time ON public.student_attempts(student_id, attempted_at DESC);

-- Student Concept Mastery Table
CREATE TABLE IF NOT EXISTS public.student_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  concept_id TEXT NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  mastery_score NUMERIC(5,2), -- 0.00 to 100.00, or NULL if no valid evidence
  status TEXT NOT NULL CHECK (status IN ('not_started', 'needs_revision', 'partial', 'mastered')),
  valid_evidence_count INTEGER NOT NULL DEFAULT 0 CHECK (valid_evidence_count >= 0),
  last_evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_student_concept_mastery UNIQUE (student_id, concept_id)
);

CREATE INDEX IF NOT EXISTS idx_mastery_student_status ON public.student_mastery(student_id, status);

-- ------------------------------------------------------------------------------
-- 4. Classroom Structures
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.classrooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  grade_level INTEGER NOT NULL DEFAULT 7 CHECK (grade_level >= 1 AND grade_level <= 12),
  academic_year TEXT NOT NULL DEFAULT '2026-2027',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_classrooms_teacher ON public.classrooms(teacher_id);

CREATE TABLE IF NOT EXISTS public.classroom_students (
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (classroom_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_class_students_student ON public.classroom_students(student_id);

-- ------------------------------------------------------------------------------
-- 5. Row Level Security (RLS) Policies
-- ------------------------------------------------------------------------------

-- Helper Function: Check if current teacher teaches the student
CREATE OR REPLACE FUNCTION public.is_teacher_of_student(p_student_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.classrooms c
    JOIN public.classroom_students cs ON cs.classroom_id = c.id
    WHERE c.teacher_id = auth.uid()
      AND cs.student_id = p_student_id
  ) OR public.is_admin();
$$;

-- Enable RLS on all tables
ALTER TABLE public.concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concept_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_answer_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_students ENABLE ROW LEVEL SECURITY;

-- Concepts Policies: Anyone (authenticated or public) can read curriculum concepts
DROP POLICY IF EXISTS "Public can view concepts" ON public.concepts;
CREATE POLICY "Public can view concepts" ON public.concepts FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admins manage concepts" ON public.concepts;
CREATE POLICY "Admins manage concepts" ON public.concepts FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Concept Prerequisites Policies
DROP POLICY IF EXISTS "Public can view prerequisites" ON public.concept_prerequisites;
CREATE POLICY "Public can view prerequisites" ON public.concept_prerequisites FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admins manage prerequisites" ON public.concept_prerequisites;
CREATE POLICY "Admins manage prerequisites" ON public.concept_prerequisites FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Questions Policies: Questions stems & options are public; answer keys are NOT stored here
DROP POLICY IF EXISTS "Public can view questions" ON public.questions;
CREATE POLICY "Public can view questions" ON public.questions FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admins manage questions" ON public.questions;
CREATE POLICY "Admins manage questions" ON public.questions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Protected Answer Keys Policies:
-- Strictly NO SELECT policy for public or regular authenticated users.
-- Only platform admins can read directly; regular users access answers via server-evaluated submissions.
DROP POLICY IF EXISTS "Admins manage answer keys" ON public.question_answer_keys;
CREATE POLICY "Admins manage answer keys" ON public.question_answer_keys FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Student Attempts Policies:
-- Student can read own attempts.
-- Teacher can read attempts of students in their classrooms.
-- Admin can read all.
DROP POLICY IF EXISTS "Users read own attempts or teacher reads class attempts" ON public.student_attempts;
CREATE POLICY "Users read own attempts or teacher reads class attempts" ON public.student_attempts
  FOR SELECT TO authenticated
  USING (auth.uid() = student_id OR public.is_teacher_of_student(student_id));

DROP POLICY IF EXISTS "Students can insert own attempts" ON public.student_attempts;
CREATE POLICY "Students can insert own attempts" ON public.student_attempts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = student_id);

-- Student Mastery Policies:
-- Student reads own mastery. Teacher reads assigned students. Admin reads all.
DROP POLICY IF EXISTS "Users read own mastery or teacher reads class mastery" ON public.student_mastery;
CREATE POLICY "Users read own mastery or teacher reads class mastery" ON public.student_mastery
  FOR SELECT TO authenticated
  USING (auth.uid() = student_id OR public.is_teacher_of_student(student_id));

DROP POLICY IF EXISTS "Students or server can upsert own mastery" ON public.student_mastery;
CREATE POLICY "Students or server can upsert own mastery" ON public.student_mastery
  FOR ALL TO authenticated
  USING (auth.uid() = student_id OR public.is_admin())
  WITH CHECK (auth.uid() = student_id OR public.is_admin());

-- Classrooms Policies:
-- Teachers view own classrooms, enrolled students view classrooms, admins view all.
DROP POLICY IF EXISTS "Teachers and students view classrooms" ON public.classrooms;
CREATE POLICY "Teachers and students view classrooms" ON public.classrooms
  FOR SELECT TO authenticated
  USING (
    teacher_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.classroom_students cs WHERE cs.classroom_id = id AND cs.student_id = auth.uid()) OR
    public.is_admin()
  );

DROP POLICY IF EXISTS "Teachers manage own classrooms" ON public.classrooms;
CREATE POLICY "Teachers manage own classrooms" ON public.classrooms
  FOR ALL TO authenticated
  USING (teacher_id = auth.uid() OR public.is_admin())
  WITH CHECK (teacher_id = auth.uid() OR public.is_admin());

-- Classroom Students Policies
DROP POLICY IF EXISTS "Members and admins view classroom memberships" ON public.classroom_students;
CREATE POLICY "Members and admins view classroom memberships" ON public.classroom_students
  FOR SELECT TO authenticated
  USING (
    student_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.classrooms c WHERE c.id = classroom_id AND c.teacher_id = auth.uid()) OR
    public.is_admin()
  );

DROP POLICY IF EXISTS "Teachers and admins manage memberships" ON public.classroom_students;
CREATE POLICY "Teachers and admins manage memberships" ON public.classroom_students
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.classrooms c WHERE c.id = classroom_id AND c.teacher_id = auth.uid()) OR
    public.is_admin()
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.classrooms c WHERE c.id = classroom_id AND c.teacher_id = auth.uid()) OR
    public.is_admin()
  );

-- Update RLS for profiles: Prevent users from modifying their own role or account_status
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) AND
    account_status = (SELECT p.account_status FROM public.profiles p WHERE p.id = auth.uid())
  );

-- ------------------------------------------------------------------------------
-- 6. Secure Server-Side Function: Evaluate Assessment Attempt Batch
-- ------------------------------------------------------------------------------
-- This function runs with SECURITY DEFINER privileges. It securely reads the
-- private answer keys, validates correctness on the server, and persists attempts.
CREATE OR REPLACE FUNCTION public.submit_diagnostic_assessment(
  p_session_id TEXT,
  p_answers JSONB -- Array of { questionId: string, selectedOptionId: string }
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id UUID;
  v_item JSONB;
  v_qid TEXT;
  v_selected_opt TEXT;
  v_correct_opt TEXT;
  v_concept_id TEXT;
  v_is_correct BOOLEAN;
  v_results JSONB := '[]'::JSONB;
  v_total_count INTEGER := 0;
  v_correct_count INTEGER := 0;
BEGIN
  v_student_id := auth.uid();
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to submit assessment.';
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_answers)
  LOOP
    v_qid := v_item->>'questionId';
    v_selected_opt := v_item->>'selectedOptionId';

    -- Retrieve question concept and correct option from private answer keys
    SELECT q.concept_id, ak.correct_option_id
    INTO v_concept_id, v_correct_opt
    FROM public.questions q
    LEFT JOIN public.question_answer_keys ak ON ak.question_id = q.id
    WHERE q.id = v_qid;

    IF v_concept_id IS NOT NULL THEN
      v_is_correct := (v_selected_opt = v_correct_opt);
      v_total_count := v_total_count + 1;
      IF v_is_correct THEN
        v_correct_count := v_correct_count + 1;
      END IF;

      -- Persist attempt
      INSERT INTO public.student_attempts (
        student_id,
        session_id,
        question_id,
        concept_id,
        selected_option_id,
        is_correct,
        attempted_at
      ) VALUES (
        v_student_id,
        p_session_id,
        v_qid,
        v_concept_id,
        v_selected_opt,
        v_is_correct,
        NOW()
      );

      v_results := v_results || jsonb_build_object(
        'questionId', v_qid,
        'conceptId', v_concept_id,
        'selectedOptionId', v_selected_opt,
        'isCorrect', v_is_correct
      );
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'totalQuestions', v_total_count,
    'correctAnswers', v_correct_count,
    'items', v_results
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 7. Idempotent Curriculum Seed: Class 7 Fractions (5 Concepts, 15 Questions)
-- ------------------------------------------------------------------------------

-- Seed Concepts
INSERT INTO public.concepts (id, title, short_title, description, grade_level, subject, concept_order, learning_objective)
VALUES
  (
    'fraction-basics',
    'Fraction Basics & Representation',
    'Fraction Basics',
    'Understanding numerator, denominator, and fractions as parts of a whole unit.',
    7,
    'Mathematics',
    1,
    'Identify the role of numerator and denominator in fractions and represent parts of a whole.'
  ),
  (
    'common-multiples',
    'Factors & Common Multiples (LCM)',
    'Common Multiples',
    'Finding multiples and calculating the Least Common Multiple (LCM) for unlike denominators.',
    7,
    'Mathematics',
    2,
    'Calculate the lowest common multiple of two or more integers.'
  ),
  (
    'equivalent-fractions',
    'Equivalent Fractions & Simplification',
    'Equivalent Fractions',
    'Multiplying or dividing numerator and denominator by non-zero factors to scale and simplify fractions.',
    7,
    'Mathematics',
    3,
    'Generate equivalent fractions and reduce fractions to their simplest form.'
  ),
  (
    'adding-fractions',
    'Adding Fractions with Like & Unlike Denominators',
    'Adding Fractions',
    'Using LCM to find common denominators and computing the exact sum in lowest terms.',
    7,
    'Mathematics',
    4,
    'Add fractions with like and unlike denominators using common denominator conversion.'
  ),
  (
    'mixed-fractions',
    'Mixed Numbers & Fraction Word Problems',
    'Mixed Fractions',
    'Converting improper fractions to mixed numerals and solving contextual arithmetic problems.',
    7,
    'Mathematics',
    5,
    'Convert between improper and mixed fractions and solve applied word problems.'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  short_title = EXCLUDED.short_title,
  description = EXCLUDED.description,
  learning_objective = EXCLUDED.learning_objective,
  updated_at = NOW();

-- Seed Prerequisites
INSERT INTO public.concept_prerequisites (concept_id, prerequisite_concept_id)
VALUES
  ('equivalent-fractions', 'fraction-basics'),
  ('adding-fractions', 'common-multiples'),
  ('adding-fractions', 'equivalent-fractions'),
  ('mixed-fractions', 'adding-fractions')
ON CONFLICT (concept_id, prerequisite_concept_id) DO NOTHING;

-- Seed Questions
INSERT INTO public.questions (id, concept_id, prompt, difficulty, question_type, options, learning_objective)
VALUES
  -- Concept 1: Fraction Basics
  (
    'q_fb_01',
    'fraction-basics',
    'In the fraction 5/8, what does the denominator (8) represent?',
    'easy',
    'single_choice',
    '[
      {"id": "opt_a", "text": "The number of parts being counted or selected"},
      {"id": "opt_b", "text": "The total number of equal parts that make up one whole"},
      {"id": "opt_c", "text": "The difference between numerator and denominator"},
      {"id": "opt_d", "text": "The total number of whole units"}
    ]'::JSONB,
    'Identify the role of numerator and denominator in fractions.'
  ),
  (
    'q_fb_02',
    'fraction-basics',
    'A roti is cut into 6 equal slices. Rohit eats 4 slices. What fraction of the roti did Rohit eat?',
    'easy',
    'single_choice',
    '[
      {"id": "opt_a", "text": "4/6"},
      {"id": "opt_b", "text": "6/4"},
      {"id": "opt_c", "text": "2/6"},
      {"id": "opt_d", "text": "1/4"}
    ]'::JSONB,
    'Represent fractional quantities from real-world contexts.'
  ),
  (
    'q_fb_03',
    'fraction-basics',
    'Which of the following is a proper fraction?',
    'medium',
    'single_choice',
    '[
      {"id": "opt_a", "text": "7/4"},
      {"id": "opt_b", "text": "9/9"},
      {"id": "opt_c", "text": "3/5"},
      {"id": "opt_d", "text": "11/8"}
    ]'::JSONB,
    'Distinguish proper fractions (numerator < denominator) from improper fractions.'
  ),

  -- Concept 2: Common Multiples
  (
    'q_cm_01',
    'common-multiples',
    'What is the Least Common Multiple (LCM) of 4 and 6?',
    'easy',
    'single_choice',
    '[
      {"id": "opt_a", "text": "2"},
      {"id": "opt_b", "text": "12"},
      {"id": "opt_c", "text": "24"},
      {"id": "opt_d", "text": "10"}
    ]'::JSONB,
    'Calculate the lowest common multiple of two small integers.'
  ),
  (
    'q_cm_02',
    'common-multiples',
    'Find the LCM of 3, 4, and 6.',
    'medium',
    'single_choice',
    '[
      {"id": "opt_a", "text": "12"},
      {"id": "opt_b", "text": "18"},
      {"id": "opt_c", "text": "24"},
      {"id": "opt_d", "text": "72"}
    ]'::JSONB,
    'Compute LCM across three integers by identifying lowest shared multiple.'
  ),
  (
    'q_cm_03',
    'common-multiples',
    'If two prime numbers are 5 and 7, what is their LCM?',
    'medium',
    'single_choice',
    '[
      {"id": "opt_a", "text": "1"},
      {"id": "opt_b", "text": "35"},
      {"id": "opt_c", "text": "12"},
      {"id": "opt_d", "text": "70"}
    ]'::JSONB,
    'Recognize that coprime or prime numbers have an LCM equal to their direct product.'
  ),

  -- Concept 3: Equivalent Fractions
  (
    'q_ef_01',
    'equivalent-fractions',
    'Which fraction is equivalent to 3/4?',
    'easy',
    'single_choice',
    '[
      {"id": "opt_a", "text": "6/10"},
      {"id": "opt_b", "text": "9/12"},
      {"id": "opt_c", "text": "12/20"},
      {"id": "opt_d", "text": "7/8"}
    ]'::JSONB,
    'Identify equivalent fractions by scaling numerator and denominator equally.'
  ),
  (
    'q_ef_02',
    'equivalent-fractions',
    'What is the simplest form (lowest terms) of 18/24?',
    'medium',
    'single_choice',
    '[
      {"id": "opt_a", "text": "9/12"},
      {"id": "opt_b", "text": "6/8"},
      {"id": "opt_c", "text": "3/4"},
      {"id": "opt_d", "text": "2/3"}
    ]'::JSONB,
    'Reduce fractions to lowest terms by dividing by highest common factor (HCF = 6).'
  ),
  (
    'q_ef_03',
    'equivalent-fractions',
    'Fill in the missing numerator: 2/5 = [ ? ] / 35',
    'medium',
    'single_choice',
    '[
      {"id": "opt_a", "text": "10"},
      {"id": "opt_b", "text": "12"},
      {"id": "opt_c", "text": "14"},
      {"id": "opt_d", "text": "15"}
    ]'::JSONB,
    'Solve for unknown terms in equivalent fraction equations.'
  ),

  -- Concept 4: Adding Fractions
  (
    'q_af_01',
    'adding-fractions',
    'Solve: 2/7 + 3/7 = ?',
    'easy',
    'single_choice',
    '[
      {"id": "opt_a", "text": "5/14"},
      {"id": "opt_b", "text": "5/7"},
      {"id": "opt_c", "text": "6/7"},
      {"id": "opt_d", "text": "5/49"}
    ]'::JSONB,
    'Add fractions with identical denominators by summing numerators.'
  ),
  (
    'q_af_02',
    'adding-fractions',
    'Solve: 1/4 + 1/6 = ?',
    'hard',
    'single_choice',
    '[
      {"id": "opt_a", "text": "2/10 = 1/5"},
      {"id": "opt_b", "text": "5/12"},
      {"id": "opt_c", "text": "5/24"},
      {"id": "opt_d", "text": "7/12"}
    ]'::JSONB,
    'Add fractions with unlike denominators by determining LCM of denominators (12).'
  ),
  (
    'q_af_03',
    'adding-fractions',
    'Ananya paints 1/3 of a wall in the morning and 2/5 of the same wall in the afternoon. What fraction of the wall has she painted altogether?',
    'hard',
    'single_choice',
    '[
      {"id": "opt_a", "text": "3/8"},
      {"id": "opt_b", "text": "11/15"},
      {"id": "opt_c", "text": "13/15"},
      {"id": "opt_d", "text": "2/15"}
    ]'::JSONB,
    'Apply fraction addition with unlike denominators to word problem contexts.'
  ),

  -- Concept 5: Mixed Fractions
  (
    'q_mf_01',
    'mixed-fractions',
    'Convert the improper fraction 11/4 into a mixed number.',
    'medium',
    'single_choice',
    '[
      {"id": "opt_a", "text": "2 3/4"},
      {"id": "opt_b", "text": "3 1/4"},
      {"id": "opt_c", "text": "2 1/4"},
      {"id": "opt_d", "text": "1 7/4"}
    ]'::JSONB,
    'Convert an improper fraction to a mixed number using integer division and remainder.'
  ),
  (
    'q_mf_02',
    'mixed-fractions',
    'Express 3 2/5 as an improper fraction.',
    'medium',
    'single_choice',
    '[
      {"id": "opt_a", "text": "11/5"},
      {"id": "opt_b", "text": "17/5"},
      {"id": "opt_c", "text": "15/5"},
      {"id": "opt_d", "text": "13/5"}
    ]'::JSONB,
    'Convert a mixed numeral into an improper fraction: (3 × 5 + 2) / 5.'
  ),
  (
    'q_mf_03',
    'mixed-fractions',
    'A recipe calls for 1 1/2 cups of flour. Kabir already has 3/4 cup. How much more flour does Kabir need?',
    'hard',
    'single_choice',
    '[
      {"id": "opt_a", "text": "1/2 cup"},
      {"id": "opt_b", "text": "3/4 cup"},
      {"id": "opt_c", "text": "1 cup"},
      {"id": "opt_d", "text": "1 1/4 cups"}
    ]'::JSONB,
    'Solve contextual subtraction/difference problems involving mixed numbers and fractions.'
  )
ON CONFLICT (id) DO UPDATE SET
  concept_id = EXCLUDED.concept_id,
  prompt = EXCLUDED.prompt,
  difficulty = EXCLUDED.difficulty,
  options = EXCLUDED.options,
  learning_objective = EXCLUDED.learning_objective,
  updated_at = NOW();

-- Seed Protected Answer Keys
INSERT INTO public.question_answer_keys (question_id, correct_option_id, explanation)
VALUES
  -- Concept 1: Fraction Basics
  (
    'q_fb_01',
    'opt_b',
    'In any fraction a/b, the denominator ''b'' represents the total number of equal parts into which the whole object is divided, while the numerator ''a'' tells how many parts are counted.'
  ),
  (
    'q_fb_02',
    'opt_a',
    'The whole roti is cut into 6 equal parts (denominator = 6). Rohit eats 4 of them (numerator = 4). Hence, the fraction is 4/6 (which equals 2/3 in simplest form).'
  ),
  (
    'q_fb_03',
    'opt_c',
    'A proper fraction has a numerator strictly less than its denominator. Since 3 < 5, 3/5 is a proper fraction. (7/4, 9/9, and 11/8 are improper fractions).'
  ),

  -- Concept 2: Common Multiples
  (
    'q_cm_01',
    'opt_b',
    'Multiples of 4 are 4, 8, 12, 16... Multiples of 6 are 6, 12, 18... The smallest shared multiple is 12.'
  ),
  (
    'q_cm_02',
    'opt_a',
    '12 is divisible by 3 (12/3 = 4), 4 (12/4 = 3), and 6 (12/6 = 2). It is the smallest integer divisible by all three numbers.'
  ),
  (
    'q_cm_03',
    'opt_b',
    '5 and 7 are prime and coprime numbers (they share no common factors other than 1). When numbers are coprime, their LCM is their direct product: 5 × 7 = 35.'
  ),

  -- Concept 3: Equivalent Fractions
  (
    'q_ef_01',
    'opt_b',
    'Multiplying both numerator and denominator of 3/4 by 3 yields (3 × 3) / (4 × 3) = 9/12. Both represent the exact same value.'
  ),
  (
    'q_ef_02',
    'opt_c',
    'The Highest Common Factor (HCF) of 18 and 24 is 6. Dividing numerator and denominator by 6 gives: 18÷6 = 3, 24÷6 = 4. The simplest form is 3/4.'
  ),
  (
    'q_ef_03',
    'opt_c',
    'Look at the denominator: 5 was multiplied by 7 to get 35. To create an equivalent fraction, we must multiply the numerator (2) by 7 as well: 2 × 7 = 14. So, 2/5 = 14/35.'
  ),

  -- Concept 4: Adding Fractions
  (
    'q_af_01',
    'opt_b',
    'When fractions have identical denominators, add only the numerators while keeping the common denominator: (2 + 3) / 7 = 5/7. Never add denominators together.'
  ),
  (
    'q_af_02',
    'opt_b',
    'First, find the LCM of denominators 4 and 6, which is 12. Convert each fraction: 1/4 = 3/12, and 1/6 = 2/12. Add them: 3/12 + 2/12 = 5/12.'
  ),
  (
    'q_af_03',
    'opt_b',
    'Denominators are 3 and 5 (LCM = 15). Convert each: 1/3 = 5/15, 2/5 = 6/15. Add them: 5/15 + 6/15 = 11/15 of the wall.'
  ),

  -- Concept 5: Mixed Fractions
  (
    'q_mf_01',
    'opt_a',
    'Divide numerator 11 by denominator 4: 11 ÷ 4 = 2 with a remainder of 3. The quotient 2 becomes the whole number, the remainder 3 becomes the new numerator: 2 3/4.'
  ),
  (
    'q_mf_02',
    'opt_b',
    'Multiply the whole number by the denominator and add the numerator: (3 × 5) + 2 = 15 + 2 = 17. Place over original denominator: 17/5.'
  ),
  (
    'q_mf_03',
    'opt_b',
    'Convert 1 1/2 to improper fraction: 3/2. Find the difference: 3/2 - 3/4. Common denominator is 4: 3/2 = 6/4. Then 6/4 - 3/4 = 3/4 cup.'
  )
ON CONFLICT (question_id) DO UPDATE SET
  correct_option_id = EXCLUDED.correct_option_id,
  explanation = EXCLUDED.explanation,
  updated_at = NOW();
