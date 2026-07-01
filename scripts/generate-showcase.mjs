#!/usr/bin/env node
/**
 * generate-showcase.mjs
 *
 * Regenerates the auto-managed block between the SHOWCASE markers in README.md
 * from a single data source (data/projects.json). Everything outside the markers
 * is curated narrative and is left untouched.
 *
 * The block it emits:
 *   1. Portfolio        — projects grouped by category, with stack + platforms
 *   2. By the numbers   — a metrics snapshot (repos, commits, source, platforms)
 *   3. Engineering system — the release-gate commands + standards-as-code inventory
 *
 * Optional enrichment: when SHOWCASE_TOKEN or GITHUB_TOKEN is set, each project
 * with a non-null `repo` is looked up via the GitHub REST API for its last-push
 * date. Enrichment is silently skipped on any missing token / null repo / non-200
 * response (e.g. a private repo the token can't see), so the script always produces
 * a valid page.
 *
 * The script is idempotent: a run with unchanged data produces no file change.
 *
 * Usage:
 *   node scripts/generate-showcase.mjs
 *   SHOWCASE_TOKEN=ghp_... node scripts/generate-showcase.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { get } from 'https';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const GITHUB_TOKEN = process.env.SHOWCASE_TOKEN || process.env.GITHUB_TOKEN || '';
const GITHUB_USER = 'rockeish';

const START_MARKER = '<!-- SHOWCASE:START -->';
const END_MARKER = '<!-- SHOWCASE:END -->';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

/** @typedef {{ name: string, category: string, status: string, blurb: string,
 *   stack: string[], platforms?: string[], url?: string, repo: string|null,
 *   highlights?: string[], pushedAt?: string|null }} Project */

const data = JSON.parse(readFileSync(join(ROOT, 'data', 'projects.json'), 'utf8'));

// ---------------------------------------------------------------------------
// GitHub enrichment (optional, gracefully skipped)
// ---------------------------------------------------------------------------

/**
 * Fetch JSON from a URL, resolving to null on any error or non-200 response.
 * @param {string} url
 * @returns {Promise<object|null>}
 */
