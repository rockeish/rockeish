#!/usr/bin/env node
/**
 * generate-showcase.mjs
 *
 * Regenerates the ENTIRE README and every visual asset from one data source
 * (data/projects.json). Nothing on the page is hand-maintained — edit the data
 * (or this generator), never the rendered output. A scheduled GitHub Action runs
 * this to keep the public profile fresh.
 *
 * Produces:
 *   assets/hero.svg           — name + headline metrics (numbers-first banner)
 *   assets/ecosystem.svg      — the ecosystem map (hub → products → back ends → delivery → platform)
 *   assets/pipeline.svg       — the ship pipeline (plan → build → verify → ship)
 *   assets/commits.svg        — commits-per-repository bar chart
 *   assets/languages.svg      — language mix (stacked bar of tracked source)
 *   README.md                 — the whole file
 *
 * SVGs are self-contained (own dark background, system fonts) so they render
 * identically on GitHub light/dark and anywhere else, and are sized/typeset to
 * stay legible when scaled to phone width. The script is idempotent.
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
// Design tokens + helpers
// ---------------------------------------------------------------------------

const C = {
  bg: '#0b1220', panel: '#131d33', chip: '#1b2942', text: '#e6edf3',
  muted: '#8b97a8', line: '#243149', a1: '#38bdf8', a2: '#818cf8',
};
const FONT = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const compact = (n) =>
  n >= 1000 ? (n / 1000 >= 100 ? Math.round(n / 1000) : (n / 1000).toFixed(1).replace(/\.0$/, '')) + 'K' : String(n);

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

/** word-wrap a string into <=maxLines lines of about maxChars each */
function wrap(s, maxChars, maxLines = 2) {
  const words = String(s).split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars && cur) { lines.push(cur.trim()); cur = w; }
    else cur = (cur + ' ' + w).trim();
    if (lines.length === maxLines - 1 && (cur + '').length > maxChars) break;
  }
  if (cur.trim() && lines.length < maxLines) lines.push(cur.trim());
  return lines.slice(0, maxLines);
}

// ---------------------------------------------------------------------------
// hero.svg — numbers-first banner
// ---------------------------------------------------------------------------

function heroSvg(d) {
  const m = d.metrics;
  const stats = [
    [String(m.repos), 'repos'], [compact(m.commits), 'commits'],
    [compact(m.linesOfSource), 'lines'], [String(m.appsInProduction), 'live apps'],
    [String(m.engineers), 'engineer'],
  ];
  const W = 720, x0 = 40, cell = (W - x0 - 40) / stats.length;
  const statMarkup = stats.map(([n, l], i) => {
    const x = x0 + i * cell;
    return `<text x="${x}" y="230" font-family="${FONT}" font-size="34" font-weight="700" fill="url(#accent)">${esc(n)}</text>
  <text x="${x}" y="254" font-family="${FONT}" font-size="16" fill="${C.muted}">${esc(l)}</text>`;
  }).join('\n  ');

  const inner = `<text x="${x0}" y="76" font-family="${FONT}" font-size="48" font-weight="800" fill="${C.text}">${esc(d.profile.name)}</text>
  <rect x="${x0 + 2}" y="90" width="72" height="6" rx="3" fill="url(#accent)"/>
  <text x="${x0}" y="128" font-family="${FONT}" font-size="20" fill="${C.text}">${esc(d.profile.role)}</text>
  <text x="${x0}" y="158" font-family="${FONT}" font-size="16" fill="${C.muted}">One engineer · a self-built agent platform · a portfolio in production</text>
  <line x1="${x0}" y1="186" x2="${W - x0}" y2="186" stroke="${C.line}"/>
  ${statMarkup}`;
  return svgDoc(W, 274, inner, `${d.profile.name} — headline metrics`);
}

// ---------------------------------------------------------------------------
// ecosystem.svg — the map: hub → products → back ends → delivery, on a platform
// ---------------------------------------------------------------------------

