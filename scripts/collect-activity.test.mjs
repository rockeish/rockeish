import { test } from 'node:test';
import assert from 'node:assert/strict';
import { activityTarget, apiStats, chooseVersion } from './collect-activity.mjs';

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
    const stats = await apiStats('demo'); // must NOT throw
    assert.equal(stats.lastShipped, '2026-06-30');
    assert.equal(stats.version, 'v1.2.3'); // tag fallback survives optional package lookup failure
    assert.equal(stats.recent, null); // stats not ready → left null
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
    const stats = await apiStats('demo');
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
    const stats = await apiStats('demo', 'mobile/package.json');
    assert.equal(stats.version, 'v1.4.0');
  } finally {
    global.fetch = original;
  }
});
