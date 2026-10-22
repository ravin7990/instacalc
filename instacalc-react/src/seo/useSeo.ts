import { useEffect } from "react";
import { absoluteUrl, LOCALE_META, SITE, type Locale } from "@/config/site";
import type { HreflangLink, JsonLd, SeoMeta } from "@/seo/types";

const ORIGIN = SITE.origin;

/**
 * Applies SEO metadata on the client after hydration.
 *
 * The prerendered HTML already contains every tag this produces — this exists
 * so client-side navigation keeps the document head correct. Tags are applied
 * imperatively (not via React 19's native <title>/<meta> hoisting) so we do not
 * fight the server-rendered head during hydration.
 */
export function useSeo(meta: SeoMeta) {
  useEffect(() => {
    document.title = meta.title;

    const canonical = absoluteUrl(meta.path);

    setMeta("name", "description", meta.description);
    if (meta.keywords) setMeta("name", "keywords", meta.keywords);
    setMeta("name", "robots", meta.robots ?? (meta.indexable === false ? "noindex,follow" : "index,follow"));
    setMeta("name", "theme-color", meta.themeColor ?? SITE.themeColor);
    setMeta("property", "og:title", meta.ogTitle ?? meta.title);
    setMeta("property", "og:description", meta.description);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:url", canonical);
    setMeta("property", "og:site_name", SITE.name);
    setMeta("property", "og:image", absoluteUrl(SITE.ogImage));
    setMeta("property", "og:locale", LOCALE_META[meta.locale as Locale].ogLocale);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", meta.ogTitle ?? meta.title);
    setMeta("name", "twitter:description", meta.description);
    setMeta("name", "twitter:image", absoluteUrl(SITE.ogImage));

    setLink("canonical", canonical);
    syncAlternates(meta.alternates);

    document.documentElement.lang = LOCALE_META[meta.locale as Locale].htmlLang;
  }, [meta]);
}

function setMeta(attr: "name" | "property", key: string, content: string) {
  const sel = attr === "name" ? `meta[name="${key}"]` : `meta[property="${key}"]`;
  let el = document.head.querySelector<HTMLMetaElement>(sel);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/** Keeps exactly the hreflang set the prerendered page shipped with. */
function syncAlternates(links?: HreflangLink[]) {
  document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => {
    const lang = el.getAttribute("hreflang");
    if (!links?.some((l) => l.hreflang === lang)) el.remove();
  });
  for (const l of links ?? []) {
    const sel = `link[rel="alternate"][hreflang="${l.hreflang}"]`;
    let el = document.head.querySelector<HTMLLinkElement>(sel);
    if (!el) {
      el = document.createElement("link");
      el.setAttribute("rel", "alternate");
      el.setAttribute("hreflang", l.hreflang);
      document.head.appendChild(el);
    }
    const abs = l.href.startsWith("http") ? l.href : `${ORIGIN}${l.href}`;
    el.setAttribute("href", abs);
  }
}

/** Builds the JSON-LD graph for a page from its SEO descriptor. */
export function buildJsonLd(meta: SeoMeta, extra: JsonLd[] = []): JsonLd[] {
  const out: JsonLd[] = [];
  const canonical = absoluteUrl(meta.path);

  if (meta.appCategory) {
    out.push({
      "@type": "WebApplication",
      name: meta.title.split(/[-|(]/)[0].trim(),
      url: canonical,
      applicationCategory: meta.appCategory,
      operatingSystem: "All",
      description: meta.description,
    });
  }
  if (meta.faq?.length) {
    out.push({
      "@type": "FAQPage",
      mainEntity: meta.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }
  if (meta.howTo?.steps.length) {
    out.push({
      "@type": "HowTo",
      name: meta.howTo.name,
      step: meta.howTo.steps.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.name,
        text: s.text,
      })),
    });
  }
  return out.concat(extra);
}
