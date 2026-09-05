import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  activityTarget,
  apiStats,
  chooseRef,
  chooseSource,
  chooseVersion,
  groupLanguages,
  localStats,
  repositoryRoot,
  sourceLanguage,
} from './collect-activity.mjs';

// Helper: a fake fetch that routes by URL and lets each endpoint be scripted.
function fakeFetch(routes) {
  return async (url) => {
    for (const [needle, resp] of routes) {
      if (url.includes(needle)) return resp();
    }
    throw new Error(`unexpected fetch: ${url}`);
  };
}

const okJson = (body) => ({ ok: true, status: 200, json: async () => body });
const okText = (body) => ({ ok: true, status: 200, text: async () => body });
const notFound = () => ({ ok: false, status: 404 });

test('repositoryRoot accepts an explicit checkout inventory for mixed hosts', () => {
  assert.equal(
    repositoryRoot({ SHOWCASE_REPOS_ROOT: '/srv/portfolio' }, '/ignored/home'),
    '/srv/portfolio',
  );
  assert.equal(repositoryRoot({}, '/home/rock'), join('/home/rock', 'repos'));
});

test('chooseVersion prefers newer package metadata over a stale release tag', () => {
  assert.equal(chooseVersion('v2.62.10', 'v2.62.310'), 'v2.62.310');
  assert.equal(chooseVersion('v3.6.4', 'v3.6.3'), 'v3.6.4');
  assert.equal(chooseVersion('v1.9.99', 'v1.10.0'), 'v1.10.0');
  assert.equal(chooseVersion('v1.2.3', 'v1.2.3'), 'v1.2.3');
  assert.equal(chooseVersion(null, 'v1.2.3'), 'v1.2.3');
});

test('activityTarget maps checkout and package metadata paths independently', () => {
  assert.deepEqual(
    activityTarget({ name: 'TheLoop', repo: 'RealKith', localRepo: 'theloop' }),
    { name: 'TheLoop', repo: 'RealKith', localRepo: 'theloop', packagePath: 'package.json' },
  );
  assert.deepEqual(
    activityTarget({ name: 'EngiByte', repo: 'engibyte', packagePath: 'mobile/package.json' }),
    {
      name: 'EngiByte',
      repo: 'engibyte',
      localRepo: 'engibyte',
      packagePath: 'mobile/package.json',
    },
  );
});

