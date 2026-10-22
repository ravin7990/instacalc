import { useState, useEffect } from "react";
import type { Locale } from "@/config/site";
import { localeOrRoot } from "@/data/pageExists";

const COOKIE_STORAGE_KEY = "ic_cookie_consent";

interface CookieBannerProps {
  locale: Locale;
}

const COPY: Record<Locale, { text: string; privacy: string; accept: string; essential: string }> = {
  en: {
    text: "We use cookies and similar technologies (including Google AdSense and Analytics) to ensure security, analyze site traffic, and personalize your experience.",
    privacy: "Privacy Policy",
    accept: "Accept All",
    essential: "Essential Only",
  },
  us: {
    text: "We use cookies and similar technologies (including Google AdSense and Analytics) to ensure security, analyze site traffic, and personalize your experience.",
    privacy: "Privacy Policy",
    accept: "Accept All",
    essential: "Essential Only",
  },
  ja: {
    text: "当サイトでは、セキュリティ確保、アクセス解析、およびGoogle AdSenseによる広告配信・パーソナライズのためにクッキーを使用しています。",
    privacy: "プライバシーポリシー",
    accept: "すべて同意",
    essential: "必須のみ",
  },
  ru: {
    text: "Мы используем файлы cookie и аналогичные технологии (включая Google AdSense и Analytics) для обеспечения безопасности, анализа трафика и персонализации.",
    privacy: "Политика конфиденциальности",
    accept: "Принять все",
    essential: "Только обязательные",
  },
  ko: {
    text: "인스타칼크는 웹 보안, 트래픽 분석 및 개인화된 서비스 제공을 위해 쿠키(Google AdSense 및 Analytics 포함)를 사용합니다.",
    privacy: "개인정보 처리방침",
    accept: "모두 동의",
    essential: "필수 항목만",
  },
};

export function CookieBanner({ locale }: CookieBannerProps) {
  const [visible, setVisible] = useState(false);
  const copy = COPY[locale] ?? COPY.en;
  const privacyHref = localeOrRoot(locale, "privacypolicy.html") ?? "/privacypolicy.html";

  useEffect(() => {
    try {
      // If Google's IAB TCF CMP or Funding Choices is detected, let it manage consent
      if (typeof window !== "undefined" && ((window as unknown as { __tcfapi?: unknown }).__tcfapi || (window as unknown as { googlefc?: unknown }).googlefc)) {
        return;
      }
      const consent = window.localStorage.getItem(COOKIE_STORAGE_KEY);
      if (!consent) {
        setVisible(true);
      }
    } catch {
      // private browsing mode fallback
    }
  }, []);

  const handleChoice = (val: "all" | "essential") => {
    try {
      window.localStorage.setItem(COOKIE_STORAGE_KEY, val);
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="cookie-consent-bar"
      role="region"
      aria-label="Cookie consent banner"
    >
      <div className="container cookie-inner">
        <p className="cookie-text">
          {copy.text}{" "}
          <a href={privacyHref} className="cookie-link">
            {copy.privacy}
          </a>
          .
        </p>
        <div className="cookie-actions">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => handleChoice("essential")}
          >
            {copy.essential}
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => handleChoice("all")}
          >
            {copy.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
