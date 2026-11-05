import { CONCEPTS_LIST } from "../curriculum/concepts";

/** How often a public page is expected to change (sitemap hint). */
export type ChangeFrequency = "weekly" | "monthly" | "yearly";

/** A crawlable, indexable public route. */
export interface PublicRoute {
  path: string;
  changeFrequency: ChangeFrequency;
  /** Relative importance within this site only (0.0–1.0). */
  priority: number;
}

/** Root-relative path of the public page for a curriculum concept. */
export function conceptPagePath(conceptId: string): string {
  return `/curriculum/${conceptId}`;
}

/**
 * Single source of truth for every indexable route. The sitemap, llms.txt and
 * tests all read from this list so a new public page cannot be forgotten in one
 * place and listed in another.
 */
export const PUBLIC_ROUTES: readonly PublicRoute[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/curriculum", changeFrequency: "monthly", priority: 0.9 },
  ...CONCEPTS_LIST.map(
    (concept): PublicRoute => ({
      path: conceptPagePath(concept.id),
      changeFrequency: "monthly",
      priority: 0.8,
    })
  ),
  { path: "/faq", changeFrequency: "monthly", priority: 0.8 },
  { path: "/about", changeFrequency: "yearly", priority: 0.7 },
  { path: "/signup", changeFrequency: "yearly", priority: 0.5 },
  { path: "/login", changeFrequency: "yearly", priority: 0.3 },
];

/**
 * Authenticated or transactional route prefixes. These must never appear in
 * search results: they hold minors' learning data, redirect to `/login` when
 * signed out, or are one-time auth flows. They receive an `X-Robots-Tag:
 * noindex` header and `noindex` metadata. They are intentionally *not*
 * disallowed in robots.txt (except `/api/`), because a disallowed URL cannot be
 * fetched, so crawlers would never see the `noindex` directive.
 */
export const PRIVATE_ROUTE_PREFIXES = [
  "/student",
  "/teacher",
  "/admin",
  "/pending-approval",
  "/auth",
] as const;

/** Machine endpoints that crawlers should not request at all. */
export const CRAWL_DISALLOWED_PREFIXES = ["/api/"] as const;

