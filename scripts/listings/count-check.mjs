// Accuracy scan: every count shown on the site must match the live listing data.
// Usage: node scripts/listings/count-check.mjs [baseUrl=http://localhost:8788]   (needs Playwright; serve the site first)
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { parseLiteralAt } from './jslit.mjs';

const BASE = process.argv[2] || 'http://localhost:8788';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');
const SEO = await import(path.join(REPO, 'site-seo.js'));
const guides = JSON.parse(fs.readFileSync(path.join(REPO, 'data/guides.json'), 'utf8'));
for (const [k, g] of Object.entries(guides)) if (SEO.LOCS[k]) Object.assign(SEO.LOCS[k], g);
const html = fs.readFileSync(path.join(REPO, 'index.html'), 'utf8');
const [cards] = parseLiteralAt(html, html.indexOf('Rr=[') + 3);
const act = SEO.activeCards(cards);
const live = SEO.liveLocKeys(cards);
const count = (k) => SEO.locItems(cards, SEO.LOCS[k]).length;
const byState = (st) => act.filter((c) => c.state === st).length;
const issues = [];
const I = (p, m) => issues.push(`${p}: ${m}`);
const num = (s) => (s == null ? null : parseInt(String(s).replace(/[^0-9]/g, ''), 10));

const b = await chromium.launch();
const pg = await b.newPage({ viewport: { width: 1280, height: 900 } });
await pg.route(/^https?:\/\/(?!localhost)/, (r) => r.abort());
const open = async (u) => { await pg.goto(BASE + u, { waitUntil: 'networkidle' }); };
const text = () => pg.evaluate(() => document.body.innerText);

// ── home ──
await open('/');
const tiles = await pg.$$eval('.region-grid > *', (els) => els.map((e) => ({ name: e.querySelector('h3')?.textContent.trim(), badge: e.querySelector('.region-count-badge')?.textContent || null, soon: !!e.querySelector('.region-soon-pill'), href: e.getAttribute('href') })));
for (const t of tiles) {
  const k = Object.keys(SEO.LOCS).find((x) => SEO.LOCS[x].st && SEO.LOCS[x].n === t.name);
  if (!k) { I('/', `tile "${t.name}" has no state page`); continue; }
  const n = byState(SEO.LOCS[k].st);
  if (n > 0 && t.soon) I('/', `${t.name} tile says Coming soon but has ${n} listings`);
  if (n > 0 && num(t.badge) !== n) I('/', `${t.name} tile badge "${t.badge}" ≠ ${n}`);
  if (n > 0 && t.href !== '/fishing-charters/' + k) I('/', `${t.name} tile links to ${t.href}`);
  if (n === 0 && !t.soon) I('/', `${t.name} tile live but 0 listings`);
}
const homeText = await text();
for (const m of homeText.matchAll(/View all (\d+) charters/g)) if (+m[1] !== act.length) I('/', `"View all ${m[1]} charters" ≠ ${act.length}`);
// destination/species chips with counts ("Sydney 10")
const chips = await pg.$$eval('a[href^="/fishing-charters/"]', (els) => els.map((e) => [e.getAttribute('href').split('/').pop(), e.innerText.replace(/\s+/g, ' ').trim()]));
for (const [k, t] of chips) {
  if (!live.includes(k)) I('/', `link to non-live page ${k}`);
  const m = t.match(/(\d+)\s*$/);
  if (m && SEO.LOCS[k] && +m[1] !== count(k)) I('/', `chip "${t}" ≠ ${count(k)}`);
}
// server-rendered home (what crawlers see)
const raw = await (await fetch(BASE + '/')).text();
for (const m of raw.matchAll(/<li><h3><a href="\/fishing-charters\/([a-z-]+)">[^<]*<\/a><\/h3><p>(\d+) charters<\/p><\/li>/g)) {
  const k = m[1]; if (+m[2] !== byState(SEO.LOCS[k].st)) I('/ (SSR)', `${k} shows ${m[2]} ≠ ${byState(SEO.LOCS[k].st)}`);
}
for (const m of raw.matchAll(/<li><a href="\/fishing-charters\/([a-z-]+)">[^<(]*\((\d+)\)<\/a><\/li>/g)) if (+m[2] !== count(m[1])) I('/ (SSR)', `${m[1]} chip (${m[2]}) ≠ ${count(m[1])}`);
const mBrowse = raw.match(/Browse all (\d+) charters/); if (mBrowse && +mBrowse[1] !== act.length) I('/ (SSR)', `Browse all ${mBrowse[1]} ≠ ${act.length}`);
const mDesc = raw.match(/<meta name="description" content="[^"]*?(\d+) fishing charters/); if (mDesc && +mDesc[1] !== act.length) I('/', `meta description says ${mDesc[1]}`);

