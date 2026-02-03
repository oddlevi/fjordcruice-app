import { describe, it, expect } from "vitest";
import {
  recommendSchema,
  chatSchema,
  toursQuerySchema,
  analyticsEventSchema,
} from "@/lib/validation";

describe("recommendSchema", () => {
  it("accepts valid input", () => {
    const result = recommendSchema.safeParse({
      language: "en",
      preferences: {
        duration: "half-day",
        interests: ["fjord", "scenic"],
        budget: "moderate",
        group_type: "couple",
        fitness_level: "easy",
        travel_month: 7,
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid language", () => {
    const result = recommendSchema.safeParse({
      language: "zh",
      preferences: {
        duration: "half-day",
        interests: [],
        budget: "moderate",
        group_type: "solo",
        fitness_level: "easy",
        travel_month: 7,
      },
    });
    expect(result.success).toBe(false);
  });

  it("rejects too many interests", () => {
    const result = recommendSchema.safeParse({
      language: "en",
      preferences: {
        duration: "short",
        interests: ["a", "b", "c", "d", "e", "f"],
        budget: "budget",
        group_type: "solo",
        fitness_level: "easy",
        travel_month: 1,
      },
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid month", () => {
    const result = recommendSchema.safeParse({
      language: "de",
      preferences: {
        duration: "full-day",
        interests: [],
        budget: "premium",
        group_type: "group",
        fitness_level: "challenging",
        travel_month: 13,
      },
    });
    expect(result.success).toBe(false);
  });
});

describe("chatSchema", () => {
  it("accepts valid message", () => {
    const result = chatSchema.safeParse({
      session_id: "550e8400-e29b-41d4-a716-446655440000",
      message: "What should I bring?",
      language: "en",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty message", () => {
    const result = chatSchema.safeParse({
      session_id: "550e8400-e29b-41d4-a716-446655440000",
      message: "",
      language: "en",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid session_id", () => {
    const result = chatSchema.safeParse({
      session_id: "not-a-uuid",
      message: "Hello",
      language: "fr",
    });
    expect(result.success).toBe(false);
  });
});

describe("toursQuerySchema", () => {
  it("accepts valid query", () => {
    const result = toursQuerySchema.safeParse({
      lang: "en",
      category: "fjord",
      sort: "price",
      order: "asc",
    });
    expect(result.success).toBe(true);
  });

  it("accepts minimal query (lang only)", () => {
    const result = toursQuerySchema.safeParse({ lang: "de" });
    expect(result.success).toBe(true);
  });

  it("rejects missing lang", () => {
    const result = toursQuerySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("coerces string numbers", () => {
    const result = toursQuerySchema.safeParse({
      lang: "en",
      duration_min: "2",
      price_max: "1500",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.duration_min).toBe(2);
      expect(result.data.price_max).toBe(1500);
    }
  });
});

describe("analyticsEventSchema", () => {
  it("accepts valid event", () => {
    const result = analyticsEventSchema.safeParse({
      event: "booking_clicked",
      data: { tour_slug: "sognefjord-classic" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts event without data", () => {
    const result = analyticsEventSchema.safeParse({
      event: "ai_session_started",
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown event", () => {
    const result = analyticsEventSchema.safeParse({
      event: "unknown_event",
    });
    expect(result.success).toBe(false);
  });
});
