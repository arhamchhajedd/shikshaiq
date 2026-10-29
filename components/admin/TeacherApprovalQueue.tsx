"use client";

import React, { useState, useTransition } from "react";
import { UserCheck, XCircle, Clock, Check, X } from "lucide-react";
import { UserProfile } from "@/types/auth";
import { Button } from "@/components/ui/Button";
import { approveTeacherAction, rejectTeacherAction } from "@/lib/admin/adminActions";

interface TeacherApprovalQueueProps {
  pendingTeachers: UserProfile[];
  onActionComplete: () => void;
}

export function TeacherApprovalQueue({
  pendingTeachers,
  onActionComplete,
}: TeacherApprovalQueueProps) {
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleApprove = (teacherId: string) => {
    setError(null);
    startTransition(async () => {
      const res = await approveTeacherAction(teacherId);
      if (!res.success) {
        setError(res.error || "Approval failed.");
      } else {
        onActionComplete();
      }
    });
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingId) return;

    setError(null);
    startTransition(async () => {
      const res = await rejectTeacherAction({
        teacherId: rejectingId,
        rejectionReason: rejectionReason.trim(),
      });

      if (!res.success) {
        setError(res.error || "Rejection failed.");
      } else {
        setRejectingId(null);
        setRejectionReason("");
        onActionComplete();
      }
    });
  };

  if (pendingTeachers.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-neutral-500 bg-neutral-50/50 rounded-2xl border border-black/5">
        <Check className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
        No pending teacher verification requests. All educators are vetted.
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
          {error}
        </div>
      )}

      <div className="divide-y divide-black/5">
        {pendingTeachers.map((teacher) => (
          <div
            key={teacher.id}
            className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-900 text-xs">{teacher.fullName}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <Clock className="w-2.5 h-2.5 text-amber-600" />
                  Pending Approval
                </span>
              </div>

              <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                {teacher.email}
                {teacher.schoolName && ` • ${teacher.schoolName}`}
              </div>

              <span className="text-[10px] text-neutral-400 mt-1 block">
                Requested on {new Date(teacher.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <Button
                size="sm"
                disabled={isPending}
                onClick={() => handleApprove(teacher.id)}
                className="rounded-xl bg-black text-white hover:bg-neutral-800 text-xs font-semibold px-3 py-1.5 flex items-center gap-1"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Approve</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                disabled={isPending}
                onClick={() => {
                  setRejectingId(teacher.id);
                  setRejectionReason("");
                }}
                className="rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 text-xs px-3 py-1.5 flex items-center gap-1"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* REJECTION REASON MODAL */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-black/10 shadow-2xl max-w-md w-full p-6 text-neutral-900 relative">
            <button
              type="button"
              onClick={() => setRejectingId(null)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-black p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-neutral-900">Reject Teacher Access Request</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Please specify the legitimate institutional rationale for rejecting this teacher application.
            </p>

            <form onSubmit={handleRejectSubmit} className="mt-4 space-y-3">
              <textarea
                required
                rows={3}
                minLength={5}
                maxLength={250}
                placeholder="e.g. Institutional domain unverified or duplicate registration."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-black/10 text-neutral-900 bg-neutral-50 focus:outline-hidden focus:ring-2 focus:ring-black/20 resize-none"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRejectingId(null)}
                  className="rounded-xl border-black/10 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || rejectionReason.trim().length < 5}
                  size="sm"
                  className="rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-xs font-semibold"
                >
                  {isPending ? "Submitting..." : "Confirm Rejection"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
