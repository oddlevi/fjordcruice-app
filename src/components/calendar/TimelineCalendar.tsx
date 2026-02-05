"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { WeekNavigation } from "./WeekNavigation";
import { SelectionSummary } from "./SelectionSummary";
import { getScheduledToursForDay, type ScheduledTour } from "@/lib/tour-schedule";
import { Link } from "@/i18n/routing";
import type { Tour } from "@/lib/tours";

// Time slots from 08:00 to 23:00
const TIME_SLOTS = Array.from({ length: 16 }, (_, i) => {
  const hour = i + 8;
  return `${String(hour).padStart(2, "0")}:00`;
});

const SLOT_HEIGHT = 60; // pixels per hour
const START_HOUR = 8;

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

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function getTopPosition(time: string): number {
  const minutes = timeToMinutes(time);
  const startMinutes = START_HOUR * 60;
  return ((minutes - startMinutes) / 60) * SLOT_HEIGHT;
}

function getBlockHeight(startTime: string, endTime: string): number {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const durationHours = (endMinutes - startMinutes) / 60;
  return Math.max(durationHours * SLOT_HEIGHT, 40); // minimum 40px
}

function getTimeOfDayColor(time: string): string {
  const hour = parseInt(time.split(":")[0], 10);
  if (hour < 12) return "bg-amber-50 border-amber-300";
  if (hour < 17) return "bg-blue-50 border-blue-300";
  return "bg-indigo-50 border-indigo-300";
}

// Format date as YYYY-MM-DD in local timezone (not UTC)
function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

interface TimelineCalendarProps {
  tours: Tour[];
  initialDate?: string;
}

