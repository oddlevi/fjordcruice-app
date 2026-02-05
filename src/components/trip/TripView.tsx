"use client";

import { useEffect, useState, useMemo } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import type { Tour } from "@/lib/tours";
import {
  downloadPDF,
  downloadICS,
  calculateTripStats,
  type TripPlan,
} from "@/lib/trip-planner";
import {
  getMixedRecommendations,
  getInterestLabel,
  type Activity,
  type InterestCategory,
} from "@/lib/tromso-activities";
import { getScheduledToursForDay, computeEndTime } from "@/lib/tour-schedule";

interface TripViewProps {
  allTours: Tour[];
}

interface StoredTripData {
  selectedKeys: string[];
  personCount: number;
  interests?: string[];
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

// Parse date string (YYYY-MM-DD) as local date, not UTC
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// Format time for display
function formatTime(time: string): string {
  return time;
}

// Get day name
function getDayName(date: Date, locale: string): string {
  return date.toLocaleDateString(getDateLocale(locale), { weekday: "long" });
}

// Format date
function formatDate(date: Date, locale: string): string {
  return date.toLocaleDateString(getDateLocale(locale), {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function TripView({ allTours }: TripViewProps) {
  const locale = useLocale();
  const [tripData, setTripData] = useState<StoredTripData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load trip data from sessionStorage (valid hydration pattern)
  useEffect(() => {
    const stored = sessionStorage.getItem("arctic-expeditions-trip-selection");
    if (stored) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTripData(JSON.parse(stored));
      } catch {
        setTripData(null);
      }
    }
    setIsLoading(false);
  }, []);

  // Build tour map
  const tourMap = useMemo(() => new Map(allTours.map((t) => [t.slug, t])), [allTours]);

  // Parse selected tours with dates and times
  const selectedTours = useMemo(() => {
    if (!tripData) return [];

    return tripData.selectedKeys
      .map((key) => {
        const [dateStr, slug] = key.split(":");
        const tour = tourMap.get(slug);
        if (!tour) return null;

        const date = parseLocalDate(dateStr);
        const scheduledTours = getScheduledToursForDay(
          date.getDay(),
          date.getMonth() + 1,
          allTours
        );
        const scheduled = scheduledTours.find((s) => s.tour.slug === slug);

        return {
          date,
          dateStr,
          tour,
          departureTime: scheduled?.departureTime || "09:00",
          endTime: scheduled?.endTime || computeEndTime("09:00", tour.duration_hours),
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (!a || !b) return 0;
        const dateCompare = a.dateStr.localeCompare(b.dateStr);
        if (dateCompare !== 0) return dateCompare;
        return a.departureTime.localeCompare(b.departureTime);
      }) as Array<{
        date: Date;
        dateStr: string;
        tour: Tour;
        departureTime: string;
        endTime: string;
      }>;
  }, [tripData, tourMap, allTours]);

  // Group tours by date
  const toursByDate = useMemo(() => {
    const grouped = new Map<string, typeof selectedTours>();
    for (const item of selectedTours) {
      const existing = grouped.get(item.dateStr) || [];
      existing.push(item);
      grouped.set(item.dateStr, existing);
    }
    return grouped;
  }, [selectedTours]);

  // Build trip plan for PDF (use stable ID based on content)
  const tripPlan: TripPlan | null = useMemo(() => {
    if (!tripData || selectedTours.length === 0) return null;

    const dates = selectedTours.map((t) => t.dateStr).sort();
    const stableId = `trip-${dates.join("-")}-${tripData.personCount}`;
    return {
      id: stableId,
      createdAt: dates[0],
      updatedAt: dates[0],
      startDate: dates[0],
      endDate: dates[dates.length - 1],
      personCount: tripData.personCount,
      tours: selectedTours.map((t) => ({
        tourSlug: t.tour.slug,
        date: t.dateStr,
        tourName: t.tour.name,
        durationHours: t.tour.duration_hours,
        price: t.tour.price_from,
      })),
    };
  }, [tripData, selectedTours]);

  const stats = tripPlan ? calculateTripStats(tripPlan) : null;

  // Get activity recommendations based on user interests
  const userInterests = (tripData?.interests || []) as InterestCategory[];

  function handleDownloadPDF() {
    if (!tripPlan) return;
    downloadPDF(tripPlan, tourMap);
  }

  function handleDownloadICS() {
    if (!tripPlan) return;
    downloadICS(tripPlan);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 flex justify-center space-x-1.5">
            <span className="inline-block h-3 w-3 animate-bounce rounded-full bg-blue-600 [animation-delay:0ms]" />
            <span className="inline-block h-3 w-3 animate-bounce rounded-full bg-blue-500 [animation-delay:150ms]" />
            <span className="inline-block h-3 w-3 animate-bounce rounded-full bg-blue-400 [animation-delay:300ms]" />
          </div>
          <p className="text-slate-600">Loading your trip...</p>
        </div>
      </div>
    );
  }

  if (!tripData || selectedTours.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">No Trip Selected</h1>
          <p className="mt-2 text-slate-600">
            Please go to the calendar and select some tours first.
          </p>
          <Link
            href="/calendar"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
          >
            Go to Calendar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-4 py-12 text-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold md:text-4xl">Your Tromsø Adventure</h1>
          <p className="mt-2 text-blue-200">
            {formatDate(selectedTours[0].date, locale)}
            {tripPlan && tripPlan.startDate !== tripPlan.endDate && (
              <> – {formatDate(new Date(tripPlan.endDate), locale)}</>
            )}
          </p>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
              <div className="text-3xl font-bold">{tripData.personCount}</div>
              <div className="text-sm text-blue-200">
                {tripData.personCount === 1 ? "Traveler" : "Travelers"}
              </div>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
              <div className="text-3xl font-bold">{stats?.tourCount || 0}</div>
              <div className="text-sm text-blue-200">Tours</div>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
              <div className="text-2xl font-bold">
                {stats?.totalPriceWithPersons.toLocaleString()} <span className="text-lg">NOK</span>
              </div>
              <div className="text-sm text-blue-200">Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Action Buttons */}
        <div className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-emerald-700 hover:shadow-xl"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </button>
          <button
            onClick={handleDownloadICS}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 transition-all hover:bg-slate-50"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Add to Calendar
          </button>
          <Link
            href="/calendar"
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 transition-all hover:bg-slate-50"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Edit Selection
          </Link>
        </div>

        {/* Timeline */}
        <div className="space-y-8">
          {Array.from(toursByDate.entries()).map(([dateStr, dayTours], dayIndex) => {
            const date = parseLocalDate(dateStr);

            return (
              <div key={dateStr} className="relative">
                {/* Day Header */}
                <div className="sticky top-0 z-10 -mx-4 bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white">
                      <span className="text-lg font-bold">{dayIndex + 1}</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{getDayName(date, locale)}</h2>
                      <p className="text-sm text-slate-500">{formatDate(date, locale)}</p>
                    </div>
                  </div>
                </div>

                {/* Tours for this day */}
                <div className="mt-4 space-y-4">
                  {dayTours.map((item, tourIndex) => (
                    <div key={`${item.dateStr}-${item.tour.slug}`}>
                      {/* Tour Card */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        {/* Time Badge - inline */}
                        <div className="mb-3 flex items-center gap-3">
                          <div className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-bold text-white shadow-md">
                            {formatTime(item.departureTime)}
                          </div>
                          <div className="h-px flex-1 bg-slate-200"></div>
                        </div>

                        <div>
                          {/* Tour Header */}
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-bold text-slate-900">
                                {item.tour.name}
                              </h3>
                              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                                <span className="flex items-center gap-1">
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {item.departureTime} – {item.endTime}
                                </span>
                                <span className="flex items-center gap-1">
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {item.tour.duration_hours}h duration
                                </span>
                                <span className="font-medium text-emerald-600">
                                  {item.tour.price_from} NOK/person
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          {item.tour.description && (
                            <p className="mt-3 text-sm text-slate-600">
                              {item.tour.description}
                            </p>
                          )}

                          {/* Highlights */}
                          {item.tour.highlights && item.tour.highlights.length > 0 && (
                            <div className="mt-3">
                              <div className="flex flex-wrap gap-2">
                                {item.tour.highlights.slice(0, 4).map((highlight, i) => (
                                  <span
                                    key={i}
                                    className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                                  >
                                    {highlight}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Meeting Point */}
                          {item.tour.meeting_point && (
                            <div className="mt-3 flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-sm">
                              <svg className="h-5 w-5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <div>
                                <div className="font-medium text-slate-700">Meeting Point</div>
                                <div className="text-slate-500">{item.tour.meeting_point}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Activity Recommendations Between Tours */}
                      {tourIndex < dayTours.length - 1 && (
                        <ActivityRecommendationSection
                          endTime={item.endTime}
                          nextStartTime={dayTours[tourIndex + 1].departureTime}
                          userInterests={userInterests}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* End of Day Recommendations */}
                <EndOfDayRecommendations
                  lastTourEndTime={dayTours[dayTours.length - 1].endTime}
                  userInterests={userInterests}
                />
              </div>
            );
          })}
        </div>

        {/* Summary Footer */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold">Ready to book?</h3>
              <p className="text-blue-100">
                Total for {tripData.personCount} {tripData.personCount === 1 ? "person" : "people"}:{" "}
                <span className="text-2xl font-bold">{stats?.totalPriceWithPersons.toLocaleString()} NOK</span>
              </p>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="rounded-xl bg-white px-6 py-3 font-semibold text-blue-600 shadow-lg transition-all hover:bg-blue-50"
            >
              Download Trip Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component for activity recommendations between tours
function ActivityRecommendationSection({
  endTime,
  nextStartTime,
  userInterests,
}: {
  endTime: string;
  nextStartTime: string;
  userInterests: InterestCategory[];
}) {
  // Calculate gap in minutes
  const [endH, endM] = endTime.split(":").map(Number);
  const [startH, startM] = nextStartTime.split(":").map(Number);
  const gapMinutes = (startH * 60 + startM) - (endH * 60 + endM);

  if (gapMinutes < 30) return null;

  const recommendations = getMixedRecommendations(gapMinutes, 3, userInterests);

  if (recommendations.length === 0) return null;

  return (
    <div className="my-4 ml-6 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="rounded-full bg-amber-200 px-3 py-1 text-xs font-bold text-amber-800">
          {endTime} – {nextStartTime}
        </div>
        <span className="text-sm font-medium text-amber-700">
          {Math.floor(gapMinutes / 60)}h {gapMinutes % 60}min free time
        </span>
      </div>
      <h4 className="mb-2 text-sm font-bold text-amber-900">Things to do nearby:</h4>
      <div className="grid gap-2 md:grid-cols-3">
        {recommendations.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  );
}

// Component for end of day recommendations
function EndOfDayRecommendations({
  lastTourEndTime,
  userInterests,
}: {
  lastTourEndTime: string;
  userInterests: InterestCategory[];
}) {
  const [endH] = lastTourEndTime.split(":").map(Number);

  // If tour ends after 20:00, show evening recommendations
  if (endH >= 20) return null;

  // Calculate time until evening (assume 22:00)
  const gapMinutes = (22 * 60) - (endH * 60);
  const recommendations = getMixedRecommendations(Math.min(gapMinutes, 180), 3, userInterests);

  if (recommendations.length === 0) return null;

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h4 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </span>
        More to explore after your tours
      </h4>
      <div className="grid gap-3 md:grid-cols-3">
        {recommendations.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  );
}

// Activity card component
function ActivityCard({ activity }: { activity: Activity }) {
  const typeColors: Record<string, string> = {
    cafe: "bg-orange-100 text-orange-700",
    museum: "bg-purple-100 text-purple-700",
    attraction: "bg-blue-100 text-blue-700",
    walk: "bg-green-100 text-green-700",
    shopping: "bg-pink-100 text-pink-700",
    viewpoint: "bg-cyan-100 text-cyan-700",
    indoor: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[activity.type]}`}>
          {activity.type}
        </span>
        <span className="text-xs text-slate-400">{activity.durationMinutes} min</span>
      </div>
      <h5 className="mt-2 font-medium text-slate-900">{activity.name}</h5>
      <p className="mt-1 text-xs text-slate-500">{activity.description}</p>
      <p className="mt-1 text-xs text-slate-400">{activity.location}</p>
      {activity.interests.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {activity.interests.slice(0, 2).map((interest) => (
            <span key={interest} className="text-[10px] text-slate-400">
              {getInterestLabel(interest)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
