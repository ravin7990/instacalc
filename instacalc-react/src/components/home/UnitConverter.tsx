import { useDeferredValue, useMemo, useState } from "react";
import {
  CATEGORIES,
  convert,
  formatResult,
  parseConversion,
  searchUnits,
} from "@/engines/units";

import type { Locale } from "@/config/site";
import { trackUnitConvert, trackEvent } from "@/lib/analytics";

/**
 * Natural-language converter: type "15 meter to foot" and get the answer.
 *
 * Parsing runs on the raw string via useDeferredValue so typing stays smooth
 * even as the alias table grows.
 */
export function UnitConverter({ locale = "en" }: { locale?: Locale }) {
  const [input, setInput] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const deferred = useDeferredValue(input);

  const parsed = useMemo(() => parseConversion(deferred), [deferred]);
  const conversion = parsed ? convert(parsed.value, parsed.from, parsed.to) : null;

  // Only suggest once there is a word-like fragment to match on.
  const lastWord = deferred.trim().split(/\s+/).pop() ?? "";
  const suggestions = useMemo(
    () => (deferred.includes(" to ") || !deferred.trim() ? [] : searchUnits(lastWord, 6)),
    [deferred, lastWord],
  );

  const isKo = locale === "ko";
  const isJa = locale === "ja";
  const isRu = locale === "ru";

  return (
    <section className="section" id="unit-converter">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">{isJa ? "高精度単位換算" : isKo ? "스마트 단위 변환" : isRu ? "Быстрая конвертация величин" : "Built-in Converter"}</span>
          <h2>{isJa ? "スマート単位換算ツール" : isKo ? "실시간 단위 변환기" : isRu ? "Умный конвертер единиц" : "Smart Unit Converter"}</h2>
          <p>
            {isJa ? (
              <>自然な入力ですぐに換算できます（例: <strong>5 km to mile</strong>、<strong>100 c to f</strong>、<strong>15 meter to foot</strong>）。</>
            ) : isKo ? (
              <>자연어로 쉽게 입력하여 실시간 환산하세요 (예: <strong>5 km to mile</strong>, <strong>100 c to f</strong>, <strong>15 meter to foot</strong>).</>
            ) : isRu ? (
              <>Вводите величины в формате: <code>5 km to mile</code>, <code>100 c to f</code> или <code>15 m to ft</code>.</>
            ) : (
              <>Type naturally, for example: <strong>5 km to mile</strong> or <strong>100 c to f</strong>.</>
            )}
          </p>
        </div>

        <div className="converter-shell">
          <div className="converter-input-wrap">
            <label htmlFor="conversion-input" className="sr-only">
              {isRu ? "Введите запрос на конвертацию" : "Enter a conversion"}
            </label>
            <input
              type="text"
              id="conversion-input"
              className="converter-input"
              placeholder={
                isJa
                  ? "例: 15 meter to foot、100 kg to pound"
                  : isKo
                  ? "예: 15 meter to foot, 100 kg to pound"
                  : isRu
                  ? "Например: 15 m to ft, 100 kg to lb"
                  : "e.g., 15 meter to foot"
              }
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="go"
              value={input}
              onChange={(e) => {
                const val = e.target.value;
                setInput(val);
                trackUnitConvert(val, !!conversion, parsed?.from, parsed?.to);
              }}
            />
            {input ? (
              <button
                type="button"
                className="converter-clear"
                aria-label={isJa ? "入力をクリア" : isKo ? "입력 지우기" : isRu ? "Очистить ввод" : "Clear input"}
                onClick={() => {
                  setInput("");
                  trackEvent("unit_convert_clear");
                }}
              >
                ×
              </button>
            ) : null}
          </div>

          {suggestions.length ? (
            <ul className="suggestions" aria-label="Unit suggestions">
              {suggestions.map((s) => (
                <li key={`${s.category.id}-${s.unit.id}-${s.alias}`}>
                  <button
                    type="button"
                    onClick={() => {
                      const num = parsed?.value ?? 0;
                      const next = `${num} ${s.alias} to ${parsed?.to ?? s.unit.id}`;
                      setInput(next);
                      trackEvent("unit_suggestion_click", { unit: s.alias, category: s.category.name });
                    }}
                  >
                    <strong>{s.alias}</strong>
                    <span>{s.category.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="results-container" aria-live="polite">
            {conversion ? (
              <p className="conversion-result">
                <strong>
                  {formatResult(conversion.value)} {conversion.from.id}
                </strong>{" "}
                =
                <strong className="conversion-value">
                  {" "}
                  {formatResult(conversion.result)} {conversion.to.id}
                </strong>
                <span className="conversion-cat"> {conversion.category.name}</span>
              </p>
            ) : (
              <p className="helper-text">
                {isJa
                  ? "単位を入力するとリアルタイムに換算結果が表示されます。"
                  : isKo
                  ? "단위를 입력하면 실시간으로 변환 결과가 표시됩니다."
                  : isRu
                  ? "Начните вводить величины для мгновенного перевода."
                  : "Start typing to see instant conversions."}
              </p>
            )}
          </div>

          <div className="converter-foot">
            <button
              type="button"
              className="toggle-categories-btn"
              aria-expanded={showCategories}
              onClick={() => {
                const next = !showCategories;
                setShowCategories(next);
                trackEvent("unit_categories_toggle", { is_open: next });
              }}
            >
              {isJa
                ? showCategories ? "対応カテゴリーを隠す" : "対応カテゴリーを表示"
                : isKo
                ? showCategories ? "지원 단위 목록 닫기" : "지원 단위 목록 보기"
                : isRu
                ? showCategories ? "Скрыть поддерживаемые величины" : "Показать доступные величины"
                : showCategories ? "Hide supported categories" : "Show supported categories"}
            </button>
          </div>

          {showCategories ? (
            <ul className="category-grid">
              {CATEGORIES.map((c) => {
                const localizedName = isRu
                  ? c.id === "length" ? "Длина"
                    : c.id === "mass" ? "Масса"
                    : c.id === "area" ? "Площадь"
                    : c.id === "volume" ? "Объём"
                    : c.id === "temperature" ? "Температура"
                    : c.id === "time" ? "Время"
                    : c.id === "speed" ? "Скорость"
                    : c.id === "digital" ? "Данные"
                    : c.id === "energy" ? "Энергия"
                    : c.id === "pressure" ? "Давление"
                    : c.name
                  : isJa
                  ? c.id === "length" ? "長さ"
                    : c.id === "mass" ? "重さ"
                    : c.id === "area" ? "面積"
                    : c.id === "volume" ? "体積"
                    : c.id === "temperature" ? "温度"
                    : c.id === "time" ? "時間"
                    : c.id === "speed" ? "速度"
                    : c.id === "digital" ? "データ容量"
                    : c.id === "energy" ? "エネルギー"
                    : c.id === "pressure" ? "圧力"
                    : c.name
                  : isKo
                  ? c.id === "length" ? "길이"
                    : c.id === "mass" ? "무게"
                    : c.id === "area" ? "면적"
                    : c.id === "volume" ? "부피"
                    : c.id === "temperature" ? "온도"
                    : c.id === "time" ? "시간"
                    : c.id === "speed" ? "속도"
                    : c.id === "digital" ? "데이터"
                    : c.id === "energy" ? "에너지"
                    : c.id === "pressure" ? "압력"
                    : c.name
                  : c.name;

                return (
                  <li key={c.id}>
                    <strong>{localizedName}</strong>
                    <span>{c.units.length} {isJa ? "単位" : isKo ? "개 단위" : isRu ? "единиц" : "units"}</span>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
