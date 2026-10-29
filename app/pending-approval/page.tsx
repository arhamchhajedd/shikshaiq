"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, Shield, RefreshCw, LogOut, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { signOutUser, getCurrentUserProfile } from "@/lib/auth/actions";
import { UserProfile } from "@/types/auth";

export default function PendingApprovalPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    async function load() {
      const p = await getCurrentUserProfile();
      setProfile(p);
      if (p && p.accountStatus === "active") {
        router.push(p.role === "admin" ? "/admin" : p.role === "teacher" ? "/teacher" : "/student");
      }
    }
    load();
  }, [router]);

  async function handleCheckStatus() {
    setChecking(true);
    const p = await getCurrentUserProfile();
    setChecking(false);
    if (p && p.accountStatus === "active") {
      router.push(p.role === "admin" ? "/admin" : p.role === "teacher" ? "/teacher" : "/student");
    } else {
      setProfile(p);
    }
  }

  async function handleSignOut() {
    await signOutUser();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff] text-neutral-900">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="w-full max-w-lg">
          <Card className="p-8 sm:p-12 border border-black/5 shadow-[0_4px_30px_rgba(0,0,0,0.03)] bg-white rounded-3xl text-center">
            <div className="w-16 h-16 bg-neutral-50 rounded-2xl border border-black/5 flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Clock className="w-8 h-8 text-neutral-700" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/60 text-amber-800 text-[11px] font-semibold mb-4 tracking-wide uppercase">
              Verification Required
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
              Teacher Account Pending Approval
            </h1>

            <p className="text-sm text-neutral-600 mt-3 leading-relaxed max-w-md mx-auto">
              Welcome, <span className="font-semibold text-neutral-900">{profile?.fullName || "Educator"}</span>. To safeguard student privacy and adhere to school data governance policies, all teacher accounts must be verified by an administrator before accessing class dashboards.
            </p>

            <div className="my-8 p-4 bg-neutral-50 rounded-2xl border border-black/5 text-left space-y-3">
              <div className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-neutral-700 mt-0.5 shrink-0" />
                <div className="text-xs text-neutral-600">
                  <span className="font-semibold text-neutral-900">Student Record Isolation:</span> Only approved educators can review diagnostic results and assign practice modules.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-neutral-700 mt-0.5 shrink-0" />
                <div className="text-xs text-neutral-600">
                  <span className="font-semibold text-neutral-900">School Affiliation:</span> {profile?.schoolName ? `Affiliated with ${profile.schoolName}` : "School affiliation on record."}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={handleCheckStatus}
                disabled={checking}
                className="w-full sm:w-auto px-6 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-medium rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin" : ""}`} />
                {checking ? "Checking..." : "Check Status"}
              </Button>

              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full sm:w-auto px-6 py-2.5 text-xs text-neutral-700 hover:text-black border-black/10 rounded-xl flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </Button>
            </div>

            <p className="text-[11px] text-neutral-400 mt-6">
              Need immediate assistance? Contact your institution administrator or platform support.
            </p>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
