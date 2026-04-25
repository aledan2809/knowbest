import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const PROJECT_ROOT = join(__dirname, "../../..");

const ADMIN_MUTATION_ROUTES = [
  "src/app/api/admin/projects/route.ts",
  "src/app/api/admin/page-content/route.ts",
];

describe("ZOD: Admin API routes use schema validation", () => {
  for (const route of ADMIN_MUTATION_ROUTES) {
    const fullPath = join(PROJECT_ROOT, route);
    let source: string;

    try {
      source = readFileSync(fullPath, "utf-8");
    } catch {
      continue;
    }

    describe(route, () => {
      it("imports zod", () => {
        expect(source).toMatch(/from\s+["']zod["']/);
      });

      it("defines at least one zod schema", () => {
        expect(source).toMatch(/z\.\s*(object|string|number|enum|union)\s*\(/);
      });

      it("uses .parse() or .safeParse() on request body", () => {
        expect(source).toMatch(/\.parse\(|\.safeParse\(/);
      });
    });
  }
});
