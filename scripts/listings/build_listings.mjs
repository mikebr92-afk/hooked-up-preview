// Rebuild the operator data (p1 records + Rr listing cards) in index.html from
// the state agents' listings.json files.
//
// Usage: node build_listings.mjs <repo> <agentsDir> [--dry]
//   <agentsDir>/<group>/listings.json   records per SCHEMA.md (corrected existing + new)
//   <agentsDir>/<group>/removals.json   slugs to drop
//   <agentsDir>/<group>/approved-photos.json  { slug: { hero: path, extras: [path] } } (local files, reviewed)
// Existing operators not mentioned in any listings.json/removals.json are kept unchanged (and reported).
import fs from 'node:fs';
import path from 'node:path';
import { parseLiteralAt } from './jslit.mjs';

const [REPO, AG] = process.argv.slice(2);
const DRY = process.argv.includes('--dry');
const htmlPath = path.join(REPO, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

function arrayBounds(name) {
  const at = html.indexOf(name + '=[');
  if (at < 0) throw new Error(name + ' not found');
  const [, end] = parseLiteralAt(html, at + name.length + 1);
  return [at + name.length + 1, end];
}
// Full operator records live in data/operators.json (fetched on demand / inlined
// per charter page by the worker); the bundle keeps a placeholder p1=[/*HK_OPS*/].
const MARK = 'p1=[/*HK_OPS*/]';
const opsPath = path.join(REPO, 'data', 'operators.json');
let p1s, p1e, oldOps;
if (html.includes(MARK)) {
  p1s = html.indexOf(MARK) + 3; p1e = p1s + MARK.length - 3;
  oldOps = JSON.parse(fs.readFileSync(opsPath, 'utf8'));
} else {
  [p1s, p1e] = arrayBounds('p1');
  [oldOps] = parseLiteralAt(html, p1s);
}
const [rrs, rre] = arrayBounds('Rr');
const [oldCards] = parseLiteralAt(html, rrs);
const oldBySlug = new Map(oldOps.map((o) => [o.slug, o]));
const oldCardBySlug = new Map(oldCards.map((c) => [c.slug, c]));

// ── gather agent output ──────────────────────────────────────────────────────
const groups = fs.readdirSync(AG).filter((g) => fs.existsSync(path.join(AG, g, 'listings.json')));
const incoming = [];
const removals = new Map();
for (const g of groups) {
  for (const r of JSON.parse(fs.readFileSync(path.join(AG, g, 'listings.json'), 'utf8'))) incoming.push({ ...r, _group: g });
  const rp = path.join(AG, g, 'removals.json');
  if (fs.existsSync(rp)) for (const x of JSON.parse(fs.readFileSync(rp, 'utf8'))) removals.set(x.slug, { ...x, _group: g });
}
const photos = {};
for (const g of groups) {
  const pp = path.join(AG, g, 'approved-photos.json');
  if (fs.existsSync(pp)) Object.assign(photos, JSON.parse(fs.readFileSync(pp, 'utf8')));
}

// ── helpers ──────────────────────────────────────────────────────────────────
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
// "Yamba, Yamba & Iluka" -> "Yamba": drop region parts that already name the town.
function tidyLocation(loc) {
  const parts = (loc || '').split(',').map((x) => x.trim()).filter(Boolean);
  if (parts.length < 2) return loc;
  const re = new RegExp('\\b' + parts[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
  return [parts[0], ...parts.slice(1).filter((x) => !re.test(x))].join(', ');
}
function cheapest(trips) {
  return trips.filter((t) => t.price > 0).sort((a, b) => a.price - b.price)[0] || null;
}

// ── build records ────────────────────────────────────────────────────────────
let nextId = Math.max(...oldOps.map((o) => parseInt(o.id.replace('op-', ''), 10))) + 1;
const today = new Date().toISOString().slice(0, 10);
const seen = new Set();
const ops = [];
const cards = [];
const log = { updated: [], added: [], removed: [], untouched: [], photosKept: [], photosNew: [], noPhoto: [] };

for (const r of incoming) {
  if (seen.has(r.slug)) throw new Error('duplicate slug across groups: ' + r.slug);
  if (removals.has(r.slug)) throw new Error(`${r.slug} is both listed and removed`);
  seen.add(r.slug);
  const old = oldBySlug.get(r.slug);
  // Tropical "Snapper" is golden snapper (fingermark) — keep it off the (pink) Snapper page.
  const golden = (r.all_species || []).some((a) => a.name === 'Snapper' && /golden|fingermark/i.test(a.notes || ''));
  if (golden) {
    const fix = (arr) => (arr || []).map((x) => (x === 'Snapper' ? 'Golden Snapper' : x));
    r.primary_species = fix(r.primary_species); r.species_tags = fix(r.species_tags);
    r.all_species = (r.all_species || []).map((a) => (a.name === 'Snapper' ? { ...a, name: 'Golden Snapper' } : a));
    (r.trips || []).forEach((t) => { t.target_species = fix(t.target_species); });
  }
  const trips = (r.trips || []).map((t, i) => ({
    id: `trip-${String(i + 1).padStart(3, '0')}`, name: t.name, duration_hours: t.duration_hours, departure_time: t.departure_time || '',
    max_group: t.max_group ?? null, what_included: t.what_included || [], price: t.price ?? null, price_model: t.price_model,
    target_species: t.target_species || [], suitability_notes: t.suitability_notes || '',
  }));
  const priced = trips.filter((t) => t.price > 0).map((t) => t.price);
  const ct = cheapest(trips);
  // photos: keep existing site photos, or new approved ones, else none
  let hero = null, gallery = [], og = null, cardImg = null;
  const keep = r._photos && r._photos.keep && old && old.hero_image;
  if (keep) {
    hero = old.hero_image; gallery = old.gallery || []; og = old.og_image || null;
    cardImg = (oldCardBySlug.get(r.slug) || {}).image || null;
    log.photosKept.push(r.slug);
  } else if (photos[r.slug]) {
    const base = `/images/operators/${r.slug}`;
    const n = 1 + (photos[r.slug].extras || []).length;
    gallery = Array.from({ length: n }, (_, i) => `${base}/${String(i + 1).padStart(2, '0')}.webp`);
    hero = gallery[0]; og = `${base}/og.jpg`; cardImg = `${base}/card.webp`;
    log.photosNew.push(r.slug);
  } else log.noPhoto.push(r.slug);

  const rec = {
    id: old ? old.id : `op-${String(nextId++).padStart(3, '0')}`,
    slug: r.slug, name: r.name, status: 'active', hotspot: r._hotspot || '',
    partner_status: old?.partner_status === 'engaged' ? 'engaged' : 'directory', notes: '', featured: false,
    date_added: old?.date_added || today, verified_at: today, description: r.description,
    primary_location: tidyLocation(r.primary_location), location_tags: r.location_tags || [], state: r.state, region_tags: r.region_tags || [],
    departure_address: r.departure_address || '', latitude: r.latitude, longitude: r.longitude,
    primary_species: r.primary_species, all_species: (r.all_species || []).map((s) => ({ name: s.name, season: s.season || '', notes: s.notes || '' })),
    species_tags: r.species_tags || r.primary_species, trip_type_tags: r.trip_type_tags || [], experience_tags: r.experience_tags || [],
    trips,
    boat_name: r.boat_name || '', boat_type: r.boat_type || '', boat_length_m: r.boat_length_m ?? null,
    max_capacity: r.max_capacity ?? null, comfortable_capacity: r.comfortable_capacity ?? null,
    survey_certification: r.survey_certification || '', boat_features: r.boat_features || [],
    price_from: priced.length ? Math.min(...priced) : null, price_to: priced.length ? Math.max(...priced) : null,
    price_currency: 'AUD', price_model: ct ? ct.price_model : (trips[0]?.price_model || 'per_group'),
    captains: (r.captains || []).map((c) => ({ name: c.name, bio: c.bio || '', years_experience: c.years_experience ?? null, photo_url: null, accreditations: [] })),
    whats_included: r.whats_included || [], what_to_bring: r.what_to_bring || [],
    cancellation_policy: r.cancellation_policy || '', weather_policy: r.weather_policy || '',
    rating: null, review_count: 0, reviews: [],
    hero_image: hero, gallery, ...(og ? { og_image: og } : {}),
    captain_photos: [], boat_photos: [], catch_photos: [],
    phone: '', email: '', website: r.website || '', abn: '', instagram: r.instagram || '', facebook: r.facebook || '',
    years_in_business: r.years_in_business ?? null, accreditations: r.accreditations || [], search_keywords: r.search_keywords || [],
    // optional researched SEO fields (phase-2 patches); kept when re-building an existing record
    ...Object.fromEntries(['lead', 'highlights', 'areas_fished', 'faqs', 'same_as', 'also_serves']
      .map((k) => [k, r[k] ?? old?.[k]]).filter(([, v]) => v != null && !(Array.isArray(v) && !v.length))
      .map(([k, v]) => [k, k === 'faqs' ? v.filter((f) => f.q && f.a).map((f) => ({ q: f.q, a: f.a })) : v])),
  };
  ops.push(rec);
  const cap = rec.captains[0];
  const maxCap = Math.max(0, ...trips.map((t) => t.max_group || 0), rec.max_capacity || 0);
  const whole = trips.some((t) => t.price_model !== 'per_person') || rec.trip_type_tags.some((t) => /private/i.test(t));
  cards.push({
    name: rec.name, slug: rec.slug, ...(cardImg ? { image: cardImg } : {}), location: rec.primary_location, hotspot: rec.hotspot, state: rec.state, status: 'active',
    species: rec.primary_species.slice(0, 4), species_tags: rec.species_tags, trip_type_tags: rec.trip_type_tags, experience_tags: rec.experience_tags,
    rating: null, reviews: null, price: ct ? ct.price : null, priceUnit: ct ? unit(ct.price_model) : 'group',
    duration: durationLabel(trips), captain: cap ? `Capt. ${cap.name.replace(/^(Capt\.?|Captain)\s+/i, '')}${cap.years_experience ? ` · ${cap.years_experience}+ yrs` : ''}` : '',
    placeholder: 'op-art--default', max_capacity: maxCap || null, whole, ...(rec.also_serves ? { also_serves: rec.also_serves } : {}),
  });
  (old ? log.updated : log.added).push(r.slug);
}
for (const o of oldOps) {
  if (seen.has(o.slug)) continue;
  if (removals.has(o.slug)) { log.removed.push(o.slug); continue; }
  ops.push(o); cards.push(oldCardBySlug.get(o.slug)); log.untouched.push(o.slug);
}
// stable order: by state, then hot spot (primary_location), then name
const order = { NSW: 0, QLD: 1, NT: 2, WA: 3, VIC: 4, TAS: 5, SA: 6 };
const key = (x) => `${order[x.state] ?? 9}|${(x.primary_location || x.location || '').split(',').pop().trim()}|${x.name}`;
ops.sort((a, b) => key(a).localeCompare(key(b)));
cards.sort((a, b) => key(a).localeCompare(key(b)));

// ── serialise as a JS literal with unquoted keys (same shape as the bundle) ─
function lit(v) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'boolean') return v ? '!0' : '!1';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'string') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(lit).join(',') + ']';
  return '{' + Object.entries(v).map(([k, x]) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)) + ':' + lit(x)).join(',') + '}';
}
const newP1 = '[/*HK_OPS*/]', newRr = lit(cards);
// replace later array first so indices stay valid
const parts = [[p1s, p1e, newP1], [rrs, rre, newRr]].sort((a, b) => b[0] - a[0]);
for (const [s, e, txt] of parts) html = html.slice(0, s) + txt + html.slice(e);

console.log(JSON.stringify({ total: ops.length, ...Object.fromEntries(Object.entries(log).map(([k, v]) => [k, v.length])) }));
for (const [k, v] of Object.entries(log)) if (v.length && k !== 'updated' && k !== 'photosKept') console.log(`${k}: ${v.join(', ')}`);
if (!DRY) {
  fs.mkdirSync(path.dirname(opsPath), { recursive: true });
  fs.writeFileSync(opsPath, JSON.stringify(ops));
  fs.writeFileSync(htmlPath, html);
  console.log('index.html + data/operators.json written');
}
fs.writeFileSync(path.join(AG, 'build-log.json'), JSON.stringify(log, null, 1));
