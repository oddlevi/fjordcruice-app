"use client";

import { useTranslations, useLocale } from "next-intl";
import type { Tour } from "@/lib/tours";
import {
  downloadICS,
  createEmptyPlan,
  type TripPlan,
  type PlannedTour,
} from "@/lib/trip-planner";

interface SelectionSummaryProps {
  selectedTours: Tour[];
  selectedKeys: Set<string>;
  personCount: number;
  onPersonCountChange: (count: number) => void;
  onClear: () => void;
}

export function SelectionSummary({
  selectedTours,
  selectedKeys,
  personCount,
  onPersonCountChange,
  onClear,
}: SelectionSummaryProps) {
  const t = useTranslations("calendar");
  const locale = useLocale();

  if (selectedTours.length === 0) return null;

  const subtotal = selectedTours.reduce((sum, tour) => sum + tour.price_from, 0);
  const total = subtotal * personCount;

  // Build trip plan from selections
  function buildTripPlan(): TripPlan {
    const plan = createEmptyPlan();
    plan.personCount = personCount;

    const plannedTours: PlannedTour[] = Array.from(selectedKeys).map((key) => {
      const [date, slug] = key.split(":");
      const tour = selectedTours.find((t) => t.slug === slug);
      return {
        tourSlug: slug,
        date,
        tourName: tour?.name || "",
        durationHours: tour?.duration_hours || 0,
        price: tour?.price_from || 0,
      };
    });

    plan.tours = plannedTours;

    // Set start and end dates
    const dates = plannedTours.map((t) => t.date).sort();
    if (dates.length > 0) {
      plan.startDate = dates[0];
      plan.endDate = dates[dates.length - 1];
    }

    return plan;
  }

  function handleExportCalendar() {
    const plan = buildTripPlan();
    downloadICS(plan);
  }

  function handleViewTrip() {
    // Save selection to localStorage for the trip page
    const tripSelection = {
      selectedKeys: Array.from(selectedKeys),
      personCount,
    };
    sessionStorage.setItem("arctic-expeditions-trip-selection", JSON.stringify(tripSelection));

    // Open trip page in new tab
    window.open(`/${locale}/trip`, "_blank");
  }

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-slate-900">
          {t("selectedTours")} ({selectedTours.length})
        </h3>
        <button
          onClick={onClear}
          className="text-xs font-medium text-slate-500 hover:text-slate-700"
        >
          {t("clearSelection")}
        </button>
      </div>

      <ul className="mt-3 space-y-1">
        {selectedTours.map((tour, i) => (
          <li key={`${tour.slug}-${i}`} className="flex items-center justify-between text-sm">
            <span className="text-slate-700">{tour.name}</span>
            <span className="text-slate-500">{tour.price_from} NOK</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-4">
        {/* Person count stepper */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700">
            {personCount === 1 ? t("person") : t("persons")}:
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPersonCountChange(Math.max(1, personCount - 1))}
              disabled={personCount <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40"
            >
              &minus;
            </button>
            <span className="w-8 text-center text-sm font-semibold text-slate-900">
              {personCount}
            </span>
            <button
              onClick={() => onPersonCountChange(personCount + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              +
            </button>
          </div>
        </div>

        {/* Total */}
        <div className="text-right">
          <div className="text-xs text-slate-500">
            {t("total")} ({personCount} {personCount === 1 ? t("person") : t("persons")})
          </div>
          <div className="text-lg font-bold text-blue-700">
            {total.toLocaleString()} NOK
          </div>
        </div>
      </div>

      {/* Main action button */}
      <div className="mt-4 border-t border-slate-200 pt-4">
        <button
          onClick={handleViewTrip}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-emerald-600 px-6 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-emerald-700 hover:shadow-xl"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {t("viewTripWithRecommendations")}
        </button>

        {/* Secondary action */}
        <button
          onClick={handleExportCalendar}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {t("exportCalendar")}
        </button>
      </div>
    </div>
  );
}
