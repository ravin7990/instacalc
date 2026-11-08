export function UsTimeDurationArticle() {
  return (
    <article className="section seo-section prose-page">
      <div className="container prose">
        <h2>Time Duration Guide: Sexagesimal Arithmetic, Elapsed Intervals and Professional Timing</h2>
        <p>
          Calculating elapsed time, adding multi-segment time intervals, or converting between units of duration is an
          everyday requirement across legal practice, aviation flight planning, athletic endurance training, and software
          operations in the United States. Unlike decimal metric systems that scale neatly in powers of ten, time measurement
          relies on an ancient sexagesimal (base-60) structure inherited from Babylonian mathematics. Because minutes and
          seconds reset at sixty rather than one hundred, standard decimal calculations produce serious errors unless converted
          through proper algorithms.
        </p>

        <h3>The Mechanics of Base-60 Sexagesimal Arithmetic</h3>
        <p>
          Chronological time uses a mixed-base counting system. A standard calendar day contains 24 hours. Each hour subdivides
          into 60 minutes, which equals 3,600 seconds. Individual minutes break down into 60 seconds, or 60,000 milliseconds.
        </p>
        <p>
          Attempting to add or subtract time values using standard decimal arithmetic leads to disastrous mistakes. For example,
          consider adding 2 hours 45 minutes to 1 hour 35 minutes. An untrained person might enter 2.45 plus 1.35 into a
          standard calculator, producing 3.80. That erroneous result bears no resemblance to the true duration of 4 hours and 20
          minutes. Sixty minutes form a whole hour, not one hundred.
        </p>
        <p>
          The reliable mathematical approach for multi-unit time addition or subtraction converts all values into a single base
          unit of total seconds:
        </p>
        <p>
          <code>{"Total Seconds = (Hours × 3,600) + (Minutes × 60) + Seconds"}</code>
        </p>
        <p>
          Once all durations are converted into total seconds, you perform straightforward addition or subtraction. To convert
          the final integer back into standardized Hours:Minutes:Seconds format, use simple integer division and modulus
          operations:
        </p>
        <p>
          <code>{"Hours = Math.floor(Total Seconds / 3,600)"}</code>
        </p>
        <p>
          <code>{"Minutes = Math.floor((Total Seconds % 3,600) / 60)"}</code>
        </p>
        <p>
          <code>{"Seconds = Total Seconds % 60"}</code>
        </p>
        <p>
          This universal algorithm handles any number of multi-step durations cleanly without cumulative rounding drift.
        </p>

        <h3>Solving Cross-Midnight Time Intervals</h3>
        <p>
          A common calculation challenge occurs when an activity begins in the late evening and concludes the following morning.
          For example, a cargo flight might depart at 10:15 PM (22:15) and touch down at 3:45 AM (03:45).
        </p>
        <p>
          Subtracting the starting time from the ending time yields a negative value: 03:45 minus 22:15 equals negative 18 hours
          and 30 minutes. Real-world elapsed time cannot be negative. To resolve overnight spans, add twenty-four hours (1,440
          minutes or 86,400 seconds) to the concluding timestamp:
        </p>
        <p>
          <code>{"Elapsed Time = (03:45 + 24:00) - 22:15 = 27:45 - 22:15 = 5 Hours 30 Minutes"}</code>
        </p>
        <p>
          Whether using standard 12-hour AM/PM notation or 24-hour military time, adding twenty-four hours to the arrival time
          instantly resolves the date line crossing.
        </p>

        <h3>Professional Applications: Legal Billing in Tenths of an Hour</h3>
        <p>
          In American legal firms, management consultancies, and CPA practices, professionals bill client work in tenths of an
          hour, meaning six-minute intervals:
        </p>
        <p>
          Work lasting 1 to 6 minutes is billed as 0.1 hour. Work spanning 7 to 12 minutes counts as 0.2 hour. Tasks lasting 13 to
          18 minutes convert to 0.3 hour, while 19 to 24 minutes equal 0.4 hour. Work extending from 25 to 30 minutes is billed as
          0.5 hour.
        </p>
        <p>
          Accurately summing dozens of short phone consultations, court appearances, and email reviews throughout a business day
          ensures ethical billing compliance while eliminating lost billable revenue.
        </p>

        <h3>Athletic Pacing and Aviation Navigation</h3>
        <p>
          Endurance runners and cyclists rely on time duration math to track pacing targets across marathon, half-marathon, and
          triathlon courses. Running pace measures the time required to complete a single statute mile:
        </p>
        <p>
          <code>{"Pace per Mile (Seconds) = Total Race Time in Seconds / Distance in Miles"}</code>
        </p>
        <p>
          Completing a half-marathon (13.109 miles) in 1 hour 45 minutes (6,300 seconds) requires maintaining an average pace of
          480.6 seconds per mile, which equals 8 minutes and 1 second per mile.
        </p>
        <p>
          In civil aviation, Federal Aviation Administration (FAA) cross-country flight plans mandate that pilots calculate
          Estimated Time Enroute (ETE) and block time. Block time measures the exact duration from the moment the aircraft moves
          under its own power at departure until wheels are chocked at the arrival gate. Pilots log this duration in hours and tenths
          of an hour to track maintenance intervals and legal crew duty limitations.
        </p>

        <h3>Broadcast Media and Video Frame Timing</h3>
        <p>
          In digital video editing and broadcast television, precision time measurement extends into individual video frames. The
          Society of Motion Picture and Television Engineers (SMPTE) standardizes timecode into Hours:Minutes:Seconds:Frames.
        </p>
        <p>
          Standard North American television runs at 29.97 frames per second. Because 29.97 is slightly slower than an even 30
          frames per second, unadjusted timecode drifts by roughly 3.6 seconds every hour. Broadcasters use SMPTE drop-frame
          timecode, which drops two frame numbers at the start of every minute except every tenth minute, keeping broadcast
          programming perfectly synchronized with real-world atomic clock time.
        </p>
      </div>
    </article>
  );
}
