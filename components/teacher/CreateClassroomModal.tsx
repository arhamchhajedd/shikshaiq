"use client";

import React, { useState, useTransition } from "react";
import { X, Plus, Copy, Check, School } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClassroomAction } from "@/lib/classroom/classroomActions";
import { Classroom } from "@/types/classroom";

interface CreateClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClassroomCreated: (newClass: Classroom) => void;
}

export function CreateClassroomModal({
  isOpen,
  onClose,
  onClassroomCreated,
}: CreateClassroomModalProps) {
  const [name, setName] = useState("");
  const [section, setSection] = useState("");
  const [gradeLevel] = useState(7);
  const [subject] = useState("Mathematics");
  const [error, setError] = useState<string | null>(null);
  const [createdClassroom, setCreatedClassroom] = useState<Classroom | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await createClassroomAction({
        name,
        gradeLevel,
        subject,
        section: section.trim() || null,
        academicYear: "2026-2027",
      });

      if (!res.success || !res.classroom) {
        setError(res.error || "Failed to create classroom.");
      } else {
        setCreatedClassroom(res.classroom);
        onClassroomCreated(res.classroom);
      }
    });
  };

  const handleCopyCode = () => {
    if (!createdClassroom) return;
    navigator.clipboard.writeText(createdClassroom.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDone = () => {
    setCreatedClassroom(null);
    setName("");
    setSection("");
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-black/10 shadow-2xl max-w-md w-full p-6 sm:p-8 text-neutral-900 relative">
        <button
          type="button"
          onClick={handleDone}
          className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-900 p-1 rounded-full transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {createdClassroom ? (
          /* SUCCESS STATE WITH JOIN CODE */
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 border border-black/5 flex items-center justify-center mx-auto mb-4">
              <School className="w-7 h-7 text-neutral-800" />
            </div>

            <h3 className="text-xl font-bold tracking-tight text-neutral-900">
              Classroom Created!
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Share this student join code with your class. Students can enter it on their dashboard to enroll in <span className="font-semibold text-neutral-800">{createdClassroom.name}</span>.
            </p>

            {/* JOIN CODE BOX */}
            <div className="mt-6 p-5 rounded-2xl bg-neutral-50 border border-black/10 flex flex-col items-center justify-center gap-2">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400">
                Student Enrollment Code
              </span>
              <div className="text-3xl font-mono font-bold tracking-widest text-neutral-900 select-all">
                {createdClassroom.joinCode}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                className="mt-2 text-xs rounded-xl border-black/10 flex items-center gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied to Clipboard</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Join Code</span>
                  </>
                )}
              </Button>
            </div>

            <Button
              type="button"
              onClick={handleDone}
              className="mt-6 w-full rounded-2xl bg-black text-white hover:bg-neutral-800 py-2.5 text-xs font-semibold"
            >
              Done & View Classroom
            </Button>
          </div>
        ) : (
          /* FORM STATE */
          <div>
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-100 text-[10px] font-semibold text-neutral-700 tracking-wide uppercase mb-2">
                New Teaching Cohort
              </div>
              <h3 className="text-xl font-bold tracking-tight text-neutral-900">
                Create a Classroom
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Configure your Class 7 Mathematics section to monitor student diagnostic gaps.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label htmlFor="className" className="block font-semibold text-neutral-800 mb-1">
                  Classroom Name *
                </label>
                <input
                  id="className"
                  type="text"
                  required
                  placeholder="e.g. Class 7-A Mathematics"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-hidden focus:ring-2 focus:ring-black/20 text-neutral-900 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="classGrade" className="block font-semibold text-neutral-800 mb-1">
                    Grade Level
                  </label>
                  <input
                    id="classGrade"
                    type="text"
                    disabled
                    value="Class 7"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/5 bg-neutral-100 text-neutral-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label htmlFor="classSection" className="block font-semibold text-neutral-800 mb-1">
                    Section (Optional)
                  </label>
                  <input
                    id="classSection"
                    type="text"
                    placeholder="e.g. Section B"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-hidden focus:ring-2 focus:ring-black/20 text-neutral-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="classSubject" className="block font-semibold text-neutral-800 mb-1">
                  Subject & Focus
                </label>
                <input
                  id="classSubject"
                  type="text"
                  disabled
                  value="Mathematics (Fractions Prerequisite DAG)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/5 bg-neutral-100 text-neutral-500 cursor-not-allowed"
                />
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
                  disabled={isPending || !name.trim()}
                  className="rounded-xl bg-black text-white hover:bg-neutral-800 text-xs px-5 font-semibold"
                >
                  {isPending ? (
                    "Creating..."
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Create & Generate Code
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
