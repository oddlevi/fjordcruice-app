import { getLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { getTours } from "@/lib/tours";
import { TourCard } from "@/components/TourCard";
import type { SupportedLanguage } from "@/lib/validation";

export default async function ToursPage() {
  const locale = (await getLocale()) as SupportedLanguage;
  const tours = await getTours(locale);

  return <ToursContent tours={tours} />;
}

function ToursContent({ tours }: { tours: Awaited<ReturnType<typeof getTours>> }) {
  const t = useTranslations("tours");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">{t("title")}</h1>
        <p className="text-lg text-slate-600">{t("subtitle")}</p>
      </div>
      {tours.length === 0 ? (
        <p className="text-center text-slate-500">{t("noResults")}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      )}
    </div>
  );
}
