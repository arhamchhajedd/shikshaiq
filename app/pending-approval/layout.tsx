import type { Metadata } from "next";
import { buildPrivateMetadata } from "@/lib/seo/metadata";

/** Holding page for teacher accounts awaiting administrator approval; never indexed. */
export const metadata: Metadata = buildPrivateMetadata("Pending Approval");

export default function PendingApprovalLayout({ children }: { children: React.ReactNode }) {
  return children;
}

