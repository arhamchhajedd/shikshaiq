"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, LogOut, Shield, GraduationCap, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { signOutUser } from "@/lib/auth/actions";
import { UserProfile, UserRole } from "@/types/auth";
import { syncManager } from "@/lib/offline/syncManager";

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const closeMenu = () => setMobileMenuOpen(false);
  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    if (!isConfigured) return;

    let ignore = false;
    const supabase = createClient();

    async function checkAuth() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user && !ignore) {
          syncManager.setActiveUser(user.id);
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profile) {
            setCurrentUser({
              id: profile.id,
              email: profile.email,
              fullName: profile.full_name,
              role: profile.role,
              accountStatus: profile.account_status || "active",
              schoolName: profile.school_name,
              gradeLevel: profile.grade_level,
              avatarUrl: profile.avatar_url,
              createdAt: profile.created_at,
              updatedAt: profile.updated_at,
            });
          } else {
            setCurrentUser({
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
            });
          }
        }
      } catch (err) {
        console.error("Error reading auth state:", err);
      }
    }

    void checkAuth();

    return () => {
      ignore = true;
    };
  }, [isConfigured]);

  const dashboardHref =
    currentUser?.role === "admin"
      ? "/admin"
      : currentUser?.role === "teacher"
      ? "/teacher"
      : "/student";

  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/80 backdrop-blur-md transition-all font-sans">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="flex h-16 items-center justify-between">
          {/* Brand Logo & Wordmark */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black rounded-lg py-1 px-1"
            onClick={closeMenu}
          >
            <div className="h-8 w-8 rounded-lg bg-black text-white flex items-center justify-center shadow-xs">
              <span className="font-semibold text-xs tracking-tight">IQ</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold tracking-tight text-black">
                ShikshaIQ
              </span>
              <span className="hidden sm:inline-block text-[11px] text-zinc-400 font-normal">
                Class 7
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-7 text-[13px] font-medium text-zinc-600"
          >
            <Link
              href="/#features"
              className="hover:text-black transition-colors focus-visible:text-black"
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              className="hover:text-black transition-colors focus-visible:text-black"
            >
              How It Works
            </Link>
            <Link
              href="/student"
              className="hover:text-black transition-colors focus-visible:text-black"
            >
              Student Portal
            </Link>
            <Link
              href="/teacher"
              className="hover:text-black transition-colors focus-visible:text-black inline-flex items-center gap-1.5"
            >
              <span>Teacher Copilot</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2.5">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${
                    currentUser.role === "admin"
                      ? "bg-purple-50 text-purple-800 border border-purple-200"
                      : currentUser.role === "teacher"
                      ? "bg-amber-50 text-amber-900 border border-amber-200"
                      : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  }`}
                >
                  {currentUser.role === "admin" && <Shield className="h-3 w-3" />}
                  {currentUser.role === "teacher" && <GraduationCap className="h-3 w-3" />}
                  {currentUser.role === "student" && <User className="h-3 w-3" />}
                  {currentUser.role}
                </span>

                <Button variant="secondary" size="sm" href={dashboardHref}>
                  <span>Dashboard</span>
                  <ArrowRight className="h-3 w-3 ml-0.5" />
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    syncManager.setActiveUser(null);
                    void signOutUser();
                  }}
                  className="p-2 rounded-xl text-zinc-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                  aria-label="Sign Out"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-medium text-zinc-700 hover:text-black px-3 py-1.5 transition-colors"
                >
                  Sign In
                </Link>
                <Button variant="primary" size="sm" href="/signup">
                  <span>Get Started</span>
                  <ArrowRight className="h-3 w-3 ml-0.5" />
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="p-2 rounded-lg text-zinc-700 hover:text-black hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-black" />
              ) : (
                <Menu className="h-5 w-5 text-black" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-black/[0.06] bg-white/95 backdrop-blur-xl px-5 pt-3 pb-6 transition-all">
          <nav className="flex flex-col gap-2.5 text-sm font-medium text-zinc-800">
            <Link
              href="/#features"
              className="px-3 py-2 rounded-lg hover:bg-black/[0.03] transition-colors"
              onClick={closeMenu}
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              className="px-3 py-2 rounded-lg hover:bg-black/[0.03] transition-colors"
              onClick={closeMenu}
            >
              How It Works
            </Link>
            <Link
              href="/student"
              className="px-3 py-2 rounded-lg hover:bg-black/[0.03] transition-colors font-semibold text-neutral-900"
              onClick={closeMenu}
            >
              Student Portal
            </Link>
            <Link
              href="/teacher"
              className="px-3 py-2 rounded-lg hover:bg-black/[0.03] transition-colors font-semibold text-neutral-900 flex items-center justify-between"
              onClick={closeMenu}
            >
              <span>Teacher Copilot</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </Link>

            <div className="pt-3 mt-1 border-t border-black/[0.06] flex flex-col gap-2">
              {currentUser ? (
                <>
                  <div className="px-3 py-1.5 flex items-center justify-between text-xs text-zinc-600">
                    <span>Signed in as <strong>{currentUser.fullName}</strong></span>
                    <span className="capitalize font-mono text-[11px] font-semibold">({currentUser.role})</span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full justify-center"
                    href={dashboardHref}
                    onClick={closeMenu}
                  >
                    Go to {currentUser.role === "admin" ? "Admin" : currentUser.role === "teacher" ? "Teacher" : "Student"} Dashboard
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-center text-rose-700"
                    onClick={() => {
                      closeMenu();
                      syncManager.setActiveUser(null);
                      void signOutUser();
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-center"
                    href="/login"
                    onClick={closeMenu}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full justify-center"
                    href="/signup"
                    onClick={closeMenu}
                  >
                    Create Account
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
