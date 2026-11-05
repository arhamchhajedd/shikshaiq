"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ArrowRight,
  LogOut,
  Shield,
  GraduationCap,
  User,
  WifiOff,
  ChevronDown,
  BookOpen,
  Sparkles,
  LayoutDashboard,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { signOutUser } from "@/lib/auth/actions";
import { UserProfile, UserRole } from "@/types/auth";
import { syncManager } from "@/lib/offline/syncManager";
import { cn } from "@/lib/utils";

/** External browser subscriptions for React 19 concurrent safety */
function subscribeToOnline(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getOnlineSnapshot() {
  return navigator.onLine;
}

function getServerOnlineSnapshot() {
  return true;
}

function subscribeToScroll(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}

function getScrollSnapshot() {
  return window.scrollY > 10;
}

function getServerScrollSnapshot() {
  return false;
}

/**
 * Top navigation bar following Apple's ultra-minimal, high-contrast aesthetic:
 * - Dynamic translucent glassmorphism with scroll depth
 * - Active route detection and accessible aria-current states
 * - Offline sync status micro-badge
 * - Authenticated user account menu with role-based quick actions
 * - Full-featured accessible mobile drawer with keyboard controls
 * - Zero dead links and full screen-reader support
 */
export const Header: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const isConfigured = isSupabaseConfigured();

  // Concurrent-safe browser state subscribers
  const isScrolled = useSyncExternalStore(
    subscribeToScroll,
    getScrollSnapshot,
    getServerScrollSnapshot
  );

  const isOnline = useSyncExternalStore(
    subscribeToOnline,
    getOnlineSnapshot,
    getServerOnlineSnapshot
  );

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Handle escape key and outside click for user dropdown & mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setUserDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Auth state listener
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

  const closeMenu = () => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const dashboardHref =
    currentUser?.role === "admin"
      ? "/admin"
      : currentUser?.role === "teacher"
      ? "/teacher"
      : "/student";

  // Check if a link is currently active
  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const navLinks = [
    { label: "Curriculum", href: "/curriculum" },
    { label: "FAQ", href: "/faq" },
    { label: "About", href: "/about" },
    { label: "Student Portal", href: "/student" },
    {
      label: "Teacher Copilot",
      href: "/teacher",
      badge: "Live",
    },
  ];

  return (
    <>
      {/* Accessible skip link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:bg-black focus:text-white focus:rounded-lg focus:shadow-lg focus:text-xs focus:font-medium focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-200 font-sans",
          isScrolled
            ? "border-b border-black/[0.08] bg-white/90 backdrop-blur-xl shadow-[0_2px_16px_rgba(0,0,0,0.03)]"
            : "border-b border-black/[0.04] bg-white/75 backdrop-blur-md"
        )}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Brand Logo & Wordmark */}
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black rounded-xl py-1 px-1 transition-transform active:scale-[0.98]"
                onClick={closeMenu}
                aria-label="ShikshaIQ Home"
              >
                <div className="h-8 w-8 rounded-lg bg-black text-white flex items-center justify-center shadow-xs transition-colors group-hover:bg-neutral-800">
                  <span className="font-semibold text-xs tracking-tight">IQ</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold tracking-tight text-black">
                    ShikshaIQ
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 bg-neutral-100 px-2 py-0.5 rounded-full border border-black/[0.04]">
                    <span>Class 7</span>
                    <span className="text-zinc-300">•</span>
                    <span>NCERT</span>
                  </span>
                </div>
              </Link>

              {/* Offline micro-pill */}
              {!isOnline && (
                <div
                  className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/90 text-[11px] font-medium text-amber-900"
                  role="status"
                  aria-live="polite"
                >
                  <WifiOff className="h-3 w-3 text-amber-600 animate-pulse" />
                  <span>Offline (Sync Active)</span>
                </div>
              )}
            </div>

            {/* Desktop Navigation Links */}
            <nav
              aria-label="Main Navigation"
              className="hidden md:flex items-center gap-1 lg:gap-1.5 text-[13px] font-medium"
            >
              {navLinks.map((item) => {
                const active = isLinkActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black",
                      active
                        ? "bg-black text-white shadow-xs font-semibold"
                        : "text-zinc-600 hover:text-black hover:bg-neutral-100/80"
                    )}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          active ? "bg-emerald-400" : "bg-emerald-500 animate-pulse"
                        )}
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              {currentUser ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    aria-expanded={userDropdownOpen}
                    aria-haspopup="true"
                    className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-black/[0.08] bg-white hover:bg-neutral-50 shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                  >
                    <div className="h-6 w-6 rounded-full bg-black text-white text-[11px] font-semibold flex items-center justify-center">
                      {currentUser.fullName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-black max-w-[120px] truncate">
                      {currentUser.fullName}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded flex items-center gap-1",
                        currentUser.role === "admin"
                          ? "bg-purple-50 text-purple-800"
                          : currentUser.role === "teacher"
                          ? "bg-amber-50 text-amber-900"
                          : "bg-emerald-50 text-emerald-800"
                      )}
                    >
                      {currentUser.role === "admin" && <Shield className="h-2.5 w-2.5" />}
                      {currentUser.role === "teacher" && <GraduationCap className="h-2.5 w-2.5" />}
                      {currentUser.role === "student" && <User className="h-2.5 w-2.5" />}
                      <span>{currentUser.role}</span>
                    </span>
                    <ChevronDown className={cn("h-3 w-3 text-zinc-400 transition-transform duration-200", userDropdownOpen && "rotate-180")} />
                  </button>

                  {/* User Profile Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-black/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.08)] py-2 z-50 text-xs font-sans animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-2.5 border-b border-black/[0.05]">
                        <p className="font-semibold text-black truncate">{currentUser.fullName}</p>
                        <p className="text-zinc-500 text-[11px] truncate">{currentUser.email}</p>
                        {currentUser.schoolName && (
                          <p className="text-zinc-400 text-[10px] mt-0.5 truncate">{currentUser.schoolName}</p>
                        )}
                      </div>

                      <div className="py-1">
                        <Link
                          href={dashboardHref}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-zinc-700 hover:text-black hover:bg-neutral-50 transition-colors"
                        >
                          <LayoutDashboard className="h-3.5 w-3.5 text-zinc-500" />
                          <span>
                            {currentUser.role === "admin"
                              ? "Admin Console"
                              : currentUser.role === "teacher"
                              ? "Teacher Dashboard"
                              : "Student Learning Dashboard"}
                          </span>
                        </Link>

                        {currentUser.role === "student" && (
                          <Link
                            href="/student/assessment"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-zinc-700 hover:text-black hover:bg-neutral-50 transition-colors"
                          >
                            <BookOpen className="h-3.5 w-3.5 text-zinc-500" />
                            <span>Diagnostic Assessment</span>
                          </Link>
                        )}

                        {currentUser.role === "teacher" && (
                          <Link
                            href="/teacher"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-zinc-700 hover:text-black hover:bg-neutral-50 transition-colors"
                          >
                            <Sparkles className="h-3.5 w-3.5 text-zinc-500" />
                            <span>Classroom Analytics</span>
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-black/[0.05] pt-1 mt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            syncManager.setActiveUser(null);
                            void signOutUser();
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-rose-700 hover:bg-rose-50 transition-colors text-left font-medium"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <Link
                    href="/login"
                    className="text-[13px] font-medium text-zinc-700 hover:text-black px-3.5 py-1.5 rounded-full hover:bg-neutral-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                  >
                    Sign In
                  </Link>
                  <Button variant="primary" size="sm" href="/signup" className="shadow-xs">
                    <span>Get Started</span>
                    <ArrowRight className="h-3 w-3 ml-0.5" />
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Hamburger */}
            <div className="flex md:hidden items-center gap-2">
              <button
                type="button"
                className="p-2 rounded-xl text-zinc-700 hover:text-black hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation-drawer"
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

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            id="mobile-navigation-drawer"
            className="md:hidden border-b border-black/[0.08] bg-white/95 backdrop-blur-2xl shadow-xl transition-all font-sans"
          >
            <div className="px-5 pt-3 pb-6 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {/* Online/Offline Status for Mobile */}
              <div className="mb-3 px-3 py-2 rounded-xl bg-neutral-50 border border-black/[0.04] flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-medium">Curriculum Standards</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-black">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  NCERT Class 7 Maths
                </span>
              </div>

              <nav className="flex flex-col gap-1 text-sm font-medium text-zinc-800">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-3 pt-2 pb-1">
                  Curriculum & Guides
                </div>

                <Link
                  href="/curriculum"
                  className={cn(
                    "px-3 py-2 rounded-xl transition-colors flex items-center justify-between",
                    isLinkActive("/curriculum")
                      ? "bg-black text-white font-semibold"
                      : "hover:bg-neutral-100 text-zinc-800"
                  )}
                  onClick={closeMenu}
                >
                  <span>Curriculum Topology</span>
                  <BookOpen className="h-4 w-4 opacity-70" />
                </Link>

                <Link
                  href="/faq"
                  className={cn(
                    "px-3 py-2 rounded-xl transition-colors",
                    isLinkActive("/faq")
                      ? "bg-black text-white font-semibold"
                      : "hover:bg-neutral-100 text-zinc-800"
                  )}
                  onClick={closeMenu}
                >
                  FAQ & Knowledge Base
                </Link>

                <Link
                  href="/about"
                  className={cn(
                    "px-3 py-2 rounded-xl transition-colors",
                    isLinkActive("/about")
                      ? "bg-black text-white font-semibold"
                      : "hover:bg-neutral-100 text-zinc-800"
                  )}
                  onClick={closeMenu}
                >
                  About ShikshaIQ & Pedagogy
                </Link>

                <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 px-3 pt-4 pb-1">
                  Learning Portals
                </div>

                <Link
                  href="/student"
                  className={cn(
                    "px-3 py-2 rounded-xl transition-colors flex items-center justify-between",
                    isLinkActive("/student") && !pathname.includes("assessment")
                      ? "bg-black text-white font-semibold"
                      : "hover:bg-neutral-100 text-zinc-800"
                  )}
                  onClick={closeMenu}
                >
                  <span>Student Portal</span>
                  <span className="text-xs opacity-70 font-normal">Self-paced</span>
                </Link>

                <Link
                  href="/student/assessment"
                  className={cn(
                    "px-3 py-2 rounded-xl transition-colors flex items-center justify-between",
                    pathname.includes("assessment")
                      ? "bg-black text-white font-semibold"
                      : "hover:bg-neutral-100 text-zinc-800"
                  )}
                  onClick={closeMenu}
                >
                  <span>Diagnostic Assessment</span>
                  <CheckCircle2 className="h-4 w-4 opacity-70" />
                </Link>

                <Link
                  href="/teacher"
                  className={cn(
                    "px-3 py-2 rounded-xl transition-colors flex items-center justify-between",
                    isLinkActive("/teacher")
                      ? "bg-black text-white font-semibold"
                      : "hover:bg-neutral-100 text-zinc-800"
                  )}
                  onClick={closeMenu}
                >
                  <span>Teacher Copilot</span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live
                  </span>
                </Link>

                {/* Account Actions */}
                <div className="pt-4 mt-2 border-t border-black/[0.06] flex flex-col gap-2">
                  {currentUser ? (
                    <>
                      <div className="px-3 py-2 rounded-xl bg-neutral-50 border border-black/[0.04]">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-black text-sm">{currentUser.fullName}</p>
                          <span
                            className={cn(
                              "text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full",
                              currentUser.role === "admin"
                                ? "bg-purple-100 text-purple-900"
                                : currentUser.role === "teacher"
                                ? "bg-amber-100 text-amber-900"
                                : "bg-emerald-100 text-emerald-900"
                            )}
                          >
                            {currentUser.role}
                          </span>
                        </div>
                        <p className="text-zinc-500 text-xs truncate mt-0.5">{currentUser.email}</p>
                      </div>

                      <Button
                        variant="primary"
                        size="md"
                        className="w-full justify-center"
                        href={dashboardHref}
                        onClick={closeMenu}
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        <span>Go to {currentUser.role === "admin" ? "Admin" : currentUser.role === "teacher" ? "Teacher" : "Student"} Dashboard</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="md"
                        className="w-full justify-center text-rose-700 border-rose-200 hover:bg-rose-50"
                        onClick={() => {
                          closeMenu();
                          syncManager.setActiveUser(null);
                          void signOutUser();
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        <span>Sign Out</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="primary"
                        size="md"
                        className="w-full justify-center"
                        href="/signup"
                        onClick={closeMenu}
                      >
                        <span>Get Started Free</span>
                        <ArrowRight className="h-4 w-4 ml-1.5" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="md"
                        className="w-full justify-center"
                        href="/login"
                        onClick={closeMenu}
                      >
                        Sign In
                      </Button>
                    </>
                  )}
                </div>
              </nav>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
