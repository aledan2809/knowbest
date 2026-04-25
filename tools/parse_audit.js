#!/usr/bin/env node
/**
 * Parse audit report into structured format
 * Usage: node tools/parse_audit.js [path-to-audit.md]
 */

const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2] || path.join(__dirname, '..', 'Reports', 'AUDIT_E2E_2026-03-21.md');
const reportsDir = path.join(__dirname, '..', 'Reports');

if (!fs.existsSync(inputPath)) {
  console.error(`File not found: ${inputPath}`);
  process.exit(1);
}

const raw = fs.readFileSync(inputPath, 'utf-8');

function detectLocation(text) {
  const fileMatch = text.match(/`([a-zA-Z0-9_/.\-[\]{}]+\.[a-zA-Z]{1,5})`/);
  if (fileMatch) return fileMatch[1];
  const pathMatch = text.match(/(src\/[a-zA-Z0-9_/.\-[\]{}]+|app\/[a-zA-Z0-9_/.\-[\]{}]+|prisma\/[a-zA-Z0-9_/.]+)/);
  if (pathMatch) return pathMatch[1];
  const routeMatch = text.match(/`(\/api\/[a-zA-Z0-9_/.\-[\]{}]+)`/);
  if (routeMatch) return routeMatch[1];
  return 'project-wide';
}

// All issues collected manually from the audit — deduplicated at source
const issues = [
  // P0 — Critical security
  {
    priority: 'P0',
    type: 'security',
    location: 'src/lib/admin-auth.ts',
    description: 'Hardcoded admin password fallback "KnowBest2026!" in getAdminPassword(). If ADMIN_PASSWORD env var is missing, anyone reading the code knows the password.',
    source_section: '4.4, 6',
  },
  {
    priority: 'P0',
    type: 'security',
    location: 'src/lib/admin-auth.ts',
    description: 'Insecure JWT secret fallback "fallback-secret" as string literal. If ADMIN_SECRET and NEXTAUTH_SECRET env vars are both missing, tokens can be forged by anyone who reads the code.',
    source_section: '4.4, 6',
  },

  // P1 — Major issues
  {
    priority: 'P1',
    type: 'bug',
    location: 'src/app/api/auth/',
    description: 'NextAuth not implemented — /api/auth/[...nextauth] route missing. User/Account/Session models exist in Prisma schema but no auth routes or login/signup pages exist. Users cannot authenticate.',
    source_section: '4.5, 4.6, 6',
  },
  {
    priority: 'P1',
    type: 'bug',
    location: 'src/app/api/',
    description: 'Stripe integration not implemented — dependency installed and Subscription model in schema, but zero API routes, webhooks, or pricing UI exist.',
    source_section: '4.3, 6',
  },
  {
    priority: 'P1',
    type: 'security',
    location: 'src/app/api/',
    description: 'No input validation (Zod) on API routes — contact form, admin create/update endpoints accept unvalidated input.',
    source_section: '6',
  },
  {
    priority: 'P1',
    type: 'bug',
    location: 'src/app/[locale]/',
    description: 'No user signup/login pages exist despite NextAuth dependencies being installed and auth models in DB schema.',
    source_section: '4.5',
  },

  // P2 — Minor issues
  {
    priority: 'P2',
    type: 'security',
    location: 'Reports/AUDIT_E2E_2026-03-21.md',
    description: 'Database connection string with credentials exposed in audit report file (not in application code).',
    source_section: '4.4',
  },
  {
    priority: 'P2',
    type: 'security',
    location: 'src/app/[locale]/contact/',
    description: 'Contact form has no CSRF token protection — standard requirement for public forms.',
    source_section: '4.4',
  },
  {
    priority: 'P2',
    type: 'UX',
    location: 'src/app/[locale]/page.tsx',
    description: 'Partner logos (16 entries) hardcoded in page.tsx — should be managed via admin panel or DB as dynamic content.',
    source_section: '4.3, 6',
  },
  {
    priority: 'P2',
    type: 'performance',
    location: 'src/app/[locale]/',
    description: 'Each public page manually imports Navbar/Footer instead of using a shared layout — code duplication across all page files.',
    source_section: '4.3',
  },
  {
    priority: 'P2',
    type: 'bug',
    location: 'src/app/api/',
    description: 'API Key management for users not implemented despite ApiKey model existing in Prisma schema.',
    source_section: '4.5',
  },
  {
    priority: 'P2',
    type: 'bug',
    location: 'prisma/schema.prisma',
    description: 'Usage tracking / credits system not implemented despite UsageRecord model in schema.',
    source_section: '4.5',
  },
  {
    priority: 'P2',
    type: 'bug',
    location: 'knowledge/',
    description: 'No knowledge/ documentation files exist for the project.',
    source_section: '4.1',
  },
];

