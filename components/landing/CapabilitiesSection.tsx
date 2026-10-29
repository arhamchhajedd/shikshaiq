import React from "react";
import { Globe2, WifiOff, Cpu, ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const CapabilitiesSection: React.FC = () => {
  return (
    <section id="offline-capability" className="py-20 lg:py-28 bg-[#f5f5f7] border-y border-black/[0.05]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Equitable Access"
          badgeVariant="default"
          title="Engineered for India's"
          highlight="Classroom Infrastructure"
          description="High-speed internet and English fluency should never be prerequisites for high-quality mathematical education."
        />

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Multilingual Capability Card */}
          <Card className="bg-white border-black/[0.06] p-7 sm:p-8 flex flex-col justify-between rounded-3xl shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900">
                  <Globe2 className="h-5 w-5" />
                </div>
                <Badge variant="default" size="sm">
                  Roadmap: Multi-Language AI
                </Badge>
              </div>

              <h3 className="text-xl font-bold tracking-tight text-zinc-900 mb-2.5">
                Multilingual Socratic Tutoring
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed font-normal mb-5">
                Mathematical concepts explained using culturally relatable Indian analogies in English, Hindi, and regional languages. Students learn fractions through familiar real-world contexts like sharing chapatis, dividing dosas, or measuring cricket pitch distances.
              </p>

              <div className="p-4 rounded-2xl bg-zinc-50 border border-black/[0.04] text-xs text-zinc-600 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-800">Phase 4 Capability Architecture</span>
                  <span className="text-[11px] text-zinc-500 font-mono">Planned</span>
                </div>
                <p className="text-[11px] text-zinc-500 font-normal">
                  Targeted support for English and Hindi mediums, followed by Marathi, Tamil, Telugu, and Bengali translations.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-black/[0.06] flex items-center gap-2 text-xs text-zinc-500">
              <Cpu className="h-3.5 w-3.5 text-zinc-700 shrink-0" />
              <span>Contextual LLM prompts grounded in NCERT terminology</span>
            </div>
          </Card>

          {/* Offline / Low-Connectivity Card */}
          <Card className="bg-white border-black/[0.06] p-7 sm:p-8 flex flex-col justify-between rounded-3xl shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900">
                  <WifiOff className="h-5 w-5" />
                </div>
                <Badge variant="default" size="sm">
                  Roadmap: PWA & IndexedDB
                </Badge>
              </div>

              <h3 className="text-xl font-bold tracking-tight text-zinc-900 mb-2.5">
                Offline-First Reliability
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed font-normal mb-5">
                Many semi-urban and rural schools experience intermittent broadband and electrical cuts. ShikshaIQ is architected to cache question banks locally in IndexedDB, allowing uninterrupted diagnostic practice during connectivity drops.
              </p>

              <div className="p-4 rounded-2xl bg-zinc-50 border border-black/[0.04] text-xs text-zinc-600 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-800">Phase 6 Offline Architecture</span>
                  <span className="text-[11px] text-zinc-500 font-mono">Planned</span>
                </div>
                <p className="text-[11px] text-zinc-500 font-normal">
                  Local offline queue stores assessment responses and synchronizes automatically with Supabase once network reconnects.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-black/[0.06] flex items-center gap-2 text-xs text-zinc-500">
              <ShieldCheck className="h-3.5 w-3.5 text-zinc-700 shrink-0" />
              <span>Zero data loss during unexpected school network interruptions</span>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
