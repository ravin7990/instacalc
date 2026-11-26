import { useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout, localeHome } from "@/components/layout/Layout";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { FaqAccordion, type FaqItem } from "@/components/calculator/FaqAccordion";

interface DeletionFormData {
  name: string;
  email: string;
  requestType: string;
  message: string;
  confirm: boolean;
}

const DEFAULT_BIBLE_VERSE_FAQS: FaqItem[] = [
  {
    q: "How do I request account and data deletion for Bible Verse of the Day?",
    a: "You can submit your deletion request directly using the secure online form on this page with your registered email address, or email developerravin@gmail.com with 'Bible Verse of the Day - Data Deletion Request' in the subject line.",
  },
  {
    q: "What data is permanently deleted when my request is processed?",
    a: "Your user profile, Google OAuth credentials, email address, bookmarked and favorited verses, prayer notes, custom categories, reading progress, and notification push tokens are completely and permanently wiped from our active databases.",
  },
  {
    q: "How long does it take for my Bible Verse of the Day data to be purged?",
    a: "All deletion requests are prioritized and fully processed within 7 business days. You will receive a final confirmation email once the purge has been completed.",
  },
  {
    q: "Can I still read verses in the app after requesting account deletion?",
    a: "Yes. You can continue reading daily scriptures and devotionals on your device in offline or guest mode without an account, but cloud backup, favorites synchronization, and personalized notes will no longer be stored.",
  },
  {
    q: "Who is the official developer of Bible Verse of the Day?",
    a: "Bible Verse of the Day is developed and published by Life Hack Developer on the Google Play Store.",
  },
];

/**
 * Dedicated Account & Data Deletion Request Page for "Bible Verse of the Day"
 * Published by Life Hack Developer (Google Play Store).
 *
 * Conforms to Google Play Developer Account & Data Deletion policy:
 * Provides clear transparency on data collected, steps to request deletion,
 * data purged vs retained, and a direct form submitting to Formspree:
 * https://formspree.io/f/mjgppjjz
 */
