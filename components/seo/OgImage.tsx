import { ImageResponse } from "next/og";
import { SITE } from "@/lib/seo/site";

/** Recommended Open Graph / Twitter large-card dimensions (1.91:1). */
export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;
export const OG_IMAGE_CONTENT_TYPE = "image/png";

const COLORS = {
  background: "#ffffff",
  surface: "#f5f5f7",
  ink: "#000000",
  muted: "#6b7280",
  hairline: "#e5e7eb",
} as const;

interface OgImageContent {
  /** Small uppercase label above the title. */
  eyebrow: string;
  title: string;
  subtitle: string;
}

/** Alt text for the site-wide default share image. */
export const DEFAULT_OG_ALT =
  "ShikshaIQ — adaptive learning that finds each student's prerequisite gap in NCERT Class 7 Fractions";

/** Copy for the site-wide default share image (home, FAQ, about, auth). */
export const DEFAULT_OG_CONTENT: OgImageContent = {
  eyebrow: "Adaptive learning · NCERT Class 7 Maths",
  title: "Find the exact gap behind every student's struggle.",
  subtitle:
    "Diagnostic assessment, prerequisite-aware learning paths and a Socratic AI tutor for Indian classrooms.",
};

/**
 * Renders a branded, monochrome social-share card in the Apple-like design
 * language. Used by every `opengraph-image`/`twitter-image` route so all
 * shared links look consistent.
 */
export function renderOgImage({ eyebrow, title, subtitle }: OgImageContent): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: COLORS.background,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: COLORS.ink,
              color: COLORS.background,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            IQ
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: COLORS.ink, letterSpacing: -1 }}>
            {SITE.name}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: COLORS.muted,
              textTransform: "uppercase",
              letterSpacing: 3,
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              fontSize: 68,
              fontWeight: 700,
              color: COLORS.ink,
              letterSpacing: -2,
              lineHeight: 1.08,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 28, color: COLORS.muted, lineHeight: 1.4, maxWidth: 980 }}>
            {subtitle}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 28,
            borderTop: `2px solid ${COLORS.hairline}`,
            fontSize: 22,
            color: COLORS.muted,
          }}
        >
          <div style={{ display: "flex" }}>{SITE.tagline}</div>
          <div style={{ display: "flex", color: COLORS.ink, fontWeight: 600 }}>
            {new URL(SITE.url).host}
          </div>
        </div>
      </div>
    ),
    { ...OG_IMAGE_SIZE }
  );
}
