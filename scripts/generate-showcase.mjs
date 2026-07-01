#!/usr/bin/env node
/**
 * generate-showcase.mjs
 *
 * Regenerates the ENTIRE README and every visual asset from data (projects.json
 * + activity.json). Nothing on the page is hand-maintained — edit the data (or
 * this generator), never the rendered output. A scheduled GitHub Action runs
 * this to keep the public profile fresh.
 *
 * Produces, for each infographic, a LIGHT and a DARK variant (swapped by the
 * reader's GitHub theme via <picture> + prefers-color-scheme):
 *   assets/hero.{light,dark}.svg        — name + headline metrics
 *   assets/ecosystem.{light,dark}.svg   — ecosystem map
 *   assets/pipeline.{light,dark}.svg    — ship pipeline
 *   assets/commits.{light,dark}.svg     — commits per repository
 *   assets/languages.{light,dark}.svg   — language mix
 *   README.md                           — the whole file
 *
 * SVGs are self-contained (own background, system fonts) and typeset to stay
 * legible when scaled to phone width. The script is idempotent.
 *
 * Usage: node scripts/generate-showcase.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const data = JSON.parse(readFileSync(join(ROOT, 'data', 'projects.json'), 'utf8'));
const activity = existsSync(join(ROOT, 'data', 'activity.json'))
  ? JSON.parse(readFileSync(join(ROOT, 'data', 'activity.json'), 'utf8'))
  : null;

// ---------------------------------------------------------------------------
// Themes + helpers
// ---------------------------------------------------------------------------

const THEMES = {
  dark: { bg: '#0b1220', panel: '#131d33', chip: '#1b2942', text: '#e6edf3', muted: '#8b97a8', line: '#243149', a1: '#38bdf8', a2: '#818cf8' },
  light: { bg: '#ffffff', panel: '#f6f8fa', chip: '#eaeef2', text: '#1f2328', muted: '#59636e', line: '#d1d9e0', a1: '#0969da', a2: '#8250df' },
};
const LANG_COLORS = { TypeScript: '#3178c6', JavaScript: '#e6c84f', CSS: '#38bdf8', PHP: '#818cf8', SQL: '#22c55e', Other: '#94a3b8' };
const FONT = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const compact = (n) =>
  n >= 1000 ? (n / 1000 >= 100 ? Math.round(n / 1000) : (n / 1000).toFixed(1).replace(/\.0$/, '')) + 'K' : String(n);
const fmtDate = (s) => { const [y, m, d] = String(s).split('-').map(Number); return `${MONTHS[m - 1]} ${d}, ${y}`; };
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function svgDoc(w, h, inner, label, t) {
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(label)}">
  <defs>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${t.a1}"/><stop offset="1" stop-color="${t.a2}"/>
    </linearGradient>
  </defs>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="18" fill="${t.bg}" stroke="${t.line}"/>
  ${inner}
</svg>`;
}

function wrap(s, maxChars, maxLines = 2) {
  const words = String(s).split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars && cur) { lines.push(cur.trim()); cur = w; }
    else cur = (cur + ' ' + w).trim();
  }
  if (cur.trim()) lines.push(cur.trim());
  return lines.slice(0, maxLines);
}

// ---------------------------------------------------------------------------
// SVG infographics (each a pure function of the data + a theme)
// ---------------------------------------------------------------------------

function heroSvg(d, t) {
  const m = d.metrics;
  const stats = [
    [String(m.repos), 'repos'], [compact(m.commits), 'commits'], [compact(m.linesOfSource), 'lines'],
    [String(m.appsInProduction), 'live apps'], [String(m.engineers), 'engineer'],
  ];
  const W = 720, x0 = 40, cell = (W - x0 - 40) / stats.length;
  const statMarkup = stats.map(([n, l], i) => {
    const x = x0 + i * cell;
    return `<text x="${x}" y="230" font-family="${FONT}" font-size="34" font-weight="700" fill="url(#accent)">${esc(n)}</text>
  <text x="${x}" y="254" font-family="${FONT}" font-size="16" fill="${t.muted}">${esc(l)}</text>`;
  }).join('\n  ');
  const inner = `<text x="${x0}" y="76" font-family="${FONT}" font-size="48" font-weight="800" fill="${t.text}">${esc(d.profile.name)}</text>
  <rect x="${x0 + 2}" y="90" width="72" height="6" rx="3" fill="url(#accent)"/>
  <text x="${x0}" y="128" font-family="${FONT}" font-size="20" fill="${t.text}">${esc(d.profile.role)}</text>
  <text x="${x0}" y="158" font-family="${FONT}" font-size="16" fill="${t.muted}">One engineer · a self-built agent platform · a portfolio in production</text>
  <line x1="${x0}" y1="186" x2="${W - x0}" y2="186" stroke="${t.line}"/>
  ${statMarkup}`;
  return svgDoc(W, 274, inner, `${d.profile.name} — headline metrics`, t);
}

function ecosystemSvg(d, t) {
  const a = d.architecture;
  const W = 720, mx = 32, innerW = W - 2 * mx;
  const chip = (x, y, w, h, label, opts = {}) => {
    const stroke = opts.stroke ? ` stroke="${opts.stroke}"` : '';
    const anchor = opts.center ? ' text-anchor="middle"' : '';
    const tx = opts.center ? x + w / 2 : x + 18;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${opts.fill || t.chip}"${stroke}/>` +
      `<text x="${tx}" y="${y + h / 2 + 6}" font-family="${FONT}" font-size="${opts.fs || 18}" fill="${opts.text || t.text}"${anchor}>${esc(label)}</text>`;
  };
  const head = (y, s) => `<text x="${mx}" y="${y}" font-family="${FONT}" font-size="18" font-weight="700" letter-spacing="1.5" fill="url(#accent)">${esc(s)}</text>`;
  const arrow = (y) => `<path d="M ${W / 2 - 9} ${y} L ${W / 2 + 9} ${y} L ${W / 2} ${y + 13} Z" fill="${t.muted}"/>`;
  const cols = 2, gap = 14, cw = (innerW - gap) / cols, ch = 44, rg = 10;
  let y = 58;
  let s = `<text x="${mx}" y="34" font-family="${FONT}" font-size="16" fill="${t.muted}">One ecosystem — a shared hub and platform behind every product</text>`;
  s += head(y, 'DISTRIBUTION'); y += 14;
  s += chip(mx, y, innerW, 46, 'Beyond Volatility — the public hub & front door', { center: true, fill: t.panel, stroke: t.a2, fs: 17 });
  y += 56; s += arrow(y); y += 28;
  s += head(y, 'PRODUCTS'); y += 14;
  a.apps.forEach((l, i) => { s += chip(mx + (i % cols) * (cw + gap), y + Math.floor(i / cols) * (ch + rg), cw, ch, l); });
  y += Math.ceil(a.apps.length / cols) * (ch + rg) - rg + 10; s += arrow(y); y += 28;
  s += head(y, 'BACK ENDS'); y += 14;
  a.backends.forEach((l, i) => { s += chip(mx + i * (cw + gap), y, cw, ch, l); });
  y += ch + 10; s += arrow(y); y += 28;
  s += head(y, 'DELIVERY'); y += 14;
  a.delivery.forEach((l, i) => { s += chip(mx + (i % cols) * (cw + gap), y + Math.floor(i / cols) * (ch + rg), cw, ch, l); });
  y += Math.ceil(a.delivery.length / cols) * (ch + rg) - rg + 18;
  s += `<rect x="${mx}" y="${y}" width="${innerW}" height="66" rx="12" fill="${t.panel}" stroke="url(#accent)" stroke-width="1.5"/>`;
  s += `<text x="${mx + 20}" y="${y + 28}" font-family="${FONT}" font-size="18" font-weight="700" fill="url(#accent)">THE PLATFORM</text>`;
  s += `<text x="${mx + 20}" y="${y + 50}" font-family="${FONT}" font-size="15" fill="${t.muted}">Agent-automation + standards-as-code — every product ships on this</text>`;
  y += 88;
  return svgDoc(W, y, s, 'Ecosystem map — hub, products, back ends, delivery, and the shared platform', t);
}

function pipelineSvg(d, t) {
  const W = 720, mx = 32, innerW = W - 2 * mx, bandH = 84, gap = 22;
  let y = 62;
  let s = `<text x="${mx}" y="36" font-family="${FONT}" font-size="16" fill="${t.muted}">How I ship — intent in, reviewed &amp; deployed changes out</text>`;
  d.pipeline.forEach((p, i) => {
    s += `<rect x="${mx}" y="${y}" width="${innerW}" height="${bandH}" rx="12" fill="${t.panel}" stroke="${t.line}"/>`;
    s += `<circle cx="${mx + 30}" cy="${y + 32}" r="16" fill="${t.chip}"/>`;
    s += `<text x="${mx + 30}" y="${y + 38}" font-family="${FONT}" font-size="17" font-weight="700" fill="url(#accent)" text-anchor="middle">${i + 1}</text>`;
    s += `<text x="${mx + 60}" y="${y + 38}" font-family="${FONT}" font-size="20" font-weight="700" letter-spacing="1" fill="${t.text}">${esc(p.phase)}</text>`;
    wrap(p.detail, 74, 2).forEach((ln, li) => {
      s += `<text x="${mx + 20}" y="${y + 60 + li * 20}" font-family="${FONT}" font-size="14.5" fill="${t.muted}">${esc(ln)}</text>`;
    });
    y += bandH;
    if (i < d.pipeline.length - 1) { s += `<path d="M ${W / 2 - 9} ${y + 5} L ${W / 2 + 9} ${y + 5} L ${W / 2} ${y + 17} Z" fill="${t.muted}"/>`; y += gap; }
  });
  return svgDoc(W, y + 20, s, 'Ship pipeline — plan, build, verify, ship', t);
}

function commitsSvg(d, t) {
  const rows = d.metrics.commitsByRepo;
  const W = 720, top = 68, rowH = 30, rowGap = 9, labelX = 172, barX = 182, barMax = 452;
  const max = Math.max(...rows.map((r) => r.commits));
  const H = top + rows.length * (rowH + rowGap) + 18;
  let s = `<text x="28" y="42" font-family="${FONT}" font-size="17" fill="${t.muted}">Commits per repository</text>
  <text x="${W - 28}" y="42" font-family="${FONT}" font-size="15" fill="${t.muted}" text-anchor="end">~${compact(d.metrics.commits)} total · single author</text>`;
  rows.forEach((r, i) => {
    const y = top + i * (rowH + rowGap);
    const bw = Math.max(5, Math.round((r.commits / max) * barMax));
    s += `\n  <text x="${labelX}" y="${y + 21}" font-family="${FONT}" font-size="16" fill="${t.text}" text-anchor="end">${esc(r.label)}</text>`;
    s += `\n  <rect x="${barX}" y="${y + 5}" width="${bw}" height="22" rx="5" fill="url(#accent)"/>`;
    s += `\n  <text x="${barX + bw + 10}" y="${y + 21}" font-family="${FONT}" font-size="15" fill="${t.muted}">${r.commits.toLocaleString('en-US')}</text>`;
  });
  return svgDoc(W, H, s, 'Commits per repository', t);
}

function languagesSvg(d, t) {
  const langs = d.metrics.languages;
  const total = langs.reduce((n, l) => n + l.lines, 0);
  const W = 720, mx = 28, barW = W - 2 * mx, barY = 62, barH = 34;
  let s = `<text x="${mx}" y="40" font-family="${FONT}" font-size="17" fill="${t.muted}">Language mix</text>
  <text x="${W - mx}" y="40" font-family="${FONT}" font-size="15" fill="${t.muted}" text-anchor="end">${compact(total)} lines of tracked source</text>`;
  let x = mx;
  langs.forEach((l, i) => {
    const w = Math.max(2, (l.lines / total) * barW);
    const round = (i === 0 || i === langs.length - 1) ? 'rx="6"' : '';
    s += `\n  <rect x="${x.toFixed(1)}" y="${barY}" width="${w.toFixed(1)}" height="${barH}" ${round} fill="${LANG_COLORS[l.name] || t.chip}"/>`;
    x += w;
  });
  const ly = barY + barH + 32, perRow = 3, cellW = barW / perRow;
  langs.forEach((l, i) => {
    const cx = mx + (i % perRow) * cellW, cy = ly + Math.floor(i / perRow) * 28;
    const pct = ((l.lines / total) * 100).toFixed(1);
    s += `\n  <rect x="${cx}" y="${cy - 11}" width="13" height="13" rx="3" fill="${LANG_COLORS[l.name] || t.chip}"/>`;
    s += `\n  <text x="${cx + 20}" y="${cy}" font-family="${FONT}" font-size="15" fill="${t.text}">${esc(l.name)} <tspan fill="${t.muted}">${pct}%</tspan></text>`;
  });
  return svgDoc(W, ly + Math.ceil(langs.length / perRow) * 28 + 6, s, 'Language mix across tracked source', t);
}

const SVGS = { hero: heroSvg, ecosystem: ecosystemSvg, pipeline: pipelineSvg, commits: commitsSvg, languages: languagesSvg };

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
  return `<img src="https://img.shields.io/badge/${label}-${c}?style=flat-square${logo ? `&logo=${logo}&logoColor=${lc || 'white'}` : ''}" alt="${esc(name)}">`;
}
function linkBadge(label, color, logo, url, logoColor = 'white') {
  const lb = encodeURIComponent(label).replace(/-/g, '--');
  return `<a href="${url}"><img src="https://img.shields.io/badge/${lb}-${color}?style=flat-square${logo ? `&logo=${logo}&logoColor=${logoColor}` : ''}" alt="${esc(label)}"></a>`;
}

// ---------------------------------------------------------------------------
// README pieces
// ---------------------------------------------------------------------------

const HERO_BADGES = ['TypeScript', 'React', 'Next.js', 'Node.js', 'Firebase', 'Supabase', 'PostgreSQL', 'Capacitor', 'Vercel', 'GitHub Actions', 'Claude Code'];

function centered(inner) { return `<p align="center">\n  ${inner}\n</p>`; }

/** <picture> that swaps light/dark by the reader's GitHub theme */
function picture(name, alt, width, center = false) {
  const w = width === '100%' ? ' width="100%"' : ` width="${width}"`;
  const pic = `<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/${name}.dark.svg">
  <img src="assets/${name}.light.svg" alt="${esc(alt)}"${w}>
</picture>`;
  return center ? `<p align="center">${pic}</p>` : pic;
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
  const body = Object.entries(p.deepdive).map(([k, v]) => `**${k}.** ${v}`).join('\n\n');
  return `<details>\n<summary><b>${esc(p.name)} — deep dive</b></summary>\n\n${body}\n\n</details>`;
}
function stackDetails(stack) {
  const groups = Object.entries(stack).map(([g, items]) => `**${g}**  \n${items.map(badge).join(' ')}`).join('\n\n');
  return `<details>\n<summary><b>Full stack &amp; tooling</b></summary>\n\n${groups}\n\n</details>`;
}
function commandTable(p) {
  return `| Command | What it does |\n|---|---|\n${p.commands.map((c) => `| \`/${c.name}\` | ${c.does} |`).join('\n')}`;
}
function recentlyShipped(act) {
  if (!act?.repos?.length) return null;
  const rows = act.repos.filter((r) => r.name !== 'this profile').map((r) => {
    const ver = r.version && !/^v?0\.0\./.test(r.version) ? `\`${r.version}\`` : '—';
    return `| **${r.name}** | ${ver} | ${r.recent != null ? r.recent.toLocaleString('en-US') : '—'} |`;
  }).join('\n');
  return `<sub>Still shipping — latest version and commit volume over the last 90 days, as of ${fmtDate(act.asOf)}. Regenerated from git, not hand-edited.</sub>\n\n| Product | Latest | Commits · 90d |\n|---|---|---|\n${rows}`;
}
function wakaSection(w) {
  if (!w?.enabled || !w.username || w.username.startsWith('REPLACE')) return null;
  const q = `username=${encodeURIComponent(w.username)}&layout=compact&langs_count=6&hide_border=true&bg_color=0b1220&title_color=38bdf8&text_color=e6edf3&icon_color=818cf8`;
  return `<sub>Editor time tracked by WakaTime — honest across public and private repos, because it counts keystrokes, not the contribution graph.</sub>\n\n<img src="https://github-readme-stats.vercel.app/api/wakatime?${q}" alt="Coding time by language over the last week (WakaTime)" width="480">`;
}
function connectRow(d) {
  const c = d.connect;
  const b = [
    linkBadge('LinkedIn', '0A66C2', 'linkedin', c.linkedin),
    linkBadge('Portfolio', '0b1220', 'safari', c.hub),
    linkBadge('ParentPod', '111111', 'appstore', c.flagship),
  ];
  const social = { Instagram: ['E4405F', 'instagram'], TikTok: ['000000', 'tiktok'], X: ['000000', 'x'] };
  for (const s of c.socials) { const [col, logo] = social[s.label] || ['1b2942', '']; b.push(linkBadge(s.label, col, logo, s.url)); }
  return centered(b.join('\n  '));
}

