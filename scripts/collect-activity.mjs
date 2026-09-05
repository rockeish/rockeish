#!/usr/bin/env node
/**
 * collect-activity.mjs
 *
 * Collects public-safe "recently shipped" activity for the showcase and writes
 * data/activity.json. PUBLIC-SAFE ONLY: repo display name, latest version tag,
 * last-shipped date, and a recent-commit count — never commit messages, diffs,
 * or any private detail.
 *
 * Two modes, chosen PER TARGET and local-first:
 *   - Local: reads the sibling git checkout under ~/repos. Exact, immediate,
 *     free, and it is what the refresh cron actually has.
 *   - API (needs SHOWCASE_TOKEN/GITHUB_TOKEN): only for a target with no local
 *     checkout — a cloud or remote refresh.
 *
 * The token used to decide the mode for every target, which broke the profile
 * quietly: the cron exports `SHOWCASE_TOKEN=$(gh auth token)` on the machine
 * that holds the checkouts, so every scheduled run took the API path, and
 * GitHub's /stats/commit_activity answers 202 while it warms a cold cache. The
 * public "Commits · 90d" column and the velocity chart were empty on every
 * scheduled refresh. Presence of a checkout now decides, not presence of a key.
 *
 * If no repo is reachable, it leaves the
 * committed activity.json untouched rather than wiping it.
 *
 * Usage: node scripts/collect-activity.mjs
 */

import { execFileSync } from 'child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { homedir } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const data = JSON.parse(readFileSync(join(ROOT, 'data', 'projects.json'), 'utf8'));
export const repositoryRoot = (env = process.env, home = homedir()) =>
  env.SHOWCASE_REPOS_ROOT || join(home, 'repos');
const REPOS_ROOT = repositoryRoot();

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

/**
 * Where the activity for one target comes from.
 *
 * A local checkout ALWAYS wins. The refresh cron runs on the machine that
 * holds the sibling repositories and exports `SHOWCASE_TOKEN=$(gh auth token)`,
 * so a token-first rule sent every scheduled run down the API path — where
 * `/stats/commit_activity` answers 202 on a cold cache and leaves `recent`
 * null. The public "Commits · 90d" column and the velocity chart had been
 * empty ever since. Git on disk answers exactly, immediately, and for free.
 */
export function chooseSource({ hasLocalCheckout, hasToken }) {
  if (hasLocalCheckout) return 'local';
  return hasToken ? 'api' : 'none';
}

/**
 * Which ref the public figures are counted from.
 *
 * A working checkout is often sitting on a feature branch mid-PR, and counting
 * HEAD there reports that branch's history as the portfolio's. Observed live:
 * one repo's 90-day count moved 89 -> 85 between two runs minutes apart purely
 * because a branch was checked out. The published number must describe what
 * SHIPPED, so prefer the remote default branch and fall back to HEAD only when
 * there is no remote to ask.
 */
export function chooseRef(availableRefs) {
  const available = new Set(availableRefs || []);
  for (const ref of ['origin/main', 'origin/master']) if (available.has(ref)) return ref;
  return 'HEAD';
}

// Extensions this portfolio actually authors. Anything else (markdown, JSON,
// images, config) is real work but is not "lines of source" and must not pad
// the headline.
const SOURCE_LANGUAGES = {
  '.ts': 'TypeScript', '.tsx': 'TypeScript', '.mts': 'TypeScript', '.cts': 'TypeScript',
  '.js': 'JavaScript', '.jsx': 'JavaScript', '.mjs': 'JavaScript', '.cjs': 'JavaScript',
  '.css': 'CSS', '.scss': 'CSS',
  '.php': 'PHP',
  '.sql': 'SQL',
  '.py': 'Python',
  '.sh': 'Bash', '.bash': 'Bash',
};

// Trees that are tracked in git but were not written here: dependencies, build
// output, CocoaPods, and the WordPress admin reference copy under
// `site-reference/` (~114K lines of upstream CSS/JS on its own). Counting them
// would overstate the profile, and a public profile must never overstate.
const NOT_AUTHORED_HERE = [
  'node_modules/', 'dist/', 'build/', '.next/', 'out/', 'vendor/',
  'coverage/', 'site-reference/', 'Pods/', 'third-party/', 'third_party/',
];

/**
 * The language a tracked path counts toward, or null when it must not count.
 */
export function sourceLanguage(path) {
  const file = String(path || '');
  if (NOT_AUTHORED_HERE.some((segment) => file.includes(segment))) return null;
  const base = file.slice(file.lastIndexOf('/') + 1).toLowerCase();
  if (base.includes('lock')) return null;
  if (base.endsWith('.min.js') || base.endsWith('.min.css')) return null;
  const dot = base.lastIndexOf('.');
  if (dot <= 0) return null;
  return SOURCE_LANGUAGES[base.slice(dot)] || null;
}

