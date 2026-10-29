import React from "react";
import { ArrowRight, UserCheck, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const FinalCTASection: React.FC = () => {
  return (
    <section className="py-20 lg:py-28 bg-white border-t border-black/[0.06] relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-black/[0.06] text-xs font-medium text-zinc-800 mb-6 shadow-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-black" />
          <span>Experience the Adaptive MVP</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-950 leading-[1.15]">
          Ready to see personalized learning in action?
        </h2>

        <p className="mt-4 text-base sm:text-lg text-zinc-600 max-w-xl mx-auto leading-relaxed font-normal">
          Explore our Class 7 Mathematics Fractions demo as a student diagnosing their knowledge gaps, or as a teacher analyzing classroom bottlenecks.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="primary" size="lg" href="/student">
            <span>Launch Student Demo</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>

          <Button variant="secondary" size="lg" href="/teacher">
            <UserCheck className="h-4 w-4 mr-1 text-zinc-600" />
            <span>Open Teacher Copilot</span>
          </Button>
        </div>

        {/* Trust & Academic Integrity Indicators */}
        <div className="mt-14 pt-8 border-t border-black/[0.06] max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-zinc-500">
          <div className="flex items-center justify-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-zinc-700 shrink-0" />
            <span>Deterministic Scoring Rules</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-zinc-700 shrink-0" />
            <span>Student Privacy Protection</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-zinc-700 shrink-0" />
            <span>NCERT/CBSE Aligned</span>
          </div>
        </div>
      </div>
    </section>
  );
};
