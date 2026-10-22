import type { Locale } from "@/config/site";
import { pageExists } from "@/data/pageExists";

/**
 * Tool catalogue used by the homepage library and the US landing page.
 * Paths are locale-relative; `prefix()` resolves them against the active locale.
 */

export interface Tool {
  /** Path within the locale, e.g. "sipcalculator.html". */
  path: string;
  label: string;
}

export interface ToolGroup {
  id: string;
  name: string;
  tools: Tool[];
}

/** Prefix a locale-relative tool path into a site-absolute path. */
export function prefix(locale: Locale, path: string): string {
  return locale === "en" ? `/${path}` : `/${locale}/${path}`;
}

const EN_GROUPS: ToolGroup[] = [
  {
    id: "financial",
    name: "Financial Tools",
    tools: [
      { path: "sipcalculator.html", label: "SIP Calculator" },
      { path: "mutualfundreturncalculator.html", label: "Mutual Fund Return Calculator" },
      { path: "sipcalculatorlumpsump.html", label: "Lumpsum Calculator" },
      { path: "swpcalculator.html", label: "SWP Calculator" },
      { path: "emicalculator.html", label: "EMI / Loan Calculator" },
      { path: "fdcalculator.html", label: "FD Calculator" },
      { path: "rdcalculator.html", label: "RD Calculator" },
      { path: "compoundinterest.html", label: "Compound Interest" },
      { path: "simpleinterestcalculator.html", label: "Simple Interest" },
      { path: "retirementcalculator.html", label: "Retirement Calculator" },
      { path: "epfcalculator.html", label: "EPF Calculator" },
      { path: "ppfcalculator.html", label: "PPF Calculator" },
      { path: "npscalculator.html", label: "NPS Calculator" },
      { path: "cagrcalculator.html", label: "CAGR Calculator" },
      { path: "gratuitycalculator.html", label: "Gratuity Calculator" },
      { path: "gstcalculator.html", label: "GST Calculator" },
    ],
  },
  {
    id: "date-time",
    name: "Date and Time",
    tools: [
      { path: "duration/agecalculator.html", label: "Age Calculator" },
      { path: "catagecalculator.html", label: "Cat Age Calculator" },
      { path: "duration/birthdaycalculator.html", label: "Birthday Calculator" },
      { path: "duration/dayscalculator.html", label: "Days Calculator" },
      { path: "duration/weekcalculator.html", label: "Week Calculator" },
      { path: "duration/hourcalculator.html", label: "Hour Calculator" },
      { path: "duration/timedurationcalculator.html", label: "Time Duration" },
      { path: "duration/timezonecalculator.html", label: "Time Zone Calculator" },
      { path: "duration/juliandatecalculator.html", label: "Julian Date Calculator" },
      { path: "duration/minutes-hourscalculator.html", label: "Minutes to Hours" },
    ],
  },
  {
    id: "more-tools",
    name: "Construction and Geometry",
    tools: [
      { path: "moretools/concretecalculator.html", label: "Concrete Calculator" },
      { path: "moretools/diagonalcalculator.html", label: "Diagonal Calculator" },
      { path: "moretools/trignometrycalculator.html", label: "Trigonometry Calculator" },
      { path: "gallontolitercalculator.html", label: "Gallon to Liter" },
    ],
  },
];

const US_GROUPS: ToolGroup[] = [
  {
    id: "retirement",
    name: "US Retirement",
    tools: [
      { path: "401k-calculator.html", label: "401(k) Calculator" },
      { path: "roth-ira-calculator.html", label: "Roth IRA Calculator" },
      { path: "retirement-calculator.html", label: "Retirement Calculator" },
      { path: "fire-calculator.html", label: "FIRE Calculator" },
    ],
  },
  {
    id: "investing",
    name: "Investing and Interest",
    tools: [
      { path: "monthly-investment-calculator.html", label: "Monthly Investment" },
      { path: "compound-interest-calculator.html", label: "Compound Interest" },
      { path: "simple-interest-calculator.html", label: "Simple Interest" },
      { path: "cd-calculator.html", label: "CD Calculator" },
    ],
  },
  {
    id: "money",
    name: "Loans and Taxes",
    tools: [
      { path: "mortgage-calculator.html", label: "Mortgage Calculator" },
      { path: "auto-loan-calculator.html", label: "Auto Loan Calculator" },
      { path: "paycheck-calculator.html", label: "Paycheck Calculator" },
      { path: "credit-card-payoff-calculator.html", label: "Credit Card Payoff" },
      { path: "student-loan-calculator.html", label: "Student Loan Calculator" },
      { path: "sales-tax-calculator.html", label: "Sales Tax Calculator" },
    ],
  },
  {
    id: "everyday",
    name: "Everyday Tools",
    tools: [
      { path: "concrete-calculator.html", label: "Concrete Calculator" },
      { path: "diagonal-calculator.html", label: "Diagonal Calculator" },
      { path: "triangle-calculator.html", label: "Triangle Calculator" },
      { path: "gallon-to-liter-calculator.html", label: "Gallon to Liter" },
      { path: "age-calculator.html", label: "Age Calculator" },
      { path: "days-calculator.html", label: "Days Calculator" },
      { path: "hour-calculator.html", label: "Hour Calculator" },
      { path: "time-duration-calculator.html", label: "Time Duration" },
      { path: "time-zone-calculator.html", label: "Time Zone Calculator" },
    ],
  },
];

