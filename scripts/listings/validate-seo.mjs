// Validate a state SEO agent's output folder (seo-patches.json + guides.json).
// Usage: node scripts/listings/validate-seo.mjs <folder>   (seo-patches.json, guides.json, optional regions.json)
import fs from 'node:fs';
import path from 'node:path';

const dir = process.argv[2];
const errors = [];
const warns = [];
const E = (s, m) => errors.push(`${s}: ${m}`);
const W = (s, m) => warns.push(`${s}: ${m}`);
const words = (s) => String(s || '').split(/\s+/).filter(Boolean).length;
const url = (u) => /^https?:\/\/[^\s]+$/.test(u || '');
const VAGUE = /\b(best|amazing|unforgettable|world[- ]class|premier|ultimate|#1|number one)\b/i;
const AUTO_Q = /^(where does .* depart|how much does a fishing charter with|what fish can you catch with|how many people can go on|is .* suitable for|what's included on|do i need a fishing licence)/i;

const records = JSON.parse(fs.readFileSync(path.join(dir, 'records.json'), 'utf8'));
const recBySlug = new Map(records.map((r) => [r.slug, r]));
const hotspots = JSON.parse(fs.readFileSync(path.join(dir, 'hotspots.json'), 'utf8'));

// ── listing patches ──
const pp = path.join(dir, 'seo-patches.json');
const patches = fs.existsSync(pp) ? JSON.parse(fs.readFileSync(pp, 'utf8')) : [];
if (!Array.isArray(patches)) E('seo-patches.json', 'must be an array');
const seen = new Set();
for (const p of patches) {
  const s = p.slug || '(no slug)';
  if (!recBySlug.has(p.slug)) { E(s, 'slug not in records.json'); continue; }
  if (seen.has(p.slug)) E(s, 'duplicate patch'); seen.add(p.slug);
  if (p._flag === 'closed?') { if (!p._notes) E(s, '_flag closed? needs _notes'); continue; }
  if (!p.lead) E(s, 'lead required');
  else {
    if (words(p.lead) > 45) E(s, `lead is ${words(p.lead)} words (max 45)`);
    const name = recBySlug.get(p.slug).name;
    if (!p.lead.toLowerCase().includes(name.toLowerCase().slice(0, Math.min(12, name.length)))) W(s, 'lead should name the business');
    if (VAGUE.test(p.lead)) W(s, 'lead has a vague/unprovable word');
  }
  if (!Array.isArray(p.highlights) || p.highlights.length < 3 || p.highlights.length > 5) E(s, 'highlights: 3–5 items');
  for (const h of p.highlights || []) {
    if (words(h) > 15) E(s, `highlight too long: "${h}"`);
    if (VAGUE.test(h)) W(s, `vague highlight: "${h}"`);
  }
  if (!Array.isArray(p.areas_fished) || p.areas_fished.length > 8) E(s, 'areas_fished: array, max 8');
  if (!Array.isArray(p.faqs) || p.faqs.length > 3) E(s, 'faqs: array, max 3');
  for (const f of p.faqs || []) {
    if (!f.q || !f.a) E(s, 'faq needs q and a');
    if (words(f.a) > 60) E(s, `faq answer too long (${words(f.a)} words): ${f.q}`);
    if (!url(f.source)) E(s, `faq needs a source URL: ${f.q}`);
    if (AUTO_Q.test(f.q || '')) E(s, `faq duplicates an automatic question: ${f.q}`);
  }
  const r = recBySlug.get(p.slug);
  for (const u of p.same_as || []) {
    if (!url(u)) E(s, `same_as not a URL: ${u}`);
    if ([r.website, r.facebook, r.instagram].includes(u)) W(s, `same_as repeats stored website/socials: ${u}`);
  }
  if (!Array.isArray(p.search_keywords) || p.search_keywords.length < 5 || p.search_keywords.length > 8) E(s, 'search_keywords: 5–8');
  if (p.corrections && typeof p.corrections === 'object') {
    for (const k of Object.keys(p.corrections)) if (!(k in r)) E(s, `correction field not in record: ${k}`);
    if (Object.keys(p.corrections).length && !p._notes) E(s, 'corrections need _notes explaining them');
    if (p.corrections.trips) for (const t of p.corrections.trips) {
      if (!t.name || !(t.duration_hours > 0) || !['per_person', 'per_group'].includes(t.price_model)) E(s, 'corrected trips need name, duration_hours, price_model');
    }
  }
  if (!Array.isArray(p._sources) || !p._sources.length) E(s, '_sources required');
}
for (const r of records) if (!seen.has(r.slug)) E(r.slug, 'missing patch');

// ── destination guides ──
const gp = path.join(dir, 'guides.json');
const guides = fs.existsSync(gp) ? JSON.parse(fs.readFileSync(gp, 'utf8')) : {};
for (const h of hotspots) {
  const g = guides[h.key];
  if (!g) { E(h.key, 'missing guide'); continue; }
  const st = !!h.state_page;
  const n = (g.sections || []).length;
  if (n < (st ? 2 : 3) || n > 5) E(h.key, `sections: ${st ? '2' : '3'}–5 (has ${n})`);
  for (const x of g.sections || []) {
    if (!x.h) E(h.key, 'section needs h');
    if (!Array.isArray(x.p)) E(h.key, `section "${x.h}" p must be an array`);
    if (x.items && !x.items.every((i) => Array.isArray(i) && i.length === 2)) E(h.key, `section "${x.h}" items must be [name, detail] pairs`);
    for (const t of x.p || []) if (words(t) > 120) W(h.key, `long paragraph in "${x.h}"`);
  }
  if (!Array.isArray(g.faq) || g.faq.length < (st ? 1 : 2) || g.faq.length > 8) E(h.key, 'faq: 2–8 [q, a] pairs');
  if (!g.summary) E(h.key, 'summary required: the 40–60 word answer shown at the top of the page');
  else if (words(g.summary) < 30 || words(g.summary) > 65) E(h.key, `summary is ${words(g.summary)} words (want 40–60)`);
  for (const f of g.faq || []) {
    if (!Array.isArray(f) || f.length !== 2) E(h.key, 'faq items must be [q, a]');
    else if (words(f[1]) > 70) E(h.key, `faq answer too long: ${f[0]}`);
  }
  if (g.intro && (!Array.isArray(g.intro) || g.intro.length > 3)) E(h.key, 'intro must be an array of 1–3 paragraphs');
  if (g.season && words(g.season) > 70) E(h.key, 'season too long');
  if (!Array.isArray(g.sources) || !g.sources.length) E(h.key, 'sources required');
}
for (const k of Object.keys(guides)) if (!hotspots.some((h) => h.key === k)) E(k, 'guide for a key not in hotspots.json');

// ── region hubs (optional) ──
const rp = path.join(dir, 'regions.json');
const regions = fs.existsSync(rp) ? JSON.parse(fs.readFileSync(rp, 'utf8')) : [];
const ek = path.join(dir, 'existing-keys.json');
const existing = new Set(fs.existsSync(ek) ? JSON.parse(fs.readFileSync(ek, 'utf8')) : []);
const thinP = path.join(dir, 'thin-hotspots.json');
const groupKeys = new Set([...hotspots.filter((h) => !h.state_page).map((h) => h.key), ...(fs.existsSync(thinP) ? JSON.parse(fs.readFileSync(thinP, 'utf8')).map((h) => h.key) : [])]);
const seenR = new Set();
for (const r of regions) {
  const s = 'region ' + (r.key || '(no key)');
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(r.key || '')) E(s, 'key must be kebab-case');
  if (existing.has(r.key)) E(s, 'key clashes with an existing page key');
  if (seenR.has(r.key)) E(s, 'duplicate region key'); seenR.add(r.key);
  for (const k of ['n', 'short', 'in', 'season']) if (!r[k]) E(s, `${k} required`);
  if ((r.short || '').length > 30) E(s, 'short is used in page titles: keep it ≤30 characters (e.g. "Top End")');
  if ((r.n || '').length > 50) E(s, 'n ≤50 characters');
  if (!/^(in|on|at|around|across)\b/.test(r.in || '')) E(s, '"in" must read like "in Far North Queensland"');
  if (!Array.isArray(r.hotspots) || r.hotspots.length < 2) E(s, 'hotspots: at least 2 destination keys');
  for (const h of r.hotspots || []) if (!groupKeys.has(h)) E(s, `hotspot "${h}" is not one of your destinations`);
  if (!Array.isArray(r.c) || !r.c.length) E(s, 'c: search terms required');
  if (!Array.isArray(r.intro) || r.intro.length < 2 || r.intro.length > 3) E(s, 'intro: 2–3 paragraphs');
  if (words(r.season) > 70) E(s, 'season ≤70 words');
  const n = (r.sections || []).length; if (n < 3 || n > 5) E(s, 'sections: 3–5');
  for (const x of r.sections || []) { if (!x.h || !Array.isArray(x.p)) E(s, 'section needs h and p[]'); if (x.items && !x.items.every((i) => Array.isArray(i) && i.length === 2)) E(s, 'items must be [name, detail]'); }
  if (!Array.isArray(r.faq) || r.faq.length < 2 || r.faq.length > 5) E(s, 'faq: 2–5 [q, a]');
  for (const f of r.faq || []) if (!Array.isArray(f) || f.length !== 2 || words(f[1]) > 70) E(s, 'faq items must be [q, a≤70 words]');
  if (!Array.isArray(r.sources) || !r.sources.length) E(s, 'sources required');
}
if (regions.length) console.log(`${regions.length} region hub(s)`);

console.log(`${patches.length}/${records.length} patches, ${Object.keys(guides).length}/${hotspots.length} guides: ${errors.length} error(s), ${warns.length} warning(s)`);
if (errors.length) console.log('ERRORS:\n' + errors.map((x) => '  ' + x).join('\n'));
if (warns.length) console.log('WARNINGS:\n' + warns.map((x) => '  ' + x).join('\n'));
process.exit(errors.length ? 1 : 0);
