"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { WeekNavigation } from "./WeekNavigation";
import { CalendarDayColumn } from "./CalendarDayColumn";
import { SelectionSummary } from "./SelectionSummary";
import { getScheduledToursForDay } from "@/lib/tour-schedule";
import type { Tour } from "@/lib/tours";

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const DAY_KEYS = [
  "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",
] as const;

interface WeeklyCalendarProps {
  tours: Tour[];
  initialDate?: string;
}

export function WeeklyCalendar({ tours, initialDate }: WeeklyCalendarProps) {
  const t = useTranslations("calendar");
  const today = useMemo(() => new Date(), []);

  // Parse initial date or use today
  const startDate = useMemo(() => {
    if (initialDate) {
      const parsed = new Date(initialDate);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return today;
  }, [initialDate, today]);

  const [weekStart, setWeekStart] = useState(() => getMonday(startDate));
  const [selectedDayIndex, setSelectedDayIndex] = useState(() => {
    const dayOfWeek = startDate.getDay();
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  });
  // Keys are "YYYY-MM-DD:slug" so each day's tour is independent
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [personCount, setPersonCount] = useState(1);

  const tourMap = useMemo(() => new Map(tours.map((t) => [t.slug, t])), [tours]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const scheduledByDay = useMemo(() => {
    return weekDays.map((date) =>
      getScheduledToursForDay(date.getDay(), date.getMonth() + 1, tours),
    );
  }, [weekDays, tours]);

  const handleToggle = useCallback((key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const selectedTours = useMemo(
    () =>
      Array.from(selectedKeys)
        .map((key) => {
          const slug = key.split(":")[1];
          return tourMap.get(slug);
        })
        .filter(Boolean) as Tour[],
    [selectedKeys, tourMap],
  );

  function handlePrevWeek() {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  }

  function handleNextWeek() {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  }

  function handleToday() {
    setWeekStart(getMonday(new Date()));
    const dayOfWeek = new Date().getDay();
    setSelectedDayIndex(dayOfWeek === 0 ? 6 : dayOfWeek - 1);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Page header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
          {t("pageTitle")}
        </h1>
        <p className="mt-2 text-lg text-slate-600">
          {t("pageSubtitle")}
        </p>
      </div>

      <WeekNavigation
        weekStart={weekStart}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onToday={handleToday}
      />

      {/* Desktop: 7 columns */}
      <div className="mt-6 hidden gap-2 md:grid md:grid-cols-7">
        {weekDays.map((date, i) => (
          <CalendarDayColumn
            key={date.toISOString()}
            date={date}
            scheduledTours={scheduledByDay[i]}
            isToday={isSameDay(date, today)}
            selectedKeys={selectedKeys}
            onToggle={handleToggle}
          />
        ))}
      </div>

      {/* Mobile: day tabs + single column */}
      <div className="mt-6 md:hidden">
        <div className="flex gap-1 overflow-x-auto pb-2">
          {weekDays.map((date, i) => (
            <button
              key={date.toISOString()}
              onClick={() => setSelectedDayIndex(i)}
              className={`flex shrink-0 flex-col items-center rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                i === selectedDayIndex
                  ? "bg-blue-600 text-white"
                  : isSameDay(date, today)
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>{t(`days.${DAY_KEYS[weekDays[i].getDay()]}Short`)}</span>
              <span className="mt-0.5 text-sm font-semibold">{date.getDate()}</span>
            </button>
          ))}
        </div>
        <div className="mt-3">
          <CalendarDayColumn
            date={weekDays[selectedDayIndex]}
            scheduledTours={scheduledByDay[selectedDayIndex]}
            isToday={isSameDay(weekDays[selectedDayIndex], today)}
            selectedKeys={selectedKeys}
            onToggle={handleToggle}
          />
        </div>
      </div>

      {/* Selection summary */}
      <SelectionSummary
        selectedTours={selectedTours}
        selectedKeys={selectedKeys}
        personCount={personCount}
        onPersonCountChange={setPersonCount}
        onClear={() => setSelectedKeys(new Set())}
      />
    </div>
  );
}
