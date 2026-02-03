import { describe, it, expect } from "vitest";
import { buildSystemPrompt, MAX_MESSAGE_LENGTH, MAX_MESSAGES_PER_SESSION } from "@/lib/claude";

describe("buildSystemPrompt", () => {
  it("includes tour data in prompt", () => {
    const tours = [
      {
        slug: "test-tour",
        name: "Test Tour",
        description: "A test tour",
        duration_hours: 5,
        price_from: 1000,
        difficulty_level: "easy",
      },
    ];
    const prompt = buildSystemPrompt(tours, "en");
    expect(prompt).toContain("Test Tour");
    expect(prompt).toContain("test-tour");
    expect(prompt).toContain("1000 NOK");
  });

  it("includes language instruction", () => {
    const prompt = buildSystemPrompt([], "de");
    expect(prompt).toContain("de");
  });

  it("contains safety rules", () => {
    const prompt = buildSystemPrompt([], "en");
    expect(prompt).toContain("ALDRI");
    expect(prompt).toContain("system-prompt");
  });
});

describe("constants", () => {
  it("has reasonable limits", () => {
    expect(MAX_MESSAGE_LENGTH).toBe(500);
    expect(MAX_MESSAGES_PER_SESSION).toBe(10);
  });
});
