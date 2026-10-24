import { useState, useEffect } from "react";
import type { SeoRecord } from "@/data/seo-types";
import type { ContentBlock, ContentPage as ContentPageType } from "@/data/content";
import { getContent } from "@/data/content";
import { Layout } from "@/components/layout/Layout";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { localeHome } from "@/components/layout/Layout";

/**
 * Renders a prose page (about, contact, privacy, terms, delete-account) from
 * the content extracted out of the legacy markup. Copy therefore stays
 * identical to what is live today.
 */
export default function ContentPage({ seo }: { seo: SeoRecord }) {
  const page = getContent(seo.path, seo);
  const [contentPage, setContentPage] = useState<ContentPageType>(page);
  const faq = extractFaq(seo);

  useEffect(() => {
    if (page.blocks.length === 0) {
      import("@/data/content.generated.json").then((mod) => {
        const fileName = seo.path.split("/").pop() ?? "";
        const localeDir = seo.path.split("/").slice(1, -1).join("/");
        const key = localeDir ? `${localeDir}/${fileName}` : fileName;
        const loaded = (mod.default as Record<string, ContentPageType>)[key];
        if (loaded) setContentPage(loaded);
      });
    }
  }, [seo.path, page.blocks.length]);

  const activePage = contentPage.blocks.length > 0 ? contentPage : page;
  // The hero H1 is already rendered by the hero block, so drop it from the body.
  const blocks = activePage.blocks.filter((b) => !(b.type === "h" && b.level === 1));

  return (
    <>
      <SeoHead seo={seo} />
      <Layout locale={seo.locale}>
        <section className="hero">
          <div className="container">
            <div className="hero-copy">
              <span className="eyebrow">{seo.title.split(/[-|(]/)[0].trim()}</span>
              <h1>{activePage.hero.h1}</h1>
              {activePage.hero.lead ? <p>{activePage.hero.lead}</p> : null}
              <div className="hero-actions">
                <a className="btn btn-primary" href={localeHome(seo.locale)}>
                  {seo.locale === "ru"
                    ? "Смотреть все калькуляторы"
                    : seo.locale === "ja"
                    ? "すべての計算ツールを見る"
                    : seo.locale === "ko"
                    ? "계산기 전체 목록"
                    : "Browse calculators"}
                </a>
              </div>
            </div>
          </div>
        </section>

        <article className="section prose-page">
          <div className="container prose">
            {blocks.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </div>
        </article>

        <FaqAccordion locale={seo.locale} items={faq} />
      </Layout>
    </>
  );
}

function Block({ block }: { block: ContentBlock }) {
  if (block.type === "h") {
    // Rendered as real h2/h3 so the document outline stays intact for SEO.
    if (block.level === 2) return <h2>{block.text}</h2>;
    if (block.level === 3) return <h3>{block.text}</h3>;
    if (block.level === 4) return <h4>{block.text}</h4>;
    return null;
  }

  if (block.type === "ul" || block.type === "ol") {
    const Tag = block.type;
    return (
      <Tag>
        {(block.items ?? []).map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </Tag>
    );
  }

  return <p>{block.text}</p>;
}
