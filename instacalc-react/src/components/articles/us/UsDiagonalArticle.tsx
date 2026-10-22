export function UsDiagonalArticle() {
  return (
    <article className="section seo-section prose-page">
      <div className="container prose">
        <h2>Calculating Diagonals: The Pythagorean Theorem, 3D Space & US Carpentry</h2>
        <p>
          A diagonal is a straight line segment joining two non-adjacent vertices of a polygon or polyhedron. In geometry,
          engineering, construction framing, and consumer electronics in the United States, calculating precise diagonal lengths
          is essential for squaring foundations, verifying rectangular formwork, and determining the physical dimensions of
          television screens, computer displays, and shipping containers.
        </p>

        <h3>2D Diagonal Formula: Rectangles & Squares</h3>
        <p>
          The mathematical basis for calculating the diagonal of any two-dimensional rectangle or square is the classic
          <strong>Pythagorean Theorem</strong>. In a rectangle with width <em>w</em> and height <em>h</em>, the diagonal forms the
          hypotenuse of two congruent right-angled triangles:
        </p>
        <p>
          <code>Diagonal (d) = √(Width² + Height²)</code>
        </p>
        <p>
          For a perfect square where both sides are equal (<em>s</em>):
          <code> d = √(s² + s²) = √(2s²) = s × √2 ≈ s × 1.41421</code>.
        </p>
        <p>
          For example, a standard 8-foot by 10-foot rectangular shed floor has a diagonal of:
          <code> d = √(8² + 10²) = √(64 + 100) = √164 ≈ 12.806 feet (12 feet 9¾ inches)</code>.
        </p>

        <h3>3D Space Diagonal: Rectangular Prisms & Shipping Boxes</h3>
        <p>
          To find the maximum straight-line distance spanning from one bottom corner of a three-dimensional box or room to the
          opposite top corner, extend the Pythagorean formula across three orthogonal spatial dimensions:
        </p>
        <p>
          <code>3D Space Diagonal (D) = √(Length² + Width² + Height²)</code>
        </p>
        <p>
          This formula is used by logistics carriers (FedEx, UPS, USPS) and movers to determine whether oversized objects—such as
          pipes, fishing rods, or lumber—will physically fit inside a cargo van, standard shipping box, or freight container.
        </p>

        <h3>The 3-4-5 Squaring Rule in US Carpentry & Masonry</h3>
        <p>
          In residential construction throughout the United States, framing carpenters, deck builders, and foundation contractors
          universally rely on the <strong>3-4-5 rule</strong> (the smallest integer Pythagorean triple: <code>3² + 4² = 5²</code>)
          to verify that two intersecting walls or forms meet at a perfect 90-degree right angle:
        </p>
        <ul>
          <li>Measure exactly <strong>3 feet</strong> along one wall from the corner and mark the point.</li>
          <li>Measure exactly <strong>4 feet</strong> along the adjoining wall from the corner and mark the point.</li>
          <li>Measure the diagonal cross-distance between the two marks. If the diagonal measures exactly <strong>5 feet</strong>, the corner is perfectly square.</li>
        </ul>
        <p>
          For large building foundations and decks, carpenters scale up the 3-4-5 triple to improve accuracy over long spans:
          <strong>6-8-10</strong>, <strong>9-12-15</strong>, or <strong>12-16-20</strong> feet.
        </p>

        <h3>Television & Display Screen Dimensions (16:9 Aspect Ratio)</h3>
        <p>
          Under Federal Trade Commission (FTC) guidelines, television and computer monitor screen sizes marketed in the United States
          must be advertised by their <strong>viewable diagonal screen size in inches</strong>. Modern widescreen displays adhere to
          a standardized <strong>16:9 aspect ratio</strong> (16 units of width for every 9 units of height):
        </p>
        <ul>
          <li><code>Width = Diagonal × 0.8716</code></li>
          <li><code>Height = Diagonal × 0.4903</code></li>
          <li><code>Screen Area = Diagonal² × 0.4273</code></li>
        </ul>
        <p>
          For a popular 65-inch television, the actual screen width is <code>65 × 0.8716 = 56.65 inches</code>, with a height of
          <code>65 × 0.4903 = 31.87 inches</code>, providing 1,805.5 square inches of viewable surface area.
        </p>
        <p>
          Calculating diagonal dimensions accurately is essential when planning media console widths, wall-mount stud spacing, and ADA-compliant clearance
          pathways in home entertainment rooms, ensuring that oversized screens do not overhang furniture boundaries or collide with adjacent architectural trim.
        </p>
      </div>
    </article>
  );
}
