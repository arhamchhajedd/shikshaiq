import type { MetadataRoute } from "next";
import { PUBLIC_ROUTES } from "@/lib/seo/routes";
import { absoluteUrl, SITE } from "@/lib/seo/site";

/**
 * XML sitemap of every indexable page. `lastModified` uses the documented
 * content date rather than the build time, so crawlers receive an honest
 * freshness signal instead of a date that changes on every deploy.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(SITE.contentLastUpdated);

  return PUBLIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}

