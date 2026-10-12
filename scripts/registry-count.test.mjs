import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync, execFileSync } from 'node:child_process';
import { chmodSync, cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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
  const inventory = join(dir, 'github-inventory.json');
  mkdirSync(join(dir, 'bin'));
  const gh = join(dir, 'bin', 'gh');
  writeFileSync(gh, `#!${process.execPath}\nimport { readFileSync } from 'node:fs';\n`
    + `if (process.argv.slice(2).join(' ') !== 'repo list rockeish --limit 1000 --json nameWithOwner,isArchived') process.exit(99);\n`
    + `if (process.env.FIXTURE_GH_FAIL) { console.error('private credential text must stay private'); process.exit(1); }\n`
    + `process.stdout.write(readFileSync(process.env.FIXTURE_GH_INVENTORY));\n`);
  chmodSync(gh, 0o755);
  const env = { ...process.env, SHOWCASE_REGISTRY_FILE: registry,
    SHOWCASE_REPOS_ROOT: join(dir, 'repos'), SHOWCASE_LESSONS_FILE: join(dir, 'absent'),
    PATH: `${join(dir, 'bin')}:${process.env.PATH}`, FIXTURE_GH_INVENTORY: inventory,
    SHOWCASE_TOKEN: '', GITHUB_TOKEN: '', GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1' };
  const run = (script) => spawnSync(process.execPath, [join(dir, 'scripts', script)], { env, encoding: 'utf8' });
  return { dir, registry, inventory, env, run, seedRegistry() {
    writeFileSync(registry, JSON.stringify({ schema: 1, products: [
      ...Array.from({ length: 21 }, (_, i) => ({ id: `repo-${i}`, repo: `rockeish/${i ? `private-repo-${i}` : 'demo'}`, dir: i ? `repo-${i}` : 'demo' })),
      { id: 'retired-surface', repo: null, dir: null },
    ] }));
    writeFileSync(inventory, JSON.stringify(Array.from({ length: 23 }, (_, i) => ({
      nameWithOwner: `rockeish/${i ? `private-repo-${i}` : 'demo'}`, isArchived: false,
    }))));
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

test('complete GitHub count exceeds product registry and counts the same history set without private inventory', (t) => {
  const f = fixture(t); f.seedRegistry(); f.repo('demo'); f.repo('unregistered');
  f.repo('private-repo-21'); f.repo('private-repo-22');
  const collect = f.run('collect-activity.mjs'); assert.equal(collect.status, 0, collect.stderr);
  const bytes = readFileSync(join(f.dir, 'data/activity.json'), 'utf8');
  const activity = JSON.parse(bytes);
  assert.equal(activity.metrics.repos, 23);
  assert.equal(activity.metrics.commits, 3, 'only owned inventory members contribute');
  assert.equal(activity.metrics.linesOfSource, 3);
  assert.deepEqual(activity.metrics.historyCoverage, {
    scope: 'owned non-archived repositories', expected: 23,
    inventoryDigest: activity.repoCount.digest, commitsMeasured: 3, sourceMeasured: 3,
  });
  assert.equal(activity.repoCount.count, 23);
  assert.equal(activity.repoCount.source, 'github');
  assert.equal(activity.repoCount.method, 'gh-repo-list');
  assert.equal(activity.repoCount.complete, true);
  assert.match(activity.repoCount.digest, /^[a-f0-9]{64}$/);
  assert.equal(activity.repoCount.productRegistry.count, 21);
  assert.equal(activity.repoCount.productRegistry.source, 'local-product-registry');
  assert.match(activity.repoCount.productRegistry.digest, /^[a-f0-9]{64}$/);
  assert.ok(Number.isFinite(Date.parse(activity.repoCount.asOf)));
  assert.ok(!bytes.includes('private-repo-'), 'private inventory stays outside public output');
  const generate = f.run('generate-showcase.mjs'); assert.equal(generate.status, 0, generate.stderr);
  const readme = readFileSync(join(f.dir, 'README.md'), 'utf8');
  assert.match(readme, /23 repositories/);
  assert.match(readme, /Commits cover 3 of 23 repositories; source lines cover 3 of 23/);
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

for (const invalid of ['transport', 'malformed', 'shape', 'bound', 'duplicate', 'foreign', 'registered-missing']) {
  test(`${invalid} GitHub inventory refuses both actual CLIs without exposing private input`, (t) => {
    const f = fixture(t); f.seedRegistry(); f.repo('demo');
    const rows = JSON.parse(readFileSync(f.inventory));
    if (invalid === 'transport') f.env.FIXTURE_GH_FAIL = '1';
    if (invalid === 'malformed') writeFileSync(f.inventory, '{private inventory');
    if (invalid === 'shape') rows[22].isArchived = 'false';
    if (invalid === 'bound') while (rows.length < 1000) rows.push({ nameWithOwner: `rockeish/extra-${rows.length}`, isArchived: false });
    if (invalid === 'duplicate') rows.push({ ...rows[0] });
    if (invalid === 'foreign') rows[22].nameWithOwner = 'foreign/private';
    if (invalid === 'registered-missing') rows.splice(0, 1);
    if (invalid !== 'malformed') writeFileSync(f.inventory, JSON.stringify(rows));
    const before = readFileSync(join(f.dir, 'README.md'));
    const activity = readFileSync(join(f.dir, 'data/activity.json'));
    for (const script of ['collect-activity.mjs', 'generate-showcase.mjs']) {
      const result = f.run(script);
      assert.notEqual(result.status, 0);
      assert.ok(!`${result.stdout}${result.stderr}`.includes('private credential text'));
      assert.deepEqual(readFileSync(join(f.dir, 'README.md')), before);
      assert.deepEqual(readFileSync(join(f.dir, 'data/activity.json')), activity);
    }
  });
}

test('same count with changed membership refuses the stale digest before publishing', (t) => {
  const f = fixture(t); f.seedRegistry(); f.repo('demo');
  assert.equal(f.run('collect-activity.mjs').status, 0);
  const rows = JSON.parse(readFileSync(f.inventory));
  rows[22].nameWithOwner = 'rockeish/new-unregistered-member';
  writeFileSync(f.inventory, JSON.stringify(rows));
  const before = readFileSync(join(f.dir, 'README.md'));
  assert.notEqual(f.run('generate-showcase.mjs').status, 0);
  assert.deepEqual(readFileSync(join(f.dir, 'README.md')), before);
});

test('archived repositories are excluded and input ordering does not change the digest', (t) => {
  const f = fixture(t); f.seedRegistry(); f.repo('demo');
  const rows = JSON.parse(readFileSync(f.inventory)); rows[22].isArchived = true;
  writeFileSync(f.inventory, JSON.stringify(rows));
  assert.equal(f.run('collect-activity.mjs').status, 0);
  const activity = JSON.parse(readFileSync(join(f.dir, 'data/activity.json')));
  assert.equal(activity.repoCount.count, 22);
  writeFileSync(f.inventory, JSON.stringify(rows.reverse()));
  assert.equal(f.run('generate-showcase.mjs').status, 0);
});

test('unreadable authored source remains Unknown instead of a declared or zero total', (t) => {
  const f = fixture(t); f.seedRegistry(); f.repo('demo');
  rmSync(join(f.dir, 'repos/demo/app.js'));
  assert.equal(f.run('collect-activity.mjs').status, 0);
  const activity = JSON.parse(readFileSync(join(f.dir, 'data/activity.json')));
  assert.equal(activity.metrics.historyCoverage.commitsMeasured, 1);
  assert.equal(activity.metrics.historyCoverage.sourceMeasured, 0);
  assert.equal(activity.metrics.linesOfSource, null);
  assert.equal(f.run('generate-showcase.mjs').status, 0);
  assert.match(readFileSync(join(f.dir, 'assets/hero.light.svg'), 'utf8'), /Unknown/);
});

test('history coverage cannot silently claim a different inventory denominator', (t) => {
  const f = fixture(t); f.seedRegistry(); f.repo('demo');
  assert.equal(f.run('collect-activity.mjs').status, 0);
  const path = join(f.dir, 'data/activity.json');
  const activity = JSON.parse(readFileSync(path));
  activity.metrics.historyCoverage.inventoryDigest = '0'.repeat(64);
  writeFileSync(path, JSON.stringify(activity));
  const before = readFileSync(join(f.dir, 'README.md'));
  assert.notEqual(f.run('generate-showcase.mjs').status, 0);
  assert.deepEqual(readFileSync(join(f.dir, 'README.md')), before);
});
