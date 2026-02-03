import { getLocale } from "next-intl/server";
import { getTours } from "@/lib/tours";
import { WeeklyCalendar } from "@/components/calendar/WeeklyCalendar";
import type { SupportedLanguage } from "@/lib/validation";

export default async function CalendarPage() {
  const locale = (await getLocale()) as SupportedLanguage;
  const tours = await getTours(locale);

  return <WeeklyCalendar tours={tours} />;
}
