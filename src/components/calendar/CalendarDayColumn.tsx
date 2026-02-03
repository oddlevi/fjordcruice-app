"use client";

import { useTranslations } from "next-intl";
import { CalendarTourBlock } from "./CalendarTourBlock";
import type { ScheduledTour } from "@/lib/tour-schedule";

interface CalendarDayColumnProps {
  date: Date;
  scheduledTours: ScheduledTour[];
  isToday: boolean;
  selectedKeys: Set<string>;
  onToggle: (key: string) => void;
}

const DAY_KEYS = [
  "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",
] as const;

export function CalendarDayColumn({ date, scheduledTours, isToday, selectedKeys, onToggle }: CalendarDayColumnProps) {
  const t = useTranslations("calendar");

  return (
    <div
      className={`flex flex-col rounded-lg border ${
        isToday ? "border-blue-300 bg-blue-50/50" : "border-slate-200 bg-white"
      }`}
    >
      <div className="border-b border-slate-200 px-3 py-2 text-center">
        <div className="text-xs font-medium uppercase text-slate-500">
          {t(`days.${DAY_KEYS[date.getDay()]}`)}
        </div>
        <div
          className={`mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
            isToday
              ? "bg-blue-600 text-white"
              : "text-slate-900"
          }`}
        >
          {date.getDate()}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-2">
        {scheduledTours.length === 0 ? (
          <p className="py-4 text-center text-xs text-slate-400">
            {t("noTours")}
          </p>
        ) : (
          scheduledTours.map((s) => (
            <CalendarTourBlock
              key={s.tour.slug}
              scheduled={s}
              selectionKey={`${date.toISOString().slice(0, 10)}:${s.tour.slug}`}
              selected={selectedKeys.has(`${date.toISOString().slice(0, 10)}:${s.tour.slug}`)}
              onToggle={onToggle}
            />
          ))
        )}
      </div>
    </div>
  );
}
