import { getLocale } from "next-intl/server";
import { getTours } from "@/lib/tours";
import { TripView } from "@/components/trip/TripView";
import type { SupportedLanguage } from "@/lib/validation";

export default async function TripPage() {
  const locale = (await getLocale()) as SupportedLanguage;
  const tours = await getTours(locale);

  return <TripView allTours={tours} />;
}
