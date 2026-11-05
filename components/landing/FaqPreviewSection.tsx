import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FAQ_ITEMS } from "@/lib/content/faq";

/**
 * Top questions highlighted on the home page for search engines, AI answer
 * engines (AEO/GEO), and visiting educators/parents.
 */
const FEATURED_FAQ_IDS = [
  "what-is-shikshaiq",
  "how-diagnostic-works",
  "does-ai-grade",
  "what-is-prerequisite-gap",
] as const;

export const FaqPreviewSection: React.FC = () => {
  const featuredQuestions = FAQ_ITEMS.filter((item) =>
    (FEATURED_FAQ_IDS as readonly string[]).includes(item.id)
  );

  return (
    <section id="faq-preview" className="py-20 lg:py-28 bg-white border-t border-black/[0.06]">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-5xl mx-auto">
        <SectionHeading
          badge="Direct Answers"
          title="Frequently Asked"
          highlight="Questions"
          description="Clear, transparent answers about our deterministic knowledge engine, NCERT Class 7 Fractions scope, and Socratic AI tutor."
          align="center"
          className="mb-14"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {featuredQuestions.map((item) => (
            <Card key={item.id} variant="surface" className="p-6 sm:p-7 space-y-3">
              <h3 className="text-base font-bold text-zinc-950 leading-snug">
                <Link href={`/faq#${item.id}`} className="hover:underline">
                  {item.question}
                </Link>
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                {item.answer}
              </p>
              <div className="pt-2">
                <Link
                  href={`/faq#${item.id}`}
                  className="text-xs font-semibold text-black hover:underline inline-flex items-center gap-1"
                >
                  <span>Read full answer in FAQ</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="secondary" size="md" href="/faq">
            <span>View All Questions & Knowledge Base</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};