function ecosystemSvg(d) {
  const a = d.architecture;
  const W = 720, mx = 32, innerW = W - 2 * mx;
  const chip = (x, y, w, h, label, opts = {}) => {
    const fill = opts.fill || C.chip;
    const stroke = opts.stroke ? ` stroke="${opts.stroke}"` : '';
    const tcol = opts.text || C.text;
    const fs = opts.fs || 18;
    const anchor = opts.center ? ` text-anchor="middle"` : '';
    const tx = opts.center ? x + w / 2 : x + 18;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${fill}"${stroke}/>` +
      `<text x="${tx}" y="${y + h / 2 + 6}" font-family="${FONT}" font-size="${fs}" fill="${tcol}"${anchor}>${esc(label)}</text>`;
  };
  const head = (y, t) => `<text x="${mx}" y="${y}" font-family="${FONT}" font-size="18" font-weight="700" letter-spacing="1.5" fill="url(#accent)">${esc(t)}</text>`;
  const arrow = (y) => `<path d="M ${W / 2 - 9} ${y} L ${W / 2 + 9} ${y} L ${W / 2} ${y + 13} Z" fill="${C.muted}"/>`;

  let y = 58;
  let s = `<text x="${mx}" y="34" font-family="${FONT}" font-size="16" fill="${C.muted}">One ecosystem — a shared hub and platform behind every product</text>`;

  // DISTRIBUTION — hub (full-width accent chip)
  s += head(y, 'DISTRIBUTION'); y += 14;
  s += chip(mx, y, innerW, 46, 'Beyond Volatility — the public hub & front door', { center: true, fill: C.panel, stroke: C.a2, text: C.text, fs: 17 });
  y += 46 + 10; s += arrow(y); y += 28;

  // PRODUCTS — 2-col grid
  s += head(y, 'PRODUCTS'); y += 14;
  const cols = 2, gap = 14, cw = (innerW - (cols - 1) * gap) / cols, ch = 44, rg = 10;
  a.apps.forEach((label, i) => {
    const cx = mx + (i % cols) * (cw + gap), cy = y + Math.floor(i / cols) * (ch + rg);
    s += chip(cx, cy, cw, ch, label);
  });
  y += Math.ceil(a.apps.length / cols) * (ch + rg) - rg + 10; s += arrow(y); y += 28;

  // BACK ENDS
  s += head(y, 'BACK ENDS'); y += 14;
  a.backends.forEach((label, i) => { s += chip(mx + i * (cw + gap), y, cw, ch, label); });
  y += ch + 10; s += arrow(y); y += 28;

  // DELIVERY
  s += head(y, 'DELIVERY'); y += 14;
  a.delivery.forEach((label, i) => {
    const cx = mx + (i % cols) * (cw + gap), cy = y + Math.floor(i / cols) * (ch + rg);
    s += chip(cx, cy, cw, ch, label);
  });
  y += Math.ceil(a.delivery.length / cols) * (ch + rg) - rg + 18;

  // FOUNDATION — the platform (full-width emphasized band)
  s += `<rect x="${mx}" y="${y}" width="${innerW}" height="66" rx="12" fill="${C.panel}" stroke="url(#accent)" stroke-width="1.5"/>`;
  s += `<text x="${mx + 20}" y="${y + 28}" font-family="${FONT}" font-size="18" font-weight="700" fill="url(#accent)">THE PLATFORM</text>`;
  s += `<text x="${mx + 20}" y="${y + 50}" font-family="${FONT}" font-size="15" fill="${C.muted}">Agent-automation + standards-as-code — every product ships on this</text>`;
  y += 66 + 22;

  return svgDoc(W, y, s, 'Ecosystem map — hub, products, back ends, delivery, and the shared platform');
}

// ---------------------------------------------------------------------------
// pipeline.svg — how I ship (vertical 4-phase)
// ---------------------------------------------------------------------------

