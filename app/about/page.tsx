import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Users, Cpu, Lock, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  buildAboutPageNode,
  buildBreadcrumbNode,
  buildGraph,
} from "@/lib/seo/structuredData";

export const metadata: Metadata = buildPageMetadata({
  title: "About ShikshaIQ — Mission, Pedagogy & Architecture",
  description:
    "Learn why ShikshaIQ was built for Indian school education: bridging the 1-to-50 classroom gap with transparent deterministic knowledge tracing and Socratic AI tutoring.",
  path: "/about",
  keywords: [
    "About ShikshaIQ",
    "Indian school education technology",
    "NCERT adaptive learning platform",
    "deterministic knowledge tracing",
    "Socratic AI for schools",
    "minor data privacy DPDP Act",
  ],
});

export default function AboutPage() {
  const breadcrumbData = buildBreadcrumbNode([
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
  ]);

  const aboutPageData = buildAboutPageNode(
    "/about",
    "ShikshaIQ is an adaptive learning platform designed to bridge the classroom readiness gap in Indian school education through transparent prerequisite tracing and Socratic AI tutoring."
  );

  const structuredData = buildGraph([breadcrumbData, aboutPageData]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfd] text-zinc-900 selection:bg-black selection:text-white">
      <JsonLd data={structuredData} />
      <Header />

      <main className="flex-1">
        {/* Breadcrumb Navigation */}
        <div className="border-b border-black/[0.06] bg-white">
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-3">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-500">
              <Link href="/" className="hover:text-black transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-zinc-900 font-medium">About</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-black/[0.06] bg-white">
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-black/[0.06] text-xs font-medium text-zinc-800 mb-6 shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-black" />
              <span>Pedagogical Mission & Architecture</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-950 leading-[1.15]">
              One classroom. Different learners. Personalized learning for everyone.
            </h1>

            <p className="mt-5 text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed font-normal">
              In Indian schools, a single teacher instructs 40 to 60 students with widely divergent foundational readiness. ShikshaIQ bridges this gap by pinpointing and remediating prerequisite bottlenecks before students fall behind.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button variant="primary" size="lg" href="/curriculum">
                <span>Explore Curriculum DAG</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
              <Button variant="secondary" size="lg" href="/student/assessment">
                <span>Try Diagnostic Assessment</span>
              </Button>
            </div>
          </div>
        </section>

        {/* Core Pillars Section */}
        <section className="py-16 sm:py-20 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-5xl mx-auto space-y-16">
          {/* Pillar 1: The Challenge */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <Badge variant="default">The Reality</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
                The Classroom Dilemma in Indian Schools
              </h2>
              <p className="text-sm text-zinc-600 leading-relaxed">
                When introducing higher-order topics such as adding fractions with unlike denominators, teachers frequently observe that students struggle not with addition itself, but with earlier concepts: finding the Least Common Multiple (LCM) or understanding equivalent fractions.
              </p>
              <p className="text-sm text-zinc-600 leading-relaxed">
                With large batches, teachers lack the time to diagnose 50 individual prerequisite gaps manually. ShikshaIQ automates this diagnosis accurately and deterministically.
              </p>
            </div>

            <Card variant="surface" className="p-7 space-y-4">
              <div className="flex items-center gap-2.5">
                <Users className="h-5 w-5 text-zinc-900" />
                <h3 className="text-base font-bold text-zinc-950">Typical Indian Classroom</h3>
              </div>
              <ul className="space-y-3 text-xs text-zinc-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-zinc-900 shrink-0 mt-0.5" />
                  <span><strong>40–60 students per batch</strong> with diverse foundational preparation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-zinc-900 shrink-0 mt-0.5" />
                  <span><strong>Prerequisite blindness:</strong> struggles in Chapter 2 often trace back to Chapter 1 or earlier grade concepts.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-zinc-900 shrink-0 mt-0.5" />
                  <span><strong>Teacher overload:</strong> manual remedial assignment for each student is practically impossible without intelligent tooling.</span>
                </li>
              </ul>
            </Card>
          </div>

          {/* Pillar 2: Architectural Separation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <Card variant="surface" className="p-7 space-y-4 md:order-1 order-2">
              <div className="flex items-center gap-2.5">
                <Cpu className="h-5 w-5 text-zinc-900" />
                <h3 className="text-base font-bold text-zinc-950">Strict Separation of Concerns</h3>
              </div>
              <div className="space-y-3 text-xs text-zinc-600 leading-relaxed">
                <div className="p-3 rounded-xl bg-zinc-50 border border-black/[0.06]">
                  <strong className="text-zinc-950 block mb-1">1. Deterministic Knowledge Tracing Engine</strong>
                  Evaluates answers against protected server answer keys. Strictly calculates mastery percentages (80%+ Mastered, 50–79% Partial, &lt;50% Needs Revision). Traverses the DAG concept graph to find root bottlenecks.
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 border border-black/[0.06]">
                  <strong className="text-zinc-950 block mb-1">2. Socratic AI Tutor Companion</strong>
                  Provides culturally resonant hints (rotis, dosas, cricket runs). Never grades, never reveals answers, and cannot alter mastery state.
                </div>
              </div>
            </Card>

            <div className="space-y-4 md:order-2 order-1">
              <Badge variant="default">Engineering Philosophy</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
                Why We Never Let AI Decide Grades or Mastery
              </h2>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Large Language Models (LLMs) are probabilistic and prone to hallucinations. Allowing an AI to grade student answers or determine pass/fail status is educationally irresponsible.
              </p>
              <p className="text-sm text-zinc-600 leading-relaxed">
                In ShikshaIQ, all grading, mastery computation, and DAG prerequisite sequencing are pure, deterministic functions running on the server. The AI acts solely as a patient Socratic tutor.
              </p>
            </div>
          </div>

          {/* Pillar 3: Privacy & Offline Reliability */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <Badge variant="default">Privacy & Access</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
                Built for Real Indian Classrooms
              </h2>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Many schools in Tier 2/3 cities and rural districts experience erratic internet connectivity. ShikshaIQ includes a service worker and IndexedDB offline cache, allowing learners to download lessons and practice without continuous internet.
              </p>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Because students are minors, we comply with India&apos;s Digital Personal Data Protection (DPDP) Act 2023: zero commercial ad trackers, minimal data collection, and strict database row-level security.
              </p>
            </div>

            <Card variant="surface" className="p-7 space-y-4">
              <div className="flex items-center gap-2.5">
                <Lock className="h-5 w-5 text-zinc-900" />
                <h3 className="text-base font-bold text-zinc-950">Security & Privacy Commitments</h3>
              </div>
              <ul className="space-y-3 text-xs text-zinc-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Zero Student PII in AI Prompts:</strong> Student names, emails, and identifiers are never shared with LLM providers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Row Level Security (RLS):</strong> Students access only their own attempts; teachers access only supervised classrooms.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Zero Third-Party Advertising:</strong> No tracking pixels, social plugins, or behavioral profiling.</span>
                </li>
              </ul>
            </Card>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 bg-[#f5f5f7] border-t border-black/[0.06]">
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-4xl mx-auto text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
              Experience the Class 7 Fractions MVP
            </h2>
            <p className="text-sm text-zinc-600 max-w-lg mx-auto">
              Test your knowledge with our 15-question diagnostic assessment or view the teacher analytics dashboard.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Button variant="primary" size="lg" href="/student/assessment">
                <span>Start Student Assessment</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
              <Button variant="secondary" size="lg" href="/faq">
                <span>Read the FAQ</span>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
