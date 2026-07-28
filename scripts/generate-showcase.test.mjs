import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildReadme, fmtDate, recentlyShipped, renderAll } from './generate-showcase.mjs';

const projects = JSON.parse(readFileSync(new URL('../data/projects.json', import.meta.url), 'utf8'));
const activity = JSON.parse(readFileSync(new URL('../data/activity.json', import.meta.url), 'utf8'));

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

// Cheap XML well-formedness check: every opened tag must be closed in order.
// (Attribute values never contain ">" — esc() escapes text, CSS has none.)
function assertWellFormed(svg, name) {
  const stack = [];
  for (const tag of svg.match(/<[^>]+>/g) || []) {
    if (tag.startsWith('<?') || tag.startsWith('<!')) continue;
    const el = tag.match(/^<\/?([A-Za-z][\w:-]*)/)[1];
    if (tag.startsWith('</')) assert.equal(stack.pop(), el, `${name}: mismatched </${el}>`);
    else if (!tag.endsWith('/>')) stack.push(el);
  }
  assert.equal(stack.length, 0, `${name}: unclosed tags ${stack.join(', ')}`);
}

test('every SVG (both themes) renders complete and well-formed', () => {
  const all = renderAll();
  assert.ok(Object.keys(all).length >= 6, 'all infographics render');
  for (const [name, themes] of Object.entries(all)) {
    for (const [theme, svg] of Object.entries(themes)) {
      const id = `${name}.${theme}`;
      assert.ok(svg.startsWith('<svg'), `${id} starts with <svg`);
      assert.ok(svg.trimEnd().endsWith('</svg>'), `${id} ends with </svg>`);
      assert.ok(svg.includes('aria-label='), `${id} has an aria-label`);
      assert.ok(svg.includes('prefers-reduced-motion'), `${id} respects reduced motion`);
      assert.ok(!svg.includes('undefined'), `${id} has no leaked undefined`);
      assert.ok(!svg.includes('NaN'), `${id} has no leaked NaN`);
      assertWellFormed(svg, id);
    }
  }
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

test('fmtDate accepts real ISO calendar dates and rejects malformed or impossible dates', () => {
  assert.equal(fmtDate('2026-07-27'), 'Jul 27, 2026');
  assert.throws(() => fmtDate('2026-02-30'), /Invalid ISO date/);
  assert.throws(() => fmtDate('07/27/2026'), /Invalid ISO date/);
  assert.throws(() => fmtDate(undefined), /Invalid ISO date/);
});

test('generated public profile avoids stale automation claims and AI-tool promotion', () => {
  const readme = buildReadme(projects, activity);
  const forbidden = [
    'agent-automation',
    'Claude Code',
    'parallel agents',
    'Auto-merge',
    "every agent's context",
    'scheduled GitHub Action',
  ];
  for (const phrase of forbidden) {
    assert.ok(!readme.includes(phrase), `generated README must not contain: ${phrase}`);
  }
  assert.ok(readme.includes('stamp-guarded local schedule'), 'actual refresh mechanism is disclosed');
});
