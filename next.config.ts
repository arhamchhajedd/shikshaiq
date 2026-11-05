import type { NextConfig } from "next";
import { PRIVATE_ROUTE_PREFIXES } from "./lib/seo/routes";

/** API routes never belong in search results. */
const API_ROUTE_PREFIXES = ["/api"] as const;

const noIndexHeader = { key: "X-Robots-Tag", value: "noindex, nofollow" };

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com https://api.openai.com",
      "worker-src 'self' blob:",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      // Belt-and-braces de-indexing for private and machine routes. Unlike
      // <meta name="robots">, the header also covers redirects, JSON API
      // responses and non-HTML assets served under these prefixes.
      ...[...PRIVATE_ROUTE_PREFIXES, ...API_ROUTE_PREFIXES].flatMap((prefix) => [
        { source: prefix, headers: [noIndexHeader] },
        { source: `${prefix}/:path*`, headers: [noIndexHeader] },
      ]),
    ];
  },
};

export default nextConfig;
