// Refresh the auto-generated "Current listings" section of each state knowledge file
// (ops/states/<code>.md) from the live site data.
// Usage: node scripts/listings/state_kb.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseLiteralAt } from './jslit.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SEO = await import(path.join(REPO, 'site-seo.js'));
const ops = JSON.parse(fs.readFileSync(path.join(REPO, 'data/operators.json'), 'utf8'));
const guides = JSON.parse(fs.readFileSync(path.join(REPO, 'data/guides.json'), 'utf8'));
for (const [k, g] of Object.entries(guides)) if (SEO.LOCS[k]) Object.assign(SEO.LOCS[k], g);
const html = fs.readFileSync(path.join(REPO, 'index.html'), 'utf8');
const [cards] = parseLiteralAt(html, html.indexOf('Rr=[') + 3);
const live = new Set(SEO.liveLocKeys(cards));

const STATES = { nsw: 'NSW', qld: 'QLD', nt: 'NT', wa: 'WA', tas: 'TAS', vic: 'VIC' };
const START = '<!-- AUTO:listings:start -->', END = '<!-- AUTO:listings:end -->';
for (const [code, st] of Object.entries(STATES)) {
  const file = path.join(REPO, 'ops/states', `${code}.md`);
  if (!fs.existsSync(file)) continue;
  const mine = ops.filter((o) => o.state === st);
  const byHot = new Map();
  for (const o of mine) { const k = o.hotspot || '(none)'; if (!byHot.has(k)) byHot.set(k, []); byHot.get(k).push(o); }
  const also = ops.filter((o) => (o.also_serves || []).some((k) => SEO.LOCS[k]?.state === st || SEO.LOCS[k]?.parent && SEO.LOCS[SEO.LOCS[k].parent]?.st === st));
  const lines = [START, '', `_Generated ${new Date().toISOString().slice(0, 10)} from data/operators.json: ${mine.length} live listings._`, ''];
  for (const [k, list] of [...byHot.entries()].sort((a, b) => b[1].length - a[1].length)) {
    const L = SEO.LOCS[k];
    lines.push(`### ${L ? L.n : k} (\`${k}\`) — ${list.length} listing${list.length === 1 ? '' : 's'}${L ? (live.has(k) ? ', page live' : ', page NOT live (needs more listings)') : ', no destination page yet'}`);
    for (const o of list) lines.push(`- \`${o.slug}\` — ${o.name} · ${o.primary_location} · ${o.website || o.facebook || ''} · checked ${o.verified_at || '?'}`);
    lines.push('');
  }
  const extra = also.filter((o) => o.state !== st || true).filter((o) => (o.also_serves || []).length);
  if (extra.length) {
    lines.push('### Also listed on other destination pages ("also serves")');
    for (const o of extra) lines.push(`- \`${o.slug}\` → ${o.also_serves.join(', ')}`);
    lines.push('');
  }
  lines.push(END);
  let md = fs.readFileSync(file, 'utf8');
  const a = md.indexOf(START), b = md.indexOf(END);
  md = a >= 0 && b > a ? md.slice(0, a) + lines.join('\n') + md.slice(b + END.length) : md + '\n\n## Current listings\n\n' + lines.join('\n') + '\n';
  fs.writeFileSync(file, md);
  console.log(`${code}: ${mine.length} listings in ${byHot.size} hot spots`);
}
