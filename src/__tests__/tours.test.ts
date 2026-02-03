import { describe, it, expect } from "vitest";
import { getTours, getTourBySlug } from "@/lib/tours";

describe("getTours (mock data)", () => {
  it("returns tours in English", async () => {
    const tours = await getTours("en");
    expect(tours.length).toBeGreaterThan(0);
    expect(tours[0].name).toBeTruthy();
    expect(tours[0].slug).toBeTruthy();
  });

  it("returns tours in German", async () => {
    const tours = await getTours("de");
    expect(tours.length).toBeGreaterThan(0);
    // Should have German names
    const fjordCruise = tours.find((t) => t.slug === "classic-arctic-fjord-cruise");
    expect(fjordCruise?.name).toContain("Klassische");
  });

  it("returns tours with required fields", async () => {
    const tours = await getTours("en");
    for (const tour of tours) {
      expect(tour.id).toBeTruthy();
      expect(tour.slug).toBeTruthy();
      expect(tour.name).toBeTruthy();
      expect(tour.duration_hours).toBeGreaterThan(0);
      expect(tour.price_from).toBeGreaterThan(0);
      expect(tour.difficulty_level).toBeTruthy();
      expect(tour.categories).toBeInstanceOf(Array);
      expect(tour.season.start).toBeGreaterThanOrEqual(1);
      expect(tour.season.end).toBeLessThanOrEqual(12);
    }
  });
});

describe("getTourBySlug (mock data)", () => {
  it("returns a specific tour", async () => {
    const tour = await getTourBySlug("arctic-king-crab-cruise", "en");
    expect(tour).not.toBeNull();
    expect(tour?.name).toBe("Arctic King Crab Cruise");
    expect(tour?.highlights).toBeInstanceOf(Array);
  });

  it("returns null for nonexistent tour", async () => {
    const tour = await getTourBySlug("nonexistent-tour", "en");
    expect(tour).toBeNull();
  });

  it("returns French translation", async () => {
    const tour = await getTourBySlug("classic-arctic-fjord-cruise", "fr");
    expect(tour?.name).toContain("Classique");
  });
});