/**
 * Turn per-language line totals into chart rows: biggest first, with anything
 * under `threshold` of the total folded into a single "Other" slice so the
 * legend stays legible at phone width. The bucket is omitted entirely when
 * nothing falls into it — never an empty slice.
 */
export function groupLanguages(totals, threshold = 0.01) {
  const total = Object.values(totals).reduce((sum, lines) => sum + lines, 0);
  if (!total) return [];
  const named = [];
  let other = 0;
  for (const [name, lines] of Object.entries(totals)) {
    if (lines / total < threshold) other += lines;
    else named.push({ name, lines });
  }
  named.sort((a, b) => b.lines - a.lines);
  if (other) named.push({ name: 'Other', lines: other });
  return named;
}

/**
 * Count tracked, authored source in one checkout. Returns null when the repo
 * cannot be read, so a missing checkout contributes nothing rather than a zero.
 *
 * This reads the working tree rather than `origin/main` the way the commit
 * counts do. Commit counts had to be pinned because an unmerged branch moved
 * one repo's 90-day figure by 4.5%; a branch moves the line total by a few
 * hundred lines in 700K, and reading blobs out of a tree for every file would
 * cost far more than that error is worth.
 */
function countSource(base) {
  let files = 0;
  const byLanguage = {};
  let tracked;
  try {
    tracked = execFileSync('git', ['-C', base, 'ls-files', '-z'], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    }).split('\0');
  } catch {
    return null;
  }
  for (const file of tracked) {
    if (!file) continue;
    if (NOT_AUTHORED_HERE.some((segment) => file.includes(segment))) continue;
    files += 1;
    const language = sourceLanguage(file);
    if (!language) continue;
    let contents;
    try {
      contents = readFileSync(join(base, file));
    } catch {
      continue; // a symlink or a file removed since `ls-files` ran
    }
    let lines = 0;
    for (let at = contents.indexOf(10); at !== -1; at = contents.indexOf(10, at + 1)) lines += 1;
    byLanguage[language] = (byLanguage[language] || 0) + lines;
  }
  return { files, byLanguage };
}

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

/**
 * The headline figures the hero renders, COMPUTED rather than typed.
 *
 * These lived as literals in `projects.json` and froze at 2026-07-11 — five
 * weeks in which the profile claimed "4 apps in production" while six were
 * live, and listed commit totals that predated EngiByte, JaLingo and TheLoop
 * entirely. The generator's own docstring says nothing on the page is
 * hand-maintained; this makes that true of the numbers too.
 *
 * `appsInProduction` counts only products whose declared status says LIVE and
 * that have a repository behind them. Maintenance-mode products are
 * deliberately not counted, and neither is the hub site — the public profile
 * must never overstate, so the rule stays conservative and mechanical.
 */
function computeMetrics(projects, asOf) {
  const commitsByRepo = [];
  const linesByLanguage = {};
  let commits = 0;
  let trackedFiles = 0;
  for (const project of projects) {
    const repo = project.localRepo || project.repo;
    if (!repo) continue;
    const base = join(REPOS_ROOT, repo);
    try {
      const count = Number(
        execFileSync('git', ['-C', base, 'rev-list', '--count', localRef(base)], {
          encoding: 'utf8',
        }).trim(),
      );
      if (!Number.isFinite(count) || count === 0) continue;
      commits += count;
      commitsByRepo.push({ label: project.name, commits: count });
    } catch {
      // A repo that is not checked out locally simply does not contribute.
      continue;
    }
    const source = countSource(base);
    if (!source) continue;
    trackedFiles += source.files;
    for (const [language, lines] of Object.entries(source.byLanguage)) {
      linesByLanguage[language] = (linesByLanguage[language] || 0) + lines;
    }
  }
  if (!commitsByRepo.length) return null;
  commitsByRepo.sort((a, b) => b.commits - a.commits);
  const languages = groupLanguages(linesByLanguage);
  const linesOfSource = languages.reduce((sum, language) => sum + language.lines, 0);
  const checkouts = countCheckouts();

  // Requires `repo`, not `localRepo`: the hub site is a production web property
  // but it is not an app, and it only has a local checkout. Counting it would
  // inflate the headline, and a public profile must never overstate.
  const appsInProduction = projects.filter(
    (project) => /\blive\b/i.test(project.status || '') && project.repo,
  ).length;

  return {
    asOf,
    commits,
    commitsByRepo,
    appsInProduction,
    ...(checkouts ? { repos: checkouts } : {}),
    // Omitted rather than zeroed when nothing could be counted: the generator
    // then falls back to the declared figures, which carry their own older
    // `asOf`, so a stale number can never present itself as today's.
    ...(linesOfSource ? { trackedFiles, linesOfSource, languages } : {}),
  };
}