function pipelineSvg(d) {
  const W = 720, mx = 32, innerW = W - 2 * mx, bandH = 84, gap = 22;
  let y = 62;
  let s = `<text x="${mx}" y="36" font-family="${FONT}" font-size="16" fill="${C.muted}">How I ship — intent in, reviewed &amp; deployed changes out</text>`;
  d.pipeline.forEach((p, i) => {
    s += `<rect x="${mx}" y="${y}" width="${innerW}" height="${bandH}" rx="12" fill="${C.panel}" stroke="${C.line}"/>`;
    s += `<circle cx="${mx + 30}" cy="${y + 32}" r="16" fill="${C.chip}"/>`;
    s += `<text x="${mx + 30}" y="${y + 38}" font-family="${FONT}" font-size="17" font-weight="700" fill="url(#accent)" text-anchor="middle">${i + 1}</text>`;
    s += `<text x="${mx + 60}" y="${y + 38}" font-family="${FONT}" font-size="20" font-weight="700" letter-spacing="1" fill="${C.text}">${esc(p.phase)}</text>`;
    wrap(p.detail, 74, 2).forEach((ln, li) => {
      s += `<text x="${mx + 20}" y="${y + 60 + li * 20}" font-family="${FONT}" font-size="14.5" fill="${C.muted}">${esc(ln)}</text>`;
    });
    y += bandH;
    if (i < d.pipeline.length - 1) {
      s += `<path d="M ${W / 2 - 9} ${y + 5} L ${W / 2 + 9} ${y + 5} L ${W / 2} ${y + 17} Z" fill="${C.muted}"/>`;
      y += gap;
    }
  });
  return svgDoc(W, y + 20, s, 'Ship pipeline — plan, build, verify, ship');
}

// ---------------------------------------------------------------------------
// commits.svg — horizontal bar chart
// ---------------------------------------------------------------------------

function commitsSvg(d) {
  const rows = d.metrics.commitsByRepo;
  const W = 720, top = 68, rowH = 30, rowGap = 9, labelX = 172, barX = 182, barMax = 452;
  const max = Math.max(...rows.map((r) => r.commits));
  const H = top + rows.length * (rowH + rowGap) + 18;
  let s = `<text x="28" y="42" font-family="${FONT}" font-size="17" fill="${C.muted}">Commits per repository</text>
  <text x="${W - 28}" y="42" font-family="${FONT}" font-size="15" fill="${C.muted}" text-anchor="end">~${compact(d.metrics.commits)} total · single author</text>`;
  rows.forEach((r, i) => {
    const y = top + i * (rowH + rowGap);
    const bw = Math.max(5, Math.round((r.commits / max) * barMax));
    s += `\n  <text x="${labelX}" y="${y + 21}" font-family="${FONT}" font-size="16" fill="${C.text}" text-anchor="end">${esc(r.label)}</text>`;
    s += `\n  <rect x="${barX}" y="${y + 5}" width="${bw}" height="22" rx="5" fill="url(#accent)"/>`;
    s += `\n  <text x="${barX + bw + 10}" y="${y + 21}" font-family="${FONT}" font-size="15" fill="${C.muted}">${r.commits.toLocaleString('en-US')}</text>`;
  });
  return svgDoc(W, H, s, 'Commits per repository');
}

// ---------------------------------------------------------------------------
// languages.svg — stacked bar of tracked source
// ---------------------------------------------------------------------------

const LANG_COLORS = {
  TypeScript: '#3178c6', JavaScript: '#e6c84f', CSS: '#38bdf8',
  PHP: '#818cf8', SQL: '#22c55e', Other: '#64748b',
};

