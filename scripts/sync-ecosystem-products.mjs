#!/usr/bin/env node
/**
 * sync-ecosystem-products.mjs — weekly reconciler for knowbest portfolio.
 *
 * Goal (Master "stay connected with all projects"): once a week, detect products
 * that exist in the ecosystem catalog but are NOT yet in the knowbest DB, and add
 * them with bilingual (ro+en) text + graphic content (icon), so the public site
 * stays current automatically.
 *
 * Source of truth: scripts/ecosystem-catalog.json (committed). A new ecosystem
 * project becomes visible on the site by being added to that catalog (manually or
 * by the local detector `Master/mesh/tools/knowbest-ecosystem-detect.mjs`, which
 * diffs Master/ECOSYSTEM_REGISTRY.md against the catalog and appends new entries).
 *
 * Runs ON VPS2 (DB is local there). Idempotent: upsert by slug; never deletes.
 *
 * Usage:  node scripts/sync-ecosystem-products.mjs [--dry-run]
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { PrismaClient } from "@prisma/client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DRY = process.argv.includes("--dry-run");
const FULL = process.argv.includes("--full"); // also refresh display fields on existing rows
// Rows whose slug is no longer in the catalog get visible=false (never deleted —
// reversible, and the public API already filters on visible).
const HIDE = process.argv.includes("--hide-missing");
const prisma = new PrismaClient();

function loadCatalog() {
  const p = join(__dirname, "ecosystem-catalog.json");
  return JSON.parse(readFileSync(p, "utf8"));
}

async function main() {
  const catalog = loadCatalog();
  const existing = await prisma.project.findMany({ select: { slug: true } });
  const known = new Set(existing.map((p) => p.slug));

  const toAdd = catalog.filter((c) => !known.has(c.slug));
  const log = [];

  // --full: refresh display fields (description/status/url/tech/icon) on existing rows from catalog.
  if (FULL) {
    let updated = 0;
    for (const c of catalog) {
      if (!known.has(c.slug)) continue;
      if (DRY) { updated++; continue; }
      await prisma.project.update({
        where: { slug: c.slug },
        data: {
          name: c.name, nameEn: c.nameEn || c.name,
          description: c.description, descriptionEn: c.descriptionEn,
          status: c.status || "LIVE", prodUrl: c.prodUrl || null,
          icon: c.icon || "📦", techStack: c.techStack || [], tags: c.tags || [],
          tagsEn: c.tagsEn || [], highlights: c.highlights || [], highlightsEn: c.highlightsEn || [],
          tagline: c.tagline || null, taglineEn: c.taglineEn || null,
          featured: c.featured === true, sortOrder: c.sortOrder || 99, visible: true,
        },
      });
      updated++;
    }
    console.log(`[full] refreshed display fields on ${updated} existing product(s).`);
  }

  for (const c of toAdd) {
    log.push(`+ NEW: ${c.name} (${c.slug}) -> ${c.prodUrl || "(no url)"}`);
    if (DRY) continue;
    await prisma.project.upsert({
      where: { slug: c.slug },
      update: {}, // never overwrite manually-tuned existing rows
      create: {
        name: c.name,
        nameEn: c.nameEn || c.name,
        slug: c.slug,
        description: c.description,
        descriptionEn: c.descriptionEn,
        category: c.category || "WEB_APP",
        status: c.status || "LIVE",
        prodUrl: c.prodUrl || null,
        standalone: c.standalone !== false,
        icon: c.icon || "📦",
        techStack: c.techStack || [],
        tags: c.tags || [],
        tagsEn: c.tagsEn || [],
        highlights: c.highlights || [],
        highlightsEn: c.highlightsEn || [],
        tagline: c.tagline || null,
        taglineEn: c.taglineEn || null,
        featured: c.featured === true,
        sortOrder: c.sortOrder || 99,
      },
    });
  }

  if (HIDE) {
    const inCatalog = new Set(catalog.map((c) => c.slug));
    const toHide = existing.filter((p) => !inCatalog.has(p.slug));
    for (const p of toHide) {
      log.push(`- HIDE: ${p.slug} (not in catalog)`);
      if (DRY) continue;
      await prisma.project.update({ where: { slug: p.slug }, data: { visible: false } });
    }
    console.log(`[hide-missing] ${DRY ? "[DRY] " : ""}hid ${toHide.length} product(s) missing from catalog.`);
  }

  const ts = new Date().toISOString();
  if (toAdd.length === 0) {
    console.log(`[${ts}] sync-ecosystem-products: up to date (${known.size} products, 0 new).`);
  } else {
    console.log(`[${ts}] sync-ecosystem-products: ${DRY ? "[DRY] " : ""}added ${toAdd.length} new product(s):`);
    log.forEach((l) => console.log("  " + l));
  }
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("[sync-ecosystem-products] ERROR:", e.message);
  await prisma.$disconnect();
  process.exit(1);
});
