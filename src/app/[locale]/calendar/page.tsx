import { getLocale } from "next-intl/server";
import { getTours } from "@/lib/tours";
import { TimelineCalendar } from "@/components/calendar/TimelineCalendar";
import type { SupportedLanguage } from "@/lib/validation";

interface CalendarPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const locale = (await getLocale()) as SupportedLanguage;
  const tours = await getTours(locale);
  const { date } = await searchParams;

  return <TimelineCalendar tours={tours} initialDate={date} />;
}
