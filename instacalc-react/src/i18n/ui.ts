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
  share: string;
  shared: string;
  shareFailed: string;
  downloadPdf: string;
  reportTitle: string;
  reportInputs: string;
  reportResults: string;
  reportGenerated: string;
  reportVerified: string;
  reportDisclaimer: string;
  exportCsv: string;
  exportedCsv: string;
  compare: string;
  comparing: string;
  clearCompare: string;
  scenarioA: string;
  scenarioB: string;
  difference: string;
  embed: string;
  embedTitle: string;
  embedDesc: string;
  embedCopied: string;
  saveHistory: string;
  savedHistory: string;
  history: string;
  historyTitle: string;
  historyEmpty: string;
  loadHistory: string;
  loadedHistory: string;
  selectAll: string;
  exportSelectedPdf: string;
  exportSelectedCsv: string;
  deleteSelected: string;
  clearHistory: string;
  advancedOn: string;
  advancedOff: string;
  results: string;
  faq: string;
  relatedCalculators: string;
  relatedCalculatorsSub: string;
  calculateNow: string;
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
  share: "Share",
  shared: "Link Copied!",
  shareFailed: "Unable to share",
  downloadPdf: "Download PDF (A4)",
  reportTitle: "Calculation Report",
  reportInputs: "Input Parameters",
  reportResults: "Calculation Breakdown",
  reportGenerated: "Generated on",
  reportVerified: "Official Calculation Report",
  reportDisclaimer: "This report is generated for educational and analytical purposes only. Calculations are estimates based on user inputs and current financial models and do not constitute certified legal, tax, or investment advice.",
  exportCsv: "Export CSV",
  exportedCsv: "CSV Exported",
  compare: "Compare",
  comparing: "Comparing",
  clearCompare: "Clear",
  scenarioA: "Scenario A",
  scenarioB: "Scenario B (Current)",
  difference: "Difference",
  embed: "Embed",
  embedTitle: "Embed this Calculator",
  embedDesc: "Copy this responsive code snippet to embed on your website or blog:",
  embedCopied: "Embed Code Copied!",
  saveHistory: "Save to History",
  savedHistory: "Saved to History!",
  history: "History",
  historyTitle: "Calculation History",
  historyEmpty: "No saved calculations yet. Make a calculation and click 'Save to History'.",
  loadHistory: "Load",
  loadedHistory: "Loaded",
  selectAll: "Select All",
  exportSelectedPdf: "Export Selected PDF",
  exportSelectedCsv: "Export Selected CSV",
  deleteSelected: "Delete Selected",
  clearHistory: "Clear All",
  advancedOn: "Advanced Controls: On",
  advancedOff: "Advanced Controls: Off",
  results: "Results",
  faq: "Frequently Asked Questions",
  relatedCalculators: "Related Calculators",
  relatedCalculatorsSub: "Explore other financial tools to compare investments, plan loans, and optimize your savings.",
  calculateNow: "Calculate Now",
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
  share: "共有",
  shared: "リンクをコピーしました",
  shareFailed: "共有できませんでした",
  downloadPdf: "PDF出力 (A4)",
  reportTitle: "計算結果レポート",
  reportInputs: "入力条件・設定パラメータ",
  reportResults: "計算結果および内訳",
  reportGenerated: "作成日時",
  reportVerified: "公式計算結果レポート",
  reportDisclaimer: "本レポートはシミュレーションおよび参考情報の提供を目的として作成されたものであり、将来の運用成果や実際の税額・支払額を保証するものではありません。税務・法務・投資判断は専門家にご相談ください。",
  exportCsv: "CSV出力",
  exportedCsv: "CSVを出力しました",
  compare: "シナリオ比較",
  comparing: "比較中",
  clearCompare: "比較解除",
  scenarioA: "プランA",
  scenarioB: "プランB (現在)",
  difference: "差額",
  embed: "埋め込み",
  embedTitle: "この計算ツールをWebサイトに埋め込む",
  embedDesc: "以下のコードをコピーして、ブログやWebサイトに貼り付けてください:",
  embedCopied: "埋め込みコードをコピーしました",
  saveHistory: "履歴に保存",
  savedHistory: "履歴に保存しました！",
  history: "計算履歴",
  historyTitle: "保存された計算履歴",
  historyEmpty: "保存された計算履歴はありません。「履歴に保存」をクリックして保存できます。",
  loadHistory: "読込",
  loadedHistory: "読込済",
  selectAll: "すべて選択",
  exportSelectedPdf: "選択項目をPDF出力",
  exportSelectedCsv: "選択項目をCSV出力",
  deleteSelected: "選択項目を削除",
  clearHistory: "すべて消去",
  advancedOn: "詳細設定: オン",
  advancedOff: "詳細設定: オフ",
  results: "計算結果",
  faq: "よくある質問",
  relatedCalculators: "関連する計算ツール",
  relatedCalculatorsSub: "資産運用、税金控除、ローンの試算に役立つおすすめの計算ツールです。",
  calculateNow: "計算する",
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
  share: "Поделиться",
  shared: "Ссылка скопирована!",
  shareFailed: "Не удалось поделиться",
  downloadPdf: "Скачать PDF (A4)",
  reportTitle: "Отчет о расчете",
  reportInputs: "Параметры расчета",
  reportResults: "Результаты и структура",
  reportGenerated: "Дата формирования",
  reportVerified: "Официальный расчетный отчет",
  reportDisclaimer: "Данный отчет носит исключительно ознакомительный характер. Все расчеты являются ориентировочными и не представляют собой сертифицированную юридическую, налоговую или финансовую консультацию.",
  exportCsv: "Экспорт CSV",
  exportedCsv: "CSV выгружен",
  compare: "Сравнить",
  comparing: "Сравнение",
  clearCompare: "Сбросить",
  scenarioA: "Сценарий A",
  scenarioB: "Сценарий B (Текущий)",
  difference: "Разница",
  embed: "Встроить",
  embedTitle: "Встроить калькулятор на сайт",
  embedDesc: "Скопируйте этот код для вставки на сайт или в блог:",
  embedCopied: "Код скопирован!",
  saveHistory: "Сохранить в историю",
  savedHistory: "Сохранено в историю!",
  history: "История",
  historyTitle: "История расчетов",
  historyEmpty: "Нет сохраненных расчетов. Нажмите «Сохранить в историю», чтобы добавить расчет.",
  loadHistory: "Загрузить",
  loadedHistory: "Загружено",
  selectAll: "Выбрать все",
  exportSelectedPdf: "Скачать PDF (выбранные)",
  exportSelectedCsv: "Экспорт CSV (выбранные)",
  deleteSelected: "Удалить выбранные",
  clearHistory: "Очистить всё",
  advancedOn: "Доп. настройки: вкл",
  advancedOff: "Доп. настройки: выкл",
  results: "Результаты",
  faq: "Часто задаваемые вопросы",
  relatedCalculators: "Связанные калькуляторы",
  relatedCalculatorsSub: "Другие финансовые калькуляторы для точных расчетов инвестиций, вкладов и выплат.",
  calculateNow: "Рассчитать",
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
  share: "공유하기",
  shared: "링크 복사됨",
  shareFailed: "공유 실패",
  downloadPdf: "PDF 다운로드 (A4)",
  reportTitle: "계산 결과 보고서",
  reportInputs: "입력 조건 및 설정",
  reportResults: "상세 결과 및 세부 내역",
  reportGenerated: "발행일시",
  reportVerified: "공식 계산 결과 보고서",
  reportDisclaimer: "본 보고서는 모의 시뮬레이션 및 참고용으로 발행되었으며 실제 세액이나 지급액과 차이가 발생할 수 있습니다. 법적 효력을 갖지 않으며 정확한 재무·세무 판단은 공인 전문가와 상담하시기 바랍니다.",
  exportCsv: "CSV 내보내기",
  exportedCsv: "CSV 다운로드됨",
  compare: "비교하기",
  comparing: "비교 중",
  clearCompare: "비교 취소",
  scenarioA: "시나리오 A",
  scenarioB: "시나리오 B (현재)",
  difference: "차이",
  embed: "퍼가기",
  embedTitle: "웹사이트에 계산기 퍼가기",
  embedDesc: "블로그나 웹사이트에 복사하여 붙여넣으세요:",
  embedCopied: "퍼가기 코드가 복사되었습니다!",
  saveHistory: "기록 저장",
  savedHistory: "기록에 저장됨!",
  history: "계산 기록",
  historyTitle: "저장된 계산 기록",
  historyEmpty: "저장된 계산 기록이 없습니다. '기록 저장'을 클릭하여 저장하세요.",
  loadHistory: "불러오기",
  loadedHistory: "불러옴",
  selectAll: "전체 선택",
  exportSelectedPdf: "선택 항목 PDF 다운로드",
  exportSelectedCsv: "선택 항목 CSV 내보내기",
  deleteSelected: "선택 삭제",
  clearHistory: "전체 삭제",
  advancedOn: "고급 설정: 켜짐",
  skipToContent: "본문 바로가기",
  allRightsReserved: "모든 권리 보유.",
  advancedOff: "고급 설정: 꺼짐",
  results: "결과",
  faq: "자주 묻는 질문",
  relatedCalculators: "관련 추천 계산기",
  relatedCalculatorsSub: "자산 관리, 절세 계획, 대출 및 청약에 유용한 추천 금융 계산기입니다.",
  calculateNow: "계산해보기",
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
