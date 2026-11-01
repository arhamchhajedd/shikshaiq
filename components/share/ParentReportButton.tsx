"use client";

import React, { useState } from "react";
import { Share2, Check, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ParentReportButtonProps {
  studentName?: string;
  overallAccuracy?: number | null;
  stars?: number;
  maxStars?: number;
  streak?: number;
  masteredCount?: number;
  totalConcepts?: number;
  badgesCount?: number;
  recommendedConcept?: string;
  className?: string;
}

export function ParentReportButton({
  studentName = "Student",
  overallAccuracy = null,
  stars = 0,
  maxStars = 15,
  streak = 0,
  masteredCount = 0,
  totalConcepts = 5,
  badgesCount = 0,
  recommendedConcept = "Fraction Basics",
  className = "",
}: ParentReportButtonProps) {
  const [copied, setCopied] = useState(false);

  const generateReportMessage = () => {
    return [
      `📚 *ShikshaIQ Learning Progress Report*`,
      `Student: *${studentName}*`,
      `Subject: NCERT Class 7 Mathematics (Fractions)`,
      `---------------------------------`,
      overallAccuracy !== null ? `📊 Overall Accuracy: *${overallAccuracy}%*` : null,
      `⭐ Curriculum Stars: *${stars} / ${maxStars}*`,
      streak > 0 ? `🔥 Learning Streak: *${streak} ${streak === 1 ? "Day" : "Days"}*` : null,
      `✅ Mastered Concepts: *${masteredCount} / ${totalConcepts}*`,
      badgesCount > 0 ? `🏅 Badges Earned: *${badgesCount}* (including Root Gap Healer)` : null,
      `🎯 Current Practice Focus: *${recommendedConcept}*`,
      `---------------------------------`,
      `Verified on ShikshaIQ Adaptive Engine.`,
    ]
      .filter(Boolean)
      .join("\n");
  };

  const handleShare = async () => {
    const text = generateReportMessage();

    // 1. Copy to clipboard
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 3500);
      }
    } catch {
      // Fallback
    }

    // 2. Open WhatsApp share if on mobile or supported
    if (typeof window !== "undefined") {
      const encoded = encodeURIComponent(text);
      window.open(`https://wa.me/?text=${encoded}`, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className={`text-xs border-black/10 bg-white hover:bg-neutral-50 text-neutral-800 rounded-xl px-3.5 py-2 flex items-center gap-2 shadow-2xs transition-all active:scale-[0.98] ${className}`}
      title="Share learning report with parents via WhatsApp or clipboard"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
          <span className="text-emerald-700 font-semibold">Report Copied & Opened!</span>
        </>
      ) : (
        <>
          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
          <span>WhatsApp Parent Report</span>
          <Share2 className="w-3 h-3 text-neutral-400 ml-0.5" />
        </>
      )}
    </Button>
  );
}
