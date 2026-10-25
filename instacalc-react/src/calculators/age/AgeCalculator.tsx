import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { DateField, DatePresets } from "@/components/calculator/DateField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateAge, toIsoDate, addToDate } from "@/engines/dates";
import { formatNumber, formatWeekday, formatJapaneseEra } from "@/lib/currency";
import { ageCopy } from "@/i18n/date-labels";
import { UsAgeArticle } from "@/components/articles/us/UsAgeArticle";
import { JaAgeArticle } from "@/components/articles/ja/JaAgeArticle";
import { RuAgeArticle } from "@/components/articles/ru/RuAgeArticle";
import { InAgeArticle } from "@/components/articles/in/InAgeArticle";

function formatAgeSummary(locale: string, y: number, m: number, d: number): string {
  if (locale === "ja") {
    return `${y}歳 ${m}ヶ月 ${d}日`;
  }
  if (locale === "ko") {
    return `만 ${y}세 ${m}개월 ${d}일`;
  }
  if (locale === "ru") {
    const plural = (num: number, one: string, two: string, five: string) => {
      const mod10 = num % 10;
      const mod100 = num % 100;
      if (mod100 >= 11 && mod100 <= 19) return `${num} ${five}`;
      if (mod10 === 1) return `${num} ${one}`;
      if (mod10 >= 2 && mod10 <= 4) return `${num} ${two}`;
      return `${num} ${five}`;
    };
    return `${plural(y, "год", "года", "лет")} ${plural(m, "месяц", "месяца", "месяцев")} ${plural(d, "день", "дня", "дней")}`;
  }
  if (locale === "en") {
    return `${y} years, ${m} months, ${d} days`;
  }
  return `${y}y ${m}m ${d}d`;
}

const RU_ZODIAC: Record<string, string> = {
  Capricorn: "Козерог",
  Aquarius: "Водолей",
  Pisces: "Рыбы",
  Aries: "Овен",
  Taurus: "Телец",
  Gemini: "Близнецы",
  Cancer: "Рак",
  Leo: "Лев",
  Virgo: "Дева",
  Libra: "Весы",
  Scorpio: "Скорпион",
  Sagittarius: "Стрелец",
};

const RU_BIRTHSTONES: Record<string, string> = {
  Garnet: "Гранат",
  Amethyst: "Аметист",
  Aquamarine: "Аквамарин",
  Diamond: "Алмаз",
  Emerald: "Изумруд",
  Pearl: "Жемчуг",
  Ruby: "Рубин",
  Peridot: "Перидот",
  Sapphire: "Сапфир",
  Opal: "Опал",
  Topaz: "Топаз",
  Turquoise: "Бирюза",
};

const JA_ZODIAC: Record<string, string> = {
  Capricorn: "山羊座",
  Aquarius: "水瓶座",
  Pisces: "魚座",
  Aries: "牡羊座",
  Taurus: "牡牛座",
  Gemini: "双子座",
  Cancer: "蟹座",
  Leo: "獅子座",
  Virgo: "乙女座",
  Libra: "天秤座",
  Scorpio: "蠍座",
  Sagittarius: "射手座",
};

const JA_BIRTHSTONES: Record<string, string> = {
  Garnet: "ガーネット",
  Amethyst: "アメジスト",
  Aquamarine: "アクアマリン",
  Diamond: "ダイヤモンド",
  Emerald: "エメラルド",
  Pearl: "真珠",
  Ruby: "ルビー",
  Peridot: "ペリドット",
  Sapphire: "サファイア",
  Opal: "オパール",
  Topaz: "トパーズ",
  Turquoise: "ターコイズ",
};

/**
 * Age calculator. Serves both /agecalculator.html and /duration/agecalculator.html
 * — the two legacy pages share one calculation, differing only in which results
 * they surface.
 */
