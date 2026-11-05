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
import { Button } from "@/components/ui/Button";
import { signUpUser } from "@/lib/auth/actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type PublicSignupRole = "student" | "teacher";

export default function SignUpPage() {
  const router = useRouter();

  const [role, setRole] = useState<PublicSignupRole>("student");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    if (!fullName) {
      setErrorMessage("Please enter your name.");
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

        {/* Center: Hero Heading (Exactly like reference) */}
        <div className="relative z-10 my-10 lg:my-auto max-w-md space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-950 leading-[1.08]">
            Get started with <br />
            <span className="text-zinc-500 font-normal">ShikshaIQ.</span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-normal">
            Answer a couple of questions to personalize your Class 7 Mathematics diagnostic baseline.
          </p>

          <div className="pt-2 flex items-center gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5 font-medium text-zinc-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Instant Student Access
            </span>
            <span>·</span>
            <span className="flex items-center gap-1.5 font-medium text-zinc-700">
              <span className="h-1.5 w-1.5 rounded-full bg-black" />
              Teacher Copilot Ready
            </span>
          </div>
        </div>

        {/* Bottom Proof / Student Card */}
        <div className="relative z-10 max-w-md bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-black/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/[0.06]">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
                AS
              </div>
              <div>
                <h2 className="text-xs font-bold text-zinc-950">Aarav Sharma</h2>
                <p className="text-[11px] text-zinc-500">Class 7 Learner · Kendriya Vidyalaya</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              15/15 Stars
            </span>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed italic">
            &ldquo;The diagnostic assessment pinpointed my gap in Equivalent Fractions right away. The visual fraction strips and Socratic AI tutor helped me master Adding Fractions in two afternoons.&rdquo;
          </p>
        </div>
      </div>

      {/* Right Form Panel (Clean, Centered, "Let's start with the basics") */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-20 bg-white">
        <div className="w-full max-w-md space-y-7">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
              Let&apos;s start with the basics
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500">
              Create your account to unlock adaptive math learning.
            </p>
          </div>

          {/* Missing Supabase configuration notice */}
          {!isConfigured && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldAlert className="h-4 w-4 text-amber-700 shrink-0" />
                <span>Supabase Configuration Required</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                Please add <code className="px-1.5 py-0.5 bg-amber-100 rounded text-[10px] font-mono">NEXT_PUBLIC_SUPABASE_URL</code> to <code className="px-1.5 py-0.5 bg-amber-100 rounded text-[10px] font-mono">.env.local</code>.
              </p>
            </div>
          )}

          {/* Email Confirmation Pending Screen */}
          {isEmailConfirmationPending ? (
            <div className="py-8 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-950">Confirm Your Email Address</h3>
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
              {/* Error Alert */}
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

              {/* Form */}
              <form onSubmit={handleSignUp} className="space-y-4">
                {/* Role Selector Tabs */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
                    Registering as:
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setRole("student")}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        role === "student"
                          ? "bg-black text-white border-black shadow-xs"
                          : "bg-zinc-50 text-zinc-700 border-black/10 hover:bg-zinc-100"
                      }`}
                    >
                      <User className="h-3.5 w-3.5" />
                      <span>Student</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole("teacher")}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        role === "teacher"
                          ? "bg-black text-white border-black shadow-xs"
                          : "bg-zinc-50 text-zinc-700 border-black/10 hover:bg-zinc-100"
                      }`}
                    >
                      <GraduationCap className="h-3.5 w-3.5" />
                      <span>Teacher</span>
                    </button>
                  </div>

                  {role === "teacher" && (
                    <div className="mt-2.5 p-3 rounded-xl bg-zinc-50 border border-black/[0.06] text-xs text-zinc-600 flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 text-zinc-700 mt-0.5 shrink-0" />
                      <span className="text-[11px] leading-relaxed">
                        Teacher accounts are reviewed by an administrator before activation.
                      </span>
                    </div>
                  )}
                </div>

                {/* First Name & Last Name (Like in reference) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="firstName" className="block text-xs font-semibold text-zinc-800 mb-1">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Rohan"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-xs font-semibold text-zinc-800 mb-1">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-zinc-800 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@school.edu.in"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                  />
                </div>

                {/* School Name (Like Company Name in reference) */}
                <div>
                  <label htmlFor="schoolName" className="block text-xs font-semibold text-zinc-800 mb-1">
                    School / Institution Name {role === "student" && <span className="text-zinc-400 font-normal">(Optional)</span>}
                  </label>
                  <input
                    id="schoolName"
                    type="text"
                    required={role === "teacher"}
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder={role === "teacher" ? "Kendriya Vidyalaya No. 1" : "Delhi Public School"}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                  />
                </div>

                {/* Conditional Grade for Students */}
                {role === "student" && (
                  <div>
                    <label htmlFor="grade" className="block text-xs font-semibold text-zinc-800 mb-1">
                      Class / Grade
                    </label>
                    <select
                      id="grade"
                      value={gradeLevel}
                      onChange={(e) => setGradeLevel(parseInt(e.target.value, 10))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/10 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                    >
                      <option value={6}>Class 6</option>
                      <option value={7}>Class 7 (Mathematics MVP)</option>
                      <option value={8}>Class 8</option>
                      <option value={9}>Class 9</option>
                      <option value={10}>Class 10</option>
                    </select>
                  </div>
                )}

                {/* Passwords */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="password" className="block text-xs font-semibold text-zinc-800 mb-1">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-xs font-semibold text-zinc-800 mb-1">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-black/10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                    />
                  </div>
                </div>

                {/* Continue Button (Full width solid black pill button) */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isPending}
                  className="w-full justify-center h-12 text-sm font-semibold rounded-2xl mt-3"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="h-4 w-4 ml-1.5" />
                    </>
                  )}
                </Button>
              </form>

              {/* Bottom Switcher */}
              <div className="pt-5 border-t border-black/[0.06] text-center text-xs text-zinc-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-black font-semibold hover:underline underline-offset-4"
                >
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
