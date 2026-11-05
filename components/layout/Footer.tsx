"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowUp,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  Wifi,
  Sparkles,
  FileText,
  Compass,
} from "lucide-react";
import { CONCEPTS_LIST } from "@/lib/curriculum/concepts";
import { conceptPagePath } from "@/lib/seo/routes";

/**
 * World-class educational platform footer adhering to Apple's clean,
 * ultra-minimalist aesthetic:
 * - Crisp hairline borders and high-contrast typography
 * - Full curriculum topology navigation (all 5 NCERT Class 7 concept guides)
 * - Clear governance, DPDP Act 2023 compliance, and pedagogical pillars
 * - Accessible smooth "Back to Top" scrolling
 * - Zero dead links and complete crawlable internal site architecture
 */
export const Footer: React.FC = () => {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-black/[0.06] bg-[#fbfbfd] text-zinc-700 font-sans">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-12 lg:py-16">
        {/* Top 5-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand & Mission Column */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black rounded-lg py-0.5"
            >
              <div className="h-8 w-8 rounded-lg bg-black text-white flex items-center justify-center font-semibold text-xs shadow-xs">
                IQ
              </div>
              <span className="text-base font-semibold tracking-tight text-black">
                ShikshaIQ
              </span>
            </Link>

            <p className="text-xs text-zinc-500 leading-relaxed">
              One classroom. Different learners. Personalized foundational mastery for Indian school students in Classes 6–10.
            </p>

            <div className="space-y-2 pt-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white border border-black/[0.06] text-[11px] text-zinc-600 shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <span>NCERT & CBSE Class 7 Aligned</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                <ShieldCheck className="h-3.5 w-3.5 text-zinc-400" />
                <span>DPDP Act 2023 Child Privacy Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                <Wifi className="h-3.5 w-3.5 text-zinc-400" />
                <span>Offline-First Sync Engine</span>
              </div>
            </div>
          </div>

          {/* Column 2: Curriculum Topology */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-black mb-3.5 flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-zinc-400" />
              <span>Curriculum Topology</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-600">
              <li>
                <Link
                  href="/curriculum"
                  className="hover:text-black transition-colors font-medium text-black inline-flex items-center gap-1"
                >
                  <span>Syllabus Knowledge Graph</span>
                  <ArrowUpRight className="h-3 w-3 opacity-60" />
                </Link>
              </li>
              {CONCEPTS_LIST.map((concept) => (
                <li key={concept.id}>
                  <Link
                    href={conceptPagePath(concept.id)}
                    className="hover:text-black transition-colors block truncate"
                    title={concept.title}
                  >
                    {concept.order}. {concept.shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Portals & Learning Tools */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-black mb-3.5 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-zinc-400" />
              <span>Portals & Learning</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-600">
              <li>
                <Link
                  href="/student"
                  className="hover:text-black transition-colors inline-flex items-center gap-1"
                >
                  <span>Student Learning Portal</span>
                  <ArrowUpRight className="h-3 w-3 opacity-60" />
                </Link>
              </li>
              <li>
                <Link
                  href="/student/assessment"
                  className="hover:text-black transition-colors inline-flex items-center gap-1"
                >
                  <span>Diagnostic Assessment</span>
                  <ArrowUpRight className="h-3 w-3 opacity-60" />
                </Link>
              </li>
              <li>
                <Link
                  href="/teacher"
                  className="hover:text-black transition-colors inline-flex items-center gap-1 font-medium text-black"
                >
                  <span>Teacher Copilot</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="hover:text-black transition-colors"
                >
                  Admin Governance Console
                </Link>
              </li>
              <li>
                <Link
                  href="/#offline-capability"
                  className="hover:text-black transition-colors"
                >
                  Offline & Multilingual Engine
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Pedagogy & Documentation */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-black mb-3.5 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-zinc-400" />
              <span>Trust & Pedagogy</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-600">
              <li>
                <Link
                  href="/about"
                  className="hover:text-black transition-colors"
                >
                  About Pedagogical Mission
                </Link>
              </li>
              <li>
                <Link
                  href="/about#socratic-ai"
                  className="hover:text-black transition-colors"
                >
                  Socratic AI Guardrails
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-black transition-colors"
                >
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link
                  href="/llms.txt"
                  className="hover:text-black transition-colors inline-flex items-center gap-1 font-mono text-[11px]"
                >
                  <FileText className="h-3 w-3 opacity-50" />
                  <span>llms.txt (AI Specification)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/sitemap.xml"
                  className="hover:text-black transition-colors inline-flex items-center gap-1"
                >
                  <span>XML Sitemap</span>
                  <ArrowUpRight className="h-3 w-3 opacity-60" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Standards & Compliance */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-black mb-3.5 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-zinc-400" />
              <span>Standards & Safety</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-600">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>NCERT Class 7 Fractions</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>NIPUN Bharat Numeracy</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Deterministic DAG Engine</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Trilingual: EN, HI, MR</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Zero 3rd-Party Trackers</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Middle Utility & Quick Access Row */}
        <div className="mt-12 pt-6 border-t border-black/[0.06] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="inline-flex items-center gap-1.5 text-black font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              All 5 Concept Nodes Operational
            </span>
            <span className="text-zinc-300 hidden sm:inline">•</span>
            <span>Deterministic Knowledge Tracing</span>
            <span className="text-zinc-300 hidden sm:inline">•</span>
            <span>Server-side Socratic AI</span>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-black/[0.08] text-xs font-medium text-zinc-700 hover:text-black hover:bg-neutral-50 shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
            aria-label="Back to top of page"
          >
            <span>Back to top</span>
            <ArrowUp className="h-3 w-3" />
          </button>
        </div>

        {/* Bottom Legal & Attribution Bar */}
        <div className="mt-6 pt-4 border-t border-black/[0.04] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400">
          <p>
            © {currentYear} ShikshaIQ. Dedicated to foundational mastery for Indian school education.
          </p>
          <div className="flex items-center gap-3 text-zinc-500">
            <span>India (English)</span>
            <span className="text-zinc-300">•</span>
            <Link href="/about" className="hover:text-black transition-colors">
              Privacy & DPDP Act
            </Link>
            <span className="text-zinc-300">•</span>
            <Link href="/faq" className="hover:text-black transition-colors">
              Help
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
