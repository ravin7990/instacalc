export function InFdArticle() {
  return (
    <article className="section seo-section prose-page">
      <div className="container prose">
        <h2>FD & RD Calculator Guide: Bank Fixed Deposits, Recurring Deposits & Tax Rules in India</h2>
        <p>
          Fixed Deposits (FDs) and Recurring Deposits (RDs) remain the most popular, trusted fixed-income investment instruments in India. Offered by public sector banks, private commercial banks, small finance banks, and India Post, these deposits provide guaranteed capital protection, predictable returns, and reliable cash flows for conservative savers and retirees.
        </p>

        <h3>Compound Interest Formula: Quarterly Compounding Mechanics</h3>
        <p>
          While bank FD interest rates are quoted on an annual percentage basis (e.g. 7.25% p.a.), Indian commercial banks compound interest on a <strong>quarterly basis</strong> (four times per year). The cumulative maturity value is calculated using the compound interest formula:
        </p>
        <p>
          <code>A = P × (1 + r / n)^(n × t)</code>
        </p>
        <p>
          Where:
        </p>
        <ul>
          <li><strong>A:</strong> The final maturity proceeds paid to you at term completion.</li>
          <li><strong>P:</strong> The initial principal deposit amount (e.g. ₹1,00,000 or ₹5,00,000).</li>
          <li><strong>r:</strong> Annual interest rate expressed as a decimal (e.g. 7.5% = 0.075).</li>
          <li><strong>n:</strong> Compounding frequency per year (n = 4 for standard quarterly compounding in Indian banks).</li>
          <li><strong>t:</strong> Total tenure in years (e.g. 1 year, 3 years, 5 years).</li>
        </ul>

        <h3>Cumulative vs. Non-Cumulative Payout Options</h3>
        <p>
          Investors can choose between two interest disbursement models:
        </p>
        <ul>
          <li><strong>Cumulative FD (Reinvestment Plan):</strong> Interest is compounded quarterly and paid together with the principal at maturity. This maximizes wealth growth through compounding and is ideal for long-term goal savers.</li>
          <li><strong>Non-Cumulative FD (Periodic Payouts):</strong> Interest is disbursed directly into your savings account at chosen monthly, quarterly, or annual intervals. This provides a steady cash flow and is favored by senior citizens for living expenses.</li>
        </ul>

        <h3>Safety: DICGC ₹5 Lakh Sovereign Guarantee</h3>
        <p>
          Under the Deposit Insurance and Credit Guarantee Corporation (DICGC) Act—a wholly owned subsidiary of the Reserve Bank of India (RBI)—each depositor is legally insured up to a maximum of <strong>₹5,00,000</strong> (inclusive of both principal and accrued interest) per registered bank. This insurance applies equally across public banks, private commercial lenders, and small finance banks. Investors holding larger sums often distribute deposits across multiple banking institutions to keep total balances fully insured.
        </p>

        <h3>Senior Citizen Interest Rate Advantages</h3>
        <p>
          Indian banks universally provide an additional interest rate premium—typically <strong>+0.50% (50 basis points)</strong> higher than standard card rates—to individuals aged 60 and above. Many lenders also offer specialized “Super Senior Citizen” rates (aged 80+) with up to 0.75% to 0.80% extra return on select tenures.
        </p>

        <h3>Taxation: TDS Thresholds, Section 194A & Forms 15G / 15H</h3>
        <p>
          Unlike PPF, interest earned on bank FDs and RDs is fully taxable as “Income from Other Sources” based on your applicable income tax slab:
        </p>
        <ul>
          <li><strong>TDS Thresholds under Section 194A:</strong> Banks deduct 10% Tax Deducted at Source (TDS) if total annual interest across all branches of that bank exceeds:
            <ul>
              <li><strong>₹40,000 per financial year</strong> for regular depositors (below 60 years).</li>
              <li><strong>₹50,000 per financial year</strong> for Senior Citizens (under Section 80TTB).</li>
            </ul>
          </li>
          <li><strong>No PAN Penalty:</strong> If a valid PAN is not linked to the bank account, TDS is deducted at a punitive rate of 20%.</li>
          <li><strong>Avoiding TDS via Form 15G / 15H:</strong> If your total estimated taxable income for the financial year is below the basic tax exemption limit, you can submit <strong>Form 15G</strong> (for individuals under 60) or <strong>Form 15H</strong> (for senior citizens) at the start of each financial year to receive interest without TDS deductions.</li>
          <li><strong>Tax-Saving 5-Year FDs (Section 80C):</strong> Special 5-year lock-in FDs qualify for tax deductions up to ₹1,50,000 under Section 80C (Old Tax Regime), though the interest earned remains taxable.</li>
        </ul>
      </div>
    </article>
  );
}
