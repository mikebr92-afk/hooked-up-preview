#!/usr/bin/env node
// Operator image collector — runs in GitHub Actions (needs full internet).
//
// Stage 1 (optional, --discover): for operators with no website in the data,
//   search the web (DuckDuckGo HTML endpoint, no API key) for their official
//   site / Facebook page using "<name> <location> fishing charter".
// Stage 2: scrape candidate images from the operator's website (and og:image),
//   download everything that looks like real content (not logos/icons), and
//   drop it into images/operators/<slug>/ for human curation.
//
// Nothing here is wired into index.html — this only gathers candidates.
// A manifest.json + IMAGE-REVIEW.md are written so the results can be reviewed
// in a PR before anything goes live.
//
// Usage:
//   node scripts/fetch-operator-images.mjs [--slugs=a,b,c] [--discover]
//                                          [--max=15] [--limit=N] [--min-kb=15]

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const OUT_ROOT = path.join(ROOT, 'images', 'operators');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
           '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// ── args ─────────────────────────────────────────────────────────────────────
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [m[1], m[2] ?? true] : [a, true];
  })
);
const ONLY    = args.slugs ? String(args.slugs).split(',').map((s) => s.trim()).filter(Boolean) : null;
const DISCOVER = !!args.discover;
const MAX_IMG = parseInt(args.max ?? '15', 10);     // max images saved per operator
const LIMIT   = args.limit ? parseInt(args.limit, 10) : Infinity; // cap operators processed
const MIN_KB  = parseInt(args['min-kb'] ?? '15', 10);

// ── parse operators out of the bundle ────────────────────────────────────────
function parseOperators(html) {
  const starts = [...html.matchAll(/id:"op-\d+",slug:"([^"]+)"/g)].map((m) => [m.index, m[1]]);
  const ops = [];
  for (let i = 0; i < starts.length; i++) {
    const [s, slug] = starts[i];
    const e = i + 1 < starts.length ? starts[i + 1][0] : s + 9000;
    const rec = html.slice(s, e);
    const f = (re) => (rec.match(re) || [])[1] || '';
    ops.push({
      slug,
      name: f(/name:"((?:\\.|[^"\\])*)"/),
      status: f(/status:"([^"]+)"/),
      location: f(/primary_location:"((?:\\.|[^"\\])*)"/),
      website: f(/website:"([^"]*)"/),
      facebook: f(/facebook:"([^"]*)"/),
      instagram: f(/instagram:"([^"]*)"/),
    });
  }
  return ops;
}

// ── fetch helpers ─────────────────────────────────────────────────────────────
async function fetchText(url, referer) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-AU,en;q=0.9',
      ...(referer ? { Referer: referer } : {}),
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

// ── Stage 1: discover a website via DuckDuckGo HTML ──────────────────────────
async function discover(op) {
  const q = encodeURIComponent(`${op.name} ${op.location || ''} fishing charter`);
  let html;
  try {
    html = await fetchText(`https://html.duckduckgo.com/html/?q=${q}`);
  } catch {
    return {};
  }
  // DDG result links look like: <a class="result__a" href="//duckduckgo.com/l/?uddg=ENCODED">
  const links = [];
  for (const m of html.matchAll(/class="result__a"[^>]*href="([^"]+)"/g)) {
    let href = m[1];
    const ud = href.match(/uddg=([^&]+)/);
    if (ud) href = decodeURIComponent(ud[1]);
    if (/^https?:\/\//.test(href)) links.push(href);
  }
  const bad = /facebook\.com\/(plugins|sharer)|google\.|tripadvisor\.|yelp\.|youtube\.|instagram\.com\/p\/|wikipedia\./i;
  const website = links.find((u) => !bad.test(u) && !/facebook\.com/i.test(u));
  const facebook = links.find((u) => /facebook\.com\/[^/]+/i.test(u) && !/plugins|sharer/i.test(u));
  return { website, facebook };
}

// ── image URL extraction + filtering ─────────────────────────────────────────
const REJECT = /logo|icon|favicon|sprite|avatar|badge|placeholder|loading|spinner|pixel|tracking|emoji|button|arrow|flag|map|googlemap|gstatic|gravatar|\.svg(\?|$)/i;

function absolutize(u, base) {
  try { return new URL(u, base).href; } catch { return null; }
}

