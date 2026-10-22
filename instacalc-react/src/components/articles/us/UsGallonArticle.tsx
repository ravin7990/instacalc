export function UsGallonArticle() {
  return (
    <article className="section seo-section prose-page">
      <div className="container prose">
        <h2>US Liquid Gallons, Imperial Gallons & Liters: Conversions & Standards</h2>
        <p>
          Converting between gallons and liters is one of the most frequent volumetric calculations encountered in trade,
          international travel, automotive engineering, and recipe scaling. Because the United States remains on the US Customary
          measurement system while the rest of the world utilizes the International System of Units (metric liters), precision in
          conversion factors is essential to prevent costly liquid measurement errors.
        </p>

        <h3>Defining the US Liquid Gallon Under NIST Standards</h3>
        <p>
          In the United States, liquid volume standards are codified by the National Institute of Standards and Technology (NIST).
          Under statutory definition dating back to Queen Anne's wine gallon of 1707, one <strong>US liquid gallon</strong> is defined
          as exactly <strong>231 cubic inches</strong>, which equals:
        </p>
        <p>
          <code>1 US Liquid Gallon = 3.785411784 Liters ≈ 3.785 Liters</code>
        </p>
        <p>
          To convert US gallons to liters, multiply by 3.78541:
          <code> Liters = Gallons × 3.78541</code>.
        </p>
        <p>
          To reverse liters into US gallons, divide by 3.78541 (or multiply by 0.264172):
          <code> Gallons = Liters × 0.264172</code>.
        </p>

        <h3>US Liquid Gallon vs. British Imperial Gallon vs. US Dry Gallon</h3>
        <p>
          A common source of confusion in international shipping and recipes is the distinction among three different gallons:
        </p>
        <ul>
          <li><strong>US Liquid Gallon (3.7854 L):</strong> The standard unit used across the United States for gasoline, milk, paint, and consumer beverages.</li>
          <li><strong>British Imperial Gallon (4.54609 L):</strong> Established by the British Weights and Measures Act of 1824 and historically used in the UK, Canada, Australia, and New Zealand. The Imperial gallon is approximately <strong>20.1% larger</strong> than the US liquid gallon.</li>
          <li><strong>US Dry Gallon (4.40488 L):</strong> Defined as one-eighth of a US Winchester bushel (268.8025 cubic inches), historically used in agricultural commodity trading for grains, berries, and dry goods.</li>
        </ul>

        <h3>The US Customary Liquid Hierarchy: Quarts, Pints & Ounces</h3>
        <p>
          Within the US Customary system, liquid volume units follow an intuitive binary division:
        </p>
        <ul>
          <li>1 US Gallon = <strong>4 Quarts</strong> (1 quart = 0.94635 L)</li>
          <li>1 US Gallon = <strong>8 Pints</strong> (1 pint = 473.176 mL)</li>
          <li>1 US Gallon = <strong>16 Cups</strong> (1 standard US cup = 8 fl oz = 236.588 mL)</li>
          <li>1 US Gallon = <strong>128 US Fluid Ounces</strong> (1 US fl oz = 29.5735 mL)</li>
        </ul>
        <p>
          Crucially, a US fluid ounce (29.57 mL) is slightly larger than a British Imperial fluid ounce (28.41 mL), even though the Imperial
          gallon contains 160 Imperial fluid ounces compared to the US gallon's 128 ounces.
        </p>

        <h3>Automotive Fuel Economy: US MPG vs. L/100km</h3>
        <p>
          When comparing vehicle fuel efficiency between the United States and metric countries, the non-linear relationship between
          miles per gallon (MPG) and liters per 100 kilometers (L/100km) is governed by the conversion formula:
        </p>
        <p>
          <code>L/100km = 235.215 / US MPG</code>
        </p>
        <p>
          For example, a car rated at 30 US MPG consumes approximately <code>235.215 / 30 = 7.84 L/100km</code>. Note that British
          automotive publications reporting fuel economy in MPG use the larger Imperial gallon (<code>Imperial MPG = US MPG × 1.201</code>),
          which inflates British MPG figures by 20% compared to US EPA ratings for identical vehicles.
        </p>
        <p>
          In home brewing, swimming pool chlorination, and freshwater aquarium maintenance, calculating water volume precisely in US liquid gallons ensures
          accurate chemical dosing and water conditioner treatment ratios, preventing both ineffective under-dosing and harmful chemical toxicity.
        </p>
      </div>
    </article>
  );
}
