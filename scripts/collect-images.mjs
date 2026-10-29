#!/usr/bin/env node
// Image collector for operator listings — runs in GitHub Actions (full internet).
//
// Reads every request file in the given directory (default: image-requests/):
//   { "requests": [ { "slug": "five-island-charters-wollongong",
//                     "pages":  ["https://example.com/", "https://example.com/gallery"],
//                     "images": ["https://example.com/photo.jpg"],
//                     "follow": true, "max": 16, "force": false } ] }
//
// For each request it scrapes the pages (and, with follow, a few same-site
// gallery/about/boat pages), downloads the best candidate photos plus any
// direct image URLs, and writes to images/candidates/<slug>/:
//   c01.webp …   candidates (max 2000px, metadata stripped)
//   index.json   source URL, page, size of each candidate + a fetch log
//   sheet.jpg    labelled contact sheet for quick review
// A request whose inputs haven't changed since its last run is skipped
// (set "force": true to redo it).

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire((process.env.DEPS_DIR || process.cwd()) + '/');
const sharp = require('sharp');

const REQ_DIR = process.argv[2] || 'image-requests';
const OUT_ROOT = path.join('images', 'candidates');
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const MIN_W = 600, MIN_H = 400, MAX_SIDE = 2000;

// ── fetching ─────────────────────────────────────────────────────────────────
async function get(url, { referer, accept } = {}) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      'Accept': accept || 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-AU,en;q=0.9',
      ...(referer ? { Referer: referer } : {}),
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(25000),
  });
  return res;
}

// ── image URL extraction ─────────────────────────────────────────────────────
const REJECT = /logo|icon|favicon|sprite|avatar|badge|placeholder|spinner|loading|pixel|tracking|emoji|button|arrow|flag|payment|visa|mastercard|paypal|tripadvisor|maps\.googleapis|gstatic|facebook\.com\/tr|gravatar|\.svg(\?|$)|\.gif(\?|$)/i;

function absolutize(u, base) {
  try { return new URL(u.trim().replace(/&amp;/g, '&'), base).href; } catch { return null; }
}

