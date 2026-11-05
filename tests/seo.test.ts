import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveSiteUrl, absoluteUrl, DEFAULT_SITE_URL, SITE } from "../lib/seo/site";
import {
  PUBLIC_ROUTES,
  PRIVATE_ROUTE_PREFIXES,
  CRAWL_DISALLOWED_PREFIXES,
  conceptPagePath,
} from "../lib/seo/routes";
import {
  serializeJsonLd,
  buildGraph,
  buildOrganizationNode,
  buildWebsiteNode,
  buildWebApplicationNode,
  buildBreadcrumbNode,
  buildFaqPageNode,
  buildCourseNode,
  buildLearningResourceNode,
  SCHEMA_IDS,
  type JsonLdObject,
} from "../lib/seo/structuredData";
import { buildPageMetadata, buildPrivateMetadata } from "../lib/seo/metadata";
import { buildLlmsTxt } from "../lib/seo/llmsTxt";
import { FAQ_ITEMS, FAQ_CATEGORIES } from "../lib/content/faq";
import { CONCEPTS_LIST, CONCEPTS } from "../lib/curriculum/concepts";
import { CONCEPT_LESSONS } from "../lib/curriculum/lessons";
import robots from "../app/robots";
import sitemap from "../app/sitemap";

describe("SEO Engine — Site URL & Canonical Origin Resolution", () => {
  it("falls back to default production URL when env var is undefined or empty", () => {
    assert.equal(resolveSiteUrl(undefined), DEFAULT_SITE_URL);
    assert.equal(resolveSiteUrl(""), DEFAULT_SITE_URL);
    assert.equal(resolveSiteUrl("   "), DEFAULT_SITE_URL);
  });

  it("normalizes trailing slashes on custom site URL", () => {
    assert.equal(resolveSiteUrl("https://shikshaiq.com/"), "https://shikshaiq.com");
    assert.equal(resolveSiteUrl("https://shikshaiq.com///"), "https://shikshaiq.com");
  });

  it("builds absolute canonical URLs with single slash", () => {
    assert.equal(absoluteUrl("/"), SITE.url);
    assert.equal(absoluteUrl(""), SITE.url);
    assert.equal(absoluteUrl("/faq"), `${SITE.url}/faq`);
    assert.equal(absoluteUrl("curriculum"), `${SITE.url}/curriculum`);
  });
});

describe("SEO Engine — Route Inventory & Sitemap Integrity", () => {
  it("includes all core pages and all 5 Class 7 Fractions concept lessons in PUBLIC_ROUTES", () => {
    const paths = PUBLIC_ROUTES.map((r) => r.path);
    assert.ok(paths.includes("/"));
    assert.ok(paths.includes("/curriculum"));
    assert.ok(paths.includes("/faq"));
    assert.ok(paths.includes("/about"));
    assert.ok(paths.includes("/signup"));
    assert.ok(paths.includes("/login"));

    for (const concept of CONCEPTS_LIST) {
      assert.ok(
        paths.includes(conceptPagePath(concept.id)),
        `Missing public path for concept: ${concept.id}`
      );
    }
    assert.equal(paths.length, 11); // 6 static + 5 concepts
  });

  it("defines private route prefixes that must never be in public routes", () => {
    assert.ok(PRIVATE_ROUTE_PREFIXES.includes("/student"));
    assert.ok(PRIVATE_ROUTE_PREFIXES.includes("/teacher"));
    assert.ok(PRIVATE_ROUTE_PREFIXES.includes("/admin"));

    const publicPaths = PUBLIC_ROUTES.map((r) => r.path);
    for (const privatePrefix of PRIVATE_ROUTE_PREFIXES) {
      assert.ok(
        !publicPaths.some((p) => p === privatePrefix || p.startsWith(`${privatePrefix}/`)),
        `Private prefix ${privatePrefix} must never appear in PUBLIC_ROUTES`
      );
    }
  });

  it("generates valid sitemap matching public route inventory", () => {
    const entries = sitemap();
    assert.equal(entries.length, PUBLIC_ROUTES.length);

    for (const entry of entries) {
      assert.ok(entry.url.startsWith(SITE.url), `URL must start with canonical site origin: ${entry.url}`);
      assert.ok(entry.lastModified instanceof Date, "lastModified must be a Date");
      assert.ok(typeof entry.priority === "number" && entry.priority > 0 && entry.priority <= 1);
      assert.ok(["weekly", "monthly", "yearly"].includes(entry.changeFrequency as string));
    }
  });

  it("configures robots.txt to allow crawling and disallow internal API endpoints", () => {
    const config = robots();
    assert.equal(config.host, SITE.url);
    assert.equal(config.sitemap, `${SITE.url}/sitemap.xml`);

    const rules = Array.isArray(config.rules) ? config.rules[0] : config.rules;
    assert.equal(rules?.userAgent, "*");
    assert.equal(rules?.allow, "/");

    const disallowed = Array.isArray(rules?.disallow) ? rules.disallow : [rules?.disallow];
    for (const prefix of CRAWL_DISALLOWED_PREFIXES) {
      assert.ok(disallowed.includes(prefix), `Expected ${prefix} in disallow rules`);
    }
  });
});

