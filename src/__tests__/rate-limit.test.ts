import { describe, it, expect } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("allows requests within limit", () => {
    const key = `test-${Date.now()}`;
    const result1 = rateLimit(key, 3, 60000);
    expect(result1.success).toBe(true);
    expect(result1.remaining).toBe(2);

    const result2 = rateLimit(key, 3, 60000);
    expect(result2.success).toBe(true);
    expect(result2.remaining).toBe(1);
  });

  it("blocks requests over limit", () => {
    const key = `test-block-${Date.now()}`;
    rateLimit(key, 2, 60000);
    rateLimit(key, 2, 60000);
    const result = rateLimit(key, 2, 60000);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("uses separate keys independently", () => {
    const key1 = `test-a-${Date.now()}`;
    const key2 = `test-b-${Date.now()}`;
    rateLimit(key1, 1, 60000);
    const result = rateLimit(key2, 1, 60000);
    expect(result.success).toBe(true);
  });
});
