// Shared SEO helpers and location-page content for Hooked Trips.
//
// Imported by BOTH:
//   - the app bundle in index.html (in the browser, via import "/site-seo.js"), and
//   - worker.js (Cloudflare Worker, bundled by wrangler),
// so page titles, descriptions, canonicals and structured data are identical in
// the raw HTML that crawlers see and in the page after the app has rendered.
//
// Keep this file free of browser-only or Worker-only APIs (except applyMeta,
// which is a no-op outside the browser).

export const SITE = 'https://hookedtrips.com';
export const BRAND = 'Hooked Trips';
export const DEFAULT_IMAGE = { url: SITE + '/images/og-default.jpg', width: 1200, height: 630, alt: 'Angler hooked up to a marlin at sunrise — Hooked Trips' };
export const ROBOTS_INDEX = 'index, follow, max-image-preview:large';
export const ROBOTS_NOINDEX = 'noindex, follow';

export const STATE_NAMES = {
  NSW: 'New South Wales', QLD: 'Queensland', NT: 'Northern Territory', VIC: 'Victoria',
  WA: 'Western Australia', SA: 'South Australia', TAS: 'Tasmania', ACT: 'Australian Capital Territory',
};

// ── Location landing pages (/fishing-charters/<key>) ─────────────────────────
// n: display name · short: label used in titles/links · in: phrase after "Fishing Charters"
// st: match operators by state · c: match operators whose listing location contains any of these
// state: which licence answer applies · intro: guide paragraphs · season: best-time answer
export const LOCS = {
  'new-south-wales': {
    n: 'New South Wales', short: 'NSW', in: 'in New South Wales', st: 'NSW', state: 'NSW',
    intro: [
      "New South Wales has some of the most varied charter fishing in Australia. Within a short drive of Sydney you can chase yellowtail kingfish around harbour headlands, drift offshore reefs for snapper, or head out to the continental shelf for marlin, tuna and mahi mahi when the warm currents arrive.",
      "Charters on Hooked Trips run from Sydney Harbour, Manly and Cronulla, north to Port Stephens, Coffs Harbour and South West Rocks, and south to Wollongong and Jervis Bay. Half-day harbour and estuary trips suit families and first-timers, while full-day offshore and game-fishing charters are built for experienced anglers.",
    ],
    season: "Snapper fishing is generally best through the cooler months, roughly April to September. Summer and early autumn (about December to May) is game-fishing season, when warm water brings marlin, mahi mahi and tuna within reach of NSW ports. Kingfish are caught year-round, with the best surface action in the warmer months.",
  },
  'queensland': {
    n: 'Queensland', short: 'Queensland', in: 'in Queensland', st: 'QLD', state: 'QLD',
    intro: [
      "Queensland stretches from the subtropical Gold Coast to the tip of Cape York, and the fishing changes as you head north. Southern charters target snapper, pearl perch and seasonal pelagics like mahi mahi and Spanish mackerel. Further north, the Great Barrier Reef brings coral trout, red emperor, nannygai and giant trevally, while rivers and estuaries hold barramundi and mangrove jack.",
      "Listings cover the Gold Coast, Brisbane and Moreton Bay, the Sunshine Coast, Hervey Bay, Bundaberg, Agnes Water, Yeppoon, Gladstone, the Whitsundays, Townsville, Cairns, Port Douglas and Cooktown.",
    ],
    season: "Reef fishing runs year-round, with calmer seas more common from late winter through spring. Cairns is famous for giant black marlin from roughly September to December. Barramundi have a closed season on Queensland's east coast from 1 November to 1 February (some stocked dams excepted), so check with your operator about what's on offer in that window.",
  },
  'northern-territory': {
    n: 'Northern Territory', short: 'NT', in: 'in the Northern Territory', st: 'NT', state: 'NT',
    intro: [
      "The Northern Territory is Australia's barramundi capital. Charters out of Darwin and into the Top End's rivers, floodplains and wilderness areas — the Mary, Daly and Wildman rivers, Kakadu, Arnhem Land and the Cobourg Peninsula — chase barra alongside saratoga, threadfin salmon and mangrove jack.",
      "Offshore and harbour trips target Spanish mackerel, giant trevally, golden trevally, longtail tuna and sailfish. Many operators run private trips only, so your group has the boat and the guide to itself.",
    ],
    season: "The Top End has three key periods. The run-off after the wet season (roughly March to May) is prime barramundi time as fish move through flooded creeks and floodplains. The dry season (May to September) brings stable weather that suits offshore and reef trips. The build-up (October to December) is hot and humid but can produce big barra on lures.",
  },
  'sydney': {
    n: 'Sydney', short: 'Sydney', in: 'in Sydney', c: ['sydney', 'cronulla', 'manly'], state: 'NSW',
    intro: [
      "Sydney is one of the few big cities in the world where you can catch kingfish, jewfish (mulloway) and snapper within sight of the Opera House. Harbour charters work the headlands, bays and structure of Port Jackson and Middle Harbour, while offshore boats head to the reefs off Sydney Heads and Cronulla for snapper, kingfish, mahi mahi and tuna — and marlin in summer.",
      "Charters depart from all over the city, including Rozelle, Balmain, Manly, Sydney Harbour and Cronulla. Half-day harbour trips are a great option for families and beginners, while full-day offshore charters suit experienced anglers.",
    ],
    season: "Kingfish are caught year-round, with the best surface action in the warmer months. Snapper fire up on the offshore reefs through the cooler months, roughly April to September. From around December to April, warm water brings mahi mahi to the fish aggregating devices (FADs) offshore and marlin to the continental shelf.",
    faq: [
      ["Is a Sydney Harbour fishing charter good for beginners?", "Yes. Harbour trips stay in sheltered water, operators supply rods, tackle and bait, and many trips are run as private charters, so the skipper can tailor the day to your group's experience."],
    ],
  },
  'cairns': {
    n: 'Cairns', short: 'Cairns', in: 'in Cairns', c: ['cairns'], state: 'QLD',
    intro: [
      "Cairns is the gateway to some of the best fishing on the Great Barrier Reef. Reef charters target coral trout, red emperor, nannygai and giant trevally, while out on the Ribbon Reefs and the edge of the Coral Sea, Cairns is known worldwide for giant black marlin.",
      "Closer to town, Trinity Inlet and the surrounding rivers and estuaries hold barramundi, mangrove jack and fingermark — ideal for half-day or family trips when it's too windy to head out to the reef.",
    ],
    season: "Reef fishing is good year-round, although winter trade winds can make offshore trips bumpy. The heavy-tackle black marlin season runs roughly September to December. Barramundi have a closed season on Queensland's east coast from 1 November to 1 February.",
  },
  'darwin': {
    n: 'Darwin', short: 'Darwin', in: 'in Darwin', c: ['darwin'], state: 'NT',
    intro: [
      "Darwin puts you within reach of both world-class barramundi water and productive offshore reefs. Harbour and estuary charters fish the creeks and mangroves around Darwin Harbour for barra, mangrove jack and threadfin salmon, while bluewater trips head offshore for Spanish mackerel, giant trevally, golden trevally, longtail tuna and sailfish.",
      "Several Darwin operators also run day trips and guided safaris out to the floodplains and rivers of the Top End.",
    ],
    season: "The run-off after the wet season (roughly March to May) is prime barramundi time. The dry season (May to September) brings settled weather that suits offshore and reef fishing, and the build-up (October to December) can produce big barra on lures.",
  },
  'gold-coast': {
    n: 'Gold Coast', short: 'Gold Coast', in: 'on the Gold Coast', c: ['gold coast'], state: 'QLD',
    intro: [
      "The Gold Coast combines quick offshore access through the Gold Coast Seaway with reliable reef and pelagic fishing. Charters target snapper and pearl perch on the inshore and wider reefs, while the warmer months bring mahi mahi, cobia, Spanish mackerel and marlin.",
      "The Broadwater and nearby rivers offer calmer half-day options for flathead, bream and mangrove jack — a good choice for families or when the bar is rough.",
    ],
    season: "Snapper are at their best through the cooler months, roughly May to September. From late spring to autumn (about November to April), warm currents bring mahi mahi, wahoo, cobia and marlin within reach.",
  },
  'port-stephens': {
    n: 'Port Stephens', short: 'Port Stephens', in: 'in Port Stephens', c: ['port stephens', 'nelson bay'], state: 'NSW',
    intro: [
      "Port Stephens, just north of Newcastle, is one of the best-known game-fishing ports on the east coast. Charters out of Nelson Bay target marlin on the continental shelf in summer and autumn, plus yellowtail kingfish, snapper and tuna around the offshore islands and reefs.",
      "Inside the port itself there's sheltered fishing for flathead, bream and snapper, making it a good spot for mixed groups and shorter trips.",
    ],
    season: "Marlin season generally runs from around December to May, peaking from February to April. Kingfish are strongest from spring to autumn, snapper are caught year-round, and bluefin tuna can show up in winter (around May to August).",
  },
  'sunshine-coast': {
    n: 'Sunshine Coast', short: 'Sunshine Coast', in: 'on the Sunshine Coast', c: ['sunshine coast', 'noosa', 'mooloolaba'], state: 'QLD',
    intro: [
      "The Sunshine Coast offers offshore reef fishing out of Mooloolaba and calmer river and estuary trips around Noosa. Offshore charters fish reefs such as the Barwon Banks for snapper, pearl perch, coral trout and Spanish mackerel.",
      "The Noosa River and its lakes hold flathead, bream and mangrove jack, and are a relaxed option for families or anyone who'd rather avoid the open ocean.",
    ],
    season: "Snapper and pearl perch are reliable through the cooler months, while late spring to autumn (about October to April) brings Spanish mackerel, mahi mahi and wahoo.",
  },
  'wollongong': {
    n: 'Wollongong', short: 'Wollongong', in: 'in Wollongong', c: ['wollongong', 'illawarra'], state: 'NSW',
    intro: [
      "Wollongong and the Illawarra coast offer quick access to deep water south of Sydney. Charters fish the Five Islands and nearby reefs for snapper, kingfish, morwong and flathead.",
      "In summer, boats head wide to the continental shelf for marlin, mahi mahi and tuna — a less crowded alternative to the bigger game-fishing ports.",
    ],
    season: "Snapper are caught year-round, with a peak in the cooler months. Kingfish are best from spring to autumn, and the game-fishing season for marlin and mahi mahi generally runs from December to April.",
  },

  // ── Species / style collections (kind: 'species') ──────────────────────────
  // sp: match operators whose species tags contain any of these · tt: match trip-type tags
  'barramundi': {
    kind: 'species', n: 'Barramundi', short: 'Barramundi', h1: 'Barramundi Fishing Charters', in: 'for barramundi', noun: 'barramundi charter',
    sp: ['barramundi'],
    intro: [
      "Barramundi are Australia's most iconic sportfish — famous for explosive strikes on lures, head-shaking jumps and growing well over a metre long. A guided barra trip is on the bucket list of most Australian anglers.",
      "Most barramundi charters on Hooked Trips run out of Darwin and the Top End, fishing rivers, floodplains and wilderness areas like the Mary, Daly and Wildman rivers, Kakadu and Arnhem Land. There are also barra trips in Far North Queensland around Cairns and the Daintree.",
    ],
    season: "In the Top End, the run-off after the wet season (roughly March to May) is the classic barra window, as fish push through flooded creeks and floodplains. The build-up (October to December) is hot and humid but can produce big fish on lures. On Queensland's east coast, barramundi have a closed season from 1 November to 1 February.",
    faq: [
      ["Do barramundi charters keep the fish?", "Possession and size limits apply in both the Northern Territory and Queensland, and many guides encourage releasing big breeding fish. Your guide will know the current rules for the waters you're fishing."],
    ],
  },
  'marlin': {
    kind: 'species', n: 'Marlin', short: 'Marlin', h1: 'Marlin Fishing Charters', in: 'for marlin', noun: 'marlin charter',
    sp: ['marlin'],
    intro: [
      "Australia has some of the best marlin fishing in the world. Cairns is famous for giant black marlin on the Ribbon Reefs, while along the NSW coast — Port Stephens, Sydney and Wollongong — game boats target striped, black and blue marlin on the continental shelf.",
      "Marlin charters are usually private, full-day game-fishing trips on purpose-built sportfishing boats with outriggers and fighting chairs. Most operators tag and release the marlin their clients catch.",
    ],
    season: "Out of Cairns, the heavy-tackle black marlin season runs roughly September to December. Along the NSW and southern Queensland coast, marlin season generally runs from around December to May, depending on when the warm currents push in.",
    faq: [
      ["Are marlin released?", "Almost always. Charter operators generally tag and release marlin, and many contribute to research tagging programs that track their migrations."],
    ],
  },
  'kingfish': {
    kind: 'species', n: 'Kingfish', short: 'Kingfish', h1: 'Kingfish Fishing Charters', in: 'for kingfish', noun: 'kingfish charter',
    sp: ['kingfish'],
    intro: [
      "Yellowtail kingfish are one of the hardest-pulling fish in Australian waters and a staple of NSW charter fishing. Hooked on light gear around structure, a big 'kingie' will test any angler.",
      "Charters target kingfish around Sydney's headlands and harbour, on the offshore reefs off Cronulla and Wollongong, and around the islands off Port Stephens — using live bait, jigs and topwater lures.",
    ],
    season: "Kingfish are caught year-round in NSW, with the most consistent surface action from late spring to autumn (roughly October to May).",
    faq: [
      ["Do I need my own tackle for kingfish?", "No. Operators supply rods, reels and tackle matched to the fish they're targeting. Kingfish are powerful, so expect heavier gear on offshore trips."],
    ],
  },
  'snapper': {
    kind: 'species', n: 'Snapper', short: 'Snapper', h1: 'Snapper Fishing Charters', in: 'for snapper', noun: 'snapper charter',
    sp: ['snapper'],
    intro: [
      "Snapper are a favourite on reef charters along the east coast — great fun to catch and excellent eating. Big 'reds' are among the most prized catches for Australian anglers.",
      "Operators on Hooked Trips target snapper on the inshore and offshore reefs from Sydney and the NSW coast up through the Gold Coast, Sunshine Coast and Hervey Bay.",
    ],
    season: "Snapper are caught year-round, but the cooler months (roughly May to September) are usually best, when bigger fish move onto the inshore reefs.",
    faq: [
      ["Can I keep the snapper I catch?", "Usually, yes — within the size and bag limits for the state you're fishing in. Many operators also clean and fillet your catch at the end of the trip."],
    ],
  },
  'reef-fishing': {
    kind: 'species', n: 'Reef Fishing', short: 'Reef Fishing', h1: 'Reef Fishing Charters', in: 'for reef fishing', noun: 'reef fishing charter',
    tt: ['reef fishing', 'great barrier reef'],
    intro: [
      "Reef fishing charters are the most popular trips on Hooked Trips. In the tropics, the Great Barrier Reef serves up coral trout, red emperor, nannygai and sweetlip; further south, the rocky reefs of NSW and southern Queensland hold snapper, pearl perch, kingfish and flathead.",
      "Most reef trips bottom-fish with bait or soft plastics, so they suit mixed groups, families and first-timers as well as experienced anglers — and the catch is usually excellent eating.",
    ],
    season: "Reef fishing runs year-round. In the tropics, calmer seas are more common from late winter through spring; further south, the cooler months are prime time for snapper.",
    faq: [
      ["Is reef fishing good for beginners?", "Yes. It's the easiest style of fishing to pick up — the crew handle the rigging and show you what to do, and there's usually plenty of action."],
    ],
  },
};