test('localStats reads release metadata from origin/main, not an older checked-out branch', () => {
  const reposRoot = mkdtempSync(join(tmpdir(), 'showcase-version-ref-'));
  const repo = join(reposRoot, 'demo');
  const git = (args) => execFileSync('git', ['-C', repo, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();

  try {
    mkdirSync(repo);
    execFileSync('git', ['init', '--initial-branch=main', repo], { stdio: 'ignore' });
    git(['config', 'user.email', 'showcase-test@example.invalid']);
    git(['config', 'user.name', 'Showcase Test']);

    writeFileSync(join(repo, 'package.json'), '{"name":"demo","version":"3.11.0"}\n');
    git(['add', 'package.json']);
    git(['commit', '-m', 'old release']);
    git(['tag', 'v3.11.0']);

    writeFileSync(join(repo, 'package.json'), '{"name":"demo","version":"3.16.9"}\n');
    git(['add', 'package.json']);
    git(['commit', '-m', 'current release']);
    git(['update-ref', 'refs/remotes/origin/main', 'HEAD']);

    git(['switch', '--detach', 'HEAD~1']);
    assert.equal(JSON.parse(readFileSync(join(repo, 'package.json'), 'utf8')).version, '3.11.0');

    const stats = localStats('demo', 'package.json', reposRoot);
    assert.equal(stats.version, 'v3.16.9');
    assert.equal(stats.recent, 2);
  } finally {
    rmSync(reposRoot, { recursive: true, force: true });
  }
});

test('apiStats survives a 202 (empty body) from the stats endpoint', async () => {
  const original = global.fetch;
  global.fetch = fakeFetch([
    ['/repos/rockeish/demo/tags', () => okJson([{ name: 'v1.2.3' }])],
    ['/repos/rockeish/demo/contents/package.json', () => { throw new Error('package lookup unavailable'); }],
    ['/stats/commit_activity', () => ({
      ok: true,
      status: 202,
      // GitHub returns 202 with an empty body; .json() throws SyntaxError.
      json: async () => { throw new SyntaxError('Unexpected end of JSON input'); },
    })],
    ['/repos/rockeish/demo', () => okJson({ pushed_at: '2026-06-30T12:00:00Z' })],
  ]);
  try {
    const stats = await apiStats('demo', 'package.json', { retries: 1 }); // must NOT throw
    assert.equal(stats.lastShipped, '2026-06-30');
    assert.equal(stats.version, 'v1.2.3'); // tag fallback survives optional package lookup failure
    assert.equal(stats.recent, null); // still not ready after the retries → honestly left null
  } finally {
    global.fetch = original;
  }
});

test('apiStats sums the last 13 weeks when stats are ready (200)', async () => {
  const original = global.fetch;
  const weeks = Array.from({ length: 20 }, (_, i) => ({ total: i + 1 }));
  global.fetch = fakeFetch([
    ['/repos/rockeish/demo/tags', () => okJson([])],
    ['/repos/rockeish/demo/contents/package.json', notFound],
    ['/stats/commit_activity', () => okJson(weeks)],
    ['/repos/rockeish/demo', () => okJson({ pushed_at: '2026-06-30T12:00:00Z' })],
  ]);
  try {
    const stats = await apiStats('demo', 'package.json', { retryDelayMs: 0 });
    // last 13 of totals 1..20 -> 8..20 = 182
    assert.equal(stats.recent, 182);
    assert.equal(stats.version, null);
  } finally {
    global.fetch = original;
  }
});

test('apiStats prefers newer package metadata and supports a nested package path', async () => {
  const original = global.fetch;
  global.fetch = fakeFetch([
    ['/repos/rockeish/demo/tags', () => okJson([{ name: 'v1.2.3' }])],
    ['/repos/rockeish/demo/contents/mobile/package.json', () => okText('{"version":"1.4.0"}')],
    ['/stats/commit_activity', () => okJson([])],
    ['/repos/rockeish/demo', () => okJson({ pushed_at: '2026-06-30T12:00:00Z' })],
  ]);
  try {
    const stats = await apiStats('demo', 'mobile/package.json', { retryDelayMs: 0 });
    assert.equal(stats.version, 'v1.4.0');
  } finally {
    global.fetch = original;
  }
});

test('a local checkout wins over the API even when a token is present', () => {
  // The refresh cron exports SHOWCASE_TOKEN=$(gh auth token) on the machine
  // that HOLDS the sibling checkouts, so a token-first rule sent every
  // scheduled run down the API path — where /stats/commit_activity answers 202
  // on a cold cache and leaves `recent` null. The 90-day column had been empty
  // on the public profile ever since.
  assert.equal(chooseSource({ hasLocalCheckout: true, hasToken: true }), 'local');
  assert.equal(chooseSource({ hasLocalCheckout: true, hasToken: false }), 'local');
  assert.equal(chooseSource({ hasLocalCheckout: false, hasToken: true }), 'api');
  assert.equal(chooseSource({ hasLocalCheckout: false, hasToken: false }), 'none');
});

test('sourceLanguage counts authored source and ignores vendored, built and generated files', () => {
  assert.equal(sourceLanguage('src/app/page.tsx'), 'TypeScript');
  assert.equal(sourceLanguage('functions/src/index.ts'), 'TypeScript');
  assert.equal(sourceLanguage('themes/neve-child/js/rent-vs-buy.js'), 'JavaScript');
  assert.equal(sourceLanguage('src/styles/globals.css'), 'CSS');
  assert.equal(sourceLanguage('supabase/migrations/001_init.sql'), 'SQL');
  assert.equal(sourceLanguage('themes/neve-child/functions.php'), 'PHP');
  // Not authored by this portfolio, or not source at all.
  assert.equal(sourceLanguage('site-reference/wp-admin~js/js/updates.js'), null);
  assert.equal(sourceLanguage('node_modules/react/index.js'), null);
  assert.equal(sourceLanguage('dist/bundle.js'), null);
  assert.equal(sourceLanguage('ios/App/Pods/Firebase/x.js'), null);
  assert.equal(sourceLanguage('public/vendor/chart.min.js'), null);
  assert.equal(sourceLanguage('package-lock.json'), null);
  assert.equal(sourceLanguage('README.md'), null);
});

test('groupLanguages folds slivers into Other and sorts by size', () => {
  const grouped = groupLanguages({ TypeScript: 600, JavaScript: 300, Python: 5, Bash: 5 }, 0.01);
  assert.deepEqual(grouped, [
    { name: 'TypeScript', lines: 600 },
    { name: 'JavaScript', lines: 300 },
    { name: 'Other', lines: 10 },
  ]);
  // Nothing below the threshold means no Other bucket at all — never an empty slice.
  assert.deepEqual(groupLanguages({ TypeScript: 10 }, 0.01), [{ name: 'TypeScript', lines: 10 }]);
});

test('apiStats retries a 202 rather than shipping an empty 90-day column', async () => {
  const original = global.fetch;
  let attempts = 0;
  const weeks = Array.from({ length: 13 }, () => ({ total: 2 }));
  global.fetch = fakeFetch([
    ['/repos/rockeish/demo/tags', () => okJson([])],
    ['/repos/rockeish/demo/contents/package.json', notFound],
    ['/stats/commit_activity', () => {
      attempts += 1;
      if (attempts < 3) return { ok: true, status: 202, json: async () => { throw new SyntaxError('empty'); } };
      return okJson(weeks);
    }],
    ['/repos/rockeish/demo', () => okJson({ pushed_at: '2026-06-30T12:00:00Z' })],
  ]);
  try {
    const stats = await apiStats('demo', 'package.json', { retries: 3, retryDelayMs: 0 });
    assert.equal(attempts, 3);
    assert.equal(stats.recent, 26);
  } finally {
    global.fetch = original;
  }
});

test('chooseRef counts from the remote default branch, not whatever is checked out', () => {
  assert.equal(chooseRef(['origin/main', 'origin/feature-x']), 'origin/main');
  assert.equal(chooseRef(['origin/master']), 'origin/master');
  assert.equal(chooseRef(['origin/main', 'origin/master']), 'origin/main');
  // No remote to ask: HEAD is the only honest answer, not a silent zero.
  assert.equal(chooseRef([]), 'HEAD');
  assert.equal(chooseRef(undefined), 'HEAD');
});
