export function InTrigonometryArticle() {
  return (
    <article className="section seo-section prose-page">
      <div className="container prose">
        <h2>Trigonometry Calculator Guide: Right Triangles, Sin-Cos-Tan & Engineering Applications</h2>
        <p>
          Trigonometry—derived from the ancient Greek words for “triangle” and “measure”—is the branch of mathematics that explores relationships between the side lengths and internal angles of triangles. From civil surveying and structural engineering across India's infrastructure projects to satellite navigation, robotics, and architectural roof design, trigonometry provides the mathematical formulas required to calculate inaccessible distances and angles.
        </p>

        <h3>Core Ratios in a Right-Angled Triangle: SOH-CAH-TOA</h3>
        <p>
          In a right-angled triangle (where one angle equals exactly 90°), the sides relative to an acute reference angle θ are named:
        </p>
        <ul>
          <li><strong>Hypotenuse:</strong> The longest side, situated directly opposite the 90-degree right angle.</li>
          <li><strong>Opposite Side:</strong> The side directly opposite the reference angle θ.</li>
          <li><strong>Adjacent Side:</strong> The non-hypotenuse side forming the reference angle θ.</li>
        </ul>
        <p>
          The fundamental ratios are memorized via the classic mnemonic <strong>SOH-CAH-TOA</strong>:
        </p>
        <ul>
          <li><strong>Sine (sin θ):</strong> Opposite / Hypotenuse (SOH)</li>
          <li><strong>Cosine (cos θ):</strong> Adjacent / Hypotenuse (CAH)</li>
          <li><strong>Tangent (tan θ):</strong> Opposite / Adjacent (TOA)</li>
        </ul>

        <h3>Reciprocal and Inverse Trigonometric Functions</h3>
        <p>
          Complementing the primary three ratios are three reciprocal functions:
        </p>
        <ul>
          <li><strong>Cosecant (csc θ):</strong> 1 / sin θ = Hypotenuse / Opposite</li>
          <li><strong>Secant (sec θ):</strong> 1 / cos θ = Hypotenuse / Adjacent</li>
          <li><strong>Cotangent (cot θ):</strong> 1 / tan θ = Adjacent / Opposite</li>
        </ul>
        <p>
          While standard trig functions take an angle and output a dimensionless side ratio, <strong>inverse functions</strong> (arcsin or sin−¹, arccos or cos−¹, arctan or tan−¹) perform the reverse operation: taking a ratio of two known sides and computing the unknown angle θ.
        </p>

        <h3>Key Trigonometric Values for Common Angles</h3>
        <div className="table-scroll">
          <table className="projection-table">
            <thead>
              <tr>
                <th>Angle (θ)</th>
                <th>Radians</th>
                <th>sin θ</th>
                <th>cos θ</th>
                <th>tan θ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>0°</td>
                <td>0</td>
                <td>0</td>
                <td>1</td>
                <td>0</td>
              </tr>
              <tr>
                <td>30°</td>
                <td>π / 6</td>
                <td>1/2 (0.500)</td>
                <td>√3/2 (≈0.866)</td>
                <td>1/√3 (≈0.577)</td>
              </tr>
              <tr>
                <td>45°</td>
                <td>π / 4</td>
                <td>1/√2 (≈0.707)</td>
                <td>1/√2 (≈0.707)</td>
                <td>1.000</td>
              </tr>
              <tr>
                <td>60°</td>
                <td>π / 3</td>
                <td>√3/2 (≈0.866)</td>
                <td>1/2 (0.500)</td>
                <td>√3 (≈1.732)</td>
              </tr>
              <tr>
                <td>90°</td>
                <td>π / 2</td>
                <td>1</td>
                <td>0</td>
                <td>Undefined</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Degrees vs. Radians: The Conversion Rule</h3>
        <p>
          While civil engineering drawings and school textbooks primarily use degrees (°), higher calculus and computer algorithms require radians:
        </p>
        <ul>
          <li><code>Radians = Degrees × (π / 180)</code></li>
          <li><code>Degrees = Radians × (180 / π)</code></li>
          <li>1 full circle = 360° = 2π radians ≈ 6.283185 radians. 1 radian ≈ 57.2958°.</li>
        </ul>

        <h3>Real-World Civil Surveying Example: Measuring Inaccessible Heights</h3>
        <p>
          In surveying, civil engineers calculate the height of a transmission tower, building, or hill without physically climbing it by measuring the ground baseline distance and the angle of elevation using a theodolite or clinometer:
        </p>
        <p>
          <code>Height = Baseline Distance × tan(Angle of Elevation) + Instrument Height</code>
        </p>
        <p>
          <em>Example:</em> A surveyor stands 50 meters away from the base of a cellular telecom tower. Using a total station resting 1.5 meters above the ground, the angle of elevation to the top of the tower is measured as 42°:
        </p>
        <ul>
          <li>tan(42°) ≈ 0.9004</li>
          <li>Opposite height = 50 × 0.9004 = 45.02 meters</li>
          <li>Total Tower Height = 45.02 + 1.50 = <strong>46.52 meters</strong>.</li>
        </ul>
      </div>
    </article>
  );
}
