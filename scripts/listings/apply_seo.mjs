// Apply the state SEO agents' output to the site data.
// Usage: node apply_seo.mjs <repo> <state-seo dir> [--dry]
//   <dir>/<group>/seo-patches.json -> data/operators.json (+ listing cards in index.html when trips/etc change)
//   <dir>/<group>/guides.json      -> data/guides.json
import fs from 'node:fs';
import path from 'node:path';
import { parseLiteralAt } from './jslit.mjs';

const [REPO, DIR] = process.argv.slice(2);
const DRY = process.argv.includes('--dry');
const opsPath = path.join(REPO, 'data', 'operators.json');
const guidesPath = path.join(REPO, 'data', 'guides.json');
const htmlPath = path.join(REPO, 'index.html');
const ops = JSON.parse(fs.readFileSync(opsPath, 'utf8'));
const bySlug = new Map(ops.map((o) => [o.slug, o]));
let html = fs.readFileSync(htmlPath, 'utf8');
const rrAt = html.indexOf('Rr=[') + 3;
const [cards, rrEnd] = parseLiteralAt(html, rrAt);
const cardBySlug = new Map(cards.map((c) => [c.slug, c]));

const log = { patched: [], corrected: {}, flagged: [], missing: [], guides: [] };
const guides = fs.existsSync(guidesPath) ? JSON.parse(fs.readFileSync(guidesPath, 'utf8')) : {};
const SEO_FIELDS = ['lead', 'highlights', 'areas_fished', 'same_as', 'search_keywords'];
// Fields an agent may correct (anything else is ignored and reported).
const CORRECTABLE = new Set(['name', 'description', 'primary_location', 'departure_address', 'latitude', 'longitude', 'primary_species', 'all_species',
  'species_tags', 'trip_type_tags', 'experience_tags', 'trips', 'boat_name', 'boat_type', 'boat_length_m', 'max_capacity', 'comfortable_capacity',
  'survey_certification', 'boat_features', 'captains', 'whats_included', 'what_to_bring', 'cancellation_policy', 'weather_policy',
  'years_in_business', 'accreditations', 'website', 'facebook', 'instagram']);

const unit = (m) => (m === 'per_person' ? 'person' : 'group');
function durationLabel(trips) {
  const h = trips.map((t) => t.duration_hours).filter((x) => x > 0);
  if (!h.length) return '';
  const lo = Math.min(...h), hi = Math.max(...h);
  const fmt = (x) => (x >= 24 ? `${Math.round(x / 24)} days` : `${x}`);
  if (lo >= 24) return lo === hi ? fmt(lo) : `${fmt(lo)}–${fmt(hi)}`;
  if (hi >= 24) return `${lo} hrs – ${fmt(hi)}`;
  return lo === hi ? `${lo} hours` : `${lo}–${hi} hours`;
}
function refreshCard(op) {
  const c = cardBySlug.get(op.slug);
  if (!c) return;
  const trips = op.trips || [];
  const ct = trips.filter((t) => t.price > 0).sort((a, b) => a.price - b.price)[0] || null;
  const cap = op.captains?.[0];
  const maxCap = Math.max(0, ...trips.map((t) => t.max_group || 0), op.max_capacity || 0);
  Object.assign(c, {
    name: op.name, location: op.primary_location, species: (op.primary_species || []).slice(0, 4), species_tags: op.species_tags,
    trip_type_tags: op.trip_type_tags, experience_tags: op.experience_tags,
    price: ct ? ct.price : null, priceUnit: ct ? unit(ct.price_model) : 'group', duration: durationLabel(trips),
    captain: cap ? `Capt. ${cap.name.replace(/^(Capt\.?|Captain)\s+/i, '')}${cap.years_experience ? ` · ${cap.years_experience}+ yrs` : ''}` : '',
    max_capacity: maxCap || null,
    whole: trips.some((t) => t.price_model !== 'per_person') || (op.trip_type_tags || []).some((t) => /private/i.test(t)),
  });
  const priced = trips.filter((t) => t.price > 0).map((t) => t.price);
  op.price_from = priced.length ? Math.min(...priced) : null;
  op.price_to = priced.length ? Math.max(...priced) : null;
  if (ct) op.price_model = ct.price_model;
}

for (const g of fs.readdirSync(DIR).filter((d) => fs.existsSync(path.join(DIR, d, 'seo-patches.json')))) {
  for (const p of JSON.parse(fs.readFileSync(path.join(DIR, g, 'seo-patches.json'), 'utf8'))) {
    const op = bySlug.get(p.slug);
    if (!op) { log.missing.push(p.slug); continue; }
    if (p._flag) { log.flagged.push(`${p.slug}: ${p._flag} — ${p._notes || ''}`); if (p._flag === 'closed?') continue; }
    for (const k of SEO_FIELDS) if (p[k] != null && !(Array.isArray(p[k]) && !p[k].length)) op[k] = p[k];
    if (Array.isArray(p.faqs) && p.faqs.length) op.faqs = p.faqs.filter((f) => f.q && f.a).map((f) => ({ q: f.q, a: f.a }));
    const corr = p.corrections || {};
    const applied = [];
    for (const [k, v] of Object.entries(corr)) {
      if (!CORRECTABLE.has(k)) { applied.push(`IGNORED ${k}`); continue; }
      if (k === 'trips') {
        op.trips = v.map((t, i) => ({
          id: `trip-${String(i + 1).padStart(3, '0')}`, name: t.name, duration_hours: t.duration_hours, departure_time: t.departure_time || '',
          max_group: t.max_group ?? null, what_included: t.what_included || [], price: t.price ?? null, price_model: t.price_model,
          target_species: t.target_species || [], suitability_notes: t.suitability_notes || '',
        }));
      } else if (k === 'captains') {
        op.captains = v.map((c) => ({ name: c.name, bio: c.bio || '', years_experience: c.years_experience ?? null, photo_url: null, accreditations: [] }));
      } else op[k] = v;
      applied.push(k);
    }
    if (applied.length) { log.corrected[p.slug] = applied; refreshCard(op); }
    log.patched.push(p.slug);
  }
  const gp = path.join(DIR, g, 'guides.json');
  if (fs.existsSync(gp)) {
    for (const [k, v] of Object.entries(JSON.parse(fs.readFileSync(gp, 'utf8')))) {
      // sources are published as the guide's source list (official/primary pages only, http(s) URLs)
      const sources = [...new Set((v.sources || []).filter((u) => /^https?:\/\//.test(u)))].slice(0, 8);
      guides[k] = { ...v, sources, reviewed: new Date().toISOString().slice(0, 10) };
      log.guides.push(k);
    }
  }
}

function lit(v) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'boolean') return v ? '!0' : '!1';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'string') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(lit).join(',') + ']';
  return '{' + Object.entries(v).map(([k, x]) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)) + ':' + lit(x)).join(',') + '}';
}
html = html.slice(0, rrAt) + lit(cards) + html.slice(rrEnd);

console.log(JSON.stringify({ patched: log.patched.length, corrected: Object.keys(log.corrected).length, flagged: log.flagged.length, missing: log.missing, guides: log.guides.length }));
for (const [s, f] of Object.entries(log.corrected)) console.log(`corrected ${s}: ${f.join(', ')}`);
for (const f of log.flagged) console.log('FLAG', f);
if (!DRY) {
  fs.writeFileSync(opsPath, JSON.stringify(ops));
  fs.writeFileSync(guidesPath, JSON.stringify(guides));
  fs.writeFileSync(htmlPath, html);
  console.log('written');
}
fs.writeFileSync(path.join(DIR, 'apply-log.json'), JSON.stringify(log, null, 1));
