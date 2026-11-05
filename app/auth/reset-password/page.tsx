"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { resetPassword } from "@/lib/auth/actions";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await resetPassword({ password });
      if (!res.success) {
        setError(res.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login?passwordReset=true");
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfd] text-zinc-900 font-sans selection:bg-black selection:text-white">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 lg:mb-10">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Sign In</span>
          </Link>
        </div>

        {/* Full Page 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left Column: Security Context */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-black/[0.06] text-xs font-medium text-zinc-800 shadow-xs">
                <Lock className="h-3.5 w-3.5 text-zinc-700" />
                <span>Security Update</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 leading-[1.15]">
                Set a new password.
              </h1>

              <p className="text-sm text-zinc-600 leading-relaxed font-normal">
                Choose a strong password to protect your student learning history or teacher classroom records.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-black/[0.08] shadow-xs space-y-3 text-xs text-zinc-600">
              <h2 className="font-bold text-zinc-950 uppercase tracking-wider text-[11px]">
                Password Requirements
              </h2>
              <ul className="space-y-2 list-disc list-inside">
                <li>Minimum of 6 characters in length.</li>
                <li>Avoid easily guessable words or your name.</li>
                <li>Once changed, you will be automatically redirected to sign in.</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Full-Page Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-black/[0.08] p-7 sm:p-10 lg:p-12 shadow-xs">
            <div className="max-w-xl mx-auto space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-950">
                  Update Password
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                  Enter and confirm your new credentials.
                </p>
              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 text-xs text-rose-900 flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Update Failed</span>
                    <p className="text-rose-800 text-[11px] mt-0.5 leading-relaxed">{error}</p>
                  </div>
                </div>
              )}

              {success ? (
                <div className="py-6 text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-950">Password Updated</h3>
                  <p className="text-xs text-zinc-600 leading-relaxed max-w-sm mx-auto">
                    Your password has been securely updated. Redirecting you to sign in...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="newPass" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                      New Password
                    </label>
                    <input
                      id="newPass"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-2xl bg-zinc-50 border border-black/[0.08] text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPass" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPass"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-2xl bg-zinc-50 border border-black/[0.08] text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={loading}
                    className="w-full justify-center h-12"
                  >
                    {loading ? "Updating Password..." : "Save New Password"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