export const STATE_KEYS = ['new-south-wales', 'queensland', 'northern-territory'];
export const CITY_KEYS = ['sydney', 'gold-coast', 'cairns', 'darwin', 'port-stephens', 'sunshine-coast', 'wollongong'];
export const SPECIES_KEYS = Object.keys(LOCS).filter((k) => LOCS[k].kind === 'species');
export const isSpecies = (L) => L && L.kind === 'species';
export const locH1 = (L) => L.h1 || `Fishing Charters ${L.in}`;

const LICENCE = {
  NSW: ["Do I need a fishing licence on a charter in NSW?", "No. Anglers fishing from a boat that holds a NSW charter fishing boat licence are covered by the operator's licence, so you don't need to pay the NSW recreational fishing fee for the trip. You'll need your own licence if you fish from the shore or a private boat."],
  QLD: ["Do I need a fishing licence in Queensland?", "No. Queensland doesn't require a general recreational fishing licence for saltwater fishing, so you won't need one for a reef, offshore or estuary charter. A Stocked Impoundment Permit is only needed for certain freshwater dams. Size and bag limits still apply."],
  NT: ["Do I need a fishing licence in the Northern Territory?", "No. The NT doesn't require a recreational fishing licence. Possession and size limits apply (including for barramundi), and some areas — such as parts of Arnhem Land and other Aboriginal land and waters — need access permits, so check with your operator."],
};

