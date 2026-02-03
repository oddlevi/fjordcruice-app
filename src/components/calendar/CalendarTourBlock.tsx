"use client";

import { Link } from "@/i18n/routing";
import type { ScheduledTour } from "@/lib/tour-schedule";

function getTimeOfDayColor(time: string): string {
  const hour = parseInt(time.split(":")[0], 10);
  if (hour < 12) return "border-l-amber-400";
  if (hour < 17) return "border-l-blue-400";
  return "border-l-indigo-500";
}

interface CalendarTourBlockProps {
  scheduled: ScheduledTour;
  selectionKey: string;
  selected: boolean;
  onToggle: (key: string) => void;
}

export function CalendarTourBlock({ scheduled, selectionKey, selected, onToggle }: CalendarTourBlockProps) {
  const { tour, departureTime, endTime } = scheduled;

  return (
    <div
      className={`flex items-start gap-2 rounded-md border border-l-4 px-2.5 py-1.5 transition-colors ${
        selected
          ? "border-blue-300 bg-blue-50 " + getTimeOfDayColor(departureTime)
          : "border-slate-200 bg-white " + getTimeOfDayColor(departureTime)
      }`}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onToggle(selectionKey)}
        className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 text-blue-600"
      />
      <Link
        href={`/tours/${tour.slug}`}
        className="group min-w-0 flex-1"
      >
        <span className="text-xs text-slate-500">{departureTime}–{endTime}</span>
        <h4 className="line-clamp-2 text-sm font-medium text-slate-900 group-hover:text-blue-700">
          {tour.name}
        </h4>
      </Link>
    </div>
  );
}
