export function InDiagonalArticle() {
  return (
    <article className="section seo-section prose-page">
      <div className="container prose">
        <h2>Diagonal Calculator Guide: Pythagorean Theorem, 3-4-5 Rule & Construction Squareness</h2>
        <p>
          Calculating diagonals accurately is an indispensable geometrical skill across architecture, carpentry, civil engineering, interior design, and package shipping. Whether you are laying out the foundation lines for a new residential building, verifying that a doorway or window frame is square, or ensuring that a large piece of furniture will fit inside a room, understanding diagonal relationships eliminates distortion and costly structural defects.
        </p>

        <h3>The Pythagorean Theorem: The Mathematical Foundation</h3>
        <p>
          For any two-dimensional rectangle or right-angled triangle, the diagonal represents the hypotenuse connecting two non-adjacent opposite vertices. It is calculated using the timeless Pythagorean theorem:
        </p>
        <p>
          <code>d = √(Length² + Width²)</code>
        </p>
        <p>
          <em>Example:</em> A standard room measuring 4 meters in length by 3 meters in width has a diagonal of:
        </p>
        <p>
          <code>d = √(4² + 3²) = √(16 + 9) = √25 = 5.00 meters</code>
        </p>

        <h3>The 3-4-5 Rule in Indian Civil Construction and Masonry</h3>
        <p>
          On real-world building sites where laser levels and surveying total stations may not be immediately available, Indian civil masons and site supervisors rely on the practical <strong>3-4-5 rule</strong> to establish perfect 90-degree right angles:
        </p>
        <ul>
          <li>Measure <strong>3 units</strong> (meters or feet) along your established baseline wall and make a pencil or chalk mark.</li>
          <li>Measure <strong>4 units</strong> along the perpendicular wall or string line and make a mark.</li>
          <li>Measure the diagonal distance directly between the two marks. If the diagonal measures exactly <strong>5 units</strong>, the corner is a perfect 90-degree right angle (square).</li>
          <li>If the diagonal is less than 5 units, the angle is acute ({"<"} 90°); if it exceeds 5 units, the angle is obtuse ({">"} 90°).</li>
          <li>This principle scales identically to any Pythagorean triple: 6-8-10, 9-12-15, or 12-16-20.</li>
        </ul>

        <h3>Cross-Measuring Diagonals: The Squareness Test</h3>
        <p>
          In any four-sided quadrilateral with parallel opposite sides (a parallelogram), the shape is a true rectangle if and only if both opposite corner-to-corner diagonals are identical in length:
        </p>
        <ul>
          <li><strong>Tile Flooring:</strong> Before laying expensive vitrified or marble floor tiles, masons measure the two room diagonals (Corner A to Corner C, and Corner B to Corner D). If the diagonals differ by more than 5 mm to 10 mm, the room is out-of-square. Correcting reference guidelines prevents narrow, wedge-shaped tile cuts along the skirting boards.</li>
          <li><strong>Door and Window Frames:</strong> Measuring diagonals of pre-hung timber or aluminum door frames ensures they will not jam or bind against hinges during seasonal expansion.</li>
        </ul>

        <h3>Special Case: Diagonal of a Square</h3>
        <p>
          For a square where length equals width (side = <em>s</em>), the formula simplifies to:
        </p>
        <p>
          <code>d = s × √2 ≈ s × 1.41421356</code>
        </p>
        <p>
          A square tile measuring 60 cm by 60 cm has a diagonal of 60 × 1.4142 ≈ 84.85 cm.
        </p>

        <h3>Space Diagonal: Finding the Longest Item in a 3D Box or Room</h3>
        <p>
          When transporting pipes, ladders, curtain rods, or furniture inside a room, shipping container, or truck bed, the maximum linear clearance is dictated by the three-dimensional <strong>space diagonal (cuboid diagonal)</strong>:
        </p>
        <p>
          <code>d = √(Length² + Width² + Height²)</code>
        </p>
        <p>
          <em>Example:</em> In a room measuring 5 meters long, 4 meters wide, and 3 meters high, the longest rod that can fit from a bottom corner to the opposite top corner is:
        </p>
        <p>
          <code>d = √(5² + 4² + 3²) = √(25 + 16 + 9) = √50 ≈ 7.07 meters</code>
        </p>

        <h3>Screen Diagonals: Televisions, Laptops & Smartphones</h3>
        <p>
          When purchasing display electronics, the advertised screen size (e.g. 55-inch TV or 15.6-inch laptop) refers strictly to the active diagonal viewing area, excluding the bezel:
        </p>
        <ul>
          <li>For modern widescreen displays with a <strong>16:9 aspect ratio</strong>:
            <br /><code>Width ≈ Diagonal × 0.8716</code><br />
            <code>Height ≈ Diagonal × 0.4903</code>
          </li>
          <li>A 55-inch 16:9 television panel has an active display width of ~47.9 inches and a display height of ~27.0 inches.</li>
        </ul>
      </div>
    </article>
  );
}