const JA_GROUPS: ToolGroup[] = [
  {
    id: "tax-salary",
    name: "節税・税金・手取り計算",
    tools: [
      { path: "furusato-nouzei-calculator.html", label: "ふるさと納税 限度額計算" },
      { path: "salarycalculator.html", label: "給与手取り・年収計算" },
      { path: "jutaku-loan-kojo-calculator.html", label: "住宅ローン控除（減税）計算" },
      { path: "taishokukin-calculator.html", label: "退職金手取り・退職所得控除計算" },
      { path: "koigyo-kyosai-calculator.html", label: "小規模企業共済 節税計算" },
      { path: "gstcalculator.html", label: "消費税計算（10%・8%インボイス対応）" },
    ],
  },
  {
    id: "asset-nisa",
    name: "資産形成・新NISA・年金",
    tools: [
      { path: "ideco-calculator.html", label: "iDeCo 確定拠出年金 節税・積立計算" },
      { path: "sipcalculator.html", label: "新NISA つみたて投資 複利シミュレーター" },
      { path: "sipcalculatorlumpsump.html", label: "新NISA 成長投資枠 一括投資計算" },
      { path: "mutualfundreturncalculator.html", label: "投資信託 トータルリターン・利回り計算" },
      { path: "swpcalculator.html", label: "投資信託 定期売却・4%ルール資産寿命計算" },
      { path: "gakushihoken-calculator.html", label: "学資保険 vs 新NISA 大学費用比較" },
      { path: "retirementcalculator.html", label: "老後資金・年金シミュレーター（2000万円問題）" },
      { path: "npscalculator.html", label: "国民年金基金・付加年金 受給額計算" },
      { path: "cagrcalculator.html", label: "CAGR（年平均成長率）計算" },
    ],
  },
  {
    id: "banking-loan",
    name: "ローン・金利・預金",
    tools: [
      { path: "emicalculator.html", label: "住宅ローン・分割返済シミュレーター" },
      { path: "compoundinterest.html", label: "複利計算（元利均等・72の法則）" },
      { path: "simpleinterestcalculator.html", label: "単利計算（日数計算・利息制限法）" },
      { path: "fdcalculator.html", label: "定期預金・国債 利息計算" },
      { path: "rdcalculator.html", label: "積立定期預金・財形貯蓄 利息計算" },
    ],
  },
  {
    id: "date-life",
    name: "日付・年齢・時間",
    tools: [
      { path: "duration/agecalculator.html", label: "年齢計算・和暦西暦早見表（満年齢/数え年）" },
      { path: "catagecalculator.html", label: "猫の年齢・人間年齢換算シミュレーター" },
      { path: "duration/birthdaycalculator.html", label: "誕生日・曜日・記念日・誕生石計算" },
      { path: "duration/datecalculator.html", label: "日数計算・日付加減算（営業日・片端/両端）" },
      { path: "duration/daycountercalculator.html", label: "日数カウンター・目標カウントダウン" },
    ],
  },
  {
    id: "everyday-calc",
    name: "実用・工事・幾何",
    tools: [
      { path: "moretools/concretecalculator.html", label: "生コン・立米(m³)計算機" },
      { path: "moretools/diagonalcalculator.html", label: "対角線・斜辺・画面サイズ計算" },
      { path: "moretools/trignometrycalculator.html", label: "三角関数（sin・cos・tan）角度計算" },
      { path: "gallontolitercalculator.html", label: "ガロンからリットル(L)単位換算" },
    ],
  },
];

