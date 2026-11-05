import { serializeJsonLd, type JsonLdObject } from "@/lib/seo/structuredData";

interface JsonLdProps {
  /** Structured data built by the trusted builders in `lib/seo/structuredData`. */
  data: JsonLdObject;
}

/**
 * Renders a Schema.org JSON-LD data block as a native `<script>` element, the
 * approach recommended by Next.js (not `next/script`, since it is data, not
 * executable code). `serializeJsonLd` escapes HTML-significant characters, so
 * the inner HTML cannot break out of the element even if content changes.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}

