import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { LearningPathsSection } from "@/components/landing/LearningPathsSection";
import { TeacherCopilotSection } from "@/components/landing/TeacherCopilotSection";
import { CapabilitiesSection } from "@/components/landing/CapabilitiesSection";
import { FinalCTASection } from "@/components/landing/FinalCTASection";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfd] text-zinc-900 selection:bg-black selection:text-white">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <LearningPathsSection />
        <TeacherCopilotSection />
        <CapabilitiesSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
}
