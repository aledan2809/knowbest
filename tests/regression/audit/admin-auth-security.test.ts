import { describe, it, expect, vi, afterEach } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const AUTH_FILE = join(__dirname, "../../../src/lib/admin-auth.ts");

describe("AUDIT-001: No hardcoded admin password fallback", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("source must not contain hardcoded password", () => {
    const source = readFileSync(AUTH_FILE, "utf-8");
    expect(source).not.toContain('"KnowBest2026!"');
    expect(source).not.toContain("'KnowBest2026!'");
  });

  it("getAdminPassword must throw when env var missing", () => {
    const source = readFileSync(AUTH_FILE, "utf-8");
    const fnMatch = source.match(
      /function getAdminPassword\(\)[^{]*\{([\s\S]*?)\n\}/
    );
    expect(fnMatch).toBeTruthy();
    expect(fnMatch![1]).toContain("throw new Error");
  });

  it("getAdminPassword throws at runtime without ADMIN_PASSWORD", async () => {
    delete process.env.ADMIN_PASSWORD;
    vi.resetModules();
    const { getAdminPassword } = await import("../../../src/lib/admin-auth");
    expect(() => getAdminPassword()).toThrow("Admin password is not configured");
  });

  it("getAdminPassword returns env value when set", async () => {
    process.env.ADMIN_PASSWORD = "test-pw-regression";
    vi.resetModules();
    const { getAdminPassword } = await import("../../../src/lib/admin-auth");
    expect(getAdminPassword()).toBe("test-pw-regression");
    delete process.env.ADMIN_PASSWORD;
  });
});

describe("AUDIT-002: No insecure JWT secret fallback", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("source must not contain fallback-secret string", () => {
    const source = readFileSync(AUTH_FILE, "utf-8");
    expect(source).not.toContain('"fallback-secret"');
    expect(source).not.toContain("'fallback-secret'");
  });

  it("getJWTSecret must throw when env vars missing", () => {
    const source = readFileSync(AUTH_FILE, "utf-8");
    const fnMatch = source.match(
      /function getJWTSecret\(\)[^{]*\{([\s\S]*?)\n\}/
    );
    expect(fnMatch).toBeTruthy();
    const fnBody = fnMatch![1];
    expect(fnBody).toContain("throw new Error");
    expect(fnBody).not.toMatch(/\|\|\s*["']/);
  });

  it("createAdminToken rejects without secrets", async () => {
    delete process.env.ADMIN_SECRET;
    delete process.env.NEXTAUTH_SECRET;
    vi.resetModules();
    const { createAdminToken } = await import("../../../src/lib/admin-auth");
    await expect(createAdminToken()).rejects.toThrow("JWT secret is not configured");
  });

  it("JWT round-trip works with ADMIN_SECRET set", async () => {
    process.env.ADMIN_SECRET = "regression-test-jwt-secret-32chars!";
    vi.resetModules();
    const { createAdminToken, verifyAdminToken } = await import(
      "../../../src/lib/admin-auth"
    );
    const token = await createAdminToken();
    expect(typeof token).toBe("string");
    expect(await verifyAdminToken(token)).toBe(true);
    delete process.env.ADMIN_SECRET;
  });
});
