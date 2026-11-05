import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, HelpCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  buildBreadcrumbNode,
  buildFaqPageNode,
  buildGraph,
} from "@/lib/seo/structuredData";
import { FAQ_CATEGORIES, FAQ_ITEMS } from "@/lib/content/faq";

export const metadata: Metadata = buildPageMetadata({
  title: "Frequently Asked Questions (FAQ) — ShikshaIQ Adaptive Platform",
  description:
    "Comprehensive answers about ShikshaIQ: how the NCERT Class 7 Fractions diagnostic works, deterministic mastery rules, the Socratic AI tutor, offline learning, and privacy.",
  path: "/faq",
  keywords: [
    "ShikshaIQ FAQ",
    "adaptive learning questions",
    "how fractions diagnostic works",
    "deterministic mastery engine vs AI",
    "offline learning for schools",
    "Socratic maths tutor India",
  ],
});

export default function FaqPage() {
  const breadcrumbData = buildBreadcrumbNode([
    { name: "Home", path: "/" },
    { name: "FAQ", path: "/faq" },
  ]);

  const faqData = buildFaqPageNode(FAQ_ITEMS, "/faq");
  const structuredData = buildGraph([breadcrumbData, faqData]);

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
              <span className="text-zinc-900 font-medium">FAQ</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-black/[0.06] bg-white">
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-black/[0.06] text-xs font-medium text-zinc-800 mb-6 shadow-xs">
              <HelpCircle className="h-3.5 w-3.5 text-zinc-700" />
              <span>Knowledge Base & Support</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-950 leading-[1.15]">
              Frequently Asked Questions
            </h1>

            <p className="mt-4 text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed font-normal">
              Clear, transparent answers about our deterministic adaptive engine, NCERT Class 7 curriculum, Socratic AI tutor, and student data protection.
            </p>

            {/* Quick jump tags */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {FAQ_CATEGORIES.map((category) => (
                <a
                  key={category.id}
                  href={`#${category.id}`}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
                >
                  {category.title}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Content Sections */}
        <div className="py-16 sm:py-20 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-4xl mx-auto space-y-16">
          {FAQ_CATEGORIES.map((category) => (
            <section key={category.id} id={category.id} className="scroll-mt-24 space-y-6">
              <div className="border-b border-black/[0.06] pb-3">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-950">
                  {category.title}
                </h2>
              </div>

              <div className="space-y-4">
                {category.items.map((item) => (
                  <Card
                    key={item.id}
                    id={item.id}
                    variant="surface"
                    className="p-6 sm:p-7 scroll-mt-28 space-y-3"
                  >
                    <h3 className="text-base sm:text-lg font-bold text-zinc-950 leading-snug">
                      <a href={`#${item.id}`} className="hover:underline">
                        {item.question}
                      </a>
                    </h3>

                    <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                      {item.answer}
                    </p>
                  </Card>
                ))}
              </div>
            </section>
          ))}

          {/* Additional Assistance Card */}
          <section className="p-8 rounded-3xl bg-white border border-black/[0.08] text-center space-y-4 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">
              Still have questions about ShikshaIQ?
            </h2>
            <p className="text-sm text-zinc-600 max-w-lg mx-auto">
              Learn more about our educational philosophy, review our complete Class 7 curriculum, or take the diagnostic assessment.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Button variant="primary" size="md" href="/about">
                <span>About Our Mission</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
              <Button variant="secondary" size="md" href="/curriculum">
                <span>View Full Curriculum</span>
              </Button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
