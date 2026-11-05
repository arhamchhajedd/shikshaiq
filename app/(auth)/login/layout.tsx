import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Sign In",
  description:
    "Sign in to ShikshaIQ to continue your Class 7 Fractions learning path, view classroom analytics as a teacher, or manage your school as an administrator.",
  path: "/login",
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}

