"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
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
    <div className="min-h-screen flex flex-col bg-[#ffffff] text-neutral-900">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="w-full max-w-md">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-black mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>

          <Card className="p-8 sm:p-10 border border-black/5 shadow-[0_4px_25px_rgba(0,0,0,0.03)] bg-white rounded-3xl">
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                Reset your password
              </h1>
              <p className="text-sm text-neutral-500 mt-2">
                Enter your registered email address and we will send you a secure password reset link.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200/60 text-red-700 text-xs flex items-start gap-3">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {success ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-base font-semibold text-neutral-900">Check your inbox</h3>
                <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                  If an account exists for <span className="font-medium text-neutral-800">{email}</span>, you will receive an email with instructions to reset your password.
                </p>
                <div className="mt-6">
                  <Link href="/login">
                    <Button variant="outline" className="w-full text-xs">
                      Return to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-neutral-700 mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@school.edu.in"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 bg-neutral-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-medium tracking-wide transition-all shadow-sm"
                >
                  {loading ? "Sending link..." : "Send Reset Link"}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
