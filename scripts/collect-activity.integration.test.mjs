import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

function fixture(t, projects, previous) {
  const dir = mkdtempSync(join(root, '.activity-test-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  for (const name of ['scripts', 'data', 'repos']) mkdirSync(join(dir, name));
  copyFileSync(new URL('./collect-activity.mjs', import.meta.url), join(dir, 'scripts/collect-activity.mjs'));
  writeFileSync(join(dir, 'data/projects.json'), JSON.stringify({ projects }));
  const activityFile = join(dir, 'data/activity.json');
  writeFileSync(activityFile, previous);
  const env = {
    ...process.env,
    SHOWCASE_REPOS_ROOT: join(dir, 'repos'),
    SHOWCASE_LESSONS_FILE: join(dir, 'missing-lessons.md'),
    SHOWCASE_TOKEN: '',
    GITHUB_TOKEN: '',
    GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_CONFIG_NOSYSTEM: '1',
  };
  return {
    dir,
    activityFile,
    run: () => execFileSync(process.execPath, [join(dir, 'scripts/collect-activity.mjs')], {
      env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    }),
    repo(name, files) {
      const base = join(dir, 'repos', name);
      const git = (args) => execFileSync('git', [
        '-c', 'user.name=Showcase Test', '-c', 'user.email=showcase-test@example.invalid',
        '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null', '-C', base, ...args,
      ], { env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
      mkdirSync(base);
      git(['init', '--initial-branch=main']);
      for (const [path, content] of Object.entries(files)) {
        mkdirSync(dirname(join(base, path)), { recursive: true });
        writeFileSync(join(base, path), content);
      }
      git(['add', '.']);
      git(['commit', '-m', 'Create fixture']);
      return { base, git };
    },
  };
}

test('collector computes public headline metrics from reachable shipped history and authored files', (t) => {
  const previous = { metrics: { commits: 999 }, lessons: [{ id: 'LL-001', title: 'Keep evidence', text: 'Measure before reporting.' }] };
  const f = fixture(t, [
    { name: 'Demo', repo: 'public-demo', localRepo: 'demo', status: 'LIVE' },
    { name: 'Paused', repo: 'paused', status: 'Maintenance' },
    { name: 'Hub', localRepo: 'hub', status: 'LIVE' },
    { name: 'Missing', repo: 'missing', status: 'Maintenance' },
  ], JSON.stringify(previous));
  const demo = f.repo('demo', {
    'package.json': '{"version":"1.0.0"}\n',
    'README.md': 'Documentation\n',
    'src/app.ts': 'const a = 1;\nconst b = 2;\nexport { a, b };\n',
    'src/app.css': 'body {}\n',
    'package-lock.json': '{}\n',
    'bundle.min.js': 'bundled();\n',
    'vendor/dependency.js': 'upstream();\n',
    'build/output.js': 'generated();\n',
  });
  demo.git(['update-ref', 'refs/remotes/origin/main', 'HEAD']);
  demo.git(['commit', '--allow-empty', '-m', 'Unshipped change']);
  writeFileSync(join(demo.base, 'untracked.py'), 'ignored = True\n');
  f.repo('paused', { 'app.js': 'const a = 1;\nexport { a };\n' });
  f.repo('hub', { 'README.md': 'Hub\n' });
  mkdirSync(join(f.dir, 'repos', 'not-a-checkout'));

  f.run();
  const result = JSON.parse(readFileSync(f.activityFile, 'utf8'));
  const shippedDate = demo.git(['log', '-1', '--format=%cs', 'origin/main']).trim();
  assert.equal(result.asOf, shippedDate);
  assert.deepEqual(result.metrics, {
    asOf: shippedDate,
    commits: 3,
    commitsByRepo: [
      { label: 'Demo', commits: 1 }, { label: 'Paused', commits: 1 }, { label: 'Hub', commits: 1 },
    ],
    appsInProduction: 1,
    repos: 3,
    trackedFiles: 8,
    linesOfSource: 6,
    languages: [
      { name: 'TypeScript', lines: 3 }, { name: 'JavaScript', lines: 2 }, { name: 'CSS', lines: 1 },
    ],
  });
  assert.equal(result.window, '90d');
  assert.deepEqual(result.repos.map(({ name, recent }) => ({ name, recent })), [
    { name: 'Demo', recent: 1 }, { name: 'Paused', recent: 1 },
  ]);
  assert.deepEqual(result.lessons, previous.lessons);
});

test('collector preserves the published activity byte-for-byte when no repository is reachable', (t) => {
  const previous = '{\n  "asOf": "2026-01-01", "repos": [], "metrics": {"commits": 42}\n}\n';
  const f = fixture(t, [{ name: 'Missing', repo: 'missing', status: 'LIVE' }], previous);
  assert.match(f.run(), /no repos reachable/);
  assert.equal(readFileSync(f.activityFile, 'utf8'), previous);
});
