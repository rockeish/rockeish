import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync, execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'profile-registry-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  for (const name of ['scripts', 'data', 'repos']) {
    if (name === 'repos') mkdirSync(join(dir, name));
    else cpSync(new URL(`../${name}`, import.meta.url), join(dir, name), { recursive: true });
  }
  writeFileSync(join(dir, 'README.md'), 'Published profile must survive unavailable evidence.\n');
  const projects = JSON.parse(readFileSync(join(dir, 'data/projects.json')));
  projects.projects = [{ ...projects.projects[0], name: 'Demo', repo: 'demo', localRepo: 'demo', status: 'LIVE' }];
  writeFileSync(join(dir, 'data/projects.json'), JSON.stringify(projects));
  const registry = join(dir, 'registry.json');
  const env = { ...process.env, SHOWCASE_REGISTRY_FILE: registry,
    SHOWCASE_REPOS_ROOT: join(dir, 'repos'), SHOWCASE_LESSONS_FILE: join(dir, 'absent'),
    SHOWCASE_TOKEN: '', GITHUB_TOKEN: '', GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1' };
  const run = (script) => spawnSync(process.execPath, [join(dir, 'scripts', script)], { env, encoding: 'utf8' });
  return { dir, registry, env, run, seedRegistry() {
    writeFileSync(registry, JSON.stringify({ schema: 1, products: [
      ...Array.from({ length: 21 }, (_, i) => ({ id: `repo-${i}`, repo: `rockeish/${i ? `private-repo-${i}` : 'demo'}`, dir: i ? `repo-${i}` : 'demo' })),
      { id: 'retired-surface', repo: null, dir: null },
    ] }));
  }, repo(name) {
    const base = join(dir, 'repos', name); mkdirSync(base);
    const git = (...args) => execFileSync('git', ['-C', base, '-c', 'user.name=Fixture',
      '-c', 'user.email=fixture@example.invalid', '-c', 'commit.gpgsign=false',
      '-c', 'core.hooksPath=/dev/null', ...args], { env, stdio: 'pipe' });
    git('init', '--initial-branch=main');
    writeFileSync(join(base, 'app.js'), 'export const demo = true;\n');
    git('add', 'app.js'); git('commit', '-m', 'Fixture');
  } };
}

test('registry count wins over host checkouts and publishes no private inventory', (t) => {
  const f = fixture(t); f.seedRegistry(); f.repo('demo'); f.repo('unregistered');
  const collect = f.run('collect-activity.mjs'); assert.equal(collect.status, 0, collect.stderr);
  const bytes = readFileSync(join(f.dir, 'data/activity.json'), 'utf8');
  const activity = JSON.parse(bytes);
  assert.equal(activity.metrics.repos, 21);
  assert.equal(activity.repoCount.count, 21);
  assert.equal(activity.repoCount.source, 'github');
  assert.equal(activity.repoCount.method, 'registry');
  assert.ok(Number.isFinite(Date.parse(activity.repoCount.asOf)));
  assert.ok(!bytes.includes('private-repo-'), 'private inventory stays outside public output');
  const generate = f.run('generate-showcase.mjs'); assert.equal(generate.status, 0, generate.stderr);
  assert.match(readFileSync(join(f.dir, 'README.md'), 'utf8'), /21 repositories/);
});

for (const invalid of ['missing', 'malformed', 'duplicate', 'foreign']) {
  test(`${invalid} registry refuses collection and generation before changing published files`, (t) => {
    const f = fixture(t); f.repo('demo');
    if (invalid === 'malformed') writeFileSync(f.registry, '{');
    if (invalid === 'duplicate') writeFileSync(f.registry, JSON.stringify({ schema: 1, products: [{ repo: 'rockeish/demo' }, { repo: 'rockeish/demo' }] }));
    if (invalid === 'foreign') writeFileSync(f.registry, JSON.stringify({ schema: 1, products: [{ repo: 'someone-else/demo' }] }));
    const activity = readFileSync(join(f.dir, 'data/activity.json'));
    const readme = readFileSync(join(f.dir, 'README.md'));
    for (const script of ['collect-activity.mjs', 'generate-showcase.mjs']) {
      assert.notEqual(f.run(script).status, 0, `${script} must refuse unavailable registry evidence`);
      assert.deepEqual(readFileSync(join(f.dir, 'data/activity.json')), activity);
      assert.deepEqual(readFileSync(join(f.dir, 'README.md')), readme);
    }
  });
}

test('missing checkout root is an unavailable refresh, never a successful fallback', (t) => {
  const f = fixture(t); f.seedRegistry();
  f.env.SHOWCASE_REPOS_ROOT = join(f.dir, 'missing');
  const before = readFileSync(join(f.dir, 'README.md'));
  assert.notEqual(f.run('collect-activity.mjs').status, 0);
  assert.notEqual(f.run('generate-showcase.mjs').status, 0);
  assert.deepEqual(readFileSync(join(f.dir, 'README.md')), before);
});
