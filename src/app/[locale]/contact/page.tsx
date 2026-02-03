import { useTranslations } from "next-intl";

export default function ContactPage() {
  const t = useTranslations("contact");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-4 text-3xl font-bold text-slate-900">{t("title")}</h1>
      <p className="mb-8 text-lg text-slate-600">{t("description")}</p>

      <div className="space-y-6">
        {/* Phone */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{t("phone")}</h2>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-slate-500">{t("phoneOnboard")}</p>
              <a href="tel:+4794791130" className="text-lg font-medium text-blue-700 hover:underline">
                (+47) 947 91 130
              </a>
            </div>
            <div>
              <p className="text-xs text-slate-500">{t("phoneGroup")}</p>
              <a href="tel:+4792163985" className="text-lg font-medium text-blue-700 hover:underline">
                (+47) 921 63 985
              </a>
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{t("email")}</h2>
          <a href="mailto:booking@norwegianfjordexplorer.com" className="text-lg font-medium text-blue-700 hover:underline">
            booking@norwegianfjordexplorer.com
          </a>
        </div>

        {/* Address */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{t("address")}</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500">{t("addressDock")}</p>
              <p className="text-slate-900">
                Fridtjof Nansens plass<br />
                9008 Tromsø
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">{t("addressOffice")}</p>
              <p className="text-slate-900">
                Norwegian Fjord Explorer Line AS<br />
                Strandgata 9<br />
                9008 Tromsø, Norway
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
