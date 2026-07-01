#!/usr/bin/env node
/**
 * generate-showcase.mjs
 *
 * Regenerates the visual assets and the auto-managed README block from one data
 * source (data/projects.json). Everything is derived — edit the data, not the
 * rendered output.
 *
 * Produces:
 *   assets/hero.svg          — name + headline metrics (the "numbers first" banner)
 *   assets/architecture.svg  — the ecosystem pipeline (clients → apps → back ends → delivery)
 *   assets/commits.svg       — commits-per-repository bar chart
 *   README.md                — portfolio + platform block, between the SHOWCASE markers
 *
 * SVGs are self-contained (own dark background, system fonts) so they render
 * identically on GitHub light/dark and anywhere else. The script is idempotent.
 *
 * Usage: node scripts/generate-showcase.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const data = JSON.parse(readFileSync(join(ROOT, 'data', 'projects.json'), 'utf8'));

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------

const C = {
  bg: '#0b1220',
  panel: '#131d33',
  chip: '#1b2942',
  text: '#e6edf3',
  muted: '#8b97a8',
  line: '#243149',
  a1: '#38bdf8',
  a2: '#818cf8',
};
const FONT = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Wrap inner markup in an SVG doc with a rounded dark background + accent gradient. */
function svgDoc(w, h, inner, label) {
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(label)}">
  <defs>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${C.a1}"/><stop offset="1" stop-color="${C.a2}"/>
    </linearGradient>
  </defs>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="18" fill="${C.bg}" stroke="${C.line}"/>
  ${inner}
</svg>`;
}

const compact = (n) =>
  n >= 1000 ? (n / 1000 >= 100 ? Math.round(n / 1000) : (n / 1000).toFixed(1).replace(/\.0$/, '')) + 'K' : String(n);

// ---------------------------------------------------------------------------
// hero.svg
// ---------------------------------------------------------------------------

function heroSvg(d) {
  const m = d.metrics;
  const stats = [
    [String(m.repos), 'repositories'],
    [compact(m.commits), 'commits'],
    [compact(m.linesOfSource), 'lines of code'],
    [String(m.appsInProduction), 'apps in production'],
    [String(m.engineers), 'engineer'],
  ];
  const W = 900;
  const x0 = 44;
  const cell = (W - x0 - 44) / stats.length;
  const statMarkup = stats
    .map(([n, l], i) => {
      const x = x0 + i * cell;
      return `<text x="${x}" y="198" font-family="${FONT}" font-size="30" font-weight="700" fill="url(#accent)">${esc(n)}</text>
  <text x="${x}" y="219" font-family="${FONT}" font-size="12.5" fill="${C.muted}">${esc(l)}</text>`;
    })
    .join('\n  ');

  const inner = `<text x="${x0}" y="66" font-family="${FONT}" font-size="44" font-weight="800" fill="${C.text}">${esc(d.profile.name)}</text>
  <rect x="${x0 + 2}" y="78" width="64" height="5" rx="2.5" fill="url(#accent)"/>
  <text x="${x0}" y="106" font-family="${FONT}" font-size="15.5" fill="${C.text}">${esc(d.profile.role)}</text>
  <text x="${x0}" y="130" font-family="${FONT}" font-size="14" fill="${C.muted}">One engineer · a self-built agent-automation platform · a portfolio in production</text>
  <line x1="${x0}" y1="152" x2="${W - x0}" y2="152" stroke="${C.line}"/>
  ${statMarkup}`;
  return svgDoc(W, 244, inner, `${d.profile.name} — headline metrics`);
}

// ---------------------------------------------------------------------------
// architecture.svg — 4-panel pipeline
// ---------------------------------------------------------------------------

function architectureSvg(d) {
  const a = d.architecture;
  const cols = [
    ['CLIENTS', a.clients],
    ['APPS', a.apps],
    ['BACK ENDS', a.backends],
    ['DELIVERY', a.delivery],
  ];
  const W = 900;
  const H = 300;
  const panelW = 186;
  const gap = 34;
  const top = 56;
  const panelH = 224;
  const chipH = 30;
  const chipGap = 8;
  const mid = top + panelH / 2;

  let markup = `<text x="24" y="34" font-family="${FONT}" font-size="14" fill="${C.muted}">Ecosystem — full-stack across two back ends, three delivery targets, and native mobile</text>`;

  cols.forEach(([title, items], ci) => {
    const px = 24 + ci * (panelW + gap);
    markup += `\n  <rect x="${px}" y="${top}" width="${panelW}" height="${panelH}" rx="12" fill="${C.panel}" stroke="${C.line}"/>`;
    markup += `\n  <text x="${px + 14}" y="${top + 26}" font-family="${FONT}" font-size="12" font-weight="700" letter-spacing="1.5" fill="url(#accent)">${esc(title)}</text>`;
    items.forEach((label, j) => {
      const cy = top + 40 + j * (chipH + chipGap);
      markup += `\n  <rect x="${px + 12}" y="${cy}" width="${panelW - 24}" height="${chipH}" rx="8" fill="${C.chip}"/>`;
      markup += `\n  <text x="${px + panelW / 2}" y="${cy + 20}" font-family="${FONT}" font-size="11.5" fill="${C.text}" text-anchor="middle">${esc(label)}</text>`;
    });
    if (ci < cols.length - 1) {
      const ax = px + panelW + gap / 2;
      markup += `\n  <path d="M ${ax - 6} ${mid - 7} L ${ax + 6} ${mid} L ${ax - 6} ${mid + 7} Z" fill="${C.muted}"/>`;
    }
  });
  return svgDoc(W, H, markup, 'Ecosystem architecture');
}

// ---------------------------------------------------------------------------
// commits.svg — horizontal bar chart
// ---------------------------------------------------------------------------

function commitsSvg(d) {
  const rows = d.metrics.commitsByRepo;
  const W = 900;
  const top = 58;
  const rowH = 26;
  const rowGap = 6;
  const labelX = 158;
  const barX = 168;
  const barMax = 640;
  const max = Math.max(...rows.map((r) => r.commits));
  const H = top + rows.length * (rowH + rowGap) + 16;

  let markup = `<text x="24" y="34" font-family="${FONT}" font-size="14" fill="${C.muted}">Commits per repository</text>
  <text x="${W - 24}" y="34" font-family="${FONT}" font-size="13" fill="${C.muted}" text-anchor="end">~${compact(d.metrics.commits)} total · single author</text>`;

  rows.forEach((r, i) => {
    const y = top + i * (rowH + rowGap);
    const bw = Math.max(4, Math.round((r.commits / max) * barMax));
    markup += `\n  <text x="${labelX}" y="${y + 15}" font-family="${FONT}" font-size="12.5" fill="${C.text}" text-anchor="end">${esc(r.label)}</text>`;
    markup += `\n  <rect x="${barX}" y="${y + 2}" width="${bw}" height="18" rx="4" fill="url(#accent)"/>`;
    markup += `\n  <text x="${barX + bw + 8}" y="${y + 15}" font-family="${FONT}" font-size="11.5" fill="${C.muted}">${r.commits.toLocaleString('en-US')}</text>`;
  });
  return svgDoc(W, H, markup, 'Commits per repository');
}

// ---------------------------------------------------------------------------
// README showcase block (between the markers)
// ---------------------------------------------------------------------------

function renderPortfolio(projects) {
  const order = [];
  const byCat = new Map();
  for (const p of projects) {
    if (!byCat.has(p.category)) {
      byCat.set(p.category, []);
      order.push(p.category);
    }
    byCat.get(p.category).push(p);
  }
  return order
    .map((cat) => {
      const cards = byCat.get(cat)
        .map((p) => {
          const title = p.url ? `[${p.name}](${p.url})` : p.name;
          const platforms = p.platforms?.length ? ` · ${p.platforms.join(' / ')}` : '';
          const hi = (p.highlights || []).map((h) => `- ${h}`).join('\n');
          return `#### ${title} — \`${p.status}\`\n${p.blurb}  \n<sub>**${p.stack.join(' · ')}**${platforms}</sub>\n\n${hi}`;
        })
        .join('\n\n');
      return `### ${cat}\n\n${cards}`;
    })
    .join('\n\n');
}

