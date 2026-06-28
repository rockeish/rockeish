#!/usr/bin/env node
/**
 * generate-showcase.mjs
 *
 * Rewrites the <!-- SHOWCASE:START --> ... <!-- SHOWCASE:END --> block in README.md.
 *
 * Optional enrichment: when SHOWCASE_TOKEN or GITHUB_TOKEN is set, each project with
 * a "repo" field is looked up via the GitHub REST API to pull in stars, primary
 * language, and last-push date. Enrichment is silently skipped when:
 *   - no token is present
 *   - the repo field is null
 *   - the API returns any non-200 status (private repo without sufficient scope, etc.)
 *
 * The script is idempotent: a second run with the same data produces no file change.
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

// ---------------------------------------------------------------------------
// Load project data
// ---------------------------------------------------------------------------

const projects = JSON.parse(
  readFileSync(join(ROOT, 'data', 'projects.json'), 'utf8')
);

// ---------------------------------------------------------------------------
// GitHub enrichment (optional, gracefully skipped)
// ---------------------------------------------------------------------------

const GITHUB_TOKEN =
  process.env.SHOWCASE_TOKEN || process.env.GITHUB_TOKEN || '';
const GITHUB_USER = 'rockeish';

/**
 * Fetch JSON from a URL, returning null on any error or non-200 response.
 * @param {string} url
 * @param {string} token
 * @returns {Promise<object|null>}
 */
function fetchJSON(url, token) {
  return new Promise((resolve) => {
    const options = {
      headers: {
        'User-Agent': 'rockeish-showcase-generator/1.0',
        Accept: 'application/vnd.github.v3+json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
    get(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        if (res.statusCode !== 200) {
          resolve(null);
          return;
        }
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
 * Return an enriched copy of the project object, or the original if enrichment
 * is unavailable.
 * @param {object} project
 * @returns {Promise<object>}
 */
async function enrichProject(project) {
  if (!GITHUB_TOKEN || !project.repo) return project;
  const data = await fetchJSON(
    `https://api.github.com/repos/${GITHUB_USER}/${project.repo}`,
    GITHUB_TOKEN
  );
  if (!data) return project;
  return {
    ...project,
    stars: typeof data.stargazers_count === 'number' ? data.stargazers_count : null,
    language: data.language ?? null,
    pushedAt: typeof data.pushed_at === 'string' ? data.pushed_at.slice(0, 10) : null,
  };
}

// ---------------------------------------------------------------------------
// Markdown generation
// ---------------------------------------------------------------------------

/**
 * Format an ISO date string as "Mon DD, YYYY".
 * @param {string} iso  e.g. "2026-06-01"
 * @returns {string}
 */
function fmtDate(iso) {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Build the markdown content that goes *between* the SHOWCASE markers.
 * @param {object[]} enrichedProjects
 * @returns {string}
 */
function buildShowcase(enrichedProjects) {
  const today = new Date().toISOString().slice(0, 10);

  const rows = enrichedProjects.map((p) => {
    const nameCell = p.url
      ? `**[${p.name}](${p.url})**`
      : `**${p.name}**`;

    const stackCell = p.stack.join(' · ');

    const extras = [];
    if (p.stars != null && p.stars > 0) extras.push(`${p.stars} stars`);
    if (p.pushedAt) extras.push(`updated ${fmtDate(p.pushedAt)}`);

    const descCell =
      extras.length > 0
        ? `${p.description} *(${extras.join(', ')})*`
        : p.description;

    return `| ${nameCell} | ${descCell} | ${stackCell} |`;
  });

  return [
    '| Project | Description | Stack |',
    '|---|---|---|',
    ...rows,
    '',
    `*Last refreshed: ${today}*`,
  ].join('\n');
}

// ---------------------------------------------------------------------------
// README update
// ---------------------------------------------------------------------------

const START_MARKER = '<!-- SHOWCASE:START -->';
const END_MARKER = '<!-- SHOWCASE:END -->';

/**
 * Replace the showcase block in README.md with the new content.
 * Returns true if a change was written, false if already up to date.
 * @param {string} showcaseBody
 * @returns {boolean}
 */
function updateReadme(showcaseBody) {
  const readmePath = join(ROOT, 'README.md');
  const original = readFileSync(readmePath, 'utf8');

  const startIdx = original.indexOf(START_MARKER);
  const endIdx = original.indexOf(END_MARKER);

  if (startIdx === -1 || endIdx === -1) {
    throw new Error(
      'SHOWCASE markers not found in README.md. ' +
        'Add <!-- SHOWCASE:START --> and <!-- SHOWCASE:END --> markers.'
    );
  }

  const before = original.slice(0, startIdx + START_MARKER.length);
  const after = original.slice(endIdx);
  const updated = `${before}\n${showcaseBody}\n${after}`;

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
  if (GITHUB_TOKEN) {
    console.log('GitHub token detected — enrichment enabled.');
  } else {
    console.log('No GitHub token — skipping enrichment (set SHOWCASE_TOKEN or GITHUB_TOKEN to enable).');
  }

  const enrichedProjects = await Promise.all(projects.map(enrichProject));
  const showcaseBody = buildShowcase(enrichedProjects);
  updateReadme(showcaseBody);
}

main().catch((err) => {
  console.error('generate-showcase failed:', err.message);
  process.exit(1);
});
