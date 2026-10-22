export function UsMortgageArticle() {
  return (
    <article className="section seo-section prose-page">
      <div className="container prose">
        <h2>Navigating Home Mortgages in the US: PITI, Amortization & Loan Types</h2>
        <p>
          Securing a residential mortgage is typically the largest financial transaction an American family will ever undertake.
          Whether purchasing your first single-family home or refinancing an existing property, understanding how monthly mortgage
          payments are calculated—and the individual components that comprise your total housing payment—is vital for choosing the
          right loan term and protecting your household budget.
        </p>

        <h3>Deconstructing PITI: The Four Pillars of a Mortgage Payment</h3>
        <p>
          In the United States, your monthly housing remittance rarely consists solely of loan repayment. Most mortgage servicers
          administer an escrow account that bundles four key costs collectively known as <strong>PITI</strong>:
        </p>
        <ul>
          <li><strong>Principal:</strong> The portion of each monthly payment that directly reduces your remaining loan balance.</li>
          <li><strong>Interest:</strong> The fee charged by the lender for borrowing capital, calculated monthly on your remaining principal.</li>
          <li><strong>Property Taxes:</strong> County and municipal ad valorem taxes assessed on your home's appraised value, collected monthly into escrow and disbursed to local tax authorities annually or semiannually.</li>
          <li><strong>Homeowners Insurance:</strong> Hazard and casualty insurance protecting the physical structure and contents against fire, storms, and liabilities.</li>
        </ul>

        <h3>The Amortization Formula & Payment Mechanics</h3>
        <p>
          Fixed-rate mortgages utilize a standard mathematical amortization formula to establish a fixed monthly Principal &
          Interest (P&I) installment throughout the entire life of the loan:
        </p>
        <p>
          <code>M = P × [r(1 + r)^n] / [(1 + r)^n - 1]</code>
        </p>
        <p>
          Where <em>M</em> is the monthly P&I payment, <em>P</em> is the initial principal loan balance, <em>r</em> is the monthly
          interest rate (annual rate divided by 12), and <em>n</em> represents the total number of monthly payments (360 months for
          a 30-year mortgage, or 180 months for a 15-year term).
        </p>
        <p>
          Due to standard amortization curves, payments made in the initial years of a 30-year mortgage are heavily weighted toward interest,
          with only a modest percentage reducing the principal balance. As the loan matures, the interest portion declines and the principal
          repayment accelerates rapidly.
        </p>

        <h3>Down Payments, Loan Types & Private Mortgage Insurance (PMI)</h3>
        <p>
          Buyers can choose among multiple loan structures based on their credit profile and available savings:
        </p>
        <ul>
          <li><strong>Conventional Conforming Loans:</strong> Backed by Fannie Mae and Freddie Mac. A down payment of at least 20% eliminates the requirement for Private Mortgage Insurance (PMI). If you put down less than 20%, PMI typically costs between 0.3% and 1.5% of the loan amount annually. Under the federal Homeowners Protection Act (HPA), lenders must automatically cancel PMI once your loan balance reaches 78% of the home's original value.</li>
          <li><strong>FHA Loans:</strong> Insured by the Federal Housing Administration, offering down payments as low as 3.5% with lower credit score minimums. FHA loans require both an Upfront Mortgage Insurance Premium (UFMIP) and an annual Mortgage Insurance Premium (MIP) that often lasts for the entire duration of the loan.</li>
          <li><strong>VA Loans:</strong> Guaranteed by the Department of Veterans Affairs for qualifying military servicemembers and veterans, offering 0% down payment financing with no ongoing monthly mortgage insurance.</li>
        </ul>

        <h3>Discount Points vs. Lender Credits</h3>
        <p>
          When locking in your mortgage interest rate, you can choose to purchase <strong>discount points</strong> (paying 1% of the loan amount
          upfront to permanently lower your interest rate by roughly 0.25%) or accept <strong>lender credits</strong> (accepting a slightly higher
          rate in exchange for cash credits that cover your out-of-pocket closing costs). Calculating your break-even horizon (upfront cost divided
          by monthly savings) determines whether paying for points is financially advantageous based on how long you intend to keep the home.
        </p>
      </div>
    </article>
  );
}