function renderPlatform(p) {
  const cmds = p.commands.map((c) => `| \`/${c.name}\` | ${c.does} |`).join('\n');
  const standards = p.standards.map((s) => `\`${s}\``).join(' · ');
  return [
    p.summary,
    '',
    '| Command | What it does |',
    '|---|---|',
    cmds,
    '',
    `**Standards-as-code:** ${standards} — symlinked into every repo *and* every agent's context, plus ${p.skillsCount} reusable skills.`,
  ].join('\n');
}

function buildShowcase(d) {
  return [
    '## Portfolio',
    '',
    renderPortfolio(d.projects),
    '',
    '## The engineering system behind it',
    '',
    renderPlatform(d.platform),
  ].join('\n');
}

function updateReadme(body) {
  const readmePath = join(ROOT, 'README.md');
  const original = readFileSync(readmePath, 'utf8');
  const S = '<!-- SHOWCASE:START -->';
  const E = '<!-- SHOWCASE:END -->';
  const s = original.indexOf(S);
  const e = original.indexOf(E);
  if (s === -1 || e === -1) throw new Error(`SHOWCASE markers not found in README.md.`);
  const updated = `${original.slice(0, s + S.length)}\n\n${body}\n\n${original.slice(e)}`;
  if (updated === original) {
    console.log('README.md already up to date.');
    return;
  }
  writeFileSync(readmePath, updated, 'utf8');
  console.log('README.md updated.');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

mkdirSync(join(ROOT, 'assets'), { recursive: true });
writeFileSync(join(ROOT, 'assets', 'hero.svg'), heroSvg(data));
writeFileSync(join(ROOT, 'assets', 'architecture.svg'), architectureSvg(data));
writeFileSync(join(ROOT, 'assets', 'commits.svg'), commitsSvg(data));
console.log('assets/hero.svg, assets/architecture.svg, assets/commits.svg written.');
updateReadme(buildShowcase(data));
