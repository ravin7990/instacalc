export function UsHoursArticle() {
  return (
    <article className="section seo-section prose-page">
      <div className="container prose">
        <h2>Complete Guide to Work Hours, FLSA Overtime & Decimal Timesheets in the US</h2>
        <p>
          Accurate recording of working hours is a mandatory statutory responsibility for American businesses and employees alike.
          Governed primarily by the federal Fair Labor Standards Act (FLSA) and enforced by the US Department of Labor (DOL) Wage
          and Hour Division, precise time tracking ensures non-exempt employees receive lawful compensation, compliant overtime wages,
          and proper break deductions.
        </p>

        <h3>How Shift Hours & Meal Deductions are Calculated</h3>
        <p>
          Calculating payable work hours requires determining total elapsed time between clock-in and clock-out timestamps, then
          deducting non-compensable meal breaks:
        </p>
        <p>
          <code>Net Payable Hours = (End Time - Start Time) - Unpaid Break Duration</code>
        </p>
        <p>
          For shifts that span midnight (overnight third shifts), standard clock subtraction yields a negative number. The correct
          formula adds 24 hours (1,440 minutes) to the end timestamp before subtracting the start timestamp:
          <code> Elapsed Time = (End Time + 24:00) - Start Time</code>.
        </p>

        <h3>Federal FLSA Overtime Rules vs. State Daily Overtime</h3>
        <p>
          The federal standard for overtime compensation applies to all non-exempt covered employees under the FLSA:
        </p>
        <ul>
          <li><strong>Federal 40-Hour Threshold:</strong> Employers must pay overtime at a rate not less than <strong>one and one-half times (1.5×)</strong> the employee's regular hourly rate for all hours worked in excess of 40 hours during a designated, fixed seven-consecutive-day workweek.</li>
          <li><strong>California Daily Overtime:</strong> California labor law mandates overtime pay of 1.5× regular pay for all hours worked beyond 8 hours up to 12 hours in a single calendar workday, and <strong>double time (2.0×)</strong> for all hours worked beyond 12 hours in a single workday or for work beyond 8 hours on the seventh consecutive day of work.</li>
          <li><strong>Nevada & Alaska Rules:</strong> Nevada requires daily overtime (over 8 hours) for employees earning below statutory minimum multiples, while Alaska enforces daily overtime after 8 hours for employers with 4 or more workers.</li>
        </ul>

        <h3>Compensable Time: Rest Breaks vs. Bona Fide Meal Periods</h3>
        <p>
          Federal labor regulations (29 CFR § 785) strictly define which break intervals are compensable:
        </p>
        <ul>
          <li><strong>Short Rest Breaks (5 to 20 minutes):</strong> Rest intervals lasting 20 minutes or fewer are considered to promote employee efficiency and <strong>must be counted and compensated as hours worked</strong>.</li>
          <li><strong>Bona Fide Meal Periods (30+ minutes):</strong> Meal periods are generally non-compensable (unpaid), provided the employee is <strong>completely relieved from all active duty</strong> and free to leave their work post. If an employee is required to monitor a desk or answer phones while eating, the entire meal period must be paid.</li>
        </ul>

        <h3>Converting Minutes to Decimal Hours for Payroll (The 7-Minute Rule)</h3>
        <p>
          Because payroll software operates on decimal currency arithmetic, minutes must be converted into decimal fractions of an hour:
          <code> Decimal Hours = Hours + (Minutes / 60)</code>. Common reference conversions include:
        </p>
        <ul>
          <li>15 minutes = <strong>0.25 hours</strong></li>
          <li>30 minutes = <strong>0.50 hours</strong></li>
          <li>45 minutes = <strong>0.75 hours</strong></li>
        </ul>
        <p>
          Under FLSA regulations (29 CFR § 785.48(b)), employers are permitted to round employee punch times to the nearest 15 minutes
          using the <strong>7-minute rule</strong>: minutes from 1 to 7 are rounded down to the nearest quarter-hour, while minutes from
          8 to 14 are rounded up. Over time, rounding systems must average out fairly without systematically underpaying workers.
        </p>
      </div>
    </article>
  );
}
