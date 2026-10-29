# Supabase Database Migrations for ShikshaIQ

This directory contains the PostgreSQL migration scripts for Supabase.

## Migration 1: Auth & User Profiles (`20261029000000_auth_profiles.sql`)

### What this script creates:
1. **`public.user_role` Enum:** Allowed roles: `'student'`, `'teacher'`, `'admin'`.
2. **`public.profiles` Table:** User profiles directly linked to `auth.users(id) ON DELETE CASCADE`.
3. **Row Level Security (RLS) Policies:**
   - Users can only view and update their own profile.
   - Users cannot escalate their own role.
   - Teachers and Admins can view enrolled student profiles.
   - Admins can manage all profiles.
4. **`handle_new_user()` Trigger:** Automatically synchronizes new signups from `auth.users` into `public.profiles` with their selected role, grade level, and school.
5. **Role Check Functions:** `is_admin()` and `is_educator()` to avoid recursive RLS policy overhead.

---

### How to apply this migration in Supabase:

1. Open your **Supabase Dashboard** ([https://supabase.com/dashboard](https://supabase.com/dashboard)).
2. Select your ShikshaIQ project.
3. In the left navigation, click on **SQL Editor**.
4. Click **New Query**.
5. Copy the entire contents of [`20261029000000_auth_profiles.sql`](file:///c:/Users/DELL/Desktop/project-by-arham/shikshaiq/supabase/migrations/20261029000000_auth_profiles.sql) and paste it into the editor.
6. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`).
7. You will see a `Success. No rows returned` message.
8. Your authentication schema, triggers, and security policies are now active.

---

### Environment Setup in Next.js:

1. In Supabase Dashboard, go to **Project Settings** &rarr; **API**.
2. Copy your **Project URL** and **anon / public key**.
3. Create a `.env.local` file in your root folder:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. Restart your development server (`npm run dev`).
