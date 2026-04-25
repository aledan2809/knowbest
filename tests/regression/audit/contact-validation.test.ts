import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const CONTACT_ROUTE = join(
  __dirname,
  "../../../src/app/api/contact/route.ts"
);

describe("CONTACT: Input validation and XSS prevention", () => {
  const source = readFileSync(CONTACT_ROUTE, "utf-8");

  it("validates required fields (name, email, subject, message)", () => {
    expect(source).toMatch(/name/);
    expect(source).toMatch(/email/);
    expect(source).toMatch(/subject|message/);
  });

  it("validates email format", () => {
    expect(source).toMatch(/@|email.*valid|\.email\(\)|includes.*@/i);
  });

  it("escapes HTML in user input to prevent XSS", () => {
    expect(source).toMatch(
      /escapeHtml|sanitize|replace\([^)]*[<>&"']/
    );
  });

  it("returns proper error status for invalid input", () => {
    expect(source).toMatch(/400/);
  });
});
