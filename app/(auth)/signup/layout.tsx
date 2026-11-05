import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Create Your Account",
  description:
    "Create a ShikshaIQ account. Students start a Class 7 Fractions diagnostic straight away; teacher accounts are activated after school administrator approval.",
  path: "/signup",
});

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