// Section line map — maps audit section headers to their line numbers
const lines = raw.split('\n');
const sectionLineMap = {};
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/^##\s+(\d+)\./);
  if (m) sectionLineMap[m[1]] = i + 1;
  // Also map sub-sections like ### 4.4
  const sub = lines[i].match(/^###\s+(\d+\.\d+)/);
  if (sub) sectionLineMap[sub[1]] = i + 1;
}

// Assign IDs and resolve line numbers
issues.forEach((issue, idx) => {
  issue.id = `AUDIT-${String(idx + 1).padStart(3, '0')}`;
  issue.status = 'unresolved';

  // Strategy 1: Match by key phrases from description
  const keywords = issue.description
    .replace(/["`']/g, '')
    .split(/\s+/)
    .filter(w => w.length > 5)
    .slice(0, 5);

  let bestLine = null;
  let bestScore = 0;
  for (let i = 0; i < lines.length; i++) {
    const lineLower = lines[i].toLowerCase();
    let score = 0;
    for (const kw of keywords) {
      if (lineLower.includes(kw.toLowerCase())) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestLine = i + 1;
    }
  }
  if (bestScore >= 2) {
    issue.audit_line = bestLine;
  }

  // Strategy 2: Match by location path
  if (!issue.audit_line && issue.location !== 'project-wide') {
    const loc = issue.location.replace(/[[\]{}]/g, '');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(loc)) {
        issue.audit_line = i + 1;
        break;
      }
    }
  }

  // Strategy 3: Use source_section to find the section line
  if (!issue.audit_line && issue.source_section) {
    const sections = issue.source_section.split(',').map(s => s.trim());
    for (const sec of sections) {
      if (sectionLineMap[sec]) {
        issue.audit_line = sectionLineMap[sec];
        break;
      }
    }
  }
});

// === Write JSON (without source_section) ===
const jsonOutput = issues.map(({ source_section, ...rest }) => rest);
const jsonPath = path.join(reportsDir, 'AUDIT_PARSED.json');
fs.writeFileSync(jsonPath, JSON.stringify(jsonOutput, null, 2), 'utf-8');
console.log(`Written ${issues.length} issues to ${jsonPath}`);

// === Generate MD table ===
const p0 = issues.filter(i => i.priority === 'P0');
const p1 = issues.filter(i => i.priority === 'P1');
const p2 = issues.filter(i => i.priority === 'P2');

const typeCounts = {};
issues.forEach(i => { typeCounts[i.type] = (typeCounts[i.type] || 0) + 1; });

let md = `# Audit Parsed — knowbest\n\n`;
md += `**Source:** \`AUDIT_E2E_2026-03-21.md\`\n`;
md += `**Generated:** ${new Date().toISOString().split('T')[0]}\n`;
md += `**Total issues:** ${issues.length}\n\n`;

md += `### Summary\n\n`;
md += `| Priority | Count |\n|----------|-------|\n`;
md += `| **P0 (Critical)** | **${p0.length}** |\n`;
md += `| P1 (Major) | ${p1.length} |\n`;
md += `| P2 (Minor) | ${p2.length} |\n\n`;

md += `### By Type\n\n`;
md += `| Type | Count |\n|------|-------|\n`;
for (const [type, count] of Object.entries(typeCounts).sort((a, b) => b[1] - a[1])) {
  md += `| ${type} | ${count} |\n`;
}
md += `\n`;

md += `### All Issues\n\n`;
md += `| ID | Priority | Type | Location | Description | Status |\n`;
md += `|-----|----------|------|----------|-------------|--------|\n`;

for (const issue of issues) {
  const isP0 = issue.priority === 'P0';
  const id = isP0 ? `**${issue.id}**` : issue.id;
  const prio = isP0 ? `**${issue.priority}**` : issue.priority;
  const desc = issue.description.length > 120
    ? issue.description.substring(0, 117) + '...'
    : issue.description;
  const lineRef = issue.audit_line ? ` (L${issue.audit_line})` : '';
  md += `| ${id} | ${prio} | ${issue.type} | \`${issue.location}\`${lineRef} | ${desc} | ${issue.status} |\n`;
}

const mdPath = path.join(reportsDir, 'AUDIT_PARSED.md');
fs.writeFileSync(mdPath, md, 'utf-8');
console.log(`Written summary table to ${mdPath}`);

// === Sample 10 random entries for verification ===
console.log('\n=== MANUAL VERIFICATION SAMPLE (10 random entries) ===\n');
const shuffled = [...issues].sort(() => Math.random() - 0.5);
const sample = shuffled.slice(0, Math.min(10, issues.length));
for (const s of sample) {
  console.log(`${s.id} | ${s.priority} | ${s.type} | ${s.location} | L${s.audit_line || '?'}`);
  console.log(`  → ${s.description.substring(0, 120)}`);
  console.log();
}
