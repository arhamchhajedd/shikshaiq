"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  UserX,
} from "lucide-react";
import { ClassroomStudent } from "@/types/classroom";
import { Button } from "@/components/ui/Button";

interface StudentRosterTableProps {
  students: ClassroomStudent[];
  classroomId: string;
  onOpenInterventionModal: (student: { id: string; name: string }) => void;
  onRemoveStudent?: (studentId: string) => void;
}

export function StudentRosterTable({
  students,
  classroomId,
  onOpenInterventionModal,
  onRemoveStudent,
}: StudentRosterTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = students.filter(
    (s) =>
      s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      data-classroom-id={classroomId}
      className="bg-white border border-black/10 rounded-3xl p-6 shadow-xs mb-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5">
        <div>
          <span className="text-[10px] font-semibold tracking-wider uppercase text-neutral-400 block mb-0.5">
            Supervised Roster
          </span>
          <h3 className="text-base font-bold text-neutral-900 tracking-tight">
            Enrolled Students ({students.length})
          </h3>
        </div>

        {/* SEARCH BAR */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-black/10 focus:outline-hidden focus:ring-2 focus:ring-black/20 text-neutral-900 bg-neutral-50"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-10 text-center text-xs text-neutral-500">
          {searchQuery
            ? "No students match your search query."
            : "No students currently enrolled in this classroom."}
        </div>
      ) : (
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/5 text-neutral-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-semibold">Student</th>
                <th className="pb-3 font-semibold">Grade</th>
                <th className="pb-3 font-semibold">Latest Activity</th>
                <th className="pb-3 font-semibold">Concept Mastery</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filtered.map((s) => (
                <tr key={s.studentId} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="py-3.5">
                    <span className="font-semibold text-neutral-900 block">{s.studentName}</span>
                    <span className="text-[11px] text-neutral-400 font-mono">{s.studentEmail}</span>
                  </td>

                  <td className="py-3.5 text-neutral-600">
                    {s.gradeLevel ? `Class ${s.gradeLevel}` : "Class 7"}
                  </td>

                  <td className="py-3.5">
                    {s.latestActivityAt ? (
                      <span className="text-[11px] text-neutral-600 font-mono">
                        {new Date(s.latestActivityAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    ) : (
                      <span className="text-[11px] text-neutral-400">No attempts yet</span>
                    )}
                  </td>

                  <td className="py-3.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {s.masteredConceptsCount > 0 && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-medium border border-emerald-200/60">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          {s.masteredConceptsCount} M
                        </span>
                      )}
                      {s.partialCount > 0 && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-medium border border-amber-200/60">
                          <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                          {s.partialCount} P
                        </span>
                      )}
                      {s.needsRevisionCount > 0 && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 text-[10px] font-medium border border-rose-200/60">
                          <XCircle className="w-2.5 h-2.5 text-rose-600" />
                          {s.needsRevisionCount} R
                        </span>
                      )}
                      {s.notStartedCount > 0 && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-500 text-[10px] font-medium border border-black/5">
                          <Clock className="w-2.5 h-2.5 text-neutral-400" />
                          {s.notStartedCount} NS
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onOpenInterventionModal({ id: s.studentId, name: s.studentName })
                        }
                        className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors text-xs flex items-center gap-1"
                        title="Assign Pedagogical Intervention"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span className="hidden lg:inline text-[11px] font-medium">Intervene</span>
                      </button>

                      <Link href={`/teacher/students/${s.studentId}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl border-black/10 text-[11px] font-semibold px-3 py-1 flex items-center gap-1 hover:bg-neutral-50"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>

                      {onRemoveStudent && (
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              confirm(
                                `Are you sure you want to remove ${s.studentName} from this classroom?`
                              )
                            ) {
                              onRemoveStudent(s.studentId);
                            }
                          }}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove from classroom"
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
