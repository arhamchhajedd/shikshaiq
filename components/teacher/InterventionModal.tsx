"use client";

import React, { useState, useTransition } from "react";
import { X, Sparkles, BookOpen, PenTool, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createTeacherInterventionAction } from "@/lib/teacher/interventionActions";
import { InterventionAction, TeacherIntervention } from "@/types/interventions";
import { CONCEPTS } from "@/lib/curriculum/concepts";

interface InterventionModalProps {
  isOpen: boolean;
  studentId: string;
  studentName: string;
  classroomId?: string;
  onClose: () => void;
  onInterventionSaved?: (intervention: TeacherIntervention) => void;
}

export function InterventionModal({
  isOpen,
  studentId,
  studentName,
  classroomId,
  onClose,
  onInterventionSaved,
}: InterventionModalProps) {
  const [targetConceptId, setTargetConceptId] = useState("common-multiples");
  const [recommendedAction, setRecommendedAction] = useState<InterventionAction>("practice");
  const [teacherNotes, setTeacherNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await createTeacherInterventionAction({
        studentId,
        classroomId: classroomId || null,
        targetConceptId,
        recommendedAction,
        teacherNotes: teacherNotes.trim() || undefined,
      });

      if (!res.success || !res.intervention) {
        setError(res.error || "Failed to save intervention.");
      } else {
        if (onInterventionSaved) {
          onInterventionSaved(res.intervention);
        }
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-black/10 shadow-2xl max-w-lg w-full p-6 sm:p-8 text-neutral-900 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-900 p-1 rounded-full transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-100 text-[10px] font-semibold text-neutral-700 tracking-wide uppercase mb-2">
            Pedagogical Override
          </div>
          <h3 className="text-xl font-bold tracking-tight text-neutral-900">
            Assign Learning Intervention
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            Override the system default and assign a targeted lesson, practice, or assessment for{" "}
            <span className="font-semibold text-neutral-900">{studentName}</span>.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Target Concept Select */}
          <div>
            <label htmlFor="targetConcept" className="block font-semibold text-neutral-800 mb-1">
              Target Concept
            </label>
            <select
              id="targetConcept"
              value={targetConceptId}
              onChange={(e) => setTargetConceptId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-hidden focus:ring-2 focus:ring-black/20 text-neutral-900 bg-white"
            >
              {Object.values(CONCEPTS).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.order}. {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Action Type Select */}
          <div>
            <label className="block font-semibold text-neutral-800 mb-1.5">
              Assigned Activity Type
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setRecommendedAction("learn")}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  recommendedAction === "learn"
                    ? "bg-black text-white border-black shadow-xs font-semibold"
                    : "bg-neutral-50 text-neutral-600 border-black/5 hover:bg-neutral-100"
                }`}
              >
                <BookOpen className="w-4 h-4 mx-auto mb-1 opacity-80" />
                <span className="block text-[11px]">Lesson</span>
              </button>

              <button
                type="button"
                onClick={() => setRecommendedAction("practice")}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  recommendedAction === "practice"
                    ? "bg-black text-white border-black shadow-xs font-semibold"
                    : "bg-neutral-50 text-neutral-600 border-black/5 hover:bg-neutral-100"
                }`}
              >
                <PenTool className="w-4 h-4 mx-auto mb-1 opacity-80" />
                <span className="block text-[11px]">Guided Practice</span>
              </button>

              <button
                type="button"
                onClick={() => setRecommendedAction("assessment")}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  recommendedAction === "assessment"
                    ? "bg-black text-white border-black shadow-xs font-semibold"
                    : "bg-neutral-50 text-neutral-600 border-black/5 hover:bg-neutral-100"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 mx-auto mb-1 opacity-80" />
                <span className="block text-[11px]">Quiz Check</span>
              </button>
            </div>
          </div>

          {/* Teacher Notes */}
          <div>
            <label htmlFor="notes" className="block font-semibold text-neutral-800 mb-1">
              Teacher Note to Learner (Optional)
            </label>
            <textarea
              id="notes"
              rows={3}
              maxLength={300}
              placeholder="e.g. Please review the visual LCM factor tree example before class tomorrow."
              value={teacherNotes}
              onChange={(e) => setTeacherNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-hidden focus:ring-2 focus:ring-black/20 text-neutral-900 bg-white resize-none"
            />
            <span className="text-[10px] text-neutral-400 text-right block mt-0.5">
              {teacherNotes.length}/300 characters
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl border-black/10 text-xs px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-black text-white hover:bg-neutral-800 text-xs px-5 font-semibold"
            >
              {isPending ? (
                "Saving..."
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  Assign Activity
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
