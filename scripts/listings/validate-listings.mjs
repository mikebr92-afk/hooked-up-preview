// Validate a state agent's listings.json against SCHEMA.md.
// Usage: node scripts/listings/validate-listings.mjs <listings.json> [--quiet] [--seo]
//   --seo  also require the SEO/GEO fields (lead, highlights, search_keywords)
import fs from 'node:fs';

const SPECIES = new Set(('Barramundi, Snapper, Golden Snapper, Kingfish, Coral Trout, Red Emperor, Nannygai, Sweetlip, Giant Trevally, Golden Trevally, Trevally, ' +
  'Spanish Mackerel, Mackerel, Mahi Mahi, Wahoo, Cobia, Yellowfin Tuna, Longtail Tuna, Dogtooth Tuna, Tuna, Black Marlin, ' +
  'Blue Marlin, Striped Marlin, Marlin, Sailfish, Flathead, Jewfish, Mangrove Jack, Fingermark, Threadfin Salmon, Saratoga, ' +
  'Queenfish, Pearl Perch, Bream, Whiting, Tailor, Amberjack, Samsonfish, Australian Salmon, Morwong, John Dory, Teraglin, ' +
  'Mud Crab, Squid, Black Jewfish, Sooty Grunter, Tarpon, Permit, Bonefish, Shark, Gummy Shark, Southern Bluefin Tuna, ' +
  'King George Whiting, Dhufish, Baldchin Groper, Striped Trumpeter, Murray Cod, Golden Perch, Brown Trout, Rainbow Trout, Trout').split(', '));
const TRIP = new Set(('Private Charter, Shared Charter, Reef Fishing, Offshore, Game Fishing, Sportfishing, Estuary Fishing, River Fishing, ' +
  'Bay Fishing, Harbour Fishing, Lake Fishing, Freshwater Fishing, Lure Fishing, Fly Fishing, Deep Sea, Light Tackle, Barramundi Fishing, Great Barrier Reef, Half Day, ' +
  'Full Day, Multi-Day, Overnight, Family Friendly').split(', '));
const EXP = new Set('Beginner Friendly, Families, Kids Welcome, Experienced Anglers, Corporate Groups, Wheelchair Accessible'.split(', '));

const file = process.argv[2];
const quiet = process.argv.includes('--quiet');
const seo = process.argv.includes('--seo');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const errors = [];
const warns = [];
const E = (s, m) => errors.push(`${s}: ${m}`);
const W = (s, m) => warns.push(`${s}: ${m}`);
const str = (v) => typeof v === 'string';
const arr = (v) => Array.isArray(v);
const num = (v) => typeof v === 'number' && Number.isFinite(v);