// ── small utils ──────────────────────────────────────────────────────────────
export const money = (v) => '$' + Number(v).toLocaleString('en-AU');
export function list(a) {
  a = a.filter(Boolean);
  return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
}
const plural = (n, one, many) => (n === 1 ? one : many);
const unitText = (u) => (/person/.test(u) ? 'per person' : 'per group');
const clip = (s, n) => {
  s = (s || '').replace(/\s+/g, ' ').trim();
  if (s.length <= n) return s;
  const cut = s.slice(0, n - 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:—–-]$/, '') + '…';
};

// ── location matching + stats ────────────────────────────────────────────────
export function inLoc(card, L) {
  if (L.sp) {
    const tags = [...(card.species_tags || []), ...(card.species || [])].map((s) => s.toLowerCase());
    return L.sp.some((x) => tags.some((t) => t.includes(x)));
  }
  if (L.tt) {
    const tags = (card.trip_type_tags || []).map((s) => s.toLowerCase());
    return L.tt.some((x) => tags.includes(x));
  }
  if (L.st) return card.state === L.st;
  const loc = (card.location || '').toLowerCase();
  return (L.c || []).some((x) => loc.includes(x));
}
export const activeCards = (cards) => cards.filter((c) => c.status === 'active');
// Listings with real photos first (stable otherwise) — completeness/photo quality drives ranking.
export const photoFirst = (cards) => cards.map((c, i) => [c, i]).sort((a, b) => (!!b[0].image - !!a[0].image) || a[1] - b[1]).map(([c]) => c);
export const locItems = (cards, L) => photoFirst(activeCards(cards).filter((c) => inLoc(c, L)));

