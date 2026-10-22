export function InGstArticle() {
  return (
    <article className="section seo-section prose-page">
      <div className="container prose">
        <h2>GST Calculator Guide: Goods and Services Tax Calculations, Slabs & ITC in India</h2>
        <p>
          The Goods and Services Tax (GST), introduced on 1 July 2017 under the motto “One Nation, One Tax,” revolutionized the indirect taxation structure in India by subsuming earlier levies like Central Excise Duty, Service Tax, State VAT, Entry Tax, and Luxury Tax. Administered jointly by the Central Board of Indirect Taxes and Customs (CBIC) and State GST departments under the guidance of the GST Council, GST applies across almost all commercial supplies of goods and services throughout India.
        </p>

        <h3>Dual GST Structure: CGST, SGST, UTGST & IGST Explained</h3>
        <p>
          India follows a federal dual GST architecture where taxes are levied concurrently by the Union and the States:
        </p>
        <ul>
          <li><strong>Intra-State Supply (Buyer and seller in the same State):</strong> Tax is divided equally into <strong>Central GST (CGST)</strong> and <strong>State GST (SGST)</strong> (or UTGST in Union Territories without a legislature). For an 18% GST supply, 9% accrues to the Central Government as CGST and 9% accrues to the State Government as SGST.</li>
          <li><strong>Inter-State Supply (Buyer and seller in different States):</strong> A single unified tax called <strong>Integrated GST (IGST)</strong> is levied by the Central Government, which is later apportioned between the Centre and the consuming destination State based on the destination-based consumption principle.</li>
        </ul>

        <h3>Standard Indian GST Tax Slabs</h3>
        <p>
          The GST Council categorizes taxable goods and services into five principal tax rate tiers:
        </p>
        <ul>
          <li><strong>0% (Exempt):</strong> Essential food grains, fresh milk, unbranded flour, eggs, vegetables, health services, and basic educational services.</li>
          <li><strong>5%:</strong> Packaged food items, domestic LPG, tea, coffee, edible oils, life-saving medicines, railway passenger transport, and economy air travel.</li>
          <li><strong>12%:</strong> Processed foods, business class air tickets, computer accessories, work contracts for government infrastructure, and specified medical devices.</li>
          <li><strong>18% (Standard Rate):</strong> Most industrial goods, professional IT consulting, software subscriptions, legal services, salon services, restaurants, and telecom services.</li>
          <li><strong>28% (Luxury & Demerit Goods):</strong> Automobiles, air conditioners, luxury motorcycles, pan masala, and aerated drinks (often subject to an additional GST Compensation Cess).</li>
        </ul>

        <h3>Formulas: Adding GST vs. Extracting GST (Inclusive vs. Exclusive)</h3>
        <p>
          Depending on whether pricing is stated net or gross of tax, businesses use two mathematical equations:
        </p>

        <h4>1. Adding GST (Exclusive Mode — Forward Charge)</h4>
        <p>
          When you have a base net price and need to charge GST on top:
        </p>
        <p>
          <code>GST Amount = (Net Price × GST Rate) / 100</code><br />
          <code>Total Gross Price = Net Price + GST Amount = Net Price × (1 + GST Rate / 100)</code>
        </p>
        <p>
          <em>Example:</em> A consulting service with a base net fee of ₹10,000 at 18% GST has a tax amount of ₹1,800, bringing the total invoice to ₹11,800 (₹900 CGST + ₹900 SGST).
        </p>

        <h4>2. Removing GST (Inclusive Mode — Reverse Calculation)</h4>
        <p>
          When you receive a final retail price (MRP) and need to determine the embedded base price and tax component:
        </p>
        <p>
          <code>Base Net Price = (Gross Invoice Amount × 100) / (100 + GST Rate)</code><br />
          <code>GST Component = Gross Invoice Amount - Base Net Price = Gross Amount × [GST Rate / (100 + GST Rate)]</code>
        </p>
        <p>
          <em>Example:</em> An electronic item purchased for an all-inclusive price of ₹11,800 at 18% GST contains a base price of ₹11,800 × 100 / 118 = ₹10,000, with ₹1,800 of embedded GST.
        </p>

        <h3>Input Tax Credit (ITC) Mechanics</h3>
        <p>
          The core advantage of GST for registered Indian businesses is the <strong>Input Tax Credit (ITC)</strong>. Tax paid on business purchases (raw materials, office rent, IT services, capital goods) can be credited against output tax liability on sales. To claim ITC under Section 16 of the CGST Act, the buyer must possess a valid tax invoice, the supplier must have filed their GSTR-1 (so the invoice reflects in the buyer's GSTR-2B), and the tax must have been deposited with the government.
        </p>
      </div>
    </article>
  );
}
