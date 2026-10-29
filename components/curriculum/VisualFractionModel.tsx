import React from "react";
import { VisualRepresentation } from "@/types/curriculum";

interface VisualFractionModelProps {
  model: VisualRepresentation;
}

export function VisualFractionModel({ model }: VisualFractionModelProps) {
  const { type, title, description, data } = model;

  return (
    <div className="p-6 rounded-3xl bg-neutral-50/70 border border-black/10 space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-black shrink-0" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
            {title}
          </h4>
        </div>
        <p className="text-xs text-neutral-600 leading-relaxed">{description}</p>
      </div>

      {/* Model Visualizer */}
      <div className="pt-2">
        {type === "fraction_strip" && (
          <div className="space-y-3">
            {data.strips && Array.isArray(data.strips) ? (
              // Multiple strips comparison (Equivalent fractions)
              <div className="space-y-2.5">
                {(data.strips as Array<{ parts: number; shaded: number; label?: string }>).map(
                  (strip, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono text-neutral-500">
                        <span>
                          {strip.parts} equal parts ({strip.shaded}/{strip.parts})
                        </span>
                        <span className="font-bold text-neutral-900">{strip.label}</span>
                      </div>
                      <div className="h-8 w-full bg-white border border-black/10 rounded-xl overflow-hidden flex shadow-xs">
                        {Array.from({ length: strip.parts }).map((_, partIdx) => (
                          <div
                            key={partIdx}
                            className={`flex-1 h-full border-r last:border-r-0 border-black/10 transition-colors ${
                              partIdx < strip.shaded
                                ? "bg-black text-white"
                                : "bg-neutral-100 text-neutral-400"
                            } flex items-center justify-center text-[10px] font-mono`}
                          >
                            {partIdx < strip.shaded ? "1" : ""}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              // Single strip model (Fraction basics / Addition)
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-neutral-500">
                    Shaded: {Number(data.shadedParts || 5)} / Total: {Number(data.totalParts || 8)}
                  </span>
                  <span className="font-bold text-neutral-900">{String(data.fractionLabel || "5/8")}</span>
                </div>
                <div className="h-10 w-full bg-white border border-black/10 rounded-2xl overflow-hidden flex shadow-xs">
                  {Array.from({ length: Number(data.totalParts || 8) }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`flex-1 h-full border-r last:border-r-0 border-black/10 flex items-center justify-center text-xs font-mono font-medium transition-colors ${
                        idx < Number(data.shadedParts || 5)
                          ? "bg-black text-white"
                          : "bg-neutral-100 text-neutral-400"
                      }`}
                    >
                      {idx < Number(data.shadedParts || 5) ? `Part ${idx + 1}` : ""}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[11px] text-neutral-400 pt-0.5 font-mono">
                  <span>0</span>
                  <span>1 Whole</span>
                </div>
              </div>
            )}
          </div>
        )}

        {type === "grid" && (
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="text-[11px] font-mono text-neutral-500">
                Multiples of {String(data.numberA || 4)}:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(data.multiplesA as number[] || [4, 8, 12, 16, 20]).map((m) => {
                  const isLcm = m === Number(data.lcm || 12);
                  return (
                    <span
                      key={m}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold ${
                        isLcm
                          ? "bg-black text-white ring-2 ring-neutral-900 ring-offset-1"
                          : "bg-white border border-black/10 text-neutral-700"
                      }`}
                    >
                      {m} {isLcm && "★ LCM"}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-mono text-neutral-500">
                Multiples of {String(data.numberB || 6)}:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(data.multiplesB as number[] || [6, 12, 18, 24]).map((m) => {
                  const isLcm = m === Number(data.lcm || 12);
                  return (
                    <span
                      key={m}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold ${
                        isLcm
                          ? "bg-black text-white ring-2 ring-neutral-900 ring-offset-1"
                          : "bg-white border border-black/10 text-neutral-700"
                      }`}
                    >
                      {m} {isLcm && "★ LCM"}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {type === "circle_division" && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-4">
              {/* 2 full units */}
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-xs font-mono font-bold shadow-xs">
                  1 Whole
                </div>
                <span className="text-sm font-bold text-neutral-400">+</span>
                <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-xs font-mono font-bold shadow-xs">
                  1 Whole
                </div>
                <span className="text-sm font-bold text-neutral-400">+</span>
                {/* 3/4 fractional circle */}
                <div className="w-16 h-16 rounded-full bg-neutral-100 border border-black/10 relative overflow-hidden flex items-center justify-center shadow-xs">
                  <div className="absolute inset-0 bg-black clip-three-quarters" style={{ clipPath: "polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 50%)" }} />
                  <span className="relative z-10 text-[11px] font-mono font-bold text-white">3/4</span>
                </div>
              </div>

              <div className="text-left space-y-0.5 border-l border-black/10 pl-4">
                <div className="text-xs font-mono text-neutral-400">Mixed Number</div>
                <div className="text-lg font-mono font-bold text-neutral-900">2 3/4</div>
                <div className="text-xs font-mono text-neutral-500">= 11/4 improper fraction</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
