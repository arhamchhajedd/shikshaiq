import type { Metadata } from "next";
import { buildPrivateMetadata } from "@/lib/seo/metadata";

/** One-time auth flows (callback, forgot/reset password) with no search value; never indexed. */
export const metadata: Metadata = buildPrivateMetadata("Account Recovery");

export default function AuthFlowLayout({ children }: { children: React.ReactNode }) {
  return children;
}

