export function UsCdArticle() {
  return (
    <article className="section seo-section prose-page">
      <div className="container prose">
        <h2>Complete Guide to Certificates of Deposit (CDs): APY, Terms & CD Ladders</h2>
        <p>
          A Certificate of Deposit (CD) is a federally insured time-deposit account offered by banks and credit unions across the
          United States. In exchange for agreeing to leave your principal untouched for a predetermined maturity term—ranging from
          3 months to 5 years or longer—financial institutions guarantee a fixed rate of interest that is typically higher than
          standard liquid savings or checking accounts.
        </p>

        <h3>Understanding APY, Nominal APR & Daily Compounding</h3>
        <p>
          When shopping for CD yields, the headline metric to examine is the <strong>Annual Percentage Yield (APY)</strong> rather than
          the nominal Annual Percentage Rate (APR). While APR reflects the base interest rate before compounding, APY accounts for the
          compounding frequency throughout a full calendar year:
        </p>
        <p>
          <code>APY = (1 + r/n)^n - 1</code>
        </p>
        <p>
          Where <em>r</em> is the nominal interest rate and <em>n</em> is the compounding frequency per year. Most modern competitive
          US online banks compound CD interest <strong>daily (n = 365)</strong>, which yields slightly more earned interest over time than
          monthly or annual compounding. For example, a $25,000 deposit in a 12-month CD with a 5.00% APY will generate exactly $1,250 in
          interest earnings upon reaching maturity.
        </p>

        <h3>Federal Deposit Insurance: FDIC & NCUA Protections</h3>
        <p>
          Certificates of Deposit are among the safest investment vehicles available to American savers. Unlike stocks, corporate bonds,
          or mutual funds that carry market risk, CD deposits are backed by the full faith and credit of the United States government:
        </p>
        <ul>
          <li><strong>FDIC Insurance (Banks):</strong> Covered by the Federal Deposit Insurance Corporation up to <strong>$250,000</strong> per depositor, per insured bank, for each account ownership category.</li>
          <li><strong>NCUA Insurance (Credit Unions):</strong> Covered by the National Credit Union Share Insurance Fund (NCUSIF) up to <strong>$250,000</strong> per member, per insured credit union, providing identical statutory protections.</li>
        </ul>
        <p>
          Depositors with more than $250,000 can easily protect multi-million dollar balances by spreading deposits across separate
          institutions or structuring accounts across different ownership categories (such as individual, joint, and revocable trust accounts).
        </p>

        <h3>Early Withdrawal Penalties (EWP) & The CD Ladder Strategy</h3>
        <p>
          If you liquidate your CD prior to its contracted maturity date, the issuing financial institution assesses an
          <strong>Early Withdrawal Penalty (EWP)</strong>. Federal banking rules (Regulation D) establish minimum penalties, but individual
          banks set their own terms:
        </p>
        <ul>
          <li><strong>Short-Term CDs (≤ 12 months):</strong> Penalty typically forfeits 90 days (3 months) worth of simple interest.</li>
          <li><strong>Medium-Term CDs (1 to 3 years):</strong> Penalty usually forfeits 180 days (6 months) of interest.</li>
          <li><strong>Long-Term CDs (3 to 5+ years):</strong> Penalty often forfeits 270 to 365 days (9 to 12 months) of interest.</li>
        </ul>
        <p>
          To maintain liquidity while capturing peak long-term interest rates, savvy savers employ a <strong>CD Ladder</strong>. Instead of
          locking $50,000 into a single 5-year CD, you split the funds equally ($10,000 each) across 1-year, 2-year, 3-year, 4-year, and 5-year
          CDs. Each year, one CD matures, providing access to liquid cash without penalty. If the cash is not needed, you simply roll that
          matured CD into a new 5-year CD at prevailing market rates, creating a perpetual rolling income stream.
        </p>
        <p>
          Interest earned on standard bank CDs is taxable as ordinary income in the tax year it is credited, reported annually on IRS Form 1099-INT.
          Investors seeking higher liquidity may also consider brokered CDs traded through major brokerage accounts, which can be sold on secondary markets
          before maturity without bank early withdrawal penalties, subject to prevailing market value fluctuations.
        </p>
      </div>
    </article>
  );
}
