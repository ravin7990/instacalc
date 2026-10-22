export function UsTriangleArticle() {
  return (
    <article className="section seo-section prose-page">
      <div className="container prose">
        <h2>Triangle Geometry in the US: Trigonometry, Area Formulas & Roof Pitch Engineering</h2>
        <p>
          The triangle is the most rigid, stable polygon in Euclidean geometry. Because a triangle cannot be deformed without
          physically altering the length of one of its sides, triangular geometry serves as the foundational structural element
          in architectural trusses, suspension bridges, aerospace airframes, and timber framing across the United States.
        </p>

        <h3>Right Triangle Trigonometry & The Pythagorean Theorem</h3>
        <p>
          A right-angled triangle contains one interior 90-degree angle. The longest side opposite this right angle is the
          <strong>hypotenuse (c)</strong>, while the two perpendicular sides form the base (<em>a</em>) and altitude or height (<em>b</em>).
          The side lengths are governed by the <strong>Pythagorean Theorem</strong>:
        </p>
        <p>
          <code>a² + b² = c² ⇒ c = √(a² + b²)</code>
        </p>
        <p>
          For acute interior angle θ, the three fundamental trigonometric ratios are:
        </p>
        <ul>
          <li><code>Sine: sin(θ) = Opposite / Hypotenuse = b / c</code></li>
          <li><code>Cosine: cos(θ) = Adjacent / Hypotenuse = a / c</code></li>
          <li><code>Tangent: tan(θ) = Opposite / Adjacent = b / a</code></li>
        </ul>
        <p>
          The interior angles of any planar triangle on a Euclidean plane always sum to exactly <strong>180 degrees</strong> (π radians).
          In a right triangle where one angle is 90°, the two remaining acute angles are complementary: <code>α + β = 90°</code>.
        </p>

        <h3>Calculating Triangle Area: Base/Height, Heron's & SAS</h3>
        <p>
          Depending on the known parameters of the triangle, three primary formulas calculate its surface area:
        </p>
        <ul>
          <li><strong>Standard Base and Height Formula:</strong>
            <code> Area = ½ × Base × Height = (b × h) / 2</code>.
          </li>
          <li><strong>Heron's Formula (Three Known Sides - SSS):</strong> When all three side lengths (<em>a</em>, <em>b</em>, <em>c</em>) are known without an explicit height measurement:
            <br />
            <code>Semi-perimeter (s) = (a + b + c) / 2</code>
            <br />
            <code>Area = √[s × (s - a) × (s - b) × (s - c)]</code>
          </li>
          <li><strong>Side-Angle-Side (SAS Formula):</strong> When two sides and the included interior angle (<em>C</em>) are known:
            <br />
            <code>Area = ½ × a × b × sin(C)</code>
          </li>
        </ul>

        <h3>US Construction Application: Roof Pitch & Rafter Lengths</h3>
        <p>
          In American residential and commercial construction, roof slopes are specified as <strong>pitch</strong>—expressed as the
          number of inches of vertical rise per <strong>12 inches of horizontal run</strong>:
        </p>
        <ul>
          <li><strong>4:12 Pitch (Low Slope):</strong> 4 inches of rise per 12 inches of run (θ ≈ 18.43°). Standard for ranch-style homes.</li>
          <li><strong>6:12 Pitch (Medium Slope):</strong> 6 inches of rise per 12 inches of run (θ ≈ 26.57°). Standard residential roof slope.</li>
          <li><strong>8:12 Pitch (Steep Slope):</strong> 8 inches of rise per 12 inches of run (θ ≈ 33.69°). Common in heavy snow regions for rapid shed.</li>
          <li><strong>12:12 Pitch (45-Degree Angle):</strong> 12 inches of rise per 12 inches of run (θ = 45.00°). Found on Cape Cod and A-frame architecture.</li>
        </ul>
        <p>
          Framing carpenters use right triangle geometry to calculate the exact <strong>rafter length</strong>:
          <code> Rafter Length = √[Rise² + Run²] + Overhang</code>. Knowing the precise hypotenuse ensures accurate lumber
          ordering, exact plumb cuts at the ridge board, and tight birdsmouth cuts where rafters rest on exterior bearing walls.
        </p>
        <p>
          Additionally, calculating triangular gable wall area allows siding and roofing contractors to order exact quantities of plywood sheathing,
          underlayment felt, and vinyl or fiber-cement siding squares, adding standard 10% scrap allowances to cover diagonal angled waste cuts.
        </p>
      </div>
    </article>
  );
}