describe("SEO Engine — Structured Data (Schema.org JSON-LD)", () => {
  it("sanitizes HTML injection vectors in serializeJsonLd to prevent XSS script breakouts", () => {
    const payload: JsonLdObject = {
      "@context": "https://schema.org",
      "@type": "Question",
      name: "Can I use </script><script>alert(1)</script> here?",
      text: "Testing <tag> & special \u2028 \u2029 chars",
    };

    const serialized = serializeJsonLd(payload);
    assert.ok(!serialized.includes("</script>"), "Must never contain raw closing script tag");
    assert.ok(!serialized.includes("<tag>"), "Must escape opening angle brackets");
    assert.ok(!serialized.includes("& special"), "Must escape ampersands");
    assert.ok(serialized.includes("\\u003c/script\\u003e"));

    // Ensure it remains valid JSON when deserialized
    const roundTripped = JSON.parse(serialized);
    assert.equal(roundTripped.name, payload.name);
  });

  it("wraps multiple schema entities into a valid unified @graph document", () => {
    const graph = buildGraph([buildOrganizationNode(), buildWebsiteNode()]);
    assert.equal(graph["@context"], "https://schema.org");
    assert.ok(Array.isArray(graph["@graph"]));
    assert.equal((graph["@graph"] as unknown[]).length, 2);
  });

  it("builds consistent Organization, WebSite and WebApplication graph nodes", () => {
    const org = buildOrganizationNode();
    assert.equal(org["@type"], "Organization");
    assert.equal(org["@id"], SCHEMA_IDS.organization);
    assert.equal(org.name, "ShikshaIQ");

    const website = buildWebsiteNode();
    assert.equal(website["@type"], "WebSite");
    assert.equal(website["@id"], SCHEMA_IDS.website);

    const app = buildWebApplicationNode();
    assert.equal(app["@type"], "WebApplication");
    assert.equal(app.applicationCategory, "EducationalApplication");
    assert.ok(Array.isArray(app.featureList) && app.featureList.length > 5);
  });

  it("builds BreadcrumbList with ordered 1-based positions and absolute URLs", () => {
    const breadcrumb = buildBreadcrumbNode([
      { name: "Home", path: "/" },
      { name: "Curriculum", path: "/curriculum" },
      { name: "Fraction Basics", path: "/curriculum/fraction-basics" },
    ]);

    assert.equal(breadcrumb["@type"], "BreadcrumbList");
    const items = breadcrumb.itemListElement as Array<Record<string, unknown>>;
    assert.equal(items.length, 3);
    assert.equal(items[0].position, 1);
    assert.equal(items[0].item, SITE.url);
    assert.equal(items[2].position, 3);
    assert.equal(items[2].item, `${SITE.url}/curriculum/fraction-basics`);
  });

  it("builds FAQPage matching exact verified Q&A content", () => {
    const faqNode = buildFaqPageNode(FAQ_ITEMS, "/faq");
    assert.equal(faqNode["@type"], "FAQPage");
    assert.equal(faqNode.url, `${SITE.url}/faq`);

    const mainEntity = faqNode.mainEntity as Array<Record<string, unknown>>;
    assert.equal(mainEntity.length, FAQ_ITEMS.length);
    assert.equal(mainEntity[0]["@type"], "Question");
    assert.equal(mainEntity[0].name, FAQ_ITEMS[0].question);

    const firstAnswer = mainEntity[0].acceptedAnswer as Record<string, unknown>;
    assert.equal(firstAnswer["@type"], "Answer");
    assert.equal(firstAnswer.text, FAQ_ITEMS[0].answer);
  });

  it("builds Course and LearningResource nodes linking curriculum prerequisites accurately", () => {
    const course = buildCourseNode("Class 7 Fractions description");
    assert.equal(course["@type"], "Course");
    assert.equal(course.educationalLevel, "Class 7");
    const parts = course.hasPart as Array<Record<string, unknown>>;
    assert.equal(parts.length, 5);

    // Test a dependent concept (Adding Fractions has prerequisites C2 and C3)
    const addingFractionsLesson = CONCEPT_LESSONS["adding-fractions"];
    const resource = buildLearningResourceNode(addingFractionsLesson);
    assert.equal(resource["@type"], "LearningResource");
    assert.equal(resource.name, addingFractionsLesson.title);

    const competencies = resource.competencyRequired as Array<Record<string, unknown>>;
    assert.equal(competencies.length, 2);
    assert.equal(competencies[0].name, CONCEPTS["common-multiples"].title);
    assert.equal(competencies[1].name, CONCEPTS["equivalent-fractions"].title);
  });
});

