#!/usr/bin/env node

/**
 * Patches Next.js build to skip /_global-error prerender failure.
 * Workaround for: https://github.com/vercel/next.js/issues/86178
 * Remove this script once the bug is fixed upstream.
 */

const fs = require("fs");
const path = require("path");

const exportIndexPath = path.join(
  __dirname,
  "..",
  "node_modules",
  "next",
  "dist",
  "export",
  "index.js"
);

if (!fs.existsSync(exportIndexPath)) {
  console.log("[patch-next-build] next/dist/export/index.js not found, skipping.");
  process.exit(0);
}

let content = fs.readFileSync(exportIndexPath, "utf8");

const marker = "/* PATCHED: skip _global-error prerender */";
if (content.includes(marker)) {
  console.log("[patch-next-build] Already patched.");
  process.exit(0);
}

// Find the failedExportAttemptsByPage check and inject filter
const target = "if (failedExportAttemptsByPage.size > 0) {";
const replacement = `if (failedExportAttemptsByPage.size > 0) {
        ${marker}
        for (const key of failedExportAttemptsByPage.keys()) {
            if (key.includes('_global-error') || key.includes('_not-found')) {
                failedExportAttemptsByPage.delete(key);
            }
        }
        if (failedExportAttemptsByPage.size === 0) {} else {`;

// Also need to add closing brace before the closing of the original if
const throwEnd = /throw Object\.defineProperty\(new ExportError\(`Export encountered errors.*?\n\s*\}\);/s;
content = content.replace(target, replacement);
content = content.replace(
  /(throw Object\.defineProperty\(new ExportError\(`Export encountered errors.*?configurable: true\n\s*\}\);)/s,
  "$1\n        }"
);

fs.writeFileSync(exportIndexPath, content, "utf8");
console.log("[patch-next-build] Patched successfully.");
