import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegistration } from "@/components/offline/ServiceWorkerRegistration";
import { JsonLd } from "@/components/seo/JsonLd";

export const viewport: Viewport = {
  themeColor: "#000000",
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shikshaiq.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ShikshaIQ | Adaptive Mathematics Learning Platform",
    template: "%s | ShikshaIQ",
  },
  description:
    "One classroom. Different learners. Personalized learning for everyone. Aligned with NCERT Class 7 Fractions and Decimals with deterministic prerequisite bottleneck tracing and Socratic AI tutoring.",
  manifest: "/manifest.webmanifest",
  keywords: [
    "ShikshaIQ",
    "Adaptive Learning",
    "NCERT Class 7 Fractions",
    "Mathematics Learning",
    "Prerequisite Bottleneck Tracing",
    "Socratic AI Tutor",
    "Offline Learning",
    "Formative Assessment",
  ],
  authors: [{ name: "ShikshaIQ Team" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    title: "ShikshaIQ | Adaptive Mathematics Learning Platform",
    description:
      "Deterministic DAG concept mastery and Socratic AI tutoring for Indian school students. Aligned with NCERT Class 7 Fractions.",
    siteName: "ShikshaIQ",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShikshaIQ | Adaptive Mathematics Learning Platform",
    description:
      "Deterministic DAG concept mastery and Socratic AI tutoring for Indian school students.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const globalSoftwareAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ShikshaIQ",
  operatingSystem: "Web Browser (Chrome, Safari, Edge, Firefox, Android, iOS)",
  applicationCategory: "EducationalApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
  },
  description:
    "Adaptive diagnostic assessment and concept mastery platform for Indian school mathematics, featuring deterministic DAG tracing, offline resilience, and multilingual Socratic AI.",
  author: {
    "@type": "Organization",
    name: "ShikshaIQ",
    url: siteUrl,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <JsonLd data={globalSoftwareAppJsonLd} />
      </head>
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