const KO_GROUPS: ToolGroup[] = [
  {
    id: "construction-geometry",
    name: "실용·건축·토목 및 기하학 도구",
    tools: [
      { path: "moretools/concretecalculator.html", label: "콘크리트·레미콘 루베(m³) 및 시멘트 배합 계산기" },
      { path: "moretools/diagonalcalculator.html", label: "대각선 계산기 (TV 화면 인치·3-4-5 직각잡기)" },
      { path: "moretools/trignometrycalculator.html", label: "삼각형 및 삼각함수(sin·cos·tan) 각도 계산기" },
    ],
  },
];

const RU_GROUPS: ToolGroup[] = [
  {
    id: "construction-geometry",
    name: "Строительство, ремонт и геометрия",
    tools: [
      { path: "moretools/concretecalculator.html", label: "Калькулятор бетона (кубы м³, пропорции М200–М350, мешки 50 кг)" },
      { path: "moretools/diagonalcalculator.html", label: "Калькулятор диагонали (экран ТВ в дюймах и см, диагональ комнаты)" },
      { path: "moretools/trignometrycalculator.html", label: "Калькулятор треугольника и тригонометрии (sin, cos, tg)" },
    ],
  },
  {
    id: "credit-banking",
    name: "Кредиты, вклады и налоги РФ",
    tools: [
      { path: "emicalculator.html", label: "Кредитный калькулятор (аннуитетный платеж, переплата, график)" },
      { path: "fdcalculator.html", label: "Калькулятор вкладов (капитализация процентов, доходность)" },
      { path: "rdcalculator.html", label: "Калькулятор накопительного счета (пополняемый депозит)" },
      { path: "gstcalculator.html", label: "Калькулятор НДС (ставки 20% и 10%, выделить / начислить)" },
    ],
  },
  {
    id: "investment-interest",
    name: "Инвестиции и сложный процент",
    tools: [
      { path: "compoundinterest.html", label: "Калькулятор сложных процентов (капитализация, формула)" },
      { path: "sipcalculator.html", label: "Калькулятор регулярных инвестиций (накопления с доходностью)" },
      { path: "mutualfundreturncalculator.html", label: "Калькулятор доходности ПИФ и биржевых фондов" },
      { path: "cagrcalculator.html", label: "Калькулятор CAGR (среднегодовой темп роста инвестиций)" },
      { path: "retirementcalculator.html", label: "Пенсионный калькулятор (расчет капитала на пенсию)" },
    ],
  },
  {
    id: "date-age",
    name: "Дата, возраст и время",
    tools: [
      { path: "duration/agecalculator.html", label: "Калькулятор возраста и стажа (точные годы, месяцы, дни)" },
      { path: "catagecalculator.html", label: "Калькулятор возраста кошки в человеческих годах" },
    ],
  },
  {
    id: "pension-benefits",
    name: "Пенсионные программы, долгосрочные сбережения и трудовые выплаты",
    tools: [
      { path: "epfcalculator.html", label: "Калькулятор накопительной пенсии (накопления СФР и НПФ)" },
      { path: "ppfcalculator.html", label: "Калькулятор Программы долгосрочных сбережений (ПДС: софинансирование)" },
      { path: "npscalculator.html", label: "Калькулятор негосударственной пенсии (НПО: пенсионный план НПФ)" },
      { path: "gratuitycalculator.html", label: "Калькулятор выходного пособия (выплаты при увольнении по ТК РФ)" },
    ],
  },
];

/**
 * Returns the tool catalogue for a locale, filtered to pages that exist.
 *
 * ja, us, ko and ru have bespoke catalogues tailored to local language and systems.
 *
 * Groups that end up with no tools are dropped entirely, so no empty section
 * headings are rendered.
 */
export function toolGroups(locale: Locale): ToolGroup[] {
  const base =
    locale === "us"
      ? US_GROUPS
      : locale === "ja"
      ? JA_GROUPS
      : locale === "ko"
      ? KO_GROUPS
      : locale === "ru"
      ? RU_GROUPS
      : EN_GROUPS;

  return base
    .map((g) => ({
      ...g,
      tools: g.tools.filter((t) => pageExists(locale, t.path)),
    }))
    .filter((g) => g.tools.length > 0);
}
