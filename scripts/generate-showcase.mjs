#!/usr/bin/env node
/**
 * generate-showcase.mjs
 *
 * Regenerates the ENTIRE README and every visual asset from data (projects.json
 * + activity.json). Nothing on the page is hand-maintained — edit the data (or
 * this generator), never the rendered output. A stamp-guarded local schedule
 * refreshes the public profile.
 *
 * Every infographic is ANIMATED (CSS keyframes + SMIL — both render inside
 * GitHub's <img>-embedded SVGs) and ships a LIGHT and a DARK variant, swapped
 * by the reader's GitHub theme via <picture> + prefers-color-scheme:
 *   assets/hero.{light,dark}.svg        — name + headline metrics, glow field
 *   assets/orbit.{light,dark}.svg       — products and shared infrastructure
 *   assets/ecosystem.{light,dark}.svg   — layered ecosystem map
 *   assets/pipeline.{light,dark}.svg    — ship pipeline with a live flow pulse
 *   assets/commits.{light,dark}.svg     — commits per repository (bars grow in)
 *   assets/languages.{light,dark}.svg   — language mix (segments grow in)
 *   assets/velocity.{light,dark}.svg    — 90-day shipping cadence (from activity)
 *   README.md                           — the whole file
 *
 * SVGs are self-contained (own background, system fonts, no external refs) and
 * typeset to stay legible when scaled to phone width. Animations respect
 * prefers-reduced-motion where CSS-driven. The script is idempotent.
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

// Computed metrics win over the declared ones.
//
// `projects.json` carried these as hand-typed literals and they froze at
// 2026-07-11: the hero claimed "4 apps in production" while five were live, and
// a commit total that predated EngiByte, JaLingo and TheLoop. The collector now
// derives them from the repositories themselves, so the headline cannot drift
// from reality again. Declared values remain as the fallback for anything the
// collector cannot compute (lines of source, tracked files) and for a run with
// no local checkouts.
if (activity?.metrics) {
  data.metrics = { ...data.metrics, ...activity.metrics };
}

// ---------------------------------------------------------------------------
// Themes + helpers
// ---------------------------------------------------------------------------

const THEMES = {
  dark: { bg: '#0b1220', panel: '#131d33', chip: '#1b2942', text: '#e6edf3', muted: '#8b97a8', line: '#243149', a1: '#38bdf8', a2: '#818cf8', ok: '#34d399' },
  light: { bg: '#ffffff', panel: '#f6f8fa', chip: '#eaeef2', text: '#1f2328', muted: '#59636e', line: '#d1d9e0', a1: '#0969da', a2: '#8250df', ok: '#1a7f37' },
};
const LANG_COLORS = { TypeScript: '#3178c6', JavaScript: '#e6c84f', CSS: '#38bdf8', PHP: '#818cf8', SQL: '#22c55e', Other: '#94a3b8' };
const FONT = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace";
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const HTML_ENTITIES = Object.freeze({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
});
export const esc = (s) => String(s).replace(/[&<>"']/g, (character) => HTML_ENTITIES[character]);
// Escape a value destined for a markdown table cell: a literal `|` would end
// the cell and backticks would break the inline-code span.
export const mdCell = (s) => String(s)
  .replace(/\\/g, '\\\\')
  .replace(/\|/g, '\\|')
  .replace(/`/g, '');
const compact = (n) =>
  n >= 1000 ? (n / 1000 >= 100 ? Math.round(n / 1000) : (n / 1000).toFixed(1).replace(/\.0$/, '')) + 'K' : String(n);
export function fmtDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? ''));
  if (!match) throw new Error(`Invalid ISO date: ${value}`);
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) {
    throw new Error(`Invalid ISO date: ${value}`);
  }
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const num = (n) => n.toLocaleString('en-US');

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
// Motion. CSS classes animate INTO the element's natural state with
// `backwards` fill, so a renderer without CSS support (or a reduced-motion
// reader) simply sees the finished graphic. Continuous flourishes (orbits,
// flow pulses) use SMIL, which GitHub also renders inside <img>.
// ---------------------------------------------------------------------------

const BASE_CSS = `
    @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } }
    @keyframes growX { from { transform: scaleX(0); } }
    @keyframes blink { 0%, 100% { opacity: .2; } 50% { opacity: 1; } }
    @keyframes sweep { to { transform: translateX(900px); } }
    @keyframes drift { to { transform: translate(30px, 16px); } }
    .fade { animation: fadeUp .7s cubic-bezier(.22,.7,.25,1) backwards; }
    .grow { animation: growX .9s cubic-bezier(.22,.7,.25,1) backwards; }
    .blink { animation: blink 2.4s ease-in-out infinite; }
    .sweep { animation: sweep 3.8s linear infinite; }
    .drift { animation: drift 13s ease-in-out infinite alternate; }
    @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }`;

/** Per-element start delay (composes with the .fade/.grow shorthand). */
const delay = (s) => ` style="animation-delay:${s.toFixed(2)}s"`;

