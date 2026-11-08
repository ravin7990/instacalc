export function UsTriangleArticle() {
  return (
    <article className="section seo-section prose-page">
      <div className="container prose">
        <h2>Triangle Geometry Guide: Right Triangles, Heron's Formula and Construction Pitch</h2>
        <p>
          The triangle is the foundational geometric structure of civil engineering and carpentry. Unlike four-sided
          quadrilaterals that deform into parallelograms under lateral pressure, a triangle cannot change shape without
          physically altering the length of its perimeter sides. Because of this natural rigidity, triangular geometry
          governs bridge trusses, timber roof framing, aerospace bulkheads, and surveying baselines across the United States.
        </p>

        <h3>Right Triangle Trigonometry and the Pythagorean Theorem</h3>
        <p>
          A right triangle features one interior ninety-degree angle. The two perpendicular legs form the base and height, while
          the opposite side represents the hypotenuse. The geometric relationship between these three lengths follows the timeless
          Pythagorean theorem:
        </p>
        <p>
          <code>{"a² + b² = c²"}</code>
        </p>
        <p>
          Solving for the hypotenuse yields the square root of the sum of the squared legs:
        </p>
        <p>
          <code>{"c = √(a² + b²)"}</code>
        </p>
        <p>
          Right triangles also establish the foundation of classical trigonometry. For any acute angle, three primary ratios define
          side relationships:
        </p>
        <p>
          The sine ratio equals the opposite leg divided by the hypotenuse. The cosine ratio equals the adjacent leg divided by the
          hypotenuse. The tangent ratio equals the opposite leg divided by the adjacent leg. In Euclidean geometry, the interior
          angles of any flat planar triangle always total exactly 180 degrees. Therefore, in a right triangle where one angle is 90
          degrees, the two remaining acute angles are complementary, meaning they always sum to 90 degrees.
        </p>

        <h3>Area Formulas: Base and Height, Heron's SSS, and SAS</h3>
        <p>
          Depending on which measurements you have on hand, three distinct mathematical formulas calculate triangle surface area:
        </p>
        <p>
          The standard method applies when you know a horizontal base and its perpendicular altitude:
        </p>
        <p>
          <code>{"Area = ½ × Base × Height"}</code>
        </p>
        <p>
          When you know all three side lengths but lack an explicit interior height measurement, Heron's formula solves the area
          using the semi-perimeter:
        </p>
        <p>
          <code>{"Semi-perimeter (s) = (a + b + c) / 2"}</code>
        </p>
        <p>
          <code>{"Area = √[s × (s - a) × (s - b) × (s - c)]"}</code>
        </p>
        <p>
          Heron's formula is invaluable for land surveyors calculating acreage from boundary markers. Finally, when you know two
          adjacent sides and their included interior angle, the Side-Angle-Side formula calculates area without requiring
          perpendicular heights:
        </p>
        <p>
          <code>{"Area = ½ × a × b × sin(C)"}</code>
        </p>

        <h3>The 3-4-5 Rule in American Carpentry and Framing</h3>
        <p>
          On residential construction jobsites across the United States, framing carpenters, concrete contractors, and masons
          rely on the 3-4-5 rule to ensure walls and foundation footings meet at exact 90-degree right angles.
        </p>
        <p>
          The rule relies on the simplest whole-number Pythagorean triple: 3 squared (9) plus 4 squared (16) equals 5 squared
          (25). A carpenter measures 3 feet along one wall plate and marks the lumber. Next, they measure 4 feet along the
          perpendicular wall plate and make a second mark. Finally, they measure the diagonal distance between the two pencil marks.
          If the diagonal measures exactly 5 feet, the corner is perfectly square.
        </p>
        <p>
          For larger layouts like house foundations or detached garages, builders scale this ratio upward to increase measurement
          precision. Common multiples include 6-8-10 feet, 9-12-15 feet, and 12-16-20 feet. Checking diagonal cross-measurements on
          rectangular subfloors uses the identical right-triangle principle: if both diagonal measurements are identical, the entire
          building outline is square.
        </p>

        <h3>Roof Pitch Engineering and Rafter Calculations</h3>
        <p>
          American residential architecture specifies roof slopes as pitch, expressed as inches of vertical rise per 12 inches of
          horizontal run:
        </p>
        <p>
          A 4:12 pitch rises 4 inches vertically for every 12 inches of horizontal span, producing a slope angle of 18.43 degrees. A
          6:12 pitch represents the most common residential roof profile, yielding a 26.57-degree slope. An 8:12 pitch rises 8 inches
          per foot (33.69 degrees), providing rapid drainage in heavy snow climates. A 12:12 pitch creates a steep 45-degree angle
          characteristic of Cape Cod and Gothic Revival architecture.
        </p>
        <p>
          To calculate the structural rafter length, carpenters treat the roof profile as a right triangle. The horizontal run
          represents one leg, the total vertical rise represents the second leg, and the rafter body represents the hypotenuse:
        </p>
        <p>
          <code>{"Rafter Length = √(Rise² + Run²) + Overhang"}</code>
        </p>
        <p>
          Carpenters deduct half the thickness of the center ridge beam before cutting plumb angles. They also notch out the
          birdsmouth seat where the rafter rests upon the exterior bearing wall top plate. When ordering plywood sheathing or
          siding for triangular gable walls, contractors multiply the full gable width by the vertical rise and divide by two.
          They typically order a 10 to 15 percent scrap allowance to compensate for diagonal angle waste cuts.
        </p>
      </div>
    </article>
  );
}
