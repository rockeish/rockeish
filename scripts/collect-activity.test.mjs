import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apiStats } from './collect-activity.mjs';

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

test('apiStats survives a 202 (empty body) from the stats endpoint', async () => {
  const original = global.fetch;
  global.fetch = fakeFetch([
    ['/repos/rockeish/demo/tags', () => okJson([{ name: 'v1.2.3' }])],
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
    assert.equal(stats.version, 'v1.2.3');
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
