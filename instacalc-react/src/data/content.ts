/**
 * Prose page content, extracted from the legacy site by extract-content.mjs.
 *
 * The full dataset is server-only (see the note in seo.ts). The prerenderer
 * inlines the one record a page needs, so the client bundle stays small.
 */
import type { SeoRecord } from "@/data/seo-types";

export interface ContentBlock {
  type: "h" | "p" | "ul" | "ol";
  level?: number;
  text?: string;
  items?: string[];
}

export interface ContentPage {
  hero: { h1: string; lead: string };
  blocks: ContentBlock[];
}

const INLINE_ID = "ic-content";

function inlineRecord(): ContentPage | null {
  if (typeof document === "undefined") return null;
  const el = document.getElementById(INLINE_ID);
  if (!el?.textContent) return null;
  try {
    return JSON.parse(el.textContent) as ContentPage;
  } catch {
    return null;
  }
}

let cache: ContentPage | null = null;
let serverLookup: (path: string) => ContentPage | undefined = () => undefined;

/** Called by entry-server so the prerenderer can resolve any legacy path. */
export function __setContentLookup(fn: (path: string) => ContentPage | undefined) {
  serverLookup = fn;
}

/** Resolves a prose page's content, falling back to the page's own title. */
export function getContent(path: string, seo: SeoRecord): ContentPage {
  const found = typeof document === "undefined" ? serverLookup(path) : (cache ??= inlineRecord());
  return found ?? { hero: { h1: seo.h1 || seo.title, lead: seo.description }, blocks: [] };
}
