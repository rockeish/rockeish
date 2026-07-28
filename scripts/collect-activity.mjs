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
 *   - API (when SHOWCASE_TOKEN is set): reads the GitHub REST API for a remote
 *     refresh when sibling repositories are unavailable.
 *
 * If no repo is reachable, it leaves the
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

export function activityTarget(project) {
  return {
    name: project.name,
    repo: project.repo,
    localRepo: project.localRepo || project.repo,
    packagePath: project.packagePath || 'package.json',
  };
}

// products that map to a git repo, plus this profile repo
const targets = [
  ...data.projects.filter((p) => p.repo).map(activityTarget),
  { name: 'this profile', repo: 'rockeish', localRepo: 'rockeish', packagePath: 'package.json' },
];

function numericVersionParts(value) {
  const match = String(value || '').trim().match(/^v?(\d+(?:\.\d+)*)/);
  return match ? match[1].split('.').map(Number) : null;
}

export function chooseVersion(tagVersion, packageVersion) {
  const tagParts = numericVersionParts(tagVersion);
  const packageParts = numericVersionParts(packageVersion);
  if (!packageParts) return tagVersion || null;
  if (!tagParts) return packageVersion || null;

  const width = Math.max(tagParts.length, packageParts.length);
  for (let index = 0; index < width; index += 1) {
    const tagPart = tagParts[index] || 0;
    const packagePart = packageParts[index] || 0;
    if (packagePart > tagPart) return packageVersion;
    if (packagePart < tagPart) return tagVersion;
  }
  return tagVersion || packageVersion || null;
}

function localStats(repo, packagePath = 'package.json') {
  const base = join(homedir(), 'repos', repo);
  const git = (args) => execFileSync('git', ['-C', base, ...args], { encoding: 'utf8' }).trim();
  try {
    const lastShipped = git(['log', '-1', '--format=%cs']);
    const recent = git(['log', '--since=90 days ago', '--oneline']).split('\n').filter(Boolean).length;
    let tagVersion = null;
    let packageVersion = null;
    try { tagVersion = git(['describe', '--tags', '--abbrev=0']); } catch { /* untagged */ }
    try {
      const packageData = JSON.parse(readFileSync(join(base, packagePath), 'utf8'));
      if (packageData.version) packageVersion = `v${packageData.version}`;
    } catch { /* package metadata is optional */ }
    const version = chooseVersion(tagVersion, packageVersion);
    return { lastShipped, recent, version };
  } catch {
    return null;
  }
}

export async function apiStats(repo, packagePath = 'package.json') {
  const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'rockeish-showcase' };
  const meta = await fetch(`https://api.github.com/repos/${OWNER}/${repo}`, { headers });
  if (!meta.ok) return null;
  const m = await meta.json();
  const lastShipped = (m.pushed_at || '').slice(0, 10);
  let tagVersion = null;
  let packageVersion = null;
  const t = await fetch(`https://api.github.com/repos/${OWNER}/${repo}/tags?per_page=1`, { headers });
  if (t.ok) { const tags = await t.json(); if (tags[0]) tagVersion = tags[0].name; }
  const encodedPackagePath = packagePath.split('/').map(encodeURIComponent).join('/');
  try {
    const p = await fetch(`https://api.github.com/repos/${OWNER}/${repo}/contents/${encodedPackagePath}`, {
      headers: { ...headers, Accept: 'application/vnd.github.raw+json' },
    });
    if (p.ok) {
      const packageData = JSON.parse(await p.text());
      if (packageData.version) packageVersion = `v${packageData.version}`;
    }
  } catch { /* package metadata is optional */ }
  const version = chooseVersion(tagVersion, packageVersion);
  let recent = null;
  // GitHub stats endpoints return 202 with an EMPTY body while computing on a
  // cold cache — only parse on 200, and never let a slow/empty body abort the run.
  const s = await fetch(`https://api.github.com/repos/${OWNER}/${repo}/stats/commit_activity`, { headers });
  if (s.status === 200) {
    try {
      const weeks = await s.json();
      if (Array.isArray(weeks)) recent = weeks.slice(-13).reduce((n, w) => n + (w.total || 0), 0);
    } catch { /* stats not ready */ }
  }
  return lastShipped ? { lastShipped, recent, version } : null;
}

async function main() {
  const out = [];
  for (const target of targets) {
    // Isolate per-target failures: a transient API error on one repo must not
    // abort the whole refresh — skip that target and keep going.
    try {
      const stats = token
        ? await apiStats(target.repo, target.packagePath)
        : localStats(target.localRepo, target.packagePath);
      if (stats && stats.lastShipped) out.push({ name: target.name, ...stats });
    } catch (err) {
      console.warn(`collect-activity: skipping ${target.repo} — ${err?.message || err}`);
    }
  }

  if (!out.length) {
    console.log('collect-activity: no repos reachable — leaving existing activity.json untouched.');
    return;
  }

  out.sort((a, b) => (b.recent || 0) - (a.recent || 0));
  const asOf = out.reduce((max, r) => (r.lastShipped > max ? r.lastShipped : max), '0000-00-00');
  writeFileSync(join(ROOT, 'data', 'activity.json'), JSON.stringify({ asOf, window: '90d', repos: out }, null, 2) + '\n');
  console.log(`collect-activity: wrote ${out.length} repos (asOf ${asOf}).`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