function languagesSvg(d) {
  const langs = d.metrics.languages;
  const total = langs.reduce((n, l) => n + l.lines, 0);
  const W = 720, mx = 28, barW = W - 2 * mx, barY = 62, barH = 34;
  let s = `<text x="${mx}" y="40" font-family="${FONT}" font-size="17" fill="${C.muted}">Language mix</text>
  <text x="${W - mx}" y="40" font-family="${FONT}" font-size="15" fill="${C.muted}" text-anchor="end">${compact(total)} lines of tracked source</text>`;
  // segments
  let x = mx;
  langs.forEach((l, i) => {
    const w = Math.max(2, (l.lines / total) * barW);
    const col = LANG_COLORS[l.name] || C.chip;
    const round = i === 0 ? 'rx="6"' : i === langs.length - 1 ? 'rx="6"' : '';
    s += `\n  <rect x="${x.toFixed(1)}" y="${barY}" width="${w.toFixed(1)}" height="${barH}" ${round} fill="${col}"/>`;
    x += w;
  });
  // legend
  const ly = barY + barH + 32, perRow = 3, cellW = barW / perRow;
  langs.forEach((l, i) => {
    const col = LANG_COLORS[l.name] || C.chip;
    const cx = mx + (i % perRow) * cellW, cy = ly + Math.floor(i / perRow) * 28;
    const pct = ((l.lines / total) * 100).toFixed(1);
    s += `\n  <rect x="${cx}" y="${cy - 11}" width="13" height="13" rx="3" fill="${col}"/>`;
    s += `\n  <text x="${cx + 20}" y="${cy}" font-family="${FONT}" font-size="15" fill="${C.text}">${esc(l.name)} <tspan fill="${C.muted}">${pct}%</tspan></text>`;
  });
  const H = ly + Math.ceil(langs.length / perRow) * 28 + 6;
  return svgDoc(W, H, s, 'Language mix across tracked source');
}

// ---------------------------------------------------------------------------
// Badges (shields.io, flat-square)
// ---------------------------------------------------------------------------

const BADGE = {
  TypeScript: ['3178C6', 'typescript', 'white'], JavaScript: ['F7DF1E', 'javascript', 'black'],
  React: ['20232A', 'react', '61DAFB'], 'Next.js': ['000000', 'nextdotjs', 'white'],
  'Node.js': ['5FA04E', 'nodedotjs', 'white'], Express: ['000000', 'express', 'white'],
  Vite: ['646CFF', 'vite', 'white'], 'Tailwind CSS': ['06B6D4', 'tailwindcss', 'white'],
  'Radix UI': ['161618', 'radixui', 'white'], Capacitor: ['119EFF', 'capacitor', 'white'],
  Firebase: ['DD2C00', 'firebase', 'white'], 'Firebase Hosting': ['FFCA28', 'firebase', 'black'],
  Supabase: ['3FCF8E', 'supabase', 'white'], PostgreSQL: ['4169E1', 'postgresql', 'white'],
  pgvector: ['4169E1', 'postgresql', 'white'], Vercel: ['000000', 'vercel', 'white'],
  'GitHub Actions': ['2088FF', 'githubactions', 'white'], Turborepo: ['EF4444', 'turborepo', 'white'],
  Cloudflare: ['F38020', 'cloudflare', 'white'], Zod: ['3E67B1', 'zod', 'white'],
  Sentry: ['362D59', 'sentry', 'white'], RevenueCat: ['F25A5A', '', ''],
  Doppler: ['3391FF', 'doppler', 'white'], ESLint: ['4B32C3', 'eslint', 'white'],
  Prettier: ['F7B93E', 'prettier', 'black'], 'Claude Code': ['D97757', 'anthropic', 'white'],
  PHP: ['777BB4', 'php', 'white'], SQL: ['4479A1', 'postgresql', 'white'],
  Python: ['3776AB', 'python', 'white'], Bash: ['4EAA25', 'gnubash', 'white'],
  WordPress: ['21759B', 'wordpress', 'white'], 'Standards-as-code': ['1b2942', '', ''],
  'Custom agents & skills': ['1b2942', '', ''],
};

function badge(name) {
  const [c, logo, lc] = BADGE[name] || ['1b2942', '', ''];
  const label = encodeURIComponent(name).replace(/-/g, '--');
  const l = logo ? `&logo=${logo}&logoColor=${lc || 'white'}` : '';
  return `<img src="https://img.shields.io/badge/${label}-${c}?style=flat-square${l}" alt="${esc(name)}">`;
}
function linkBadge(label, color, logo, url, logoColor = 'white') {
  const lb = encodeURIComponent(label).replace(/-/g, '--');
  const l = logo ? `&logo=${logo}&logoColor=${logoColor}` : '';
  return `<a href="${url}"><img src="https://img.shields.io/badge/${lb}-${color}?style=flat-square${l}" alt="${esc(label)}"></a>`;
}