function fetchJSON(url) {
  return new Promise((resolve) => {
    const options = {
      headers: {
        'User-Agent': 'rockeish-showcase-generator/2.0',
        Accept: 'application/vnd.github.v3+json',
        ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
      },
    };
    get(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        if (res.statusCode !== 200) return resolve(null);
        try {
          resolve(JSON.parse(body));
        } catch {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

/**
 * Return a copy of the project annotated with its last-push date, or the
 * original when enrichment is unavailable.
 * @param {Project} project
 * @returns {Promise<Project>}
 */
async function enrichProject(project) {
  if (!GITHUB_TOKEN || !project.repo) return project;
  const info = await fetchJSON(`https://api.github.com/repos/${GITHUB_USER}/${project.repo}`);
  if (!info) return project;
  return {
    ...project,
    pushedAt: typeof info.pushed_at === 'string' ? info.pushed_at.slice(0, 10) : null,
  };
}

// ---------------------------------------------------------------------------
// Rendering helpers
// ---------------------------------------------------------------------------

/** Format an ISO date (YYYY-MM-DD) as "Mon YYYY". */
function fmtMonth(iso) {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

/** Compact number, e.g. 678000 -> "678K", 5900 -> "5.9K". */
function compact(n) {
  if (n >= 1000) {
    const k = n / 1000;
    return (k >= 100 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, '')) + 'K';
  }
  return String(n);
}

/** Render the grouped portfolio, preserving the category order of first appearance. */
function renderPortfolio(projects) {
  const order = [];
  const byCategory = new Map();
  for (const p of projects) {
    if (!byCategory.has(p.category)) {
      byCategory.set(p.category, []);
      order.push(p.category);
    }
    byCategory.get(p.category).push(p);
  }

  const sections = order.map((category) => {
    const rows = byCategory.get(category).map((p) => {
      const title = p.url ? `**[${p.name}](${p.url})**` : `**${p.name}**`;
      const updated = p.pushedAt ? ` · updated ${fmtMonth(p.pushedAt)}` : '';
      const meta = `\`${p.status}\`${updated}`;
      const platforms = p.platforms?.length ? ` — ${p.platforms.join(' / ')}` : '';
      const highlights = (p.highlights || []).map((h) => `  - ${h}`).join('\n');
      return [
        `#### ${title} — ${meta}`,
        `${p.blurb}`,
        '',
        `**Stack:** ${p.stack.join(' · ')}${platforms}`,
        highlights ? '\n' + highlights : '',
      ].join('\n');
    });
    return `### ${category}\n\n${rows.join('\n\n')}`;
  });

  return sections.join('\n\n');
}

/** Render the metrics snapshot as a compact table. */
function renderMetrics(m) {
  const langs = m.languageMix.map((l) => l.name).join(' · ');
  const rows = [
    ['Repositories', `${m.repos} product repos + a shared engineering library`],
    ['Commits', `~${compact(m.commits)} across the portfolio`],
    ['Source', `~${compact(m.linesOfSource)} lines of tracked code (${compact(m.trackedFiles)} files)`],
    ['In production', `${m.appsInProduction} apps live; ParentPod shipped to ${m.mobilePlatforms.join(' + ')}`],
    ['Back ends', m.backends.join(' · ')],
    ['Languages', langs],
  ];
  return [
    '| | |',
    '|---|---|',
    ...rows.map(([k, v]) => `| **${k}** | ${v} |`),
    '',
    `<sub>Snapshot as of ${fmtMonth(m.asOf)}. App repositories are private; metrics are aggregated from them.</sub>`,
  ].join('\n');
}

/** Render the engineering-platform inventory. */
function renderPlatform(p) {
  const cmds = p.commands.map((c) => `| \`/${c.name}\` | ${c.does} |`).join('\n');
  const standards = p.standards.map((s) => `\`${s}\``).join(' · ');
  return [
    `${p.summary}`,
    '',
    '**Release-gate commands** (one library, every repo):',
    '',
    '| Command | What it does |',
    '|---|---|',
    cmds,
    '',
    `**Standards-as-code:** ${standards} — plus ${p.skillsCount} reusable skills.`,
    '',
    ...p.practices.map((pr) => `- ${pr}`),
  ].join('\n');
}

/** Build the full markdown that goes between the SHOWCASE markers. */
function buildShowcase(d) {
  return [
    '## Portfolio',
    '',
    renderPortfolio(d.projects),
    '',
    '## By the numbers',
    '',
    renderMetrics(d.metrics),
    '',
    '## The engineering system behind it',
    '',
    renderPlatform(d.platform),
  ].join('\n');
}

// ---------------------------------------------------------------------------
// README update
// ---------------------------------------------------------------------------

/**
 * Replace the SHOWCASE block in README.md.
 * @param {string} body
 * @returns {boolean} true if a change was written
 */
function updateReadme(body) {
  const readmePath = join(ROOT, 'README.md');
  const original = readFileSync(readmePath, 'utf8');

  const startIdx = original.indexOf(START_MARKER);
  const endIdx = original.indexOf(END_MARKER);
  if (startIdx === -1 || endIdx === -1) {
    throw new Error(`SHOWCASE markers not found in README.md. Add ${START_MARKER} and ${END_MARKER}.`);
  }

  const before = original.slice(0, startIdx + START_MARKER.length);
  const after = original.slice(endIdx);
  const updated = `${before}\n\n${body}\n\n${after}`;

  if (updated === original) {
    console.log('README.md already up to date — no changes written.');
    return false;
  }
  writeFileSync(readmePath, updated, 'utf8');
  console.log('README.md updated successfully.');
  return true;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(
    GITHUB_TOKEN
      ? 'GitHub token detected — per-repo push dates will be enriched.'
      : 'No GitHub token — skipping enrichment (set SHOWCASE_TOKEN to enable).'
  );

  const enriched = await Promise.all(data.projects.map(enrichProject));
  const showcase = buildShowcase({ ...data, projects: enriched });
  updateReadme(showcase);
}

main().catch((err) => {
  console.error('generate-showcase failed:', err.message);
  process.exit(1);
});
