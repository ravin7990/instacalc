/**
 * Server-only access to the prose page content. Imported exclusively by the
 * prerenderer; keeps the dataset out of the browser bundle.
 */
import contentData from "@/data/content.generated.json";
import type { ContentPage } from "@/data/content";

const pages = contentData as Record<string, ContentPage>;

/** Prose pages that exist, keyed by their legacy path. */
const BY_PATH: Record<string, ContentPage> = {
  "/aboutus.html": pages["aboutus.html"],
  "/contactus.html": pages["contactus.html"],
  "/privacypolicy.html": pages["privacypolicy.html"],
  "/terms.html": pages["terms.html"],
  "/delete-account.html": pages["delete-account.html"],
  "/ja/aboutus.html": pages["ja/aboutus.html"],
  "/ja/contactus.html": pages["ja/contactus.html"],
  "/ja/privacypolicy.html": pages["ja/privacypolicy.html"],
  "/ja/terms.html": pages["ja/terms.html"],
  "/ja/delete-account.html": pages["ja/delete-account.html"],
  "/ru/aboutus.html": pages["ru/aboutus.html"],
  "/ru/contactus.html": pages["ru/contactus.html"],
  "/ru/privacypolicy.html": pages["ru/privacypolicy.html"],
  "/ko/privacypolicy.html": pages["ko/privacypolicy.html"],
};

/**
 * Resolves a prose page's content. Locale variants have their own extracted
 * copy; English is used only as a last-resort fallback.
 */
export function getContent(path: string): ContentPage | undefined {
  return BY_PATH[path] ?? BY_PATH[`/${path.split("/").pop() ?? ""}`];
}

export type { ContentPage };

