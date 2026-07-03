import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recentlyShipped } from './generate-showcase.mjs';

// A markdown table row must have exactly 3 cells (4 pipes) so the table renders.
function pipeCount(line) {
  return (line.match(/(?<!\\)\|/g) || []).length; // count UNescaped pipes
}

test('recentlyShipped escapes a `|` in a version tag so the table stays valid', () => {
  const md = recentlyShipped({
    asOf: '2026-06-30',
    repos: [{ name: 'demo', version: 'v1|2', recent: 5 }],
  });
  const row = md.split('\n').find((l) => l.startsWith('| **demo**'));
  assert.ok(row, 'row for demo present');
  // Without escaping the stray `|` would create a 4th cell (5 unescaped pipes).
  assert.equal(pipeCount(row), 4, `row should have 4 unescaped pipes, got: ${row}`);
  assert.ok(row.includes('\\|'), 'the literal pipe is backslash-escaped');
});

test('recentlyShipped strips backticks from a name to avoid breaking code spans', () => {
  const md = recentlyShipped({
    asOf: '2026-06-30',
    repos: [{ name: 'de`mo', version: 'v1.0.0', recent: 1 }],
  });
  const row = md.split('\n').find((l) => l.startsWith('| **de'));
  assert.ok(row && !row.replace(/`([^`]*)`/g, '').includes('`'),
    'no unmatched backticks remain in the row');
});
