-- ==============================================================================
-- ShikshaIQ: Phase 05 Schema Migration
-- Teacher Dashboard, Classroom Management, Interventions, and Admin Audit
-- ==============================================================================

-- 1. Enhance Classrooms Table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'classrooms' AND column_name = 'subject'
  ) THEN
    ALTER TABLE public.classrooms ADD COLUMN subject TEXT NOT NULL DEFAULT 'Mathematics';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'classrooms' AND column_name = 'section'
  ) THEN
    ALTER TABLE public.classrooms ADD COLUMN section TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'classrooms' AND column_name = 'join_code'
  ) THEN
    ALTER TABLE public.classrooms ADD COLUMN join_code TEXT UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'classrooms' AND column_name = 'is_archived'
  ) THEN
    ALTER TABLE public.classrooms ADD COLUMN is_archived BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_classrooms_join_code ON public.classrooms(join_code);
CREATE INDEX IF NOT EXISTS idx_classrooms_archived ON public.classrooms(is_archived);

-- 1B. Break Mutual RLS Recursion between Classrooms and Classroom Students
CREATE OR REPLACE FUNCTION public.is_enrolled_in_classroom(p_classroom_id UUID, p_student_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.classroom_students
    WHERE classroom_id = p_classroom_id AND student_id = p_student_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_teacher_of_classroom(p_classroom_id UUID, p_teacher_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.classrooms
    WHERE id = p_classroom_id AND teacher_id = p_teacher_id
  );
$$;

DROP POLICY IF EXISTS "Teachers and students view classrooms" ON public.classrooms;
CREATE POLICY "Teachers and students view classrooms" ON public.classrooms
  FOR SELECT TO authenticated
  USING (
    teacher_id = auth.uid() OR
    public.is_enrolled_in_classroom(id, auth.uid()) OR
    public.is_admin()
  );

DROP POLICY IF EXISTS "Members and admins view classroom memberships" ON public.classroom_students;
CREATE POLICY "Members and admins view classroom memberships" ON public.classroom_students
  FOR SELECT TO authenticated
  USING (
    student_id = auth.uid() OR
    public.is_teacher_of_classroom(classroom_id, auth.uid()) OR
    public.is_admin()
  );

DROP POLICY IF EXISTS "Teachers and admins manage memberships" ON public.classroom_students;
CREATE POLICY "Teachers and admins manage memberships" ON public.classroom_students
  FOR ALL TO authenticated
  USING (
    public.is_teacher_of_classroom(classroom_id, auth.uid()) OR
    public.is_admin()
  )
  WITH CHECK (
    public.is_teacher_of_classroom(classroom_id, auth.uid()) OR
    public.is_admin()
  );

-- 2. Function to generate a random 6-character uppercase alphanumeric join code
CREATE OR REPLACE FUNCTION public.generate_classroom_join_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Excludes confusing 0, O, 1, I
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Automatically generate join_code before insert if null
CREATE OR REPLACE FUNCTION public.set_classroom_join_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
BEGIN
  IF new.join_code IS NULL OR TRIM(new.join_code) = '' THEN
    LOOP
      v_code := public.generate_classroom_join_code();
      SELECT EXISTS (SELECT 1 FROM public.classrooms WHERE join_code = v_code) INTO v_exists;
      EXIT WHEN NOT v_exists;
    END LOOP;
    new.join_code := v_code;
  ELSE
    new.join_code := UPPER(TRIM(new.join_code));
  END IF;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_classroom_join_code ON public.classrooms;
CREATE TRIGGER trg_set_classroom_join_code
  BEFORE INSERT ON public.classrooms
  FOR EACH ROW
  EXECUTE FUNCTION public.set_classroom_join_code();

-- 3. Secure Student Enrollment via Join Code (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.enroll_in_classroom(p_join_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id UUID;
  v_classroom RECORD;
  v_already_enrolled BOOLEAN;
BEGIN
  v_student_id := auth.uid();
  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to enroll in a classroom.';
  END IF;

  -- Verify user has student role
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = v_student_id AND role = 'student'
  ) THEN
    RAISE EXCEPTION 'Only registered students can enroll in classrooms.';
  END IF;

  -- Lookup active classroom by join code (case-insensitive)
  SELECT id, name, grade_level, subject, section, academic_year, teacher_id
  INTO v_classroom
  FROM public.classrooms
  WHERE join_code = UPPER(TRIM(p_join_code)) AND is_archived = FALSE;

  IF v_classroom.id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired classroom join code.';
  END IF;

  -- Check if already enrolled
  SELECT EXISTS (
    SELECT 1 FROM public.classroom_students 
    WHERE classroom_id = v_classroom.id AND student_id = v_student_id
  ) INTO v_already_enrolled;

  IF v_already_enrolled THEN
    RETURN jsonb_build_object(
      'success', true,
      'already_enrolled', true,
      'classroom_id', v_classroom.id,
      'classroom_name', v_classroom.name,
      'grade_level', v_classroom.grade_level,
      'subject', v_classroom.subject
    );
  END IF;

  -- Insert enrollment
  INSERT INTO public.classroom_students (classroom_id, student_id, joined_at)
  VALUES (v_classroom.id, v_student_id, NOW());

  RETURN jsonb_build_object(
    'success', true,
    'already_enrolled', false,
    'classroom_id', v_classroom.id,
    'classroom_name', v_classroom.name,
    'grade_level', v_classroom.grade_level,
    'subject', v_classroom.subject
  );
END;
$$;

-- 4. Teacher Interventions & Pedagogical Overrides Table
CREATE TABLE IF NOT EXISTS public.teacher_interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  classroom_id UUID REFERENCES public.classrooms(id) ON DELETE CASCADE,
  target_concept_id TEXT NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  recommended_action TEXT NOT NULL CHECK (recommended_action IN ('learn', 'practice', 'assessment')),
  teacher_notes TEXT,
  original_recommendation JSONB,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interventions_teacher ON public.teacher_interventions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_interventions_student_status ON public.teacher_interventions(student_id, status);
CREATE INDEX IF NOT EXISTS idx_interventions_classroom ON public.teacher_interventions(classroom_id);

ALTER TABLE public.teacher_interventions ENABLE ROW LEVEL SECURITY;

-- Interventions RLS Policies:
DROP POLICY IF EXISTS "Teachers manage own interventions" ON public.teacher_interventions;
CREATE POLICY "Teachers manage own interventions" ON public.teacher_interventions
  FOR ALL TO authenticated
  USING (teacher_id = auth.uid() OR public.is_admin())
  WITH CHECK (teacher_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Students view assigned interventions" ON public.teacher_interventions;
CREATE POLICY "Students view assigned interventions" ON public.teacher_interventions
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

-- 5. Platform Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_id UUID,
  details JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Audit Logs RLS:
-- Only admins can read all audit logs; actors can read their own.
DROP POLICY IF EXISTS "Admins view all audit logs, actors view own" ON public.audit_logs;
CREATE POLICY "Admins view all audit logs, actors view own" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.is_admin() OR actor_id = auth.uid());

-- Authenticated users can insert their own actions
DROP POLICY IF EXISTS "Users record audit logs" ON public.audit_logs;
CREATE POLICY "Users record audit logs" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid() OR public.is_admin());

-- Immutable: NO UPDATE or DELETE on audit logs

-- 6. Helper Function to Record Audit Events
CREATE OR REPLACE FUNCTION public.record_audit_event(
  p_action TEXT,
  p_target_id UUID,
  p_details JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (actor_id, action, target_id, details, created_at)
  VALUES (auth.uid(), p_action, p_target_id, COALESCE(p_details, '{}'::JSONB), NOW())
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;
