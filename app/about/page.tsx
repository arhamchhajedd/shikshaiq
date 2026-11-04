import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Shield, Cpu, WifiOff, Users, CheckCircle2, Award } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata = {
  title: "About ShikshaIQ | Adaptive Mathematics Learning Platform",
  description:
    "Learn about ShikshaIQ’s pedagogical mission, deterministic DAG architecture, offline-first resilience, and AI Socratic companion designed for Indian schools.",
};

export default function AboutPage() {
  const aboutJsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "ShikshaIQ",
    description: "Adaptive Diagnostic Learning Platform for Indian School Education",
    url: "https://shikshaiq.vercel.app",
    educationalLevel: "Middle School (Classes 6-10)",
    knowsAbout: [
      "NCERT Mathematics",
      "Directed Acyclic Graph Mastery",
      "Formative Assessment",
      "Socratic AI Tutoring",
      "Offline-first Education",
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff] text-neutral-900 font-sans">
      <JsonLd data={aboutJsonLd} />
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
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
        <section className="space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-black/5 text-[11px] font-semibold text-neutral-800 uppercase tracking-wide">
            <Award className="w-3.5 h-3.5" />
            Pedagogical Mission & Architecture
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 max-w-2xl leading-tight">
            One Classroom. Diverse Learners. Zero Compromise.
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 max-w-3xl leading-relaxed">
            In an average Indian classroom, a single teacher manages 40 to 60 students with widely divergent prerequisite knowledge. When a Class 7 student struggles with Adding Unlike Fractions, conventional systems simply deliver repetitive fraction drills. <strong>ShikshaIQ solves the real problem:</strong> diagnosing and remediating the root prerequisite gap—finding Common Multiples (LCM)—before moving forward.
          </p>
        </section>

        {/* 4 Architectural Pillars Grid */}
        <section className="mb-16">
          <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-6">
            Core Architectural Principles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card className="p-6 border border-black/10 rounded-3xl bg-neutral-50/50 hover:bg-white hover:border-black/20 transition-all shadow-2xs space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-xs">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                Deterministic DAG Engine
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                Curriculum is represented as a Directed Acyclic Graph with mathematical cycle prevention. Every mastery state requires verifiable evidence (at least 2 attempts with $\ge 80\%$ accuracy). Learning paths are computed mathematically without randomness.
              </p>
            </Card>

            <Card className="p-6 border border-black/10 rounded-3xl bg-neutral-50/50 hover:bg-white hover:border-black/20 transition-all shadow-2xs space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-xs">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                Strict Architectural Firewall
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                Generative AI is strictly isolated from grading, mastery calculation, and student records. The Socratic tutor (Google Gemini) receives pedagogical context without secret answer keys, ensuring AI acts purely as an empathetic guide, never a grader.
              </p>
            </Card>

            <Card className="p-6 border border-black/10 rounded-3xl bg-neutral-50/50 hover:bg-white hover:border-black/20 transition-all shadow-2xs space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-xs">
                <WifiOff className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                Offline-First Resilience
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                Designed for real Indian school infrastructure. Students download entire concept lesson packs to browser IndexedDB, practice offline in remote settings, and sync attempts back to Supabase PostgreSQL when connectivity returns.
              </p>
            </Card>

            <Card className="p-6 border border-black/10 rounded-3xl bg-neutral-50/50 hover:bg-white hover:border-black/20 transition-all shadow-2xs space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-xs">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                Teacher Copilot & Parent Loop
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                Real-time classroom heatmaps instantly alert teachers to cohort-wide bottlenecks. Teachers can override any system recommendation with 1 click, and send instant WhatsApp progress report cards directly to parents in plain language.
              </p>
            </Card>
          </div>
        </section>

        {/* Alignment Matrix */}
        <section className="mb-16 p-8 rounded-3xl border border-black/10 bg-neutral-50 space-y-6">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              National Standards
            </span>
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
              Aligned with NCERT & NEP 2020 Guidelines
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-white border border-black/5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-neutral-900 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Competency-Based</span>
              </div>
              <p className="text-neutral-500 leading-relaxed">
                Replaces rote memorization with formative diagnostic checkpoints and step-by-step concept mastery.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-black/5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-neutral-900 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Multilingual Socratic AI</span>
              </div>
              <p className="text-neutral-500 leading-relaxed">
                Supports English, Hindi, and Marathi to overcome language barriers for vernacular medium students.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-black/5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-neutral-900 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero Data Tampering</span>
              </div>
              <p className="text-neutral-500 leading-relaxed">
                Protected server-side answer keys and PostgreSQL Row-Level Security safeguard minor learners&apos; assessment data.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 rounded-3xl bg-black text-white shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold tracking-tight">Experience ShikshaIQ Live</h3>
            <p className="text-xs text-neutral-400">
              Try the Class 7 Fractions diagnostic assessment or review the curriculum graph.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/curriculum"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
            >
              Curriculum Map
            </Link>
            <Link
              href="/student/assessment"
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-white text-black hover:bg-neutral-100 text-xs font-semibold transition-colors shadow-xs"
            >
              <span>Take Assessment</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
