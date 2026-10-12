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
import { existsSync, readdirSync, readFileSync, realpathSync, statSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { homedir } from 'os';
import { createHash } from 'node:crypto';
import { repositoryInventory, requireCheckoutRoot } from './repository-registry.mjs';

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
 * Count authored blobs at the same pinned commit as the history count.
 * Batch reads keep checkout branches, dirty files and missing worktree files
 * out of public totals. An unavailable committed blob makes coverage Unknown.
 */
function countSource(base, commit) {
  let files = 0;
  const byLanguage = {};
  let tracked;
  try {
    tracked = execFileSync('git', ['-C', base, 'ls-tree', '-r', '-z', commit], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    }).split('\0');
  } catch {
    return null;
  }
  const authored = [];
  for (const entry of tracked) {
    if (!entry) continue;
    const match = /^(\d+) (\w+) ([a-f0-9]{40,64})\t([\s\S]+)$/.exec(entry);
    if (!match) return null;
    const [, mode, type, oid, file] = match;
    if (type !== 'blob' || !['100644', '100755'].includes(mode)) continue;
    if (NOT_AUTHORED_HERE.some((segment) => file.includes(segment))) continue;
    files += 1;
    const language = sourceLanguage(file);
    if (!language) continue;
    authored.push({ oid, language });
  }
  if (authored.length) {
    let batch;
    try {
      batch = execFileSync('git', ['-C', base, 'cat-file', '--batch'], {
        input: authored.map(({ oid }) => oid).join('\n') + '\n',
        maxBuffer: 64 * 1024 * 1024, timeout: 30000,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
    } catch { return null; }
    let offset = 0;
    for (const { oid, language } of authored) {
      const end = batch.indexOf(10, offset);
      if (end < 0) return null;
      const header = /^([a-f0-9]{40,64}) blob (\d+)$/.exec(batch.subarray(offset, end).toString());
      if (!header || header[1] !== oid) return null;
      const size = Number(header[2]);
      const start = end + 1;
      if (!Number.isSafeInteger(size) || start + size >= batch.length || batch[start + size] !== 10) return null;
      const contents = batch.subarray(start, start + size);
      let lines = 0;
      for (let at = contents.indexOf(10); at !== -1; at = contents.indexOf(10, at + 1)) lines += 1;
      byLanguage[language] = (byLanguage[language] || 0) + lines;
      offset = start + size + 1;
    }
    if (offset !== batch.length) return null;
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
function computeMetrics(projects, asOf, inventory) {
  const commitsByRepo = [];
  const linesByLanguage = {};
  let commits = 0;
  let trackedFiles = 0;
  let commitsMeasured = 0;
  let sourceMeasured = 0;
  let otherCommits = 0;
  const revisions = [];
  for (const member of inventory.repositories) {
    const base = join(REPOS_ROOT, member.dir);
    const project = projects.find((p) => p.repo && `rockeish/${p.repo}`.toLowerCase() === member.repo);
    let commit;
    try {
      if (realpathSync(base).split('/').includes('ai-runtime')) continue;
      commit = execFileSync('git', ['-C', base, 'rev-parse', '--verify', `${localRef(base)}^{commit}`], {
        encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
      }).trim();
      const count = Number(
        execFileSync('git', ['-C', base, 'rev-list', '--count', commit], {
          encoding: 'utf8',
        }).trim(),
      );
      if (!Number.isFinite(count) || count === 0) continue;
      commits += count;
      commitsMeasured += 1;
      revisions.push([member.repo, commit]);
      if (project) commitsByRepo.push({ label: project.name, commits: count });
      else otherCommits += count; // Never publish private inventory identities.
    } catch {
      // A repo that is not checked out locally simply does not contribute.
      continue;
    }
    const source = countSource(base, commit);
    if (!source) continue;
    sourceMeasured += 1;
    trackedFiles += source.files;
    for (const [language, lines] of Object.entries(source.byLanguage)) {
      linesByLanguage[language] = (linesByLanguage[language] || 0) + lines;
    }
  }
  if (!commitsMeasured) return null;
  if (otherCommits) commitsByRepo.push({ label: 'Other repositories', commits: otherCommits });
  commitsByRepo.sort((a, b) => b.commits - a.commits);
  const languages = groupLanguages(linesByLanguage);
  const linesOfSource = languages.reduce((sum, language) => sum + language.lines, 0);

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
    repos: inventory.receipt.count,
    historyCoverage: { scope: 'owned non-archived repositories',
      expected: inventory.receipt.count, inventoryDigest: inventory.receipt.digest,
      revisionDigest: createHash('sha256').update(JSON.stringify(revisions.sort())).digest('hex'),
      commitsMeasured, sourceMeasured },
    // Explicit measured values replace declared totals even when source is empty.
    trackedFiles: sourceMeasured ? trackedFiles : null,
    linesOfSource: sourceMeasured ? linesOfSource : null, languages,
  };
}

/**
 * Diagnostic clone count only. GitHub inventory owns the headline count.
 */
// A linked worktree has a `.git` FILE, not a directory; counting it made the
// figure depend on which worktrees one host happened to have open (D1-003).
export function countCheckouts(reposRoot = REPOS_ROOT) {
  try {
    return readdirSync(reposRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && statSync(join(reposRoot, entry.name, '.git'), { throwIfNoEntry: false })?.isDirectory())
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

/**
 * Where the ecosystem's lessons-learned file lives. `~/ai/LESSONS.md` is the
 * canonical copy on the machine the refresh cron runs on; a cloud or remote
 * refresh can point `SHOWCASE_LESSONS_FILE` at a checkout.
 */
export const lessonsSource = (env = process.env, home = homedir()) =>
  env.SHOWCASE_LESSONS_FILE || join(home, 'ai', 'LESSONS.md');

/**
 * The public-safe rows of LESSONS.md: id, title and the `Public:` sentence,
 * NOTHING ELSE. Rule text, evidence and enforcement details describe private
 * repositories and stay behind. A lesson whose `Public:` line is `no` (or
 * missing) is skipped. The same field convention as the incident registry:
 * `Key: value`, continuation lines indented two spaces.
 */
export function parsePublicLessons(text) {
  const out = [];
  const blocks = String(text || '').split(/^## (?=LL-\d+ — )/m).slice(1);
  for (const block of blocks) {
    const [header, ...rest] = block.split('\n');
    const head = header.match(/^(LL-\d+) — (.+)$/);
    if (!head) continue;
    let pub = null;
    for (let i = 0; i < rest.length; i += 1) {
      const m = rest[i].match(/^Public:\s*(.*)$/);
      if (!m) continue;
      pub = m[1].trim();
      for (let j = i + 1; j < rest.length && /^  \S/.test(rest[j]); j += 1) pub += ` ${rest[j].trim()}`;
      break;
    }
    if (!pub || pub.toLowerCase() === 'no') continue;
    out.push({ id: head[1], title: head[2].trim(), text: pub });
  }
  return out;
}

// Markers that must never reach the public page. `~/` and `/home/` leak the
// machine; the rest are private names the lessons file keeps private on its own
// side too. Belt and braces: the source file is audited, and so is this output.
const PRIVATE_MARKERS = ['~/', '/home/', 'Doppler', 'doppler', 'Krystal', 'Noah', 'Invenergy', 'INC-', '@'];

/**
 * Read the lessons file, or keep what is already published when it cannot be
 * read — the same contract as the activity itself: an unreachable source never
 * wipes the committed rendering. A row carrying a private marker is dropped
 * here as well, so a slip in the source cannot be published by this generator.
 */
export function collectLessons(file, fallback = []) {
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    return Array.isArray(fallback) ? fallback : [];
  }
  return parsePublicLessons(text).filter((l) =>
    !PRIVATE_MARKERS.some((m) => l.text.includes(m) || l.title.includes(m)));
}

async function main() {
  const inventory = repositoryInventory();
  requireCheckoutRoot();
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
    throw new Error('collect-activity: no repos reachable — leaving existing activity.json untouched.');
  }

  out.sort((a, b) => (b.recent || 0) - (a.recent || 0));
  const asOf = out.reduce((max, r) => (r.lastShipped > max ? r.lastShipped : max), '0000-00-00');
  const metrics = computeMetrics(data.projects, asOf, inventory);
  if (!metrics) throw new Error('Project metrics unavailable; refusing profile refresh');
  let previous = {};
  try {
    previous = JSON.parse(readFileSync(join(ROOT, 'data', 'activity.json'), 'utf8'));
  } catch { /* first run */ }
  const lessons = collectLessons(lessonsSource(), previous.lessons);
  const payload = { asOf, window: '90d', repoCount: inventory.receipt, repos: out, metrics, lessons };
  writeFileSync(join(ROOT, 'data', 'activity.json'), JSON.stringify(payload, null, 2) + '\n');
  console.log(
    `collect-activity: wrote ${out.length} repos (asOf ${asOf})` +
      (metrics ? `, ${metrics.commits} commits, ${metrics.appsInProduction} apps live` : '') +
      `, ${lessons.length} public lessons.`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
