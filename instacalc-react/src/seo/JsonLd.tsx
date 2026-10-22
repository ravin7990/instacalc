import { SITE } from "@/config/site";
import type { JsonLd } from "@/seo/types";

/**
 * Emits JSON-LD exactly as the legacy pages did (one <script> per graph entry,
 * so Google sees the same entities it sees today).
 */
export function JsonLd({ data }: { data: JsonLd[] }) {
  if (!data.length) return null;
  return (
    <>
      {data.map((entry, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Content is build-time generated from our own data, never user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }}
        />
      ))}
    </>
  );
}

export function breadcrumbJsonLd(
  trail: Array<{ name: string; path: string }>,
  currentName: string,
  currentUrl: string,
): JsonLd {
  const items = [...trail, { name: currentName, path: currentUrl }];
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: t.path.startsWith("http") ? t.path : `${SITE.origin}${t.path}`,
    })),
  };
}
