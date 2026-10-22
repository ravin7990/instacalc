import type { Locale } from "@/config/site";

/**
 * UI strings only. Calculator field labels, results and SEO copy stay in each
 * page's SEO record, so translations live with the content they describe.
 */

export interface UiStrings {
  home: string;
  about: string;
  contact: string;
  privacy: string;
  terms: string;
  deleteAccount: string;
  footerTagline: string;
  allTools: string;
  language: string;
  menu: string;
  closeMenu: string;
  backToTop: string;
  reset: string;
  resultsHeadline: string;
  copySummary: string;
  copied: string;
  copyFailed: string;
  advancedOn: string;
  advancedOff: string;
  results: string;
  faq: string;
  breadcrumbHome: string;
  notFoundTitle: string;
  notFoundBody: string;
  browseTools: string;
  skipToContent: string;
  allRightsReserved: string;
  regionBadge: Partial<Record<Locale, string>>;
}

const en: UiStrings = {
  home: "Home",
  about: "About Us",
  contact: "Contact Us",
  privacy: "Privacy Policy",
  terms: "Terms & Conditions",
  deleteAccount: "Delete Account",
  footerTagline: "InstaCalc.in - reliable calculators and converters for daily use.",
  allTools: "All Tools",
  language: "Select Region / Language",
  menu: "Open menu",
  closeMenu: "Close menu",
  backToTop: "Back to top",
  reset: "Reset",
  resultsHeadline: "Your result",
  copySummary: "Copy Summary",
  copied: "Copied",
  copyFailed: "Copy failed",
  advancedOn: "Advanced Controls: On",
  advancedOff: "Advanced Controls: Off",
  results: "Results",
  faq: "Frequently Asked Questions",
  breadcrumbHome: "Home",
  notFoundTitle: "Page not found",
  notFoundBody: "The tool you are looking for is unavailable.",
  browseTools: "Browse all calculators",
  skipToContent: "Skip to main content",
  allRightsReserved: "All rights reserved.",
  regionBadge: { us: "USA" },
};

const ja: UiStrings = {
  ...en,
  home: "ホーム",
  about: "会社概要",
  contact: "お問い合わせ",
  privacy: "プライバシーポリシー",
  terms: "利用規約",
  deleteAccount: "アカウント削除",
  footerTagline: "InstaCalc.in - 毎日使える信頼できる計算ツールと変換ツール。",
  allTools: "すべてのツール",
  language: "地域 / 言語を選択",
  menu: "メニューを開く",
  closeMenu: "メニューを閉じる",
  backToTop: "ページ上部へ",
  reset: "リセット",
  resultsHeadline: "計算結果",
  copySummary: "結果をコピー",
  copied: "コピーしました",
  copyFailed: "コピーに失敗しました",
  advancedOn: "詳細設定: オン",
  advancedOff: "詳細設定: オフ",
  results: "計算結果",
  faq: "よくある質問",
  breadcrumbHome: "ホーム",
  notFoundTitle: "ページが見つかりません",
  notFoundBody: "お探しのツールは現在ご利用いただけません。",
  browseTools: "すべての計算ツールを見る",
  skipToContent: "メインコンテンツへスキップ",
  allRightsReserved: "無断転載を禁じます。",
  regionBadge: { ja: "日本" },
};

const ru: UiStrings = {
  ...en,
  home: "Главная",
  about: "О нас",
  contact: "Контакты",
  privacy: "Политика конфиденциальности",
  terms: "Условия использования",
  deleteAccount: "Удалить аккаунт",
  footerTagline: "InstaCalc.in - надёжные калькуляторы и конвертеры для повседневных задач.",
  allTools: "Все инструменты",
  language: "Выберите регион / язык",
  menu: "Открыть меню",
  closeMenu: "Закрыть меню",
  backToTop: "Наверх",
  reset: "Сбросить",
  resultsHeadline: "Ваш результат",
  copySummary: "Копировать",
  copied: "Скопировано",
  copyFailed: "Ошибка копирования",
  advancedOn: "Доп. настройки: вкл",
  advancedOff: "Доп. настройки: выкл",
  results: "Результаты",
  faq: "Часто задаваемые вопросы",
  breadcrumbHome: "Главная",
  notFoundTitle: "Страница не найдена",
  notFoundBody: "Запрашиваемый инструмент недоступен.",
  browseTools: "Смотреть все калькуляторы",
  skipToContent: "Перейти к основному содержимому",
  allRightsReserved: "Все права защищены.",
  regionBadge: { ru: "Россия" },
};

const ko: UiStrings = {
  ...en,
  home: "홈",
  about: "회사 소개",
  contact: "문의하기",
  privacy: "개인정보 처리방침",
  terms: "이용약관",
  deleteAccount: "계정 삭제",
  footerTagline: "InstaCalc.in - 일상에서 활용하는 신뢰할 수 있는 계산기와 변환 도구.",
  allTools: "전체 도구",
  language: "지역 / 언어 선택",
  menu: "메뉴 열기",
  closeMenu: "메뉴 닫기",
  backToTop: "맨 위로",
  reset: "초기화",
  resultsHeadline: "결과",
  copySummary: "결과 복사",
  copied: "복사됨",
  copyFailed: "복사 실패",
  advancedOn: "고급 설정: 켜짐",
  skipToContent: "본문 바로가기",
  allRightsReserved: "모든 권리 보유.",
  advancedOff: "고급 설정: 꺼짐",
  results: "결과",
  faq: "자주 묻는 질문",
  breadcrumbHome: "홈",
  notFoundTitle: "페이지를 찾을 수 없습니다",
  notFoundBody: "요청하신 도구를 사용할 수 없습니다.",
  browseTools: "모든 계산기 보기",
  regionBadge: { ko: "한국" },
};

export const UI: Record<Locale, UiStrings> = { en, us: en, ja, ru, ko };

export function ui(locale: Locale): UiStrings {
  return UI[locale] ?? en;
}
