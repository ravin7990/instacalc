export function UsTimeDurationArticle() {
  return (
    <article className="section seo-section prose-page">
      <div className="container prose">
        <h2>Complete Guide to Time Duration: Addition, Subtraction & Sexagesimal Arithmetic</h2>
        <p>
          Calculating elapsed time, adding time intervals, or converting between units of time is an indispensable skill across
          professional consulting, aviation flight planning, athletic endurance training, and software operations in the United
          States. Unlike decimal metric systems that operate in powers of ten, time measurement relies on an ancient <strong>sexagesimal
          (base-60) system</strong> inherited from Babylonian mathematics, necessitating specialized arithmetic algorithms to calculate
          precise durations without error.
        </p>

        <h3>The Mechanics of Sexagesimal Time Arithmetic</h3>
        <p>
          The standard units of chronological time follow mixed-base subdivisions:
        </p>
        <ul>
          <li>1 Day = 24 Hours</li>
          <li>1 Hour = 60 Minutes = 3,600 Seconds</li>
          <li>1 Minute = 60 Seconds = 60,000 Milliseconds</li>
        </ul>
        <p>
          Because minutes and seconds reset at 60 rather than 100, attempting to add or subtract time values using standard decimal
          math produces severe errors (e.g., treating 2 hours 45 minutes plus 1 hour 35 minutes as 2.45 + 1.35 = 3.80 instead of the
          true 4 hours 20 minutes).
        </p>
        <p>
          The universal algorithm for multi-unit time addition or subtraction converts all values into a single base unit of
          <strong>total seconds</strong>, executes the mathematical operation, and converts the resulting total back into hours,
          minutes, and seconds:
        </p>
        <p>
          <code>Total Seconds = (Hours × 3,600) + (Minutes × 60) + Seconds</code>
        </p>
        <p>
          To reverse total seconds back into standardized Hours:Minutes:Seconds (HMS) format:
        </p>
        <ul>
          <li><code>Hours = Math.floor(Total Seconds / 3,600)</code></li>
          <li><code>Minutes = Math.floor((Total Seconds % 3,600) / 60)</code></li>
          <li><code>Seconds = Total Seconds % 60</code></li>
        </ul>

        <h3>Professional Applications: Legal Billing in Tenths of an Hour</h3>
        <p>
          In US legal, management consulting, and public accounting practices, client engagements are billed in <strong>tenths of
          an hour (6-minute increments)</strong>:
        </p>
        <ul>
          <li>1 to 6 minutes = <strong>0.1 hour</strong></li>
          <li>7 to 12 minutes = <strong>0.2 hour</strong></li>
          <li>13 to 18 minutes = <strong>0.3 hour</strong></li>
          <li>19 to 24 minutes = <strong>0.4 hour</strong></li>
          <li>25 to 30 minutes = <strong>0.5 hour</strong></li>
        </ul>
        <p>
          Accurately summing multiple short phone consultations, court appearances, and brief reviews across a workday ensures precise,
          transparent client invoices while satisfying professional ethical standards.
        </p>

        <h3>Athletic Pacing & Aviation Flight Timing</h3>
        <p>
          Endurance athletes running marathons, half-marathons, or 5K races use time duration arithmetic to determine <strong>running
          pace per mile</strong>:
        </p>
        <p>
          <code>Pace (Minutes:Seconds per Mile) = Total Race Time in Seconds / Distance in Miles</code>
        </p>
        <p>
          For instance, completing a half-marathon (13.109 miles) in 1 hour 45 minutes (6,300 seconds) requires an average pace of
          <code> 6,300 / 13.109 = 480.6 seconds per mile</code>, which equals exactly <strong>8 minutes and 1 second per mile</strong>.
          Similarly, Federal Aviation Administration (FAA) cross-country flight plans require pilots to compute Estimated Time Enroute
          (ETE) based on true airspeed, groundspeed, and wind correction angles using precise sexagesimal duration formulas.
        </p>

        <h3>Broadcast Media & Video Production Timing</h3>
        <p>
          In US digital video production and television broadcasting, precise duration calculation extends into sub-second frames.
          The Society of Motion Picture and Television Engineers (SMPTE) standardizes time representation into <strong>Hours:Minutes:Seconds:Frames</strong>
          (HH:MM:SS:FF). In standard North American NTSC broadcasting running at 29.97 frames per second, drop-frame timecode calculation
          drops two frame numbers each minute (except every tenth minute) to synchronize recorded SMPTE time with real-world wall clock time,
          preventing live broadcast transmission drift.
        </p>
      </div>
    </article>
  );
}
