import { buildLlmsTxt } from "@/lib/seo/llmsTxt";

/** Prerendered at build time; the content only changes with a deploy. */
export const dynamic = "force-static";

/** Serves `/llms.txt`, a plain-text site guide for AI answer engines. */
export function GET(): Response {
  return new Response(buildLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}