if (!arr(data)) { console.error('listings.json must be a JSON array'); process.exit(1); }
const slugs = new Set();
for (const r of data) {
  const s = r.slug || '(no slug)';
  if (!str(r.slug) || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(r.slug)) E(s, 'slug must be kebab-case');
  if (slugs.has(r.slug)) E(s, 'duplicate slug'); slugs.add(r.slug);
  for (const k of ['name', 'description', 'primary_location', 'state', 'departure_address', 'website', 'facebook', 'instagram',
    'boat_name', 'boat_type', 'survey_certification', 'cancellation_policy', 'weather_policy']) if (r[k] != null && !str(r[k])) E(s, `${k} must be a string`);
  if (!r.name) E(s, 'name required');
  if (r.status !== 'active') E(s, 'status must be "active"');
  if (!['NSW', 'QLD', 'NT', 'WA', 'TAS', 'VIC', 'SA'].includes(r.state)) E(s, 'state must be NSW/QLD/NT/WA/TAS/VIC/SA');
  const words = (r.description || '').split(/\s+/).filter(Boolean).length;
  if (words < 70 || words > 200) E(s, `description is ${words} words (want 90–170)`);
  if (!/,\s/.test(r.primary_location || '')) E(s, 'primary_location must be "<town>, <hotspot>"');
  if (!num(r.latitude) || r.latitude > -9 || r.latitude < -45) E(s, 'latitude missing/invalid');
  if (!num(r.longitude) || r.longitude < 112 || r.longitude > 160) E(s, 'longitude missing/invalid');
  if (!r.website && !r.facebook) E(s, 'need at least a website or facebook URL (evidence it is a real business)');
  for (const k of ['website', 'facebook', 'instagram']) if (r[k] && !/^https?:\/\//.test(r[k])) E(s, `${k} must be a full URL`);
  for (const k of ['location_tags', 'region_tags', 'primary_species', 'all_species', 'species_tags', 'trip_type_tags', 'experience_tags',
    'trips', 'boat_features', 'captains', 'whats_included', 'what_to_bring', 'accreditations', 'search_keywords']) if (!arr(r[k])) E(s, `${k} must be an array`);
  if (arr(r.primary_species) && (r.primary_species.length < 1 || r.primary_species.length > 6)) E(s, 'primary_species: 1–6 items');
  for (const sp of [...(r.primary_species || []), ...(r.species_tags || []), ...(r.all_species || []).map((x) => x.name)])
    if (!SPECIES.has(sp)) W(s, `non-canonical species "${sp}"`);
  for (const x of r.all_species || []) if (!str(x.name) || !str(x.season ?? '') || !str(x.notes ?? '')) E(s, 'all_species items need name/season/notes strings');
  for (const t of r.trip_type_tags || []) if (!TRIP.has(t)) E(s, `unknown trip type "${t}"`);
  for (const t of r.experience_tags || []) if (!EXP.has(t)) E(s, `unknown experience tag "${t}"`);
  if (arr(r.trips) && !r.trips.length) E(s, 'at least one trip required');
  for (const [i, t] of (r.trips || []).entries()) {
    const ts = `${s} trip ${i + 1}`;
    if (!t.name) E(ts, 'name required');
    if (!num(t.duration_hours) || t.duration_hours <= 0 || t.duration_hours > 240) E(ts, 'duration_hours must be a positive number');
    if (t.max_group != null && !num(t.max_group)) E(ts, 'max_group number or null');
    if (t.price != null && (!num(t.price) || t.price <= 0)) E(ts, 'price must be a positive number or null');
    if (!['per_person', 'per_group'].includes(t.price_model)) E(ts, 'price_model per_person|per_group');
    if (!arr(t.what_included) || !arr(t.target_species)) E(ts, 'what_included / target_species arrays required');
    if (!str(t.departure_time ?? '') || !str(t.suitability_notes ?? '')) E(ts, 'departure_time / suitability_notes strings');
  }
  for (const k of ['boat_length_m', 'max_capacity', 'comfortable_capacity', 'years_in_business']) if (r[k] != null && !num(r[k])) E(s, `${k} number or null`);
  for (const c of r.captains || []) if (!c.name) E(s, 'captain needs a name');
  if (!r._hotspot) E(s, '_hotspot required');
  // SEO / GEO fields
  const wc = (x) => String(x || '').split(/\s+/).filter(Boolean).length;
  if (seo && !r.lead) E(s, 'lead required (--seo)');
  if (r.lead && wc(r.lead) > 45) E(s, `lead is ${wc(r.lead)} words (max 45)`);
  if (seo && !(r.highlights || []).length) E(s, 'highlights required (--seo)');
  if (r.highlights && (!arr(r.highlights) || r.highlights.length > 5 || r.highlights.some((h) => wc(h) > 15))) E(s, 'highlights: up to 5 items of ≤15 words');
  if (r.areas_fished && (!arr(r.areas_fished) || r.areas_fished.length > 8)) E(s, 'areas_fished: array, max 8');
  for (const f of r.faqs || []) { if (!f.q || !f.a) E(s, 'faq needs q and a'); if (wc(f.a) > 60) E(s, 'faq answer >60 words'); if (!/^https?:\/\//.test(f.source || '')) E(s, 'faq needs a source URL'); }
  if (r.faqs && r.faqs.length > 3) E(s, 'faqs: max 3');
  for (const u of r.same_as || []) if (!/^https?:\/\//.test(u)) E(s, `same_as not a URL: ${u}`);
  if (seo && ((r.search_keywords || []).length < 5)) E(s, 'search_keywords: 5–8 (--seo)');
  if (!['verified', 'third_party_only'].includes(r._verification)) E(s, '_verification verified|third_party_only');
  if (!arr(r._sources) || r._sources.length < 1) E(s, '_sources: list the pages you used');
  const ph = r._photos || {};
  if (ph.hero && !(ph.hero.file || '').startsWith('images/candidates/')) E(s, '_photos.hero.file must be a candidates path');
  if (!ph.hero) W(s, 'no hero photo');
  if (!r.trips?.some((t) => t.price)) W(s, 'no published price on any trip (will show "Price on enquiry")');
}
const out = [`${data.length} listing(s): ${errors.length} error(s), ${warns.length} warning(s)`];
if (errors.length) out.push('ERRORS:', ...errors.map((x) => '  ' + x));
if (warns.length && !quiet) out.push('WARNINGS:', ...warns.map((x) => '  ' + x));
console.log(out.join('\n'));
process.exit(errors.length ? 1 : 0);
