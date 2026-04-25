import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const ADMIN_ROUTES = [
  "src/app/api/admin/projects/route.ts",
  "src/app/api/admin/page-content/route.ts",
  "src/app/api/admin/partners/route.ts",
];

const PROJECT_ROOT = join(__dirname, "../../..");

describe("ADMIN-AUTH: All admin routes require authentication", () => {
  for (const route of ADMIN_ROUTES) {
    const fullPath = join(PROJECT_ROOT, route);
    let source: string;

    try {
      source = readFileSync(fullPath, "utf-8");
    } catch {
      continue;
    }

    describe(route, () => {
      it("imports or uses admin auth verification", () => {
        expect(source).toMatch(
          /verifyAdminToken|isAdminAuthenticated|admin-auth/
        );
      });

      it("returns 401 for unauthorized requests", () => {
        expect(source).toMatch(/401/);
      });

      it("checks auth before any mutation (POST/PUT/DELETE handlers)", () => {
        const handlers = source.match(
          /export\s+async\s+function\s+(POST|PUT|DELETE)\b/g
        );
        if (handlers) {
          for (const handler of handlers) {
            const method = handler.match(/POST|PUT|DELETE/)![0];
            const fnRegex = new RegExp(
              `export\s+async\s+function\s+${method}[^{]*\{([\s\S]*?)(?=export\s+async\s+function|$)`
            );
            const fnMatch = source.match(fnRegex);
            if (fnMatch) {
              const body = fnMatch[1];
              const authPos = body.search(
                /verifyAdminToken|isAdminAuthenticated/
              );
              const dbPos = body.search(/prisma\./);
              if (dbPos > -1) {
                expect(authPos).toBeGreaterThan(-1);
                expect(authPos).toBeLessThan(dbPos);
              }
            }
          }
        }
      });
    });
  }
});
