"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, HelpCircle, Sparkles, BookOpen, Zap } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { JsonLd } from "@/components/seo/JsonLd";

interface FAQItem {
  id: string;
  category: "Pedagogy" | "Technology" | "Teachers & Parents";
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "q1",
    category: "Pedagogy",
    question: "How does ShikshaIQ diagnose student learning gaps in mathematics?",
    answer:
      "ShikshaIQ models the NCERT mathematics curriculum as a Directed Acyclic Graph (DAG) of prerequisite dependencies. When a student takes our 15-question diagnostic assessment, our deterministic engine analyzes error patterns against verified distractor misconceptions. If a 7th-grade student fails Adding Unlike Fractions, the algorithm checks their mastery of Common Multiples (LCM). When an LCM deficit is detected, the platform automatically guides the student to remediate the root concept before progressing.",
  },
  {
    id: "q2",
    category: "Technology",
    question: "Why does ShikshaIQ use a deterministic engine instead of letting AI grade students?",
    answer:
      "We enforce a strict Architectural Firewall separating deterministic evaluation from generative AI. LLMs are non-deterministic, prone to hallucinations, and lack verifiable mathematical consistency required for formative assessment. In ShikshaIQ, 100% of grading, DAG traversal, and mastery thresholds (minimum 2 attempts with >=80% accuracy) are executed by audited TypeScript algorithms. Generative AI (Google Gemini) is strictly restricted to Socratic tutoring hints and pedagogical scaffolding.",
  },
  {
    id: "q3",
    category: "Technology",
    question: "Can students use ShikshaIQ without an active internet connection?",
    answer:
      "Yes. ShikshaIQ is built with an offline-first architecture using browser IndexedDB and progressive web app (PWA) caching. Students in low-bandwidth Indian rural and semi-urban classrooms can download entire concept lesson packs and practice quizzes. Practice attempts are stored locally and automatically synchronized with the Supabase PostgreSQL database once internet connectivity is restored.",
  },
  {
    id: "q4",
    category: "Pedagogy",
    question: "Which curriculum and grade levels does ShikshaIQ currently support?",
    answer:
      "ShikshaIQ currently covers NCERT and CBSE Class 7 Mathematics, focusing on Chapter 2: Fractions and Decimals. The curriculum is mapped across 5 core nodes: Fraction Basics, Equivalent Fractions, Common Multiples (LCM), Adding Unlike Fractions, and Mixed Fractions, backed by 50 verified questions with pedagogical distractors.",
  },
  {
    id: "q5",
    category: "Teachers & Parents",
    question: "How does ShikshaIQ assist classroom teachers managing 40–60 students?",
    answer:
      "The ShikshaIQ Teacher Cockpit delivers real-time classroom heatmaps, automated bottleneck alerts, and misconception radar. Instead of manually grading dozens of paper worksheets, teachers immediately see cohort distributions (e.g., 62% of students struggling with addition are bottlenecked on LCM). Teachers can group students for 10-minute targeted interventions and manually override any system recommendation.",
  },
  {
    id: "q6",
    category: "Teachers & Parents",
    question: "How are parents informed about their child's academic progress?",
    answer:
      "ShikshaIQ provides a 1-click WhatsApp Parent Progress Report. The report summarizes the student's daily study streak, star ratings across all 5 concepts, detected prerequisite bottlenecks, and actionable practice suggestions in plain language without requiring parents to install specialized software.",
  },
  {
    id: "q7",
    category: "Technology",
    question: "How does ShikshaIQ protect student assessment data and prevent cheating?",
    answer:
      "All question answer keys and pedagogical explanations are stored exclusively on the server in a protected table accessible only to service-role calls. The client never receives correct option IDs. Active quiz options are shuffled per student using a seeded pseudo-random number generator (PRNG), and database rows are protected with granular PostgreSQL Row-Level Security (RLS).",
  },
  {
    id: "q8",
    category: "Pedagogy",
    question: "In what languages is the Socratic AI Tutor available?",
    answer:
      "The ShikshaIQ Socratic Tutor supports English, Hindi, and Marathi. Students can ask doubts and receive explanations tailored to their native language using familiar Indian cultural analogies like rotis and chocolate bars.",
  },
];

export default function FAQPage() {
  const [openId, setOpenId] = useState<string | null>("q1");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Pedagogy", "Technology", "Teachers & Parents"];

  const filteredItems =
    selectedCategory === "All"
      ? FAQ_ITEMS
      : FAQ_ITEMS.filter((item) => item.category === selectedCategory);

  // Schema.org FAQPage JSON-LD for AEO / GEO
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff] text-neutral-900 font-sans">
      <JsonLd data={faqJsonLd} />
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-black/5 text-[11px] font-semibold text-neutral-800 uppercase tracking-wide">
            <HelpCircle className="w-3.5 h-3.5" />
            Answer Engine & Knowledge Hub
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-neutral-500 max-w-xl mx-auto">
            Everything you need to know about ShikshaIQ’s deterministic adaptive learning engine, Socratic AI tutor, and NCERT Class 7 curriculum.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-black text-white shadow-xs"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion FAQ Items */}
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const isOpen = openId === item.id;
            return (
              <Card
                key={item.id}
                className="border border-black/[0.08] rounded-2xl overflow-hidden transition-all duration-200 bg-white shadow-2xs hover:border-black/20"
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="w-full p-5 text-left flex items-start justify-between gap-4 focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono font-semibold tracking-wider text-neutral-400 block">
                      {item.category}
                    </span>
                    <h2 className="text-sm sm:text-base font-semibold text-neutral-900 leading-snug">
                      {item.question}
                    </h2>
                  </div>
                  <div
                    className={`h-7 w-7 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 text-neutral-700 transition-transform duration-200 mt-0.5 ${
                      isOpen ? "rotate-180 bg-neutral-200" : ""
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-black/5 mt-1">
                    <p>{item.answer}</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA Card */}
        <div className="mt-12 p-8 rounded-3xl bg-neutral-50 border border-black/5 text-center space-y-4">
          <div className="inline-flex h-10 w-10 rounded-2xl bg-black text-white items-center justify-center mx-auto shadow-xs">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
            Ready to test personalized mathematics learning?
          </h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
            Take our 15-question diagnostic assessment or explore our live teacher cockpit with real classroom data.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/student/assessment"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-black text-white hover:bg-neutral-800 text-xs font-semibold shadow-xs transition-colors"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Start Diagnostic Assessment</span>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white border border-black/10 hover:bg-neutral-100 text-xs font-semibold text-neutral-900 transition-colors"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Sign In with Demo Credentials</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