function extractImageUrls(html, baseUrl) {
  const found = new Set();
  const add = (u) => { const a = absolutize(u, baseUrl); if (a) found.add(a); };

  for (const m of html.matchAll(/<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/gi)) add(m[1]);
  for (const m of html.matchAll(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/gi)) add(m[1]);
  for (const m of html.matchAll(/<img[^>]+?(?:data-src|src)=["']([^"']+)["']/gi)) add(m[1]);
  for (const m of html.matchAll(/(?:data-srcset|srcset)=["']([^"']+)["']/gi)) {
    for (const part of m[1].split(',')) { const u = part.trim().split(/\s+/)[0]; if (u) add(u); }
  }
  for (const m of html.matchAll(/https?:\/\/static\.wixstatic\.com\/media\/[^\s"'\\)<>]+/gi)) add(m[0]);
  for (const m of html.matchAll(/https?:\/\/[^\s"'\\)<>]+?\.(?:jpe?g|png|webp)(?:\?[^\s"'<>]*)?/gi)) add(m[0]);

  return [...found].filter((u) => !REJECT.test(u) && !u.startsWith('data:'));
}

// Rough size hint so we download the most promising first.
function sizeHint(u) {
  let w = 0;
  const wix = u.match(/[/_]w_(\d+)/); if (wix) w = Math.max(w, +wix[1]);
  const q = u.match(/[?&](?:w|width)=(\d+)/i); if (q) w = Math.max(w, +q[1]);
  const dim = u.match(/(\d{3,4})x(\d{3,4})/); if (dim) w = Math.max(w, +dim[1]);
  return w;
}

// Normalise a Wix URL to a sensible, consistently-sized web rendition.
function normalizeWix(u) {
  const id = u.match(/static\.wixstatic\.com\/media\/([^/]+)/);
  if (!id) return u;
  return `https://static.wixstatic.com/media/${id[1]}/v1/fill/w_1600,h_1067,al_c,q_85/${id[1]}`;
}

async function download(url, destNoExt, referer) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept': 'image/avif,image/webp,image/*,*/*;q=0.8', ...(referer ? { Referer: referer } : {}) },
    redirect: 'follow',
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const type = res.headers.get('content-type') || '';
  if (!/image\//.test(type)) throw new Error(`not an image (${type})`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < MIN_KB * 1024) throw new Error(`too small (${(buf.length / 1024) | 0}kb)`);
  const ext = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : 'jpg';
  const dest = `${destNoExt}.${ext}`;
  fs.writeFileSync(dest, buf);
  return { dest, bytes: buf.length };
}

// ── main ──────────────────────────────────────────────────────────────────────
const manifest = [];
let ops = parseOperators(HTML).filter((o) => o.status === 'active');
if (ONLY) ops = ops.filter((o) => ONLY.includes(o.slug));
ops = ops.slice(0, LIMIT);

console.log(`Processing ${ops.length} operator(s)  (discover=${DISCOVER}, max=${MAX_IMG}/op)\n`);

for (const op of ops) {
  const entry = { slug: op.slug, name: op.name, website: op.website, facebook: op.facebook, sources: [], images: [], notes: [] };
  try {
    let website = op.website;
    let facebook = op.facebook && op.facebook.startsWith('http') ? op.facebook : '';

    if (!website && DISCOVER) {
      const d = await discover(op);
      website = d.website || '';
      facebook = facebook || d.facebook || '';
      entry.discovered = { website, facebook };
      if (website) entry.notes.push(`discovered website: ${website}`);
      else entry.notes.push('no website discovered');
    }

    if (!website) { entry.notes.push('skipped — no website'); manifest.push(entry); console.log(`· ${op.slug}: no website`); continue; }

    const origin = new URL(website).origin;
    const pages = [website];
    // Pull a few likely gallery/about pages from the homepage too.
    let home = '';
    try { home = await fetchText(website, origin); } catch (e) { entry.notes.push(`homepage fetch failed: ${e.message}`); }
    if (home) {
      const linkRe = /<a[^>]+href="([^"]+)"/gi;
      for (const m of home.matchAll(linkRe)) {
        const href = absolutize(m[1], website);
        if (href && href.startsWith(origin) && /gallery|photo|boat|fish|trip|charter|about/i.test(href) && !pages.includes(href)) {
          pages.push(href);
          if (pages.length >= 5) break;
        }
      }
    }

    // Collect candidate image URLs across pages.
    const candidates = new Map(); // url -> hint
    for (const pageUrl of pages) {
      let html = pageUrl === website ? home : '';
      if (!html) { try { html = await fetchText(pageUrl, origin); } catch { continue; } }
      entry.sources.push(pageUrl);
      for (let u of extractImageUrls(html, pageUrl)) {
        if (/static\.wixstatic\.com/.test(u)) u = normalizeWix(u);
        if (!candidates.has(u)) candidates.set(u, sizeHint(u));
      }
    }

    const ranked = [...candidates.entries()].sort((a, b) => b[1] - a[1]).map(([u]) => u);
    const dir = path.join(OUT_ROOT, op.slug);
    fs.mkdirSync(dir, { recursive: true });

    let n = 0;
    for (const url of ranked) {
      if (n >= MAX_IMG) break;
      try {
        const { dest, bytes } = await download(url, path.join(dir, `img-${String(n + 1).padStart(2, '0')}`), origin);
        entry.images.push({ file: path.relative(ROOT, dest), bytes, source: url });
        n++;
      } catch { /* skip individual failures */ }
    }
    entry.notes.push(`${n} image(s) downloaded from ${entry.sources.length} page(s)`);
    console.log(`✓ ${op.slug}: ${n} image(s)`);
  } catch (e) {
    entry.notes.push(`error: ${e.message}`);
    console.log(`✗ ${op.slug}: ${e.message}`);
  }
  manifest.push(entry);
}

// ── write manifest + human review sheet ──────────────────────────────────────
fs.mkdirSync(OUT_ROOT, { recursive: true });
fs.writeFileSync(path.join(OUT_ROOT, 'manifest.json'), JSON.stringify(manifest, null, 2));

let md = `# Operator image review\n\nDownloaded candidate images for curation. Delete the ones you don't want, then we wire the keepers into the listings.\n\n`;
for (const e of manifest) {
  md += `\n## ${e.name} \`${e.slug}\`\n\n`;
  if (e.website) md += `Website: ${e.website}  \n`;
  if (e.notes.length) md += `_${e.notes.join('; ')}_\n\n`;
  for (const img of e.images) md += `<img src="../../${img.file}" width="260">  \n`;
  if (!e.images.length) md += `_(no images)_\n`;
}
fs.writeFileSync(path.join(OUT_ROOT, 'IMAGE-REVIEW.md'), md);

const totalImgs = manifest.reduce((a, e) => a + e.images.length, 0);
console.log(`\nDone. ${totalImgs} image(s) across ${manifest.length} operator(s).`);
console.log(`Manifest: images/operators/manifest.json`);
console.log(`Review:   images/operators/IMAGE-REVIEW.md`);
