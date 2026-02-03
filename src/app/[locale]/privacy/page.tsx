import { useTranslations } from "next-intl";

export default function PrivacyPage() {
  const t = useTranslations("privacy");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-4 text-3xl font-bold text-slate-900">{t("title")}</h1>
      <p className="mb-8 text-lg text-slate-600">{t("intro")}</p>

      <div className="prose prose-slate max-w-none">
        <h2>Data We Collect</h2>
        <p>
          We collect minimal data to provide our service. Our AI cruise advisor
          processes your preferences (trip duration, interests, budget, group type,
          fitness level, travel month) to generate personalized recommendations.
          This data is not stored after your session ends.
        </p>

        <h2>Cookies</h2>
        <p>
          We use only essential cookies for site functionality (language preference).
          Our analytics provider (Plausible Analytics) is cookie-free and does not
          track individual users.
        </p>

        <h2>AI Processing</h2>
        <p>
          Your preferences are sent to Anthropic&apos;s Claude API to generate
          recommendations. Anthropic does not use this data for training. No
          personal information (name, email, IP address) is sent to the AI.
        </p>

        <h2>Your Rights</h2>
        <p>
          Under GDPR, you have the right to access, correct, and delete your
          personal data. Since we do not store personal data beyond your browser
          session, there is typically no data to delete. For any privacy-related
          inquiries, contact us at privacy@fjordcruice.no.
        </p>

        <h2>Data Retention</h2>
        <p>
          AI session data (anonymized preferences, no personal identifiers) is
          retained for 30 days for analytics purposes. Server logs are retained
          for 30 days.
        </p>

        <h2>Third-Party Services</h2>
        <ul>
          <li>Anthropic (AI recommendations) - EU-adequate data processing</li>
          <li>Supabase (database) - GDPR-compliant hosting</li>
          <li>Vercel (hosting) - GDPR-compliant hosting</li>
          <li>Plausible Analytics (analytics) - Cookie-free, EU-hosted</li>
        </ul>
      </div>
    </div>
  );
}
