import type { Metadata } from "next";
import { buildPrivateMetadata } from "@/lib/seo/metadata";

/**
 * Authenticated student area (dashboard, assessment, lessons, practice,
 * results). It holds minors' learning data, so it is never indexed.
 */
export const metadata: Metadata = buildPrivateMetadata("Student Dashboard");

export default function StudentGroupLayout({ children }: { children: React.ReactNode }) {
  return children;
}

