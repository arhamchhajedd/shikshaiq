-- ==============================================================================
-- ShikshaIQ: Supabase Auth & User Profiles Schema
-- Phase 03: Production-Grade Authentication & Row Level Security (RLS)
-- ==============================================================================

-- 1. Create User Role Enumeration
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('student', 'teacher', 'admin');
  END IF;
END $$;

-- 2. Create Public Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'student',
  grade_level INTEGER CHECK (grade_level IS NULL OR (grade_level >= 6 AND grade_level <= 10)),
  school_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Helper Function: Check if current user is admin (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 5. Helper Function: Check if current user is teacher or admin
CREATE OR REPLACE FUNCTION public.is_educator()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('teacher', 'admin')
  );
$$;

-- 6. Row Level Security Policies

-- Policy A: Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy B: Educators can view all student profiles
DROP POLICY IF EXISTS "Educators can view student profiles" ON public.profiles;
CREATE POLICY "Educators can view student profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_educator() AND role = 'student');

-- Policy C: Admins can view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Policy D: Users can update their own non-role profile attributes
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    -- Prevent users from elevating their own role
    role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
  );

-- Policy E: Admins can manage all profiles
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 7. Trigger: Automatically create public.profiles entry on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.user_role := 'student';
  v_raw_role TEXT;
  v_grade_level INTEGER := NULL;
BEGIN
  -- Extract and validate role from user metadata
  v_raw_role := LOWER(COALESCE(new.raw_user_meta_data->>'role', 'student'));
  IF v_raw_role IN ('student', 'teacher', 'admin') THEN
    v_role := v_raw_role::public.user_role;
  ELSE
    v_role := 'student'::public.user_role;
  END IF;

  -- Extract grade level if student
  IF (new.raw_user_meta_data->>'grade_level') IS NOT NULL AND (new.raw_user_meta_data->>'grade_level') ~ '^[0-9]+$' THEN
    v_grade_level := (new.raw_user_meta_data->>'grade_level')::INTEGER;
    IF v_grade_level < 6 OR v_grade_level > 10 THEN
      v_grade_level := NULL;
    END IF;
  END IF;

  -- Insert profile
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
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

-- Drop existing trigger if present and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Updated At Timestamp Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  new.updated_at = NOW();
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Documentation comment
COMMENT ON TABLE public.profiles IS 'Stores user identity profiles linked 1:1 with Supabase auth.users with RBAC roles (student, teacher, admin).';
