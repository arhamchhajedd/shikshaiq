"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { UserProfile, UserRole, AccountStatus } from "@/types/auth";

// Zod Validation Schemas
const signInSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

// Public sign-up strictly restricts roles to "student" or "teacher".
// Administrator accounts can NEVER be created through public self-registration.
const signUpSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters.")
    .max(80, "Full name cannot exceed 80 characters."),
  email: z.string().trim().email("Please enter a valid email address."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long.")
    .max(100, "Password cannot exceed 100 characters."),
  role: z.enum(["student", "teacher"], {
    message: "Please select a valid role (Student or Teacher).",
  }),
  gradeLevel: z.number().int().min(6).max(10).nullable().optional(),
  schoolName: z.string().trim().max(120).nullable().optional(),
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
});

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long.")
    .max(100, "Password cannot exceed 100 characters."),
});

export type AuthActionResult =
  | { success: true; redirectUrl: string; requiresEmailConfirmation?: boolean }
  | { success: false; error: string };

/**
 * Server Action: Sign in user with email & password.
 */
export async function signInUser(
  formData: z.infer<typeof signInSchema>
): Promise<AuthActionResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error:
        "Supabase credentials are not configured yet. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.",
    };
  }

  const parsed = signInSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid credentials format.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return {
      success: false,
      error: error?.message || "Invalid email or password.",
    };
  }

  // Fetch trusted user profile from database
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, account_status")
    .eq("id", data.user.id)
    .single();

  const role: UserRole = profile?.role || "student";
  const status: AccountStatus = profile?.account_status || "active";

  // Check account status
  if (status === "suspended") {
    await supabase.auth.signOut();
    return {
      success: false,
      error: "Your account has been suspended. Please contact platform administrators.",
    };
  }

  if (role === "teacher" && status === "pending_approval") {
    revalidatePath("/", "layout");
    return {
      success: true,
      redirectUrl: "/pending-approval",
    };
  }

  const redirectUrl = role === "admin" ? "/admin" : role === "teacher" ? "/teacher" : "/student";

  revalidatePath("/", "layout");
  return {
    success: true,
    redirectUrl,
  };
}

/**
 * Server Action: Register a new student or teacher.
 * Students receive active status; teachers require administrator approval.
 */
export async function signUpUser(
  formData: z.infer<typeof signUpSchema>
): Promise<AuthActionResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error:
        "Supabase credentials are not configured yet. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.",
    };
  }

  const parsed = signUpSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid registration information.",
    };
  }

  const { fullName, email, password, role, gradeLevel, schoolName } = parsed.data;

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
        grade_level: role === "student" ? gradeLevel : null,
        school_name: schoolName || null,
      },
    },
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  // If Supabase has email confirmation enabled
  if (!data.session && data.user) {
    return {
      success: true,
      redirectUrl: "/login?registered=true",
      requiresEmailConfirmation: true,
    };
  }

  // Teachers are placed into pending approval state
  const redirectUrl = role === "teacher" ? "/pending-approval" : "/student";
  revalidatePath("/", "layout");

  return {
    success: true,
    redirectUrl,
    requiresEmailConfirmation: false,
  };
}

/**
 * Server Action: Request password reset email.
 */
export async function requestPasswordReset(
  formData: z.infer<typeof forgotPasswordSchema>
): Promise<AuthActionResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase credentials are not configured.",
    };
  }

  const parsed = forgotPasswordSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid email address.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback?next=/auth/reset-password`,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    redirectUrl: "/login?resetSent=true",
  };
}

/**
 * Server Action: Reset password for authenticated user.
 */
export async function resetPassword(
  formData: z.infer<typeof resetPasswordSchema>
): Promise<AuthActionResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase credentials are not configured.",
    };
  }

  const parsed = resetPasswordSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid password.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    redirectUrl: "/login?passwordUpdated=true",
  };
}

/**
 * Server Action: Approve a teacher account (Admin only).
 */
export async function approveTeacher(
  teacherId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Database not configured." };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Authentication required." };
  }

  // Verify current user is admin
  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!adminProfile || adminProfile.role !== "admin") {
    return { success: false, error: "Only administrators can approve teacher accounts." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ account_status: "active", updated_at: new Date().toISOString() })
    .eq("id", teacherId)
    .eq("role", "teacher");

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  return { success: true };
}

/**
 * Server Action: Sign out authenticated user.
 */
export async function signOutUser(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/login");
}

/**
 * Server Action: Fetch current authenticated user's profile from database.
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return {
        id: user.id,
        email: user.email || "",
        fullName: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        role: (user.user_metadata?.role as UserRole) || "student",
        accountStatus: (user.user_metadata?.role === "teacher" ? "pending_approval" : "active"),
        gradeLevel: user.user_metadata?.grade_level || null,
        schoolName: user.user_metadata?.school_name || null,
        avatarUrl: null,
        createdAt: user.created_at || new Date().toISOString(),
        updatedAt: user.updated_at || new Date().toISOString(),
      };
    }

    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      role: profile.role,
      accountStatus: profile.account_status || "active",
      gradeLevel: profile.grade_level,
      schoolName: profile.school_name,
      avatarUrl: profile.avatar_url,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };
  } catch (err) {
    console.error("Error fetching current user profile:", err);
    return null;
  }
}
