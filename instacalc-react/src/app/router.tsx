import type { ComponentType } from "react";
import type { SeoRecord } from "@/data/seo-types";
import type { Locale } from "@/config/site";

/**
 * Route table — the single source of truth shared by the client router, the
 * prerenderer and the sitemap generator.
 *
 * `load` holds the RAW dynamic-import function. It is deliberately not a
 * React `lazy()` wrapper: `lazy()` returns an object rather than a function, so
 * the prerenderer could not await it to resolve the real module before
 * rendering. App wraps these loaders in `lazy()` at render time, and the
 * prerenderer awaits them directly.
 *
 * `implemented` marks routes with a bespoke React page. Every legacy path is
 * still a known route (SEO metadata comes from `seo.generated.json`), and any
 * path without a page component falls back to the shared shell so the URL stays
 * crawlable and its sitemap entry stays valid during the staged migration.
 */

export type PageComponent = ComponentType<{ seo: SeoRecord }>;
export type PageLoader = () => Promise<{ default: PageComponent }>;

export interface RouteDef {
  /** URL path, always leading slash. Matches the legacy file layout exactly. */
  path: string;
  locale: Locale;
  load: PageLoader;
  /** Set once a real React page exists for this path. */
  implemented?: boolean;
}

export const ROUTES: RouteDef[] = [
  // Locale homepages share the Home component; the tool catalogue adapts by locale.
  { path: "/", locale: "en", load: () => import("@/pages/Home"), implemented: true },
  { path: "/ja/", locale: "ja", load: () => import("@/pages/Home"), implemented: true },
  { path: "/ko/", locale: "ko", load: () => import("@/pages/Home"), implemented: true },
  { path: "/ru/", locale: "ru", load: () => import("@/pages/Home"), implemented: true },
  { path: "/us/", locale: "us", load: () => import("@/pages/Home"), implemented: true },

  // India financial calculators
  { path: "/sipcalculator.html", locale: "en", load: () => import("@/calculators/sip/SipCalculator"), implemented: true },
  { path: "/sipcalculatorlumpsump.html", locale: "en", load: () => import("@/calculators/sip/LumpsumCalculator"), implemented: true },
  { path: "/emicalculator.html", locale: "en", load: () => import("@/calculators/emi/EmiCalculator"), implemented: true },
  { path: "/fdcalculator.html", locale: "en", load: () => import("@/calculators/fd/FdCalculator"), implemented: true },
  { path: "/rdcalculator.html", locale: "en", load: () => import("@/calculators/rd/RdCalculator"), implemented: true },
  { path: "/gstcalculator.html", locale: "en", load: () => import("@/calculators/gst/GstCalculator"), implemented: true },
  { path: "/compoundinterest.html", locale: "en", load: () => import("@/calculators/compound/CompoundInterest"), implemented: true },
  { path: "/simpleinterestcalculator.html", locale: "en", load: () => import("@/calculators/simple/SimpleInterest"), implemented: true },

  // Locale variants reuse the same component; only labels differ, so the engine
  // ships once per chunk instead of once per page.
  { path: "/ja/sipcalculator.html", locale: "ja", load: () => import("@/calculators/sip/SipCalculator"), implemented: true },
  { path: "/ja/compoundinterest.html", locale: "ja", load: () => import("@/calculators/compound/CompoundInterest"), implemented: true },
  { path: "/ru/sipcalculator.html", locale: "ru", load: () => import("@/calculators/sip/SipCalculator"), implemented: true },
  { path: "/ru/compoundinterest.html", locale: "ru", load: () => import("@/calculators/compound/CompoundInterest"), implemented: true },
  { path: "/us/compound-interest-calculator.html", locale: "us", load: () => import("@/calculators/compound/CompoundInterest"), implemented: true },
  { path: "/us/simple-interest-calculator.html", locale: "us", load: () => import("@/calculators/simple/SimpleInterest"), implemented: true },

  // --- Date, time and life-stage tools ---
  { path: "/agecalculator.html", locale: "en", load: () => import("@/calculators/age/AgeCalculator"), implemented: true },
  { path: "/duration/agecalculator.html", locale: "en", load: () => import("@/calculators/age/AgeCalculator"), implemented: true },
  { path: "/catagecalculator.html", locale: "en", load: () => import("@/calculators/catage/CatAgeCalculator"), implemented: true },
  { path: "/duration/dayscalculator.html", locale: "en", load: () => import("@/calculators/date-tools/DateTools"), implemented: true },
  { path: "/duration/weekcalculator.html", locale: "en", load: () => import("@/calculators/date-tools/DateTools"), implemented: true },
  { path: "/duration/hourcalculator.html", locale: "en", load: () => import("@/calculators/date-tools/TimeTools"), implemented: true },
  { path: "/duration/minutes-hourscalculator.html", locale: "en", load: () => import("@/calculators/date-tools/TimeTools"), implemented: true },

  // --- Geometry, construction and volume ---
  { path: "/moretools/diagonalcalculator.html", locale: "en", load: () => import("@/calculators/geometry/GeometryTools"), implemented: true },
  { path: "/moretools/trignometrycalculator.html", locale: "en", load: () => import("@/calculators/geometry/GeometryTools"), implemented: true },
  { path: "/moretools/concretecalculator.html", locale: "en", load: () => import("@/calculators/geometry/ConcreteCalculator"), implemented: true },
  { path: "/gallontolitercalculator.html", locale: "en", load: () => import("@/calculators/volume/GallonConverter"), implemented: true },

  // --- Locale variants of the date and geometry tools ---
  { path: "/ja/duration/agecalculator.html", locale: "ja", load: () => import("@/calculators/age/AgeCalculator"), implemented: true },
  { path: "/ru/duration/agecalculator.html", locale: "ru", load: () => import("@/calculators/age/AgeCalculator"), implemented: true },
  { path: "/ja/moretools/concretecalculator.html", locale: "ja", load: () => import("@/calculators/geometry/ConcreteCalculator"), implemented: true },
  { path: "/ru/moretools/concretecalculator.html", locale: "ru", load: () => import("@/calculators/geometry/ConcreteCalculator"), implemented: true },
  { path: "/ko/moretools/concretecalculator.html", locale: "ko", load: () => import("@/calculators/geometry/ConcreteCalculator"), implemented: true },
  { path: "/ja/moretools/diagonalcalculator.html", locale: "ja", load: () => import("@/calculators/geometry/GeometryTools"), implemented: true },
  { path: "/ru/moretools/diagonalcalculator.html", locale: "ru", load: () => import("@/calculators/geometry/GeometryTools"), implemented: true },
  { path: "/ko/moretools/diagonalcalculator.html", locale: "ko", load: () => import("@/calculators/geometry/GeometryTools"), implemented: true },
  { path: "/ja/moretools/trignometrycalculator.html", locale: "ja", load: () => import("@/calculators/geometry/GeometryTools"), implemented: true },
  { path: "/ru/moretools/trignometrycalculator.html", locale: "ru", load: () => import("@/calculators/geometry/GeometryTools"), implemented: true },
  { path: "/ko/moretools/trignometrycalculator.html", locale: "ko", load: () => import("@/calculators/geometry/GeometryTools"), implemented: true },
  { path: "/us/age-calculator.html", locale: "us", load: () => import("@/calculators/age/AgeCalculator"), implemented: true },
  { path: "/us/days-calculator.html", locale: "us", load: () => import("@/calculators/date-tools/DateTools"), implemented: true },
  { path: "/us/hour-calculator.html", locale: "us", load: () => import("@/calculators/date-tools/TimeTools"), implemented: true },
  { path: "/us/gallon-to-liter-calculator.html", locale: "us", load: () => import("@/calculators/volume/GallonConverter"), implemented: true },
  { path: "/us/concrete-calculator.html", locale: "us", load: () => import("@/calculators/geometry/ConcreteCalculator"), implemented: true },
  { path: "/us/diagonal-calculator.html", locale: "us", load: () => import("@/calculators/geometry/GeometryTools"), implemented: true },
  { path: "/us/triangle-calculator.html", locale: "us", load: () => import("@/calculators/geometry/GeometryTools"), implemented: true },

  // --- Prose pages: about, contact, privacy, terms, disclaimer, data deletion ---
  { path: "/aboutus.html", locale: "en", load: () => import("@/pages/ContentPage"), implemented: true },
  { path: "/contactus.html", locale: "en", load: () => import("@/pages/ContactPage"), implemented: true },
  { path: "/privacypolicy.html", locale: "en", load: () => import("@/pages/ContentPage"), implemented: true },
  { path: "/terms.html", locale: "en", load: () => import("@/pages/ContentPage"), implemented: true },
  { path: "/disclaimer.html", locale: "en", load: () => import("@/pages/DisclaimerPage"), implemented: true },
  { path: "/delete-account.html", locale: "en", load: () => import("@/pages/ContentPage"), implemented: true },
  { path: "/ja/aboutus.html", locale: "ja", load: () => import("@/pages/ContentPage"), implemented: true },
  { path: "/ja/contactus.html", locale: "ja", load: () => import("@/pages/ContactPage"), implemented: true },
  { path: "/ja/privacypolicy.html", locale: "ja", load: () => import("@/pages/ContentPage"), implemented: true },
  { path: "/ja/terms.html", locale: "ja", load: () => import("@/pages/ContentPage"), implemented: true },
  { path: "/ja/delete-account.html", locale: "ja", load: () => import("@/pages/ContentPage"), implemented: true },
  { path: "/ru/aboutus.html", locale: "ru", load: () => import("@/pages/ContentPage"), implemented: true },
  { path: "/ru/contactus.html", locale: "ru", load: () => import("@/pages/ContactPage"), implemented: true },
  { path: "/ru/privacypolicy.html", locale: "ru", load: () => import("@/pages/ContentPage"), implemented: true },
  { path: "/ko/privacypolicy.html", locale: "ko", load: () => import("@/pages/ContentPage"), implemented: true },


  // --- Retirement, tax and withdrawal plans ---
  { path: "/retirementcalculator.html", locale: "en", load: () => import("@/calculators/plans/RetirementCalculator"), implemented: true },
  { path: "/epfcalculator.html", locale: "en", load: () => import("@/calculators/plans/EpfCalculator"), implemented: true },
  { path: "/ppfcalculator.html", locale: "en", load: () => import("@/calculators/plans/PpfCalculator"), implemented: true },
  { path: "/npscalculator.html", locale: "en", load: () => import("@/calculators/plans/NpsCalculator"), implemented: true },
  { path: "/gratuitycalculator.html", locale: "en", load: () => import("@/calculators/plans/GratuityCalculator"), implemented: true },
  { path: "/cagrcalculator.html", locale: "en", load: () => import("@/calculators/plans/CagrCalculator"), implemented: true },
  { path: "/swpcalculator.html", locale: "en", load: () => import("@/calculators/plans/SwpCalculator"), implemented: true },

  { path: "/ja/epfcalculator.html", locale: "ja", load: () => import("@/calculators/plans/EpfCalculator"), implemented: true },
  { path: "/ja/ppfcalculator.html", locale: "ja", load: () => import("@/calculators/plans/PpfCalculator"), implemented: true },
  { path: "/ja/npscalculator.html", locale: "ja", load: () => import("@/calculators/plans/NpsCalculator"), implemented: true },
  { path: "/ja/gratuitycalculator.html", locale: "ja", load: () => import("@/calculators/plans/GratuityCalculator"), implemented: true },
  { path: "/ja/cagrcalculator.html", locale: "ja", load: () => import("@/calculators/plans/CagrCalculator"), implemented: true },
  { path: "/ja/swpcalculator.html", locale: "ja", load: () => import("@/calculators/plans/SwpCalculator"), implemented: true },

  { path: "/ru/epfcalculator.html", locale: "ru", load: () => import("@/calculators/plans/EpfCalculator"), implemented: true },
  { path: "/ru/ppfcalculator.html", locale: "ru", load: () => import("@/calculators/plans/PpfCalculator"), implemented: true },
  { path: "/ru/npscalculator.html", locale: "ru", load: () => import("@/calculators/plans/NpsCalculator"), implemented: true },
  { path: "/ru/gratuitycalculator.html", locale: "ru", load: () => import("@/calculators/plans/GratuityCalculator"), implemented: true },
  { path: "/ru/cagrcalculator.html", locale: "ru", load: () => import("@/calculators/plans/CagrCalculator"), implemented: true },
  { path: "/ja/retirementcalculator.html", locale: "ja", load: () => import("@/calculators/plans/RetirementCalculator"), implemented: true },
  { path: "/ru/retirementcalculator.html", locale: "ru", load: () => import("@/calculators/plans/RetirementCalculator"), implemented: true },
  { path: "/us/retirement-calculator.html", locale: "us", load: () => import("@/calculators/plans/RetirementCalculator"), implemented: true },

  // --- US edition: retirement, banking and tax ---
  { path: "/us/401k-calculator.html", locale: "us", load: () => import("@/calculators/us/FourOhOneKCalculator"), implemented: true },
  { path: "/us/roth-ira-calculator.html", locale: "us", load: () => import("@/calculators/us/RothIraCalculator"), implemented: true },
  { path: "/us/fire-calculator.html", locale: "us", load: () => import("@/calculators/us/FireCalculator"), implemented: true },
  { path: "/us/cd-calculator.html", locale: "us", load: () => import("@/calculators/us/CdCalculator"), implemented: true },
  { path: "/us/mortgage-calculator.html", locale: "us", load: () => import("@/calculators/us/MortgageCalculator"), implemented: true },
  { path: "/us/monthly-investment-calculator.html", locale: "us", load: () => import("@/calculators/us/MonthlyInvestmentCalculator"), implemented: true },
  { path: "/us/sales-tax-calculator.html", locale: "us", load: () => import("@/calculators/us/SalesTaxCalculator"), implemented: true },
  { path: "/us/paycheck-calculator.html", locale: "us", load: () => import("@/calculators/us/PaycheckCalculator"), implemented: true },
  { path: "/us/credit-card-payoff-calculator.html", locale: "us", load: () => import("@/calculators/us/CreditCardCalculator"), implemented: true },
  { path: "/us/student-loan-calculator.html", locale: "us", load: () => import("@/calculators/us/StudentLoanCalculator"), implemented: true },
  { path: "/us/auto-loan-calculator.html", locale: "us", load: () => import("@/calculators/us/AutoLoanCalculator"), implemented: true },
  { path: "/us/time-duration-calculator.html", locale: "us", load: () => import("@/calculators/date-tools/TimeTools"), implemented: true },

  // --- Mutual fund return planner ---
  { path: "/mutualfundreturncalculator.html", locale: "en", load: () => import("@/calculators/plans/MutualFundCalculator"), implemented: true },
  { path: "/ja/mutualfundreturncalculator.html", locale: "ja", load: () => import("@/calculators/plans/MutualFundCalculator"), implemented: true },
  { path: "/ru/mutualfundreturncalculator.html", locale: "ru", load: () => import("@/calculators/plans/MutualFundCalculator"), implemented: true },

  // --- Remaining duration and time tools ---
  { path: "/duration/birthdaycalculator.html", locale: "en", load: () => import("@/calculators/date-tools/BirthdayCalculator"), implemented: true },
  { path: "/ja/duration/birthdaycalculator.html", locale: "ja", load: () => import("@/calculators/date-tools/BirthdayCalculator"), implemented: true },
  { path: "/duration/juliandatecalculator.html", locale: "en", load: () => import("@/calculators/date-tools/JulianDateCalculator"), implemented: true },
  { path: "/duration/timedurationcalculator.html", locale: "en", load: () => import("@/calculators/date-tools/TimeTools"), implemented: true },
  { path: "/duration/timezonecalculator.html", locale: "en", load: () => import("@/calculators/date-tools/TimeTools"), implemented: true },
  { path: "/us/time-zone-calculator.html", locale: "us", load: () => import("@/calculators/date-tools/TimeZoneCalculator"), implemented: true },

  // --- Japanese and Russian variants of already-built calculators ---
  // These share an engine with their English original; only labels differ.
  { path: "/ja/catagecalculator.html", locale: "ja", load: () => import("@/calculators/catage/CatAgeCalculator"), implemented: true },
  { path: "/ru/catagecalculator.html", locale: "ru", load: () => import("@/calculators/catage/CatAgeCalculator"), implemented: true },
  { path: "/ja/emicalculator.html", locale: "ja", load: () => import("@/calculators/emi/EmiCalculator"), implemented: true },
  { path: "/ru/emicalculator.html", locale: "ru", load: () => import("@/calculators/emi/EmiCalculator"), implemented: true },
  { path: "/ja/fdcalculator.html", locale: "ja", load: () => import("@/calculators/fd/FdCalculator"), implemented: true },
  { path: "/ru/fdcalculator.html", locale: "ru", load: () => import("@/calculators/fd/FdCalculator"), implemented: true },
  { path: "/ja/rdcalculator.html", locale: "ja", load: () => import("@/calculators/rd/RdCalculator"), implemented: true },
  { path: "/ru/rdcalculator.html", locale: "ru", load: () => import("@/calculators/rd/RdCalculator"), implemented: true },
  { path: "/ja/gstcalculator.html", locale: "ja", load: () => import("@/calculators/gst/GstCalculator"), implemented: true },
  { path: "/ru/gstcalculator.html", locale: "ru", load: () => import("@/calculators/gst/GstCalculator"), implemented: true },
  { path: "/ja/simpleinterestcalculator.html", locale: "ja", load: () => import("@/calculators/simple/SimpleInterest"), implemented: true },
  { path: "/ja/sipcalculatorlumpsump.html", locale: "ja", load: () => import("@/calculators/sip/LumpsumCalculator"), implemented: true },
  { path: "/ja/gallontolitercalculator.html", locale: "ja", load: () => import("@/calculators/volume/GallonConverter"), implemented: true },

  // Near-duplicate URLs that the legacy sitemap excluded (their canonical
  // points elsewhere), so they serve a redirect-style notice instead of a tool.
  { path: "/coumpoundinterest.html", locale: "en", load: () => import("@/pages/DuplicateRedirect"), implemented: true },
  { path: "/moretools/coumpoundinterest.html", locale: "en", load: () => import("@/pages/DuplicateRedirect"), implemented: true },
  { path: "/cargcalculator.html", locale: "en", load: () => import("@/pages/DuplicateRedirect"), implemented: true },
  { path: "/delete-account-verse.html", locale: "en", load: () => import("@/pages/DuplicateRedirect"), implemented: true },
  { path: "/deleteaccountverse.html", locale: "en", load: () => import("@/pages/DuplicateRedirect"), implemented: true },

  // The 404 document. GitHub Pages serves this file for any unmatched URL, so
  // the route exists only so the prerenderer can render the 404 body. At
  // runtime App renders NotFound directly whenever the document is marked as
  // the 404 document (see `isNotFoundDocument`), because the visitor's actual
  // URL is unknown at that point.
  { path: "/404.html", locale: "en", load: () => import("@/pages/NotFound"), implemented: true },

  // --- Japanese-only tools ---
  { path: "/ja/salarycalculator.html", locale: "ja", load: () => import("@/calculators/japan/SalaryCalculator"), implemented: true },
  { path: "/ja/sukanyasamriddhicalculator.html", locale: "ja", load: () => import("@/calculators/japan/SukanyaCalculator"), implemented: true },
  { path: "/ja/duration/datecalculator.html", locale: "ja", load: () => import("@/calculators/date-tools/DateTools"), implemented: true },
  { path: "/ja/duration/daycountercalculator.html", locale: "ja", load: () => import("@/calculators/date-tools/DateTools"), implemented: true },
  { path: "/ja/furusato-nouzei-calculator.html", locale: "ja", load: () => import("@/calculators/japan/FurusatoCalculator"), implemented: true },
  { path: "/ja/jutaku-loan-kojo-calculator.html", locale: "ja", load: () => import("@/calculators/japan/JutakuLoanCalculator"), implemented: true },
  { path: "/ja/ideco-calculator.html", locale: "ja", load: () => import("@/calculators/japan/IdecoCalculator"), implemented: true },
  { path: "/ja/taishokukin-calculator.html", locale: "ja", load: () => import("@/calculators/japan/TaishokukinCalculator"), implemented: true },
  { path: "/ja/gakushihoken-calculator.html", locale: "ja", load: () => import("@/calculators/japan/GakushiHokenCalculator"), implemented: true },
  { path: "/ja/koigyo-kyosai-calculator.html", locale: "ja", load: () => import("@/calculators/japan/KoigyoKyosaiCalculator"), implemented: true },

  // --- Korean-only tools ---
  { path: "/ko/salary-calculator.html", locale: "ko", load: () => import("@/calculators/korea/SalaryCalculator"), implemented: true },
  { path: "/ko/severance-pay-calculator.html", locale: "ko", load: () => import("@/calculators/korea/SeveranceCalculator"), implemented: true },
  { path: "/ko/weekly-holiday-pay-calculator.html", locale: "ko", load: () => import("@/calculators/korea/WeeklyHolidayCalculator"), implemented: true },
  { path: "/ko/pyeong-calculator.html", locale: "ko", load: () => import("@/calculators/korea/PyeongCalculator"), implemented: true },
  { path: "/ko/korean-age-calculator.html", locale: "ko", load: () => import("@/calculators/korea/KoreanAgeCalculator"), implemented: true },
  { path: "/ko/brokerage-fee-calculator.html", locale: "ko", load: () => import("@/calculators/korea/BrokerageCalculator"), implemented: true },
  { path: "/ko/jeonse-wolse-calculator.html", locale: "ko", load: () => import("@/calculators/korea/JeonseWolseCalculator"), implemented: true },
  { path: "/ko/acquisition-tax-calculator.html", locale: "ko", load: () => import("@/calculators/korea/AcquisitionTaxCalculator"), implemented: true },
  { path: "/ko/loan-dsr-calculator.html", locale: "ko", load: () => import("@/calculators/korea/LoanDsrCalculator"), implemented: true },
  { path: "/ko/unemployment-benefit-calculator.html", locale: "ko", load: () => import("@/calculators/korea/UnemploymentCalculator"), implemented: true },
  { path: "/ko/deposit-calculator.html", locale: "ko", load: () => import("@/calculators/korea/DepositCalculator"), implemented: true },
  { path: "/ko/savings-calculator.html", locale: "ko", load: () => import("@/calculators/korea/SavingsCalculator"), implemented: true },
  { path: "/ko/parking-account-calculator.html", locale: "ko", load: () => import("@/calculators/korea/ParkingAccountCalculator"), implemented: true },
  { path: "/ko/windmill-savings-calculator.html", locale: "ko", load: () => import("@/calculators/korea/WindmillSavingsCalculator"), implemented: true },
  { path: "/ko/youth-leap-calculator.html", locale: "ko", load: () => import("@/calculators/korea/YouthLeapCalculator"), implemented: true },
  { path: "/ko/stock-average-down-calculator.html", locale: "ko", load: () => import("@/calculators/korea/StockAverageDownCalculator"), implemented: true },
  { path: "/ko/compound-investment-calculator.html", locale: "ko", load: () => import("@/calculators/korea/CompoundInvestmentCalculator"), implemented: true },
  { path: "/ko/overseas-stock-tax-calculator.html", locale: "ko", load: () => import("@/calculators/korea/OverseasStockTaxCalculator"), implemented: true },
  { path: "/ko/dividend-tax-calculator.html", locale: "ko", load: () => import("@/calculators/korea/DividendTaxCalculator"), implemented: true },
  { path: "/ko/crypto-profit-calculator.html", locale: "ko", load: () => import("@/calculators/korea/CryptoProfitCalculator"), implemented: true },
  { path: "/ko/isa-calculator.html", locale: "ko", load: () => import("@/calculators/korea/IsaCalculator"), implemented: true },
  { path: "/ko/pension-savings-irp-calculator.html", locale: "ko", load: () => import("@/calculators/korea/PensionSavingsIrpCalculator"), implemented: true },
  { path: "/ko/national-pension-calculator.html", locale: "ko", load: () => import("@/calculators/korea/NationalPensionCalculator"), implemented: true },
  { path: "/ko/year-end-tax-calculator.html", locale: "ko", load: () => import("@/calculators/korea/YearEndTaxCalculator"), implemented: true },
  { path: "/ko/car-tax-calculator.html", locale: "ko", load: () => import("@/calculators/korea/CarTaxCalculator"), implemented: true },
  { path: "/ko/capital-gains-tax-calculator.html", locale: "ko", load: () => import("@/calculators/korea/CapitalGainsTaxCalculator"), implemented: true },
  { path: "/ko/housing-subscription-score-calculator.html", locale: "ko", load: () => import("@/calculators/korea/HousingSubscriptionScoreCalculator"), implemented: true },
  { path: "/ko/annual-leave-pay-calculator.html", locale: "ko", load: () => import("@/calculators/korea/AnnualLeavePayCalculator"), implemented: true },
  { path: "/ko/card-deduction-optimizer-calculator.html", locale: "ko", load: () => import("@/calculators/korea/CardDeductionOptimizerCalculator"), implemented: true },
  { path: "/ko/inheritance-gift-tax-calculator.html", locale: "ko", load: () => import("@/calculators/korea/InheritanceGiftTaxCalculator"), implemented: true },
  { path: "/ko/parental-leave-pay-calculator.html", locale: "ko", load: () => import("@/calculators/korea/ParentalLeavePayCalculator"), implemented: true },
  { path: "/ko/loan-prepayment-penalty-calculator.html", locale: "ko", load: () => import("@/calculators/korea/LoanPrepaymentPenaltyCalculator"), implemented: true },
  { path: "/ko/health-insurance-dependent-calculator.html", locale: "ko", load: () => import("@/calculators/korea/HealthInsuranceDependentCalculator"), implemented: true },
  { path: "/ko/electricity-bill-calculator.html", locale: "ko", load: () => import("@/calculators/korea/ElectricityBillCalculator"), implemented: true },
  { path: "/ko/policy-housing-loan-calculator.html", locale: "ko", load: () => import("@/calculators/korea/PolicyHousingLoanCalculator"), implemented: true },
];


