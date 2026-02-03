import { useTranslations } from "next-intl";

export default function ContactPage() {
  const t = useTranslations("contact");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-4 text-3xl font-bold text-slate-900">{t("title")}</h1>
      <p className="mb-8 text-lg text-slate-600">{t("description")}</p>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <div>
          <h2 className="text-sm font-medium text-slate-500">{t("email")}</h2>
          <p className="text-slate-900">info@fjordcruice.no</p>
        </div>
        <div>
          <h2 className="text-sm font-medium text-slate-500">{t("phone")}</h2>
          <p className="text-slate-900">+47 123 45 678</p>
        </div>
        <div>
          <h2 className="text-sm font-medium text-slate-500">{t("address")}</h2>
          <p className="text-slate-900">
            Norwegian Fjordcruice AS
            <br />
            Bryggen 1
            <br />
            5003 Bergen, Norway
          </p>
        </div>
      </div>
    </div>
  );
}
