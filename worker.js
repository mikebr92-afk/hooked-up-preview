// Cloudflare Worker for hookedtrips.com
//
// For every HTML page it:
//   1. writes page-specific <head> tags (title, description, canonical, robots,
//      Open Graph/Twitter, JSON-LD) using the same helpers the app uses
//      (site-seo.js), so raw HTML and the rendered app always agree; and
//   2. server-renders a plain-HTML copy of the page content into #root, so
//      crawlers that don't run JavaScript (social previews, Bing, AI assistants)
//      still see real content and links. The React app replaces it on load.
//
// It also returns real 404s for unknown charters/locations and generates
// /sitemap.xml and /llms.txt from the live listing data in index.html.
//
// Listing data is read from the operator records embedded in the app bundle
// (Rr = listing cards, p1 = full operator records) — index.html stays the single
// source of truth.

import * as SEO from './site-seo.js';

const { SITE, LOCS } = SEO;

const STATIC_PAGES = ['/', '/charters', '/about', '/list-your-charter', '/contact', '/terms', '/privacy'];
const CITY_KEYS = ['sydney', 'gold-coast', 'cairns', 'darwin', 'port-stephens', 'sunshine-coast', 'wollongong'];
const STATE_KEYS = ['new-south-wales', 'queensland', 'northern-territory'];

// ── escaping ─────────────────────────────────────────────────────────────────
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ldJson = (o) => JSON.stringify(o).replace(/</g, '\\u003c');

// ── parser for the plain JS literals in the bundle (no eval in Workers) ──────
function parseLiteralAt(src, start) {
  let i = start;
  const ws = () => { while (i < src.length) { const c = src.charCodeAt(i); if (c === 32 || c === 10 || c === 13 || c === 9) i++; else break; } };
  function str() {
    const q = src[i++];
    let out = '';
    for (;;) {
      const j = src.indexOf(q, i);
      const b = src.indexOf('\\', i);
      if (j < 0) throw new Error('unterminated string');
      if (b < 0 || j < b) { out += src.slice(i, j); i = j + 1; return out; }
      out += src.slice(i, b);
      const n = src[b + 1];
      i = b + 2;
      if (n === 'n') out += '\n';
      else if (n === 't') out += '\t';
      else if (n === 'r') out += '\r';
      else if (n === 'u') { out += String.fromCharCode(parseInt(src.substr(i, 4), 16)); i += 4; }
      else if (n === 'x') { out += String.fromCharCode(parseInt(src.substr(i, 2), 16)); i += 2; }
      else out += n;
    }
  }
  const KEY = /[A-Za-z_$][\w$]*|\d+/y;
  const NUM = /-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/iy;
  function val() {
    ws();
    const c = src[i];
    if (c === '{') {
      i++;
      const o = {};
      for (;;) {
        ws();
        if (src[i] === '}') { i++; return o; }
        let k;
        if (src[i] === '"' || src[i] === "'") k = str();
        else { KEY.lastIndex = i; const m = KEY.exec(src); if (!m) throw new Error('bad key at ' + i); k = m[0]; i += k.length; }
        ws();
        if (src[i++] !== ':') throw new Error('expected : at ' + (i - 1));
        o[k] = val();
        ws();
        if (src[i] === ',') i++;
        else if (src[i] === '}') { i++; return o; }
        else throw new Error('expected , or } at ' + i);
      }
    }
    if (c === '[') {
      i++;
      const a = [];
      for (;;) {
        ws();
        if (src[i] === ']') { i++; return a; }
        a.push(val());
        ws();
        if (src[i] === ',') i++;
        else if (src[i] === ']') { i++; return a; }
        else throw new Error('expected , or ] at ' + i);
      }
    }
    if (c === '"' || c === "'") return str();
    if (src.startsWith('!0', i)) { i += 2; return true; }
    if (src.startsWith('!1', i)) { i += 2; return false; }
    if (src.startsWith('true', i)) { i += 4; return true; }
    if (src.startsWith('false', i)) { i += 5; return false; }
    if (src.startsWith('null', i)) { i += 4; return null; }
    if (src.startsWith('void 0', i)) { i += 6; return undefined; }
    NUM.lastIndex = i;
    const m = NUM.exec(src);
    if (m) { i += m[0].length; return Number(m[0]); }
    throw new Error('unexpected token at ' + i);
  }
  return val();
}