const ROUTE_MAP = new Map(ROUTES.map((r) => [r.path, r]));

/** Fallback loader for any legacy path without a bespoke React page. */
const genericLoader: PageLoader = () => import("@/pages/GenericPage");

/** Locale prefixes that appear in site paths. */
const LOCALE_SEGMENTS = new Set(["us", "ja", "ru", "ko"]);

/**
 * Derives the locale from a path. Derived rather than looked up so the router
 * stays free of the 475 kB SEO dataset, which keeps it out of the client bundle.
 */
function localeOf(path: string): Locale {
  const seg = path.split("/")[1]?.toLowerCase() ?? "";
  return LOCALE_SEGMENTS.has(seg) ? (seg as Locale) : "en";
}

/** Resolves any legacy path to a route, falling back to the shared shell page. */
export function resolveRoute(path: string): RouteDef {
  // A directory homepage is stored at `dist/ja/index.html`, so a visitor who
  // requests `/ja/index.html` directly must still resolve the `/ja/` route
  // rather than falling through to the generic shell (which also caused a
  // hydration mismatch). Mirrors `matchesPath` in data/seo.ts.
  const direct = ROUTE_MAP.get(path) ?? ROUTE_MAP.get(stripIndexHtml(path));
  if (direct) return direct;
  return { path, locale: localeOf(path), load: genericLoader };
}

/** `/ja/index.html` -> `/ja/`; any other path is returned unchanged. */
function stripIndexHtml(path: string): string {
  if (!path.endsWith("/index.html")) return path;
  return path.slice(0, -"index.html".length);
}

/** Paths that get a bespoke React page (the rest still emit static HTML). */
export const IMPLEMENTED_PATHS = new Set(ROUTES.filter((r) => r.implemented).map((r) => r.path));

/**
 * Awaits a route's module. The prerenderer calls this first so the real
 * component is resolved before rendering (renderToString cannot await Suspense).
 */
export async function loadPage(path: string): Promise<PageComponent> {
  const route = resolveRoute(path);
  const mod = await route.load();
  return mod.default;
}
