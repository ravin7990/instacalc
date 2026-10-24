import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = join(__dirname, "..", "src", "components", "articles", "ko");

const FILES = [
  "KoCapitalGainsTaxArticle.tsx",
  "KoHousingSubscriptionScoreArticle.tsx",
  "KoAnnualLeavePayArticle.tsx",
  "KoCardDeductionOptimizerArticle.tsx",
  "KoInheritanceGiftTaxArticle.tsx",
  "KoParentalLeavePayArticle.tsx",
  "KoLoanPrepaymentPenaltyArticle.tsx",
  "KoHealthInsuranceDependentArticle.tsx",
  "KoElectricityBillArticle.tsx",
  "KoPolicyHousingLoanArticle.tsx",
];

for (const file of FILES) {
  const fullPath = join(ARTICLES_DIR, file);
  let content = readFileSync(fullPath, "utf-8");
  content = content.replace('<article className="prose-content">', '<article className="section prose-page">\n      <div className="container">');
  content = content.replace('</article>', '      </div>\n    </article>');
  writeFileSync(fullPath, content, "utf-8");
  console.log(`[updated] ${file}`);
}
