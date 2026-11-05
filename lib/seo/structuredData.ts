import { CONCEPTS, CONCEPTS_LIST } from "../curriculum/concepts";
import type { FaqItem } from "../content/faq";
import type { ConceptLesson } from "../../types/curriculum";
import { conceptPagePath } from "./routes";
import { SITE, absoluteUrl } from "./site";

/** Any JSON value allowed inside a JSON-LD document. */
export type JsonLdValue =
  | string
  | number
  | boolean
  | null
  | readonly JsonLdValue[]
  | { readonly [key: string]: JsonLdValue };

/** A JSON-LD object node. */
export type JsonLdObject = { readonly [key: string]: JsonLdValue };

const SCHEMA_CONTEXT = "https://schema.org";

/** Stable `@id` IRIs so nodes on different pages reference the same entities. */
export const SCHEMA_IDS = {
  organization: `${SITE.url}/#organization`,
  website: `${SITE.url}/#website`,
  application: `${SITE.url}/#application`,
  course: `${absoluteUrl("/curriculum")}#course`,
} as const;

const EDUCATIONAL_LEVEL = "Class 7";
const CURRICULUM_FRAMEWORK = "NCERT / CBSE";
const LOGO_PATH = "/icons/icon.svg";

const escapeMap: Readonly<Record<string, string>> = {
  "<": "\\u003c",
  ">": "\\u003e",
  "&": "\\u0026",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
};

/**
 * Serialises JSON-LD for safe embedding inside an inline `<script>` element.
 *
 * `JSON.stringify` alone does not stop a string containing `</script>` from
 * terminating the element (XSS). Escaping `<`, `>`, `&` and the JavaScript
 * line separators keeps the output valid JSON while making HTML breakout
 * impossible, as recommended by the Next.js JSON-LD guide.
 */
export function serializeJsonLd(data: JsonLdObject): string {
  return JSON.stringify(data).replace(/[<>&\u2028\u2029]/g, (char) => escapeMap[char] ?? char);
}

/** Wraps nodes in a single `@graph` document with one shared `@context`. */
export function buildGraph(nodes: readonly JsonLdObject[]): JsonLdObject {
  return { "@context": SCHEMA_CONTEXT, "@graph": nodes };
}

/** Organization entity: the publisher behind every page. */
export function buildOrganizationNode(): JsonLdObject {
  return {
    "@type": "Organization",
    "@id": SCHEMA_IDS.organization,
    name: SITE.name,
    url: SITE.url,
    logo: { "@type": "ImageObject", url: absoluteUrl(LOGO_PATH) },
    description: SITE.description,
    slogan: SITE.tagline,
    areaServed: { "@type": "Country", name: "India" },
  };
}

/** WebSite entity. No SearchAction is declared because the site has no search. */
export function buildWebsiteNode(): JsonLdObject {
  return {
    "@type": "WebSite",
    "@id": SCHEMA_IDS.website,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    inLanguage: SITE.language,
    publisher: { "@id": SCHEMA_IDS.organization },
  };
}

/**
 * The learning platform itself. Pricing and ratings are deliberately omitted:
 * structured data must never assert facts the product cannot substantiate.
 */
export function buildWebApplicationNode(): JsonLdObject {
  return {
    "@type": "WebApplication",
    "@id": SCHEMA_IDS.application,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any (modern web browser)",
    browserRequirements: "Requires JavaScript. Installable as a progressive web app.",
    inLanguage: SITE.language,
    availableLanguage: [...SITE.tutorLanguages],
    publisher: { "@id": SCHEMA_IDS.organization },
    audience: [
      { "@type": "EducationalAudience", educationalRole: "student" },
      { "@type": "EducationalAudience", educationalRole: "teacher" },
    ],
    featureList: [
      "Diagnostic assessment for NCERT Class 7 Fractions",
      "Deterministic, rule-based concept mastery tracking",
      "Prerequisite gap detection across a concept graph",
      "Micro-lessons with worked examples and common mistakes",
      "Guided practice with instant server-checked feedback",
      "Socratic AI tutor in English, Hindi and Marathi",
      "Teacher classroom analytics and interventions",
      "Offline practice with reliable synchronisation",
    ],
  };
}

/** A visible breadcrumb trail item. */
export interface BreadcrumbItem {
  name: string;
  path: string;
}

/** BreadcrumbList matching the visible breadcrumb navigation on the page. */
export function buildBreadcrumbNode(items: readonly BreadcrumbItem[]): JsonLdObject {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** FAQPage built from the exact Q&A text rendered on the page. */
export function buildFaqPageNode(items: readonly FaqItem[], path: string): JsonLdObject {
  return {
    "@type": "FAQPage",
    "@id": `${absoluteUrl(path)}#faq`,
    url: absoluteUrl(path),
    inLanguage: SITE.language,
    isPartOf: { "@id": SCHEMA_IDS.website },
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/** AboutPage describing the organisation. */
export function buildAboutPageNode(path: string, description: string): JsonLdObject {
  return {
    "@type": "AboutPage",
    "@id": `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name: `About ${SITE.name}`,
    description,
    inLanguage: SITE.language,
    isPartOf: { "@id": SCHEMA_IDS.website },
    mainEntity: { "@id": SCHEMA_IDS.organization },
  };
}

/** Course entity for the Class 7 Fractions module and its ordered lessons. */
export function buildCourseNode(description: string): JsonLdObject {
  return {
    "@type": "Course",
    "@id": SCHEMA_IDS.course,
    name: "NCERT Class 7 Mathematics — Fractions",
    description,
    url: absoluteUrl("/curriculum"),
    inLanguage: SITE.language,
    educationalLevel: EDUCATIONAL_LEVEL,
    provider: { "@id": SCHEMA_IDS.organization },
    teaches: CONCEPTS_LIST.map((concept) => concept.title),
    hasPart: CONCEPTS_LIST.map((concept) => ({
      "@type": "LearningResource",
      name: concept.title,
      url: absoluteUrl(conceptPagePath(concept.id)),
    })),
  };
}

/** LearningResource entity for one public concept lesson page. */
export function buildLearningResourceNode(lesson: ConceptLesson): JsonLdObject {
  const prerequisites = CONCEPTS[lesson.conceptId].prerequisites;
  const url = absoluteUrl(conceptPagePath(lesson.conceptId));

  return {
    "@type": "LearningResource",
    "@id": `${url}#lesson`,
    name: lesson.title,
    description: lesson.summary,
    url,
    inLanguage: SITE.language,
    learningResourceType: "Lesson",
    educationalLevel: EDUCATIONAL_LEVEL,
    teaches: lesson.learningObjective,
    timeRequired: `PT${lesson.estimatedMinutes}M`,
    isAccessibleForFree: true,
    educationalAlignment: {
      "@type": "AlignmentObject",
      alignmentType: "educationalSubject",
      educationalFramework: CURRICULUM_FRAMEWORK,
      targetName: `${lesson.subject} — ${EDUCATIONAL_LEVEL} Fractions`,
    },
    competencyRequired: prerequisites.map((id) => ({
      "@type": "DefinedTerm",
      name: CONCEPTS[id].title,
      url: absoluteUrl(conceptPagePath(id)),
    })),
    isPartOf: { "@id": SCHEMA_IDS.course },
    publisher: { "@id": SCHEMA_IDS.organization },
  };
}

