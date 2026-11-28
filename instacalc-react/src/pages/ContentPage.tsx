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
  // The hero H1 and lead paragraph are already rendered by the hero block, so drop them from the body.
  const leadText = activePage.hero.lead?.trim() ?? "";
  let droppedLead = false;
  const blocks = activePage.blocks.filter((b) => {
    if (b.type === "h" && b.level === 1) return false;
    if (!droppedLead && leadText && b.type === "p" && b.text?.trim() === leadText) {
      droppedLead = true;
      return false;
    }
    return true;
  });

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
                    : seo.locale === "es"
                    ? "Ver todas las calculadoras"
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
            {seo.path === "/aboutus.html" ? <AboutEditorialTrust /> : null}
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

function AboutEditorialTrust() {
  return (
    <>
      <h2>Editorial Methodology & Formula Verification</h2>
      <p>
        Financial, tax, and retirement calculators directly impact real-world decisions. Every
        calculation engine on InstaCalc.in is built and unit-tested against published regulatory
        standards and official banking formulas before release:
      </p>
      <ul>
        <li>
          <strong>Indian Tax & Statutory Schemes:</strong> Income Tax (Section 115BAC New & Old
          Regimes), PPF, EPF, NPS, and Gratuity rules are cross-checked against notifications from
          the{" "}
          <a href="https://www.incometax.gov.in/" rel="noopener noreferrer" target="_blank">
            Income Tax Department of India
          </a>
          ,{" "}
          <a href="https://www.epfindia.gov.in/" rel="noopener noreferrer" target="_blank">
            EPFO
          </a>
          , and{" "}
          <a href="https://www.npscra.nsdl.co.in/" rel="noopener noreferrer" target="_blank">
            PFRDA / NPS Trust
          </a>
          .
        </li>
        <li>
          <strong>Banking, Loans & Mutual Funds:</strong> EMI reducing-balance amortization, FD/RD
          quarterly compounding, and SIP future-value equations follow standard{" "}
          <a href="https://www.rbi.org.in/" rel="noopener noreferrer" target="_blank">
            Reserve Bank of India (RBI)
          </a>{" "}
          and{" "}
          <a href="https://www.amfiindia.com/" rel="noopener noreferrer" target="_blank">
            AMFI
          </a>{" "}
          conventions.
        </li>
        <li>
          <strong>US, Japan, Korea, Spain & Arabic Editions:</strong> Regional calculators are
          independently calibrated to local tax brackets, compounding norms, and statutory limits.
        </li>
      </ul>

      <h2>Publisher & Editorial Independence</h2>
      <p>
        InstaCalc.in is independently developed and maintained by <strong>Ravin Kumar</strong> (Life
        Hack Developer). We are not affiliated with any bank, mutual fund house, or lending
        institution, and we never sell user leads or store personal financial inputs. All
        computations execute locally in your browser.
      </p>
      <p>
        We audit our tax slabs, interest rates, and statutory thresholds every fiscal year and
        whenever central budgets announce policy changes. If you spot a formula discrepancy or want
        to suggest an improvement, reach us directly via our{" "}
        <a href="/contactus.html">Contact Us</a> page or email{" "}
        <a href="mailto:developerravin@gmail.com">developerravin@gmail.com</a>.
      </p>
    </>
  );
}
