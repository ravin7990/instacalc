import type { SeoRecord } from "@/data/seo-types";
import { Layout, localeHome } from "@/components/layout/Layout";
import { SeoHead } from "@/components/seo/SeoHead";
import { ui } from "@/i18n/ui";

/**
 * The 404 document.
 *
 * `dist/404.html` used to be a byte-for-byte copy of `index.html`. That shipped
 * the homepage's prerendered markup, but the browser loaded it at the *missed*
 * URL, so the client resolved a different route and hydrated the homepage body
 * against a different tree — React tore the whole page down and re-rendered
 * (hydration error #418) on every 404 hit.
 *
 * The fix has two halves: this page renders the 404 copy, and `App` forces this
 * component whenever the served document is marked as the 404 document, so the
 * server and client agree no matter what URL the visitor actually requested.
 *
 * Copy is static on purpose: a record that never varies cannot drift between the
 * prerender and hydration, which is what caused the mismatch in the first place.
 */
export default function NotFound({ seo }: { seo: SeoRecord }) {
  const t = ui(seo.locale);

  return (
    <>
      <SeoHead seo={seo} />
      <Layout locale={seo.locale}>
        <article className="section prose-page">
          <div className="container prose">
            <span className="eyebrow">404</span>
            <h1>{t.notFoundTitle}</h1>
            <p className="lede">{t.notFoundBody}</p>

            <p>
              <a className="btn btn-primary" href={`${localeHome(seo.locale)}#calculator-library`}>
                {t.browseTools}
              </a>
            </p>

            <p>
              <a href="/">{t.home}</a>
            </p>
          </div>
        </article>
      </Layout>
    </>
  );
}
