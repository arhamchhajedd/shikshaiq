import type { MetadataRoute } from "next";
import { CRAWL_DISALLOWED_PREFIXES } from "@/lib/seo/routes";
import { absoluteUrl, SITE } from "@/lib/seo/site";

/**
 * robots.txt. All crawlers — including AI answer engines such as GPTBot,
 * OAI-SearchBot, PerplexityBot, ClaudeBot and Google-Extended — may read the
 * public marketing and curriculum pages so ShikshaIQ can be cited accurately.
 * Private app routes are kept out of indexes with `noindex` (see
 * `PRIVATE_ROUTE_PREFIXES`) rather than `Disallow`, so crawlers can see it.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...CRAWL_DISALLOWED_PREFIXES],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE.url,
  };
}

