// Apply a state agent's photo audit decisions to the site.
// Usage: node scripts/listings/apply_photos.mjs <repo> <roundDir> [--dry] [--sheets]
//   <roundDir>/<group>/photos.json : [{ slug, verdict, keep_current:["01.webp",…], hero:{file,source_url,reason}|null,
//                                       extras:[{file,source_url,reason}], remove:[{file,reason}], notes }]
//   Candidate files (images/candidates/…) are read from the agent's pipeline branch: <roundDir>/<group>/branch.txt
//   Final gallery order: new hero (or keep_current[0]), the rest of keep_current, then extras. Max 5.
//   --sheets: only write before/after review sheets to <roundDir>/<group>/review/ (no site changes).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { parseLiteralAt } from './jslit.mjs';

const [REPO, DIR] = process.argv.slice(2);
const DRY = process.argv.includes('--dry');
const SHEETS = process.argv.includes('--sheets');
const PY = '/usr/bin/python3';
const opsPath = path.join(REPO, 'data/operators.json');
const ops = JSON.parse(fs.readFileSync(opsPath, 'utf8'));
const bySlug = new Map(ops.map((o) => [o.slug, o]));
const htmlPath = path.join(REPO, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
const rrAt = html.indexOf('Rr=[') + 3;
const [cards, rrEnd] = parseLiteralAt(html, rrAt);
const cardBySlug = new Map(cards.map((c) => [c.slug, c]));

const approved = {};
const changed = [];
const log = [];
for (const g of fs.readdirSync(DIR).filter((d) => fs.existsSync(path.join(DIR, d, 'photos.json')))) {
  const branchFile = path.join(DIR, g, 'branch.txt');
  const branch = fs.existsSync(branchFile) ? fs.readFileSync(branchFile, 'utf8').trim() : null;
  if (branch) execFileSync('git', ['-C', REPO, 'fetch', '-q', 'origin', branch]);
  const stage = path.join(DIR, g, 'stage');
  fs.mkdirSync(stage, { recursive: true });
  for (const e of JSON.parse(fs.readFileSync(path.join(DIR, g, 'photos.json'), 'utf8'))) {
    const op = bySlug.get(e.slug);
    if (!op) { log.push(`MISSING listing ${e.slug}`); continue; }
    const keep = e.keep_current || [];
    const isNew = !!e.hero || (e.extras || []).length || (e.remove || []).length || (keep.length && keep.join() !== (op.gallery || []).map((u) => path.basename(u)).join());
    if (!isNew) continue;
    const dir = path.join(stage, e.slug);
    fs.mkdirSync(dir, { recursive: true });
    const fetchCand = (f, name) => {
      const out = path.join(dir, name);
      const data = execFileSync('git', ['-C', REPO, 'show', `origin/${branch}:${f}`], { maxBuffer: 64 << 20 });
      fs.writeFileSync(out, data);
      return out;
    };
    const copyCur = (f) => {
      const src = path.join(REPO, 'images/operators', e.slug, f);
      if (!fs.existsSync(src)) throw new Error(`${e.slug}: keep_current ${f} not found`);
      const out = path.join(dir, 'cur-' + f);
      fs.copyFileSync(src, out);
      return out;
    };
    const cur = keep.map(copyCur);
    const paths = [];
    if (e.hero) paths.push(fetchCand(e.hero.file, 'hero' + path.extname(e.hero.file)));
    paths.push(...cur);
    (e.extras || []).forEach((x, i) => paths.push(fetchCand(x.file, `extra${i + 1}` + path.extname(x.file))));
    if (!paths.length) { log.push(`SKIP ${e.slug}: no photos left (listing would lose all images)`); continue; }
    approved[e.slug] = { hero: paths[0], extras: paths.slice(1, 5), ...(e.crop ? { crop: e.crop } : {}), ...(e.centering ? { centering: e.centering } : {}) };
    changed.push([g, e.slug, e.verdict, paths.length]);
    log.push(`${g} ${e.slug}: ${e.verdict} → ${Math.min(paths.length, 5)} photo(s)${e.hero ? ' (new hero)' : ''}`);
  }
}
console.log(log.join('\n') || 'no photo changes');

if (SHEETS) {
  // before/after sheets for review
  for (const [g, slug] of changed) {
    const rev = path.join(DIR, g, 'review');
    fs.mkdirSync(rev, { recursive: true });
    const before = fs.existsSync(path.join(REPO, 'images/operators', slug)) ? fs.readdirSync(path.join(REPO, 'images/operators', slug)).filter((f) => /^\d\d\.webp$/.test(f)).map((f) => path.join(REPO, 'images/operators', slug, f)) : [];
    const after = [approved[slug].hero, ...approved[slug].extras];
    const py = `
import sys
from PIL import Image, ImageDraw, ImageOps
def row(paths, label, W=300):
    tiles=[]
    for p in paths:
        im=ImageOps.exif_transpose(Image.open(p)).convert('RGB'); w,h=im.size; im.thumbnail((W,W)); t=Image.new('RGB',(W,W+18),'white'); t.paste(im,(0,0)); ImageDraw.Draw(t).text((3,W+3),f'{w}x{h}',fill='black'); tiles.append(t)
    r=Image.new('RGB',(max(1,len(tiles))*W+110,W+18),(235,235,235)); ImageDraw.Draw(r).text((4,4),label,fill='black')
    for i,t in enumerate(tiles): r.paste(t,(110+i*W,0))
    return r
a=row(sys.argv[2].split('|') if sys.argv[2] else [],'BEFORE'); b=row(sys.argv[3].split('|'),'AFTER')
out=Image.new('RGB',(max(a.size[0],b.size[0]),a.size[1]+b.size[1]+6),'white'); out.paste(a,(0,0)); out.paste(b,(0,a.size[1]+6)); out.save(sys.argv[1],quality=80)
`;
    execFileSync(PY, ['-I', '-c', py, path.join(rev, `${slug}.jpg`), before.join('|'), after.join('|')]);
  }
  console.log(`review sheets written for ${changed.length} listing(s)`);
  process.exit(0);
}
if (DRY || !changed.length) process.exit(0);

const apath = path.join(DIR, 'approved-photos.json');
fs.writeFileSync(apath, JSON.stringify(approved, null, 1));
execFileSync(PY, ['-I', path.join(REPO, 'scripts/listings/process_photos.py'), REPO, apath], { stdio: 'inherit' });
for (const [, slug] of changed) {
  const op = bySlug.get(slug);
  const base = `/images/operators/${slug}`;
  const files = fs.readdirSync(path.join(REPO, 'images/operators', slug)).filter((f) => /^\d\d\.webp$/.test(f)).sort();
  op.gallery = files.map((f) => `${base}/${f}`);
  op.hero_image = op.gallery[0];
  op.og_image = `${base}/og.jpg`;
  const c = cardBySlug.get(slug);
  if (c) c.image = `${base}/card.webp`;
}
fs.writeFileSync(opsPath, JSON.stringify(ops));
function lit(v) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'boolean') return v ? '!0' : '!1';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'string') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(lit).join(',') + ']';
  return '{' + Object.entries(v).map(([k, x]) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)) + ':' + lit(x)).join(',') + '}';
}
html = html.slice(0, rrAt) + lit(cards) + html.slice(rrEnd);
fs.writeFileSync(htmlPath, html);
console.log(`applied photos for ${changed.length} listing(s)`);