export default function AgeCalculator({ seo }: { seo: SeoRecord }) {
  const c = ageCopy(seo.locale);

  // Default to 25 years ago, matching the legacy page's initial state.
  const [dob, setDob] = useState(() => toIsoDate(addToDate(new Date(), { years: -25 })));
  const [target, setTarget] = useState(() => toIsoDate(new Date()));

  const result = useMemo(() => {
    const b = new Date(`${dob}T00:00:00`);
    const t = new Date(`${target}T00:00:00`);
    if (Number.isNaN(b.getTime()) || Number.isNaN(t.getTime())) return null;
    return calculateAge(b, t);
  }, [dob, target]);

  const n = (v: number) => formatNumber(seo.locale, v);
  const today = toIsoDate(new Date());

  // Presets for Date of Birth: pick a quick age
  const dobPresets = useMemo(() => {
    const isJa = seo.locale === "ja";
    const isKo = seo.locale === "ko";
    const isRu = seo.locale === "ru";
    const isUs = seo.locale === "us";

    if (isJa) {
      return [
        { label: "18歳", iso: toIsoDate(addToDate(new Date(), { years: -18 })) },
        { label: "20歳 (成人)", iso: toIsoDate(addToDate(new Date(), { years: -20 })) },
        { label: "25歳", iso: toIsoDate(addToDate(new Date(), { years: -25 })) },
        { label: "60歳 (還暦)", iso: toIsoDate(addToDate(new Date(), { years: -60 })) },
      ];
    }
    if (isKo) {
      return [
        { label: "18세", iso: toIsoDate(addToDate(new Date(), { years: -18 })) },
        { label: "20세", iso: toIsoDate(addToDate(new Date(), { years: -20 })) },
        { label: "25세", iso: toIsoDate(addToDate(new Date(), { years: -25 })) },
        { label: "60세", iso: toIsoDate(addToDate(new Date(), { years: -60 })) },
      ];
    }
    if (isRu) {
      return [
        { label: "18 лет", iso: toIsoDate(addToDate(new Date(), { years: -18 })) },
        { label: "21 год", iso: toIsoDate(addToDate(new Date(), { years: -21 })) },
        { label: "25 лет", iso: toIsoDate(addToDate(new Date(), { years: -25 })) },
        { label: "60 лет", iso: toIsoDate(addToDate(new Date(), { years: -60 })) },
      ];
    }
    if (isUs) {
      return [
        { label: "18 yrs", iso: toIsoDate(addToDate(new Date(), { years: -18 })) },
        { label: "21 yrs", iso: toIsoDate(addToDate(new Date(), { years: -21 })) },
        { label: "25 yrs", iso: toIsoDate(addToDate(new Date(), { years: -25 })) },
        { label: "65 yrs", iso: toIsoDate(addToDate(new Date(), { years: -65 })) },
      ];
    }
    return [
      { label: "18 yrs", iso: toIsoDate(addToDate(new Date(), { years: -18 })) },
      { label: "21 yrs", iso: toIsoDate(addToDate(new Date(), { years: -21 })) },
      { label: "25 yrs", iso: toIsoDate(addToDate(new Date(), { years: -25 })) },
      { label: "60 yrs", iso: toIsoDate(addToDate(new Date(), { years: -60 })) },
    ];
  }, [seo.locale]);

  // Presets for Target Date (Age as of Date)
  const targetPresets = useMemo(() => {
    const now = new Date();
    const todayIso = toIsoDate(now);
    const nextYearIso = toIsoDate(addToDate(now, { years: 1 }));

    if (seo.locale === "en") {
      const thisYearAug1 = new Date(now.getFullYear(), 7, 1);
      const upcomingAug1 = thisYearAug1 < now ? new Date(now.getFullYear() + 1, 7, 1) : thisYearAug1;
      const upcomingJan1 = new Date(now.getFullYear() + 1, 0, 1);
      return [
        { label: c.today, iso: todayIso },
        { label: "1 Aug (UPSC)", iso: toIsoDate(upcomingAug1) },
        { label: "1 Jan (SSC)", iso: toIsoDate(upcomingJan1) },
        { label: "+1 Year", iso: nextYearIso },
      ];
    }

    if (seo.locale === "us") {
      const eoy = new Date(now.getFullYear(), 11, 31);
      return [
        { label: c.today, iso: todayIso },
        { label: "End of Year", iso: toIsoDate(eoy) },
        { label: "+1 Year", iso: nextYearIso },
      ];
    }

    if (seo.locale === "ja") {
      const eoy = new Date(now.getFullYear(), 11, 31);
      return [
        { label: c.today, iso: todayIso },
        { label: "年末", iso: toIsoDate(eoy) },
        { label: "+1年", iso: nextYearIso },
      ];
    }

    if (seo.locale === "ru") {
      const eoy = new Date(now.getFullYear(), 11, 31);
      return [
        { label: c.today, iso: todayIso },
        { label: "Конец года", iso: toIsoDate(eoy) },
        { label: "+1 год", iso: nextYearIso },
      ];
    }

    if (seo.locale === "ko") {
      const eoy = new Date(now.getFullYear(), 11, 31);
      return [
        { label: c.today, iso: todayIso },
        { label: "연말", iso: toIsoDate(eoy) },
        { label: "+1년", iso: nextYearIso },
      ];
    }

    return [
      { label: c.today, iso: todayIso },
      { label: "+1 Year", iso: nextYearIso },
    ];
  }, [c.today, seo.locale]);

  return (
    <>
      <SeoHead seo={seo} appCategory="UtilitiesApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero seo={seo} eyebrow={c.eyebrow} points={[c.years, c.totalDays, c.nextBirthday, c.zodiac]} />

        <CalculatorShell
          locale={seo.locale}
          id="age-calculator"
          title={c.age}
          summary={result ? { label: c.age, value: formatAgeSummary(seo.locale, result.years, result.months, result.days) } : null}
          inputs={
            <div className="age-inputs-stack">
              <div className="age-dates-grid">
                <div className="age-date-group">
                  <DateField label={c.dob} value={dob} onChange={setDob} max={today} />
                  <DatePresets presets={dobPresets} onPick={setDob} />
                </div>
                <div className="age-date-group">
                  <DateField label={c.target} value={target} onChange={setTarget} />
                  <DatePresets presets={targetPresets} onPick={setTarget} />
                </div>
              </div>

              {result ? (
                <div className="lifetime-units-card">
                  <div className="lifetime-units-head">
                    <span aria-hidden="true">⏱️</span>
                    <span>
                      {seo.locale === "ja"
                        ? "これまでに経過した時間"
                        : seo.locale === "ru"
                        ? "Истекшие единицы времени"
                        : seo.locale === "ko"
                        ? "생애 총 경과 시간"
                        : "Lifetime Elapsed Units"}
                    </span>
                  </div>
                  <div className="lifetime-grid">
                    <div className="lifetime-stat">
                      <span className="lifetime-val">{n(result.totalMonths)}</span>
                      <span className="lifetime-lbl">{c.totalMonths}</span>
                    </div>
                    <div className="lifetime-stat">
                      <span className="lifetime-val">{n(result.totalWeeks)}</span>
                      <span className="lifetime-lbl">{c.totalWeeks}</span>
                    </div>
                    <div className="lifetime-stat">
                      <span className="lifetime-val">{n(result.totalDays)}</span>
                      <span className="lifetime-lbl">{c.totalDays}</span>
                    </div>
                    <div className="lifetime-stat">
                      <span className="lifetime-val">{n(result.totalHours)}</span>
                      <span className="lifetime-lbl">{c.totalHours}</span>
                    </div>
                    <div className="lifetime-stat">
                      <span className="lifetime-val">{n(result.totalMinutes)}</span>
                      <span className="lifetime-lbl">{c.totalMinutes}</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          }
          results={
            result ? (
              <ul className="kv-list">
                {/* Primary milestones and astrological data */}
                <li>
                  <span className="kv-key">{c.nextBirthday}</span>
                  <span className="kv-value">
                    {result.daysToNextBirthday === 0 ? c.today : `${n(result.daysToNextBirthday)} ${c.days}`}
                  </span>
                </li>
                <li>
                  <span className="kv-key">{c.bornOn}</span>
                  <span className="kv-value">{formatWeekday(seo.locale, dob)}</span>
                </li>
                {seo.locale === "ja" && formatJapaneseEra(dob) && (
                  <li>
                    <span className="kv-key">生まれ年の和暦</span>
                    <span className="kv-value">{formatJapaneseEra(dob)}</span>
                  </li>
                )}
                {seo.locale === "ja" && (
                  <li>
                    <span className="kv-key">数え年</span>
                    <span className="kv-value">{result.years + 1} 歳</span>
                  </li>
                )}
                <li>
                  <span className="kv-key">{c.zodiac}</span>
                  <span className="kv-value">
                    {seo.locale === "ru"
                      ? RU_ZODIAC[result.zodiac] ?? result.zodiac
                      : seo.locale === "ja"
                      ? JA_ZODIAC[result.zodiac] ?? result.zodiac
                      : result.zodiac}
                  </span>
                </li>
                <li>
                  <span className="kv-key">{c.birthstone}</span>
                  <span className="kv-value">
                    {seo.locale === "ru"
                      ? RU_BIRTHSTONES[result.birthstone] ?? result.birthstone
                      : seo.locale === "ja"
                      ? JA_BIRTHSTONES[result.birthstone] ?? result.birthstone
                      : result.birthstone}
                  </span>
                </li>
                <li>
                  <span className="kv-key">{c.leapYears}</span>
                  <span className="kv-value">{n(result.leapYears)}</span>
                </li>
                {/* Hidden items preserved for CSV/PDF report scraping */}
                <li className="sr-only">
                  <span className="kv-key">{c.totalMonths}</span>
                  <span className="kv-value">{n(result.totalMonths)}</span>
                </li>
                <li className="sr-only">
                  <span className="kv-key">{c.totalWeeks}</span>
                  <span className="kv-value">{n(result.totalWeeks)}</span>
                </li>
                <li className="sr-only">
                  <span className="kv-key">{c.totalDays}</span>
                  <span className="kv-value">{n(result.totalDays)}</span>
                </li>
                <li className="sr-only">
                  <span className="kv-key">{c.totalHours}</span>
                  <span className="kv-value">{n(result.totalHours)}</span>
                </li>
                <li className="sr-only">
                  <span className="kv-key">{c.totalMinutes}</span>
                  <span className="kv-value">{n(result.totalMinutes)}</span>
                </li>
              </ul>
            ) : (
              <p className="helper-text">{c.pickDate}</p>
            )
          }
        />

        {seo.locale === "us" && <UsAgeArticle />}
        {seo.locale === "ja" && <JaAgeArticle />}
        {seo.locale === "ru" && <RuAgeArticle />}
        {seo.locale === "en" && <InAgeArticle />}

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
