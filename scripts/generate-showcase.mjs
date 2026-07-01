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
    [String(m.repos), 'repos'],
    [compact(m.commits), 'commits'],
    [compact(m.linesOfSource), 'lines'],
    [String(m.appsInProduction), 'live apps'],
    [String(m.engineers), 'engineer'],
  ];
  const W = 720;
  const x0 = 40;
  const cell = (W - x0 - 40) / stats.length;
  const statMarkup = stats
    .map(([n, l], i) => {
      const x = x0 + i * cell;
      return `<text x="${x}" y="230" font-family="${FONT}" font-size="34" font-weight="700" fill="url(#accent)">${esc(n)}</text>
  <text x="${x}" y="254" font-family="${FONT}" font-size="16" fill="${C.muted}">${esc(l)}</text>`;
    })
    .join('\n  ');

  const inner = `<text x="${x0}" y="76" font-family="${FONT}" font-size="48" font-weight="800" fill="${C.text}">${esc(d.profile.name)}</text>
  <rect x="${x0 + 2}" y="90" width="72" height="6" rx="3" fill="url(#accent)"/>
  <text x="${x0}" y="128" font-family="${FONT}" font-size="20" fill="${C.text}">${esc(d.profile.role)}</text>
  <text x="${x0}" y="158" font-family="${FONT}" font-size="16" fill="${C.muted}">One engineer · a self-built agent platform · a portfolio in production</text>
  <line x1="${x0}" y1="186" x2="${W - x0}" y2="186" stroke="${C.line}"/>
  ${statMarkup}`;
  return svgDoc(W, 274, inner, `${d.profile.name} — headline metrics`);
}

// ---------------------------------------------------------------------------
// architecture.svg — 4-panel pipeline
// ---------------------------------------------------------------------------

function architectureSvg(d) {
  const a = d.architecture;
  const stages = [
    ['CLIENTS', a.clients],
    ['APPS', a.apps],
    ['BACK ENDS', a.backends],
    ['DELIVERY', a.delivery],
  ];
  const W = 720;
  const mx = 32;
  const innerW = W - 2 * mx;
  const cols = 2;
  const colGap = 14;
  const chipW = (innerW - (cols - 1) * colGap) / cols;
  const chipH = 44;
  const rowGap = 10;
  const headH = 40;
  const arrowH = 30;

  let y = 66;
  let markup = `<text x="${mx}" y="40" font-family="${FONT}" font-size="16" fill="${C.muted}">Ecosystem — clients → apps → back ends → delivery</text>`;

  stages.forEach(([title, items], si) => {
    markup += `\n  <text x="${mx}" y="${y + 24}" font-family="${FONT}" font-size="19" font-weight="700" letter-spacing="1.5" fill="url(#accent)">${esc(title)}</text>`;
    y += headH;
    items.forEach((label, i) => {
      const cx = mx + (i % cols) * (chipW + colGap);
      const cy = y + Math.floor(i / cols) * (chipH + rowGap);
      markup += `\n  <rect x="${cx}" y="${cy}" width="${chipW}" height="${chipH}" rx="10" fill="${C.chip}"/>`;
      markup += `\n  <text x="${cx + 18}" y="${cy + chipH / 2 + 6}" font-family="${FONT}" font-size="18" fill="${C.text}">${esc(label)}</text>`;
    });
    y += Math.ceil(items.length / cols) * (chipH + rowGap) - rowGap;
    if (si < stages.length - 1) {
      y += 8;
      markup += `\n  <path d="M ${W / 2 - 9} ${y} L ${W / 2 + 9} ${y} L ${W / 2} ${y + 13} Z" fill="${C.muted}"/>`;
      y += arrowH;
    }
  });
  return svgDoc(W, y + 26, markup, 'Ecosystem architecture');
}

// ---------------------------------------------------------------------------
// commits.svg — horizontal bar chart
// ---------------------------------------------------------------------------

function commitsSvg(d) {
  const rows = d.metrics.commitsByRepo;
  const W = 720;
  const top = 68;
  const rowH = 30;
  const rowGap = 9;
  const labelX = 172;
  const barX = 182;
  const barMax = 452;
  const max = Math.max(...rows.map((r) => r.commits));
  const H = top + rows.length * (rowH + rowGap) + 18;

  let markup = `<text x="28" y="42" font-family="${FONT}" font-size="17" fill="${C.muted}">Commits per repository</text>
  <text x="${W - 28}" y="42" font-family="${FONT}" font-size="15" fill="${C.muted}" text-anchor="end">~${compact(d.metrics.commits)} total · single author</text>`;

  rows.forEach((r, i) => {
    const y = top + i * (rowH + rowGap);
    const bw = Math.max(5, Math.round((r.commits / max) * barMax));
    markup += `\n  <text x="${labelX}" y="${y + 21}" font-family="${FONT}" font-size="16" fill="${C.text}" text-anchor="end">${esc(r.label)}</text>`;
    markup += `\n  <rect x="${barX}" y="${y + 5}" width="${bw}" height="22" rx="5" fill="url(#accent)"/>`;
    markup += `\n  <text x="${barX + bw + 10}" y="${y + 21}" font-family="${FONT}" font-size="15" fill="${C.muted}">${r.commits.toLocaleString('en-US')}</text>`;
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
