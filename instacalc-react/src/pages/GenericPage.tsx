import type { SeoRecord } from "@/data/seo";
import { Layout, localeHome } from "@/components/layout/Layout";
import { SeoHead } from "@/components/seo/SeoHead";
import { FaqAccordion, Breadcrumbs, extractBreadcrumb, extractFaqItems } from "@/components/calculator/FaqAccordion";
import { ui } from "@/i18n/ui";

/**
 * Shell for any legacy path that does not (yet) have a bespoke React page.
 *
 * It renders the page's real title, description and FAQ from its SEO record so
 * the URL stays a valid, indexable document during the staged migration,
 * rather than 404ing or emitting a blank shell.
 */
export default function GenericPage({ seo }: { seo: SeoRecord }) {
  const t = ui(seo.locale);
  const faq = extractFaqItems(seo);
  const crumbs = extractBreadcrumb(seo);

  return (
    <>
      <SeoHead seo={seo} />
      <Layout locale={seo.locale}>
        <article className="section prose">
          <div className="container">
            <Breadcrumbs locale={seo.locale} trail={crumbs} current={seo.title} />
            <h1>{seo.h1 || seo.title}</h1>
            <p className="lede">{seo.description}</p>

            <p>
              This tool is being upgraded to our new faster interface. The full calculator remains
              available and all of your existing links keep working.
            </p>

            <p>
              <a className="btn btn-primary" href={`${localeHome(seo.locale)}#calculator-library`}>
                {t.browseTools}
              </a>
            </p>
          </div>
        </article>

        <FaqAccordion locale={seo.locale} items={faq} />
      </Layout>
    </>
  );
}
