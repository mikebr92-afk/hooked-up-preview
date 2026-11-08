// Tell IndexNow search engines (Bing — which also feeds ChatGPT search and Copilot — Yandex, Seznam, Naver)
// which pages changed, so they recrawl them within hours instead of weeks.
// Usage: node scripts/listings/indexnow.mjs [--since YYYY-MM-DD | --all] [--dry]
//   default: pages whose sitemap <lastmod> is on/after yesterday (UTC), plus the home page and llms.txt.
// The key file /6b9f7a7429abfafb1c33ad4783f16fa0.txt is served from the site root (it must stay public).
const SITE = 'https://hookedtrips.com';
const KEY = '6b9f7a7429abfafb1c33ad4783f16fa0';
const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const ALL = args.includes('--all');
const si = args.indexOf('--since');
const since = si >= 0 ? args[si + 1] : new Date(Date.now() - 864e5).toISOString().slice(0, 10);

const keyRes = await fetch(`${SITE}/${KEY}.txt`);
const keyTxt = keyRes.ok ? (await keyRes.text()).trim() : '';
if (keyTxt !== KEY) { console.error(`key file not live yet (HTTP ${keyRes.status})`); process.exit(1); }

const xml = await (await fetch(`${SITE}/sitemap.xml`)).text();
const entries = [...xml.matchAll(/<loc>([^<]+)<\/loc>(?:<lastmod>([^<]+)<\/lastmod>)?/g)].map((m) => ({ url: m[1], lastmod: m[2] || '' }));
const urls = new Set([SITE + '/', SITE + '/llms.txt']);
for (const e of entries) if (ALL || (e.lastmod && e.lastmod >= since)) urls.add(e.url);
const urlList = [...urls].slice(0, 10000);
console.log(`${entries.length} URLs in sitemap; submitting ${urlList.length} ${ALL ? '(all)' : `changed since ${since}`}`);
if (DRY) { console.log(urlList.join('\n')); process.exit(0); }

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: 'hookedtrips.com', key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList }),
});
console.log(`IndexNow: HTTP ${res.status} ${res.statusText}`, (await res.text()).slice(0, 300));
// 200 = accepted, 202 = accepted (key validation pending). Anything else is a failure.
process.exit(res.status === 200 || res.status === 202 ? 0 : 1);
