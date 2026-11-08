export function UsSalesTaxArticle() {
  return (
    <article className="section seo-section prose-page">
      <div className="container prose">
        <h2>US Sales Tax Guide: Combined Rates, NOMAD States and Reverse Calculations</h2>
        <p>
          Unlike most developed nations that rely on a unified national Value Added Tax, the United States has no federal
          sales tax. Instead, the power to levy consumption taxes is delegated to state legislatures, county
          commissioners, city councils, and special local taxing districts.
        </p>
        <p>
          This decentralized framework creates a complex system of more than 11,000 separate taxing jurisdictions across
          the country. Each jurisdiction establishes its own statutory rates, taxable categories, and product exemptions.
        </p>
        <p>
          Understanding how multiple tax layers stack together, how online purchases are sourced, and how to reverse
          calculate pre-tax amounts from total receipts prevents surprises at checkout and keeps business invoicing
          accurate.
        </p>

        <h3>Understanding Combined US Sales Tax Layers</h3>
        <p>
          When you purchase goods at a retail store or online in the United States, the total tax percentage charged at
          checkout rarely represents a single state levy. In most states, sales tax is an aggregation of multiple local
          taxing authorities stacked on top of one another.
        </p>
        <p>
          The formula for the total combined sales tax rate is:
        </p>
        <p>
          <code>{"Combined Sales Tax Rate = State Base Rate + County Rate + City Rate + Special District Rate"}</code>
        </p>
        <p>
          Forty-five states plus Washington, D.C., enforce a statewide retail sales tax. State base rates range from 2.90
          percent in Colorado to 7.25 percent in California.
        </p>
        <p>
          However, local option taxes drastically alter what consumers actually pay at the register. In major
          metropolitan areas, county and municipal governments frequently add several percentage points to fund public
          transit, municipal parks, school districts, and convention centers.
        </p>
        <p>
          Consider purchasing a $1,200 computer in Chicago, Illinois:
        </p>
        <p>
          The State of Illinois charges a 6.25 percent base rate. Cook County adds 1.75 percent, the City of Chicago adds
          1.25 percent, and the Regional Transportation Authority levies another 1.00 percent. The final combined sales tax
          rate reaches 10.25 percent. The shopper pays $123.00 in sales tax, bringing the final checkout total to
          $1,323.00. Similar double-digit combined rates apply in cities across Louisiana, Washington, and Tennessee.
        </p>

        <h3>The Five NOMAD States Without Statewide Sales Tax</h3>
        <p>
          Five states do not impose a general statewide retail sales tax. The personal finance community commonly
          remembers them through the acronym NOMAD:
        </p>
        <p>
          New Hampshire levies no general state sales tax and no personal wage income tax, though it collects selective
          excise taxes on restaurant meals, hotel stays, and vehicle rentals.
        </p>
        <p>
          Oregon charges zero state or local sales tax, choosing to fund state government operations primarily through
          progressive personal income taxes.
        </p>
        <p>
          Montana imposes no general statewide sales tax, although designated ski resort towns and tourist communities are
          authorized to collect local resort taxes up to 3 percent.
        </p>
        <p>
          Alaska does not levy a statewide sales tax, but its home-rule municipalities and boroughs possess statutory
          authority to enforce local retail sales taxes ranging from 1 percent to 7.5 percent.
        </p>
        <p>
          Delaware has no state or local retail sales tax, assessing an alternative gross receipts tax on business revenues
          instead.
        </p>

        <h3>Reversing Sales Tax from Cash Receipts and Invoices</h3>
        <p>
          American retailers almost universally display merchandise prices pre-tax on price tags, menus, and online
          product listings. Sales tax is added at the point of sale.
        </p>
        <p>
          When reconciling business expense accounts, logging contractor reimbursements, or completing accounting entries,
          you often need to reverse calculate the pre-tax base cost from a tax-inclusive final receipt.
        </p>
        <p>
          The reverse calculation requires two straightforward mathematical steps:
        </p>
        <p>
          <code>{"Pre-Tax Base Amount = Final Receipt Total / (1 + Combined Tax Rate as a Decimal)"}</code>
        </p>
        <p>
          <code>{"Sales Tax Paid = Final Receipt Total - Pre-Tax Base Amount"}</code>
        </p>
        <p>
          Suppose an invoice shows an all-inclusive charge of $5,437.50 in a jurisdiction with an 8.75 percent sales tax
          rate. Convert 8.75 percent into a decimal (0.0875) and add 1 to get 1.0875. Dividing $5,437.50 by 1.0875 yields
          an exact pre-tax base cost of $5,000.00. Subtracting $5,000.00 from the receipt reveals that you paid exactly
          $437.50 in sales tax.
        </p>

        <h3>Sourcing Rules, E-Commerce Nexus and Use Tax</h3>
        <p>
          How sales tax is applied to shipped merchandise depends on state sourcing legislation:
        </p>
        <p>
          Origin-based states calculate sales tax based on the physical location of the seller. If you order an item from a
          store located in an origin-based state like Texas or Ohio, sales tax is assessed at the merchant's business
          location rate.
        </p>
        <p>
          Destination-based states, which represent the vast majority of American states, assess sales tax based on where
          the buyer takes delivery. If an item ships to your home address, the seller must apply the combined tax rate in
          effect at your doorstep.
        </p>
        <p>
          Under the United States Supreme Court ruling in South Dakota v. Wayfair (2018), states can mandate out-of-state
          online merchants and digital marketplaces to collect local sales tax once they surpass economic nexus
          thresholds, commonly set at $100,000 in gross annual sales or 200 individual transactions delivered into the
          state.
        </p>
        <p>
          If an out-of-state retailer fails to collect sales tax on an online order, state laws technically require the buyer
          to declare and pay a companion use tax on their annual state income tax return.
        </p>

        <h3>Statutory Exemptions and Sales Tax Holidays</h3>
        <p>
          State tax codes frequently exempt essential survival goods from the consumption tax base. Most states completely
          exempt unprepared grocery food, prescription medications, and medical prosthetics from retail sales tax.
        </p>
        <p>
          Clothing enjoys preferential treatment in select states: Pennsylvania, Minnesota, and New Jersey exempt general
          apparel completely, while New York exempts clothing and footwear purchases under $110 per item.
        </p>
        <p>
          Nearly twenty states host annual sales tax holidays, typically scheduled during late summer. These promotional
          weekends suspend state and local sales taxes on qualifying school supplies, computers, backpacks, and hurricane
          emergency gear, offering temporary cash relief for working households.
        </p>
      </div>
    </article>
  );
}
