export function UsConcreteArticle() {
  return (
    <article className="section seo-section prose-page">
      <div className="container prose">
        <h2>Estimating Concrete Volume in the US: Slabs, Footings, Cubic Yards & Premix Bags</h2>
        <p>
          Accurately calculating concrete volume is one of the most critical steps in residential and commercial construction
          projects across the United States. Under-ordering results in cold joints, project delays, and costly emergency short-load
          delivery fees, while over-ordering wastes money on unused mixed material that cannot be easily returned.
        </p>

        <h3>The Cubic Yard Formula for Slabs, Patios & Driveways</h3>
        <p>
          In the US construction industry, concrete is universally measured and ordered in <strong>cubic yards</strong> (commonly
          referred to on job sites simply as "yards"). One cubic yard equals 27 cubic feet (a cube measuring 3 feet wide,
          3 feet long, and 3 feet deep).
        </p>
        <p>
          To calculate the volume of concrete required for a rectangular slab, patio, garage floor, or footing, use the standard formula:
        </p>
        <p>
          <code>Cubic Yards = [Length (ft) × Width (ft) × Thickness (ft)] / 27</code>
        </p>
        <p>
          Because slab thickness is almost always specified in inches (such as 4 inches for sidewalks or 6 inches for heavy-duty driveways),
          you must convert inches to feet by dividing by 12:
        </p>
        <ul>
          <li>4-inch thickness = <code>4 / 12 = 0.333 feet</code></li>
          <li>6-inch thickness = <code>6 / 12 = 0.500 feet</code></li>
          <li>8-inch thickness = <code>8 / 12 = 0.667 feet</code></li>
        </ul>
        <p>
          For example, pouring a 20-foot by 24-foot garage slab at 4 inches thick:
          <code> Volume = (20 × 24 × 0.333) / 27 = 5.92 cubic yards</code>.
        </p>

        <h3>Calculating Circular Columns & Sonotube Footings</h3>
        <p>
          For cylindrical deck footings, fence post piers, and structural columns using cardboard Sonotubes, use the cylinder volume formula:
        </p>
        <p>
          <code>Cubic Yards = [π × Radius² (ft) × Depth (ft)] / 27</code>
        </p>
        <p>
          For a 12-inch diameter Sonotube (0.5-foot radius) drilled to a frost line depth of 4 feet (48 inches):
          <code> Volume = (3.14159 × 0.5² × 4) / 27 = 0.116 cubic yards per footing</code>.
        </p>

        <h3>Premixed Bags vs. Ready-Mix Truck Deliveries</h3>
        <p>
          For small DIY home improvement projects, dry bagged concrete mixes (such as Quikrete or Sakrete) are purchased at home centers:
        </p>
        <ul>
          <li><strong>80-Pound Bag:</strong> Yields approximately <strong>0.60 cubic feet</strong> of wet concrete. It takes <strong>45 bags (80 lb)</strong> to produce 1 cubic yard.</li>
          <li><strong>60-Pound Bag:</strong> Yields approximately <strong>0.45 cubic feet</strong>. It takes <strong>60 bags (60 lb)</strong> to yield 1 cubic yard.</li>
          <li><strong>50-Pound Fast-Setting Bag:</strong> Yields approximately <strong>0.375 cubic feet</strong>, ideal for setting mailbox and fence posts without mixing.</li>
        </ul>
        <p>
          For pours exceeding 1 to 2 cubic yards (more than 45 to 90 heavy bags), ordering bulk <strong>ready-mix concrete</strong>
          delivered by a transit mixer truck is vastly more economical and structurally uniform. Standard US concrete trucks carry between
          8 and 10 cubic yards per truckload. Suppliers typically assess a "short-load fee" for deliveries under 4 to 5 cubic yards.
        </p>

        <h3>The Essential 10% Waste & Overage Buffer</h3>
        <p>
          Professional concrete contractors always add a <strong>10% margin of safety (overage)</strong> to all theoretical volume
          estimates (or 15% for rough-excavated footings). This buffer accommodates subgrade settling, uneven dirt excavation depth,
          formwork deflection under heavy hydraulic pressure, and spillage during the pour. For stamped, stained, or fiber-reinforced
          decorative concrete installations, ordering adequate surplus volume prevents cold joints and preserves structural durability.
        </p>
      </div>
    </article>
  );
}
