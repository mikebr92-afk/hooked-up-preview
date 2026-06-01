// Cloudflare Worker — pre-populates <head> meta for charter and location
// pages so crawlers see correct title / description / canonical / JSON-LD
// in the raw HTML response, without waiting for React to boot.
//
// Pilot: 4 charter pages + 3 state location pages.
// Pass-through for all other requests (SPA fallback handles them).

const BASE = 'https://hookedtrips.com';

// ── Pilot charter operators ──────────────────────────────────────────────────
const OPERATORS = {
  'fishabout-tours-sydney': {
    name: 'Fishabout Tours',
    loc: 'Sydney Harbour, NSW',
    state: 'NSW',
    desc: "Craig McGill established Sydney Harbour's first ever guided fishing service back in 1992. With over 45 years on the water, Craig and his team offer small-group private fishing sessions on Sydney Harbour targeting Kingfish, Jewfish, Snapper, Flathead and Mahi Mahi.",
    rating: 4.9,
    rc: 112,
  },
  'top-shot-charters-cairns': {
    name: 'Top Shot Charters',
    loc: 'Cairns',
    state: 'QLD',
    desc: "Top Shot Charters is one of Cairns most respected game and reef fishing operations. Running from Cairns Marlin Marina, they offer black marlin game fishing during the October to December season and light-tackle reef trips year-round targeting coral trout, GT and Spanish mackerel.",
    rating: null,
    rc: 0,
  },
  'barra-private-tours-darwin': {
    name: 'Barra Private Tours',
    loc: 'Darwin',
    state: 'NT',
    desc: "Barra Private Tours is one of Darwin's most highly-rated charters, offering tailored private trips for individuals, families and corporate groups. Trips prioritise barramundi when conditions allow, with reef fishing for coral trout and golden trevally as the saltwater alternative.",
    rating: null,
    rc: 0,
  },
  'hooker-1-fishing-charters-gold-coast': {
    name: 'Hooker 1 Fishing Charters',
    loc: 'Gold Coast',
    state: 'QLD',
    desc: "Hooker 1 Fishing Charters operates one of the Gold Coast's largest charter vessels — a 41-foot Steber flybridge with room for up to 17 guests, fitted with downriggers, outriggers and a stocked livewell, targeting snapper, pearl perch and marlin.",
    rating: null,
    rc: 0,
  },
};

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

    const op  = opSlug  ? OPERATORS[opSlug]  : null;
    const loc = locSlug ? LOCATIONS[locSlug] : null;

    // No special handling needed — let Assets serve it (includes SPA fallback)
    if (!op && !loc) {
      return env.ASSETS.fetch(request);
    }

    // Fetch the base index.html
    const homeReq  = new Request(`${url.origin}/`, { method: 'GET' });
    const homeResp = await env.ASSETS.fetch(homeReq);
    let html = await homeResp.text();

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
