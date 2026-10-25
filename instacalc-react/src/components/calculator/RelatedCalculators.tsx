import { useMemo } from "react";
import type { Locale } from "@/config/site";
import { toolGroups, prefix, type Tool } from "@/data/tools";
import { ui } from "@/i18n/ui";
import { usePageContext } from "@/app/PageContext";
import { trackNavClick } from "@/lib/analytics";

interface RelatedCalculatorsProps {
  locale: Locale;
  currentPath?: string;
  limit?: number;
}

interface RelatedItem extends Tool {
  href: string;
  category: string;
  icon: string;
}

function resolveIcon(path: string): string {
  const p = path.toLowerCase();
  if (p.includes("sip") || p.includes("mutual") || p.includes("cagr") || p.includes("lumpsum") || p.includes("swp") || p.includes("invest") || p.includes("stock") || p.includes("crypto")) {
    return "📈";
  }
  if (p.includes("emi") || p.includes("loan") || p.includes("mortgage") || p.includes("dsr") || p.includes("interest") || p.includes("cd-") || p.includes("fd") || p.includes("rd") || p.includes("brokerage")) {
    return "💳";
  }
  if (p.includes("tax") || p.includes("gst") || p.includes("furusato") || p.includes("yearend") || p.includes("acquisition")) {
    return "🏛️";
  }
  if (p.includes("retirement") || p.includes("pension") || p.includes("401k") || p.includes("ira") || p.includes("epf") || p.includes("ppf") || p.includes("nps") || p.includes("gratuity") || p.includes("severance") || p.includes("taishokukin") || p.includes("youth") || p.includes("fire")) {
    return "🛡️";
  }
  if (p.includes("age") || p.includes("birthday") || p.includes("day") || p.includes("week") || p.includes("hour") || p.includes("time") || p.includes("date")) {
    return "⏱️";
  }
  if (p.includes("concrete") || p.includes("diagonal") || p.includes("trigno") || p.includes("gallon") || p.includes("pyeong")) {
    return "📐";
  }
  return "🧮";
}

const PATH_ALIASES: Record<string, string> = {
  "agecalculator.html": "duration/agecalculator.html",
  "cargcalculator.html": "cagrcalculator.html",
  "coumpoundinterest.html": "compoundinterest.html",
};

function normalizeToRelativePath(path: string, locale: Locale): string {
  let clean = path.split("?")[0].split("#")[0];
  if (clean.startsWith("/")) clean = clean.slice(1);
  if (locale !== "en" && clean.startsWith(`${locale}/`)) {
    clean = clean.slice(locale.length + 1);
  }
  return clean;
}

export function RelatedCalculators({ locale, currentPath, limit = 6 }: RelatedCalculatorsProps) {
  const pageContext = usePageContext();
  const rawPath = currentPath || pageContext?.path || (typeof window !== "undefined" ? window.location.pathname : "");
  const t = ui(locale);

  const related = useMemo<RelatedItem[]>(() => {
    const groups = toolGroups(locale);
    if (!groups.length) return [];

    const relPath = normalizeToRelativePath(rawPath, locale);
    const canonicalPath = PATH_ALIASES[relPath] || relPath;

    // 1. Find group matching this tool (checking both relPath and canonicalPath)
    let primaryGroup = groups.find((g) =>
      g.tools.some((tool) => tool.path === canonicalPath || tool.path === relPath)
    );
    if (!primaryGroup) {
      primaryGroup = groups[0];
    }

    const items: RelatedItem[] = [];
    const seen = new Set<string>();

    if (relPath) seen.add(relPath);
    if (canonicalPath) seen.add(canonicalPath);
    for (const [alias, target] of Object.entries(PATH_ALIASES)) {
      if (target === canonicalPath || target === relPath) {
        seen.add(alias);
      }
    }

    // Add sibling tools from primary group
    for (const tool of primaryGroup.tools) {
      if (!seen.has(tool.path)) {
        seen.add(tool.path);
        items.push({
          ...tool,
          href: prefix(locale, tool.path),
          category: primaryGroup.name,
          icon: resolveIcon(tool.path),
        });
        if (items.length >= limit) break;
      }
    }

    // If needed, backfill from other groups in the same locale
    if (items.length < limit) {
      for (const group of groups) {
        if (group === primaryGroup) continue;
        for (const tool of group.tools) {
          if (!seen.has(tool.path)) {
            seen.add(tool.path);
            items.push({
              ...tool,
              href: prefix(locale, tool.path),
              category: group.name,
              icon: resolveIcon(tool.path),
            });
            if (items.length >= limit) break;
          }
        }
        if (items.length >= limit) break;
      }
    }

    return items;
  }, [locale, rawPath, limit]);

  if (!related.length) return null;

  return (
    <div className="related-calculators" aria-labelledby="related-calcs-title">
      <div className="related-head">
        <h2 id="related-calcs-title" className="related-title">
          {t.relatedCalculators}
        </h2>
        <p className="related-subtitle">{t.relatedCalculatorsSub}</p>
      </div>

      <ul className="related-list">
        {related.map((tool) => (
          <li key={tool.href} className="related-item">
            <a
              href={tool.href}
              className="related-link"
              onClick={() => trackNavClick("related_calculator", tool.label, tool.href)}
            >
              <span className="related-icon" aria-hidden="true">
                {tool.icon}
              </span>
              <span className="related-name">{tool.label}</span>
              <span className="related-badge">{tool.category}</span>
              <span className="related-arrow" aria-hidden="true">
                →
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
