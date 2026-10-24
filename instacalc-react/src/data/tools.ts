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
    id: "labor-salary",
    name: "급여·퇴직금 및 노무 계산기",
    tools: [
      { path: "salary-calculator.html", label: "연봉 실수령액 계산기 (2026 4대보험·소득세 공제)" },
      { path: "severance-pay-calculator.html", label: "법정 퇴직금 계산기 (고용노동부 기준·상여금 안분)" },
      { path: "weekly-holiday-pay-calculator.html", label: "주휴수당 계산기 (2026 최저시급 10,320원·알바 월급)" },
      { path: "unemployment-benefit-calculator.html", label: "실업급여(구직급여) 계산기 (2026 상한액 68,100원)" },
      { path: "annual-leave-pay-calculator.html", label: "미사용 연차수당 계산기 (209시간 통상임금 기준)" },
      { path: "parental-leave-pay-calculator.html", label: "육아휴직 급여 계산기 (2026 상한 250만·6+6 부모휴직)" },
    ],
  },
  {
    id: "savings-banking",
    name: "예적금·목돈 모으기 및 파킹통장",
    tools: [
      { path: "deposit-calculator.html", label: "정기예금 계산기 (단리·월복리·세금우대 1.4%·비과세)" },
      { path: "savings-calculator.html", label: "정기적금 계산기 (정액적립식 단리·선납이연·회차별 이자)" },
      { path: "parking-account-calculator.html", label: "파킹통장 / CMA 계산기 (일복리 매일 이자·비상금 통장)" },
      { path: "windmill-savings-calculator.html", label: "적금 풍차돌리기 계산기 (12개월 연속 가입·만기 플랜)" },
      { path: "youth-leap-calculator.html", label: "청년도약계좌 계산기 (소득별 정부기여금·비과세 5천만원)" },
    ],
  },
  {
    id: "stocks-investment",
    name: "주식·복리 투자 및 가상자산",
    tools: [
      { path: "stock-average-down-calculator.html", label: "주식 물타기 계산기 (평단가 인하·목표 평단가 필요 주수)" },
      { path: "compound-investment-calculator.html", label: "적립식 복리 투자 계산기 (월 적립 DCA·72의 법칙)" },
      { path: "overseas-stock-tax-calculator.html", label: "해외주식 양도소득세 계산기 (연 250만 기본공제·22% 세금)" },
      { path: "dividend-tax-calculator.html", label: "미국 배당금 실수령액 계산기 (15% 원천징수·종합과세 2천만)" },
      { path: "crypto-profit-calculator.html", label: "가상자산(코인) 수익률 계산기 (업비트·빗썸 수수료·손익분기)" },
    ],
  },
  {
    id: "tax-pension",
    name: "절세·연금 및 연말정산",
    tools: [
      { path: "isa-calculator.html", label: "중개형 ISA 절세 계산기 (200만/400만 비과세·9.9% 분리과세)" },
      { path: "pension-savings-irp-calculator.html", label: "연금저축 & IRP 세액공제 계산기 (연 900만·16.5% 환급)" },
      { path: "national-pension-calculator.html", label: "국민연금 예상수령액 계산기 (기준소득월액·만 65세 노령연금)" },
      { path: "year-end-tax-calculator.html", label: "연말정산 카드 소득공제 계산기 (총급여 25% 문턱·체크카드 30%)" },
      { path: "card-deduction-optimizer-calculator.html", label: "신용카드 소득공제 황금비율 계산기 (총급여 25% 최적화)" },
      { path: "inheritance-gift-tax-calculator.html", label: "증여세 및 상속세 계산기 (10년 주기 합산·누진세율)" },
      { path: "health-insurance-dependent-calculator.html", label: "건강보험 피부양자 자격 및 지역보험료 계산기 (2천만원 기준)" },
    ],
  },
  {
    id: "real-estate-vehicle",
    name: "부동산·자동차 및 대출",
    tools: [
      { path: "capital-gains-tax-calculator.html", label: "부동산 양도소득세 계산기 (1세대 1주택 12억 비과세·장특공)" },
      { path: "housing-subscription-score-calculator.html", label: "주택청약 가점 계산기 (청약홈 84점 만점 기준)" },
      { path: "policy-housing-loan-calculator.html", label: "디딤돌·버팀목 대출 계산기 (주택도시기금 우대금리)" },
      { path: "loan-prepayment-penalty-calculator.html", label: "대출 중도상환수수료 계산기 (3년 슬라이딩 감면·대환 손익)" },
      { path: "brokerage-fee-calculator.html", label: "부동산 중개수수료 계산기 (매매·전세·월세 복비 상한)" },
      { path: "acquisition-tax-calculator.html", label: "주택 취득세 계산기 (다주택 중과세·생애최초 감면)" },
      { path: "loan-dsr-calculator.html", label: "대출이자 & DSR 계산기 (원리금균등·DSR 40% 한도)" },
      { path: "jeonse-wolse-calculator.html", label: "전월세 전환 계산기 (법정 전환율 상한선 기준)" },
      { path: "car-tax-calculator.html", label: "자동차세 연납 할인 & 취등록세 계산기 (배기량별·1월 5% 할인)" },
    ],
  },
  {
    id: "daily-measurement",
    name: "생활·나이 및 에너지·면적 변환기",
    tools: [
      { path: "electricity-bill-calculator.html", label: "전기요금 누진세 계산기 (한전 주택용 저압/고압·하계 에어컨)" },
      { path: "pyeong-calculator.html", label: "평수 계산기 (평 ↔ 제곱미터 ㎡ 면적 변환)" },
      { path: "korean-age-calculator.html", label: "만 나이 계산기 (2023 만 나이 통일법·연나이·띠)" },
    ],
  },
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
