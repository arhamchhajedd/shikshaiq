import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shikshaiq.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/faq", "/curriculum", "/login", "/signup", "/student/assessment"],
        disallow: ["/admin", "/teacher", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