// Best-matching location page for an operator card: a city page first, else its state page.
export function locFor(card) {
  const entries = Object.entries(LOCS).filter(([, L]) => !isSpecies(L));
  return entries.find(([, L]) => !L.st && inLoc(card, L)) || entries.find(([, L]) => L.st && inLoc(card, L)) || null;
}

export function locStats(items) {
  const counts = new Map();
  for (const c of items) for (const s of c.species || []) counts.set(s, (counts.get(s) || 0) + 1);
  const species = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([s]) => s);
  const priced = items.filter((c) => c.price > 0);
  const per = priced.filter((c) => /person/.test(c.priceUnit)).map((c) => c.price);
  const grp = priced.filter((c) => !/person/.test(c.priceUnit)).map((c) => c.price);
  return {
    count: items.length,
    species,
    minPerson: per.length ? Math.min(...per) : null,
    minGroup: grp.length ? Math.min(...grp) : null,
  };
}

// Short form for meta descriptions: "Shared trips from $180 per person, private charters from $650 per group."
function priceSentence(st) {
  const parts = [];
  if (st.minPerson) parts.push(`shared trips from ${money(st.minPerson)} per person`);
  if (st.minGroup) parts.push(`private charters from ${money(st.minGroup)} per group`);
  if (!parts.length) return '';
  const s = parts.join(', ');
  return s.charAt(0).toUpperCase() + s.slice(1) + '.';
}
// Full sentence for the FAQ answer.
function priceClause(st) {
  if (st.minPerson && st.minGroup) return `shared trips start from ${money(st.minPerson)} per person and private charters from ${money(st.minGroup)} per group`;
  if (st.minPerson) return `trips start from ${money(st.minPerson)} per person`;
  if (st.minGroup) return `private charters start from ${money(st.minGroup)} per group`;
  return '';
}

