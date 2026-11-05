"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Mail, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { requestPasswordReset } from "@/lib/auth/actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await requestPasswordReset({ email });
      if (!res.success) {
        setError(res.error);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
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
          {/* Left Column: Context & Instructions */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-black/[0.06] text-xs font-medium text-zinc-800 shadow-xs">
                <KeyRound className="h-3.5 w-3.5 text-zinc-700" />
                <span>Account Recovery</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 leading-[1.15]">
                Reset your ShikshaIQ password.
              </h1>

              <p className="text-sm text-zinc-600 leading-relaxed font-normal">
                Forgot your password? Enter your registered email address and we will dispatch a secure, cryptographic password reset link to your inbox.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-black/[0.08] shadow-xs space-y-3 text-xs text-zinc-600">
              <h2 className="font-bold text-zinc-950 uppercase tracking-wider text-[11px]">
                Recovery Guidelines
              </h2>
              <ul className="space-y-2 list-disc list-inside">
                <li>Check your spam or junk folder if the email does not arrive in 2 minutes.</li>
                <li>The password recovery link remains valid for 60 minutes.</li>
                <li>If you signed up with a school email domain, ensure external emails are permitted.</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Full-Page Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-black/[0.08] p-7 sm:p-10 lg:p-12 shadow-xs">
            <div className="max-w-xl mx-auto space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-950">
                  Password Recovery
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                  We will verify your account and send a reset token.
                </p>
              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 text-xs text-rose-900 flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Request Failed</span>
                    <p className="text-rose-800 text-[11px] mt-0.5 leading-relaxed">{error}</p>
                  </div>
                </div>
              )}

              {success ? (
                <div className="py-6 text-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-950">Check your inbox</h3>
                  <p className="text-xs text-zinc-600 leading-relaxed max-w-sm mx-auto">
                    If an account exists for <strong className="text-zinc-900">{email}</strong>, you will receive an email with instructions to set a new password.
                  </p>
                  <div className="pt-2">
                    <Button variant="primary" size="md" href="/login">
                      Return to Sign In
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@school.edu.in"
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-zinc-50 border border-black/[0.08] text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={loading}
                    className="w-full justify-center h-12"
                  >
                    {loading ? "Sending Reset Link..." : "Send Reset Link"}
                  </Button>
                </form>
              )}

              <div className="pt-6 border-t border-black/[0.06] flex items-center justify-between text-xs text-zinc-500">
                <span>Remembered your password?</span>
                <Link href="/login" className="text-black font-semibold hover:underline inline-flex items-center gap-1">
                  <span>Sign In</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
