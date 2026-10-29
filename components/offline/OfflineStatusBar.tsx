"use client";

import React, { useEffect, useState } from "react";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { syncManager } from "@/lib/offline/syncManager";
import { getPendingAttemptsForUser } from "@/lib/offline/indexedDb";
import { Button } from "@/components/ui/Button";

interface OfflineStatusBarProps {
  userId?: string;
  onSyncComplete?: () => void;
}

export function OfflineStatusBar({ userId, onSyncComplete }: OfflineStatusBarProps) {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof window !== "undefined" ? syncManager.getOnlineStatus() : true
  );
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [showSyncedBanner, setShowSyncedBanner] = useState<boolean>(false);

  useEffect(() => {
    const activeUid = userId || syncManager.getActiveUser();
    if (activeUid) {
      getPendingAttemptsForUser(activeUid).then((list) => {
        setPendingCount(list.length);
      });
    }

    const unsubscribe = syncManager.subscribe((state) => {
      setIsOnline(state.isOnline);
      setPendingCount(state.pendingCount);
      setIsSyncing(state.isSyncing);
      setLastSyncAt(state.lastSyncAt);
      setLastError(state.lastError);

      if (!state.isSyncing && state.lastSyncAt && state.pendingCount === 0) {
        setShowSyncedBanner(true);
        const timer = setTimeout(() => setShowSyncedBanner(false), 4000);
        return () => clearTimeout(timer);
      }
    });

    return unsubscribe;
  }, [userId]);

  const handleManualSync = async () => {
    const targetUid = userId || syncManager.getActiveUser();
    if (!targetUid || isSyncing || !isOnline) return;
    try {
      await syncManager.syncPendingAttempts(targetUid);
      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch {
      // Error handled by syncManager state
    }
  };

  // If online with 0 pending attempts and no banner, keep minimal/hidden to avoid clutter
  if (isOnline && pendingCount === 0 && !showSyncedBanner && !lastError) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full bg-neutral-50/90 border-b border-black/5 px-4 py-2.5 backdrop-blur-sm transition-all"
    >
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          {!isOnline ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/60 font-medium">
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
              <span>Offline Mode</span>
            </span>
          ) : isSyncing ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800 border border-black/5 font-medium">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-neutral-600" />
              <span>Synchronizing with Supabase...</span>
            </span>
          ) : showSyncedBanner ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200/60 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>All offline attempts synchronized!</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200/60 font-medium">
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span>Online</span>
            </span>
          )}

          <div className="text-neutral-600">
            {!isOnline ? (
              <span>
                Previously cached lessons and questions can be accessed. Practice attempts will queue locally.
              </span>
            ) : pendingCount > 0 ? (
              <span>
                <strong className="text-neutral-900 font-semibold">{pendingCount}</strong> offline{" "}
                {pendingCount === 1 ? "attempt" : "attempts"} pending server validation.
              </span>
            ) : lastSyncAt ? (
              <span className="text-neutral-400">
                Last synced {new Date(lastSyncAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            ) : null}
          </div>
        </div>

        {/* Action button */}
        {isOnline && pendingCount > 0 && (
          <div className="flex items-center gap-2">
            {lastError && (
              <span className="text-[11px] text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>Sync delayed</span>
              </span>
            )}
            <Button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="bg-black hover:bg-neutral-800 text-white rounded-lg text-xs font-medium px-3 py-1.5 h-auto transition-transform active:scale-[0.98]"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin mr-1.5" />
                  Syncing...
                </>
              ) : (
                "Sync Now"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
