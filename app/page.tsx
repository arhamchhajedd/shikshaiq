import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { LearningPathsSection } from "@/components/landing/LearningPathsSection";
import { TeacherCopilotSection } from "@/components/landing/TeacherCopilotSection";
import { CapabilitiesSection } from "@/components/landing/CapabilitiesSection";
import { FaqPreviewSection } from "@/components/landing/FaqPreviewSection";
import { FinalCTASection } from "@/components/landing/FinalCTASection";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  buildFaqPageNode,
  buildGraph,
  buildWebApplicationNode,
} from "@/lib/seo/structuredData";
import { FAQ_ITEMS } from "@/lib/content/faq";
import { SITE } from "@/lib/seo/site";

export const metadata: Metadata = buildPageMetadata({
  title: SITE.defaultTitle,
  absoluteTitle: true,
  description: SITE.description,
  path: "/",
  keywords: SITE.keywords,
});

const HOME_FAQ_IDS = [
  "what-is-shikshaiq",
  "how-diagnostic-works",
  "does-ai-grade",
  "what-is-prerequisite-gap",
] as const;

export default function Home() {
  const homeFaqItems = FAQ_ITEMS.filter((item) =>
    (HOME_FAQ_IDS as readonly string[]).includes(item.id)
  );

  const homeStructuredData = buildGraph([
    buildWebApplicationNode(),
    buildFaqPageNode(homeFaqItems, "/"),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfd] text-zinc-900 selection:bg-black selection:text-white">
      <JsonLd data={homeStructuredData} />
      <Header />
      <main className="flex-1">
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <LearningPathsSection />
        <TeacherCopilotSection />
        <CapabilitiesSection />
        <FaqPreviewSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
}
