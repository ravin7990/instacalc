export function InConcreteArticle() {
  return (
    <article className="section seo-section prose-page">
      <div className="container prose">
        <h2>Concrete Calculator Guide: Mix Design, 50kg Bags, IS 456 Standards & Material Estimation in India</h2>
        <p>
          Estimating concrete requirements accurately is one of the most critical steps in any residential or commercial civil construction project in India. Ordering insufficient material leads to cold joints and weak structural pours, while over-ordering results in expensive wastage of perishable ready-mix concrete and cement. Governed by <strong>Bureau of Indian Standards (BIS) code IS 456:2000</strong> (“Plain and Reinforced Concrete — Code of Practice”), civil engineers and contractors rely on precise volumetric calculations to budget cement, fine aggregate (river sand or M-sand), and coarse aggregate (crushed blue metal stone).
        </p>

        <h3>The 1.54 Dry Volume Factor Explained</h3>
        <p>
          The most common rookie mistake in civil estimation is equating wet finished concrete volume directly with dry raw materials. In reality, dry cement, sand, and aggregate particles contain substantial void spaces (typically 30% to 35% in sand and 40% to 45% in gravel). When mixed with water, fine cement paste lubricates and fills the microscopic air voids between the aggregates, causing the overall bulk volume to shrink:
        </p>
        <p>
          <code>Dry Mix Volume = Wet Compacted Volume × 1.54</code>
        </p>
        <p>
          Civil engineers use the standardized multiplier of <strong>1.54</strong> (or 1.52 to 1.57 depending on aggregate grading). Therefore, if you require <strong>10 m³ of wet poured slab concrete</strong>, you must order and mix approximately <strong>15.4 m³ of dry materials</strong>.
        </p>

        <h3>Standard Concrete Grades & Mix Ratios under IS 456</h3>
        <p>
          Nominal mixes prescribe the volumetric proportions of <strong>Cement : Fine Aggregate (Sand) : Coarse Aggregate (Gravel)</strong>:
        </p>
        <ul>
          <li><strong>M15 Grade (1 : 2 : 4):</strong> Characteristic compressive strength of 15 N/mm² at 28 days. Used for Plain Cement Concrete (PCC), foundation leveling courses, boundary walls, and footpath sub-bases.</li>
          <li><strong>M20 Grade (1 : 1.5 : 3):</strong> Characteristic compressive strength of 20 N/mm². The standard, minimum prescribed grade under IS 456 for Reinforced Cement Concrete (RCC) structures in moderate exposure, widely used for residential slabs, beams, staircases, and lintels.</li>
          <li><strong>M25 Grade (1 : 1 : 2):</strong> Characteristic compressive strength of 25 N/mm². High-strength concrete used for heavily loaded structural columns, underground water tanks, retaining walls, and footings.</li>
        </ul>

        <h3>Step-by-Step Material Calculation for 1 m³ of M20 Concrete</h3>
        <p>
          Let us calculate the raw materials needed for 1 m³ of M20 (1 : 1.5 : 3) concrete:
        </p>
        <ol>
          <li><strong>Total Ratio Parts:</strong> 1 + 1.5 + 3 = 5.5 parts.</li>
          <li><strong>Dry Volume Required:</strong> 1 m³ × 1.54 = 1.54 m³.</li>
          <li><strong>Cement Required:</strong> (1 / 5.5) × 1.54 = 0.28 m³.
            <ul>
              <li>Density of cement = 1,440 kg/m³. Weight = 0.28 × 1,440 = <strong>403.2 kg</strong>.</li>
              <li>In India, standard commercial cement bags (UltraTech, ACC, Ambuja, Dalmia) weigh <strong>50 kg</strong> each (volume = 0.0347 m³ or 1.25 cubic feet).</li>
              <li>Number of bags = 403.2 / 50 = <strong>8.06 ≈ 8.2 bags</strong> per cubic meter.</li>
            </ul>
          </li>
          <li><strong>Sand Required:</strong> (1.5 / 5.5) × 1.54 = <strong>0.42 m³</strong> (approximately 14.83 cubic feet).</li>
          <li><strong>Coarse Aggregate Required:</strong> (3 / 5.5) × 1.54 = <strong>0.84 m³</strong> (approximately 29.66 cubic feet).</li>
        </ol>

        <h3>Indian Construction Unit: Understanding the “Brass”</h3>
        <p>
          In states across India (especially Maharashtra, Gujarat, Karnataka, and Madhya Pradesh), bulk building materials like sand, metal aggregate, and rubble are sold in units called <strong>Brass</strong>:
        </p>
        <p>
          <code>1 Brass = 100 Cubic Feet (cft) = 2.8317 Cubic Meters (m³)</code>
        </p>
        <p>
          A standard 10-wheel tipper truck carrying 10 m³ of sand is delivering approximately 3.53 brass of material.
        </p>

        <h3>Water-Cement Ratio and 28-Day Curing Rules</h3>
        <p>
          Workability must never be achieved by adding excess water:
        </p>
        <ul>
          <li><strong>Water-Cement Ratio:</strong> Maintain a water-to-cement ratio by weight between <strong>0.45 and 0.50</strong> (roughly 23 to 25 liters of water per 50 kg cement bag). Adding excess water drastically dilutes compressive strength, creates shrinkage cracks, and causes honeycombing.</li>
          <li><strong>28-Day Curing:</strong> Hydration is an ongoing chemical reaction. Concrete should be kept continuously wet via ponding (on slabs) or wet hessian cloth wraps (on columns) for at least 7 to 14 days. Concrete reaches ~65% of its design strength at 7 days, ~90% at 14 days, and full 100% characteristic compressive strength at 28 days.</li>
        </ul>
      </div>
    </article>
  );
}