export default function BibleVerseDeletePage({ seo }: { seo: SeoRecord }) {
  const extracted = extractFaq(seo);
  const faqs = extracted.length > 0 ? extracted : DEFAULT_BIBLE_VERSE_FAQS;

  const [form, setForm] = useState<DeletionFormData>({
    name: "",
    email: "",
    requestType: "Full Account & All Bible Verse Data (Permanent Purge)",
    message: "",
    confirm: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      setError("Please provide your full name and registered email address.");
      return;
    }

    if (!form.confirm) {
      setError("Please confirm that you understand this deletion is permanent and cannot be undone.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("https://formspree.io/f/mjgppjjz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          app_name: "Bible Verse of the Day",
          developer: "Life Hack Developer",
          request_type: form.requestType,
          message: form.message.trim() || "No additional comments provided",
          confirmation: "User confirmed permanent account and data deletion for Bible Verse of the Day",
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const data = await response.json().catch(() => ({}));
        const fieldError = data?.errors?.[0]?.message;
        setError(
          fieldError ||
            "Failed to submit request. Please try again or email us directly at developerravin@gmail.com."
        );
      }
    } catch {
      setError("Network error. Please check your internet connection and try again, or email developerravin@gmail.com.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm({
      name: "",
      email: "",
      requestType: "Full Account & All Bible Verse Data (Permanent Purge)",
      message: "",
      confirm: false,
    });
    setSubmitted(false);
    setError("");
  };

  return (
    <>
      <SeoHead seo={seo} />
      <Layout locale={seo.locale}>
        {/* Hero Section */}
        <section className="hero">
          <div className="container">
            <div className="hero-copy">
              <span className="eyebrow">
                Google Play Store • Data Removal Request
              </span>
              <h1>Bible Verse of the Day – Account &amp; Data Deletion Request</h1>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "var(--ic-primary-dark)",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  marginBottom: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                <span>Developer: Life Hack Developer</span>
                <span style={{ opacity: 0.6 }}>•</span>
                <span>App: Bible Verse of the Day</span>
              </div>
              <p>
                This dedicated portal allows users of the <strong>Bible Verse of the Day</strong> mobile application (published by <strong>Life Hack Developer</strong> on Google Play) to submit a request for the complete and permanent deletion of their account, saved scriptures, prayer bookmarks, and all associated personal data.
              </p>
              <div className="hero-actions">
                <a className="btn btn-primary" href="#delete-form">
                  Submit Deletion Request
                </a>
                <a className="btn btn-ghost" href="/delete-account.html">
                  All Apps Deletion Portal
                </a>
                <a className="btn btn-ghost" href={localeHome(seo.locale)}>
                  Return Home
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Prose outline & policy details */}
        <article className="section prose-page">
          <div className="container prose">
            <p className="lead">
              In accordance with Google Play Developer Policies (Account and Data Deletion Requirement) and global privacy standards, Life Hack Developer provides this dedicated deletion page for users of our mobile application <strong>Bible Verse of the Day</strong>. You do not need to reinstall the app to purge your data.
            </p>

            <h2>About Bible Verse of the Day Data Protection</h2>
            <p>
              <strong>Bible Verse of the Day</strong> is developed and maintained by <strong>Life Hack Developer</strong>. We are committed to transparency and respecting your personal privacy. Whether you signed in using Google Sign-In (OAuth) or used local features, you have full ownership and control over your records. You can request irrevocable deletion of your profile, cloud sync data, and saved preferences at any time.
            </p>

            <h2>What data we collect &amp; store</h2>
            <p>
              To provide daily scripture notifications, scripture bookmarks, and cross-device synchronization, Bible Verse of the Day may process and securely store the following data:
            </p>
            <ul>
              <li>
                <strong>Google Profile Details (Name &amp; Email): </strong>
                Used strictly for user authentication when signing in through Google Sign-In (OAuth) to safely store and sync your devotional bookmarks across devices.
              </li>
              <li>
                <strong>Saved Verses, Favorites &amp; Prayer Bookmarks: </strong>
                Verses you have bookmarked, personal prayer notes, custom scripture reflections, and favorite collections.
              </li>
              <li>
                <strong>Reading Progress &amp; Streaks: </strong>
                Daily scripture reading history, streak trackers, and scheduled daily notification preferences.
              </li>
              <li>
                <strong>App Preferences &amp; Settings: </strong>
                Preferred Bible translation (such as KJV, NIV, ESV), typography choices, and dark/light display settings.
              </li>
              <li>
                <strong>Anonymous Diagnostics: </strong>
                Aggregated, non-personally identifiable crash logs and telemetry (via Google Play Vitals / Firebase Crashlytics) to debug errors and maintain app stability.
              </li>
            </ul>

            <h2>How to request account &amp; data deletion</h2>
            <p>
              We provide multiple quick and secure ways to request data deletion:
            </p>
            <ol>
              <li>
                <strong>Online Request Form (Recommended): </strong>
                Complete the dedicated form below on this page using the email address associated with your Google Sign-In or app account.
              </li>
              <li>
                <strong>Direct Email to Developer: </strong>
                Send an email from your registered account to <a href="mailto:developerravin@gmail.com">developerravin@gmail.com</a> with the subject line <em>&ldquo;Data Deletion Request - Bible Verse of the Day&rdquo;</em>.
              </li>
              <li>
                <strong>In-App Deletion: </strong>
                Open Bible Verse of the Day &gt; Settings &gt; Account &gt; tap &ldquo;Delete Account &amp; Data&rdquo;.
              </li>
            </ol>

            <h2>What data is deleted vs. retained</h2>
            <p>
              We enforce rigorous data purge procedures upon receiving a verified request:
            </p>
            <ul>
              <li>
                <strong>Permanently Deleted: </strong>
                Your account identifier, email address, Google OAuth linkage, all favorited verses, prayer notes, custom verse categories, reading streak history, and push notification tokens are permanently and irreversibly purged from our active databases and backup rotations.
              </li>
              <li>
                <strong>Data Retained: </strong>
                Only strictly anonymized, aggregated operational metrics (such as aggregated crash reports or anonymized Play Store download counts) that cannot be linked back to you or any individual device may be retained for general service reliability and developer policy compliance.
              </li>
            </ul>

            <h2>Processing Timeline &amp; SLA</h2>
            <p>
              All deletion requests for Bible Verse of the Day submitted through this page are prioritized by our engineering team:
            </p>
            <ul>
              <li>
                <strong>Processed within 7 business days: </strong>
                Every submission is handled promptly and purged within 7 business days.
              </li>
              <li>
                <strong>Confirmation Email: </strong>
                A final confirmation message will be delivered to your registered email once the database purge is complete.
              </li>
              <li>
                <strong>Clearing Local Data: </strong>
                Uninstalling the app or tapping &ldquo;Clear App Data&rdquo; in your Android Device Settings immediately erases all locally cached offline verses and preferences from your device.
              </li>
            </ul>
          </div>
        </article>

        {/* Deletion Form Section */}
        <section className="section" id="delete-form" style={{ paddingTop: 0 }}>
          <div className="container" style={{ maxWidth: "800px" }}>
            <div className="contact-form-card">
              <h2>Bible Verse of the Day – Deletion Request Form</h2>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.85rem 1.15rem",
                  background: "var(--ic-primary-light)",
                  borderRadius: "var(--ic-radius-sm)",
                  marginBottom: "1.5rem",
                  border: "1px solid rgba(2, 132, 199, 0.25)",
                }}
              >
                <div style={{ fontSize: "0.9rem", color: "var(--ic-primary-dark)", lineHeight: 1.5 }}>
                  <strong>Target App: </strong>
                  <span style={{ fontWeight: 700 }}>Bible Verse of the Day</span>
                  <span style={{ margin: "0 0.5rem", opacity: 0.6 }}>•</span>
                  <strong>Developer: </strong>
                  <span style={{ fontWeight: 700 }}>Life Hack Developer</span>
                  <span style={{ margin: "0 0.5rem", opacity: 0.6 }}>•</span>
                  <span>Google Play Store</span>
                </div>
              </div>

              <p style={{ color: "var(--ic-text-muted)", marginBottom: "1.5rem" }}>
                Please fill in the form below to permanently delete your Bible Verse of the Day account and all stored cloud data. Requests are processed within 7 business days by Life Hack Developer.
              </p>

              {submitted ? (
                <div className="form-success" role="status">
                  <div className="success-icon" aria-hidden="true">✓</div>
                  <h3>Deletion Request Submitted Successfully</h3>
                  <p>
                    Thank you, <strong>{form.name}</strong>. We have received your data removal request for <strong>Bible Verse of the Day</strong> associated with <strong>{form.email}</strong>.
                  </p>
                  <p>
                    Your account records, favorite verses, prayer notes, and profile identifiers will be permanently purged from our active databases within <strong>7 business days</strong>. A confirmation email will follow.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleReset}
                    style={{ marginTop: "1rem" }}
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form
                  className="contact-form"
                  action="https://formspree.io/f/mjgppjjz"
                  method="POST"
                  onSubmit={handleSubmit}
                  noValidate
                >
                  {error ? (
                    <div className="form-error" role="alert">
                      {error}
                    </div>
                  ) : null}

                  {/* Pre-configured App Field */}
                  <input type="hidden" name="app_name" value="Bible Verse of the Day" />
                  <input type="hidden" name="developer" value="Life Hack Developer" />

                  <div className="form-group">
                    <label htmlFor="targetAppDisplay">Selected Application</label>
                    <input
                      id="targetAppDisplay"
                      type="text"
                      className="form-control"
                      value="Bible Verse of the Day (by Life Hack Developer)"
                      disabled
                      style={{
                        background: "var(--ic-bg-subtle)",
                        fontWeight: 600,
                        color: "var(--ic-primary-dark)",
                        cursor: "not-allowed",
                      }}
                    />
                    <small style={{ color: "var(--ic-text-muted)", fontSize: "0.8rem", marginTop: "0.2rem" }}>
                      This dedicated page is specifically locked to Bible Verse of the Day. For other apps by Life Hack Developer, visit the <a href="/delete-account.html">general deletion portal</a>.
                    </small>
                  </div>

                  {/* Full Name */}
                  <div className="form-group">
                    <label htmlFor="verseDeleteName">
                      Full Name <span className="required">*</span>
                    </label>
                    <input
                      id="verseDeleteName"
                      name="name"
                      type="text"
                      className="form-control"
                      placeholder="e.g. Sarah Jenkins"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>

                  {/* Registered Email */}
                  <div className="form-group">
                    <label htmlFor="verseDeleteEmail">
                      Registered Email Address <span className="required">*</span>
                    </label>
                    <input
                      id="verseDeleteEmail"
                      name="email"
                      type="email"
                      className="form-control"
                      placeholder="e.g. user@gmail.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                    <small style={{ color: "var(--ic-text-muted)", fontSize: "0.8rem", marginTop: "0.2rem" }}>
                      Please provide the exact email address used for Google Sign-In or your app profile so our team can locate and wipe your records.
                    </small>
                  </div>

                  {/* Deletion Request Scope */}
                  <div className="form-group">
                    <label htmlFor="verseScopeSelect">Deletion Request Scope</label>
                    <select
                      id="verseScopeSelect"
                      name="request_type"
                      className="form-control"
                      value={form.requestType}
                      onChange={(e) => setForm({ ...form, requestType: e.target.value })}
                    >
                      <option value="Full Account & All Bible Verse Data (Permanent Purge)">
                        Full Account &amp; All Associated Data (Permanent Purge)
                      </option>
                      <option value="Saved Verses, Notes & Highlights Only">
                        Saved Verses, Notes &amp; Highlights Only (Keep Account Active)
                      </option>
                      <option value="Revoke Google Sign-in Access & Purge Profile">
                        Revoke Google Sign-In Access &amp; Purge Profile
                      </option>
                    </select>
                  </div>

                  {/* Additional Details */}
                  <div className="form-group">
                    <label htmlFor="verseMessage">
                      Additional Details / User ID (Optional)
                    </label>
                    <textarea
                      id="verseMessage"
                      name="message"
                      rows={3}
                      className="form-control"
                      placeholder="Provide any additional account identifiers or comments to help our team process your request faster..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                    />
                  </div>

                  {/* Confirmation Checkbox */}
                  <div
                    className="form-group"
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.75rem",
                      padding: "0.85rem",
                      background: "var(--ic-bg-subtle)",
                      borderRadius: "var(--ic-radius-sm)",
                      border: "1px solid var(--ic-border)",
                    }}
                  >
                    <input
                      id="verseConfirmCheckbox"
                      name="confirm"
                      type="checkbox"
                      checked={form.confirm}
                      onChange={(e) => setForm({ ...form, confirm: e.target.checked })}
                      style={{
                        width: "18px",
                        height: "18px",
                        marginTop: "0.15rem",
                        cursor: "pointer",
                        accentColor: "var(--ic-primary)",
                        flexShrink: 0,
                      }}
                      required
                    />
                    <label
                      htmlFor="verseConfirmCheckbox"
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        color: "var(--ic-text)",
                        cursor: "pointer",
                        lineHeight: 1.45,
                        margin: 0,
                      }}
                    >
                      I confirm that I want to permanently delete my account and all associated personal data from Bible Verse of the Day (by Life Hack Developer). I understand that saved verses, prayer reflections, and reading streaks cannot be recovered after deletion. <span className="required">*</span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="form-actions" style={{ marginTop: "0.5rem" }}>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={submitting}
                      style={{ minWidth: "240px" }}
                    >
                      {submitting ? "Submitting request..." : "Submit Deletion Request"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Dedicated FAQ */}
        <FaqAccordion locale={seo.locale} items={faqs} />
      </Layout>
    </>
  );
}
