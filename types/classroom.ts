/**
 * ShikshaIQ: Classroom & Enrollment Types
 * Phase 05: Teacher Dashboard & Classroom Management
 */

import { ConceptMasteryRecord } from "@/lib/adaptive";

export interface Classroom {
  id: string;
  name: string;
  teacherId: string;
  gradeLevel: number;
  subject: string;
  section: string | null;
  academicYear: string;
  joinCode: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClassroomWithStudentCount extends Classroom {
  studentCount: number;
  activeLearnersCount: number;
}

export interface ClassroomStudent {
  classroomId: string;
  studentId: string;
  joinedAt: string;
  studentName: string;
  studentEmail: string;
  gradeLevel: number | null;
  latestActivityAt: string | null;
  masteredConceptsCount: number;
  needsRevisionCount: number;
  partialCount: number;
  notStartedCount: number;
  conceptRecords?: Record<string, ConceptMasteryRecord>;
}

export interface CreateClassroomInput {
  name: string;
  gradeLevel: number;
  subject?: string;
  section?: string | null;
  academicYear?: string;
}

export interface UpdateClassroomInput {
  name?: string;
  section?: string | null;
  isArchived?: boolean;
}
