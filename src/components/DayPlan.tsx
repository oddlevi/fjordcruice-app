"use client";

import { useTranslations } from "next-intl";

export interface PlanTour {
  time: string;
  slug: string;
  name: string;
  description: string;
  image_url: string | null;
  duration_hours: number;
  price_from: number;
  difficulty_level: string;
  meeting_point: string;
  highlights: string[];
  included: string[];
  booking_url: string | null;
  categories: string[];
}

export interface DayPlanData {
  type: "plan";
  month: number;
  tours: PlanTour[];
}

const monthKeys = [
  "", "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

export function DayPlan({
  plan,
  onStartOver,
}: {
  plan: DayPlanData;
  onStartOver: () => void;
}) {
  const t = useTranslations("dayPlan");
  const tc = useTranslations("common");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <p className="mb-1 text-sm font-medium uppercase tracking-wider text-blue-600">
          {t("yourPlan")}
        </p>
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          {t("title", { month: t(`months.${monthKeys[plan.month]}`) })}
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-slate-500">
          {t("subtitle")}
        </p>
      </div>

      {/* Timeline */}
      <div className="relative space-y-6 pl-8 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-2rem)] before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:to-blue-200 sm:pl-10 before:sm:left-[15px]">
        {plan.tours.map((tour, i) => (
          <div key={tour.slug} className="relative">
            {/* Timeline dot */}
            <div className="absolute -left-8 top-6 flex h-5 w-5 items-center justify-center rounded-full border-2 border-blue-500 bg-white sm:-left-10 sm:h-7 sm:w-7">
              <span className="text-[10px] font-bold text-blue-600 sm:text-xs">{i + 1}</span>
            </div>

            {/* Tour card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
              {/* Image + time badge */}
              <div className="relative aspect-[21/9] overflow-hidden bg-slate-200 sm:aspect-[3/1]">
                {tour.image_url ? (
                  <div
                    className="h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${tour.image_url})` }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50 text-blue-300">
                    <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                    </svg>
                  </div>
                )}
                {/* Dark overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                {/* Time badge */}
                <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur-sm">
                  {tour.time}
                </div>
                {/* Tour name on image */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white drop-shadow-lg sm:text-2xl">
                    {tour.name}
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 sm:p-6">
                {/* Quick stats */}
                <div className="mb-4 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {tour.duration_hours}h
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                    </svg>
                    {tc("from")} {tour.price_from} NOK
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    {tour.meeting_point}
                  </span>
                </div>

                {/* Description */}
                <p className="mb-4 leading-relaxed text-slate-600">{tour.description}</p>

                {/* Highlights */}
                {tour.highlights.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {tour.highlights.map((h, hi) => (
                        <span
                          key={hi}
                          className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Included */}
                {tour.included.length > 0 && (
                  <div className="mb-5">
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {t("included")}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {tour.included.map((item, ii) => (
                        <span key={ii} className="flex items-center gap-1 text-sm text-slate-600">
                          <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Book button */}
                {tour.booking_url && (
                  <a
                    href={tour.booking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    {t("bookTour")}
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tip card */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex gap-3">
          <span className="text-xl">💡</span>
          <div>
            <p className="mb-1 text-sm font-semibold text-amber-900">{t("tipTitle")}</p>
            <p className="text-sm leading-relaxed text-amber-800">{t("tipText")}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={onStartOver}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          {t("changePreferences")}
        </button>
      </div>
    </div>
  );
}
