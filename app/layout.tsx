import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "ShikshaIQ | Adaptive Learning Platform",
  description:
    "One classroom. Different learners. Personalized learning for everyone. Adaptive diagnostic assessments and concept mastery for Indian school students.",
  manifest: "/manifest.webmanifest",
};
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { ServiceWorkerRegistration } from "@/components/offline/ServiceWorkerRegistration";



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
