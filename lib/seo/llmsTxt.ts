import { ADAPTIVE_CONFIG } from "../adaptive/config";
import { FAQ_ITEMS } from "../content/faq";
import { CONCEPTS_LIST } from "../curriculum/concepts";
import { conceptPagePath } from "./routes";
import { SITE, absoluteUrl } from "./site";

const toPercent = (ratio: number): string => `${Math.round(ratio * 100)}%`;

/**
 * Builds `/llms.txt` following the llmstxt.org proposal: an H1 title, a
 * blockquote summary, then sections of annotated links. It gives AI answer
 * engines a concise, factual map of the public site so they can describe and
 * cite ShikshaIQ accurately. Content is generated from the same curriculum and
 * FAQ data that the pages render, so it cannot drift from the site.
 */
export function buildLlmsTxt(): string {
  const conceptLinks = CONCEPTS_LIST.map((concept) => {
    const prerequisites =
      concept.prerequisites.length === 0
        ? "no prerequisites"
        : `requires ${concept.prerequisites.join(", ")}`;
    return `- [${concept.title}](${absoluteUrl(conceptPagePath(concept.id))}): ${concept.description} (${prerequisites})`;
  });

  const faqLines = FAQ_ITEMS.map(
    (item) => `- [${item.question}](${absoluteUrl(`/faq#${item.id}`)}): ${item.answer}`
  );

  return [
    `# ${SITE.name}`,
    "",
    `> ${SITE.description}`,
    "",
    "Key facts:",
    "- Audience: Indian school students (designed for Classes 6–10), their teachers and school administrators.",
    "- Current module: NCERT / CBSE Class 7 Mathematics — Fractions.",
    `- Mastery rule: Mastered at ${toPercent(ADAPTIVE_CONFIG.MASTERY_THRESHOLD)}+ accuracy with at least ${ADAPTIVE_CONFIG.MIN_EVIDENCE_FOR_MASTERY} answers; Partial from ${toPercent(ADAPTIVE_CONFIG.PARTIAL_THRESHOLD)}; Needs revision below ${toPercent(ADAPTIVE_CONFIG.PARTIAL_THRESHOLD)}.`,
    "- Grading and mastery are deterministic and server-side. The AI tutor never grades or changes mastery.",
    "- AI tutor languages: English, Hindi, Marathi. Offline practice is supported.",
    "",
    "## Main pages",
    "",
    `- [Home](${absoluteUrl("/")}): What ShikshaIQ does for students and teachers.`,
    `- [Curriculum](${absoluteUrl("/curriculum")}): The Class 7 Fractions concept map and learning order.`,
    `- [FAQ](${absoluteUrl("/faq")}): Answers about diagnostics, mastery rules, the AI tutor, offline use and privacy.`,
    `- [About](${absoluteUrl("/about")}): Mission, principles and how the platform is built.`,
    "",
    "## Class 7 Fractions lessons",
    "",
    ...conceptLinks,
    "",
    "## Frequently asked questions",
    "",
    ...faqLines,
    "",
    "## Optional",
    "",
    `- [Create an account](${absoluteUrl("/signup")}): Student sign-up is immediate; teacher accounts require administrator approval.`,
    `- [Sitemap](${absoluteUrl("/sitemap.xml")}): Every indexable URL.`,
    "",
  ].join("\n");
}