describe("AEO & GEO — llms.txt & Semantic Search Grounding", () => {
  it("generates markdown document conforming to llms.txt standard", () => {
    const text = buildLlmsTxt();
    assert.ok(text.startsWith(`# ${SITE.name}`), "Must start with H1 title");
    assert.ok(text.includes(`> ${SITE.description}`), "Must include blockquote summary");
    assert.ok(text.includes("## Main pages"), "Must have main pages section");
    assert.ok(text.includes("## Class 7 Fractions lessons"), "Must link concept lessons");
    assert.ok(text.includes("## Frequently asked questions"), "Must include FAQ grounding");

    for (const concept of CONCEPTS_LIST) {
      assert.ok(text.includes(concept.title), `llms.txt must include concept: ${concept.title}`);
    }
  });

  it("verifies FAQ categories contain clear, distinct non-empty questions", () => {
    assert.ok(FAQ_CATEGORIES.length >= 4);
    assert.ok(FAQ_ITEMS.length >= 10);

    const ids = new Set<string>();
    for (const item of FAQ_ITEMS) {
      assert.ok(!ids.has(item.id), `Duplicate FAQ item id: ${item.id}`);
      ids.add(item.id);
      assert.ok(item.question.length > 10, "Question text must be substantive");
      assert.ok(item.answer.length > 40, "Answer text must be substantive");
    }
  });
});

describe("SEO Engine — Page & Private Metadata Builders", () => {
  it("builds complete OpenGraph and Twitter metadata for indexable pages", () => {
    const meta = buildPageMetadata({
      title: "Test Page",
      description: "Test description for page metadata",
      path: "/test",
    });

    assert.equal(meta.title, "Test Page");
    assert.equal(meta.description, "Test description for page metadata");
    assert.equal(meta.alternates?.canonical, "/test");

    const og = meta.openGraph as Record<string, unknown>;
    assert.equal(og?.siteName, SITE.name);
    assert.equal(og?.locale, SITE.locale);
    assert.equal(og?.url, "/test");

    const tw = meta.twitter as Record<string, unknown>;
    assert.equal(tw?.card, "summary_large_image");
  });

  it("enforces noindex and nofollow on private metadata", () => {
    const meta = buildPrivateMetadata("Super Secret Page");
    assert.equal(meta.title, "Super Secret Page");

    const robotsMeta = meta.robots as Record<string, unknown>;
    assert.equal(robotsMeta.index, false);
    assert.equal(robotsMeta.follow, false);
  });
});
