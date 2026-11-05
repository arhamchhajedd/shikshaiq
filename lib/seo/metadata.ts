import type { Metadata } from "next";
import { SITE } from "./site";

/** Input for {@link buildPageMetadata}. */
export interface PageMetadataInput {
  /** Page-specific title; the root layout template appends "| ShikshaIQ". */
  title: string;
  /** Use the title verbatim, bypassing the template (home page only). */
  absoluteTitle?: boolean;
  /** 120–160 character summary written for searchers, not keyword lists. */
  description: string;
  /** Root-relative canonical path, e.g. `/faq`. */
  path: string;
  /** Optional page-specific keywords; replaces the site-wide list for this page. */
  keywords?: readonly string[];
  /** Open Graph object type. Articles get `article`, everything else `website`. */
  openGraphType?: "website" | "article";
}

/**
 * Builds complete, consistent metadata for an indexable public page.
 *
 * Next.js merges metadata shallowly, so a child that sets `openGraph` replaces
 * the parent's object entirely. This helper always emits the full Open Graph
 * and Twitter objects (site name, locale, URL) to avoid silently losing fields.
 * Social images come from the `opengraph-image`/`twitter-image` file
 * conventions in `app/`, which Next.js applies to every route.
 */
export function buildPageMetadata({
  title,
  absoluteTitle = false,
  description,
  path,
  keywords,
  openGraphType = "website",
}: PageMetadataInput): Metadata {
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    ...(keywords ? { keywords: [...keywords] } : {}),
    alternates: { canonical: path },
    openGraph: {
      type: openGraphType,
      url: path,
      siteName: SITE.name,
      locale: SITE.locale,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/**
 * Metadata for authenticated or transactional pages. They keep a useful
 * browser-tab title but are excluded from search indexes and link equity.
 *
 * @param title - Browser tab title (template appends the brand).
 */
export function buildPrivateMetadata(title: string): Metadata {
  return {
    title,
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: { index: false, follow: false },
    },
  };
}
