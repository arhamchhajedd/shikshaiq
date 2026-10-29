"use client";

import React, { useState } from "react";
import { Plus, Users, Key, Copy, Check, School } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ClassroomWithStudentCount } from "@/types/classroom";

interface ClassroomSelectorProps {
  classrooms: ClassroomWithStudentCount[];
  selectedClassroomId: string | null;
  onSelectClassroom: (classroomId: string) => void;
  onOpenCreateModal: () => void;
}

export function ClassroomSelector({
  classrooms,
  selectedClassroomId,
  onSelectClassroom,
  onOpenCreateModal,
}: ClassroomSelectorProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const selectedClass = classrooms.find((c) => c.id === selectedClassroomId) || classrooms[0];

  return (
    <div className="w-full bg-white border border-black/10 rounded-3xl p-5 sm:p-6 shadow-xs mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-black/5">
        <div>
          <span className="text-[10px] font-semibold tracking-wider uppercase text-neutral-400 block mb-1">
            Teaching Cohorts
          </span>
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <School className="w-4 h-4 text-neutral-700" />
            Classroom Overview
          </h2>
        </div>

        <Button
          type="button"
          onClick={onOpenCreateModal}
          size="sm"
          className="rounded-xl bg-black text-white hover:bg-neutral-800 text-xs font-semibold px-4 flex items-center gap-1.5 self-start lg:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Classroom Cohort</span>
        </Button>
      </div>

      {classrooms.length === 0 ? (
        <div className="py-8 text-center text-xs text-neutral-500">
          You haven&apos;t created any classroom cohorts yet. Click &quot;New Classroom Cohort&quot; to begin.
        </div>
      ) : (
        <div className="pt-4">
          {/* TABS OF CLASSROOMS */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {classrooms.map((c) => {
              const isSelected = c.id === (selectedClass?.id || selectedClassroomId);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelectClassroom(c.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-medium transition-all shrink-0 flex items-center gap-2 border ${
                    isSelected
                      ? "bg-black text-white border-black shadow-xs font-semibold"
                      : "bg-neutral-50 text-neutral-600 border-black/5 hover:bg-neutral-100 hover:text-black"
                  }`}
                >
                  <span>{c.name}</span>
                  {c.section && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-neutral-800 text-neutral-300"
                          : "bg-neutral-200/60 text-neutral-600"
                      }`}
                    >
                      {c.section}
                    </span>
                  )}
                  <span
                    className={`text-[11px] font-mono ${
                      isSelected ? "text-neutral-400" : "text-neutral-400"
                    }`}
                  >
                    ({c.studentCount})
                  </span>
                </button>
              );
            })}
          </div>

          {/* ACTIVE CLASSROOM META STRIP */}
          {selectedClass && (
            <div className="mt-4 p-4 rounded-2xl bg-neutral-50/80 border border-black/5 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wide block">
                    Curriculum Subject
                  </span>
                  <span className="font-semibold text-neutral-800">
                    {selectedClass.subject} (Class {selectedClass.gradeLevel})
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wide block">
                    Enrolled Students
                  </span>
                  <span className="font-semibold text-neutral-800 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-neutral-500" />
                    {selectedClass.studentCount} {selectedClass.studentCount === 1 ? "student" : "students"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wide block">
                    Active Learners
                  </span>
                  <span className="font-semibold text-neutral-800">
                    {selectedClass.activeLearnersCount} with assessment data
                  </span>
                </div>
              </div>

              {/* JOIN CODE PILL */}
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-black/10 shadow-xs">
                <Key className="w-3.5 h-3.5 text-neutral-500" />
                <span className="text-[11px] text-neutral-500">Student Join Code:</span>
                <span className="font-mono font-bold text-neutral-900 tracking-wider">
                  {selectedClass.joinCode}
                </span>
                <button
                  type="button"
                  onClick={(e) => handleCopyCode(e, selectedClass.joinCode)}
                  className="ml-1 p-1 text-neutral-400 hover:text-black transition-colors"
                  title="Copy student join code"
                >
                  {copiedCode === selectedClass.joinCode ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