// ---------------------------------------------------------------------------
// README assembly
// ---------------------------------------------------------------------------

function buildReadme(d, act) {
  const m = d.metrics;
  const S = [];
  const add = (nav, title, ...body) => { const b = body.filter(Boolean).join('\n\n'); if (b) S.push({ nav, title, body: b }); };

  add('What I build', 'What I build',
    'By day, reliability compliance at a large energy company — 12 years keeping the power grid up. Nights and weekends, I design, build, ship, and operate every product below **solo**, on an agent-automation platform I built so the repetitive engineering happens *under review* instead of by hand. The numbers above aren\'t a team\'s output — they\'re one engineer with a lot of leverage.',
    '**Currently**\n\n' + d.currently.map((x) => `- ${x}`).join('\n'));

  add('Ecosystem', 'The ecosystem',
    `${m.repos} repositories, one system: a shared hub for distribution, a portfolio of products, two back ends, and native + web delivery — all resting on the automation platform.`,
    picture('ecosystem', 'Ecosystem map — Beyond Volatility hub, products, Firebase and Supabase back ends, Vercel / Firebase Hosting / app-store delivery, all on a shared agent-automation platform.', 680, true));

  add('How I ship', 'How I ship',
    picture('pipeline', 'Ship pipeline — plan (scoped by standards-as-code), build (parallel agents, test-first), verify (adversarial review, tests, security and doc-freshness gates), ship (auto-merge, deploy, docs updated).', 680, true),
    d.platform.summary,
    commandTable(d.platform),
    `**Standards-as-code:** ${d.platform.standards.map((s) => `\`${s}\``).join(' · ')} — one library, symlinked into every repo *and* loaded into every agent's context, plus ${d.platform.skillsCount} reusable skills.`);

  add('By the numbers', 'By the numbers',
    '<sub>Real figures, aggregated across every repository — public *and* private. No third-party stat widgets; these are computed from the actual git history and source tree, then drawn from data.</sub>',
    picture('commits', 'Commits per repository — ParentPod 2,229; RealInvestorX 934; Longevity 809; Apex 797; Compliance OS 552; Beyond Volatility 422; and more. ~5,900 total, single author.', '100%'),
    picture('languages', 'Language mix across 681K lines of tracked source — TypeScript 45.5%, JavaScript 34.8%, CSS 14.2%, PHP 2.6%, SQL 2.2%, other 0.8%.', '100%'));

  add('Recently shipped', 'Recently shipped', recentlyShipped(act));
  add('Time', 'Where the time goes', wakaSection(d.waka));

  add('Selected work', 'Selected work',
    selectedWorkTable(d.projects),
    d.projects.filter((p) => p.deepdive).map(deepDive).join('\n\n'),
    stackDetails(d.stack));

  add('Practices', 'Engineering practices', d.practices.map((x) => `- ${x}`).join('\n'));
  add('Connect', 'Connect', connectRow(d));

  const nav = centered(S.map((s) => `<a href="#${slug(s.title)}">${s.nav}</a>`).join('\n  &nbsp;·&nbsp;\n  '));
  const header = [
    picture('hero', `${d.profile.name} — ${d.profile.role}. ${m.repos} repositories, ${compact(m.commits)} commits, ${compact(m.linesOfSource)} lines of source, ${m.appsInProduction} apps in production, ${m.engineers} engineer.`, '100%'),
    centered(HERO_BADGES.map(badge).join('\n  ')),
    nav,
  ];
  const body = S.map((s) => `## ${s.title}\n\n${s.body}`);
  const footer = `---\n\n<sub>App repositories are private — this work ships to production, not public forks. This entire page — copy, tables, and every SVG (light + dark) — is generated from data (<a href="data/projects.json">projects.json</a> + <a href="data/activity.json">activity.json</a>) by <a href="scripts/generate-showcase.mjs"><code>generate-showcase.mjs</code></a> and refreshed on a schedule by GitHub Actions. Full portfolio → <b><a href="${d.profile.hub}">beyondvolatility.com</a></b>.</sub>`;

  return [...header, ...body, footer].join('\n\n') + '\n';
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

mkdirSync(join(ROOT, 'assets'), { recursive: true });
const written = [];
for (const [name, fn] of Object.entries(SVGS)) {
  for (const [theme, t] of Object.entries(THEMES)) {
    const file = `${name}.${theme}.svg`;
    writeFileSync(join(ROOT, 'assets', file), fn(data, t));
    written.push(file);
  }
}
console.log('assets:', written.join(', '));
writeFileSync(join(ROOT, 'README.md'), buildReadme(data, activity));
console.log('README.md written.');