function svgDoc(w, h, inner, label, t) {
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(label)}">
  <defs>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${t.a1}"/><stop offset="1" stop-color="${t.a2}"/>
    </linearGradient>
    <filter id="soft" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="42"/></filter>
  </defs>
  <style>${BASE_CSS}
  </style>
  <rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="18" fill="${t.bg}" stroke="${t.line}"/>
  ${inner}
</svg>`;
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
  const site = d.profile.hub.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const statMarkup = stats.map(([n, l], i) => {
    const x = x0 + i * cell;
    return `<g class="fade"${delay(0.45 + i * 0.1)}>
    <text x="${x}" y="230" font-family="${FONT}" font-size="34" font-weight="700" fill="url(#accent)">${esc(n)}</text>
    <text x="${x}" y="254" font-family="${FONT}" font-size="16" fill="${t.muted}">${esc(l)}</text>
  </g>`;
  }).join('\n  ');
  const inner = `<clipPath id="heroClip"><rect x="1" y="1" width="${W - 2}" height="294" rx="17"/></clipPath>
  <g clip-path="url(#heroClip)">
    <circle cx="590" cy="30" r="130" fill="${t.a1}" opacity="0.12" filter="url(#soft)" class="drift"/>
    <circle cx="180" cy="270" r="150" fill="${t.a2}" opacity="0.10" filter="url(#soft)" class="drift" style="animation-delay:-6s"/>
  </g>
  <g class="fade">
    <text x="${x0}" y="76" font-family="${FONT}" font-size="48" font-weight="800" fill="${t.text}">${esc(d.profile.name)}</text>
  </g>
  <clipPath id="uline"><rect x="${x0 + 2}" y="90" width="72" height="6" rx="3"/></clipPath>
  <rect x="${x0 + 2}" y="90" width="72" height="6" rx="3" fill="url(#accent)"/>
  <g clip-path="url(#uline)"><rect x="-120" y="90" width="60" height="6" fill="#ffffff" opacity="0.55" class="sweep"/></g>
  <g class="fade"${delay(0.12)}>
    <text x="${x0}" y="128" font-family="${FONT}" font-size="20" fill="${t.text}">${esc(d.profile.role)}</text>
  </g>
  <g class="fade"${delay(0.22)}>
    <text x="${x0}" y="158" font-family="${FONT}" font-size="16" fill="${t.muted}">One engineer · production systems · deliberate delivery</text>
  </g>
  <g class="fade"${delay(0.3)}>
    <text x="${W - x0}" y="76" font-family="${FONT}" font-size="16" font-weight="600" fill="${t.a1}" text-anchor="end">${esc(site)} ↗</text>
  </g>
  <g class="grow" style="transform-origin:${x0}px 186px;animation-delay:.3s"><line x1="${x0}" y1="186" x2="${W - x0}" y2="186" stroke="${t.line}"/></g>
  ${statMarkup}
  <text x="${W - x0}" y="282" font-family="${FONT}" font-size="12" fill="${t.muted}" text-anchor="end">portfolio snapshot · ${esc(fmtDate(m.asOf))}</text>`;
  return svgDoc(W, 296, inner, `${d.profile.name} — headline metrics snapshot dated ${m.asOf}`, t);
}

function orbitSvg(d, t) {
  const W = 720, H = 552, cx = W / 2, cy = 288;
  const outerItems = [...d.architecture.apps, 'Beyond Volatility'];
  const innerItems = d.architecture.services || [];
  const chip = (label, accent = false) => {
    const w = Math.round(label.length * 7.6 + 26), h = 32;
    return `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h / 2}" fill="${t.panel}" stroke="${accent ? 'url(#accent)' : t.line}"${accent ? ' stroke-width="1.5"' : ''}/>
        <text x="0" y="5" font-family="${FONT}" font-size="14" fill="${t.text}" text-anchor="middle">${esc(label)}</text>`;
  };
  // Each ring spins as a whole; every chip counter-rotates about its own
  // center at the same rate so its label stays upright the entire orbit.
  const ring = (items, R, dur, dir, accentLabel) => {
    const step = 360 / items.length;
    const chips = items.map((label, i) => {
      const a = -90 + i * step;
      return `<g transform="rotate(${a}) translate(${R} 0) rotate(${-a})">
      <g><animateTransform attributeName="transform" type="rotate" from="0" to="${-dir * 360}" dur="${dur}s" repeatCount="indefinite"/>
        ${chip(label, label === accentLabel)}
      </g>
    </g>`;
    }).join('\n    ');
    return `<circle cx="0" cy="0" r="${R}" fill="none" stroke="${t.line}" stroke-dasharray="3 8"/>
    <g><animateTransform attributeName="transform" type="rotate" from="0" to="${dir * 360}" dur="${dur / 4}s" repeatCount="indefinite"/>
      <circle cx="0" cy="${-R}" r="3.5" fill="${t.a1}"/>
    </g>
    <g><animateTransform attributeName="transform" type="rotate" from="0" to="${dir * 360}" dur="${dur}s" repeatCount="indefinite"/>
    ${chips}
    </g>`;
  };
  const inner = `<text x="32" y="36" font-family="${FONT}" font-size="16" fill="${t.muted}">Portfolio map — deployed products and their shared infrastructure</text>
  <g transform="translate(${cx} ${cy})">
    ${ring(outerItems, 212, 80, 1, 'Beyond Volatility')}
    ${ring(innerItems, 122, 56, -1)}
    <circle cx="0" cy="0" r="66" fill="${t.panel}" stroke="url(#accent)" stroke-width="1.5"/>
    <circle cx="0" cy="0" r="66" fill="none" stroke="${t.a1}" opacity="0">
      <animate attributeName="r" values="66;108" dur="3.4s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.5;0" dur="3.4s" repeatCount="indefinite"/>
    </circle>
    <text x="0" y="-14" font-family="${FONT}" font-size="26" font-weight="800" fill="url(#accent)" text-anchor="middle">${esc(String(d.metrics.engineers))}</text>
    <text x="0" y="8" font-family="${FONT}" font-size="14" font-weight="700" fill="${t.text}" text-anchor="middle">ENGINEER</text>
    <text x="0" y="30" font-family="${FONT}" font-size="12.5" fill="${t.muted}" text-anchor="middle">+ delivery system</text>
  </g>`;
  return svgDoc(W, H, inner, `Portfolio map — ${outerItems.join(', ')} with shared delivery infrastructure.`, t);
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
  let band = 0;
  const fadeOpen = () => `<g class="fade"${delay(0.1 + band++ * 0.16)}>`;
  let s = `<text x="${mx}" y="34" font-family="${FONT}" font-size="16" fill="${t.muted}">One ecosystem — shared infrastructure and consistent release controls</text>`;
  s += fadeOpen();
  s += head(y, 'DISTRIBUTION'); y += 14;
  s += chip(mx, y, innerW, 46, 'Beyond Volatility — the public hub & front door', { center: true, fill: t.panel, stroke: t.a2, fs: 17 });
  s += '</g>';
  y += 56; s += arrow(y); y += 28;
  s += fadeOpen();
  s += head(y, 'PRODUCTS'); y += 14;
  a.apps.forEach((l, i) => { s += chip(mx + (i % cols) * (cw + gap), y + Math.floor(i / cols) * (ch + rg), cw, ch, l); });
  s += '</g>';
  y += Math.ceil(a.apps.length / cols) * (ch + rg) - rg + 10; s += arrow(y); y += 28;
  s += fadeOpen();
  s += head(y, 'BACK ENDS'); y += 14;
  a.backends.forEach((l, i) => { s += chip(mx + i * (cw + gap), y, cw, ch, l); });
  s += '</g>';
  y += ch + 10; s += arrow(y); y += 28;
  s += fadeOpen();
  s += head(y, 'DELIVERY'); y += 14;
  a.delivery.forEach((l, i) => { s += chip(mx + (i % cols) * (cw + gap), y + Math.floor(i / cols) * (ch + rg), cw, ch, l); });
  s += '</g>';
  y += Math.ceil(a.delivery.length / cols) * (ch + rg) - rg + 18;
  s += fadeOpen();
  s += `<rect x="${mx}" y="${y}" width="${innerW}" height="66" rx="12" fill="${t.panel}" stroke="url(#accent)" stroke-width="1.5"/>`;
  s += `<text x="${mx + 20}" y="${y + 28}" font-family="${FONT}" font-size="18" font-weight="700" fill="url(#accent)">DELIVERY FOUNDATION</text>`;
  s += `<text x="${mx + 20}" y="${y + 50}" font-family="${FONT}" font-size="15" fill="${t.muted}">Shared standards, test gates, deployment checks, and operating documentation</text>`;
  s += '</g>';
  y += 88;
  return svgDoc(W, y, s, 'Ecosystem map — hub, products, back ends, delivery, and shared release controls', t);
}

function pipelineSvg(d, t) {
  const W = 720, mx = 32, innerW = W - 2 * mx, bandH = 84, gap = 22;
  const railX = mx + 18, bandX = mx + 48, bandW = innerW - 48;
  let y = 62;
  const centers = [];
  let bands = '';
  d.pipeline.forEach((p, i) => {
    centers.push(y + 32);
    bands += `<g class="fade"${delay(0.15 + i * 0.18)}>
  <rect x="${bandX}" y="${y}" width="${bandW}" height="${bandH}" rx="12" fill="${t.panel}" stroke="${t.line}"/>
  <text x="${bandX + 22}" y="${y + 38}" font-family="${FONT}" font-size="20" font-weight="700" letter-spacing="1" fill="${t.text}">${esc(p.phase)}</text>`;
    wrap(p.detail, 72, 2).forEach((ln, li) => {
      bands += `\n  <text x="${bandX + 22}" y="${y + 60 + li * 20}" font-family="${FONT}" font-size="14.5" fill="${t.muted}">${esc(ln)}</text>`;
    });
    bands += '\n</g>';
    y += bandH + (i < d.pipeline.length - 1 ? gap : 0);
  });
  const y0 = centers[0], y1 = centers[centers.length - 1];
  const rail = `<line x1="${railX}" y1="${y0}" x2="${railX}" y2="${y1}" stroke="${t.line}" stroke-width="2"/>
  ${centers.map((cyy, i) => `<circle cx="${railX}" cy="${cyy}" r="15" fill="${t.chip}" stroke="${t.line}"/>
  <text x="${railX}" y="${cyy + 6}" font-family="${FONT}" font-size="16" font-weight="700" fill="url(#accent)" text-anchor="middle">${i + 1}</text>`).join('\n  ')}
  <circle r="9" fill="${t.a1}" opacity="0.25"><animateMotion path="M ${railX} ${y0} L ${railX} ${y1}" dur="5s" repeatCount="indefinite"/></circle>
  <circle r="4.5" fill="url(#accent)"><animateMotion path="M ${railX} ${y0} L ${railX} ${y1}" dur="5s" repeatCount="indefinite"/></circle>`;
  const s = `<text x="${mx}" y="36" font-family="${FONT}" font-size="16" fill="${t.muted}">How I ship — intent in, reviewed &amp; deployed changes out</text>
  ${rail}
  ${bands}`;
  return svgDoc(W, y + 20, s, 'Ship pipeline — plan, build, verify, ship', t);
}

function commitsSvg(d, t) {
  const rows = d.metrics.commitsByRepo;
  const W = 720, top = 68, rowH = 30, rowGap = 9, labelX = 172, barX = 182, barMax = 452;
  const max = Math.max(...rows.map((r) => r.commits));
  const H = top + rows.length * (rowH + rowGap) + 18;
  const gridBottom = top + rows.length * (rowH + rowGap) - rowGap + 5;
  const grid = [0.25, 0.5, 0.75, 1].map((f) =>
    `<line x1="${(barX + barMax * f).toFixed(1)}" y1="${top}" x2="${(barX + barMax * f).toFixed(1)}" y2="${gridBottom}" stroke="${t.line}" stroke-dasharray="2 6" opacity="0.6"/>`).join('\n  ');
  let s = `<text x="28" y="42" font-family="${FONT}" font-size="17" fill="${t.muted}">Commits per repository — top ${rows.length} of ${d.metrics.repos} repos</text>
  <text x="${W - 28}" y="42" font-family="${FONT}" font-size="15" fill="${t.muted}" text-anchor="end">~${compact(d.metrics.commits)} total · single author</text>
  ${grid}`;
  rows.forEach((r, i) => {
    const y = top + i * (rowH + rowGap);
    const bw = Math.max(5, Math.round((r.commits / max) * barMax));
    s += `\n  <text x="${labelX}" y="${y + 21}" font-family="${FONT}" font-size="16" fill="${t.text}" text-anchor="end">${esc(r.label)}</text>`;
    s += `\n  <g class="grow" style="transform-origin:${barX}px ${y + 16}px;animation-delay:${(0.1 + i * 0.08).toFixed(2)}s"><rect x="${barX}" y="${y + 5}" width="${bw}" height="22" rx="5" fill="url(#accent)"/></g>`;
    s += `\n  <g class="fade"${delay(0.55 + i * 0.08)}><text x="${barX + bw + 10}" y="${y + 21}" font-family="${FONT}" font-size="15" fill="${t.muted}">${num(r.commits)}</text></g>`;
  });
  return svgDoc(W, H, s, 'Commits per repository', t);
}

function languagesSvg(d, t) {
  const langs = d.metrics.languages;
  const total = langs.reduce((n, l) => n + l.lines, 0);
  const W = 720, mx = 28, barW = W - 2 * mx, barY = 62, barH = 34;
  let s = `<text x="${mx}" y="40" font-family="${FONT}" font-size="17" fill="${t.muted}">Language mix</text>
  <text x="${W - mx}" y="40" font-family="${FONT}" font-size="15" fill="${t.muted}" text-anchor="end">${compact(total)} lines of tracked source</text>`;
  let x = mx, acc = 0;
  langs.forEach((l, i) => {
    const w = Math.max(2, (l.lines / total) * barW);
    const round = (i === 0 || i === langs.length - 1) ? 'rx="6"' : '';
    // Stagger each segment so the bar assembles left-to-right.
    s += `\n  <g class="grow" style="transform-origin:${x.toFixed(1)}px ${barY}px;animation-delay:${(0.1 + acc * 0.9).toFixed(2)}s"><rect x="${x.toFixed(1)}" y="${barY}" width="${w.toFixed(1)}" height="${barH}" ${round} fill="${LANG_COLORS[l.name] || t.chip}"/></g>`;
    x += w; acc += l.lines / total;
  });
  const ly = barY + barH + 32, perRow = 3, cellW = barW / perRow;
  langs.forEach((l, i) => {
    const cx = mx + (i % perRow) * cellW, cy = ly + Math.floor(i / perRow) * 28;
    const pct = ((l.lines / total) * 100).toFixed(1);
    s += `\n  <g class="fade"${delay(0.8 + i * 0.07)}>`;
    s += `<rect x="${cx}" y="${cy - 11}" width="13" height="13" rx="3" fill="${LANG_COLORS[l.name] || t.chip}"/>`;
    s += `<text x="${cx + 20}" y="${cy}" font-family="${FONT}" font-size="15" fill="${t.text}">${esc(l.name)} <tspan fill="${t.muted}">${pct}%</tspan></text></g>`;
  });
  return svgDoc(W, ly + Math.ceil(langs.length / perRow) * 28 + 6, s, 'Language mix across tracked source', t);
}

function velocitySvg(d, act, t) {
  const DAY = 86400000;
  const rows = act.repos.filter((r) => r.name !== 'this profile');
  const W = 720, top = 68, rowH = 30, rowGap = 10, labelX = 172, barX = 182, barMax = 380;
  const max = Math.max(...rows.map((r) => r.recent || 0), 1);
  const H = top + rows.length * (rowH + rowGap) + 40;
  let s = `<text x="28" y="42" font-family="${FONT}" font-size="17" fill="${t.muted}">Shipping cadence — commits over the trailing 90 days</text>
  <text x="${W - 28}" y="42" font-family="${FONT}" font-size="15" fill="${t.muted}" text-anchor="end">as of ${esc(fmtDate(act.asOf))}</text>`;
  rows.forEach((r, i) => {
    const y = top + i * (rowH + rowGap);
    const bw = Math.max(5, Math.round(((r.recent || 0) / max) * barMax));
    const fresh = r.lastShipped && Date.parse(act.asOf) - Date.parse(r.lastShipped) <= 14 * DAY;
    const ver = r.version && !/^v?0\.0\./.test(r.version) ? r.version : null;
    if (fresh) s += `\n  <circle cx="30" cy="${y + 16}" r="4" fill="${t.ok}" class="blink"/>`;
    s += `\n  <text x="${labelX}" y="${y + 21}" font-family="${FONT}" font-size="16" fill="${t.text}" text-anchor="end">${esc(r.name)}</text>`;
    s += `\n  <g class="grow" style="transform-origin:${barX}px ${y + 16}px;animation-delay:${(0.1 + i * 0.09).toFixed(2)}s"><rect x="${barX}" y="${y + 5}" width="${bw}" height="22" rx="11" fill="url(#accent)"/></g>`;
    s += `\n  <g class="fade"${delay(0.55 + i * 0.09)}><text x="${barX + bw + 10}" y="${y + 21}" font-family="${FONT}" font-size="15" fill="${t.muted}">${r.recent != null ? num(r.recent) : '—'}${ver ? ` · <tspan font-family="${MONO}" font-size="13">${esc(ver)}</tspan>` : ''}</text></g>`;
  });
  s += `\n  <circle cx="30" cy="${H - 20}" r="4" fill="${t.ok}" class="blink"/>
  <text x="42" y="${H - 15}" font-family="${FONT}" font-size="13.5" fill="${t.muted}">shipped within the last two weeks</text>`;
  return svgDoc(W, H, s, 'Shipping cadence — commits per product over the trailing 90 days', t);
}

const SVGS = {
  hero: heroSvg,
  orbit: orbitSvg,
  ecosystem: ecosystemSvg,
  pipeline: pipelineSvg,
  commits: commitsSvg,
  languages: languagesSvg,
  ...(activity?.repos?.length ? { velocity: (d, t) => velocitySvg(d, activity, t) } : {}),
};

/** Render every SVG in every theme — used by main() and by the tests. */
export function renderAll() {
  const out = {};
  for (const [name, fn] of Object.entries(SVGS)) {
    out[name] = {};
    for (const [theme, t] of Object.entries(THEMES)) out[name][theme] = fn(data, t);
  }
  return out;
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
  Prettier: ['F7B93E', 'prettier', 'black'],
  PHP: ['777BB4', 'php', 'white'], SQL: ['4479A1', 'postgresql', 'white'],
  Python: ['3776AB', 'python', 'white'], Bash: ['4EAA25', 'gnubash', 'white'],
  WordPress: ['21759B', 'wordpress', 'white'],
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

const HERO_BADGES = ['TypeScript', 'React', 'Next.js', 'Node.js', 'Firebase', 'Supabase', 'PostgreSQL', 'Capacitor', 'Vercel', 'GitHub Actions'];

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
export function recentlyShipped(act) {
  if (!act?.repos?.length) return null;
  const rows = act.repos.filter((r) => r.name !== 'this profile').map((r) => {
    const ver = r.version && !/^v?0\.0\./.test(r.version) ? `\`${mdCell(r.version)}\`` : '—';
    return `| **${mdCell(r.name)}** | ${ver} | ${r.recent != null ? r.recent.toLocaleString('en-US') : '—'} |`;
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
    linkBadge('GitHub', '181717', 'github', c.github || 'https://github.com/rockeish'),
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

