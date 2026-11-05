import type { Metadata } from "next";
import { buildPrivateMetadata } from "@/lib/seo/metadata";

/** Administrator governance console; never indexed. */
export const metadata: Metadata = buildPrivateMetadata("Admin Console");

export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  return children;
}