// ── page meta builders ───────────────────────────────────────────────────────
// Every builder returns { title, desc, path, robots, image, ld } — consumed by
// applyMeta() in the browser and by the Worker when it writes the <head>.

function crumbs(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE + path })),
  };
}
function itemList(cards) {
  return {
    '@type': 'ItemList',
    numberOfItems: cards.length,
    itemListElement: cards.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, url: SITE + '/charters/' + c.slug })),
  };
}

const LICENCE_ANY = ["Do I need a fishing licence on a charter?", "It depends on the state. In NSW, anglers on a licensed charter boat are covered by the operator's licence. Queensland and the Northern Territory don't require a recreational fishing licence for saltwater fishing. Size and bag limits apply everywhere."];

// Where a species collection's operators are, as [[label, count], …] using the city/state pages.
function placesOf(items) {
  const m = new Map();
  for (const c of items) {
    const lf = locFor(c);
    const city = lf && !lf[1].st;
    const label = city ? lf[1].n : `elsewhere in ${STATE_NAMES[c.state] === 'Northern Territory' ? 'the Northern Territory' : STATE_NAMES[c.state] || c.state}`;
    m.set(label, (m.get(label) || 0) + 1);
  }
  // cities first (largest first), then the "elsewhere in …" groups
  return [...m.entries()].sort((a, b) => (a[0].startsWith('elsewhere') - b[0].startsWith('elsewhere')) || b[1] - a[1]);
}

function speciesGuide(L, items) {
  const st = locStats(items);
  const faq = [];
  const p = priceClause(st);
  if (p) faq.push([`How much does a ${L.noun} cost?`, `Across the ${st.count} ${L.noun}s listed on Hooked Trips, ${p}. Prices depend on trip length, boat size and location, so check each operator's trips for exact pricing.`]);
  const where = placesOf(items);
  if (where.length) faq.push([`Where can I book a ${L.noun}?`, `Hooked Trips lists ${L.noun}s in ${list(where.slice(0, 9).map(([n, c]) => `${n} (${c})`))}.`]);
  faq.push([`When is the best time ${L.in}?`, L.season]);
  faq.push(LICENCE_ANY);
  for (const qa of L.faq || []) faq.push(qa);
  return { heading: `${L.n}: what to know`, paras: L.intro, faq };
}

export function locGuide(L, items) {
  if (isSpecies(L)) return speciesGuide(L, items);
  const st = locStats(items);
  const faq = [];
  const p = priceClause(st);
  if (p) {
    faq.push([`How much does a fishing charter ${L.in} cost?`,
      `Across the ${st.count} ${plural(st.count, 'charter', 'charters')} listed ${L.in} on Hooked Trips, ${p}. Prices depend on trip length, boat size and season, so check each operator's trips for exact pricing.`]);
  }
  if (st.species.length) {
    faq.push([`What fish can you catch ${L.in}?`,
      `Charters ${L.in} most often target ${list(st.species.slice(0, 6))}. Each listing shows the species that operator targets and when they're in season.`]);
  }
  faq.push([`When is the best time to go fishing ${L.in}?`, L.season]);
  if (LICENCE[L.state]) faq.push(LICENCE[L.state]);
  for (const qa of L.faq || []) faq.push(qa);
  return { heading: `Fishing ${L.in}`, paras: L.intro, faq };
}

