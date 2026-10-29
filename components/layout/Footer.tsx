import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-black/[0.06] bg-[#f5f5f7] text-zinc-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="h-7 w-7 rounded-lg bg-black text-white flex items-center justify-center font-semibold text-xs shadow-xs">
                IQ
              </div>
              <span className="text-base font-semibold tracking-tight text-black">
                ShikshaIQ
              </span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-sm mb-4">
              One classroom. Different learners. Personalized learning for everyone.
              An adaptive learning platform engineered for Indian school students in Classes 6–10.
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white border border-black/[0.06] text-[11px] text-zinc-600 shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
              Aligned with NCERT & CBSE Mathematics standards
            </div>
          </div>

          {/* Student Experience */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-black mb-3.5">
              Student Experience
            </h4>
            <ul className="space-y-2 text-xs text-zinc-600">
              <li>
                <Link
                  href="/student"
                  className="hover:text-black transition-colors inline-flex items-center gap-1"
                >
                  Student Dashboard
                  <ArrowUpRight className="h-3 w-3 opacity-50" />
                </Link>
              </li>
              <li>
                <Link
                  href="/student/assessment"
                  className="hover:text-black transition-colors inline-flex items-center gap-1"
                >
                  Diagnostic Assessment
                  <ArrowUpRight className="h-3 w-3 opacity-50" />
                </Link>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="hover:text-black transition-colors"
                >
                  Adaptive Concept Graph
                </a>
              </li>
              <li>
                <a
                  href="#learning-paths"
                  className="hover:text-black transition-colors"
                >
                  Personalized Pathways
                </a>
              </li>
            </ul>
          </div>

          {/* Teacher & Platform */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-black mb-3.5">
              Educators & Platform
            </h4>
            <ul className="space-y-2 text-xs text-zinc-600">
              <li>
                <Link
                  href="/teacher"
                  className="hover:text-black transition-colors inline-flex items-center gap-1"
                >
                  Teacher Copilot
                  <ArrowUpRight className="h-3 w-3 opacity-50" />
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-black transition-colors"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="hover:text-black transition-colors"
                >
                  Create Account
                </Link>
              </li>
              <li>
                <a
                  href="#offline-capability"
                  className="hover:text-black transition-colors"
                >
                  Offline & Multilingual
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400">
          <p>
            © {new Date().getFullYear()} ShikshaIQ. Dedicated to foundational mastery for Indian school education.
          </p>
          <div className="flex items-center gap-4">
            <span>Class 7 Fractions MVP</span>
            <span>Deterministic Knowledge Tracing</span>
            <span>Server-side Socratic AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
