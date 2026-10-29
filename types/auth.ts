export type UserRole = "student" | "teacher" | "admin";

export type AccountStatus = "active" | "pending_approval" | "suspended";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  accountStatus: AccountStatus;
  gradeLevel?: number | null;
  schoolName?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: {
    id: string;
    email: string;
  };
  profile: UserProfile | null;
}
