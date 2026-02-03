"use client";

import { useTranslations } from "next-intl";
import type { Tour } from "@/lib/tours";

interface SelectionSummaryProps {
  selectedTours: Tour[];
  personCount: number;
  onPersonCountChange: (count: number) => void;
  onClear: () => void;
}

export function SelectionSummary({
  selectedTours,
  personCount,
  onPersonCountChange,
  onClear,
}: SelectionSummaryProps) {
  const t = useTranslations("calendar");

  if (selectedTours.length === 0) return null;

  const subtotal = selectedTours.reduce((sum, tour) => sum + tour.price_from, 0);
  const total = subtotal * personCount;

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
    </div>
  );
}
