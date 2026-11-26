import { useState, useEffect } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout, localeHome } from "@/components/layout/Layout";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";

interface DeletionFormData {
  name: string;
  email: string;
  appName: string;
  requestType: string;
  message: string;
  confirm: boolean;
}

/**
 * Dedicated Account & Data Deletion Request Page.
 * Conforms to Google Play Developer Account & Data Deletion policy requirements:
 * Provides clear information on data collected, steps to request deletion,
 * what data is purged vs retained, and a secure form to request deletion with
 * an application selector dropdown (Age Calculator, LaborBook Pro, Expense Manager,
 * Drawing Viewer (Self Drive), Bible Verse of the Day).
 *
 * Connected service: Formspree (endpoint: https://formspree.io/f/mjgppjjz)
 */
export default function DeleteAccountPage({ seo }: { seo: SeoRecord }) {
  const faq = extractFaq(seo);
  const isJa = seo.locale === "ja";

  const [form, setForm] = useState<DeletionFormData>({
    name: "",
    email: "",
    appName: "",
    requestType: "Full Account & All Associated Data",
    message: "",
    confirm: false,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const appParam = params.get("app");
      if (appParam) {
        const apps = [
          "Age Calculator",
          "LaborBook Pro",
          "Expense Manager",
          "Drawing Viewer (Self Drive)",
          "Bible Verse of the Day",
        ];
        const match = apps.find(
          (a) =>
            a.toLowerCase().includes(appParam.toLowerCase()) ||
            appParam.toLowerCase().includes(a.toLowerCase())
        );
        if (match) {
          setForm((prev) => ({ ...prev, appName: match }));
        }
      }
    }
  }, []);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.appName) {
      setError(
        isJa
          ? "お名前、登録メールアドレス、および対象アプリを選択してください。"
          : "Please provide your name, registered email, and select an application."
      );
      return;
    }

    if (!form.confirm) {
      setError(
        isJa
          ? "アカウント削除の確認チェックボックスをオンにしてください。"
          : "Please confirm that you understand this deletion is permanent."
      );
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
          app_name: form.appName,
          request_type: form.requestType,
          message: form.message.trim() || "No additional comments provided",
          confirmation: "User acknowledged permanent data deletion",
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const data = await response.json().catch(() => ({}));
        const fieldError = data?.errors?.[0]?.message;
        setError(
          fieldError ||
            (isJa
              ? "リクエストの送信中にエラーが発生しました。もう一度お試しいただくか、developerravin@gmail.com に直接ご連絡ください。"
              : "Failed to submit request. Please try again or email us directly at developerravin@gmail.com.")
        );
      }
    } catch {
      setError(
        isJa
          ? "通信エラーが発生しました。ネットワーク接続をご確認の上、再試行してください。"
          : "Network error. Please check your internet connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm({
      name: "",
      email: "",
      appName: "",
      requestType: "Full Account & All Associated Data",
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
                {isJa ? "プライバシーとデータ保護" : "Data Removal Request"}
              </span>
              <h1>
                {isJa
                  ? "アカウントおよびデータの削除リクエスト"
                  : "Account & Data Deletion Request"}
              </h1>
              <p>
                {isJa
                  ? "Life Hack Developerが提供するモバイルアプリ（Age Calculator、LaborBook Pro、Expense Manager、Drawing Viewer (Self Drive)、今日のみことば / Bible Verse of the Day）をご利用のユーザー様は、本フォームからアカウントおよび保存データの完全削除をいつでも申請できます。"
                  : "Users who have signed in to our mobile applications (such as Age Calculator, LaborBook Pro, Expense Manager, Drawing Viewer (Self Drive), or Bible Verse of the Day) via Google Sign-In (OAuth) or direct accounts can request permanent deletion of their profile and associated data at any time."}
              </p>
              <div className="hero-actions">
                <a className="btn btn-primary" href={localeHome(seo.locale)}>
                  {isJa ? "すべての計算ツールを見る" : "Browse calculators"}
                </a>
                <a className="btn btn-ghost" href="#delete-form">
                  {isJa ? "削除申請フォームへ進む" : "Jump to Deletion Form"}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Prose outline & policy details */}
        <article className="section prose-page">
          <div className="container prose">
            <p className="lead">
              {isJa
                ? "当社はGoogle Playデベロッパーポリシーおよび各国のデータ保護法を遵守し、ユーザーの皆様が自らの個人情報とアプリデータを完全に管理できる権利を保障しています。"
                : "In accordance with Google Play Developer Policies and data protection regulations, we provide our users with complete control and transparency over their personal information and stored application records."}
            </p>

            <h2>{isJa ? "収集するデータについて" : "What data we collect"}</h2>
            <p>
              {isJa
                ? "アプリの各種機能やパーソナライズサービスを提供するため、以下の情報を取り扱う場合があります："
                : "To deliver personalized features, cloud sync, and calculator tools, our applications may collect and securely store the following information:"}
            </p>
            <ul>
              <li>
                <strong>
                  {isJa
                    ? "Google プロフィール情報（氏名・メールアドレス）"
                    : "Google Profile Details (Name & Email): "}
                </strong>
                {isJa
                  ? "Google OAuth サインイン時のユーザー認証のみに使用されます。"
                  : "Used exclusively for secure identity authentication via Google Sign-In."}
              </li>
              <li>
                <strong>
                  {isJa ? "基本アカウント情報" : "Basic Account Details: "}
                </strong>
                {isJa
                  ? "直接アカウント登録時の氏名、メールアドレス。"
                  : "Name and email address for direct account registration."}
              </li>
              <li>
                <strong>
                  {isJa
                    ? "アプリ固有の保存データ"
                    : "App-Specific Stored Data: "}
                </strong>
                {isJa
                  ? "Age Calculator の保存日付・イベント、LaborBook Pro の出勤・労務記録、Expense Manager の収支・取引記録、Bible Verse of the Day のお気に入り・祈りリマインダーなど。"
                  : "Saved birthdates & celebration reminders (Age Calculator), labor records & attendance logs (LaborBook Pro), income/expense ledger transactions (Expense Manager), favorite verses & prayer notification preferences (Bible Verse of the Day)."}
              </li>
              <li>
                <strong>
                  {isJa ? "環境設定" : "Preferences & Settings: "}
                </strong>
                {isJa
                  ? "アプリ内の通貨選択、言語設定、通知設定など。"
                  : "Theme settings, currency choices, and user preferences."}
              </li>
              <li>
                <strong>
                  {isJa ? "計算ログと履歴" : "Historical Calculation Logs: "}
                </strong>
                {isJa
                  ? "ユーザーのアカウントに同期された過去の計算履歴。"
                  : "Saved calculation outputs associated with your profile."}
              </li>
            </ul>

            <h2>{isJa ? "削除申請の手順" : "How to request deletion"}</h2>
            <p>
              {isJa
                ? "スムーズなデータ削除手続きのため、以下の手順でご申請ください："
                : "Follow these simple steps to ensure your data removal request is processed quickly and accurately:"}
            </p>
            <ul>
              <li>
                {isJa
                  ? "下記の申請フォームで、データ削除を希望するアプリ（Age Calculator、LaborBook Pro、Expense Manager、Drawing Viewer (Self Drive)、今日のみことば / Bible Verse of the Day）を選択してください。"
                  : "Select the specific app you want data deleted from (Age Calculator, LaborBook Pro, Expense Manager, Drawing Viewer (Self Drive), or Bible Verse of the Day) in the dropdown below."}
              </li>
              <li>
                {isJa
                  ? "アプリにログインしている登録メールアドレス（Googleアカウントまたは直接登録メール）を正確に入力してください。"
                  : "Enter your registered email address (the exact email associated with Google Sign-In or your account profile)."}
              </li>
              <li>
                {isJa
                  ? "削除範囲（全データ削除、または記録のみ削除）を選択してください。"
                  : "Choose the scope of deletion (Entire Account & All Data, or Stored Records Only)."}
              </li>
              <li>
                {isJa
                  ? "内容を確認の上、「削除リクエストを送信する」をクリックしてください。"
                  : "Confirm permanent deletion and submit the secure form below."}
              </li>
            </ul>

            <h2>{isJa ? "申請後の対応とスケジュール" : "What happens next"}</h2>
            <p>
              {isJa
                ? "申請を受領後、専任の開発チームが速やかに以下の手順で処理を行います："
                : "Once your submission is received, our engineering team handles the purge through the following standard procedure:"}
            </p>
            <ul>
              <li>
                <strong>
                  {isJa
                    ? "7営業日以内に優先処理"
                    : "Processed within 7 business days: "}
                </strong>
                {isJa
                  ? "申請内容は通常7営業日以内に確認・処理されます。"
                  : "Every deletion ticket is prioritized and completed within 7 business days."}
              </li>
              <li>
                <strong>
                  {isJa
                    ? "本番サーバーからの完全消去"
                    : "Permanent Purge from Production Servers: "}
                </strong>
                {isJa
                  ? "アカウント識別子、認証トークン、保存記録が本番データベースから物理的に完全消去されます。"
                  : "All user records, credentials, identifiers, and calculation logs are irrevocably wiped from active databases and servers."}
              </li>
              <li>
                <strong>
                  {isJa
                    ? "完了通知メールの送付"
                    : "Final Confirmation Email: "}
                </strong>
                {isJa
                  ? "削除処理の完了後、ご登録メールアドレス宛に完了通知をお送りします。"
                  : "A confirmation email is sent to your registered email once the purge is complete."}
              </li>
            </ul>

            <h2>{isJa ? "保持されるデータについて" : "Data we may retain"}</h2>
            <p>
              {isJa
                ? "アカウント削除後、個人を特定できない集計データや匿名化されたテレメトリ（アプリクラッシュ診断や統計指標など）のみをサービスの品質維持のために保持する場合があります。これらは特定の個人に関連付けることは一切できません。"
                : "After your account has been deleted, we only retain strictly anonymous, aggregated telemetry (e.g. general crash diagnostics or feature usage metrics) that cannot be linked back to an individual or account. This ensures app stability and performance for our active user base."}
            </p>
          </div>
        </article>

        {/* Deletion Form Section */}
        <section className="section" id="delete-form" style={{ paddingTop: 0 }}>
          <div className="container" style={{ maxWidth: "800px" }}>
            <div className="contact-form-card">
              <h2>
                {isJa ? "削除申請フォーム" : "Submit Deletion Request"}
              </h2>
              <p style={{ color: "var(--ic-text-muted)", marginBottom: "1.5rem" }}>
                {isJa
                  ? "以下の項目に入力し、送信ボタンを押してください。当社の担当者が迅速に処理いたします。"
                  : "Please complete the form below to initiate the permanent deletion of your app account and associated records."}
              </p>

              {submitted ? (
                <div className="form-success" role="status">
                  <div className="success-icon" aria-hidden="true">✓</div>
                  <h3>
                    {isJa ? "削除リクエストを受領いたしました" : "Deletion Request Submitted"}
                  </h3>
                  <p>
                    {isJa
                      ? `ご申請ありがとうございます。対象アプリ「${form.appName}」（メールアドレス: ${form.email}）のアカウントおよびデータの削除処理を開始しました。`
                      : `Thank you, ${form.name}. We have received your data removal request for "${form.appName}" associated with "${form.email}".`}
                  </p>
                  <p>
                    {isJa
                      ? "データは7営業日以内に本番システムから完全に消去され、完了確認メールが送信されます。"
                      : "Your account identifiers and records will be permanently purged within 7 business days. A confirmation email will follow."}
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleReset}
                    style={{ marginTop: "1rem" }}
                  >
                    {isJa ? "別の申請を送信する" : "Submit Another Request"}
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

                  {/* App Selection Dropdown */}
                  <div className="form-group">
                    <label htmlFor="appNameSelect">
                      {isJa ? "対象のアプリケーション" : "Select Application"}{" "}
                      <span className="required">*</span>
                    </label>
                    <select
                      id="appNameSelect"
                      name="app_name"
                      className="form-control"
                      value={form.appName}
                      onChange={(e) => setForm({ ...form, appName: e.target.value })}
                      required
                    >
                      <option value="" disabled>
                        {isJa ? "-- 対象アプリを選択してください --" : "-- Choose your App --"}
                      </option>
                      <option value="Age Calculator">
                        {isJa ? "年齢計算アプリ (Age Calculator App)" : "Age Calculator App"}
                      </option>
                      <option value="LaborBook Pro">
                        LaborBook Pro
                      </option>
                      <option value="Expense Manager">
                        {isJa ? "家計簿・支出管理 (Expense Manager App)" : "Expense Manager App"}
                      </option>
                      <option value="Drawing Viewer (Self Drive)">
                        Drawing Viewer (Self Drive)
                      </option>
                      <option value="Bible Verse of the Day">
                        {isJa ? "今日のみことば (Bible Verse of the Day)" : "Bible Verse of the Day"}
                      </option>
                    </select>
                    <small style={{ color: "var(--ic-text-muted)", fontSize: "0.8rem", marginTop: "0.2rem" }}>
                      {isJa
                        ? "データを削除したい対象のアプリを選択してください。"
                        : "Select which application contains the account or records you wish to purge."}
                    </small>
                  </div>

                  {/* Full Name */}
                  <div className="form-group">
                    <label htmlFor="deleteName">
                      {isJa ? "お名前（またはニックネーム）" : "Full Name"}{" "}
                      <span className="required">*</span>
                    </label>
                    <input
                      id="deleteName"
                      name="name"
                      type="text"
                      className="form-control"
                      placeholder={isJa ? "山田 太郎" : "e.g. John Doe"}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>

                  {/* Registered Email */}
                  <div className="form-group">
                    <label htmlFor="deleteEmail">
                      {isJa ? "ご登録メールアドレス" : "Registered Email Address"}{" "}
                      <span className="required">*</span>
                    </label>
                    <input
                      id="deleteEmail"
                      name="email"
                      type="email"
                      className="form-control"
                      placeholder={isJa ? "user@example.com" : "e.g. user@gmail.com"}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                    <small style={{ color: "var(--ic-text-muted)", fontSize: "0.8rem", marginTop: "0.2rem" }}>
                      {isJa
                        ? "Googleサインインまたはアプリ内でアカウント作成に使用したメールアドレスをご入力ください。"
                        : "The email address associated with your Google Sign-In or app account."}
                    </small>
                  </div>

                  {/* Deletion Request Scope */}
                  <div className="form-group">
                    <label htmlFor="deleteScopeSelect">
                      {isJa ? "削除の範囲 / 種類" : "Deletion Request Scope"}
                    </label>
                    <select
                      id="deleteScopeSelect"
                      name="request_type"
                      className="form-control"
                      value={form.requestType}
                      onChange={(e) => setForm({ ...form, requestType: e.target.value })}
                    >
                      <option value="Full Account & All Associated Data">
                        {isJa
                          ? "アカウント全体およびすべての保存データの完全消去（推奨）"
                          : "Delete Entire Account & All Associated Data (Permanent)"}
                      </option>
                      <option value="App Records Only">
                        {isJa
                          ? "アプリ内の保存記録・計算履歴のみを消去"
                          : "Delete Stored Records & History Only"}
                      </option>
                      <option value="Revoke Google Access">
                        {isJa
                          ? "Googleサインイン連携の解除とプロフィールの消去"
                          : "Revoke Google Sign-in Access & Purge Profile"}
                      </option>
                    </select>
                  </div>

                  {/* Additional Details */}
                  <div className="form-group">
                    <label htmlFor="deleteMessage">
                      {isJa ? "詳細・補足事項（任意）" : "Additional Details / Notes (Optional)"}
                    </label>
                    <textarea
                      id="deleteMessage"
                      name="message"
                      rows={3}
                      className="form-control"
                      placeholder={
                        isJa
                          ? "アカウント特定の参考情報（ユーザーIDや追加の連絡事項など）がございましたらご記入ください。"
                          : "Any additional details, user ID, or reasons to help us identify your records faster..."
                      }
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
                      padding: "0.75rem",
                      background: "var(--ic-bg-subtle)",
                      borderRadius: "var(--ic-radius-sm)",
                      border: "1px solid var(--ic-border)",
                    }}
                  >
                    <input
                      id="deleteConfirmCheckbox"
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
                      htmlFor="deleteConfirmCheckbox"
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        color: "var(--ic-text)",
                        cursor: "pointer",
                        lineHeight: 1.45,
                        margin: 0,
                      }}
                    >
                      {isJa
                        ? "選択したアプリのアカウントおよび関連データを完全に削除することを確認し、この操作が取り消せないことを理解します。"
                        : "I confirm that I want to permanently delete my account and associated data for the selected app. I understand that this action cannot be undone."}{" "}
                      <span className="required">*</span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="form-actions" style={{ marginTop: "0.5rem" }}>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={submitting}
                      style={{ minWidth: "220px" }}
                    >
                      {submitting
                        ? (isJa ? "送信中..." : "Submitting request...")
                        : (isJa ? "削除リクエストを送信する" : "Submit Deletion Request")}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>

        {faq.length > 0 ? <FaqAccordion locale={seo.locale} items={faq} /> : null}
      </Layout>
    </>
  );
}