// ── listing data (cached per isolate, keyed on the deployed index.html) ─────
let cache = { key: null, cards: [], ops: new Map() };

function data(html) {
  const key = html.length + ':' + html.slice(html.length >> 1, (html.length >> 1) + 64);
  if (cache.key !== key) {
    const at = html.indexOf('Rr=[');
    cache = { key, cards: at >= 0 ? parseLiteralAt(html, at + 3) : [], ops: new Map() };
  }
  return cache;
}

function operator(html, c, slug) {
  if (c.ops.has(slug)) return c.ops.get(slug);
  const marker = `id:"op-`;
  const s = `",slug:"${slug}",`;
  let op = null;
  for (let i = html.indexOf(s); i >= 0; i = html.indexOf(s, i + 1)) {
    const start = html.lastIndexOf(marker, i);
    if (start > 0 && html[start - 1] === '{' && i - start < 20) {
      op = parseLiteralAt(html, start - 1);
      break;
    }
  }
  if (op && op.status !== 'active') op = null;
  c.ops.set(slug, op);
  return op;
}

// ── page shell ───────────────────────────────────────────────────────────────
// index.html is ~800 KB, almost all of it the inline app bundle. To keep CPU low
// we split it once per deploy into: the small <head> prefix (everything before
// the bundle — where all rewritable tags live), the bundle, and the body around
// <div id="root"></div>. Each request only rewrites the small prefix.
const ROOT_DIV = '<div id="root"></div>';
let shellCache = { etag: null, text: null, parts: null };

function splitShell(html) {
  const s = html.indexOf('<script type="module"');
  const h = html.lastIndexOf('</head>');
  const r = html.lastIndexOf(ROOT_DIV);
  return { pre: html.slice(0, s), mid: html.slice(s, h), between: html.slice(h, r), after: html.slice(r + ROOT_DIV.length) };
}

async function getShell(env, origin) {
  const resp = await env.ASSETS.fetch(new Request(origin + '/', { method: 'GET' }));
  const etag = resp.headers.get('etag');
  if (etag && etag === shellCache.etag) {
    await resp.body?.cancel();
    return shellCache;
  }
  const text = await resp.text();
  shellCache = { etag, text, parts: splitShell(text) };
  return shellCache;
}

// ── <head> ───────────────────────────────────────────────────────────────────
function setTag(head, re, tag) {
  return re.test(head) ? head.replace(re, tag) : tag ? head + tag + '\n' : head;
}

