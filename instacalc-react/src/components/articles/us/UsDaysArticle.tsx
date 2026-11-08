export function UsDaysArticle() {
  return (
    <article className="section seo-section prose-page">
      <div className="container prose">
        <h2>Days Between Dates Guide: Calendar Days, Business Days and US Federal Holidays</h2>
        <p>
          Measuring the exact elapsed time between two dates is an everyday necessity for corporate operations, project
          schedules, supply chain logistics, legal proceedings, and financial transactions across the United States. Casual
          calculations count raw calendar days. Professional contracts, court proceedings, and banking networks operate on
          strict business day rules that exclude non-working weekends and statutory public holidays. Understanding how these
          systems differ protects you from missed deadlines, contractual defaults, and late settlement penalties.
        </p>

        <h3>Calendar Days Versus Working Business Days</h3>
        <p>
          A calendar day calculation measures every sequential twenty-four-hour period between two dates on the Gregorian
          calendar. A typical calendar year contains 365 days, expanding to 366 days during leap years. Every weekend and
          holiday counts toward the total. Calendar day measurements govern biological age, hotel bookings, hospital stays,
          daily simple interest accrual, and residential lease durations.
        </p>
        <p>
          Business day calculations follow a much tighter filter. In the United States commercial sector, standard business
          days run Monday through Friday, excluding Saturdays, Sundays, and officially recognized federal holidays. A project
          timeline spanning 30 calendar days typically encompasses only 20 to 22 actual working days. During holiday seasons
          like November and December, that working count shrinks even further.
        </p>
        <p>
          Across an entire calendar year, there are usually 260 or 261 total weekdays. After deducting the eleven federal
          statutory holidays, a standard American work year contains between 250 and 252 active business days. Calculating
          delivery dates, construction schedules, and vendor performance windows based on business days rather than raw calendar
          days ensures project expectations remain grounded in reality.
        </p>

        <h3>The Eleven US Federal Statutory Holidays</h3>
        <p>
          Federal public holidays are created by Congress and codified under Title 5 of the United States Code (5 U.S.C. Section
          6103). Federal executive departments, financial clearinghouses, and the Federal Reserve System halt operations on
          eleven permanent annual holidays:
        </p>
        <p>
          New Year's Day falls on January 1. Martin Luther King Jr. Day takes place on the third Monday in January. Washington's
          Birthday, commonly celebrated as Presidents' Day, occurs on the third Monday in February. Memorial Day honors fallen
          military service members on the final Monday in May. Juneteenth National Independence Day marks the end of slavery on
          June 19. Independence Day celebrates the birth of the nation on July 4. Labor Day recognizes American workers on the first
          Monday in September. Columbus Day, increasingly observed alongside Indigenous Peoples' Day, takes place on the second
          Monday in October. Veterans Day honors military veterans on November 11. Thanksgiving Day brings families together on
          the fourth Thursday in November. Christmas Day concludes the holiday calendar on December 25.
        </p>
        <p>
          When a fixed-date federal holiday falls on a weekend, federal office rules specify observed substitutes. Under federal
          regulations, a holiday landing on a Saturday is officially observed on the preceding Friday. When a holiday falls on a
          Sunday, federal offices and financial institutions observe it on the following Monday.
        </p>

        <h3>Judicial Deadlines and the Federal Rules of Civil Procedure</h3>
        <p>
          In federal and state litigation, court procedural rules strictly govern how attorneys and litigants count statutory
          filing periods. Under Rule 6(a) of the Federal Rules of Civil Procedure (FRCP), day-counting rules prevent litigants from
          being penalized by weekend court closures.
        </p>
        <p>
          When calculating a legal deadline stated in days, you exclude the day of the triggering event that starts the clock. You
          then count every day, including intermediate Saturdays, Sundays, and legal holidays. However, the rule provides a vital
          exception for the final deadline day. If the final day of the statutory filing period falls on a Saturday, Sunday, or
          official legal holiday, the deadline automatically rolls forward to the end of the next day that is not a weekend or
          legal holiday. Similar rules apply when the clerk's office is inaccessible due to severe weather or computer system
          outages.
        </p>

        <h3>Financial Settlement Cycles and Day-Count Conventions</h3>
        <p>
          Accurate date math dictates financial market mechanics across the United States economy. In May 2024, the Securities and
          Exchange Commission (SEC) enacted the landmark T+1 settlement rule under Exchange Act Rule 15c6-1. The rule cuts the
          standard settlement cycle for transactions in US stocks, corporate bonds, and municipal securities from two business
          days down to a single business day after trade execution. If you sell shares of stock on Tuesday morning, trade proceeds
          settle and become legally available on Wednesday, provided no federal bank holiday intervenes.
        </p>
        <p>
          In consumer lending, the Truth in Lending Act (TILA) provides a mandatory three-business-day Right of Rescission when a
          homeowner refinances a primary mortgage. This statutory cooling-off window allows borrowers to cancel the transaction
          without penalty. Crucially, TILA defines business days differently than commercial banks. For rescission purposes,
          business days include all calendar days except Sundays and specified federal holidays. Saturdays count as active
          business days under federal rescission rules.
        </p>
        <p>
          Fixed-income debt markets also rely on specialized day-count conventions to compute accrued interest. US Treasury bonds
          operate on the Actual/Actual convention, dividing literal elapsed calendar days by the exact number of days in the coupon
          period. Corporate and municipal bonds frequently use the 30/360 convention, which simplifies accounting by assuming every
          month contains exactly 30 days and each year contains 360 days.
        </p>
      </div>
    </article>
  );
}
