import { useEffect } from "react";
import type { SeoRecord } from "@/data/seo";
import { JsonLd } from "@/seo/JsonLd";
import { useSeo } from "@/seo/useSeo";
import { absoluteUrl, SITE } from "@/config/site";
import type { JsonLd as JsonLdType } from "@/seo/types";

/**
 * Renders the page's JSON-LD into the document (visible to the prerenderer and
 * to crawlers) and keeps the live <head> in sync after hydration.
 *
 * The <head> tags themselves are emitted by the prerenderer template so they
 * exist before any JavaScript runs — this component does not duplicate them.
 */
export function SeoHead({
  seo,
  appCategory,
  extraJsonLd = [],
}: {
  seo: SeoRecord;
  appCategory?: string;
  extraJsonLd?: JsonLdType[];
}) {
  useSeo({
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    path: seo.path,
    locale: seo.locale,
    ogTitle: seo.ogTitle,
    themeColor: seo.themeColor,
    alternates: seo.alternates,
  });

  // JSON-LD is static per build, so it is written once.
  useEffect(() => {
    const id = "ic-jsonld";
    document.getElementById(id)?.remove();
    const holder = document.createElement("div");
    holder.id = id;
    holder.style.display = "none";
    document.body.appendChild(holder);
    return () => holder.remove();
  }, []);

  const entries: JsonLdType[] = [];
  if (appCategory) {
    entries.push({
      "@type": "WebPage",
      name: seo.title.split(/\s+[|\-–—]\s+/)[0].trim(),
      url: absoluteUrl(seo.path),
      description: seo.description,
      isPartOf: {
        "@type": "WebSite",
        name: "InstaCalc",
        url: absoluteUrl("/"),
      },
      publisher: {
        "@type": "Organization",
        name: "InstaCalc",
        url: absoluteUrl("/"),
      },
    });

    entries.push({
      "@type": "WebApplication",
      name: seo.title.split(/\s+[|\-–—]\s+/)[0].trim(),
      url: absoluteUrl(seo.path),
      description: seo.description,
      applicationCategory: appCategory,
      operatingSystem: "All",
      browserRequirements: "Requires JavaScript. Requires HTML5.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: seo.locale === "ko" ? "KRW" : seo.locale === "ja" ? "JPY" : seo.locale === "us" ? "USD" : seo.locale === "ru" ? "RUB" : "INR",
      },
    });
  }

  if (seo.path !== "/" && !seo.path.endsWith("/")) {
    entries.push({
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: seo.locale === "ko" ? "홈" : seo.locale === "ja" ? "ホーム" : "Home",
          item: absoluteUrl(seo.locale === "en" ? "/" : `/${seo.locale}/`),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: seo.title.split(/\s+[|\-–—]\s+/)[0].trim(),
          item: absoluteUrl(seo.path),
        },
      ],
    });
  }
  const faq = extractFaq(seo);
  if (faq.length) {
    entries.push({
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question" as const,
        name: f.q,
        acceptedAnswer: { "@type": "Answer" as const, text: f.a },
      })),
    });
  }

  return <JsonLd data={[...entries, ...extraJsonLd]} />;
}

/**
 * Reads the FAQ out of the page's existing JSON-LD so copy cannot drift.
 * Falls back to the shared accordion helper so both paths behave identically.
 */
export function extractFaq(seo: SeoRecord): Array<{ q: string; a: string }> {
  let faq = seo.jsonLd.find((j) => j && j["@type"] === "FAQPage");
  if (!faq) {
    for (const j of seo.jsonLd) {
      if (j && "@graph" in j && Array.isArray((j as any)["@graph"])) {
        const found = (j as any)["@graph"].find((item: any) => item && item["@type"] === "FAQPage");
        if (found) {
          faq = found;
          break;
        }
      }
    }
  }
  if (!faq || !("mainEntity" in faq) || !Array.isArray(faq.mainEntity)) return [];
  return faq.mainEntity.map((q: any) => ({
    q: q.name,
    a: q.acceptedAnswer?.text ?? "",
  }));
}


export { SITE };
