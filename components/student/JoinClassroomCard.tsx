"use client";

import React, { useState, useTransition } from "react";
import { School, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { enrollInClassroomAction } from "@/lib/classroom/classroomActions";

interface JoinClassroomCardProps {
  onEnrolled?: () => void;
}

export function JoinClassroomCard({ onEnrolled }: JoinClassroomCardProps) {
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const trimmed = joinCode.trim().toUpperCase();
    if (!trimmed) {
      setError("Please enter a classroom join code.");
      return;
    }

    startTransition(async () => {
      const res = await enrollInClassroomAction(trimmed);
      if (!res.success) {
        setError(res.error || "Failed to enroll.");
      } else {
        setSuccessMsg(
          res.error // If already enrolled
            ? `You are enrolled in ${res.classroomName || "this classroom"}.`
            : `Successfully joined ${res.classroomName}!`
        );
        setJoinCode("");
        if (onEnrolled) onEnrolled();
      }
    });
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl border border-black/10 bg-neutral-50/70 shadow-xs mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white border border-black/10 flex items-center justify-center shrink-0 shadow-xs">
            <School className="w-5 h-5 text-neutral-800" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
              Join a Teacher&apos;s Classroom Cohort
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Enter the 6-character code provided by your mathematics teacher to connect your diagnostic learning journey.
            </p>
          </div>
        </div>

        <form onSubmit={handleEnroll} className="flex items-center gap-2 self-start md:self-auto">
          <input
            type="text"
            maxLength={10}
            placeholder="e.g. 7K2Q8X"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            className="w-32 px-3 py-2 text-xs font-mono font-bold tracking-widest text-center uppercase rounded-xl border border-black/10 bg-white focus:outline-hidden focus:ring-2 focus:ring-black/20 text-neutral-900"
          />
          <Button
            type="submit"
            disabled={isPending || !joinCode.trim()}
            size="sm"
            className="rounded-xl bg-black text-white hover:bg-neutral-800 text-xs px-4 font-semibold"
          >
            {isPending ? (
              "Joining..."
            ) : (
              <>
                <span>Join</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </>
            )}
          </Button>
        </form>
      </div>

      {error && (
        <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
    </div>
  );
}
