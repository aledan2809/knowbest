import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

const SRC_DIR = join(__dirname, "../../../src");

function collectSourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...collectSourceFiles(full));
    } else if ([".ts", ".tsx", ".js", ".jsx"].includes(extname(full))) {
      files.push(full);
    }
  }
  return files;
}

describe("ENV-SAFETY: No credentials hardcoded in source", () => {
  const sourceFiles = collectSourceFiles(SRC_DIR);

  it("should have found source files to scan", () => {
    expect(sourceFiles.length).toBeGreaterThan(0);
  });

  it("no database connection strings in source", () => {
    for (const file of sourceFiles) {
      const content = readFileSync(file, "utf-8");
      expect(content).not.toMatch(
        /postgresql:\/\/[^"'\s]+@[^"'\s]+\.neon\.tech/
      );
      expect(content).not.toMatch(
        /mysql:\/\/[^"'\s]+:[^"'\s]+@/
      );
    }
  });

  it("no hardcoded API keys or tokens in source", () => {
    const patterns = [
      /sk_live_[a-zA-Z0-9]{20,}/,
      /sk_test_[a-zA-Z0-9]{20,}/,
      /re_[a-zA-Z0-9]{20,}/,
      /whsec_[a-zA-Z0-9]{20,}/,
    ];
    for (const file of sourceFiles) {
      const content = readFileSync(file, "utf-8");
      for (const pattern of patterns) {
        expect(content).not.toMatch(pattern);
      }
    }
  });

  it("admin-auth.ts has no string literal fallbacks with ||", () => {
    const authFile = join(SRC_DIR, "lib/admin-auth.ts");
    const content = readFileSync(authFile, "utf-8");
    const lines = content.split("\n");
    for (const line of lines) {
      if (line.includes("process.env.") && line.includes("||")) {
        expect(line).not.toMatch(/\|\|\s*["']/);
      }
    }
  });
});