// ---------------------------------------------------------------------------
// README assembly (the whole file)
// ---------------------------------------------------------------------------

const HERO_BADGES = ['TypeScript', 'React', 'Next.js', 'Node.js', 'Firebase', 'Supabase', 'PostgreSQL', 'Capacitor', 'Vercel', 'GitHub Actions', 'Claude Code'];

function centered(inner) { return `<p align="center">\n  ${inner}\n</p>`; }

function nav() {
  const items = [
    ['What I build', '#what-i-build'], ['Ecosystem', '#the-ecosystem'],
    ['How I ship', '#how-i-ship'], ['By the numbers', '#by-the-numbers'],
    ['Selected work', '#selected-work'], ['Practices', '#engineering-practices'],
    ['Connect', '#connect'],
  ];
  return centered(items.map(([t, h]) => `<a href="${h}">${t}</a>`).join('\n  &nbsp;·&nbsp;\n  '));
}

function selectedWorkTable(projects) {
  const rows = projects.map((p) => {
    let link = p.url ? `[Live ↗](${p.url})` : '—';
    if (p.links?.appStore) link = `[App Store ↗](${p.links.appStore}) · [Play ↗](${p.links.googlePlay})`;
    const name = p.url ? `**[${p.name}](${p.url})**` : `**${p.name}**`;
    return `| ${name} <br><sub>\`${p.status}\`</sub> | ${p.tagline} | ${p.stack.join(' · ')} | ${link} |`;
  }).join('\n');
  return `| Project | What it does | Stack | Live |\n|---|---|---|---|\n${rows}`;
}

function deepDive(p) {
  if (!p.deepdive) return '';
  const body = Object.entries(p.deepdive).map(([k, v]) => `**${k}.** ${v}`).join('\n\n');
  return `<details>\n<summary><b>${esc(p.name)} — deep dive</b></summary>\n\n${body}\n\n</details>`;
}

function stackDetails(stack) {
  const groups = Object.entries(stack)
    .map(([group, items]) => `**${group}**  \n${items.map(badge).join(' ')}`)
    .join('\n\n');
  return `<details>\n<summary><b>Full stack &amp; tooling</b></summary>\n\n${groups}\n\n</details>`;
}

function commandTable(p) {
  const cmds = p.commands.map((c) => `| \`/${c.name}\` | ${c.does} |`).join('\n');
  return `| Command | What it does |\n|---|---|\n${cmds}`;
}

function connectRow(d) {
  const c = d.connect;
  const b = [
    linkBadge('LinkedIn', '0A66C2', 'linkedin', c.linkedin),
    linkBadge('Portfolio', '0b1220', 'safari', c.hub),
    linkBadge('ParentPod', '111111', 'appstore', c.flagship),
  ];
  const social = { Instagram: ['E4405F', 'instagram'], TikTok: ['000000', 'tiktok'], X: ['000000', 'x'] };
  for (const s of c.socials) {
    const [col, logo] = social[s.label] || ['1b2942', ''];
    b.push(linkBadge(s.label, col, logo, s.url));
  }
  return centered(b.join('\n  '));
}

function img(src, alt, width) {
  const w = width === '100%' ? ` width="100%"` : ` width="${width}"`;
  return `<img src="${src}" alt="${esc(alt)}"${w}>`;
}

