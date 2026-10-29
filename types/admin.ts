/**
 * ShikshaIQ: Administrator & Platform Oversight Types
 * Phase 05: Admin Panel, Audit Trail & User Management
 */

import { UserRole, AccountStatus } from "@/types/auth";

export interface AdminMetrics {
  totalUsers: number;
  studentCount: number;
  teacherCount: number;
  adminCount: number;
  pendingTeacherApprovals: number;
  totalClassrooms: number;
  totalAttemptsLogged: number;
  totalCurriculumQuestions: number;
}

export type AuditAction =
  | "approve_teacher"
  | "reject_teacher"
  | "suspend_user"
  | "restore_user"
  | "create_classroom"
  | "archive_classroom"
  | "delete_classroom"
  | "create_intervention"
  | "dismiss_intervention";

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  action: AuditAction;
  targetId: string | null;
  targetName?: string;
  details: Record<string, unknown>;
  createdAt: string;
}

export interface UserManagementFilter {
  searchQuery?: string;
  role?: UserRole | "all";
  status?: AccountStatus | "all";
}

export interface TeacherApprovalDecision {
  teacherId: string;
  decision: "approve" | "reject";
  rejectionReason?: string;
}
