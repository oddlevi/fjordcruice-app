import { describe, it, expect } from "vitest";
import { NextResponse } from "next/server";
import { applySecurityHeaders } from "@/lib/security-headers";

describe("applySecurityHeaders", () => {
  it("sets X-Content-Type-Options", () => {
    const res = applySecurityHeaders(NextResponse.next());
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("sets X-Frame-Options to DENY", () => {
    const res = applySecurityHeaders(NextResponse.next());
    expect(res.headers.get("X-Frame-Options")).toBe("DENY");
  });

  it("sets Strict-Transport-Security", () => {
    const res = applySecurityHeaders(NextResponse.next());
    const hsts = res.headers.get("Strict-Transport-Security");
    expect(hsts).toContain("max-age=31536000");
    expect(hsts).toContain("includeSubDomains");
  });

  it("sets Content-Security-Policy with default-src self", () => {
    const res = applySecurityHeaders(NextResponse.next());
    const csp = res.headers.get("Content-Security-Policy");
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
  });

  it("sets Permissions-Policy", () => {
    const res = applySecurityHeaders(NextResponse.next());
    const pp = res.headers.get("Permissions-Policy");
    expect(pp).toContain("camera=()");
    expect(pp).toContain("microphone=()");
  });

  it("sets Referrer-Policy", () => {
    const res = applySecurityHeaders(NextResponse.next());
    expect(res.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
  });
});