export function buildReadme(d, act) {
  const m = d.metrics;
  const langTotal = m.languages.reduce((n, l) => n + l.lines, 0);
  const commitsAlt = `Commits per repository — ${m.commitsByRepo.map((r) => `${r.label} ${num(r.commits)}`).join('; ')}. ~${compact(m.commits)} total, single author.`;
  const languagesAlt = `Language mix across ${compact(langTotal)} lines of tracked source — ${m.languages.map((l) => `${l.name} ${((l.lines / langTotal) * 100).toFixed(1)}%`).join(', ')}.`;
  const orbitAlt = `Portfolio constellation — ${d.architecture.apps.join(', ')} and the Beyond Volatility hub connected through shared infrastructure, run by one engineer.`;
  const velocityRows = act?.repos?.filter((r) => r.name !== 'this profile') || [];
  const velocityAlt = `Shipping cadence over the trailing 90 days — ${velocityRows.map((r) => `${r.name} ${r.recent ?? '—'} commits`).join('; ')}.`;

  const S = [];
  const add = (nav, title, ...body) => { const b = body.filter(Boolean).join('\n\n'); if (b) S.push({ nav, title, body: b }); };

  add('What I build', 'What I build',
    'By day, I lead reliability-compliance work in the energy sector. Outside that role, I design, build, ship, and operate the products below, using a review-and-test system to keep changes traceable.',
    '**Currently**\n\n' + d.currently.map((x) => `- ${x}`).join('\n'));

  add('Ecosystem', 'The ecosystem',
    `${m.repos} repositories, one system: a shared hub for distribution, a portfolio of products, two back ends, and native + web delivery connected by common release controls.`,
    picture('orbit', orbitAlt, 680, true),
    picture('ecosystem', 'Ecosystem map — Beyond Volatility hub, products, Firebase and Supabase back ends, Vercel, Firebase Hosting, app-store delivery, and shared release controls.', 680, true));

  add('How I ship', 'How I ship',
    picture('pipeline', 'Ship pipeline — scope the change, build in isolation, run focused quality and security checks, deploy, verify, and update operating documentation.', 680, true),
    d.platform.summary,
    commandTable(d.platform),
    `**Shared engineering standards:** ${d.platform.standards.map((s) => `\`${s}\``).join(' · ')} — maintained centrally and applied according to each repository's stack and risk profile.`);

  add('By the numbers', 'By the numbers',
    `<sub>Portfolio snapshot dated ${fmtDate(m.asOf)}. These figures are computed from the git history and tracked source tree; the visible date prevents an old snapshot from presenting as live telemetry.</sub>`,
    picture('commits', commitsAlt, '100%'),
    picture('languages', languagesAlt, '100%'));

  add('Recently shipped', 'Recently shipped',
    act?.repos?.length ? picture('velocity', velocityAlt, '100%') : null,
    recentlyShipped(act));
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
  const footer = `---\n\n<sub>App repositories are private — this work ships to production, not public forks. This entire page — copy, tables, and every animated SVG (light + dark) — is generated from data (<a href="data/projects.json">projects.json</a> + <a href="data/activity.json">activity.json</a>) by <a href="scripts/generate-showcase.mjs"><code>generate-showcase.mjs</code></a> and refreshed by a stamp-guarded local schedule. Short link to this page → <b><a href="${d.profile.github || 'https://github.com/rockeish'}">github.com/rockeish</a></b> · full portfolio → <b><a href="${d.profile.hub}">beyondvolatility.com</a></b>.</sub>`;

  return [...header, ...body, footer].join('\n\n') + '\n';
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  mkdirSync(join(ROOT, 'assets'), { recursive: true });
  const written = [];
  for (const [name, themes] of Object.entries(renderAll())) {
    for (const [theme, svg] of Object.entries(themes)) {
      const file = `${name}.${theme}.svg`;
      writeFileSync(join(ROOT, 'assets', file), svg);
      written.push(file);
    }
  }
  console.log('assets:', written.join(', '));
  writeFileSync(join(ROOT, 'README.md'), buildReadme(data, activity));
  console.log('README.md written.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
