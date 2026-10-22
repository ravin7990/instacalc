export function InAgeArticle() {
  return (
    <article className="section seo-section prose-page">
      <div className="container prose">
        <h2>Age Calculator Guide: Exact Chronological Age, Govt Job Eligibility & Rules in India</h2>
        <p>
          Determining your exact chronological age in completed years, months, and days is an everyday necessity across administrative, educational, and legal frameworks in India. Whether applying for competitive central government civil services examinations, securing primary school admissions under new National Education Policy (NEP) guidelines, or verifying senior citizen status for banking interest and tax filings, precision down to the exact day is essential.
        </p>

        <h3>The Chronological Age Calculation Algorithm</h3>
        <p>
          Chronological age is defined as the elapsed time from your official date of birth (as recorded on your birth certificate, Aadhaar, or Class 10 matriculation certificate) to today's date or a specified target reference date:
        </p>
        <p>
          <code>Age = Target Date (Year, Month, Day) - Date of Birth (Year, Month, Day)</code>
        </p>
        <p>
          Because months vary between 28, 29, 30, and 31 days, and leap years introduce an extra day every four years, accurate subtraction requires borrowing rules:
        </p>
        <ul>
          <li><strong>Borrowing Days:</strong> If the target day is smaller than the birth day, borrow days from the previous month. The number of days borrowed equals the exact number of days in the month immediately preceding the target month (e.g. 31 days if borrowing from January, 28/29 from February, 30 from April).</li>
          <li><strong>Borrowing Months:</strong> If the target month is smaller than the birth month, borrow 1 full year (12 months) from the target year and add it to the target months before subtracting.</li>
        </ul>

        <h3>Government Exam Eligibility & Cutoff Dates in India</h3>
        <p>
          A frequent use case for exact age calculations is verifying qualification criteria for competitive government examinations. Major recruiting bodies enforce strict statutory cutoff dates:
        </p>
        <ul>
          <li><strong>UPSC Civil Services Examination (IAS/IPS):</strong> Candidates must generally be between 21 and 32 years of age as of <strong>August 1</strong> of the examination year (with statutory age relaxations for OBC, SC, ST, and PwD categories).</li>
          <li><strong>SSC CGL (Staff Selection Commission):</strong> Cutoff dates are typically prescribed as <strong>January 1 or August 1</strong> of the notification year depending on the examination cycle.</li>
          <li><strong>Banking (IBPS PO & SBI PO):</strong> Candidates are required to be between 20 and 30 years of age as of the first day of the notification month.</li>
          <li><strong>Defence Services (NDA & CDS):</strong> Strict age windows ranging between 16.5 to 19.5 years for NDA, and 19 to 24/25 years for CDS and Air Force Academy entry.</li>
        </ul>

        <h3>School Admission Guidelines under NEP 2020 & RTE</h3>
        <p>
          Under the Right to Education (RTE) Act and recent circulars issued by the Ministry of Education aligning with the National Education Policy (NEP 2020), state governments and central school boards (CBSE, ICSE, Kendriya Vidyalaya Sangathan — KVS) have standardized the entry age:
        </p>
        <ul>
          <li>A child must have completed <strong>6 years of age as of March 31 (or June 1 in southern states)</strong> for admission into <strong>Class 1</strong>.</li>
          <li>Pre-primary nursery and kindergarten admissions typically mandate a minimum age of 3 to 4 years on the prescribed cutoff date.</li>
        </ul>

        <h3>Legal Milestones under Indian Law</h3>
        <p>
          Exact chronological age governs critical civil rights and privileges:
        </p>
        <ul>
          <li><strong>Age 16:</strong> Eligibility to obtain a learner's driving licence for gearless two-wheelers (up to 50cc engine capacity) with parental consent.</li>
          <li><strong>Age 18:</strong> Attainment of legal majority under the Indian Majority Act, 1875; right to vote in general elections under the 61st Constitutional Amendment; eligibility for a full motor vehicle driving licence; and capacity to enter into legally binding contracts.</li>
          <li><strong>Age 60:</strong> Attainment of <strong>Senior Citizen</strong> status under the Income Tax Act (qualifying for Section 80TTB ₹50,000 interest deductions, higher basic exemption limits, and bank deposit rate bonuses).</li>
          <li><strong>Age 80:</strong> Attainment of <strong>Super Senior Citizen</strong> status, qualifying for the highest tax exemption thresholds and dedicated healthcare support.</li>
        </ul>
      </div>
    </article>
  );
}
