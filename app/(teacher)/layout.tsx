import type { Metadata } from "next";
import { buildPrivateMetadata } from "@/lib/seo/metadata";

/** Authenticated teacher area with classroom rosters and student analytics; never indexed. */
export const metadata: Metadata = buildPrivateMetadata("Teacher Copilot");

export default function TeacherGroupLayout({ children }: { children: React.ReactNode }) {
  return children;
}