function buildReadme(d) {
  const m = d.metrics;
  const parts = [];

  // Header
  parts.push(img('assets/hero.svg', `${d.profile.name} — ${d.profile.role}. ${m.repos} repositories, ${compact(m.commits)} commits, ${compact(m.linesOfSource)} lines of source, ${m.appsInProduction} apps in production, ${m.engineers} engineer.`, '100%'));
  parts.push(centered(HERO_BADGES.map(badge).join('\n  ')));
  parts.push(nav());

  // What I build
  parts.push('## What I build');
  parts.push('By day, reliability compliance at a large energy company — 12 years keeping the power grid up. Nights and weekends, I design, build, ship, and operate every product below **solo**, on an agent-automation platform I built so the repetitive engineering happens *under review* instead of by hand. The numbers above aren\'t a team\'s output — they\'re one engineer with a lot of leverage.');
  parts.push('**Currently**\n\n' + d.currently.map((x) => `- ${x}`).join('\n'));

  // Ecosystem
  parts.push('## The ecosystem');
  parts.push(`${m.repos} repositories, one system: a shared hub for distribution, a portfolio of products, two back ends, and native + web delivery — all resting on the automation platform.`);
  parts.push(centered(img('assets/ecosystem.svg', 'Ecosystem map — Beyond Volatility hub, products, Firebase and Supabase back ends, Vercel / Firebase Hosting / app-store delivery, all on a shared agent-automation platform.', 680)));

  // How I ship
  parts.push('## How I ship');
  parts.push(centered(img('assets/pipeline.svg', 'Ship pipeline — plan (scoped by standards-as-code), build (parallel agents, test-first), verify (adversarial review, tests, security and doc-freshness gates), ship (auto-merge, deploy, docs updated).', 680)));
  parts.push(d.platform.summary);
  parts.push(commandTable(d.platform));
  parts.push(`**Standards-as-code:** ${d.platform.standards.map((s) => `\`${s}\``).join(' · ')} — one library, symlinked into every repo *and* loaded into every agent's context, plus ${d.platform.skillsCount} reusable skills.`);

  // By the numbers
  parts.push('## By the numbers');
  parts.push('<sub>Real figures, aggregated across every repository — public *and* private. No third-party stat widgets; these are computed from the actual git history and source tree, then drawn from data.</sub>');
  parts.push(img('assets/commits.svg', 'Commits per repository — ParentPod 2,229; RealInvestorX 934; Longevity 809; Apex 797; Compliance OS 552; Beyond Volatility 422; and more. ~5,900 total, single author.', '100%'));
  parts.push(img('assets/languages.svg', 'Language mix across 681K lines of tracked source — TypeScript 45.5%, JavaScript 34.8%, CSS 14.2%, PHP 2.6%, SQL 2.2%, other 0.8%.', '100%'));

  // Selected work
  parts.push('## Selected work');
  parts.push(selectedWorkTable(d.projects));
  parts.push(d.projects.filter((p) => p.deepdive).map(deepDive).join('\n\n'));
  parts.push(stackDetails(d.stack));

  // Practices
  parts.push('## Engineering practices');
  parts.push(d.practices.map((x) => `- ${x}`).join('\n'));

  // Connect
  parts.push('## Connect');
  parts.push(connectRow(d));

  // Footer
  parts.push('---');
  parts.push(`<sub>App repositories are private — this work ships to production, not public forks. This entire page — copy, tables, and every SVG — is generated from one data file (<a href="data/projects.json">data/projects.json</a>) by <a href="scripts/generate-showcase.mjs"><code>generate-showcase.mjs</code></a> and refreshed on a schedule by GitHub Actions. Full portfolio → <b><a href="${d.profile.hub}">beyondvolatility.com</a></b>.</sub>`);

  return parts.join('\n\n') + '\n';
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

mkdirSync(join(ROOT, 'assets'), { recursive: true });
const assets = {
  'hero.svg': heroSvg(data),
  'ecosystem.svg': ecosystemSvg(data),
  'pipeline.svg': pipelineSvg(data),
  'commits.svg': commitsSvg(data),
  'languages.svg': languagesSvg(data),
};
for (const [name, svg] of Object.entries(assets)) writeFileSync(join(ROOT, 'assets', name), svg);
console.log('assets:', Object.keys(assets).join(', '));
writeFileSync(join(ROOT, 'README.md'), buildReadme(data));
console.log('README.md written.');
