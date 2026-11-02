export function InRdArticle() {
  return (
    <article className="section seo-section prose-page">
      <div className="container prose">
        <h2>Recurring Deposit (RD) Calculator Guide: Compounding Formulas, Banking Norms & Tax Rules</h2>
        <p>
          A Recurring Deposit (RD) is a disciplined fixed-income savings product offered by Indian public, private, and cooperative banks as well as the Department of Posts (India Post). It allows individuals to deposit a predetermined sum of money each month over a specified tenure (ranging from 6 months to 10 years), earning a guaranteed interest rate equivalent to that of a traditional Fixed Deposit (FD).
        </p>

        <h3>How Bank Recurring Deposit Interest is Calculated</h3>
        <p>
          In India, the Reserve Bank of India (RBI) mandates that bank recurring deposits compound interest on a <strong>quarterly basis</strong>, even though deposits are made on a monthly schedule.
        </p>
        <p>
          The maturity value of a recurring deposit is calculated using the formula:
        </p>
        <p>
          <code>M = P × [ (1 + i)^n - 1 ] / [ 1 - (1 + i)^(-1/3) ]</code>
        </p>
        <p>
          Where:
        </p>
        <ul>
          <li><strong>M:</strong> Total maturity amount received at the conclusion of the tenure.</li>
          <li><strong>P:</strong> The monthly installment amount deposited each calendar month (e.g. ₹5,000 or ₹10,000).</li>
          <li><strong>i:</strong> The quarterly interest rate, calculated as annual interest rate divided by 4 and 100 (e.g. for a 7% p.a. rate, i = 7 / 400 = 0.0175).</li>
          <li><strong>n:</strong> The total number of quarterly compounding periods (tenure in quarters, e.g. a 3-year RD has 12 quarters).</li>
        </ul>

        <h3>Recurring Deposit (RD) vs Systematic Investment Plan (SIP)</h3>
        <p>
          While both RD and SIP involve recurring monthly cash outflows, they serve fundamentally different financial objectives:
        </p>
        <ul>
          <li><strong>Returns Certainty:</strong> An RD locks in a guaranteed, fixed nominal return known on day one. A mutual fund SIP is market-linked; returns fluctuate with market conditions but have historically averaged 11% to 14% over 5+ year cycles.</li>
          <li><strong>Capital Protection:</strong> Bank RDs are covered by the <strong>Deposit Insurance and Credit Guarantee Corporation (DICGC)</strong> up to ₹5,00,000 per depositor per bank (inclusive of principal and accrued interest). Mutual fund SIPs carry investment risk and are not government-insured.</li>
          <li><strong>Tenure & Liquidity:</strong> RDs have a fixed maturity date, with premature withdrawals incurring a 0.5% to 1.0% interest rate penalty. Open-ended mutual fund SIPs can be paused, increased, or redeemed at any time (subject to applicable exit loads and taxation).</li>
        </ul>

        <h3>TDS and Income Tax Provisions on RD Interest</h3>
        <p>
          Interest accrued on Recurring Deposits is fully taxable in the hands of the depositor under the head <strong>Income from Other Sources</strong>:
        </p>
        <ul>
          <li><strong>Section 194A TDS Threshold:</strong> Banks are required to deduct Tax Deducted at Source (TDS) at 10% if the total interest earned on all deposits (FDs and RDs combined) across all branches of that bank exceeds <strong>₹40,000</strong> in a financial year for general taxpayers (or <strong>₹50,000</strong> for senior citizens aged 60 and above under Section 80TTB).</li>
          <li><strong>Absence of PAN:</strong> If a valid PAN (Permanent Account Number) is not linked to your bank account, TDS is deducted at a penal rate of <strong>20%</strong>.</li>
          <li><strong>Form 15G / 15H:</strong> Depositors whose total estimated annual income is below the taxable threshold can submit Form 15G (for individuals below 60) or Form 15H (for senior citizens) at the beginning of the financial year to request non-deduction of TDS.</li>
        </ul>

        <h3>Post Office Recurring Deposit (PO-RD)</h3>
        <p>
          The 5-Year National Savings Recurring Deposit Scheme offered by India Post is backed directly by the Ministry of Finance. It features a fixed 5-year tenure with interest compounded quarterly and revised by the Government every quarter. Key features include loan facilities against deposit balances after 1 year of continuous contributions and premature closure permitted after 3 years.
        </p>

        <h3>Practical Tips for RD Investors</h3>
        <ul>
          <li>Set up an auto-debit standing instruction tied to your salary credit date to avoid late-payment penalty charges.</li>
          <li>Consider laddering multiple smaller RDs with staggered maturity dates rather than a single large RD, providing intermediate liquidity without breaking the entire deposit.</li>
        </ul>
      </div>
    </article>
  );
}
