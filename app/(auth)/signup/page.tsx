"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  Loader2,
  AlertCircle,
  User,
  GraduationCap,
  Mail,
  Info,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { signUpUser } from "@/lib/auth/actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type PublicSignupRole = "student" | "teacher";

export default function SignUpPage() {
  const router = useRouter();

  const [role, setRole] = useState<PublicSignupRole>("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gradeLevel, setGradeLevel] = useState<number>(7);
  const [schoolName, setSchoolName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEmailConfirmationPending, setIsEmailConfirmationPending] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isConfigured = isSupabaseConfigured();

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic client checks
    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    startTransition(async () => {
      const result = await signUpUser({
        fullName,
        email,
        password,
        role,
        gradeLevel: role === "student" ? gradeLevel : null,
        schoolName: schoolName.trim() || null,
      });

      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }

      if (result.requiresEmailConfirmation) {
        setIsEmailConfirmationPending(true);
      } else {
        router.push(result.redirectUrl);
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-950 font-sans">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="w-full max-w-md space-y-6">
          {/* Back link */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-black font-medium transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to home</span>
            </Link>
          </div>

          {/* Configuration Notice if Supabase env vars are missing */}
          {!isConfigured && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldAlert className="h-4 w-4 text-amber-700 shrink-0" />
                <span>Supabase Configuration Required</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                Authentication requires valid Supabase environment variables. Please add{" "}
                <code className="px-1.5 py-0.5 bg-amber-100 rounded text-[10px] font-mono">
                  NEXT_PUBLIC_SUPABASE_URL
                </code>{" "}
                and{" "}
                <code className="px-1.5 py-0.5 bg-amber-100 rounded text-[10px] font-mono">
                  NEXT_PUBLIC_SUPABASE_ANON_KEY
                </code>{" "}
                to your <code className="px-1.5 py-0.5 bg-amber-100 rounded text-[10px] font-mono">.env.local</code> file.
              </p>
            </div>
          )}

          {/* Email Confirmation Screen if required */}
          {isEmailConfirmationPending ? (
            <div className="py-6 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <Mail className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-zinc-950">Confirm Your Email Address</h2>
              <p className="text-xs text-zinc-600 leading-relaxed max-w-sm mx-auto">
                We sent a verification link to <strong className="text-zinc-900">{email}</strong>.
                Please check your inbox and click the confirmation link to activate your {role} account.
              </p>
              <div className="pt-2">
                <Button variant="primary" size="md" href="/login">
                  Go to Sign In
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Error Message */}
              {errorMessage && (
                <div
                  className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 text-xs text-rose-900 flex items-start gap-2.5"
                  role="alert"
                >
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Registration Error</span>
                    <p className="text-rose-800 text-[11px] mt-0.5 leading-relaxed">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Form Card */}
              <Card className="p-6 sm:p-8 bg-white border border-black/[0.08] rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6">
                <div className="space-y-1.5 text-center">
                  <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
                    Create your account
                  </h1>
                  <p className="text-xs text-zinc-600">
                    Join ShikshaIQ to start personalized mathematics learning
                  </p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                  {/* Role Selector Tabs (Students and Teachers only) */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-800 mb-2">
                      I am registering as:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole("student")}
                        className={`p-3 rounded-2xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                          role === "student"
                            ? "bg-black text-white border-black shadow-sm"
                            : "bg-zinc-50 text-zinc-700 border-black/[0.08] hover:bg-zinc-100"
                        }`}
                      >
                        <User className="h-4 w-4" />
                        <span>Student</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole("teacher")}
                        className={`p-3 rounded-2xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${
                          role === "teacher"
                            ? "bg-black text-white border-black shadow-sm"
                            : "bg-zinc-50 text-zinc-700 border-black/[0.08] hover:bg-zinc-100"
                        }`}
                      >
                        <GraduationCap className="h-4 w-4" />
                        <span>Teacher</span>
                      </button>
                    </div>

                    {role === "teacher" && (
                      <div className="mt-2.5 p-3 rounded-xl bg-neutral-50 border border-black/5 text-[11px] text-neutral-600 flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-neutral-700 mt-0.5 shrink-0" />
                        <span>
                          Teacher access requires administrator verification. After registration, your account will remain in pending approval until approved.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rohan Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-black/[0.08] text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                    />
                  </div>

                  {/* Conditional Field: Grade for Students */}
                  {role === "student" && (
                    <div>
                      <label htmlFor="grade" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                        Class / Grade
                      </label>
                      <select
                        id="grade"
                        value={gradeLevel}
                        onChange={(e) => setGradeLevel(parseInt(e.target.value, 10))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-black/[0.08] text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                      >
                        <option value={6}>Class 6</option>
                        <option value={7}>Class 7 (Mathematics MVP)</option>
                        <option value={8}>Class 8</option>
                        <option value={9}>Class 9</option>
                        <option value={10}>Class 10</option>
                      </select>
                    </div>
                  )}

                  {/* School Name */}
                  <div>
                    <label htmlFor="schoolName" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                      School / Institution Name {role === "student" && "(Optional)"}
                    </label>
                    <input
                      id="schoolName"
                      type="text"
                      required={role === "teacher"}
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder={role === "teacher" ? "e.g. Kendriya Vidyalaya No. 1" : "e.g. Delhi Public School"}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-black/[0.08] text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                    />
                  </div>

                  {/* Email */}
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
                      placeholder="student@school.edu.in"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-black/[0.08] text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                      Password (min. 6 characters)
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-black/[0.08] text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                    />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-black/[0.08] text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isPending}
                    className="w-full flex items-center justify-center gap-2 mt-4"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Registration</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="pt-2 text-center border-t border-black/[0.06]">
                  <p className="text-xs text-zinc-600">
                    Already registered?{" "}
                    <Link href="/login" className="font-semibold text-zinc-950 underline underline-offset-4 hover:text-black">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </Card>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
