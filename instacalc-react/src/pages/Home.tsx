import { useState, useEffect } from "react";
import type { SeoRecord } from "@/data/seo";
import { Layout } from "@/components/layout/Layout";
import { UnitConverter } from "@/components/home/UnitConverter";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { toolGroups, prefix } from "@/data/tools";
import { Icon } from "@/components/layout/SiteHeader";
import { UsHomeArticle } from "@/components/articles/us/UsHomeArticle";
import { JaHomeArticle } from "@/components/articles/ja/JaHomeArticle";
import { KoHomeArticle } from "@/components/articles/ko/KoHomeArticle";
import { RuHomeArticle } from "@/components/articles/ru/RuHomeArticle";
import { InHomeArticle } from "@/components/articles/in/InHomeArticle";


export default function Home({ seo }: { seo: SeoRecord }) {
  const groups = toolGroups(seo.locale);
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState("all");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const qParam = new URLSearchParams(window.location.search).get("q");
      if (qParam) setQuery(qParam);
    }
  }, []);

  const total = groups.reduce((n, g) => n + g.tools.length, 0);

  // Flat list carrying each tool's category, so a single search box can span
  // every category at once. Previously the only way to reach a tool was to
  // scroll through accordions, which does not scale to 118 tools.
  const allTools = groups.flatMap((g) =>
    g.tools.map((t) => ({ ...t, groupId: g.id, groupName: g.name })),
  );

  const q = query.trim().toLowerCase();
  const results = allTools.filter((t) => {
    if (activeGroup !== "all" && t.groupId !== activeGroup) return false;
    if (!q) return true;
    return (
      t.label.toLowerCase().includes(q) ||
      t.groupName.toLowerCase().includes(q) ||
      t.path.toLowerCase().includes(q)
    );
  });

  // While typing, a compact list right under the search box is enough; the full
  // library below would just repeat it.
  const suggestions = q ? results.slice(0, 6) : [];
  const searching = q.length > 0;

  const isKo = seo.locale === "ko";
  const isJa = seo.locale === "ja";
  const isUs = seo.locale === "us";
  const isRu = seo.locale === "ru";

  const popular =
    isJa
      ? [
          { path: "furusato-nouzei-calculator.html", label: "ふるさと納税 限度額計算" },
          { path: "salarycalculator.html", label: "給与手取り・年収計算" },
          { path: "jutaku-loan-kojo-calculator.html", label: "住宅ローン控除（減税）計算" },
          { path: "sipcalculator.html", label: "新NISA つみたて投資 複利計算" },
          { path: "ideco-calculator.html", label: "iDeCo 確定拠出年金 節税計算" },
          { path: "duration/agecalculator.html", label: "年齢計算・和暦早見表" },
        ]
      : isKo
      ? [
          { path: "moretools/concretecalculator.html", label: "콘크리트·레미콘 루베(m³) 계산기" },
          { path: "moretools/diagonalcalculator.html", label: "대각선·TV 화면 인치 계산기" },
          { path: "moretools/trignometrycalculator.html", label: "삼각함수(sin·cos·tan) 각도 계산기" },
        ]
      : isRu
      ? [
          { path: "emicalculator.html", label: "Кредитный калькулятор (аннуитет)" },
          { path: "gstcalculator.html", label: "Калькулятор НДС 20% и 10%" },
          { path: "fdcalculator.html", label: "Калькулятор вкладов с капитализацией" },
          { path: "moretools/concretecalculator.html", label: "Калькулятор бетона (кубы м³)" },
          { path: "duration/agecalculator.html", label: "Калькулятор возраста и стажа" },
          { path: "compoundinterest.html", label: "Сложные проценты и капитализация" },
        ]
      : groups[0]?.tools.slice(0, 6) ?? [];

  return (
    <>
      <SeoHead seo={seo} />
      <Layout locale={seo.locale}>
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              {/* No "+": `total` is the exact number of tools listed below, so
                  claiming "30+" when there are precisely 30 overstates it. */}
              <span className="hero-tag">
                {isJa
                  ? `無料の高精度オンライン計算ツール ${total}選`
                  : isKo
                  ? `대한민국 표준 무료 온라인 계산기 ${total}선`
                  : isRu
                  ? `Бесплатные онлайн-калькуляторы (${total})`
                  : `${total} free calculator tools`}
              </span>
              <h1>{seo.h1 || seo.title}</h1>
              <p>{seo.description}</p>

              <div className="hero-search">
                <label htmlFor="tool-search" className="sr-only">
                  {isJa ? "計算機を検索" : isKo ? "계산기 검색" : isRu ? "Поиск калькулятора" : "Search calculators"}
                </label>
                <span className="hero-search-icon" aria-hidden="true">
                  <Icon name="search" size={18} />
                </span>
                <input
                  id="tool-search"
                  className="hero-search-input"
                  type="search"
                  placeholder={
                    isJa
                      ? "計算ツールを検索 — 「ふるさと納税」「住宅ローン控除」「新NISA」「手取り」など…"
                      : isKo
                      ? "계산기 검색 — 「콘크리트 루베」, 「대각선·TV 화면」, 「삼각함수」 등…"
                      : isRu
                      ? "Поиск калькуляторов — «кредит», «вклад», «НДС», «бетон», «возраст»…"
                      : isUs
                      ? "Search calculators — try “Mortgage”, “401(k)” or “Paycheck”…"
                      : "Search calculators — try “EMI”, “GST” or “age”…"
                  }
                  autoComplete="off"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query ? (
                  <button
                    type="button"
                    className="hero-search-clear"
                    aria-label={isJa ? "検索をクリア" : isKo ? "검색어 지우기" : isRu ? "Очистить поиск" : "Clear search"}
                    onClick={() => setQuery("")}
                  >
                    ×
                  </button>
                ) : null}

                {suggestions.length ? (
                  <ul className="search-results" aria-label="Search results">
                    {suggestions.map((t) => (
                      <li key={t.path}>
                        <a className="search-result" href={prefix(seo.locale, t.path)}>
                          <span className="search-result-label">{t.label}</span>
                          <span className="search-result-group">{t.groupName}</span>
                        </a>
                      </li>
                    ))}
                    <li className="search-results-more">
                      <a
                        href="#calculator-library"
                        onClick={() => {
                          document
                            .getElementById("calculator-library")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }}
                      >
                        {isJa
                          ? `該当するすべての計算機（${results.length}件）を見る`
                          : isKo
                          ? `일치하는 계산기 전체 보기 (${results.length}개)`
                          : isRu
                          ? `Показать все подходящие калькуляторы (${results.length})`
                          : `See all ${results.length} matching calculator${results.length === 1 ? "" : "s"}`}
                      </a>
                    </li>
                  </ul>
                ) : null}
              </div>

              <div className="hero-actions">
                <a className="btn btn-primary" href="#calculator-library">
                  {isJa ? `全${total}種のツールを見る` : isKo ? `전체 ${total}종 계산기 보기` : isRu ? `Все калькуляторы (${total})` : `Browse all ${total} tools`}
                </a>
                <a className="btn btn-ghost" href="#unit-converter">
                  {isJa ? "単位換算ツールを試す" : isKo ? "스마트 단위 변환기" : isRu ? "Конвертер величин" : "Try unit converter"}
                </a>
              </div>
            </div>

            <aside className="hero-panel">
              <h2>{isJa ? "人気の計算ツール" : isKo ? "주요 추천 계산기" : isRu ? "Популярные калькуляторы" : "Popular calculators"}</h2>
              <ul className="quick-links">
                {popular.map((t) => (
                  <li key={t.path}>
                    <a className="quick-link" href={prefix(seo.locale, t.path)}>
                      <span>{t.label}</span>
                      <span aria-hidden="true">→</span>
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <UnitConverter locale={seo.locale} />

        <section id="calculator-library" className="section">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">{isJa ? "計算ツール一覧" : isKo ? "계산기 전체 목록" : isRu ? "Каталог калькуляторов" : "Calculator Library"}</span>
              <h2>{isJa ? "カテゴリー別 全計算ツール" : isKo ? "분야별 온라인 계산 도구" : isRu ? "Все калькуляторы по разделам" : "Every tool, organised by category"}</h2>
              <p>{isJa ? "カテゴリーを選択するか、キーワード検索で素早く絞り込めます。" : isKo ? "카테고리를 선택하거나 검색어를 입력하여 원하는 도구를 빠르게 찾아보세요." : isRu ? "Выберите раздел или воспользуйтесь быстрым поиском по названию." : "Pick a category or search to narrow things down."}</p>
            </div>

            <div className="filter-bar" role="group" aria-label={isJa ? "カテゴリーで絞り込み" : isKo ? "카테고리별 필터" : isRu ? "Фильтр по разделам" : "Filter by category"}>
              <button
                type="button"
                className="filter-chip"
                aria-pressed={activeGroup === "all"}
                onClick={() => setActiveGroup("all")}
              >
                {isJa ? "すべて" : isKo ? "전체" : isRu ? "Все" : "All"} <span className="filter-chip-count">{total}</span>
              </button>
              {groups.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className="filter-chip"
                  aria-pressed={activeGroup === g.id}
                  onClick={() => setActiveGroup(activeGroup === g.id ? "all" : g.id)}
                >
                  {g.name} <span className="filter-chip-count">{g.tools.length}</span>
                </button>
              ))}
            </div>

            <p className="result-count" aria-live="polite">
              {searching
                ? isJa
                  ? `「${query.trim()}」の検索結果: ${results.length}件`
                  : isKo
                  ? `「${query.trim()}」 검색 결과: ${results.length}개`
                  : isRu
                  ? `Результаты поиска «${query.trim()}»: ${results.length}`
                  : `${results.length} match${results.length === 1 ? "" : "es"} for “${query.trim()}”`
                : isJa
                  ? `全${results.length}件の計算ツールを表示中`
                  : isKo
                  ? `전체 ${results.length}개의 계산기 표시 중`
                  : isRu
                  ? `Отображаются все калькуляторы (${results.length})`
                  : `Showing all ${results.length} calculators`}
            </p>

            {results.length ? (
              <div className="tool-grid">
                {results.map((t) => (
                  <a className="tool-card" key={t.path} href={prefix(seo.locale, t.path)}>
                    <span className="tool-card-label">{t.label}</span>
                    <span className="tool-card-group">{t.groupName}</span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="empty-state">
                {isJa ? (
                  <>「<strong>{query.trim()}</strong>」に一致する計算ツールは見つかりませんでした。別のキーワードでお試しいただくか、カテゴリーを選択してください。</>
                ) : isKo ? (
                  <>「<strong>{query.trim()}</strong>」에 일치하는 계산기를 찾을 수 없습니다. 다른 검색어를 입력하거나 카테고리를 선택해주세요.</>
                ) : isRu ? (
                  <>По запросу «<strong>{query.trim()}</strong>» ничего не найдено. Попробуйте изменить формулировку или выберите раздел выше.</>
                ) : (
                  <>No calculators match <strong>“{query.trim()}”</strong>. Try a shorter word, or pick a different category.</>
                )}
              </p>
            )}
          </div>
        </section>

        {seo.locale === "us" && <UsHomeArticle />}
        {seo.locale === "ja" && <JaHomeArticle />}
        {seo.locale === "ko" && <KoHomeArticle />}
        {seo.locale === "ru" && <RuHomeArticle />}
        {seo.locale === "en" && <InHomeArticle />}
        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />

      </Layout>
    </>
  );
}
