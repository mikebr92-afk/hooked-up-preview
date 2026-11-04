// Build per-group input folders for a state SEO/GEO round.
// Usage: node scripts/listings/seo_inputs.mjs <outDir>
//   <outDir>/<group>/records.json        every live listing in the group, with its current page title/description/FAQ questions
//   <outDir>/<group>/hotspots.json       live destination pages (+ state page) the group must write/refresh guides for
//   <outDir>/<group>/thin-hotspots.json  destinations with listings but not enough to go live (coverage targets)
//   <outDir>/<group>/existing-keys.json  every page key already used on the site (new region keys must not clash)
//   <outDir>/<group>/prior-facts/        sourced research from earlier rounds (ops/research)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseLiteralAt } from './jslit.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = process.argv[2];
if (!OUT) { console.error('usage: seo_inputs.mjs <outDir>'); process.exit(1); }
const SEO = await import(path.join(REPO, 'site-seo.js'));
const ops = JSON.parse(fs.readFileSync(path.join(REPO, 'data/operators.json'), 'utf8'));
const guides = JSON.parse(fs.readFileSync(path.join(REPO, 'data/guides.json'), 'utf8'));
for (const [k, g] of Object.entries(guides)) if (SEO.LOCS[k]) Object.assign(SEO.LOCS[k], g);
const html = fs.readFileSync(path.join(REPO, 'index.html'), 'utf8');
const [cards] = parseLiteralAt(html, html.indexOf('Rr=[') + 3);
const live = new Set(SEO.liveLocKeys(cards));

const QLD_SOUTH = ['gold-coast', 'brisbane', 'sunshine-coast', 'rainbow-beach', 'hervey-bay', 'bundaberg', 'gladstone', 'yeppoon', 'agnes-water'];
const GROUPS = {
  nsw: { st: 'NSW', statePage: 'new-south-wales', research: ['nsw'] },
  qld_south: { st: 'QLD', statePage: 'queensland', only: QLD_SOUTH, research: ['qld_south', 'capricorn'] },
  qld_north: { st: 'QLD', statePage: null, not: QLD_SOUTH, research: ['qld_north', 'gap_nq'] },
  nt: { st: 'NT', statePage: 'northern-territory', research: ['nt'] },
  wa: { st: 'WA', statePage: 'western-australia', research: ['wa'] },
  tas: { st: 'TAS', statePage: 'tasmania', research: ['tas'] },
  vic: { st: 'VIC', statePage: 'victoria', research: ['vic'] },
};
const allKeys = Object.keys(SEO.LOCS);
const inGroup = (g, hot) => (!g.only || g.only.includes(hot)) && (!g.not || !g.not.includes(hot));

for (const [name, g] of Object.entries(GROUPS)) {
  const dir = path.join(OUT, name);
  fs.mkdirSync(path.join(dir, 'prior-facts'), { recursive: true });
  const mine = ops.filter((o) => o.state === g.st && inGroup(g, o.hotspot));
  const recs = mine.map((o) => {
    const m = SEO.charterMeta(o, cards); const gd = SEO.charterGuide(o, cards);
    return { ...o, current_page: { url: `https://hookedtrips.com/charters/${o.slug}`, title: m.title, description: m.desc, auto_faq_questions: gd.faq.map(([q]) => q) } };
  });
  const destKeys = allKeys.filter((k) => { const L = SEO.LOCS[k]; return !L.st && !L.kind && L.state === g.st && inGroup(g, k); });
  const page = (k) => {
    const L = SEO.LOCS[k];
    return { key: k, name: L.n, state_page: !!L.st, url: `https://hookedtrips.com/fishing-charters/${k}`, intro: L.intro, season: L.season,
      current_sections: (L.sections || []).map((x) => x.h), current_faq: (L.faq || []).map((f) => f[0]), operators: SEO.locItems(cards, L).map((c) => c.slug) };
  };
  const hs = [...(g.statePage ? [g.statePage] : []), ...destKeys.filter((k) => live.has(k))].map(page);
  const thin = destKeys.filter((k) => !live.has(k)).map((k) => ({ ...page(k), listings: SEO.locItems(cards, SEO.LOCS[k]).length, needs: (SEO.LOCS[k].min || SEO.MIN_LOC_ITEMS) - SEO.locItems(cards, SEO.LOCS[k]).length }));
  // hot spots that have listings but no destination page yet (e.g. a single operator)
  for (const k of [...new Set(mine.map((o) => o.hotspot))].filter((k) => k && !SEO.LOCS[k])) {
    const list = mine.filter((o) => o.hotspot === k);
    thin.push({ key: k, name: list[0].primary_location.split(',').slice(1).join(',').trim() || k, no_page_yet: true, listings: list.length, needs: SEO.MIN_LOC_ITEMS - list.length, operators: list.map((o) => o.slug) });
  }
  fs.writeFileSync(path.join(dir, 'records.json'), JSON.stringify(recs, null, 1));
  fs.writeFileSync(path.join(dir, 'hotspots.json'), JSON.stringify(hs, null, 1));
  fs.writeFileSync(path.join(dir, 'thin-hotspots.json'), JSON.stringify(thin, null, 1));
  fs.writeFileSync(path.join(dir, 'existing-keys.json'), JSON.stringify(allKeys));
  for (const f of fs.readdirSync(path.join(REPO, 'ops/research'))) {
    if (g.research.some((r) => f.includes(r))) fs.copyFileSync(path.join(REPO, 'ops/research', f), path.join(dir, 'prior-facts', f));
  }
  console.log(`${name}: ${recs.length} listings, ${hs.length} pages to guide, ${thin.length} thin hot spots (${thin.map((t) => t.key).join(', ')})`);
}
