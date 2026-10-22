export function UsDaysArticle() {
  return (
    <article className="section seo-section prose-page">
      <div className="container prose">
        <h2>Calculating Days Between Dates: Calendar Days, Business Days & US Federal Holidays</h2>
        <p>
          Determining the precise elapsed time between two dates is a fundamental requirement in corporate operations, project
          management, supply chain logistics, legal proceedings, and financial transactions across the United States. While standard
          date calculation measures raw chronological days, commercial contracts and judicial procedures frequently mandate
          <strong>business day calculations</strong> that exclude non-working weekends and statutory holidays.
        </p>

        <h3>Calendar Days vs. US Business Days</h3>
        <p>
          A <strong>calendar day calculation</strong> accounts for every 24-hour cycle between two dates, including all 365 days of a
          standard year (and 366 days during leap years). This is standard for calculating biological age, hotel stays, interest accrual
          on daily debt, and equipment lease terms.
        </p>
        <p>
          In contrast, a <strong>business day calculation</strong> measures only commercial working days. Under standard US business
          conventions, weekends (Saturdays and Sundays) and officially observed federal statutory holidays are deducted from the total.
          For a typical project schedule or legal compliance window spanning 30 calendar days, the actual number of working business
          days is usually between 20 and 22 days.
        </p>

        <h3>The 11 US Federal Holidays (5 U.S.C. § 6103)</h3>
        <p>
          The United States federal government officially recognizes eleven permanent public holidays codified under Title 5 of the
          United States Code:
        </p>
        <ul>
          <li><strong>New Year's Day:</strong> January 1.</li>
          <li><strong>Martin Luther King Jr. Day:</strong> Third Monday in January.</li>
          <li><strong>Washington's Birthday (Presidents' Day):</strong> Third Monday in February.</li>
          <li><strong>Memorial Day:</strong> Last Monday in May.</li>
          <li><strong>Juneteenth National Independence Day:</strong> June 19.</li>
          <li><strong>Independence Day:</strong> July 4.</li>
          <li><strong>Labor Day:</strong> First Monday in September.</li>
          <li><strong>Columbus Day:</strong> Second Monday in October.</li>
          <li><strong>Veterans Day:</strong> November 11.</li>
          <li><strong>Thanksgiving Day:</strong> Fourth Thursday in November.</li>
          <li><strong>Christmas Day:</strong> December 25.</li>
        </ul>
        <p>
          Under federal "in lieu of" holiday rules, when a fixed-date federal holiday falls on a Saturday, federal offices
          observe it on the preceding Friday. When it falls on a Sunday, it is officially observed on the following Monday.
        </p>

        <h3>Critical Legal & Financial Day-Count Applications</h3>
        <p>
          Precision in day counting carries substantial legal and financial implications under US regulations:
        </p>
        <ul>
          <li><strong>SEC T+1 Settlement Rule:</strong> Effective May 2024, the Securities and Exchange Commission (SEC) mandates a <strong>T+1 settlement cycle</strong>—requiring securities transactions (stocks, bonds, municipal notes) to settle within one business day after trade execution.</li>
          <li><strong>Federal Court Deadlines (FRCP Rule 6):</strong> Under the Federal Rules of Civil Procedure, when counting statutory filing periods, if the final day of a deadline falls on a Saturday, Sunday, or legal holiday, the period continues to run until the end of the next day that is not a weekend or legal holiday.</li>
          <li><strong>Truth in Lending Act (TILA) Right of Rescission:</strong> Borrowers refinancing a primary residential mortgage are granted a mandatory 3-business-day right to cancel the transaction without penalty. Under TILA, business days for rescission include all calendar days except Sundays and specified federal holidays (Saturdays are included).</li>
          <li><strong>Commercial Bond Day-Count Conventions:</strong> In US corporate and municipal bond markets, accrued interest calculations frequently adhere to the <strong>30/360 convention</strong> (assuming 30 days per month and 360 days per year), whereas US Treasury bonds follow the <strong>Actual/Actual convention</strong>, counting literal calendar days between coupon payment dates.</li>
        </ul>
      </div>
    </article>
  );
}
