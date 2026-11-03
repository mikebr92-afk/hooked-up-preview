// Crawl the locally served site: raw HTML (no JS) vs rendered DOM.
// Usage: node crawl.mjs <baseUrl> <sitemapPath> <outJson> [extraPath ...]
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');

const [BASE, SITEMAP, OUT, ...EXTRA] = process.argv.slice(2);
const sm = fs.readFileSync(SITEMAP, 'utf8');
const paths = [...sm.matchAll(/<loc>https:\/\/hookedtrips\.com([^<]*)<\/loc>/g)].map((m) => m[1] || '/');
for (const e of EXTRA) if (!paths.includes(e)) paths.push(e);

const pick = (html, re) => (html.match(re) || [])[1] ?? null;
function rawInfo(html) {
  const ld = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => {
    try { const j = JSON.parse(m[1]); const g = j['@graph'] || [j]; return g.map((x) => x['@type']).flat(); } catch { return ['INVALID']; }
  }).flat();
  const rootInner = pick(html, /<div id="root">([\s\S]*?)<\/div>\s*(?:<script type="module"[\s\S]*?<\/script>\s*)?<\/body>/) ?? '';
  return {
    title: pick(html, /<title>([^<]*)<\/title>/),
    desc: pick(html, /<meta name="description" content="([^"]*)"/),
    canonical: pick(html, /<link rel="canonical" href="([^"]*)"/),
    robots: pick(html, /<meta name="robots" content="([^"]*)"/),
    ogUrl: pick(html, /<meta property="og:url" content="([^"]*)"/),
    ogImage: pick(html, /<meta property="og:image" content="([^"]*)"/),
    ld,
    rootTextLen: rootInner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().length,
    rawH1: (rootInner.match(/<h1[\s>]/g) || []).length,
    bytes: html.length,
  };
}

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.route('**/*', (route) => {
  const u = route.request().url();
  return u.startsWith(BASE) ? route.continue() : route.abort();
});

const results = [];
for (const p of paths) {
  const url = BASE + p;
  const r = { path: p };
  try {
    const res = await fetch(url, { headers: { 'sec-fetch-mode': 'navigate', accept: 'text/html' } });
    r.status = res.status;
    r.prerendered = res.headers.get('x-prerendered');
    r.raw = rawInfo(await res.text());
  } catch (e) { r.rawError = String(e); }

  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + String(e).slice(0, 200)));
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 45000 });
    await page.waitForTimeout(1200);
    r.rendered = await page.evaluate(() => {
      const q = (s, a) => document.querySelector(s)?.getAttribute(a) ?? null;
      const imgs = [...document.images];
      return {
        title: document.title,
        desc: q('meta[name="description"]', 'content'),
        canonical: q('link[rel="canonical"]', 'href'),
        robots: q('meta[name="robots"]', 'content'),
        h1: [...document.querySelectorAll('h1')].map((h) => h.innerText.trim()),
        h2count: document.querySelectorAll('h2').length,
        words: (document.body.innerText || '').split(/\s+/).filter(Boolean).length,
        imgNoAlt: imgs.filter((i) => !i.hasAttribute('alt')).map((i) => i.src.slice(0, 80)),
        imgBroken: imgs.filter((i) => i.complete && i.naturalWidth === 0 && i.src.startsWith(location.origin)).map((i) => i.src.slice(0, 120)),
        links: [...new Set([...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')))],
        ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => { try { const j = JSON.parse(s.textContent); return (j['@graph'] || [j]).map((x) => x['@type']); } catch { return 'INVALID'; } }).flat(2),
      };
    });
  } catch (e) { r.renderError = String(e).slice(0, 300); }
  r.errors = errors;
  await page.close();
  results.push(r);
  process.stdout.write('.');
}
await browser.close();
fs.writeFileSync(OUT, JSON.stringify(results, null, 1));
console.log(`\n${results.length} pages -> ${OUT}`);
