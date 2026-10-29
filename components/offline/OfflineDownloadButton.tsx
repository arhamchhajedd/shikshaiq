"use client";

import React, { useEffect, useState } from "react";
import { Download, CheckCircle2, RefreshCw } from "lucide-react";
import { ConceptId } from "@/types/curriculum";
import { syncManager } from "@/lib/offline/syncManager";
import { Button } from "@/components/ui/Button";

interface OfflineDownloadButtonProps {
  conceptId: ConceptId;
  onCached?: () => void;
}

export function OfflineDownloadButton({
  conceptId,
  onCached,
}: OfflineDownloadButtonProps) {
  const [isCached, setIsCached] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    syncManager.isConceptCachedLocally(conceptId).then((cached) => {
      if (!ignore) setIsCached(cached);
    });
    return () => {
      ignore = true;
    };
  }, [conceptId]);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDownloading) return;
    setIsDownloading(true);
    setFeedback(null);

    try {
      const res = await syncManager.cacheCurriculumConcept(conceptId);
      setIsCached(true);
      setIsDownloading(false);
      setFeedback(`Downloaded (${res.questionsCount} questions)`);
      if (onCached) onCached();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: unknown) {
      setIsDownloading(false);
      setFeedback("Download failed");
      console.error("Cache concept error:", err);
    }
  };

  if (isCached && !feedback) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-800 border border-black/5 text-[11px] font-medium">
        <CheckCircle2 className="w-3.5 h-3.5 text-neutral-700" />
        <span>Available Offline</span>
      </span>
    );
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={isDownloading}
      className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 h-auto rounded-full bg-white text-neutral-800 border border-black/10 hover:bg-neutral-50 active:scale-[0.98] transition-all shadow-sm"
    >
      {isDownloading ? (
        <>
          <RefreshCw className="w-3 h-3 animate-spin text-neutral-500" />
          <span>Caching...</span>
        </>
      ) : feedback ? (
        <>
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>{feedback}</span>
        </>
      ) : (
        <>
          <Download className="w-3 h-3 text-neutral-600" />
          <span>Save for Offline</span>
        </>
      )}
    </Button>
  );
}
