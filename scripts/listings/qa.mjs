// Content QA over the live data: operators, cards, guides, generated meta/FAQs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseLiteralAt } from './jslit.mjs';
// Usage: node scripts/listings/qa.mjs   (content QA over the live site data)
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SEO = await import(REPO + '/site-seo.js?' + Date.now());
const ops = JSON.parse(fs.readFileSync(REPO + '/data/operators.json', 'utf8'));
const guides = JSON.parse(fs.readFileSync(REPO + '/data/guides.json', 'utf8'));
for (const [k, g] of Object.entries(guides)) if (SEO.LOCS[k]) Object.assign(SEO.LOCS[k], g); else console.log('GUIDE FOR UNKNOWN KEY', k);
const html = fs.readFileSync(REPO + '/index.html', 'utf8');
const [cards] = parseLiteralAt(html, html.indexOf('Rr=[') + 3);
const issues = [];
const I = (s, m) => issues.push(`${s}: ${m}`);
const BAD = /\b(undefined|null|NaN|TODO|lorem|\[object)\b|\$null|\$undefined|\s{2,}|\s[,.](?!\d)|,,|\.\.(?!\.)|\(\s*\)|Capt\. Capt|Captain Captain/;
const cardBy = new Map(cards.map((c) => [c.slug, c]));
const txt = (o) => JSON.stringify(o);
const slugs = new Set();
for (const o of ops) {
  if (slugs.has(o.slug)) I(o.slug, 'duplicate slug'); slugs.add(o.slug);
  const c = cardBy.get(o.slug);
  if (!c) { I(o.slug, 'no card'); continue; }
  if (o.status !== 'active') I(o.slug, 'status ' + o.status);
  // text fields
  for (const [k, v] of Object.entries({ description: o.description, lead: o.lead, ...Object.fromEntries((o.highlights || []).map((h, i) => ['highlight' + i, h])), ...Object.fromEntries((o.faqs || []).map((f, i) => ['faq' + i, f.q + ' ' + f.a])) })) {
    if (v && BAD.test(v)) I(o.slug, `${k} suspicious: "${String(v).match(BAD)[0]}" in …${String(v).slice(Math.max(0, String(v).search(BAD) - 30), String(v).search(BAD) + 30)}…`);
  }
  if (!o.description || o.description.split(/\s+/).length < 60) I(o.slug, 'short description');
  if (!o.lead) I(o.slug, 'no lead');
  if (!(o.highlights || []).length) I(o.slug, 'no highlights');
  // trips & prices
  for (const t of o.trips || []) {
    if (!t.name) I(o.slug, 'trip without name');
    if (!(t.duration_hours > 0)) I(o.slug, `trip ${t.name} has no duration`);
    if (t.price != null && !(t.price > 0)) I(o.slug, `trip ${t.name} bad price ${t.price}`);
    if (t.price > 20000) I(o.slug, `trip ${t.name} price ${t.price}?`);
    if (t.price && t.price_model === 'per_person' && t.price > 5000 && t.duration_hours < 48) I(o.slug, `per-person price ${t.price} for ${t.duration_hours}h?`);
  }
  const ct = SEO.cheapestTrip(o);
  if ((ct ? ct.price : null) !== (c.price ?? null)) I(o.slug, `card price ${c.price} vs trips ${ct && ct.price}`);
  if (c.location !== o.primary_location) I(o.slug, `card location "${c.location}" vs "${o.primary_location}"`);
  if (JSON.stringify(c.also_serves || []) !== JSON.stringify(o.also_serves || [])) I(o.slug, 'also_serves mismatch');
  // images
  for (const u of [o.hero_image, o.og_image, ...(o.gallery || []), c.image].filter(Boolean)) {
    if (u.startsWith('/') && !fs.existsSync(REPO + u)) I(o.slug, 'missing image ' + u);
  }
  if (o.hero_image && !c.image) I(o.slug, 'hero but no card image');
  // geography
  if (!(o.latitude < -9 && o.latitude > -45 && o.longitude > 112 && o.longitude < 160)) I(o.slug, 'bad coordinates');
  const lf = SEO.locFor(c);
  if (!lf) I(o.slug, 'no destination page / state');
  if (o.hotspot && !SEO.LOCS[o.hotspot]) I(o.slug, `hotspot "${o.hotspot}" has no page (falls back to state)`);
  // URLs
  for (const k of ['website', 'facebook', 'instagram']) if (o[k] && !/^https?:\/\/[^\s]+$/.test(o[k])) I(o.slug, `bad ${k} ${o[k]}`);
  // generated meta
  const m = SEO.charterMeta(o, cards);
  if (m.title.length > 70) I(o.slug, `long title (${m.title.length}): ${m.title}`);
  if (m.desc.length > 160 || m.desc.length < 90) I(o.slug, `desc length ${m.desc.length}`);
  const g = SEO.charterGuide(o, cards);
  for (const [q, a] of g.faq) if (BAD.test(q + ' ' + a)) I(o.slug, `faq suspicious: ${(q + ' ' + a).match(BAD)[0]} :: ${q}`);
  for (const [q] of g.faq) if (/\b(a|A) [AEIOU]/.test(q)) I(o.slug, `article: ${q}`);
}
for (const c of cards) if (!slugs.has(c.slug)) I(c.slug, 'card without record');
// duplicate titles / descriptions
const seenT = new Map(), seenD = new Map();
for (const o of ops) { const m = SEO.charterMeta(o, cards); if (seenT.has(m.title)) I(o.slug, 'duplicate title with ' + seenT.get(m.title)); seenT.set(m.title, o.slug); if (seenD.has(m.desc)) I(o.slug, 'duplicate desc'); seenD.set(m.desc, o.slug); }
// destination pages
const live = SEO.liveLocKeys(cards);
for (const k of live) {
  const L = SEO.LOCS[k]; const items = SEO.locItems(cards, L);
  const m = SEO.locMeta(k, L, items); const g = SEO.locGuide(L, items);
  if (seenT.has(m.title)) I(k, 'duplicate title'); seenT.set(m.title, k);
  if (m.desc.length > 165) I(k, `loc desc length ${m.desc.length}`);
  const all = [...(g.paras || []), ...g.sections.flatMap((x) => [x.h, ...(x.p || []), ...(x.items || []).flat()]), ...g.faq.flat()].join(' | ');
  if (BAD.test(all)) I(k, `guide suspicious: "${all.match(BAD)[0]}" …${all.slice(Math.max(0, all.search(BAD) - 40), all.search(BAD) + 40)}…`);
  if (!L.sp && !L.tt && !L.st && !g.sections.length) I(k, 'no guide sections');
  if (!L.season) I(k, 'no season text');
}
console.log(`${ops.length} listings, ${live.length} live destination pages, ${Object.keys(guides).length} guides`);
console.log(issues.length ? issues.join('\n') : 'NO ISSUES');