// ── /charters ──
await open('/charters');
const ct = await text();
const mc = ct.match(/(\d+) operators across Australia/); if (!mc || +mc[1] !== act.length) I('/charters', `count "${mc && mc[0]}" ≠ ${act.length}`);
const nCards = await pg.$$eval('.charters-grid .op-card', (e) => e.length); if (nCards !== act.length) I('/charters', `${nCards} cards ≠ ${act.length}`);

// ── every destination, state and species page ──
for (const k of live) {
  const L = SEO.LOCS[k]; const n = count(k); const u = '/fishing-charters/' + k;
  await open(u);
  const t = await text();
  const title = await pg.title();
  const cardsShown = await pg.$$eval('.charters-grid .op-card', (e) => e.length);
  if (cardsShown !== n) I(u, `${cardsShown} cards ≠ ${n}`);
  const m1 = t.match(/(\d+) operators? (in|on|at|around|for)\b/); if (!m1 || +m1[1] !== n) I(u, `count line "${m1 && m1[0]}" ≠ ${n}`);
  const m2 = t.match(/Compare (\d+) fishing charters?/); if (m2 && +m2[1] !== n) I(u, `"${m2[0]}" ≠ ${n}`);
  const m3 = title.match(/Compare (\d+) Operators?/); if (m3 && +m3[1] !== n) I(u, `title "${title}" ≠ ${n}`);
  const rows = await pg.$$eval('.hk-compare tbody tr', (e) => e.length); if (rows && rows !== n) I(u, `compare table ${rows} rows ≠ ${n}`);
  // state pages: destination chips
  if (L.st) {
    const ch = await pg.$$eval('.hk-children a', (els) => els.map((e) => [e.getAttribute('href').split('/').pop(), e.innerText.replace(/\s+/g, ' ').trim()]));
    for (const [ck, tx] of ch) { const m = tx.match(/(\d+)\s*$/); if (m && +m[1] !== count(ck)) I(u, `chip "${tx}" ≠ ${count(ck)}`); }
    const kids = SEO.childLocs(cards, k); if (ch.length && ch.length !== kids.length) I(u, `${ch.length} destination chips ≠ ${kids.length}`);
  }
  const desc = await pg.$eval('meta[name=description]', (e) => e.content);
  const md = desc.match(/(?:Compare|Book) (\d+)?/); if (md && md[1] && +md[1] !== n) I(u, `meta description "${desc.slice(0, 60)}…" ≠ ${n}`);
}

// ── llms.txt ──
const llms = await (await fetch(BASE + '/llms.txt')).text();
const ml = llms.match(/It lists (\d+) real/); if (!ml || +ml[1] !== act.length) I('/llms.txt', `total ${ml && ml[1]} ≠ ${act.length}`);
for (const m of llms.matchAll(/\(https:\/\/hookedtrips\.com\/fishing-charters\/([a-z-]+)\): (\d+) operators?/g)) if (+m[2] !== count(m[1])) I('/llms.txt', `${m[1]} ${m[2]} ≠ ${count(m[1])}`);

await b.close();
console.log(`${act.length} listings · ${live.length} live destination/state/species pages checked`);
console.log(issues.length ? issues.join('\n') : 'ALL COUNTS ACCURATE');
process.exit(issues.length ? 1 : 0);
