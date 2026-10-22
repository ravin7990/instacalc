import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { localeHome } from "@/components/layout/Layout";

export default function DisclaimerPage({ seo }: { seo: SeoRecord }) {
  const faq = extractFaq(seo);
  const isJa = seo.locale === "ja";
  const isRu = seo.locale === "ru";
  const isKo = seo.locale === "ko";

  return (
    <>
      <SeoHead seo={seo} />
      <Layout locale={seo.locale}>
        <section className="hero">
          <div className="container">
            <div className="hero-copy">
              <span className="eyebrow">
                {isJa ? "法的事項" : isRu ? "Правовая информация" : isKo ? "법적 고지" : "Legal & Compliance"}
              </span>
              <h1>
                {isJa
                  ? "免責事項（Disclaimer）"
                  : isRu
                  ? "Отказ от ответственности (Disclaimer)"
                  : isKo
                  ? "면책 조항 (Disclaimer)"
                  : "Disclaimer & Editorial Terms"}
              </h1>
              <p>
                {isJa
                  ? "InstaCalc.inが提供するすべてのオンライン計算機、単位換算、シミュレーション結果に関する利用規約および免責事項をご案内します。"
                  : isRu
                  ? "Настоящий отказ от ответственности регулирует использование всех онлайн-калькуляторов, конвертеров и аналитических материалов InstaCalc.in."
                  : isKo
                  ? "인스타칼크가 제공하는 모든 온라인 계산 도구 및 정보에 대한 법적 책임 한계와 이용 지침을 안내해 드립니다."
                  : "Important legal disclaimers regarding the use, accuracy, mathematical models, and illustrative projections provided on InstaCalc.in."}
              </p>
              <div className="hero-actions">
                <a className="btn btn-primary" href={localeHome(seo.locale)}>
                  {isJa
                    ? "すべての計算ツールを見る"
                    : isRu
                    ? "Смотреть все калькуляторы"
                    : isKo
                    ? "계산기 전체 목록"
                    : "Browse calculators"}
                </a>
                <a className="btn btn-ghost" href="/privacypolicy.html">
                  {isJa ? "プライバシーポリシー" : isRu ? "Политика конфиденциальности" : isKo ? "개인정보 처리방침" : "Privacy Policy"}
                </a>
              </div>
            </div>
          </div>
        </section>

        <article className="section prose-page">
          <div className="container prose">
            <h2>1. General Informational and Educational Purpose</h2>
            <p>
              All content, mathematical algorithms, software calculators, conversion tables, and editorial guides
              published on <strong>InstaCalc.in</strong> are developed and provided solely for general informational,
              educational, and illustrative purposes. While our engineering team strives for the highest degree of
              mathematical rigor and compliance with published standards, we make no representations or warranties
              of any kind, express or implied, regarding the completeness, accuracy, reliability, or suitability of the calculations.
            </p>

            <h2>2. Financial, Investment & YMYL (Your Money Your Life) Disclaimer</h2>
            <p>
              <strong>InstaCalc is not an investment advisor, registered broker-dealer, banking institution, or certified financial planner.</strong>
            </p>
            <ul>
              <li>
                <strong>No Financial Advice:</strong> Calculations for Systematic Investment Plans (SIP), Compound Interest,
                Retirement Planning, Public Provident Fund (PPF), Employee Provident Fund (EPF), National Pension System (NPS),
                and Mutual Fund returns are mathematical estimates based on user-supplied assumptions.
              </li>
              <li>
                <strong>Market Volatility:</strong> Market returns cannot be predicted with certainty. Past historical performance
                does not guarantee future returns. The figures generated do not account for individual risk tolerances, sudden market downturns,
                fund expense ratios, or unexpected economic policy shifts.
              </li>
              <li>
                <strong>Professional Consultation:</strong> Users are strongly advised to consult a certified financial planner (CFP),
                Chartered Accountant (CA), or registered investment advisor before committing real capital to any financial product.
              </li>
            </ul>

            <h2>3. Taxation & Legal Calculations Disclaimer</h2>
            <p>
              Tax calculations (including Indian Income Tax Act 1961 regimes, Goods and Services Tax / GST, US Federal & State Withholding,
              FICA, Japanese 住民税, and Russian НДС) are updated based on publicly released statutory schedules. However, individual tax liabilities
              depend on individual deductions, exemptions, employer benefits, local municipality surcharges, and legislative updates.
              InstaCalc is not a licensed tax preparer or legal counsel. Always verify final filings with official tax authorities (e.g.,
              Income Tax Department of India, US Internal Revenue Service / IRS, National Tax Agency of Japan, or Federal Tax Service of Russia).
            </p>

            <h2>4. Engineering, Construction & Physical Geometry Disclaimer</h2>
            <p>
              Construction calculators (e.g., Concrete Volume in cubic meters/yards, cement bag requirements, and diagonal measurements)
              utilize standard geometric formulas and published industry proportions (KS L 5201, ASTM C150, GOST). However, real-world
              construction outcomes depend on site aggregate grading, moisture content, formwork deflection, and handling waste.
              Site engineers and contractors must verify structural calculations and safety margins independently.
            </p>

            <h2>5. Health, Veterinary & Cat Age Disclaimer</h2>
            <p>
              Calculators such as the Cat Age in Human Years tool are based on veterinary feline life-stage guidelines (AAHA/ISFM)
              for general interest. They do not substitute for certified veterinary diagnostic advice, nutritional counseling, or medical treatment.
            </p>

            <h2>6. Third-Party Links & Advertising Disclaimer</h2>
            <p>
              InstaCalc.in may display advertisements served by Google AdSense and other third-party ad networks. We do not endorse,
              guarantee, or assume responsibility for any product, service, or external website advertised through these ad units.
              Users visiting third-party links are subject to the terms and privacy practices of those external operators.
            </p>

            <h2>7. Limitation of Liability</h2>
            <p>
              In no event shall InstaCalc.in, its operators, developers, or affiliates be liable for any direct, indirect,
              incidental, consequential, special, or exemplary damages arising out of the use, interpretation, or inability
              to use the calculators and information provided on this platform.
            </p>

            <p>
              <small>
                <em>Document last reviewed and updated: October 2026. For questions regarding our legal disclosures, contact <a href="mailto:support@instacalc.in">support@instacalc.in</a>.</em>
              </small>
            </p>
          </div>
        </article>

        <FaqAccordion locale={seo.locale} items={faq} />
      </Layout>
    </>
  );
}
