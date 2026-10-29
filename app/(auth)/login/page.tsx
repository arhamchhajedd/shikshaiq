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
  User,
  GraduationCap,
  Shield,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
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
        // Enforce safe relative redirect path, prevent open redirects
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
    <div className="min-h-screen flex flex-col bg-[#fbfbfd] text-zinc-900 font-sans">
      <Header />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-12 sm:py-16 flex flex-col justify-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-black transition-colors mb-6 self-start"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>

        <Card className="bg-white border-black/[0.08] p-7 sm:p-9 space-y-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] rounded-3xl">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex h-11 w-11 rounded-2xl bg-black text-white items-center justify-center font-bold text-base shadow-xs mx-auto">
              IQ
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
              Sign In to ShikshaIQ
            </h1>
            <p className="text-xs text-zinc-500 font-normal">
              Enter your credentials to access your Student, Teacher, or Admin portal.
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
            <div className="p-4 rounded-2xl bg-neutral-50 border border-black/10 text-xs text-neutral-800 flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-neutral-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Reset Link Dispatched</span>
                <p className="text-neutral-600 text-[11px] mt-0.5">
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

          {/* Missing Env Notice (Visible only if Supabase keys not set yet) */}
          {!isConfigured && (
            <div className="p-4 rounded-2xl bg-zinc-50 border border-black/[0.08] text-xs text-zinc-700 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-zinc-900">
                <ShieldAlert className="h-4 w-4 text-zinc-800 shrink-0" />
                <span>Supabase Configuration Ready</span>
              </div>
              <p className="text-[11px] text-zinc-600 leading-relaxed font-normal">
                To activate live authentication, add your project credentials to <code className="px-1.5 py-0.5 rounded bg-zinc-200 font-mono text-[10px]">.env.local</code>:
              </p>
              <div className="p-2.5 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-[10px] overflow-x-auto select-all">
                NEXT_PUBLIC_SUPABASE_URL=https://your-id.supabase.co<br />
                NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
              </div>
              <p className="text-[10px] text-zinc-500">
                See <Link href="/supabase/migrations" className="underline font-medium text-zinc-800">supabase/migrations/README.md</Link> for SQL setup.
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

          {/* Login Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-black/[0.08] text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="pass" className="block text-xs font-semibold text-zinc-800">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-[11px] text-zinc-500 hover:text-black font-medium transition-colors"
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-black/[0.08] text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black transition-all"
              />
            </div>

            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={isPending}
              className="w-full justify-center"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </form>

          {/* Role Navigation Assistance */}
          <div className="pt-4 border-t border-black/[0.06] space-y-3">
            <div className="flex items-center justify-between text-[11px] text-zinc-500">
              <span className="font-semibold text-zinc-700">Supported Roles:</span>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <User className="h-3 w-3 text-zinc-400" /> Student
                </span>
                <span className="inline-flex items-center gap-1">
                  <GraduationCap className="h-3 w-3 text-zinc-400" /> Teacher
                </span>
                <span className="inline-flex items-center gap-1">
                  <Shield className="h-3 w-3 text-zinc-400" /> Admin
                </span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 text-center">
              Your role determines your designated dashboard automatically upon login.
            </p>
          </div>

          <div className="text-center text-xs text-zinc-500 pt-2 border-t border-black/[0.06]">
            Don&apos;t have an account yet?{" "}
            <Link href="/signup" className="text-black font-semibold hover:underline">
              Create an account
            </Link>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fbfbfd]">
          <div className="h-6 w-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
