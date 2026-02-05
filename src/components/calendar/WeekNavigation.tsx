"use client";

import { useTranslations, useLocale } from "next-intl";

interface WeekNavigationProps {
  weekStart: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
}

// Map app locale to BCP 47 locale for date formatting
function getDateLocale(appLocale: string): string {
  const localeMap: Record<string, string> = {
    en: "en-GB",
    de: "de-DE",
    fr: "fr-FR",
    es: "es-ES",
  };
  return localeMap[appLocale] || "en-GB";
}

function formatDateShort(date: Date, locale: string): string {
  const dateLocale = getDateLocale(locale);
  return date.toLocaleDateString(dateLocale, {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

export function WeekNavigation({ weekStart, onPrevWeek, onNextWeek, onToday }: WeekNavigationProps) {
  const t = useTranslations("calendar");
  const locale = useLocale();

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
      <div className="flex items-center gap-2">
        <button
          onClick={onPrevWeek}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          aria-label={t("prevWeek")}
        >
          &larr;
        </button>
        <span className="min-w-[180px] text-center text-sm font-medium text-slate-700">
          {formatDateShort(weekStart, locale)} – {formatDateShort(weekEnd, locale)}
        </span>
        <button
          onClick={onNextWeek}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          aria-label={t("nextWeek")}
        >
          &rarr;
        </button>
        <button
          onClick={onToday}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          {t("today")}
        </button>
      </div>
    </div>
  );
}
