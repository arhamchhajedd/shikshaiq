import { z } from "zod";

/**
 * Canonical production origin used when `NEXT_PUBLIC_SITE_URL` is not set.
 * Every canonical URL, sitemap entry, Open Graph URL and JSON-LD `@id` is
 * derived from a single origin so search engines never see conflicting hosts.
 */
export const DEFAULT_SITE_URL = "https://shikshaiq.vercel.app";

const siteUrlSchema = z
  .url({ protocol: /^https?$/ })
  .transform((value) => value.replace(/\/+$/, ""));

/**
 * Resolves the public site origin from an untrusted environment value.
 * Invalid or missing values fall back to {@link DEFAULT_SITE_URL} instead of
 * crashing the build, because a broken canonical host is worse than the
 * documented production default.
 *
 * @param rawValue - Value of `NEXT_PUBLIC_SITE_URL` (may be undefined).
 * @returns Absolute origin without a trailing slash.
 */
export function resolveSiteUrl(rawValue: string | undefined): string {
  const parsed = siteUrlSchema.safeParse(rawValue?.trim());
  return parsed.success ? parsed.data : DEFAULT_SITE_URL;
}

/** Brand and positioning facts shared by metadata, structured data and llms.txt. */
export const SITE = {
  name: "ShikshaIQ",
  url: resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  tagline: "One classroom. Different learners. Personalized learning for everyone.",
  defaultTitle: "ShikshaIQ — Adaptive Learning for NCERT Class 7 Maths Fractions",
  description:
    "ShikshaIQ is an adaptive learning platform for Indian schools. A diagnostic assessment finds the exact prerequisite gap behind each student's struggle with NCERT Class 7 Fractions, then guides lessons, practice and a Socratic AI tutor in English, Hindi and Marathi.",
  locale: "en_IN",
  language: "en-IN",
  /** Languages offered by the AI tutor (BCP 47). Lesson content is English. */
  tutorLanguages: ["en", "hi", "mr"],
  keywords: [
    "ShikshaIQ",
    "adaptive learning platform India",
    "NCERT Class 7 maths fractions",
    "CBSE Class 7 fractions",
    "fractions diagnostic test",
    "equivalent fractions Class 7",
    "adding fractions unlike denominators",
    "mixed fractions word problems",
    "LCM for fractions",
    "personalized learning for students",
    "Socratic AI maths tutor",
    "teacher classroom analytics",
    "offline learning app for schools",
  ],
  /**
   * ISO date of the last meaningful public-content change. Used as sitemap
   * `lastModified` so crawlers get an honest freshness signal instead of the
   * build time. Update when public pages or curriculum content change.
   */
  contentLastUpdated: "2026-11-05",
} as const;

/**
 * Builds an absolute URL on the canonical origin.
 *
 * @param path - Root-relative path such as `/faq` (defaults to `/`).
 */
export function absoluteUrl(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return normalized === "/" ? SITE.url : `${SITE.url}${normalized}`;
}

