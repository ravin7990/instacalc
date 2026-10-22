export function InGratuityArticle() {
  return (
    <article className="section seo-section prose-page">
      <div className="container prose">
        <h2>Gratuity Calculator Guide: Payment of Gratuity Act 1972, Formulas & Tax Exemption in India</h2>
        <p>
          Gratuity is a statutory monetary benefit provided by employers in India to employees in recognition of long, faithful service. Governed by the <strong>Payment of Gratuity Act, 1972</strong>, gratuity forms an essential pillar of social security and terminal financial planning for salaried professionals across the private and public sectors.
        </p>

        <h3>Eligibility Criteria under the Act</h3>
        <p>
          The Payment of Gratuity Act applies to every factory, mine, oilfield, plantation, port, railway company, shop, or commercial establishment in which 10 or more persons are employed on any day in the preceding 12 months. An employee becomes eligible to receive gratuity upon:
        </p>
        <ul>
          <li><strong>5 Years of Continuous Service:</strong> Completion of at least 5 years of uninterrupted service with the same employer.</li>
          <li><strong>Exceptions to the 5-Year Rule:</strong> The mandatory 5-year condition is legally waived in cases of an employee's death or permanent total disablement due to accident or disease, in which case gratuity is disbursed immediately to nominees or legal heirs.</li>
          <li><strong>Events Triggering Payment:</strong> Gratuity becomes payable upon retirement, superannuation, resignation, or termination.</li>
        </ul>

        <h3>The Statutory 15/26 Gratuity Formula</h3>
        <p>
          For employees covered under the Payment of Gratuity Act, 1972, gratuity is calculated using a standardized mathematical formula based on 15 days of salary for every completed year of service:
        </p>
        <p>
          <code>Gratuity = (15 × Last Drawn Basic Salary × Number of Completed Years) / 26</code>
        </p>
        <p>
          Key components of the calculation:
        </p>
        <ul>
          <li><strong>Last Drawn Basic Salary:</strong> Includes Basic Pay + Dearness Allowance (DA). Allowances like HRA, conveyance, special allowance, and performance bonuses are excluded.</li>
          <li><strong>The Divisor (26 Days):</strong> The month is treated as having 26 working days, calculated by subtracting 4 weekly Sundays from a 30-day month. Thus, dividing monthly salary by 26 determines your effective daily wage.</li>
          <li><strong>15 Days Wage:</strong> Multiplying the daily wage by 15 establishes the half-month statutory wage entitlement for each year served.</li>
          <li><strong>Rounding of Service Years:</strong> If the fraction of service in your final year exceeds 6 months (e.g. 8 years and 7 months), it is rounded up to the nearest whole year (9 years). If the fraction is 6 months or less (e.g. 8 years and 5 months), it is rounded down to 8 years.</li>
        </ul>

        <h3>Worked Numerical Example</h3>
        <p>
          Consider an employee who resigns after 12 years and 8 months of continuous service, with a last-drawn Basic Salary + DA of ₹80,000 per month:
        </p>
        <ul>
          <li>Service years rounded: 13 years (since 8 months {">"} 6 months).</li>
          <li>Daily wage: ₹80,000 / 26 = ₹3,076.92.</li>
          <li>Gratuity per year: 15 × ₹3,076.92 = ₹46,153.85.</li>
          <li>Total Gratuity Payable: ₹46,153.85 × 13 = <strong>₹6,00,000</strong>.</li>
        </ul>

        <h3>Employees Not Covered by the Act</h3>
        <p>
          For establishments not covered under the Act (or private contracts), the formula uses a 30-day month divisor:
        </p>
        <p>
          <code>Gratuity = (15 × Last Drawn Basic Salary × Number of Completed Years) / 30</code>
        </p>

        <h3>Income Tax Exemption Limits under Section 10(10)</h3>
        <p>
          Taxability of gratuity is governed by Section 10(10) of the Indian Income Tax Act:
        </p>
        <ul>
          <li><strong>Government Employees:</strong> Gratuity received by Central, State, or local authority employees is <strong>100% tax-exempt</strong> without any monetary cap.</li>
          <li><strong>Non-Government Private Employees:</strong> The statutory tax exemption is capped at the lowest of:
            <ol>
              <li>The actual gratuity received.</li>
              <li>The calculated statutory gratuity amount under the 15/26 formula.</li>
              <li>The statutory lifetime maximum limit of <strong>₹20,00,000</strong> (raised from ₹10 Lakh by Ministry notification).</li>
            </ol>
          </li>
          <li>Any gratuity amount received in excess of ₹20 Lakh is added to taxable salary income and taxed according to your applicable slab rate.</li>
        </ul>
      </div>
    </article>
  );
}
