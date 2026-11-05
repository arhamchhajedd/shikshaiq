import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegistration } from "@/components/offline/ServiceWorkerRegistration";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE } from "@/lib/seo/site";
import {
  buildGraph,
  buildOrganizationNode,
  buildWebsiteNode,
} from "@/lib/seo/structuredData";

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "light",
};

/**
 * Optional search-console ownership tokens. Set them in the hosting
 * environment; when absent, no verification tags are emitted.
 */
const siteVerification: Metadata["verification"] = {
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : {}),
  ...(process.env.BING_SITE_VERIFICATION
    ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } }
    : {}),
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.defaultTitle,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [...SITE.keywords],
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "education",
  manifest: "/manifest.webmanifest",
  // No site-wide canonical: an inherited canonical would point every page at
  // the home page. Each indexable page declares its own via buildPageMetadata.
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: SITE.locale,
    title: SITE.defaultTitle,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.defaultTitle,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  appleWebApp: {
    capable: true,
    title: SITE.name,
    statusBarStyle: "default",
  },
  verification: siteVerification,
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Site-wide entities referenced by `@id` from page-level structured data. */
const siteStructuredData = buildGraph([buildOrganizationNode(), buildWebsiteNode()]);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang={SITE.language}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <JsonLd data={siteStructuredData} />
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
