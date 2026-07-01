#!/usr/bin/env node
/**
 * collect-activity.mjs
 *
 * Collects public-safe "recently shipped" activity for the showcase and writes
 * data/activity.json. PUBLIC-SAFE ONLY: repo display name, latest version tag,
 * last-shipped date, and a recent-commit count — never commit messages, diffs,
 * or any private detail.
 *
 * Two modes:
 *   - Local (default): reads the sibling git repos under ~/repos. Run this from
 *     the dev machine (e.g. as part of /ship) to refresh real data.
 *   - API (when SHOWCASE_TOKEN is set): reads the GitHub REST API, so the
 *     scheduled GitHub Action can self-update the section without local repos.
 *
 * If no repo is reachable (e.g. the Action runs without a token), it leaves the
 * committed activity.json untouched rather than wiping it.
 *
 * Usage: node scripts/collect-activity.mjs
 */

import { execFileSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { homedir } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const data = JSON.parse(readFileSync(join(ROOT, 'data', 'projects.json'), 'utf8'));

const OWNER = 'rockeish';
const token = process.env.SHOWCASE_TOKEN || process.env.GITHUB_TOKEN;
// products that map to a git repo, plus this profile repo
const targets = [
  ...data.projects.filter((p) => p.repo).map((p) => ({ name: p.name, repo: p.repo })),
  { name: 'this profile', repo: 'rockeish' },
];

function localStats(repo) {
  const base = join(homedir(), 'repos', repo);
  const git = (args) => execFileSync('git', ['-C', base, ...args], { encoding: 'utf8' }).trim();
  try {
    const lastShipped = git(['log', '-1', '--format=%cs']);
    const recent = git(['log', '--since=90 days ago', '--oneline']).split('\n').filter(Boolean).length;
    let version = null;
    try { version = git(['describe', '--tags', '--abbrev=0']); } catch { /* untagged */ }
    return { lastShipped, recent, version };
  } catch {
    return null;
  }
}

async function apiStats(repo) {
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'rockeish-showcase' };
  const meta = await fetch(`https://api.github.com/repos/${OWNER}/${repo}`, { headers });
  if (!meta.ok) return null;
  const m = await meta.json();
  const lastShipped = (m.pushed_at || '').slice(0, 10);
  let version = null;
  const t = await fetch(`https://api.github.com/repos/${OWNER}/${repo}/tags?per_page=1`, { headers });
  if (t.ok) { const tags = await t.json(); if (tags[0]) version = tags[0].name; }
  let recent = null;
  const s = await fetch(`https://api.github.com/repos/${OWNER}/${repo}/stats/commit_activity`, { headers });
  if (s.ok) { const weeks = await s.json(); if (Array.isArray(weeks)) recent = weeks.slice(-13).reduce((n, w) => n + (w.total || 0), 0); }
  return lastShipped ? { lastShipped, recent, version } : null;
}

const out = [];
for (const target of targets) {
  const stats = token ? await apiStats(target.repo) : localStats(target.repo);
  if (stats && stats.lastShipped) out.push({ name: target.name, ...stats });
}

if (!out.length) {
  console.log('collect-activity: no repos reachable — leaving existing activity.json untouched.');
  process.exit(0);
}

out.sort((a, b) => (b.recent || 0) - (a.recent || 0));
const asOf = out.reduce((max, r) => (r.lastShipped > max ? r.lastShipped : max), '0000-00-00');
writeFileSync(join(ROOT, 'data', 'activity.json'), JSON.stringify({ asOf, window: '90d', repos: out }, null, 2) + '\n');
console.log(`collect-activity: wrote ${out.length} repos (asOf ${asOf}).`);