// Turn CMS thumbnails into the original/large rendition.
function upgrade(u) {
  const out = [u];
  const wix = u.match(/^(https?:\/\/static\.wixstatic\.com\/media\/[^/]+)\//);
  if (wix) out.unshift(wix[1]);
  if (/images\.squarespace-cdn\.com/.test(u)) out.unshift(u.replace(/\?.*$/, '') + '?format=2500w');
  const wp = u.replace(/-\d{2,4}x\d{2,4}(?=\.(?:jpe?g|png|webp)(?:\?|$))/i, '');
  if (wp !== u) out.unshift(wp);
  const shop = u.replace(/_(?:\d+x\d*|\d*x\d+)(?=\.(?:jpe?g|png|webp))/i, '');
  if (shop !== u && /cdn\.shopify|\/cdn\/shop\//.test(u)) out.unshift(shop);
  return [...new Set(out)];
}

function extract(html, base) {
  const priority = [];   // og/twitter/json-ld images: usually the site's chosen hero
  const found = [];
  const add = (list, u) => { const a = absolutize(u, base); if (a && !a.startsWith('data:')) list.push(a); };
  for (const m of html.matchAll(/<meta[^>]+(?:property|name)=["'](?:og:image(?::secure_url)?|twitter:image(?::src)?)["'][^>]*content=["']([^"']+)["']/gi)) add(priority, m[1]);
  for (const m of html.matchAll(/<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["'](?:og:image|twitter:image)["']/gi)) add(priority, m[1]);
  for (const m of html.matchAll(/"image"\s*:\s*(?:\{[^}]*"url"\s*:\s*)?"(https?:[^"]+)"/gi)) add(priority, m[1].replace(/\\\//g, '/'));
  for (const m of html.matchAll(/<img[^>]+?(?:data-src|data-lazy-src|data-original|src)=["']([^"']+)["']/gi)) add(found, m[1]);
  for (const m of html.matchAll(/(?:data-srcset|srcset)=["']([^"']+)["']/gi)) {
    // keep the widest entry of each srcset
    const parts = m[1].split(',').map((p) => p.trim().split(/\s+/)).filter((p) => p[0]);
    parts.sort((a, b) => (parseInt(b[1]) || 0) - (parseInt(a[1]) || 0));
    if (parts[0]) add(found, parts[0][0]);
  }
  for (const m of html.matchAll(/background(?:-image)?\s*:\s*url\((['"]?)([^'")]+)\1\)/gi)) add(found, m[2]);
  for (const m of html.matchAll(/https?:\/\/static\.wixstatic\.com\/media\/[^\s"'\\)<>]+/gi)) add(found, m[0]);
  for (const m of html.matchAll(/https?:\/\/[^\s"'\\)<>]+?\.(?:jpe?g|png|webp)(?:\?[^\s"'<>]*)?/gi)) add(found, m[0].replace(/\\\//g, '/'));
  const clean = (l) => l.filter((u) => !REJECT.test(u));
  return { priority: clean(priority), found: clean(found) };
}

function sameSiteLinks(html, base) {
  const origin = new URL(base).origin;
  const out = [];
  for (const m of html.matchAll(/<a[^>]+href=["']([^"'#]+)["']/gi)) {
    const u = absolutize(m[1], base);
    if (u && u.startsWith(origin) && /gallery|photo|image|boat|vessel|fleet|catch|fishing|charter|trip|tour|about|crew/i.test(u) && !/\.(pdf|jpe?g|png)$/i.test(u)) out.push(u.split('#')[0]);
  }
  return [...new Set(out)];
}

// ── image download + validation ──────────────────────────────────────────────
async function aHash(buf) {
  const px = await sharp(buf).resize(8, 8, { fit: 'fill' }).greyscale().raw().toBuffer();
  const avg = px.reduce((a, b) => a + b, 0) / px.length;
  return [...px].map((v) => (v > avg ? '1' : '0')).join('');
}
const hamming = (a, b) => [...a].filter((c, i) => c !== b[i]).length;

async function tryDownload(url, referer) {
  const res = await get(url, { referer, accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const buf = Buffer.from(await res.arrayBuffer());
  const meta = await sharp(buf).metadata();
  if (!meta.width || !meta.height) throw new Error('not an image');
  if (meta.width < MIN_W || meta.height < MIN_H) throw new Error(`too small ${meta.width}x${meta.height}`);
  const r = meta.width / meta.height;
  if (r > 3.2 || r < 0.45) throw new Error(`banner/strip ${meta.width}x${meta.height}`);
  return { buf, meta };
}

async function sheet(dir, items) {
  if (!items.length) return;
  const TW = 360, TH = 250, LH = 26, COLS = 4;
  const rows = Math.ceil(items.length / COLS);
  const tiles = [];
  for (const [i, it] of items.entries()) {
    const thumb = await sharp(path.join(dir, it.file)).resize(TW - 8, TH - 8, { fit: 'inside' }).toBuffer();
    const x = (i % COLS) * TW, y = Math.floor(i / COLS) * (TH + LH);
    tiles.push({ input: thumb, left: x + 4, top: y + 4 });
    const label = `${it.file.replace('.webp', '')}  ${it.width}x${it.height}${it.priority ? '  ★site hero' : ''}`;
    tiles.push({ input: Buffer.from(`<svg width="${TW}" height="${LH}"><text x="6" y="18" font-family="sans-serif" font-size="15" fill="#111">${label}</text></svg>`), left: x, top: y + TH });
  }
  await sharp({ create: { width: COLS * TW, height: rows * (TH + LH), channels: 3, background: '#ffffff' } })
    .composite(tiles).jpeg({ quality: 80 }).toFile(path.join(dir, 'sheet.jpg'));
}

// ── one request ──────────────────────────────────────────────────────────────
async function collect(req) {
  const slug = String(req.slug || '').replace(/[^a-z0-9-]/g, '');
  if (!slug) return null;
  const dir = path.join(OUT_ROOT, slug);
  const hash = crypto.createHash('sha1').update(JSON.stringify({ p: req.pages || [], i: req.images || [], f: !!req.follow, m: req.max || 16 })).digest('hex').slice(0, 12);
  const idx = path.join(dir, 'index.json');
  if (!req.force && fs.existsSync(idx)) {
    try { if (JSON.parse(fs.readFileSync(idx, 'utf8')).request_hash === hash) return { slug, skipped: true }; } catch {}
  }
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const max = Math.min(req.max || 16, 30);
  const log = [];
  const queue = []; // { url, referer, priority, page }
  const pages = [...(req.pages || [])];
  const seenPages = new Set();

  for (let pi = 0; pi < pages.length && seenPages.size < 8; pi++) {
    const page = pages[pi];
    if (seenPages.has(page)) continue;
    seenPages.add(page);
    try {
      const res = await get(page);
      const html = await res.text();
      log.push({ page, status: res.status, final_url: res.url, bytes: html.length });
      if (!res.ok) continue;
      const { priority, found } = extract(html, res.url);
      for (const u of priority) queue.push({ url: u, referer: res.url, priority: true, page });
      for (const u of found) queue.push({ url: u, referer: res.url, priority: false, page });
      if (req.follow !== false && pi < (req.pages || []).length) {
        for (const l of sameSiteLinks(html, res.url).slice(0, 6)) if (!pages.includes(l)) pages.push(l);
      }
    } catch (e) { log.push({ page, error: String(e.message || e) }); }
  }
  for (const u of req.images || []) queue.push({ url: u, referer: (() => { try { return new URL(u).origin + '/'; } catch { return undefined; } })(), priority: true, page: 'direct' });

  const items = [];
  const hashes = [];
  const tried = new Set();
  for (const q of queue) {
    if (items.length >= max) break;
    for (const url of upgrade(q.url)) {
      if (tried.has(url)) continue;
      tried.add(url);
      try {
        const { buf, meta } = await tryDownload(url, q.referer);
        const h = await aHash(buf);
        if (hashes.some((x) => hamming(x, h) <= 5)) { log.push({ dup: url }); break; }
        hashes.push(h);
        const file = `c${String(items.length + 1).padStart(2, '0')}.webp`;
        const out = await sharp(buf).rotate().resize(MAX_SIDE, MAX_SIDE, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 85 }).toFile(path.join(dir, file));
        items.push({ file, width: out.width, height: out.height, original: `${meta.width}x${meta.height}`, source: url, page: q.page, priority: q.priority });
        break; // got this image; don't also fetch its smaller variants
      } catch (e) { log.push({ image: url, error: String(e.message || e) }); }
    }
  }
  await sheet(dir, items);
  fs.writeFileSync(idx, JSON.stringify({ slug, request_hash: hash, collected_at: new Date().toISOString(), pages_fetched: [...seenPages], candidates: items, log }, null, 2));
  return { slug, candidates: items.length, pages: seenPages.size };
}

// ── main ─────────────────────────────────────────────────────────────────────
const files = fs.existsSync(REQ_DIR) ? fs.readdirSync(REQ_DIR).filter((f) => f.endsWith('.json')) : [];
const summary = [];
for (const f of files) {
  let reqs = [];
  try { reqs = JSON.parse(fs.readFileSync(path.join(REQ_DIR, f), 'utf8')).requests || []; } catch (e) { console.log(`✗ ${f}: ${e.message}`); continue; }
  for (const r of reqs) {
    try {
      const s = await collect(r);
      if (s) { summary.push(s); console.log(s.skipped ? `· ${s.slug}: unchanged, skipped` : `✓ ${s.slug}: ${s.candidates} candidate(s) from ${s.pages} page(s)`); }
    } catch (e) { console.log(`✗ ${r.slug}: ${e.message}`); summary.push({ slug: r.slug, error: e.message }); }
  }
}
fs.mkdirSync(OUT_ROOT, { recursive: true });
fs.writeFileSync(path.join(OUT_ROOT, 'last-run.json'), JSON.stringify({ finished_at: new Date().toISOString(), summary }, null, 2));
