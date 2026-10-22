import { useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { localeHome } from "@/components/layout/Layout";

export default function ContactPage({ seo }: { seo: SeoRecord }) {
  const faq = extractFaq(seo);
  const isJa = seo.locale === "ja";
  const isRu = seo.locale === "ru";
  const isKo = seo.locale === "ko";

  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "general",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError(
        isJa
          ? "お名前、メールアドレス、メッセージを入力してください。"
          : isRu
          ? "Пожалуйста, заполните все обязательные поля."
          : isKo
          ? "이름, 이메일, 메시지를 모두 입력해주세요."
          : "Please fill in all required fields."
      );
      return;
    }
    setError("");
    setSubmitted(true);
  };

  return (
    <>
      <SeoHead seo={seo} />
      <Layout locale={seo.locale}>
        <section className="hero">
          <div className="container">
            <div className="hero-copy">
              <span className="eyebrow">
                {isJa ? "お問い合わせ" : isRu ? "Контакты" : isKo ? "고객 지원" : "Contact Us"}
              </span>
              <h1>
                {isJa
                  ? "お問い合わせ・サポート窓口"
                  : isRu
                  ? "Свяжитесь с командой InstaCalc"
                  : isKo
                  ? "인스타칼크 문의 및 피드백"
                  : "Get in Touch with InstaCalc"}
              </h1>
              <p>
                {isJa
                  ? "計算ツールの機能要望、計算式の不具合報告、提携・ご相談などお気軽にお問い合わせください。通常24〜48時間以内にご返答いたします。"
                  : isRu
                  ? "У вас есть предложение по калькуляторам, обнаружена ошибка в формулах или хотите сотрудничать? Наша команда разработчиков отвечает в течение 24–48 часов."
                  : isKo
                  ? "새로운 계산기 제안, 공식 오류 제보, 비즈니스 협업 문의 등 무엇이든 편하게 보내주세요. 24~48시간 이내에 성심껏 답변드립니다."
                  : "Have a calculator suggestion, discovered a math discrepancy, or want to collaborate? Reach out to our engineering team — we typically respond within 24 to 48 hours."}
              </p>
              <div className="hero-actions">
                <a className="btn btn-primary" href={localeHome(seo.locale)}>
                  {isJa
                    ? "すべての計算ツールを見る"
                    : isRu
                    ? "Смотреть все калькуляторы"
                    : isKo
                    ? "계산기 전체 목록"
                    : "Browse calculators"}
                </a>
                <a className="btn btn-ghost" href="mailto:support@instacalc.in">
                  support@instacalc.in
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="section contact-section">
          <div className="container contact-grid">
            {/* Contact Information Cards */}
            <div className="contact-info">
              <h2>
                {isJa ? "公式連絡先" : isRu ? "Прямые контакты" : isKo ? "공식 연락 채널" : "Direct Channels"}
              </h2>

              <div className="info-card">
                <div className="info-icon">✉️</div>
                <div>
                  <h3>
                    {isJa ? "サポート＆フィードバック" : isRu ? "Служба поддержки" : isKo ? "이메일 문의" : "Official Support Email"}
                  </h3>
                  <p>
                    <a href="mailto:support@instacalc.in" className="contact-link">
                      support@instacalc.in
                    </a>
                  </p>
                  <small>
                    {isJa
                      ? "機能要望・バグ報告・コラボレーション"
                      : isRu
                      ? "Предложения, баг-репорты, партнерство"
                      : isKo
                      ? "기능 제안, 버그 신고, 협업 문의"
                      : "Feature requests, bug reports, and partnerships"}
                  </small>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">🏢</div>
                <div>
                  <h3>
                    {isJa ? "運営拠点・所在地" : isRu ? "Офис и локация" : isKo ? "운영 본부" : "Registered Location & Address"}
                  </h3>
                  <p>
                    <strong>InstaCalc.in</strong>
                    <br />
                    Salvador do Mundo, Porvorim, North Goa 403501, India
                  </p>
                  <small>
                    {isJa
                      ? "グローバル展開：日本、米国、インド、韓国、欧州"
                      : isRu
                      ? "Обслуживаем пользователей в Индии, США, ЕС, Японии и СНГ"
                      : isKo
                      ? "한국, 미국, 일본, 인도 글로벌 서비스"
                      : "Official Operating Location · Contact: +91 7259472334"}
                  </small>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">⏱️</div>
                <div>
                  <h3>
                    {isJa ? "対応時間" : isRu ? "Время ответа" : isKo ? "답변 소요 시간" : "Response Time"}
                  </h3>
                  <p>
                    {isJa
                      ? "原則 24〜48時間以内"
                      : isRu
                      ? "В течение 24–48 часов"
                      : isKo
                      ? "24~48시간 이내 회신"
                      : "Within 24 to 48 hours"}
                  </p>
                  <small>
                    {isJa
                      ? "数理エンジニアが直接メールを確認・対応します"
                      : isRu
                      ? "Каждый запрос проверяется инженерами лично"
                      : isKo
                      ? "수학·금융 툴 엔지니어가 직접 확인합니다"
                      : "Directly reviewed by our quantitative tooling engineers"}
                  </small>
                </div>
              </div>
            </div>

            {/* Interactive Contact Form */}
            <div className="contact-form-card">
              <h2>
                {isJa ? "お問い合わせフォーム" : isRu ? "Форма обратной связи" : isKo ? "온라인 문의 접수" : "Send Us a Message"}
              </h2>

              {submitted ? (
                <div className="form-success" role="alert">
                  <div className="success-icon">✓</div>
                  <h3>
                    {isJa
                      ? "お問い合わせを受け付けました"
                      : isRu
                      ? "Сообщение успешно отправлено!"
                      : isKo
                      ? "문의가 정상적으로 접수되었습니다"
                      : "Message Sent Successfully!"}
                  </h3>
                  <p>
                    {isJa
                      ? `${form.name}様、ご連絡ありがとうございます。ご記入いただいたメールアドレス（${form.email}）宛てに、担当者より通常24〜48時間以内にご返答いたします。`
                      : isRu
                      ? `Спасибо, ${form.name}! Мы получили ваше обращение и ответим на ${form.email} в течение 24–48 часов.`
                      : isKo
                      ? `${form.name}님, 소중한 의견 감사합니다. 입력해주신 이메일(${form.email})로 24~48시간 이내에 답변드리겠습니다.`
                      : `Thank you, ${form.name}! Your inquiry has been received. Our team will review your message and reply to ${form.email} within 24 to 48 hours.`}
                  </p>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: "", email: "", category: "general", message: "" });
                    }}
                  >
                    {isJa
                      ? "別のメッセージを送信する"
                      : isRu
                      ? "Отправить еще одно сообщение"
                      : isKo
                      ? "새 문의 작성하기"
                      : "Send Another Message"}
                  </button>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit} noValidate>
                  {error ? (
                    <div className="form-error" role="alert">
                      {error}
                    </div>
                  ) : null}

                  <div className="form-group">
                    <label htmlFor="contactName">
                      {isJa ? "お名前" : isRu ? "Ваше имя" : isKo ? "이름 (성함)" : "Your Name"}{" "}
                      <span className="required">*</span>
                    </label>
                    <input
                      id="contactName"
                      type="text"
                      className="form-control"
                      placeholder={isJa ? "山田 太郎" : isRu ? "Иван Иванов" : isKo ? "홍길동" : "e.g. John Doe"}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contactEmail">
                      {isJa ? "メールアドレス" : isRu ? "Электронная почта" : isKo ? "이메일 주소" : "Your Email"}{" "}
                      <span className="required">*</span>
                    </label>
                    <input
                      id="contactEmail"
                      type="email"
                      className="form-control"
                      placeholder="name@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contactCategory">
                      {isJa ? "お問い合わせ項目" : isRu ? "Тема обращения" : isKo ? "문의 유형" : "Inquiry Topic"}
                    </label>
                    <select
                      id="contactCategory"
                      className="form-control"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      <option value="feedback">
                        {isJa
                          ? "計算ツールの提案・改善要望"
                          : isRu
                          ? "Идея нового калькулятора"
                          : isKo
                          ? "신규 계산기 기능 제안"
                          : "Calculator Suggestion / Feature Request"}
                      </option>
                      <option value="bug">
                        {isJa
                          ? "計算結果の不具合・計算式の報告"
                          : isRu
                          ? "Ошибка в расчетах или формуле"
                          : isKo
                          ? "계산 오류 및 공식 수정 제보"
                          : "Bug Report / Math Discrepancy"}
                      </option>
                      <option value="business">
                        {isJa
                          ? "広告・業務提携・取材"
                          : isRu
                          ? "Партнерство и реклама"
                          : isKo
                          ? "광고 및 비즈니스 제휴"
                          : "Partnership & Business Inquiries"}
                      </option>
                      <option value="general">
                        {isJa ? "一般的なお問い合わせ" : isRu ? "Общий вопрос" : isKo ? "일반 문의" : "General Question"}
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="contactMessage">
                      {isJa ? "メッセージ内容" : isRu ? "Текст сообщения" : isKo ? "문의 내용" : "Message"}{" "}
                      <span className="required">*</span>
                    </label>
                    <textarea
                      id="contactMessage"
                      rows={5}
                      className="form-control"
                      placeholder={
                        isJa
                          ? "ご意見・ご要望の詳細をご記入ください。"
                          : isRu
                          ? "Опишите ваш вопрос или подробности ошибки..."
                          : isKo
                          ? "문의하실 내용을 상세히 적어주세요."
                          : "Please describe your question, feedback, or calculator feature suggestion..."
                      }
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      {isJa ? "送信する" : isRu ? "Отправить сообщение" : isKo ? "문의 보내기" : "Send Message"}
                    </button>
                    <a
                      href={`mailto:support@instacalc.in?subject=${encodeURIComponent(
                        `[InstaCalc Inquiry] ${form.category}`
                      )}&body=${encodeURIComponent(form.message)}`}
                      className="btn btn-ghost"
                    >
                      {isJa ? "メールソフトで直接送信" : isRu ? "Открыть в почтовом клиенте" : isKo ? "이메일 앱으로 직접 열기" : "Send via Email App"}
                    </a>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>

        <FaqAccordion locale={seo.locale} items={faq} />
      </Layout>
    </>
  );
}
