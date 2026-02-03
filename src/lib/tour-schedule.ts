import type { Tour } from "./tours";

export interface ScheduledTour {
  tour: Tour;
  departureTime: string; // "HH:MM"
  endTime: string;       // "HH:MM"
}

interface TourScheduleEntry {
  slug: string;
  time: string;       // "HH:MM"
  days: number[];      // 0=Sun, 1=Mon, ..., 6=Sat
  seasonStart?: number; // month 1-12 (uses tour's season if omitted)
  seasonEnd?: number;
}

// Day constants for readability
const MON = 1, TUE = 2, WED = 3, THU = 4, FRI = 5, SAT = 6, SUN = 0;
const DAILY = [SUN, MON, TUE, WED, THU, FRI, SAT];

const TOUR_SCHEDULE: TourScheduleEntry[] = [
  { slug: "arctic-king-crab-cruise",       time: "09:00", days: DAILY },
  { slug: "classic-arctic-fjord-cruise",   time: "11:00", days: DAILY },
  { slug: "midday-arctic-explorer",        time: "12:00", days: DAILY },
  { slug: "evening-polar-expedition",      time: "17:00", days: [MON, WED, FRI, SAT] },
  { slug: "northern-lights-fjord-cruise",  time: "18:00", days: DAILY },
  { slug: "jazz-cruise",                   time: "19:30", days: [THU, FRI, SAT] },
  { slug: "captains-secret-bars",          time: "20:00", days: [FRI, SAT] },
];

function isInSeason(tour: Tour, month: number): boolean {
  const { start, end } = tour.season;
  if (start <= end) return month >= start && month <= end;
  return month >= start || month <= end;
}

export function computeEndTime(startTime: string, durationHours: number): string {
  const [h, m] = startTime.split(":").map(Number);
  const totalMinutes = h * 60 + m + Math.round(durationHours * 60);
  const endH = Math.floor(totalMinutes / 60) % 24;
  const endM = totalMinutes % 60;
  return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
}

/**
 * Returns tours scheduled for a given day of the week, filtered by season.
 * @param dayOfWeek 0=Sun, 1=Mon, ..., 6=Sat
 * @param month 1-12
 * @param tours All available tours (already translated)
 */
export function getScheduledToursForDay(
  dayOfWeek: number,
  month: number,
  tours: Tour[],
): ScheduledTour[] {
  const tourMap = new Map(tours.map((t) => [t.slug, t]));

  return TOUR_SCHEDULE
    .filter((entry) => {
      if (!entry.days.includes(dayOfWeek)) return false;
      const tour = tourMap.get(entry.slug);
      if (!tour) return false;
      return isInSeason(tour, month);
    })
    .map((entry) => {
      const tour = tourMap.get(entry.slug)!;
      return {
        tour,
        departureTime: entry.time,
        endTime: computeEndTime(entry.time, tour.duration_hours),
      };
    })
    .sort((a, b) => a.departureTime.localeCompare(b.departureTime));
}
