import { describe, it, expect } from "vitest";
import { computeEndTime, getScheduledToursForDay } from "@/lib/tour-schedule";
import type { Tour } from "@/lib/tours";

function makeTour(slug: string, duration: number, seasonStart: number, seasonEnd: number): Tour {
  return {
    id: slug,
    slug,
    name: slug,
    description: "",
    duration_hours: duration,
    price_from: 500,
    price_to: null,
    difficulty_level: "easy",
    image_url: null,
    booking_url: null,
    categories: [],
    season: { start: seasonStart, end: seasonEnd },
  };
}

describe("computeEndTime", () => {
  it("adds hours to start time", () => {
    expect(computeEndTime("09:00", 3)).toBe("12:00");
  });

  it("handles fractional hours", () => {
    expect(computeEndTime("19:30", 1.5)).toBe("21:00");
  });

  it("wraps past midnight", () => {
    expect(computeEndTime("22:00", 4)).toBe("02:00");
  });

  it("handles zero duration", () => {
    expect(computeEndTime("14:00", 0)).toBe("14:00");
  });
});

describe("getScheduledToursForDay", () => {
  const tours: Tour[] = [
    makeTour("arctic-king-crab-cruise", 4, 10, 3),        // Oct-Mar
    makeTour("classic-arctic-fjord-cruise", 3, 1, 12),     // Year-round
    makeTour("midday-arctic-explorer", 3, 5, 9),           // May-Sep
    makeTour("evening-polar-expedition", 4, 1, 12),        // Year-round
    makeTour("northern-lights-fjord-cruise", 3.5, 9, 3),   // Sep-Mar
    makeTour("jazz-cruise", 2, 6, 8),                      // Jun-Aug
    makeTour("captains-secret-bars", 3, 1, 12),            // Year-round
  ];

  it("returns tours scheduled for a Monday in January", () => {
    const scheduled = getScheduledToursForDay(1, 1, tours); // Monday, January
    const slugs = scheduled.map((s) => s.tour.slug);
    expect(slugs).toContain("arctic-king-crab-cruise");
    expect(slugs).toContain("classic-arctic-fjord-cruise");
    expect(slugs).toContain("evening-polar-expedition");
    expect(slugs).toContain("northern-lights-fjord-cruise");
    // Jazz cruise not on Monday
    expect(slugs).not.toContain("jazz-cruise");
    // Midday explorer is May-Sep only
    expect(slugs).not.toContain("midday-arctic-explorer");
  });

  it("returns Friday-only tours on Friday", () => {
    const scheduled = getScheduledToursForDay(5, 1, tours); // Friday, January
    const slugs = scheduled.map((s) => s.tour.slug);
    expect(slugs).toContain("captains-secret-bars");
    expect(slugs).toContain("evening-polar-expedition");
  });

  it("excludes Friday-only tours on Tuesday", () => {
    const scheduled = getScheduledToursForDay(2, 1, tours); // Tuesday, January
    const slugs = scheduled.map((s) => s.tour.slug);
    expect(slugs).not.toContain("captains-secret-bars");
  });

  it("includes summer-only tours in July", () => {
    const scheduled = getScheduledToursForDay(4, 7, tours); // Thursday, July
    const slugs = scheduled.map((s) => s.tour.slug);
    expect(slugs).toContain("midday-arctic-explorer");
    expect(slugs).toContain("jazz-cruise");
  });

  it("excludes out-of-season tours", () => {
    const scheduled = getScheduledToursForDay(4, 4, tours); // Thursday, April
    const slugs = scheduled.map((s) => s.tour.slug);
    // Arctic king crab is Oct-Mar, so out of season in April
    expect(slugs).not.toContain("arctic-king-crab-cruise");
    // Northern lights is Sep-Mar, out in April
    expect(slugs).not.toContain("northern-lights-fjord-cruise");
  });

  it("returns tours sorted by departure time", () => {
    const scheduled = getScheduledToursForDay(5, 1, tours); // Friday, January
    const times = scheduled.map((s) => s.departureTime);
    const sorted = [...times].sort();
    expect(times).toEqual(sorted);
  });

  it("returns empty array for unknown tours", () => {
    const scheduled = getScheduledToursForDay(1, 1, []);
    expect(scheduled).toHaveLength(0);
  });

  it("computes correct end times", () => {
    const scheduled = getScheduledToursForDay(1, 1, tours);
    const crab = scheduled.find((s) => s.tour.slug === "arctic-king-crab-cruise");
    expect(crab).toBeDefined();
    expect(crab!.departureTime).toBe("09:00");
    expect(crab!.endTime).toBe("13:00"); // 09:00 + 4h
  });
});
