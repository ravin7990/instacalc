export function UsSalesTaxArticle() {
  return (
    <article className="section seo-section prose-page">
      <div className="container prose">
        <h2>Complete Guide to US Sales Tax: Combined Rates, NOMAD States & Calculations</h2>
        <p>
          Unlike most industrialized countries that enforce a unified national Value Added Tax (VAT), the United States has no
          federal sales tax. Instead, the administration of consumption taxes is delegated entirely to the individual states and local
          municipalities. This decentralized structure creates a dynamic sales tax landscape consisting of over 11,000 distinct taxing
          jurisdictions across the nation, each with its own statutory rates, base exemptions, and administrative regulations.
        </p>

        <h3>How Combined US Sales Tax Rates Work</h3>
        <p>
          In most states, the total sales tax percentage assessed on retail goods and taxable services is a combined total of multiple
          overlapping local tax layers:
        </p>
        <p>
          <code>Total Combined Sales Tax Rate = State Base Rate + County Rate + City Municipal Rate + Special District Rate</code>
        </p>
        <p>
          Forty-five states and the District of Columbia impose a statewide general sales tax. State base rates range from 2.90% in
          Colorado to 7.25% in California. However, when local counties, municipalities, and special taxation districts (such as public
          transit authorities, fire protection districts, or sports stadium bonds) layer on local option taxes, total combined retail sales
          tax rates frequently exceed 9% to 10% in major metropolitan centers such as Chicago (Illinois), Seattle (Washington), New Orleans
          (Louisiana), and Los Angeles (California).
        </p>

        <h3>The Five "NOMAD" States with No General Sales Tax</h3>
        <p>
          Five US states do not levy a general statewide retail sales tax, collectively known by the acronym <strong>NOMAD</strong>:
        </p>
        <ul>
          <li><strong>New Hampshire:</strong> No state sales tax and no personal wage income tax (maintains limited meals and rooms taxes).</li>
          <li><strong>Oregon:</strong> No state or local retail sales tax (funds state services primarily via progressive personal income taxes).</li>
          <li><strong>Montana:</strong> No statewide general sales tax, although select resort communities are authorized to assess local resort taxes up to 3%.</li>
          <li><strong>Alaska:</strong> No statewide general sales tax; however, home-rule municipalities and boroughs are legally permitted to levy local sales taxes (ranging from 1% to 7.5%).</li>
          <li><strong>Delaware:</strong> No state or local retail sales tax (assesses a gross receipts tax on business enterprises instead).</li>
        </ul>

        <h3>Tax-Exclusive Pricing & Reversing Sales Tax from Receipts</h3>
        <p>
          In American retail commerce, shelf prices and online advertised rates are almost universally displayed <strong>tax-exclusive</strong>
          (pre-tax). Applicable sales taxes are automatically calculated and added at the cash register or checkout screen.
        </p>
        <p>
          When you need to back-calculate or reverse sales tax from a final invoice or cash register receipt to determine the pre-tax base cost:
        </p>
        <p>
          <code>Pre-Tax Base Amount = Final Receipt Total / (1 + Sales Tax Rate as a Decimal)</code>
        </p>
        <p>
          <code>Sales Tax Paid = Final Receipt Total - Pre-Tax Base Amount</code>
        </p>
        <p>
          For example, on a $108.00 purchase in a jurisdiction with an 8% combined sales tax:
          <code> Base Amount = $108.00 / 1.08 = $100.00</code>, confirming exactly $8.00 in total sales tax collected.
        </p>

        <h3>Common State Exemptions & E-Commerce Nexus</h3>
        <p>
          Many US states carve out specific statutory exemptions for essential consumer staples. Most states completely exempt
          unprepared grocery food items and prescription medications from general sales tax, while several states—such as Pennsylvania,
          Minnesota, and New Jersey, as well as New York for items under $110—exempt general apparel and footwear. Under the US Supreme
          Court's landmark 2018 ruling in <em>South Dakota v. Wayfair</em>, out-of-state online retailers and e-commerce platforms
          are legally required to collect and remit sales tax once they exceed statutory economic nexus thresholds (typically $100,000
          in annual sales or 200 separate transactions within a state).
        </p>
      </div>
    </article>
  );
}
