// Raw-HTML (as crawlers see it) audit: links, images, head tags, JSON-LD, markdown + llms links.
const BASE = 'http://localhost:8788', SITE = 'https://hookedtrips.com';
const get = async (u, method = 'GET') => { const r = await fetch(BASE + u, { method, redirect: 'manual' }); return { status: r.status, text: method === 'GET' ? await r.text() : '', type: r.headers.get('content-type') || '', loc: r.headers.get('location') }; };
const sm = (await get('/sitemap.xml')).text;
const pages = [...sm.matchAll(/<loc>https:\/\/hookedtrips\.com([^<]*)<\/loc>/g)].map((m) => m[1] || '/');
const issues = [], links = new Map(), titles = new Map(), descs = new Map();
const I = (p, m) => issues.push(`${p}: ${m}`);
const pick = (h, re) => (h.match(re) || [])[1];
for (const p of pages) {
  const r = await get(p);
  if (r.status !== 200) { I(p, 'status ' + r.status); continue; }
  const h = r.text;
  const head = h.slice(0, h.indexOf('</head>'));
  const title = pick(head, /<title>([^<]*)<\/title>/), desc = pick(head, /<meta name="description" content="([^"]*)"/);
  const canon = pick(head, /<link rel="canonical" href="([^"]*)"/), robots = pick(head, /<meta name="robots" content="([^"]*)"/);
  const ogImg = pick(head, /<meta property="og:image" content="([^"]*)"/), ogT = pick(head, /<meta property="og:title" content="([^"]*)"/);
  if (!title) I(p, 'no title'); else { if (titles.has(title)) I(p, 'dup title with ' + titles.get(title)); titles.set(title, p); }
  if (!desc) I(p, 'no description'); else { if (descs.has(desc)) I(p, 'dup desc with ' + descs.get(desc)); descs.set(desc, p); if (desc.length > 170) I(p, 'desc ' + desc.length); }
  if (canon !== SITE + (p === '/' ? '/' : p)) I(p, 'canonical ' + canon);
  if (!/^index/.test(robots || '')) I(p, 'robots ' + robots);
  if (!ogImg || !ogT) I(p, 'missing og'); else links.set(ogImg.replace(SITE, ''), p);
  const h1s = (h.match(/<h1[\s>]/g) || []).length; if (h1s !== 1) I(p, `${h1s} h1 in SSR`);
  // JSON-LD
  for (const m of h.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    let j; try { j = JSON.parse(m[1]); } catch { I(p, 'invalid JSON-LD'); continue; }
    const nodes = j['@graph'] || [j];
    for (const n of nodes) {
      const t = [].concat(n['@type'])[0];
      if (!t) I(p, 'LD node without @type');
      if (t === 'FAQPage') { if (!n.mainEntity?.length) I(p, 'empty FAQPage'); for (const q of n.mainEntity || []) if (!q.name || !q.acceptedAnswer?.text) I(p, 'bad FAQ item'); }
      if (t === 'BreadcrumbList') n.itemListElement.forEach((e, i) => { if (e.position !== i + 1 || !e.name || (!e.item && i < n.itemListElement.length - 1)) I(p, 'bad breadcrumb'); if (e.item) links.set(String(e.item).replace(SITE, '') || '/', p); });
      if (t === 'LocalBusiness') { if (!n.name || !n.address?.addressRegion) I(p, 'LocalBusiness missing name/address');
        for (const o of n.makesOffer || []) { if (!o.itemOffered?.name) I(p, 'offer without item'); if (o.price != null && !(typeof o.price === 'number' && o.price > 0)) I(p, 'bad offer price'); }
        for (const u of n.sameAs || []) if (!/^https?:\/\//.test(u)) I(p, "bad sameAs " + u);
        for (const u of [].concat(n.image || [])) links.set(u.replace(SITE, ''), p); }
      if (t === 'ItemList') for (const e of n.itemListElement || []) links.set(String(e.url || e.item?.url || e.item || '').replace(SITE, ''), p);
    }
  }
  // links + images in the server-rendered HTML
  for (const m of h.matchAll(/<(?:a|link)\s[^>]*href="([^"#]+)"/g)) { const u = m[1]; if (u.startsWith('/') && !u.startsWith('//')) links.set(u, p); }
  for (const m of h.matchAll(/<img\s[^>]*src="([^"]+)"/g)) if (m[1].startsWith('/')) links.set(m[1], p);
  for (const m of h.matchAll(/<img\s(?![^>]*alt=)[^>]*>/g)) I(p, 'img without alt');
  // markdown twin
  if (/^\/(charters|fishing-charters)\/./.test(p)) { const md = await get(p + '.md'); if (md.status !== 200 || !/markdown/.test(md.type)) I(p, '.md ' + md.status); else for (const mm of md.text.matchAll(/\]\((https:\/\/hookedtrips\.com[^)]*)\)/g)) links.set(mm[1].replace(SITE, '') || '/', p + '.md'); }
}
// llms files
for (const f of ['/llms.txt', '/llms-full.txt', '/robots.txt']) { const r = await get(f); if (r.status !== 200) I(f, 'status ' + r.status); else for (const mm of r.text.matchAll(/\]\((https:\/\/hookedtrips\.com[^)]*)\)/g)) links.set(mm[1].replace(SITE, '') || '/', f); }
// check every internal link once
let checked = 0;
for (const [u, from] of links) {
  if (!u || /^\/(admin|_dev)/.test(u)) continue;
  const r = await get(u.split('#')[0], 'GET'); checked++;
  if (r.status !== 200) I(from, `link ${u} -> ${r.status}${r.loc ? ' ' + r.loc : ''}`);
}
// trailing slash + 404 behaviour
const ts = await get('/fishing-charters/sydney/'); if (ts.status !== 301) I('/fishing-charters/sydney/', 'trailing slash ' + ts.status);
const nf = await get('/charters/not-a-real-one'); if (nf.status !== 404) I('404', 'unknown charter ' + nf.status);
const nl = await get('/fishing-charters/katherine'); if (nl.status !== 404) I('404', 'empty destination ' + nl.status);
console.log(`${pages.length} sitemap pages, ${checked} unique internal links/images checked`);
console.log(issues.length ? issues.join('\n') : 'NO ISSUES');
