"use client";

import React from "react";
import { Shield, Clock } from "lucide-react";
import { AuditLogEntry } from "@/types/admin";

interface AdminAuditTimelineProps {
  logs: AuditLogEntry[];
}

export function AdminAuditTimeline({ logs }: AdminAuditTimelineProps) {
  if (logs.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-neutral-500 bg-neutral-50/50 rounded-2xl border border-black/5">
        No platform audit logs recorded yet.
      </div>
    );
  }

  return (
    <div className="divide-y divide-black/5">
      {logs.map((log) => {
        const actionLabel =
          log.action === "approve_teacher"
            ? "Approved Teacher Account"
            : log.action === "reject_teacher"
            ? "Rejected Teacher Account"
            : log.action === "suspend_user"
            ? "Suspended User Access"
            : log.action === "restore_user"
            ? "Restored User Access"
            : log.action === "create_intervention"
            ? "Created Teacher Override"
            : log.action === "create_classroom"
            ? "Created Classroom Cohort"
            : log.action.replace(/_/g, " ").toUpperCase();

        return (
          <div key={log.id} className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-start justify-between gap-2 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-neutral-100 border border-black/5 flex items-center justify-center shrink-0 mt-0.5">
                <Shield className="w-3.5 h-3.5 text-neutral-700" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-neutral-900">{actionLabel}</span>
                  <span className="text-[10px] text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded-md font-mono">
                    by {log.actorName}
                  </span>
                </div>

                {log.details && Object.keys(log.details).length > 0 && (
                  <p className="text-[11px] text-neutral-600 mt-1 font-mono">
                    {JSON.stringify(log.details)}
                  </p>
                )}
              </div>
            </div>

            <div className="text-[11px] text-neutral-400 font-mono flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3 text-neutral-400" />
              <span>{new Date(log.createdAt).toLocaleString("en-IN")}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