export function locMeta(key, L, items) {
  const st = locStats(items);
  const base = isSpecies(L) ? L.h1 : `${L.short} Fishing Charters`;
  const title = `${base}: Compare ${st.count} ${plural(st.count, 'Operator', 'Operators')} | ${BRAND}`;
  let desc;
  if (isSpecies(L)) {
    const states = [...new Set(items.map((c) => c.state))].map((s) => (s === 'NT' ? 'the NT' : s));
    desc = `Compare ${st.count} ${plural(st.count, L.noun, L.noun + 's')} across ${list(states)}.`;
  } else {
    desc = `Compare ${st.count} fishing ${plural(st.count, 'charter', 'charters')} ${L.in}`;
    if (st.species.length) desc += ` for ${list(st.species.slice(0, 3))}`;
    desc += '.';
  }
  const ps = priceSentence(st);
  if (ps) desc += ' ' + ps;
  const tail = ' Enquire direct with the operator.';
  if ((desc + tail).length <= 165) desc += tail;
  const path = '/fishing-charters/' + key;
  const g = locGuide(L, items);
  return {
    title, desc, path, robots: ROBOTS_INDEX, image: DEFAULT_IMAGE,
    h1: locH1(L),
    ld: {
      '@context': 'https://schema.org',
      '@graph': [
        crumbs([['Home', '/'], ['Fishing Charters', '/charters'], [L.n, path]]),
        itemList(items),
        { '@type': 'FAQPage', mainEntity: g.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
      ],
    },
  };
}

const STATE_CODE = /,\s*(NSW|QLD|NT|VIC|WA|SA|TAS|ACT)$/;
const CITY_HINTS = ['sydney', 'cairns', 'darwin', 'gold coast', 'port stephens', 'sunshine coast', 'wollongong'];
function placeFor(op) {
  const parts = (op.primary_location || '').replace(STATE_CODE, '').split(',').map((s) => s.trim()).filter(Boolean);
  const nameL = (op.name || '').toLowerCase();
  const free = parts.filter((p) => !nameL.includes(p.toLowerCase()));
  return free.find((p) => CITY_HINTS.includes(p.toLowerCase())) || free[0] || '';
}
export function cheapestTrip(op) {
  return (op.trips || []).filter((t) => t.price > 0).sort((a, b) => a.price - b.price)[0] || null;
}
export function charterImages(op) {
  const g = (op.gallery || []).filter(Boolean);
  if (!g.length && op.hero_image) g.push(op.hero_image);
  return g.map((u) => (u.startsWith('http') ? u : SITE + u));
}

export function charterMeta(op, cards) {
  const place = placeFor(op);
  let t;
  if (!place) t = `${op.name} – Trips & Prices`;
  else if (/fishing/i.test(op.name)) t = `${op.name}, ${place}`;
  else t = `${op.name} – ${place} Fishing Charter`;
  const title = `${t} | ${BRAND}`;

  const n = (op.trips || []).length;
  const sp = (op.primary_species || []).slice(0, 3);
  const ct = cheapestTrip(op);
  let desc = `${op.name} offers ${n === 1 ? 'a fishing trip' : n + ' fishing trips'} from ${op.primary_location}`;
  if (sp.length) desc += `, targeting ${list(sp)}`;
  desc += '.';
  if (ct) desc += ` From ${money(ct.price)} ${unitText(ct.price_model)}.`;
  const tail = ' Compare trips and enquire direct.';
  if ((desc + tail).length <= 165) desc += tail;

  const path = '/charters/' + op.slug;
  const url = SITE + path;
  const imgs = charterImages(op);
  const image = op.og_image
    ? { url: SITE + op.og_image, width: 1200, height: 630, alt: op.name }
    : imgs[0] ? { url: imgs[0], alt: op.name } : DEFAULT_IMAGE;

  const prices = (op.trips || []).map((x) => x.price).filter((x) => x > 0);
  const parts = (op.primary_location || '').split(',').map((s) => s.trim());
  const biz = {
    '@type': 'LocalBusiness',
    '@id': url + '#business',
    name: op.name,
    description: clip(op.description, 300),
    url,
    address: {
      '@type': 'PostalAddress',
      addressLocality: parts[0],
      addressRegion: STATE_NAMES[op.state] || op.state,
      addressCountry: 'AU',
    },
    areaServed: op.primary_location,
  };
  if (op.latitude && op.longitude) biz.geo = { '@type': 'GeoCoordinates', latitude: op.latitude, longitude: op.longitude };
  if (imgs.length) biz.image = imgs;
  if (prices.length) {
    const lo = Math.min(...prices), hi = Math.max(...prices);
    biz.priceRange = lo === hi ? money(lo) : `${money(lo)}–${money(hi)}`;
  }
  if (n) {
    biz.makesOffer = op.trips.filter((x) => x.price > 0).map((x) => ({
      '@type': 'Offer',
      name: x.name,
      price: x.price,
      priceCurrency: 'AUD',
      description: [x.duration_hours && `${x.duration_hours} hours`, x.departure_time && `departs ${x.departure_time}`,
        x.max_group && `up to ${x.max_group} guests`, unitText(x.price_model)].filter(Boolean).join(', '),
    }));
  }
  const trail = charterTrail(op, cards);

  return {
    title, desc, path, robots: ROBOTS_INDEX, image,
    ld: { '@context': 'https://schema.org', '@graph': [biz, crumbs(trail)] },
  };
}

// Up to `max` other charters for internal linking: same city page first, then same state.
// Breadcrumb trail for a charter page: Home › Fishing Charters › <city or state> › <operator>
export function charterTrail(op, cards) {
  const card = (cards || []).find((c) => c.slug === op.slug) || { location: op.primary_location, state: op.state };
  const lf = locFor(card);
  const trail = [['Home', '/'], ['Fishing Charters', '/charters']];
  if (lf) trail.push([lf[1].n, '/fishing-charters/' + lf[0]]);
  trail.push([op.name, '/charters/' + op.slug]);
  return trail;
}
export const locTrail = (key, L) => [['Home', '/'], ['Fishing Charters', '/charters'], [L.n, '/fishing-charters/' + key]];

// ── search + filters (homepage search box and /charters filter bar) ─────────
const STOP = new Set(['fishing', 'fish', 'charter', 'charters', 'trip', 'trips', 'tour', 'tours', 'in', 'at', 'near', 'the', 'and', 'for', 'a', 'boat']);
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

// Where the homepage search should go: an exact destination/species page if the
// query names one, otherwise the filtered charter list.
export function searchRoute(query, groupSize) {
  const q = norm(query);
  const gs = groupSize ? `group_size=${encodeURIComponent(groupSize)}` : '';
  if (q) {
    const core = q.split(' ').filter((w) => !STOP.has(w)).join(' ');
    for (const [k, L] of Object.entries(LOCS)) {
      const names = [k.replace(/-/g, ' '), norm(L.n), norm(L.short), ...(L.c || []), ...(L.sp || [])];
      if (names.includes(core) || names.includes(q)) return `/fishing-charters/${k}` + (gs ? '?' + gs : '');
    }
  }
  const p = [];
  if (q) p.push('location=' + encodeURIComponent(String(query).trim()));
  if (gs) p.push(gs);
  return '/charters' + (p.length ? '?' + p.join('&') : '');
}

// Does a listing card match free-text search? Every meaningful word must match
// its name, location, state, species or trip type (so "barra darwin" works).
export function matchesQuery(card, query) {
  const words = norm(query).split(' ').filter((w) => w && !STOP.has(w));
  if (!words.length) return true;
  const lf = locFor(card);
  const hay = norm([card.name, card.location, card.state, STATE_NAMES[card.state], lf && lf[1].n,
    ...(card.species || []), ...(card.species_tags || []), ...(card.trip_type_tags || [])].join(' '));
  return words.every((w) => hay.includes(w) || (w === 'barra' && hay.includes('barramundi')) || (w === 'gt' && hay.includes('giant trevally')));
}

export const GROUP_OPTIONS = [['1', '1 angler'], ['2', '2 anglers'], ['3-4', '3–4 anglers'], ['5-6', '5–6 anglers'], ['7-10', '7–10 anglers'], ['whole', 'Whole boat charter']];
export const groupLabel = (v) => (GROUP_OPTIONS.find(([k]) => k === v) || [v, v])[1];

// Can this operator take a group of the requested size?
export function fitsGroup(op, size) {
  if (!op || !size) return true;
  const trips = op.trips || [];
  if (size === 'whole') return trips.some((t) => !/person/.test(t.price_model || '')) || (op.trip_type_tags || []).some((t) => /private/i.test(t));
  const need = parseInt(String(size).split('-').pop(), 10) || 1;
  const cap = Math.max(0, ...trips.map((t) => t.max_group || 0), op.max_capacity || 0);
  return cap >= need;
}

export const FILTER_SPECIES = ['Barramundi', 'Marlin', 'Kingfish', 'Snapper', 'Coral Trout', 'Red Emperor', 'Giant Trevally', 'Spanish Mackerel', 'Mahi Mahi', 'Tuna', 'Mangrove Jack', 'Flathead'];
export const FILTER_TRIP_TYPES = [['Private', 'Private charter'], ['Shared', 'Shared trip'], ['Reef', 'Reef fishing'], ['Game', 'Game fishing'], ['Estuary', 'Estuary fishing'], ['River', 'River fishing']];

// Suggestions for the homepage search box.
export function searchSuggestions(cards) {
  const out = new Set();
  for (const k of [...CITY_KEYS, ...STATE_KEYS]) out.add(LOCS[k].n);
  for (const c of activeCards(cards || [])) {
    const town = (c.location || '').split(',')[0].trim();
    if (town) out.add(town);
  }
  for (const k of SPECIES_KEYS) out.add(LOCS[k].n);
  return [...out];
}

export function relatedCharters(op, cards, max = 6) {
  const act = activeCards(cards).filter((c) => c.slug !== op.slug);
  const me = (cards || []).find((c) => c.slug === op.slug) || { location: op.primary_location, state: op.state };
  const lf = locFor(me);
  const near = lf && !lf[1].st ? act.filter((c) => inLoc(c, lf[1])) : [];
  const state = act.filter((c) => c.state === op.state && !near.includes(c));
  return { loc: lf, items: [...near, ...state].slice(0, max) };
}

export function pageMeta(path, ctx = {}) {
  const n = ctx.count || 0;
  const base = { path, robots: ROBOTS_INDEX, image: DEFAULT_IMAGE, ld: null };
  switch (path) {
    case '/':
      return { ...base,
        title: `${BRAND} – Compare & Book Fishing Charters in Australia`,
        desc: `Find and compare ${n} fishing charters across NSW, Queensland and the NT — reef, game and barramundi trips with prices and target species. Enquire direct.` };
    case '/charters':
      return { ...base,
        title: `Fishing Charters Australia: Compare ${n} Operators | ${BRAND}`,
        desc: `Browse ${n} fishing charters across NSW, Queensland and the NT. Filter by species, trip type and region, compare prices, then enquire direct with the operator.`,
        ld: ctx.cards ? { '@context': 'https://schema.org', '@graph': [crumbs([['Home', '/'], ['Fishing Charters', '/charters']]), itemList(ctx.cards)] } : null };
    case '/about':
      return { ...base,
        title: `About ${BRAND} – An Australian Fishing Charter Platform`,
        desc: 'Hooked Trips is an Australian fishing charter platform built by a lifelong angler: a simple, honest way to find local charters, and a fairer deal for the operators who run them.' };
    case '/list-your-charter':
      return { ...base,
        title: `List Your Fishing Charter – Free to List | ${BRAND}`,
        desc: 'Reach more anglers with a free Hooked Trips listing. No monthly fees, no pay-to-play rankings and a flat 10% commission on completed bookings, with Australian-based support.' };
    case '/contact':
      return { ...base,
        title: `Contact Us | ${BRAND}`,
        desc: 'Questions about a charter, updating a listing, or working with Hooked Trips? Get in touch with our Australian team — we usually reply within a few hours.' };
    case '/terms':
      return { ...base, title: `Terms of Service | ${BRAND}`, desc: 'The terms that apply when you use Hooked Trips to find, compare and enquire about fishing charters in Australia.' };
    case '/privacy':
      return { ...base, title: `Privacy Policy | ${BRAND}`, desc: 'How Hooked Trips collects, uses and protects your personal information when you browse charters, send an enquiry or list your business.' };
    case 'admin':
      return { ...base, path: null, robots: 'noindex, nofollow', title: `Admin | ${BRAND}`, desc: '' };
    default: // 404
      return { ...base, path: null, robots: ROBOTS_NOINDEX, title: `Page not found | ${BRAND}`, desc: "This page doesn't exist. Browse fishing charters across Australia on Hooked Trips." };
  }
}

// ── browser: write a meta object into <head> ─────────────────────────────────
export function applyMeta(m) {
  if (typeof document === 'undefined' || !m) return;
  const h = document.head;
  const upsert = (sel, make, attr, val) => {
    let e = h.querySelector(sel);
    if (val == null || val === '') { if (e) e.remove(); return; }
    if (!e) { e = make(); h.appendChild(e); }
    e.setAttribute(attr, val);
  };
  const meta = (k, key) => () => { const e = document.createElement('meta'); e.setAttribute(k, key); return e; };
  const name = (key, val) => upsert(`meta[name="${key}"]`, meta('name', key), 'content', val);
  const prop = (key, val) => upsert(`meta[property="${key}"]`, meta('property', key), 'content', val);
  const url = m.path ? SITE + m.path : null;
  const img = m.image || DEFAULT_IMAGE;

  document.title = m.title;
  name('description', m.desc);
  name('robots', m.robots || ROBOTS_INDEX);
  upsert('link[rel="canonical"]', () => { const e = document.createElement('link'); e.rel = 'canonical'; return e; }, 'href', url);
  prop('og:title', m.title);
  prop('og:description', m.desc);
  prop('og:url', url);
  prop('og:image', img.url);
  prop('og:image:width', img.width ? String(img.width) : null);
  prop('og:image:height', img.height ? String(img.height) : null);
  prop('og:image:alt', img.alt || null);
  name('twitter:title', m.title);
  name('twitter:description', m.desc);
  name('twitter:image', img.url);

  let ld = h.querySelector('script[data-ld="page"]');
  if (!m.ld) { if (ld) ld.remove(); }
  else {
    if (!ld) { ld = document.createElement('script'); ld.type = 'application/ld+json'; ld.setAttribute('data-ld', 'page'); h.appendChild(ld); }
    ld.textContent = JSON.stringify(m.ld);
  }
}
