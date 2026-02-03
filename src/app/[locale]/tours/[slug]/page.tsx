import { getLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { notFound } from "next/navigation";
import { getTourBySlug } from "@/lib/tours";
import type { SupportedLanguage } from "@/lib/validation";
import type { Tour } from "@/lib/tours";

export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = (await getLocale()) as SupportedLanguage;
  const tour = await getTourBySlug(slug, locale);

  if (!tour) notFound();

  return <TourDetail tour={tour} />;
}

function TourDetail({ tour }: { tour: Tour }) {
  const t = useTranslations("tours");
  const tc = useTranslations("common");

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-6 aspect-[16/9] overflow-hidden rounded-xl bg-slate-200">
        {tour.image_url ? (
          <div
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${tour.image_url})` }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            {tour.name}
          </div>
        )}
      </div>

      <h1 className="mb-2 text-3xl font-bold text-slate-900">{tour.name}</h1>

      <div className="mb-6 flex flex-wrap gap-4 text-sm text-slate-600">
        <span>
          {t("duration")}: {tour.duration_hours} {tc("hours")}
        </span>
        <span>
          {t("difficulty")}: {tour.difficulty_level}
        </span>
        <span>
          {t("season")}: {tour.season.start}-{tour.season.end}
        </span>
        <span className="font-semibold text-blue-700">
          {tc("from")} {tour.price_from} NOK {tc("perPerson")}
        </span>
      </div>

      <p className="mb-8 text-lg text-slate-700">{tour.description}</p>

      {tour.highlights && tour.highlights.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-xl font-semibold text-slate-900">
            {t("highlights")}
          </h2>
          <ul className="list-inside list-disc space-y-1 text-slate-700">
            {tour.highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </div>
      )}

      {tour.included && tour.included.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-xl font-semibold text-slate-900">
            {t("included")}
          </h2>
          <ul className="list-inside list-disc space-y-1 text-slate-700">
            {tour.included.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {tour.meeting_point && (
        <div className="mb-8">
          <h2 className="mb-2 text-xl font-semibold text-slate-900">
            {t("meetingPoint")}
          </h2>
          <p className="text-slate-700">{tour.meeting_point}</p>
        </div>
      )}

      {tour.booking_url && (
        <a
          href={tour.booking_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-lg bg-blue-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-800"
        >
          {t("bookExternal")}
        </a>
      )}
    </div>
  );
}