/**
 * How many repositories the portfolio actually is.
 *
 * The hero's "14 repos" was the last hand-typed figure under a caption that
 * says every number is computed, so it could drift silently the way the commit
 * total and the line count already had. Counted, it cannot.
 */
function countCheckouts() {
  try {
    return readdirSync(REPOS_ROOT, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && existsSync(join(REPOS_ROOT, entry.name, '.git')))
      .length;
  } catch {
    return null; // no ~/repos here — the declared figure, with its own asOf, stands
  }
}

/** The ref to count from in a checkout, resolved against what actually exists. */
function localRef(base) {
  const present = [];
  for (const ref of ['origin/main', 'origin/master']) {
    try {
      execFileSync('git', ['-C', base, 'rev-parse', '--verify', '--quiet', ref], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      present.push(ref);
    } catch { /* not this one */ }
  }
  return chooseRef(present);
}

export function localStats(repo, packagePath = 'package.json', reposRoot = REPOS_ROOT) {
  const base = join(reposRoot, repo);
  const git = (args) => execFileSync('git', ['-C', base, ...args], { encoding: 'utf8' }).trim();
  try {
    const ref = localRef(base);
    const lastShipped = git(['log', '-1', '--format=%cs', ref]);
    const recent = git(['log', '--since=90 days ago', '--oneline', ref]).split('\n').filter(Boolean).length;
    let tagVersion = null;
    let packageVersion = null;
    // An untagged repo makes `describe` fail loudly on stderr every run; that
    // noise trained the refresh log to look broken when it was fine.
    try {
      tagVersion = execFileSync('git', ['-C', base, 'describe', '--tags', '--abbrev=0', ref], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim();
    } catch { /* untagged */ }
    try {
      // Keep version evidence on the same shipped ref as the date and commit
      // count. A checkout can legitimately sit on an older feature branch;
      // reading its worktree package.json made the public profile regress even
      // while origin/main held the current release.
      const packageJson = execFileSync('git', ['-C', base, 'show', `${ref}:${packagePath}`], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim();
      const packageData = JSON.parse(packageJson);
      if (packageData.version) packageVersion = `v${packageData.version}`;
    } catch { /* package metadata is optional */ }
    const version = chooseVersion(tagVersion, packageVersion);
    return { lastShipped, recent, version };
  } catch {
    return null;
  }
}

export async function apiStats(repo, packagePath = 'package.json', { retries = 3, retryDelayMs = 800 } = {}) {
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
  // cold cache, then 200 once the cache is warm. Asking once and giving up left
  // the whole 90-day column empty, so retry a bounded number of times — but
  // never let a slow or empty body abort the run, and never substitute a number
  // that was not measured. Unknown stays null and renders as "—".
  for (let attempt = 0; attempt < Math.max(1, retries) && recent === null; attempt += 1) {
    if (attempt > 0 && retryDelayMs > 0) {
      await new Promise((resolve) => { setTimeout(resolve, retryDelayMs); });
    }
    const s = await fetch(`https://api.github.com/repos/${OWNER}/${repo}/stats/commit_activity`, { headers });
    if (s.status !== 200 && s.status !== 202) break; // 404/403 will not become 200
    try {
      const weeks = await s.json();
      if (Array.isArray(weeks) && weeks.length) {
        recent = weeks.slice(-13).reduce((n, w) => n + (w.total || 0), 0);
      }
    } catch { /* stats not ready yet */ }
  }
  return lastShipped ? { lastShipped, recent, version } : null;
}

async function main() {
  const out = [];
  for (const target of targets) {
    // Isolate per-target failures: a transient API error on one repo must not
    // abort the whole refresh — skip that target and keep going.
    try {
      const source = chooseSource({
        hasLocalCheckout: existsSync(join(REPOS_ROOT, target.localRepo, '.git')),
        hasToken: Boolean(token),
      });
      if (source === 'none') continue;
      const stats = source === 'local'
        ? localStats(target.localRepo, target.packagePath)
        : await apiStats(target.repo, target.packagePath);
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
  const metrics = computeMetrics(data.projects, asOf);
  const payload = { asOf, window: '90d', repos: out, ...(metrics ? { metrics } : {}) };
  writeFileSync(join(ROOT, 'data', 'activity.json'), JSON.stringify(payload, null, 2) + '\n');
  console.log(
    `collect-activity: wrote ${out.length} repos (asOf ${asOf})` +
      (metrics ? `, ${metrics.commits} commits, ${metrics.appsInProduction} apps live.` : '.'),
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