export function TimelineCalendar({ tours, initialDate }: TimelineCalendarProps) {
  const t = useTranslations("calendar");
  const today = useMemo(() => new Date(), []);

  const startDate = useMemo(() => {
    if (initialDate) {
      // Parse as local date (YYYY-MM-DD) to avoid timezone issues
      const [year, month, day] = initialDate.split("-").map(Number);
      if (year && month && day) {
        return new Date(year, month - 1, day);
      }
    }
    return today;
  }, [initialDate, today]);

  const [weekStart, setWeekStart] = useState(() => getMonday(startDate));
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [personCount, setPersonCount] = useState(1);

  // Load saved selection from sessionStorage on mount
  // This is a valid use of setState in effect - restoring persisted state after hydration
  useEffect(() => {
    // If initialDate is provided (from preference form), clear old selections and use the new date
    if (initialDate) {
      sessionStorage.removeItem("arctic-expeditions-trip-selection");
      return;
    }

    // Otherwise, try to restore from sessionStorage
    const stored = sessionStorage.getItem("arctic-expeditions-trip-selection");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.selectedKeys && Array.isArray(data.selectedKeys)) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setSelectedKeys(new Set(data.selectedKeys));

          // Navigate to the week of the first selected date
          const dates = data.selectedKeys
            .map((key: string) => key.split(":")[0])
            .sort();
          if (dates.length > 0) {
            const [year, month, day] = dates[0].split("-").map(Number);
            const firstDate = new Date(year, month - 1, day);
            setWeekStart(getMonday(firstDate));
          }
        }
        if (data.personCount) {
          setPersonCount(data.personCount);
        }
      } catch {
        // Ignore parse errors
      }
    }
  }, [initialDate]);

  // Save selection to localStorage whenever it changes
  useEffect(() => {
    if (selectedKeys.size > 0) {
      const tripSelection = {
        selectedKeys: Array.from(selectedKeys),
        personCount,
      };
      sessionStorage.setItem("arctic-expeditions-trip-selection", JSON.stringify(tripSelection));
    }
  }, [selectedKeys, personCount]);

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
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
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

      {/* Desktop Timeline View */}
      <div className="mt-6 hidden overflow-x-auto md:block">
        <div className="min-w-[900px]">
          {/* Header row with day names */}
          <div className="flex border-b border-slate-200">
            <div className="w-16 shrink-0" /> {/* Time column header */}
            {weekDays.map((date) => (
              <div
                key={date.toISOString()}
                className={`flex-1 border-l border-slate-200 px-2 py-3 text-center ${
                  isSameDay(date, today) ? "bg-blue-50" : ""
                }`}
              >
                <div className="text-xs font-medium uppercase text-slate-500">
                  {t(`days.${DAY_KEYS[date.getDay()]}Short`)}
                </div>
                <div
                  className={`mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                    isSameDay(date, today)
                      ? "bg-blue-600 text-white"
                      : "text-slate-900"
                  }`}
                >
                  {date.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Timeline grid */}
          <div className="relative flex">
            {/* Time labels column */}
            <div className="w-16 shrink-0 border-r border-slate-200">
              {TIME_SLOTS.map((time) => (
                <div
                  key={time}
                  className="relative border-b border-slate-100"
                  style={{ height: SLOT_HEIGHT }}
                >
                  <span className="absolute -top-2.5 right-2 text-xs font-medium text-slate-400">
                    {time}
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((date, dayIndex) => (
              <div
                key={date.toISOString()}
                className={`relative flex-1 border-l border-slate-200 ${
                  isSameDay(date, today) ? "bg-blue-50/30" : ""
                }`}
              >
                {/* Hour grid lines */}
                {TIME_SLOTS.map((time) => (
                  <div
                    key={time}
                    className="border-b border-slate-100"
                    style={{ height: SLOT_HEIGHT }}
                  />
                ))}

                {/* Tour blocks positioned absolutely */}
                {scheduledByDay[dayIndex].map((scheduled) => {
                  const selectionKey = `${formatDateKey(date)}:${scheduled.tour.slug}`;
                  const selected = selectedKeys.has(selectionKey);
                  const top = getTopPosition(scheduled.departureTime);
                  const height = getBlockHeight(scheduled.departureTime, scheduled.endTime);

                  return (
                    <div
                      key={scheduled.tour.slug}
                      className={`absolute left-1 right-1 overflow-hidden rounded-md border-2 p-1.5 transition-all ${
                        selected
                          ? "border-blue-500 bg-blue-100 shadow-md ring-2 ring-blue-200"
                          : getTimeOfDayColor(scheduled.departureTime)
                      }`}
                      style={{ top, height }}
                    >
                      <div className="flex h-full flex-col">
                        <div className="flex items-start gap-1.5">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => handleToggle(selectionKey)}
                            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 text-blue-600"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] font-semibold text-slate-600">
                              {scheduled.departureTime}–{scheduled.endTime}
                            </div>
                            <Link
                              href={`/tours/${scheduled.tour.slug}`}
                              className="block"
                            >
                              <h4 className="line-clamp-2 text-xs font-medium leading-tight text-slate-900 hover:text-blue-700">
                                {scheduled.tour.name}
                              </h4>
                            </Link>
                          </div>
                        </div>
                        {height > 60 && (
                          <div className="mt-auto text-[10px] text-slate-500">
                            {scheduled.tour.price_from} NOK
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: Simplified list view */}
      <div className="mt-6 md:hidden">
        <div className="flex gap-1 overflow-x-auto pb-2">
          {weekDays.map((date) => (
            <MobileDayButton
              key={date.toISOString()}
              date={date}
              isToday={isSameDay(date, today)}
              isSelected={false}
              dayKey={DAY_KEYS[date.getDay()]}
              onClick={() => {}}
              t={t}
            />
          ))}
        </div>
        <div className="mt-4 space-y-2">
          {scheduledByDay.flat().length === 0 ? (
            <p className="py-8 text-center text-slate-500">{t("noTours")}</p>
          ) : (
            weekDays.map((date, dayIndex) => {
              const dayTours = scheduledByDay[dayIndex];
              if (dayTours.length === 0) return null;

              return (
                <div key={date.toISOString()} className="mb-4">
                  <h3 className="mb-2 text-sm font-semibold text-slate-700">
                    {t(`days.${DAY_KEYS[date.getDay()]}`)} {date.getDate()}
                  </h3>
                  <div className="space-y-2">
                    {dayTours.map((scheduled) => {
                      const selectionKey = `${formatDateKey(date)}:${scheduled.tour.slug}`;
                      const selected = selectedKeys.has(selectionKey);

                      return (
                        <MobileTourCard
                          key={scheduled.tour.slug}
                          scheduled={scheduled}
                          selected={selected}
                          onToggle={() => handleToggle(selectionKey)}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
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

function MobileDayButton({
  date,
  isToday,
  isSelected,
  dayKey,
  onClick,
  t,
}: {
  date: Date;
  isToday: boolean;
  isSelected: boolean;
  dayKey: string;
  onClick: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 flex-col items-center rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
        isSelected
          ? "bg-blue-600 text-white"
          : isToday
            ? "bg-blue-100 text-blue-700"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      <span>{t(`days.${dayKey}Short`)}</span>
      <span className="mt-0.5 text-sm font-semibold">{date.getDate()}</span>
    </button>
  );
}

function MobileTourCard({
  scheduled,
  selected,
  onToggle,
}: {
  scheduled: ScheduledTour;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border-2 p-3 transition-all ${
        selected
          ? "border-blue-500 bg-blue-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
        className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 text-blue-600"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
          <span>{scheduled.departureTime}</span>
          <span className="text-slate-400">–</span>
          <span>{scheduled.endTime}</span>
        </div>
        <Link href={`/tours/${scheduled.tour.slug}`}>
          <h4 className="mt-1 font-medium text-slate-900 hover:text-blue-700">
            {scheduled.tour.name}
          </h4>
        </Link>
        <div className="mt-1 text-sm text-slate-500">
          {scheduled.tour.duration_hours}h • {scheduled.tour.price_from} NOK
        </div>
      </div>
    </div>
  );
}
