// Cloudflare Worker — pre-populates <head> meta for charter and location
// pages so crawlers see correct title / description / canonical / JSON-LD
// in the raw HTML response, without waiting for React to boot.
//
// Charter pages: operator data is parsed at request time from the operator
// records embedded in index.html — a single source of truth, so the meta
// never goes stale when the listing data changes. All active operators are
// covered automatically.
// Location pages: 3 state landing pages (pilot).
// Pass-through for all other requests (SPA fallback handles them).

const BASE = 'https://hookedtrips.com';

// ── State location pages ─────────────────────────────────────────────────────
const LOCATIONS = {
  'new-south-wales': { name: 'New South Wales', state: 'NSW', count: 19 },
  'queensland':      { name: 'Queensland',       state: 'QLD', count: 26 },
  'northern-territory': { name: 'Northern Territory', state: 'NT', count: 12 },
};

const STATE_NAMES = {
  NSW: 'New South Wales', QLD: 'Queensland', NT: 'Northern Territory',
  VIC: 'Victoria', WA: 'Western Australia', SA: 'South Australia', TAS: 'Tasmania',
};

// ── HTML attribute escaping ──────────────────────────────────────────────────
function esc(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ── Decode a JS double-quoted string literal captured from the bundle ────────
// The operator records are minified JS object literals, so a captured value
// may contain escaped sequences (e.g. \", \\, —). Turn them into text.
function decodeJsString(s) {
  if (!s) return '';
  return s.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
          .replace(/\\n/g, ' ')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\')
          .replace(/\\\//g, '/');
}

// ── Parse a single operator record out of the index.html bundle ──────────────
// Records look like: id:"op-003",slug:"fishabout-tours-sydney",name:"…",…
// Returns null when the slug is not present (lets the request fall through).
function parseOperator(html, slug) {
  // Each slug appears twice in the bundle: once in the listing card data
  // ({name:…,slug:…,…}) and once in the full operator record
  // (id:"op-NNN",slug:"…",name:…). Anchor on the full record.
  const safe = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = html.match(new RegExp(`id:"op-\\d+",slug:"${safe}"`));
  if (!m) return null;

  const recStart = m.index;
  // Bound the record by the next operator entry so optional fields (rating)
  // can't bleed in from the following record.
  const nextStart = html.indexOf('id:"op-', recStart + m[0].length);
  const recEnd = nextStart > 0 ? nextStart : recStart + 9000;
  const rec = html.slice(recStart, recEnd);

  const str = (field) => {
    const m = rec.match(new RegExp(field + ':"((?:\\\\.|[^"\\\\])*)"'));
    return m ? decodeJsString(m[1]) : '';
  };

  // Only active operators get prerendered meta.
  const statusM = rec.match(/status:"([^"]+)"/);
  if (statusM && statusM[1] !== 'active') return null;

  const op = {
    name: str('name'),
    loc:  str('primary_location'),
    state: (rec.match(/state:"([^"]+)"/) || [])[1] || '',
    desc: str('description'),
    rating: null,
    rc: 0,
  };

  // Operator-level aggregate rating is always emitted as rating:X,review_count:Y
  const rm = rec.match(/rating:([\d.]+),review_count:(\d+)/);
  if (rm) {
    op.rating = parseFloat(rm[1]);
    op.rc = parseInt(rm[2], 10);
  }

  if (!op.name) return null;
  return op;
}

// ── Patch the static index.html head for a specific page ────────────────────
function patchHead(html, { title, desc, canonical, ldJson }) {
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  html = html.replace(/<meta name="description"[^>]*\/>/, `<meta name="description" content="${esc(desc)}"/>`);
  html = html.replace(/<link rel="canonical"[^>]*\/>/, `<link rel="canonical" href="${canonical}"/>`);
  html = html.replace(/<meta property="og:title"[^>]*\/>/, `<meta property="og:title" content="${esc(title)}"/>`);
  html = html.replace(/<meta property="og:description"[^>]*\/>/, `<meta property="og:description" content="${esc(desc)}"/>`);
  html = html.replace(/<meta property="og:url"[^>]*\/>/, `<meta property="og:url" content="${canonical}"/>`);
  html = html.replace(/<meta name="twitter:title"[^>]*\/>/, `<meta name="twitter:title" content="${esc(title)}"/>`);
  html = html.replace(/<meta name="twitter:description"[^>]*\/>/, `<meta name="twitter:description" content="${esc(desc)}"/>`);
  // Inject page-specific LD just before </head> (keeps the existing site-level LD intact)
  html = html.replace('</head>', `<script type="application/ld+json">${ldJson}</script>\n</head>`);
  return html;
}

// ── Main fetch handler ───────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    const charterMatch = path.match(/^\/charters\/([^/]+)$/);
    const locationMatch = path.match(/^\/fishing-charters\/([^/]+)$/);

    const opSlug  = charterMatch?.[1];
    const locSlug = locationMatch?.[1];

    const loc = locSlug ? LOCATIONS[locSlug] : null;

    // Not a charter detail page and not a known location page — let Assets
    // serve it (includes SPA fallback).
    if (!opSlug && !loc) {
      return env.ASSETS.fetch(request);
    }

    // Fetch the base index.html
    const homeReq  = new Request(`${url.origin}/`, { method: 'GET' });
    const homeResp = await env.ASSETS.fetch(homeReq);
    let html = await homeResp.text();

    // Resolve the operator from the live bundle data (all active operators).
    const op = opSlug ? parseOperator(html, opSlug) : null;

    // Charter slug that isn't a real operator — hand back to the SPA.
    if (opSlug && !op) {
      return env.ASSETS.fetch(request);
    }

    let meta;

    if (op) {
      const canonical = `${BASE}/charters/${opSlug}`;
      const title     = `${op.name} | ${op.loc} Fishing Charters | Hooked Trips`;
      const desc      = op.desc.slice(0, 155);

      const biz = {
        '@type': 'LocalBusiness',
        '@id':   `${canonical}#biz`,
        name:        op.name,
        description: op.desc.slice(0, 300),
        url:         canonical,
        address: {
          '@type':        'PostalAddress',
          addressRegion:  STATE_NAMES[op.state] || op.state,
          addressCountry: 'AU',
        },
      };
      if (op.rating) {
        biz.aggregateRating = {
          '@type':      'AggregateRating',
          ratingValue:  op.rating,
          reviewCount:  op.rc,
          bestRating:   5,
          worstRating:  1,
        };
      }

      meta = {
        title,
        desc,
        canonical,
        ldJson: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            biz,
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home',              item: `${BASE}/` },
                { '@type': 'ListItem', position: 2, name: 'Fishing Charters',  item: `${BASE}/charters` },
                { '@type': 'ListItem', position: 3, name: op.name,             item: canonical },
              ],
            },
          ],
        }),
      };
    } else {
      const canonical = `${BASE}/fishing-charters/${locSlug}`;
      const title     = `Fishing Charters in ${loc.name} | Compare & Book | Hooked Trips`;
      const desc      = `Compare and book the best fishing charters in ${loc.name}. Browse ${loc.count} operators by species, trip type and experience level — then book direct.`;

      meta = {
        title,
        desc,
        canonical,
        ldJson: JSON.stringify({
          '@context': 'https://schema.org',
          '@type':    'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home',             item: `${BASE}/` },
            { '@type': 'ListItem', position: 2, name: 'Fishing Charters', item: `${BASE}/charters` },
            { '@type': 'ListItem', position: 3, name: loc.name,           item: canonical },
          ],
        }),
      };
    }

    html = patchHead(html, meta);

    return new Response(html, {
      status: 200,
      headers: {
        'content-type':  'text/html;charset=UTF-8',
        'cache-control': 'public, max-age=3600',
        'x-prerendered': '1',  // visible in DevTools — confirms Worker is running
      },
    });
  },
};
