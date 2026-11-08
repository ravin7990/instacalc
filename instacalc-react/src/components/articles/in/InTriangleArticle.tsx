export function InTriangleArticle() {
  return (
    <article className="section seo-section prose-page">
      <div className="container prose">
        <h2>Triangle Calculator: Practical Workshop Geometry, Right Angles & Oblique Solvers</h2>
        <p>
          Measuring triangles on paper is simple. You draw three neat lines, write down a few degrees, and calculate the answer with a pocket scientific calculator.
        </p>
        <p>
          On an actual job site, paper math falls apart fast.
        </p>
        <p>
          Try holding a plastic protractor against a six-meter steel beam in the middle of a windy afternoon. You will get two degrees of play. Over that span, two degrees throws your cut off by more than two hundred millimeters. That is why carpenters, sheet metal fabricators, machinists, and civil engineers avoid measuring raw angles whenever they can. They measure straight lines instead. Triangles don{"'"}t lie.
        </p>
        <p>
          This calculator handles both worlds. If you have clean angles and side lengths from an architectural drawing, you can punch them in under the standard trigonometric modes (SSS, SAS, ASA). If you are standing on a concrete floor with a chalk line and a steel tape measure, you can use datum measurements (height, base span, and horizontal offset) to nail the exact shape without guessing.
        </p>

        <h3>1. Right-Angled Triangles: The Backbone of Framing and Machining</h3>
        <p>
          Every corner of a house, machine chassis, or rectangular duct starts as a right triangle. One angle is fixed at exactly ninety degrees. That fixed corner simplifies everything.
        </p>
        <p>
          You only need two known numbers to lock down the entire shape. If you enter two perpendicular legs (A and B), the hypotenuse is <code>C = √(A² + B²)</code>. Your acute angles come from standard inverse tangents: <code>Y = arctan(A / B)</code> and <code>Z = 90° - Y</code>. When you start with one leg and the hypotenuse, your missing leg is <code>A = √(C² - B²)</code>. And if you know one leg plus an acute angle, the hypotenuse is <code>C = A / sin(Y)</code>, while the adjacent leg is <code>B = A / tan(Y)</code>.
        </p>
        <p>
          You do not need a calculator to check if two walls meet at ninety degrees on site. Builders across India and worldwide use the 3-4-5 rule daily. It is the smallest integer Pythagorean triple where three squared plus four squared equals five squared.
        </p>
        <p>
          Mark three feet (or three meters) along your baseline wall. Next, mark four feet along the perpendicular partition. Measure the diagonal distance between your two pencil marks with your tape. If that diagonal is five feet on the dot, your corner is square.
        </p>
        <p>
          When the tape reads less than five feet, your corner is acute and choked under ninety degrees. When it reads more, the corner is kicked out past ninety degrees. You can scale the numbers up for bigger layouts: 6-8-10, 9-12-15, or 12-16-20.
        </p>

        <h3>2. Isosceles Triangles: Rafter Peaks, Gables, and Symmetrical Brackets</h3>
        <p>
          An isosceles triangle has two sides of identical length and two matching base angles. You see them on A-frame roof trusses, gables, church steeples, and symmetrical shelf brackets.
        </p>
        <p>
          Because the shape is mirrored down the center, you can drop a vertical line from the peak straight to the base. That altitude line splits the shape into two back-to-back right triangles.
        </p>
        <p>
          Each half-base measures <code>C / 2</code>. Both equal slanted legs equal <code>√((C / 2)² + H²)</code>. Base angles equal <code>arctan((2 × H) / C)</code>, while the apex angle at the top is <code>180° - 2 × base angle</code>. Total surface area is simply half the base multiplied by the height (<code>0.5 × C × H</code>).
        </p>
        <p>
          Take roof framing. Say you have a shed span of four meters (<em>C</em> = 4.0 m) and want a central ridge rise of one and a half meters (<em>H</em> = 1.5 m). Each half-span is two meters. The rafter length from eave to ridge is <code>√(2.0² + 1.5²) = √(4 + 2.25) = √6.25 = 2.50 meters</code>. Your saw bevel for the top plumb cut is <code>arctan(2.0 / 1.5) ≈ 53.13°</code> from horizontal, or <code>36.87°</code> off vertical. No protractor needed.
        </p>

        <h3>3. Scalene and Obtuse Triangles: Why the Datum (H-C-W) Method Wins</h3>
        <p>
          A scalene triangle has three different sides and three different angles. An obtuse triangle has one wide interior angle greater than ninety degrees.
        </p>
        <p>
          Most online tools force you to measure the angles with a protractor first. That works in high school geometry homework. It fails in a structural welding bay.
        </p>
        <p>
          Instead of measuring angles across rough plate steel, take three tape measurements. First, measure the baseline (<em>C</em>), which is the horizontal distance between both bottom corners. Second, measure the perpendicular height (<em>H</em>) dropped from the peak down to the horizontal baseline. Third, measure the horizontal offset or overhang (<em>W</em>), which tracks where the peak sits relative to the left corner.
        </p>
        <p>
          In an acute scalene triangle, the peak sits between both corners, so <em>W</em> falls between zero and <em>C</em>. The left slanted side equals <code>√(W² + H²)</code>. The right slanted side equals <code>√((C - W)² + H²)</code>. Left and right base angles derive from <code>arctan(H / W)</code> and <code>arctan(H / (C - W))</code>.
        </p>
        <p>
          In an obtuse triangle, the peak overhangs outside the base footprint. Because that vertical altitude drops straight into empty air, <em>W</em> extends past the obtuse corner. That makes your long top edge <code>√((W + C)² + H²)</code>. Meanwhile, the short left leg equals <code>√(W² + H²)</code>, and your obtuse interior corner is <code>180° - arctan(H / W)</code>.
        </p>
        <p>
          Cavalieri{"'"}s principle confirms that the area is always <code>0.5 × C × H</code>. The horizontal overhang <em>W</em> leans the triangle over, but it never alters the internal area by a single square millimeter.
        </p>

        <h3>4. General Triangles: Solving SSS, SAS, and ASA</h3>
        <p>
          When working from a technical drawing or a surveyor land plot, you might not have datum coordinates. You might only have boundary lengths or boundary bearings.
        </p>
        <p>
          Under SSS (three known sides), first check the triangle inequality rule. The sum of any two sides must strictly exceed the third side. If someone hands you lengths of 5, 8, and 15, you cannot build that triangle. Five plus eight equals thirteen, which cannot bridge a gap of fifteen.
        </p>
        <p>
          When the sides are valid, the tool uses Heron{"'"}s formula for area. Calculate semi-perimeter <code>s = (a + b + c) / 2</code>, then find <code>Area = √(s(s - a)(s - b)(s - c))</code>. Internal angles follow directly from the Law of Cosines: <code>cos(C) = (a² + b² - c²) / (2ab)</code>.
        </p>
        <p>
          For SAS (two sides and the included angle), calculate the missing third side with the Law of Cosines: <code>c = √(a² + b² - 2ab × cos(C))</code>. Once side <em>c</em> is locked down, use the Law of Sines to find the remaining angles.
        </p>
        <p>
          For ASA (two angles and one side), the calculation is straightforward. The third angle is always <code>180° - A - B</code>. From there, the Law of Sines gives both missing sides in one step: <code>a / sin(A) = b / sin(B) = c / sin(C)</code>.
        </p>

        <h3>5. Right Trapezoids and Taper Wedges: Ductwork, Hoppers, and Lathe Turning</h3>
        <p>
          Not every angled cut forms a pointed triangle. In sheet metal fabrication, ventilation ducts often taper down from a large air handler to a smaller branch line. Machinists turn conical tapers on a lathe. Civil engineers design battered concrete retaining walls.
        </p>
        <p>
          These shapes are right-angled trapezoids. You can think of them as a right triangle sitting on top of a flat rectangle.
        </p>
        <p>
          Your inputs are vertical height (<em>H</em>), top flat base (<em>a</em>), and bottom flat base (<em>b</em>). The base difference is <code>Δ = |b - a|</code>. The slanted side equals <code>√(Δ² + H²)</code>. Your taper angle is <code>arctan(Δ / H)</code>. Cross-sectional area is <code>0.5 × (a + b) × H</code>, and the total perimeter is <code>H + a + b + Slant</code>.
        </p>
        <p>
          Consider an air duct transition with a top width of 250 mm, a bottom width of 400 mm, and a length of 500 mm. The horizontal offset is <code>400 - 250 = 150 mm</code>. The diagonal sheet cut length is <code>√(150² + 500²) = √(22500 + 250000) = √272500 ≈ 522.02 mm</code>. That gives your sheet metal shear operator the exact line to cut without wasted sheet stock.
        </p>

        <h3>6. Practical Field Advice and Common Traps</h3>
        <p>
          Geometry looks foolproof until you pick up real materials. Keep these hard-learned rules in mind.
        </p>
        <p>
          Do not round intermediate numbers. When calculating angles from trigonometric ratios, keep at least four decimal places in your intermediate steps. Rounding an angle to the nearest whole degree early can shift a roof rafter tail by ten to fifteen millimeters on long spans.
        </p>
        <p>
          Beware the ambiguous SSA case. If you only have two sides and an angle that is not between them (Side-Side-Angle), two completely different triangles can often share those exact measurements. Use SSS, SAS, or H-C-W modes to guarantee a unique, deterministic result.
        </p>
        <p>
          Keep your units aligned. Mixing millimeters with centimeters on a quick notepad sketch is the number one cause of scrapped raw materials in workshops. Use our built-in unit switcher (cm, m, mm, inch, ft, yard) to convert your numbers before cutting.
        </p>
        <p>
          Clear single fields quickly. If you make a typing slip on a single number, click the small circular (✕) clear icon inside that input box to wipe just that value instead of clearing your entire calculation.
        </p>
      </div>
    </article>
  );
}

export const InObtuseTriangleArticle = InTriangleArticle;
