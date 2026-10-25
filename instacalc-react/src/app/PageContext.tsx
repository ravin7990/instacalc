import { createContext, useContext } from "react";
import type { SeoRecord } from "@/data/seo-types";
import type { Locale } from "@/config/site";

export interface PageContextValue {
  path: string;
  locale: Locale;
  seo?: SeoRecord;
}

export const PageContext = createContext<PageContextValue | null>(null);

export function usePageContext(): PageContextValue | null {
  return useContext(PageContext);
}
