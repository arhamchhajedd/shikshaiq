"use client";

import React, { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  GraduationCap,
  User,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { signInUser } from "@/lib/auth/actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegisteredSuccess = searchParams.get("registered") === "true";
  const isResetSent = searchParams.get("resetSent") === "true";
  const isPasswordResetSuccess = searchParams.get("passwordReset") === "true";
  const redirectTarget = searchParams.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isConfigured = isSupabaseConfigured();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both your email and password.");
      return;
    }

    startTransition(async () => {
      const result = await signInUser({
        email: email.trim(),
        password,
      });

      if (!result.success) {
        setErrorMessage(result.error);
      } else {
        const isSafeRedirect =
          redirectTarget &&
          redirectTarget.startsWith("/") &&
          !redirectTarget.startsWith("//") &&
          !redirectTarget.includes("://");

        router.push(isSafeRedirect ? redirectTarget : result.redirectUrl);
      }
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white text-zinc-950 font-sans selection:bg-black selection:text-white">
      {/* Left Brand Panel (Matches Winden / Apple Style) */}
      <div className="lg:w-1/2 min-h-[420px] lg:min-h-screen bg-[#f8f9fb] border-b lg:border-b-0 lg:border-r border-black/[0.06] p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative vector curves */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <svg
            className="w-full h-full"
            viewBox="0 0 600 800"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M-50 150 C 150 120, 250 350, 650 200"
              stroke="#000000"
              strokeWidth="1"
              strokeDasharray="4 6"
              className="opacity-10"
            />
            <path
              d="M-100 400 C 200 300, 300 650, 700 500"
              stroke="#000000"
              strokeWidth="1.2"
              className="opacity-10"
            />
            <path
              d="M50 750 C 350 600, 450 780, 650 680"
              stroke="#000000"
              strokeWidth="0.8"
              className="opacity-10"
            />
          </svg>
        </div>

        {/* Top: Logo & Back Link */}
        <div className="relative z-10 flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black rounded-2xl"
          >
            <div className="h-12 w-12 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-lg shadow-[0_8px_20px_rgba(0,0,0,0.12)] group-hover:scale-105 transition-transform">
              IQ
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-zinc-950">
                ShikshaIQ
              </span>
              <span className="text-[11px] text-zinc-500 font-medium">
                NCERT Class 7 Mathematics
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-black font-medium transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to site</span>
          </Link>
        </div>

        {/* Center: Hero Heading */}
        <div className="relative z-10 my-10 lg:my-auto max-w-md space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-950 leading-[1.08]">
            Sign in to <br />
            <span className="text-zinc-500 font-normal">ShikshaIQ.</span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-normal">
            One classroom. Different learners. Access your personalized Class 7 Fractions diagnostics, mastery matrix, or teacher copilot.
          </p>

          {/* 1-Click Fast Fill Pills for Evaluators */}
          <div className="pt-4 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800">
              <Sparkles className="h-3.5 w-3.5 text-black" />
              <span>1-Click Evaluator Logins:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail("teacher@shikshaiq.edu.in");
                  setPassword("Password123!");
                }}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-zinc-100 text-zinc-800 border border-black/10 shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
              >
                <GraduationCap className="h-3.5 w-3.5 text-amber-600" />
                <span>Teacher</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail("rohan@shikshaiq.edu.in");
                  setPassword("Password123!");
                }}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-zinc-100 text-zinc-800 border border-black/10 shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
              >
                <User className="h-3.5 w-3.5 text-emerald-600" />
                <span>Student (Rohan)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail("shiksha_admin@shikshaiq.edu.in");
                  setPassword("AdminPassword2026!");
                }}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-zinc-100 text-zinc-800 border border-black/10 shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Shield className="h-3.5 w-3.5 text-purple-600" />
                <span>Admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Proof / Testimonial Card */}
        <div className="relative z-10 max-w-md bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-black/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/[0.06]">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
                RS
              </div>
              <div>
                <h2 className="text-xs font-bold text-zinc-950">Dr. Radhika Sharma</h2>
                <p className="text-[11px] text-zinc-500">Class 7 Mathematics Educator</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">
              NCERT / CBSE
            </span>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed italic">
            &ldquo;ShikshaIQ uncovered that 18 of my students struggled with Adding Fractions simply because of an unaddressed gap in Common Multiples (LCM). Remediating that first changed everything.&rdquo;
          </p>
        </div>
      </div>

      {/* Right Form Panel (Clean, Centered, Full Page) */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-20 bg-white">
        <div className="w-full max-w-md space-y-7">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
              Welcome back
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          {/* Success Banners */}
          {isRegisteredSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-900 flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Account Created Successfully</span>
                <p className="text-emerald-800 text-[11px] mt-0.5">
                  Sign in with your new email and password to access your dashboard.
                </p>
              </div>
            </div>
          )}

          {isResetSent && (
            <div className="p-4 rounded-2xl bg-zinc-50 border border-black/10 text-xs text-zinc-800 flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-zinc-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Reset Link Dispatched</span>
                <p className="text-zinc-600 text-[11px] mt-0.5">
                  Check your email inbox for password recovery instructions.
                </p>
              </div>
            </div>
          )}

          {isPasswordResetSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-900 flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Password Updated</span>
                <p className="text-emerald-800 text-[11px] mt-0.5">
                  Your password has been changed. Please sign in with your new password.
                </p>
              </div>
            </div>
          )}

          {/* Configuration Notice if Supabase not configured */}
          {!isConfigured && (
            <div className="p-4 rounded-2xl bg-zinc-50 border border-black/[0.08] text-xs text-zinc-700 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-zinc-900">
                <ShieldAlert className="h-4 w-4 text-zinc-800 shrink-0" />
                <span>Supabase Configuration Ready</span>
              </div>
              <p className="text-[11px] text-zinc-600 leading-relaxed font-normal">
                To activate live authentication, add your project credentials to <code className="px-1.5 py-0.5 rounded bg-zinc-200 font-mono text-[10px]">.env.local</code>.
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div
              className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 text-xs text-rose-900 flex items-start gap-2.5"
              role="alert"
            >
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Sign In Failed</span>
                <p className="text-rose-800 text-[11px] mt-0.5 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSignIn} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@school.edu.in"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-2xl bg-white border border-black/10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="pass" className="block text-xs font-semibold text-zinc-800">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-zinc-500 hover:text-black font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="pass"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-2xl bg-white border border-black/10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
              />
            </div>

            <Button
              variant="primary"
              size="lg"
              type="submit"
              disabled={isPending}
              className="w-full justify-center h-12 text-sm font-semibold rounded-2xl mt-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </>
              )}
            </Button>
          </form>

          {/* Bottom Switcher */}
          <div className="pt-6 border-t border-black/[0.06] text-center text-xs text-zinc-500">
            Don&apos;t have an account yet?{" "}
            <Link
              href="/signup"
              className="text-black font-semibold hover:underline underline-offset-4"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="h-6 w-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