// Returns the rewritten <head> prefix plus the extra tags to append before </head>.
function writeHead(html, m, extra = '') {
  const img = m.image || SEO.DEFAULT_IMAGE;
  const url = m.path ? SITE + m.path : null;
  const meta = (attr, key, val) => (val == null || val === '' ? '' : `<meta ${attr}="${key}" content="${esc(val)}"/>`);
  const reMeta = (attr, key) => new RegExp(`<meta ${attr}="${key}"[^>]*/>`);

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(m.title)}</title>`);
  html = setTag(html, reMeta('name', 'description'), meta('name', 'description', m.desc));
  html = setTag(html, reMeta('name', 'robots'), meta('name', 'robots', m.robots || SEO.ROBOTS_INDEX));
  html = setTag(html, /<link rel="canonical"[^>]*\/>/, url ? `<link rel="canonical" href="${esc(url)}"/>` : '');
  html = setTag(html, reMeta('property', 'og:url'), meta('property', 'og:url', url));
  html = setTag(html, reMeta('property', 'og:title'), meta('property', 'og:title', m.title));
  html = setTag(html, reMeta('property', 'og:description'), meta('property', 'og:description', m.desc));
  html = setTag(html, reMeta('property', 'og:image'), meta('property', 'og:image', img.url));
  html = setTag(html, reMeta('property', 'og:image:width'), meta('property', 'og:image:width', img.width));
  html = setTag(html, reMeta('property', 'og:image:height'), meta('property', 'og:image:height', img.height));
  html = setTag(html, reMeta('property', 'og:image:alt'), meta('property', 'og:image:alt', img.alt));
  html = setTag(html, reMeta('name', 'twitter:title'), meta('name', 'twitter:title', m.title));
  html = setTag(html, reMeta('name', 'twitter:description'), meta('name', 'twitter:description', m.desc));
  html = setTag(html, reMeta('name', 'twitter:image'), meta('name', 'twitter:image', img.url));
  const ld = m.ld ? `<script type="application/ld+json" data-ld="page">${ldJson(m.ld)}</script>\n` : '';
  return { head: html, tail: ld + extra };
}

// ── server-rendered page content (replaced by the React app on load) ────────
const SSR_CSS = `<style>
.ssr{font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#2D2D2D;background:#F5F0E8;line-height:1.6}
.ssr a{color:#0B3954}
.ssr-nav{background:#082B3F;display:flex;justify-content:space-between;align-items:center;padding:18px 32px}
.ssr-nav--over{position:absolute;top:0;left:0;right:0;background:transparent;z-index:2}
.ssr-nav img{display:block}
.ssr-cta{color:#F5F0E8!important;border:1px solid rgba(245,240,232,.5);border-radius:999px;padding:8px 18px;text-decoration:none;font-size:14px}
.ssr-main{max-width:1180px;margin:0 auto;padding:40px 32px 64px}
.ssr h1,.ssr h2{font-family:"Familjen Grotesk",Inter,sans-serif;color:#0B3954;line-height:1.12;font-weight:600}
.ssr h1{font-size:clamp(32px,4.4vw,48px);margin:0 0 12px}
.ssr h2{font-size:clamp(22px,2.4vw,28px);margin:40px 0 14px}
.ssr h3{font-size:17px;margin:0 0 4px;color:#0B3954}
.ssr p{margin:0 0 12px;max-width:72ch}
.ssr ul{margin:0 0 18px}
.ssr main h3{margin-top:18px}
.ssr-crumbs{font-size:13px;color:#5A5A5A;margin-bottom:12px}
.ssr-crumbs a{color:#5A5A5A}
.ssr-grid{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:14px}
.ssr-grid li{background:#FAF6EE;border:1px solid rgba(11,57,84,.12);border-radius:12px;padding:16px 18px}
.ssr-grid p{font-size:14px;color:#5A5A5A;margin:0}
.ssr-chips{display:flex;flex-wrap:wrap;gap:10px;list-style:none;padding:0}
.ssr-chips a{display:inline-block;padding:7px 14px;border:1px solid rgba(11,57,84,.2);border-radius:999px;text-decoration:none;font-size:14px}
.ssr-hero{position:relative;min-height:min(78vh,720px);display:flex;align-items:center;overflow:hidden;background:#082B3F}
.ssr-hero>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.ssr-hero:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,43,63,.75),rgba(8,43,63,.15))}
.ssr-hero div{position:relative;z-index:1;max-width:1180px;margin:0 auto;padding:110px 32px 60px;width:100%}
.ssr-hero h1{color:#fff;font-size:clamp(40px,6vw,76px);max-width:11ch}
.ssr-hero p{color:#F5F0E8;font-size:18px;max-width:44ch}
.ssr-photo{width:100%;max-height:460px;object-fit:cover;border-radius:12px;margin:8px 0 16px}
.ssr-foot{background:#082B3F;color:#F5F0E8;padding:40px 32px}
.ssr-foot nav{max-width:1180px;margin:0 auto;display:flex;flex-wrap:wrap;gap:6px 22px;font-size:14px}
.ssr-foot a{color:#F5F0E8}
</style>
`;

const LOGO = '<img src="/hooked-trips-logo-wordmark-no-tagline-white.png" alt="Hooked Trips" width="67" height="38"/>';

function nav(over = false) {
  return `<header class="ssr-nav${over ? ' ssr-nav--over' : ''}"><a href="/">${LOGO}</a><a class="ssr-cta" href="/list-your-charter">Add your charter</a></header>`;
}

function footer() {
  const links = [
    ['/charters', 'Browse all charters'],
    ...STATE_KEYS.map((k) => ['/fishing-charters/' + k, LOCS[k].n]),
    ...CITY_KEYS.map((k) => ['/fishing-charters/' + k, LOCS[k].short + ' fishing charters']),
    ['/about', 'About'], ['/list-your-charter', 'List your charter'], ['/contact', 'Contact'],
    ['/terms', 'Terms'], ['/privacy', 'Privacy'],
  ];
  return `<footer class="ssr-foot"><nav>${links.map(([h, t]) => `<a href="${h}">${esc(t)}</a>`).join('')}</nav></footer>`;
}

function page(main, { over = false } = {}) {
  return `<div class="ssr">${nav(over)}${main}${footer()}</div>`;
}

function crumbsHtml(trail) {
  return `<nav class="ssr-crumbs" aria-label="Breadcrumb">${trail
    .map(([name, href], i) => (i < trail.length - 1 ? `<a href="${href}">${esc(name)}</a>` : `<span>${esc(name)}</span>`))
    .join(' › ')}</nav>`;
}

const unit = (u) => (/person/.test(u) ? 'person' : 'group');

function cardList(cards) {
  return `<ul class="ssr-grid">${cards.map((c) => `<li><h3><a href="/charters/${esc(c.slug)}">${esc(c.name)}</a></h3><p>${esc(c.location)}${
    c.species?.length ? ' · ' + esc(c.species.join(', ')) : ''}${c.price ? ` · From ${SEO.money(c.price)} / ${unit(c.priceUnit)}` : ''}</p></li>`).join('')}</ul>`;
}

function locationChips() {
  return `<h2>Browse fishing charters by location</h2><ul class="ssr-chips">${Object.entries(LOCS)
    .map(([k, L]) => `<li><a href="/fishing-charters/${k}">${esc(L.short)} Fishing Charters</a></li>`).join('')}</ul>`;
}

function renderHome(cards) {
  const act = SEO.activeCards(cards);
  const byState = (st) => act.filter((c) => c.state === st).length;
  return page(
    `<section class="ssr-hero"><img src="/images/hero-marlin-1536.webp" srcset="/images/hero-marlin-640.webp 640w, /images/hero-marlin-1024.webp 1024w, /images/hero-marlin-1536.webp 1536w" sizes="100vw" width="1536" height="1024" fetchpriority="high" alt="Angler hooked up to a breaching marlin at sunrise"/>
<div><h1>Find Australia's best fishing charters</h1><p>Hook a marlin offshore. Watch a trout sip your dry fly. Feel a metre barra engulf your lure. We've got the charter for every session.</p><p><a class="ssr-cta" href="/charters">Browse all ${act.length} charters</a></p></div></section>
<main class="ssr-main">
<h2>Browse by region</h2><ul class="ssr-grid">${STATE_KEYS.map((k) => `<li><h3><a href="/fishing-charters/${k}">${esc(LOCS[k].n)}</a></h3><p>${byState(LOCS[k].st)} charters</p></li>`).join('')}
<li><h3>Western Australia</h3><p>Coming soon</p></li><li><h3>Tasmania</h3><p>Coming soon</p></li><li><h3>Victoria</h3><p>Coming soon</p></li></ul>
<h2>Popular fishing destinations</h2><ul class="ssr-chips">${CITY_KEYS.map((k) => `<li><a href="/fishing-charters/${k}">${esc(LOCS[k].short)} fishing charters</a></li>`).join('')}</ul>
<h2>Built by anglers, for anglers</h2>
<h3>1. Tell us where &amp; what</h3><p>Pick a region, a species you're chasing, or just browse. We feature licensed operators based on quality and reviews — not who pays us most.</p>
<h3>2. Compare honestly</h3><p>Boat specs, target species by season, and what each operator actually offers.</p>
<h3>3. Book &amp; go fish</h3><p>Send your enquiry — operators typically respond within hours. Confirm directly with the operator and lock in your trip.</p>
</main>`,
    { over: true },
  );
}

function renderCharters(cards) {
  const act = SEO.activeCards(cards);
  return page(`<main class="ssr-main">${crumbsHtml([['Home', '/'], ['Fishing Charters', '/charters']])}
<h1>Find your fishing charter</h1><p>${act.length} operators across Australia</p>
${cardList(act)}${locationChips()}
<p><a href="/list-your-charter">List your charter →</a></p></main>`);
}

function renderLocation(key, L, items) {
  const g = SEO.locGuide(L, items);
  return page(`<main class="ssr-main">${crumbsHtml([['Home', '/'], ['Fishing Charters', '/charters'], [L.n, '/fishing-charters/' + key]])}
<h1>Fishing Charters ${esc(L.in)}</h1>
<p>Compare ${items.length} fishing ${items.length === 1 ? 'charter' : 'charters'} ${esc(L.in)}. Browse trips, target species and prices — then enquire direct with the operator.</p>
${cardList(items)}
<section><h2>${esc(g.heading)}</h2>${g.paras.map((p) => `<p>${esc(p)}</p>`).join('')}
<h2>Frequently asked questions</h2>${g.faq.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('')}</section>
${locationChips()}</main>`);
}

function renderCharter(op, cards) {
  const rel = SEO.relatedCharters(op, cards, 6);
  const trail = [['Home', '/'], ['Fishing Charters', '/charters']];
  if (rel.loc) trail.push([rel.loc[1].n, '/fishing-charters/' + rel.loc[0]]);
  trail.push([op.name, '/charters/' + op.slug]);
  const ct = SEO.cheapestTrip(op);
  const imgs = SEO.charterImages(op);
  const li = (arr) => (arr?.length ? `<ul>${arr.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '');
  const trips = (op.trips || []).map((t) => `<h3>${esc(t.name)}</h3><p>${[
    t.duration_hours && `${t.duration_hours} hours`, t.departure_time && `departs ${t.departure_time}`,
    t.max_group && `up to ${t.max_group} guests`, t.price && `${SEO.money(t.price)} per ${unit(t.price_model)}`,
  ].filter(Boolean).map(esc).join(' · ')}</p>${t.suitability_notes ? `<p>${esc(t.suitability_notes)}</p>` : ''}${li(t.what_included)}`).join('');
  const species = (op.all_species || []).map((s) => `<li><strong>${esc(s.name)}</strong>${s.season ? ` (${esc(s.season)})` : ''}${s.notes ? ` — ${esc(s.notes)}` : ''}</li>`).join('');
  const boat = [
    op.boat_name && `Vessel: ${op.boat_name}`, op.boat_type && `Type: ${op.boat_type}`,
    op.boat_length_m && `Length: ${op.boat_length_m}m`, op.max_capacity && `Max capacity: ${op.max_capacity} guests`,
    op.survey_certification && `Survey: ${op.survey_certification}`,
  ].filter(Boolean);
  const captains = (op.captains || []).map((c) => `<h3>${esc(c.name)}</h3>${c.years_experience ? `<p>${esc(c.years_experience)} years experience</p>` : ''}${c.bio ? `<p>${esc(c.bio)}</p>` : ''}`).join('');
  return page(`<main class="ssr-main">${crumbsHtml(trail)}
<h1>${esc(op.name)}</h1>
<p>${esc(op.primary_location)}${ct ? ` · From ${SEO.money(ct.price)} per ${unit(ct.price_model)}` : ''}</p>
${imgs[0] ? `<img class="ssr-photo" src="${esc(imgs[0].replace(SITE, ''))}" alt="${esc(op.name)} – photo 1" width="1200" height="800" fetchpriority="high"/>` : ''}
<h2>About ${esc(op.name)}</h2><p>${esc(op.description)}</p>
${trips ? `<h2>Trips offered</h2>${trips}` : ''}
${species ? `<h2>What you could catch</h2><ul>${species}</ul>` : ''}
${boat.length ? `<h2>The boat</h2>${li(boat)}${li(op.boat_features)}` : ''}
${op.whats_included?.length ? `<h2>What's included</h2>${li(op.whats_included)}` : ''}
${op.what_to_bring?.length ? `<h2>What to bring</h2>${li(op.what_to_bring)}` : ''}
${op.cancellation_policy ? `<h2>Cancellation policy</h2><p>${esc(op.cancellation_policy)}</p>` : ''}
${op.weather_policy ? `<h2>Weather policy</h2><p>${esc(op.weather_policy)}</p>` : ''}
${captains ? `<h2>Meet the crew</h2>${captains}` : ''}
${op.departure_address ? `<h2>Where you'll meet</h2><p>${esc(op.departure_address)}</p>` : ''}
${rel.items.length ? `<h2>More fishing charters ${esc(rel.loc ? rel.loc[1].in : 'nearby')}</h2>${cardList(rel.items)}${rel.loc ? `<p><a href="/fishing-charters/${rel.loc[0]}">See all fishing charters ${esc(rel.loc[1].in)} →</a></p>` : ''}` : ''}
<p><small>Listings on Hooked Trips are compiled from publicly available information. Always confirm specifics directly with the operator before booking.</small></p></main>`);
}

const STATIC_COPY = {
  '/about': ["We're trying to do this honestly.", 'Hooked Trips is an Australian fishing charter platform built by a real fisherman who got tired of watching mates get squeezed by global platforms that don\'t understand what they do. Flat 10% commission. Australian-based. Run by people who actually fish.'],
  '/list-your-charter': ['Reach more anglers. Keep more of your booking.', 'Hooked Trips is the Australian-built fishing charter platform connecting operators with serious anglers. Free to list. No monthly fees. No pay-to-play rankings. A flat 10% commission on completed bookings, including payment processing.'],
  '/contact': ['Contact Us', "Questions about a listing? Want to update your business information? Or just want to say g'day — we're here. Email hello@hookedtrips.com."],
  '/terms': ['Terms of Service', 'These terms govern your use of Hooked Trips. By using our platform, you agree to these terms.'],
  '/privacy': ['Privacy Policy', 'We respect your privacy and only collect what we need to run the platform.'],
};

function renderStatic(path) {
  const [h1, p] = STATIC_COPY[path];
  return page(`<main class="ssr-main"><h1>${esc(h1)}</h1><p>${esc(p)}</p><p><a href="/charters">Browse fishing charters</a> · <a href="/list-your-charter">List your charter</a> · <a href="mailto:hello@hookedtrips.com">hello@hookedtrips.com</a></p></main>`);
}

function render404() {
  return page(`<main class="ssr-main"><h1>Nothing on the line.</h1><p>That page doesn't exist — you might have followed a bad link or the URL changed.</p>
<p><a href="/charters">Browse all fishing charters</a> · <a href="/">Home</a></p>${locationChips()}</main>`);
}

// ── generated files ──────────────────────────────────────────────────────────
function sitemap(cards) {
  const urls = [
    ...STATIC_PAGES,
    ...Object.keys(LOCS).map((k) => '/fishing-charters/' + k),
    ...SEO.activeCards(cards).map((c) => '/charters/' + c.slug),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${SITE}${u}</loc></url>`).join('\n')}\n</urlset>\n`;
}

function llms(cards) {
  const act = SEO.activeCards(cards);
  const lines = [
    '# Hooked Trips',
    '',
    `> Hooked Trips (hookedtrips.com) is an Australian fishing charter platform. Anglers compare ${act.length} charter operators across New South Wales, Queensland and the Northern Territory — trips, prices, target species and boats — and enquire directly with the operator.`,
    '',
    '## Fishing charters by location',
    '',
    ...Object.entries(LOCS).map(([k, L]) => `- [Fishing charters ${L.in}](${SITE}/fishing-charters/${k}): ${SEO.locItems(cards, L).length} operators`),
    '',
    '## Charter operators',
    '',
    ...act.map((c) => `- [${c.name}](${SITE}/charters/${c.slug}): ${c.location}${c.species?.length ? ' — ' + c.species.join(', ') : ''}${c.price ? ` — from ${SEO.money(c.price)} per ${unit(c.priceUnit)}` : ''}`),
    '',
    '## About',
    '',
    `- [About Hooked Trips](${SITE}/about)`,
    `- [List your fishing charter](${SITE}/list-your-charter)`,
    `- [Contact](${SITE}/contact)`,
    '',
  ];
  return lines.join('\n');
}

// ── request handling ─────────────────────────────────────────────────────────
function htmlResponse(request, html, status, extraHeaders = {}) {
  return new Response(request.method === 'HEAD' ? null : html, {
    status,
    headers: {
      'content-type': 'text/html;charset=UTF-8',
      'cache-control': 'public, max-age=300',
      'x-prerendered': '1',
      ...extraHeaders,
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let path = url.pathname;

    if (request.method !== 'GET' && request.method !== 'HEAD') return env.ASSETS.fetch(request);

    // One canonical form per URL: no trailing slash (except the homepage).
    if (path.length > 1 && path.endsWith('/')) {
      return Response.redirect(url.origin + path.replace(/\/+$/, '') + url.search, 301);
    }

    const sh = await getShell(env, url.origin);
    const shell = sh.text;
    const c = data(shell);

    if (path === '/sitemap.xml') {
      return new Response(sitemap(c.cards), { headers: { 'content-type': 'application/xml;charset=UTF-8', 'cache-control': 'public, max-age=3600' } });
    }
    if (path === '/llms.txt') {
      return new Response(llms(c.cards), { headers: { 'content-type': 'text/plain;charset=UTF-8', 'cache-control': 'public, max-age=3600' } });
    }

    let meta;
    let body;
    let status = 200;
    let extraHead = SSR_CSS;
    const headers = {};
    const act = SEO.activeCards(c.cards);
    let m;

    if (path === '/') {
      meta = SEO.pageMeta('/', { count: act.length });
      body = renderHome(c.cards);
      extraHead += '<link rel="preload" as="image" href="/images/hero-marlin-1536.webp" imagesrcset="/images/hero-marlin-640.webp 640w, /images/hero-marlin-1024.webp 1024w, /images/hero-marlin-1536.webp 1536w" imagesizes="100vw" fetchpriority="high"/>\n';
    } else if (path === '/charters') {
      meta = SEO.pageMeta('/charters', { count: act.length, cards: act });
      body = renderCharters(c.cards);
    } else if ((m = path.match(/^\/charters\/([^/]+)$/))) {
      const op = operator(shell, c, decodeURIComponent(m[1]));
      if (op) {
        meta = SEO.charterMeta(op, c.cards);
        body = renderCharter(op, c.cards);
      }
    } else if ((m = path.match(/^\/fishing-charters\/([^/]+)$/))) {
      const key = decodeURIComponent(m[1]);
      const L = Object.prototype.hasOwnProperty.call(LOCS, key) ? LOCS[key] : null;
      if (L) {
        const items = SEO.locItems(c.cards, L);
        meta = SEO.locMeta(key, L, items);
        body = renderLocation(key, L, items);
      }
    } else if (STATIC_COPY[path]) {
      meta = SEO.pageMeta(path);
      body = renderStatic(path);
    } else if (/^\/admin(\/|$)/.test(path)) {
      meta = SEO.pageMeta('admin');
      body = '';
      extraHead = '';
      headers['x-robots-tag'] = 'noindex, nofollow';
    }

    if (!meta) {
      meta = SEO.pageMeta('404');
      body = render404();
      status = 404;
      headers['x-robots-tag'] = 'noindex';
    }

    const { pre, mid, between, after } = sh.parts;
    const { head, tail } = writeHead(pre, meta, extraHead);
    const html = head + mid + tail + between + `<div id="root">${body || ''}</div>` + after;
    return htmlResponse(request, html, status, headers);
  },
};
