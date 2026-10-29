import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "./config";
import { AccountStatus, UserRole } from "@/types/auth";

/**
 * Refreshes auth tokens stored in cookies and enforces role-based access rules.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // If Supabase credentials are not configured yet, bypass session checking
  if (!isSupabaseConfigured()) {
    return supabaseResponse;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Securely fetch authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // 1. Unauthenticated handling for protected routes
  const isProtectedPath =
    path.startsWith("/student") ||
    path.startsWith("/teacher") ||
    path.startsWith("/admin") ||
    path.startsWith("/pending-approval");

  if (isProtectedPath && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", path);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Authenticated user logic
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, account_status")
      .eq("id", user.id)
      .single();

    const role: UserRole = profile?.role || "student";
    const status: AccountStatus = profile?.account_status || "active";

    // If visiting /login or /signup while authenticated
    if (path === "/login" || path === "/signup") {
      const redirectUrl = request.nextUrl.clone();
      if (status === "pending_approval") {
        redirectUrl.pathname = "/pending-approval";
      } else {
        redirectUrl.pathname =
          role === "admin" ? "/admin" : role === "teacher" ? "/teacher" : "/student";
      }
      return NextResponse.redirect(redirectUrl);
    }

    // Pending teacher protection
    if (role === "teacher" && status === "pending_approval") {
      if (path.startsWith("/teacher")) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/pending-approval";
        return NextResponse.redirect(redirectUrl);
      }
    }

    // Active users visiting /pending-approval
    if (path === "/pending-approval" && status === "active") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname =
        role === "admin" ? "/admin" : role === "teacher" ? "/teacher" : "/student";
      return NextResponse.redirect(redirectUrl);
    }

    // Strict Admin route guard
    if (path.startsWith("/admin")) {
      if (role !== "admin" || status !== "active") {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = role === "teacher" ? "/teacher" : "/student";
        return NextResponse.redirect(redirectUrl);
      }
    }

    // Strict Teacher route guard
    if (path.startsWith("/teacher")) {
      if (role !== "teacher" && role !== "admin") {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/student";
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  return supabaseResponse;
}
