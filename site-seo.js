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
    season: "Reef fishing runs year-round, with calmer seas more common from late winter through spring. Cairns is famous for giant black marlin from roughly September to December. Barramundi have a closed season on Queensland's east coast from 1 November to 31 January (some stocked dams excepted), so check with your operator about what's on offer in that window.",
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
    parent: 'new-south-wales',
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
    parent: 'queensland',
    n: 'Cairns', short: 'Cairns', in: 'in Cairns', c: ['cairns'], state: 'QLD',
    intro: [
      "Cairns is the gateway to some of the best fishing on the Great Barrier Reef. Reef charters target coral trout, red emperor, nannygai and giant trevally, while out on the Ribbon Reefs and the edge of the Coral Sea, Cairns is known worldwide for giant black marlin.",
      "Closer to town, Trinity Inlet — a State Marine Park with more than 100km of creeks and channels — holds barramundi, mangrove jack, fingermark and threadfin, and the Mulgrave and Russell rivers about 40km south are a popular day trip. Up on the Atherton Tablelands, Lake Tinaroo is known for metre-plus impoundment barramundi.",
    ],
    season: "Coral trout, red emperor and nannygai are caught year-round, though bottom fishing can be less predictable in the wet season (January to March), when Spanish mackerel and tuna are often more active. Giant black marlin run from early September to mid-December between Cairns and Lizard Island, and juvenile black marlin are caught within about an hour of Cairns through much of the year. The east-coast barramundi closed season runs from 1 November to 31 January.",
  },
  'darwin': {
    parent: 'northern-territory',
    n: 'Darwin', short: 'Darwin', in: 'in Darwin', c: ['darwin'], state: 'NT',
    intro: [
      "Darwin puts you within reach of both world-class barramundi water and productive offshore reefs. Harbour and estuary charters fish the creeks and mangroves around Darwin Harbour for barra, mangrove jack and threadfin salmon, while bluewater trips head offshore for Spanish mackerel, giant trevally, golden trevally, longtail tuna and sailfish.",
      "Most charters leave from Cullen Bay, Stokes Hill Wharf or the Dinah Beach ramp, and offshore trips work reefs such as Fish Reef, Lorna Shoals and Charles Point, roughly 20–50km out. Tides here often run six to seven metres, which shapes where and when guides fish. Several operators also run day trips to Shoal Bay, Bynoe Harbour, the Adelaide River and Corroboree Billabong.",
    ],
    season: "Golden snapper and black jewfish are caught year-round, and barramundi are in Darwin Harbour all year, with the run-off (roughly March to May) the classic barra window. The dry season (about May to August) is best for trevally, queenfish, mackerel and tuna, while sailfish and marlin show up in the tropical summer.",
  },
  'gold-coast': {
    parent: 'queensland',
    n: 'Gold Coast', short: 'Gold Coast', in: 'on the Gold Coast', c: ['gold coast'], state: 'QLD',
    intro: [
      "The Gold Coast combines quick offshore access through the Gold Coast Seaway with reliable reef and pelagic fishing. Charters target snapper and pearl perch on the inshore and wider reefs, while the warmer months bring mahi mahi, cobia, Spanish mackerel and marlin.",
      "The Broadwater and nearby rivers offer calmer half-day options for flathead, bream and mangrove jack — a good choice for families or when the bar is rough.",
    ],
    season: "Snapper are at their best through the cooler months, roughly May to September. From late spring to autumn (about November to April), warm currents bring mahi mahi, wahoo, cobia and marlin within reach.",
  },
  'port-stephens': {
    parent: 'new-south-wales',
    n: 'Port Stephens', short: 'Port Stephens', in: 'in Port Stephens', c: ['port stephens', 'nelson bay'], state: 'NSW',
    intro: [
      "Port Stephens, just north of Newcastle, is one of the best-known game-fishing ports on the east coast. Charters out of Nelson Bay target marlin on the continental shelf in summer and autumn, plus yellowtail kingfish, snapper and tuna around the offshore islands and reefs.",
      "Inside the port itself there's sheltered fishing for flathead, bream and snapper, making it a good spot for mixed groups and shorter trips.",
    ],
    season: "Marlin season generally runs from around December to May, peaking from February to April. Kingfish are strongest from spring to autumn, snapper are caught year-round, and bluefin tuna can show up in winter (around May to August).",
  },
  'sunshine-coast': {
    parent: 'queensland',
    n: 'Sunshine Coast', short: 'Sunshine Coast', in: 'on the Sunshine Coast', c: ['sunshine coast', 'noosa', 'mooloolaba'], state: 'QLD',
    intro: [
      "The Sunshine Coast offers offshore reef fishing out of Mooloolaba and calmer river and estuary trips around Noosa. Offshore charters fish reefs such as the Barwon Banks for snapper, pearl perch, coral trout and Spanish mackerel.",
      "The Noosa River and its lakes hold flathead, bream and mangrove jack, and are a relaxed option for families or anyone who'd rather avoid the open ocean.",
    ],
    season: "Snapper and pearl perch are reliable through the cooler months, while late spring to autumn (about October to April) brings Spanish mackerel, mahi mahi and wahoo.",
  },
  'wollongong': {
    parent: 'new-south-wales',
    n: 'Wollongong', short: 'Wollongong', in: 'in Wollongong', c: ['wollongong', 'illawarra'], state: 'NSW',
    intro: [
      "Wollongong and the Illawarra coast offer quick access to deep water south of Sydney. Charters fish the Five Islands and nearby reefs for snapper, kingfish, morwong and flathead.",
      "In summer, boats head wide to the continental shelf for marlin, mahi mahi and tuna — a less crowded alternative to the bigger game-fishing ports.",
    ],
    season: "Snapper are caught year-round, with a peak in the cooler months. Kingfish are best from spring to autumn, and the game-fishing season for marlin and mahi mahi generally runs from December to April.",
  },

  // ── Northern Territory hot spots ──────────────────────────────────────────────
  'mary-river': {
    n: 'Mary River', short: 'Mary River', in: 'on the Mary River', parent: 'northern-territory', c: ['mary river'], state: 'NT',
    intro: [
      "The Mary River wetlands east of Darwin are some of the Territory's most famous barramundi water. Charters fish from the Shady Camp ramp — where a barrage separates the fresh and salt water — down towards the river mouth, as well as billabongs like Corroboree, part of the Mary system and about 90 minutes from Darwin.",
      "As well as barramundi, anglers catch threadfin salmon, jewfish and, in the billabongs, saratoga. NT tourism notes that barra up to 1.4m are landed in the wetlands each year. The system also holds one of Australia's largest concentrations of saltwater crocodiles, which is one reason most visitors fish it with an experienced local guide.",
    ],
    season: "The run-off after the wet season — roughly late February to early May — is peak barramundi time, as fish push out of the flooded wetlands. The build-up (about September to November) can also fish well, and saratoga in Corroboree Billabong are a target from around mid-May to November.",
    faq: [
      ["Do I need a permit to fish Shady Camp?", "Mary River National Park requires an NT Parks pass, and camping at Shady Camp has to be booked online. Check with your operator about what's included in your trip."],
    ],
  },
  'kakadu': {
    n: 'Kakadu', short: 'Kakadu', in: 'in Kakadu', parent: 'northern-territory', c: ['kakadu'], state: 'NT',
    intro: [
      "Kakadu National Park, about two and a half hours from Darwin, offers barramundi fishing in a world-heritage landscape: the big tidal South and East Alligator rivers, the Yellow Water floodplain and, beneath the Arnhem Land escarpment, the upper East Alligator above Cahill's Crossing.",
      "Guided fishing inside the park is limited to a small number of operators that meet the park's criteria, and trips generally run from Jabiru. On smaller tides, guides may also head to the reefs off the river mouths for golden snapper and black jewfish.",
    ],
    season: "The run-off, from about March to May, is prime time on the big tidal rivers. Through the dry season (around June to October) the upper East Alligator fishes well, and some barramundi fishing continues at Yellow Water over the wet, when most operators close.",
    faq: [
      ["Do I need a park pass to fish in Kakadu?", "Yes — visitors need a Kakadu park pass, which can be bought online. If you're launching your own boat, check the Bowali Visitor Centre's daily access report for river conditions first."],
    ],
  },
  'daly-river': {
    n: 'Daly River', short: 'Daly River', in: 'on the Daly River', parent: 'northern-territory', c: ['daly river'], state: 'NT',
    intro: [
      "The Daly River, about 210–220km south-west of Darwin, is one of the Territory's great barramundi rivers — and it's reserved for recreational fishing, with no commercial barra fishing allowed. The river runs more than 40km from the Daly River crossing down to Anson Bay, through the Daly–Reynolds floodplains.",
      "Tides of up to seven metres are common and the river can rise and fall by as much as 16m with the seasons, so local knowledge matters. Charters fish the river itself and the coastal creeks of Anson Bay for barramundi, mangrove jack and threadfin salmon.",
    ],
    season: "The run-off, from about March to May, is the classic time, when big tides draw barra off the floodplains. Note that the lower tidal section of the Daly is closed to fishing from 1 October to 31 January.",
    faq: [
      ["What facilities are there at Daly River?", "The township has tourist parks, a pub and motel, boat ramps, a general store, boat hire and guided fishing."],
    ],
  },
  'dundee': {
    n: 'Dundee Beach & Bynoe Harbour', short: 'Dundee Beach', in: 'at Dundee Beach', parent: 'northern-territory', c: ['dundee', 'bynoe'], state: 'NT',
    intro: [
      "Dundee Beach is about 90 minutes from Darwin by sealed road, with a boat ramp protected by a seawall, a beachfront tavern and a holiday park. Barramundi fishing centres on the Finniss River and nearby coastal creeks, while reef and sportfishing grounds stretch out to the Peron Islands and Bateman Shoals.",
      "Nearby Bynoe Harbour is sheltered enough for smaller boats and is launched from Keswick Point or the south-shore ramps. Several Dundee operators offer multi-day packages with their own accommodation.",
    ],
    season: "Barramundi are caught year-round, with October often described as the sweet spot when the tides suit. Big black jewfish are taken close to shore, and the wider grounds produce queenfish, giant trevally, Spanish mackerel, tuna and sailfish. Bynoe Harbour sits in a 'storm alley', so keep an eye on the weather radar.",
  },
  'tiwi-islands': {
    n: 'Tiwi Islands', short: 'Tiwi Islands', in: 'in the Tiwi Islands', parent: 'northern-territory', c: ['tiwi'], state: 'NT',
    intro: [
      "Bathurst and Melville islands lie about 80km north of Darwin and offer remote, lightly fished water. Day charters run from Leaders Creek — the closest ramp to the Tiwis, about an hour from Darwin — past the Vernon Islands and the Adelaide River mouth, while fly-in guests stay at Port Hurd on western Bathurst Island.",
      "The estuaries hold barramundi, threadfin salmon and mangrove jack, while queenfish, giant trevally, golden snapper and black jewfish patrol the rocky headlands.",
    ],
    season: "Golden snapper and black jewfish are caught year-round, joined by queenfish, trevally and Spanish mackerel in the dry season. Tiwi fishing operators generally close over the wet season (roughly December to March).",
    faq: [
      ["Do I need a permit to fish the Tiwi Islands?", "Yes — a permit is needed to visit and fish the Tiwi Islands. Check with your operator about how this is arranged for your trip."],
    ],
  },
  'arnhem-land': {
    n: 'Arnhem Land, Cobourg & Gove', short: 'Arnhem Land', in: 'in Arnhem Land', parent: 'northern-territory', c: ['arnhem', 'cobourg', 'gove', 'nhulunbuy'], state: 'NT',
    intro: [
      "Arnhem Land offers some of the most remote fishing in Australia. Much of the coast can only be visited and fished legally with permits, usually through accredited fishing tour operators — which is why most anglers come on a guided trip or stay at a fly-in lodge.",
      "Options range from Nhulunbuy (Gove), which fishes the reefs off the Gove Peninsula and the Wessel and English Company islands, to fly-in camps and lodges on the Cobourg Peninsula and in East Arnhem. The Cobourg is better known for bluewater species than barra; the rivers of Arnhem and Buckingham bays are barramundi country.",
    ],
    season: "Barramundi fishing peaks in the estuaries during the run-off (around March to June on the Glyde River). Bluewater and reef species — Spanish mackerel, giant trevally, queenfish, longtail tuna, coral trout and golden snapper — are targeted through the dry season. Camping on the Cobourg Peninsula is limited to May to October.",
    faq: [
      ["Do I need a permit to fish in Arnhem Land?", "Yes. Much of the Arnhem Land coast can only be fished with permits, usually arranged through accredited fishing tour operators, and visitors to Nhulunbuy need a general permit for the region."],
    ],
  },

  'gulf-nt': {
    n: 'Gulf of Carpentaria (NT)', short: 'NT Gulf', in: 'in the NT Gulf of Carpentaria', parent: 'northern-territory', c: ['groote', 'roper river', 'borroloola', 'gulf of carpentaria', 'mcarthur river', 'king ash bay'], state: 'NT',
    intro: [
      "The Northern Territory's Gulf of Carpentaria coast is some of the most remote fishing in Australia. Groote Eylandt, off the western Gulf, offers reef and bluewater fishing for golden snapper, coral trout, red emperor and Spanish mackerel, while big tidal rivers such as the Roper — navigable for about 170 km into the Gulf — and the McArthur near Borroloola hold barramundi, threadfin salmon and mangrove jack.",
      "Distances are huge (Borroloola is around 12 hours' drive from Darwin), so most visiting anglers fish here on fly-in or lodge-based trips. Charters on the Roper are run from a mothership reached by seaplane from Darwin, and Groote Eylandt trips are based at the island's lodge.",
    ],
    season: "Barramundi fish best in the run-off (about March to May) and the build-up (September to December), though they're caught year-round. On the Roper, trips run roughly February to October, with clearer dry-season water good for sight-casting on the flats. Reef fishing off Groote runs through the dry season.",
  },
  // ── New South Wales hot spots ───────────────────────────────────────────────
  'central-coast': {
    n: 'Central Coast', short: 'Central Coast', in: 'on the Central Coast', parent: 'new-south-wales', c: ['central coast'], state: 'NSW',
    intro: [
      "Central Coast charters launch from the Haven at Terrigal and are offshore within minutes, fishing the reefs for snapper, jewfish, kingfish, teraglin, morwong, flathead and John Dory. Further south, Hardys Bay on Broken Bay gives access to the reefs and wrecks off the Bouddi Peninsula.",
      "When it's windy outside, Broken Bay and the Hawkesbury River offer calmer water, making the Central Coast a flexible option just north of Sydney.",
    ],
    season: "Snapper are a year-round reef target. Summer brings mahi mahi and seasonal marlin (usually tagged and released). Some operators only run fishing charters over the warmer months, roughly December to April, so check availability.",
  },
  'port-macquarie': {
    n: 'Port Macquarie', short: 'Port Macquarie', in: 'in Port Macquarie', parent: 'new-south-wales', c: ['port macquarie'], state: 'NSW',
    intro: [
      "Port Macquarie offers both offshore reef fishing and some of the best estuary fishing on the Mid North Coast. Offshore boats leave from the town centre and fish the reefs for snapper, pearl perch, kingfish and jewfish.",
      "The Hastings River is tidal for about 32km inland, and guides also fish the Maria River, Limeburners Creek and the Camden Haven, Manning and Macleay rivers for flathead, jewfish, whiting and — from September to May — catch-and-release Australian bass.",
    ],
    season: "Dusky flathead and jewfish are caught year-round in the estuaries, and whiting fire on the sand flats from about October to April. Offshore, snapper are best through spring and summer, with mahi mahi in the warmer months.",
  },
  'south-west-rocks': {
    n: 'South West Rocks', short: 'South West Rocks', in: 'at South West Rocks', parent: 'new-south-wales', c: ['south west rocks'], state: 'NSW',
    intro: [
      "South West Rocks has unusually quick access to good water: the first ocean reef is about ten minutes from the bar, most fishing is done 1–5km out, and the continental shelf is only about 12 nautical miles offshore. The East Australian Current pushes warm water close in, and deep canyons along the shelf hold blue marlin.",
      "When it's rough outside, the Macleay River estuary offers flathead, trevally, bream, whiting, jewfish and mangrove jack.",
    ],
    season: "Snapper and pearl perch are best in winter and spring. Summer is surface-fishing season, with Spanish and spotted mackerel, marlin, sailfish, wahoo and mahi mahi.",
  },
  'yamba': {
    n: 'Yamba & Iluka', short: 'Yamba', in: 'in Yamba', parent: 'new-south-wales', c: ['yamba', 'iluka'], state: 'NSW',
    intro: [
      "Yamba and Iluka sit either side of the Clarence River mouth on the NSW North Coast. Charter grounds run from Evans Head in the north to Sandon in the south and out to the continental shelf, with many reef trips fishing 5–10km off the Clarence River bar.",
      "Snapper and pearl perch are the main reef targets, with mackerel in season, and some operators also run humpback whale watching between Woody Head and Angourie.",
    ],
    season: "Reef fishing for snapper and pearl perch runs through much of the year; mackerel are a seasonal summer target. Ask your operator what's biting when you plan to visit.",
  },
  'ballina-byron': {
    n: 'Ballina & Byron Bay', short: 'Byron Bay', in: 'around Byron Bay and Ballina', parent: 'new-south-wales', c: ['byron', 'ballina', 'evans head', 'brunswick'], state: 'NSW',
    intro: [
      "Charters on the far North Coast work out of Brunswick Heads and Evans Head. Brunswick Heads boats fish off Byron Bay and around the Cape Byron Marine Park for snapper, pearl perch, jewfish and kingfish, while Evans Head operators specialise in deep-water pearl perch about 30km offshore.",
      "In March 2026, NSW DPI deployed a new offshore artificial reef off Ballina — two steel towers in 32m of water about 5km south of the Richmond River mouth — expected to hold mackerel, snapper and jewfish.",
    ],
    season: "Pearl perch are a year-round speciality in deeper water. Reef species are caught through the year, and the warmer months add mackerel, wahoo, tuna and marlin.",
  },
  'jervis-bay': {
    n: 'Jervis Bay & Shoalhaven', short: 'Jervis Bay', in: 'in Jervis Bay', parent: 'new-south-wales', c: ['jervis bay', 'huskisson', 'greenwell point', 'shoalhaven'], state: 'NSW',
    intro: [
      "Jervis Bay pairs a sheltered, crystal-clear bay with deep water and the continental shelf close by. Charters leave from Huskisson on Currambene Creek and from Greenwell Point, and the bay is renowned for squid over the seagrass edges and good bottom fishing for snapper.",
      "Offshore, kingfish, tuna, bonito, salmon and mahi mahi are within easy reach, and the area's ledges are famous for land-based game fishing. The bay is a marine park, so zoning rules apply — your operator will know where you can fish.",
    ],
    season: "Squid and snapper are caught through much of the year in the bay and offshore. The warmer months bring pelagics like mahi mahi and tuna, and the area is known for marlin over summer and autumn.",
  },
  'batemans-bay': {
    n: 'Batemans Bay & Narooma', short: 'Batemans Bay', in: 'around Batemans Bay and Narooma', parent: 'new-south-wales', c: ['batemans bay', 'narooma', 'bermagui'], state: 'NSW',
    intro: [
      "The NSW South Coast offers three great charter ports. Batemans Bay boats leave d'Albora Marina to fish the reefs of the bay and the Tollgate Islands for snapper, kingfish, morwong and flathead. Narooma's town wharf is the closest port to Barunguba (Montague Island), a key reef and game fishing area.",
      "Further south, Bermagui operators run reef, kingfish, tuna and deep-water trips from the harbour at O'Shea Wharf.",
    ],
    season: "Kingfish and reef species are targeted around the islands through much of the year, while yellowfin tuna and other game fish are fished offshore from Bermagui in season. Ask your operator for the best months for your target species.",
  },
  'lord-howe-island': {
    n: 'Lord Howe Island', short: 'Lord Howe Island', in: 'on Lord Howe Island', parent: 'new-south-wales', c: ['lord howe'], state: 'NSW',
    intro: [
      "Lord Howe Island sits on the world's southernmost coral reef, where the East Australian Current pushes deep water up the island's slopes and tropical and temperate species overlap. Its kingfish are famously large, and the marine park also holds some of NSW's biggest silver trevally.",
      "Charters leave from the lagoon jetty. Balls Pyramid, the world's tallest sea stack, is about 23km away and is a premier offshore destination, while the lagoon offers sight-casting for trevally, silver drummer, bluefish and the endemic double header wrasse.",
    ],
    season: "Kingfish are caught year-round, with winter the best time. Yellowfin tuna and wahoo are offshore targets. Spearfishing is banned in the marine park, and bag limits apply to some lagoon species.",
  },

  'newcastle': {
    n: 'Newcastle & Lake Macquarie', short: 'Newcastle', in: 'around Newcastle and Lake Macquarie', parent: 'new-south-wales', c: ['newcastle', 'lake macquarie', 'swansea', 'hunter river', 'tomago'], state: 'NSW',
    intro: [
      "Newcastle offers three very different kinds of fishing within half an hour of each other: the Hunter River and Newcastle Harbour, Lake Macquarie — which NSW DPI describes as Australia's largest coastal saltwater lake — and the offshore reefs reached through Swansea Channel.",
      "Local guides chase dusky flathead and mulloway on lures in the Hunter River and the lake, kingfish around Swansea Bridge and the 'Drop Over' where the channel meets the lake, and reef species offshore. Lake Macquarie hasn't been commercially netted since 2002, and its calm water suits families and first-timers.",
    ],
    season: "Dusky flathead and mulloway are the signature estuary targets for much of the year, with flathead best in the warmer months. Kingfish hang around Swansea Bridge and the channel, and schools of Australian salmon often settle in Swansea Channel in the cooler months.",
  },
  'eden': {
    n: 'Merimbula & Eden', short: 'Merimbula & Eden', in: 'around Merimbula and Eden', parent: 'new-south-wales', c: ['merimbula', 'eden', 'twofold bay', 'pambula', 'sapphire coast'], state: 'NSW',
    intro: [
      "On the far south coast of NSW, Eden's Twofold Bay is one of the deepest natural harbours in the Southern Hemisphere and has no bar to cross, so boats can get out in conditions that close other ports. Charters fish the inshore reefs for snapper, morwong and flathead year-round, run south to 'kingie country' around Mowarry Point and Green Cape, and head to the continental shelf — about 19 nautical miles out — for game fish.",
      "Merimbula, 30 minutes north, adds short reef trips from the town jetty and calm lake fishing for dusky flathead and bream in Merimbula and Pambula lakes. Both towns are also whale-watching hubs during the humpback migration.",
    ],
    season: "Snapper and flathead are caught year-round. Kingfish run from about November to June, and Eden's game season (marlin, yellowfin and albacore tuna) runs from around November to July, with January to March often best for marlin.",
  },
  // ── Queensland (south) hot spots ────────────────────────────────────────────
  'brisbane': {
    n: 'Brisbane & Moreton Bay', short: 'Brisbane', in: 'in Brisbane and Moreton Bay', parent: 'queensland', c: ['brisbane', 'moreton', 'bribie', 'redcliffe'], state: 'QLD',
    intro: [
      "Brisbane's fishing centres on Moreton Bay. Offshore charters leave Manly Boat Harbour or Sandstone Point near Bribie Island, cross the bay and exit through the South Passage bar to reach grounds like the Point Lookout reefs, Flinders Reef, Hutchinsons Shoals and Square Patch — a run of roughly 75 minutes to two and a half hours.",
      "Inside the bay, Scarborough Reef and the Turner Artificial Reef hold snapper, sweetlip and school mackerel, while the calm Pumicestone Passage behind Bribie Island suits families chasing flathead, bream, whiting and tailor.",
    ],
    season: "Snapper, pearl perch, amberjack, kingfish and teraglin are the main offshore targets in the cooler months. In summer, charters often switch to trolling for marlin, mahi mahi, tuna, wahoo and mackerel. Snapper and pearl perch have a closed season from 15 July to 15 August.",
  },
  'rainbow-beach': {
    n: 'Rainbow Beach & Tin Can Bay', short: 'Rainbow Beach', in: 'at Rainbow Beach', parent: 'queensland', c: ['rainbow beach', 'tin can bay'], state: 'QLD',
    intro: [
      "Charters from Carlo Point at Rainbow Beach and the Tin Can Bay pontoon fish the reefs off Rainbow Beach, Double Island Point and the southern end of K'gari (Fraser Island) for snapper, pearl perch, parrotfish, coral trout and red emperor.",
      "Trips here are usually full days, leaving around first light and returning mid-afternoon, with operators confirming sea conditions the day before. Charter fishing has a long history in the area, with some local boats running for more than 25 years.",
    ],
    season: "Reef fishing runs through the year, weather permitting, with snapper and pearl perch the headline species. Snapper and pearl perch have a Queensland closed season from 15 July to 15 August.",
  },
  'hervey-bay': {
    n: "Hervey Bay & K'gari", short: 'Hervey Bay', in: 'in Hervey Bay', parent: 'queensland', c: ['hervey bay', 'urangan', "k'gari"], state: 'QLD',
    intro: [
      "Hervey Bay is sheltered from the south-east trade winds by K'gari (Fraser Island), so there's usually somewhere fishable. It's also one of the few places where northern and southern species overlap: snapper and whiting alongside threadfin, queenfish, golden trevally and even barramundi.",
      "Charters leave Urangan Boat Harbour for the bay's artificial reefs, ledges such as Moon Ledge, Platypus Bay and the 25 Fathom Hole, while the flats offer sight fishing for golden trevally and longtail tuna on fly or spin.",
    ],
    season: "The snapper run builds from late autumn and peaks in mid-winter as fish follow baitfish into the bay. Longtail tuna, golden trevally, queenfish and juvenile black marlin are seasonal sportfishing targets on the flats and in the bay.",
  },
  'bundaberg': {
    n: 'Bundaberg', short: 'Bundaberg', in: 'in Bundaberg', parent: 'queensland', c: ['bundaberg', 'burnett heads'], state: 'QLD',
    intro: [
      "Bundaberg has a deep-water port at Burnett Heads with no bar crossing and no tidal restrictions, so getting offshore is straightforward. Reef grounds run from a few miles out to around 50 nautical miles at the shelf, and full-day trips often travel two hours or more each way.",
      "The fishing mixes southern species like big snapper with northern ones such as Spanish mackerel and coral trout, and the Burnett River offers calm-water trips for bream, whiting, flathead, mangrove jack and grunter.",
    ],
    season: "Coral trout and red emperor are targeted on the wider reefs, with sweetlip, snapper and Spanish mackerel on the inshore reefs. Snapper and pearl perch have a Queensland closed season from 15 July to 15 August.",
  },
  'yeppoon': {
    n: 'Yeppoon & Capricorn Coast', short: 'Yeppoon', in: 'in Yeppoon', parent: 'queensland', c: ['yeppoon', 'rosslyn bay', 'capricorn coast'], state: 'QLD',
    intro: [
      "Charters leave Rosslyn Bay Marina near Yeppoon to fish the deeper reefs, wrecks and shoals of Keppel Bay for red emperor, goldband snapper, large-mouth nannygai and coral trout. Longer trips of 18–36 hours can reach Heron Reef, Island Head and the Swain Reefs.",
      "The Capricorn Coast is also a base for week-long liveaboard trips to the Swains, which suit experienced groups wanting days of reef fishing far offshore.",
    ],
    season: "Reef fishing runs through the year, weather permitting. On the Swains liveaboards, bottom fishing for red emperor, coral trout and sweetlip is mixed with trolling for mackerel, tuna and wahoo. Coral reef fin fish closures apply around October and November.",
  },

  'gladstone': {
    n: 'Gladstone', short: 'Gladstone', in: 'in Gladstone', parent: 'queensland', c: ['gladstone', 'tannum sands', 'boyne island'], state: 'QLD',
    intro: [
      "Gladstone is the jumping-off point for multi-day reef fishing trips to the southern Great Barrier Reef. Liveaboard charters leave Gladstone Marina for the Capricorn and Bunker Group about 80 km offshore, the remote Swain Reefs around 120 nautical miles out, and on longer trips the Coral Sea reefs.",
      "Trips typically run three to ten days, fishing for coral trout, red throat emperor and red emperor, with mackerel trolled off the reef edges. Some boats fish from dories so small groups can spread out across the reef, and catches are usually cleaned and frozen on board to take home.",
    ],
    season: "Reef fishing runs year-round outside the coral reef fin fish spawning closures (in 2026, 8–12 October and 6–10 November). Operators rate the start of spring as peak Swains season. Check Great Barrier Reef Marine Park zoning — parts of Heron Island and Wistari Reef are green zones.",
  },
  'agnes-water': {
    n: 'Agnes Water & 1770', short: '1770', in: 'at Agnes Water and 1770', parent: 'queensland', min: 1,
    c: ['agnes water', '1770', 'seventeen seventy', 'town of 1770', 'round hill'], state: 'QLD',
    intro: [
      "The Town of 1770 and neighbouring Agnes Water sit where the Great Barrier Reef begins, about halfway between Bundaberg and Gladstone. Charter boats leave Round Hill Creek for deep-water reefs within about 15 nautical miles of the coast, the rocks off Bustard Head, trawler wrecks, and on longer days the southern reefs of the Capricorn and Bunker Group such as Lady Musgrave Island and Fitzroy Reef.",
      "Reef trips target coral trout, red emperor, red throat emperor, nannygai and sweetlip, with cobia, mackerel and tuna around the wrecks. Closer in, Round Hill, Eurimbula, Middle and Pancake creeks hold mangrove jack, barramundi, queenfish, grunter and whiting. Departures are timed around the tide because the Round Hill Creek bar is shallow and always shifting.",
    ],
    season: "Reef fishing is good year-round, but locals rate the cooler months most highly — red emperor school on the pinnacles east of Fitzroy Reef from about May to October. Cobia, tuna and trevally are on the wrecks all year. Mind the closures: coral reef fin fish (8–12 October and 6–10 November in 2026), snapper and pearl perch (15 July–15 August) and barramundi (1 November–31 January).",
  },
  // ── Queensland (north) hot spots ─────────────────────────────────────────────
  'whitsundays': {
    n: 'Whitsundays', short: 'Whitsundays', in: 'in the Whitsundays', parent: 'queensland', c: ['whitsundays', 'whitsunday', 'airlie beach', 'hamilton island', 'shute harbour'], state: 'QLD',
    intro: [
      "The Whitsundays combine island-hopping scenery with serious reef fishing. Charters leave from Coral Sea Marina at Airlie Beach and from Hamilton Island, and fish the island grounds — mostly 40–70m deep — as well as the outer Great Barrier Reef, about 40 nautical miles out.",
      "Coral trout, red emperor, nannygai and sweetlip are year-round targets, Spanish mackerel and sailfish add a pelagic option, and some operators hold access to Marine Park zones others can't fish. On Hamilton Island, several restaurants will even cook your catch.",
    ],
    season: "Reef fishing runs year-round. Sailfish are around all year but peak from about August to December. Coral reef fin fish and Spanish mackerel are subject to seasonal closures around October and November — check the current Queensland rules or ask your operator.",
  },
  'port-douglas': {
    n: 'Port Douglas', short: 'Port Douglas', in: 'in Port Douglas', parent: 'queensland', c: ['port douglas'], state: 'QLD',
    intro: [
      "Port Douglas sits closer to the outer Great Barrier Reef than most mainland ports — larger boats reach the reef grounds in about an hour, and game boats run to the continental shelf for marlin. Charters depart from the Crystalbrook Superyacht Marina on Wharf Street and nearby wharves.",
      "Inshore options include the Port Douglas estuaries, fringing reefs and the Low Isles, making it a good base whether you want a family reef day or a crack at a black marlin.",
    ],
    season: "Reef fishing is year-round, apart from coral reef fin fish closures around October and November. Light-tackle juvenile black marlin run from about July to October, and the giant black marlin season between Cairns and Lizard Island is from around September to mid-December.",
  },
  'mackay': {
    n: 'Mackay', short: 'Mackay', in: 'in Mackay', parent: 'queensland', c: ['mackay'], state: 'QLD',
    intro: [
      "Mackay offers a rare mix: offshore reef fishing among the Cumberland and Sir James Smith island groups, Great Barrier Reef anchorages like Square, Stevens and Chauvel reefs, and the Mackay Net Free Zone — fifteen creek systems from Cape Hillsborough to St Helens Bay — for barramundi, mangrove jack and salmon.",
      "Charters run from Mackay Marina and the Hay Point ramp south of town, and nearby Kinchant, Teemburra and Eungella dams provide stocked impoundment barramundi when the saltwater season is closed.",
    ],
    season: "Creek barramundi, jacks and salmon fish best from about February to May while the water stays warm. Reef species and Spanish mackerel come on from around June as the weather settles, with August and September good for offshore jigging. During the saltwater barra closure (1 November to 31 January) anglers turn to the dams.",
  },
  'townsville': {
    n: 'Townsville', short: 'Townsville', in: 'in Townsville', parent: 'queensland', c: ['townsville', 'magnetic island'], state: 'QLD',
    intro: [
      "Townsville is a gateway to the central Great Barrier Reef. From Breakwater Marina, larger charter boats reach the first reef drop in about 1.5–2 hours, and longer day and overnight trips chase red emperor, nannygai and coral trout on reefs such as Centipede, Grub and Hopkinson.",
      "Across the bay, Magnetic Island has 23 bays and beaches — 14 of them fishable — with wrecks, shoals and mangroves, plus offshore runs of up to 50 nautical miles to the reef shoals.",
    ],
    season: "Reef species are targeted year-round, weather permitting, on both day and night trips. Spotted mackerel and tuna are trolled around Magnetic Island's bays. Coral reef fin fish closures apply around October and November.",
  },
  'daintree': {
    n: 'Daintree', short: 'Daintree', in: 'on the Daintree', parent: 'queensland', c: ['daintree'], state: 'QLD',
    intro: [
      "The Daintree River is the region's largest river, with more than 25km of navigable water lined by mangroves and World Heritage rainforest. Trips leave from the wharf and ramp near the Daintree River ferry crossing.",
      "Barramundi are the main target, caught on lures year-round outside the closed season, and on calm days guides can add the islands, wrecks and inshore reefs off the river mouth, such as Snapper Island. With plenty of saltwater crocodiles and birdlife, many trips double as nature tours.",
    ],
    season: "Barramundi bite every month, with the best fishing from about September to March — but the east-coast barramundi closed season runs from 1 November to 31 January, when guides switch to other species.",
  },
  'weipa': {
    n: 'Weipa & Cape York', short: 'Weipa', in: 'in Weipa', parent: 'queensland', c: ['weipa', 'cape york'], state: 'QLD',
    intro: [
      "Weipa sits on Albatross Bay on the Gulf side of Cape York, about an hour's flight from Cairns, which makes it one of the most accessible remote fishing towns in Australia. South-easterly winds blow offshore for around nine months of the year, keeping the Gulf side fishable.",
      "Guides fish the Mission, Embley, Wenlock and Archer river systems for barramundi, threadfin and jacks, and the flats, beaches and headlands for permit, golden trevally, queenfish and tuna. Most visitors book multi-day packages with accommodation, meals and transfers, and much of the fishing is catch and release.",
    ],
    season: "The guiding season runs from about late March to mid-December; most operators don't run in the wet. Longtail tuna are most prolific from April to July, and Spanish mackerel are around year-round, moving inshore in winter.",
  },
  'karumba': {
    n: 'Karumba & the Gulf', short: 'Karumba', in: 'in Karumba', parent: 'queensland', c: ['karumba'], state: 'QLD',
    intro: [
      "Karumba, at the mouth of the Norman River on the Gulf of Carpentaria, is a classic Gulf fishing town. Estuary trips fish the sheltered Norman River and nearby creeks for barramundi, king and blue threadfin, black jewfish and grunter.",
      "Offshore trips run 40–50km into the Gulf for Spanish mackerel, cobia, fingermark and queenfish when the weather allows, and remote camping trips reach lightly fished rivers around Karumba and Normanton.",
    ],
    season: "Dedicated barramundi trips run from about February to April and again in September and early October; barramundi can't be targeted during the Gulf closed season, which starts on 7 October. Offshore species are fished year-round, weather permitting.",
  },

  'hinchinbrook': {
    n: 'Hinchinbrook & Lucinda', short: 'Hinchinbrook', in: 'around Hinchinbrook and Lucinda', parent: 'queensland', c: ['hinchinbrook', 'lucinda', 'cardwell', 'ingham', 'missionary bay'], state: 'QLD',
    intro: [
      "The Hinchinbrook Channel — a protected, mangrove-lined passage between Hinchinbrook Island and the mainland — is one of north Queensland's best-known barramundi fisheries. Guides launch from the Dungeness ramp at Lucinda, about 15 minutes from Ingham, or from Cardwell for Missionary Bay at the island's northern end.",
      "Besides barramundi, the channel's creeks, flats, rock bars and drains hold mangrove jack, fingermark, threadfin salmon, trevally, queenfish and grunter, and the 5 km Lucinda sugar-loading jetty acts as a giant fish-attracting structure. In good weather larger boats run out to the Great Barrier Reef. It's about 1.5 hours north of Townsville.",
    ],
    season: "Barramundi are the headline species outside the east-coast closed season (1 November to 31 January). Mangrove jack, fingermark, threadfin salmon, trevally and queenfish can be fished year-round, including during the barra closure. Estuarine crocodiles live in the channel, so keep well back from the water's edge.",
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
    season: "In the Top End, the run-off after the wet season (roughly March to May) is the classic barra window, as fish push through flooded creeks and floodplains. The build-up (October to December) is hot and humid but can produce big fish on lures. On Queensland's east coast, barramundi have a closed season from 1 November to 31 January.",
    faq: [
      ["Do barramundi charters keep the fish?", "Possession and size limits apply in both the Northern Territory and Queensland, and many guides encourage releasing big breeding fish. Your guide will know the current rules for the waters you're fishing."],
    ],
  },
  'marlin': {
    kind: 'species', n: 'Marlin', short: 'Marlin', h1: 'Marlin Fishing Charters', in: 'for marlin', noun: 'marlin charter',
    sp: ['marlin', 'black marlin', 'striped marlin', 'blue marlin'],
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

for (const [k, L] of Object.entries(LOCS)) L.key = k;

export const STATE_KEYS = ['new-south-wales', 'queensland', 'northern-territory'];
export const CITY_KEYS = ['sydney', 'gold-coast', 'brisbane', 'sunshine-coast', 'cairns', 'whitsundays', 'port-douglas', 'darwin', 'port-stephens', 'hervey-bay'];
export const SPECIES_KEYS = Object.keys(LOCS).filter((k) => LOCS[k].kind === 'species');
export const isSpecies = (L) => L && L.kind === 'species';

// A destination/species page only exists while it has enough real operators
// (states: 1+, everything else: MIN_LOC_ITEMS+). Below that it 404s and drops
// out of links, the sitemap and the footer automatically.
export const MIN_LOC_ITEMS = 2;
export function liveLocKeys(cards) {
  return Object.keys(LOCS).filter((k) => {
    const n = locItems(cards, LOCS[k]).length;
    // L.min lets a high-demand destination with a full guide go live with fewer listings.
    return LOCS[k].st ? n >= 1 : n >= (LOCS[k].min || MIN_LOC_ITEMS);
  });
}
export const isLive = (cards, key) => liveLocKeys(cards).includes(key);
// Live destination pages inside a state (for state hub pages), largest first.
export function childLocs(cards, stateKey) {
  return liveLocKeys(cards).filter((k) => LOCS[k].parent === stateKey)
    .sort((a, b) => locItems(cards, LOCS[b]).length - locItems(cards, LOCS[a]).length);
}
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
    // exact species names (so "Golden Snapper" doesn't land on the Snapper page)
    const tags = [...(card.species_tags || []), ...(card.species || [])].map((s) => s.toLowerCase());
    return L.sp.some((x) => tags.includes(x));
  }
  if (L.tt) {
    const tags = (card.trip_type_tags || []).map((s) => s.toLowerCase());
    return L.tt.some((x) => tags.includes(x));
  }
  if (L.st) return card.state === L.st;
  // Listings carry their assigned hot spot; use it exactly when present (so e.g.
  // "Manly, Brisbane & Moreton Bay" never lands on the Sydney page). Location-text
  // matching is only a fallback for listings without one.
  if (card.hotspot) return card.hotspot === L.key || (card.also_serves || []).includes(L.key);
  const loc = (card.location || '').toLowerCase();
  return (L.c || []).some((x) => loc.includes(x));
}
export const activeCards = (cards) => cards.filter((c) => c.status === 'active');
// Listings with real photos first (stable otherwise) — completeness/photo quality drives ranking.
export const photoFirst = (cards) => cards.map((c, i) => [c, i]).sort((a, b) => (!!b[0].image - !!a[0].image) || a[1] - b[1]).map(([c]) => c);
// Listings based at the destination first, then nearby operators that also run trips there.
export const locItems = (cards, L) => {
  const items = photoFirst(activeCards(cards).filter((c) => inLoc(c, L)));
  const home = (c) => (L.key && c.hotspot && c.hotspot !== L.key ? 1 : 0);
  return items.map((c, i) => [c, i]).sort((a, b) => home(a[0]) - home(b[0]) || a[1] - b[1]).map(([c]) => c);
};

// Best-matching location page for an operator card: a city page first, else its state page.
export function locFor(card) {
  if (card.hotspot && LOCS[card.hotspot] && !isSpecies(LOCS[card.hotspot])) return [card.hotspot, LOCS[card.hotspot]];
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
  return { heading: `${L.n}: what to know`, paras: L.intro, sections: L.sections || [], compare: [], compareTitle: '', faq };
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
  // sections: [{ h: 'Where the charters fish', p: ['…'], items: [['Name', 'detail'], …] }]
  return { heading: `Fishing ${L.in}`, paras: L.intro, sections: L.sections || [], compare: !L.st && items.length <= 20 ? compareRows(items) : [], compareTitle: `Compare fishing charters ${L.in}`, faq };
}

// One row per listing for the "compare charters" table on destination pages.
const STYLE_SHORT = [['Private Charter', 'Private'], ['Shared Charter', 'Shared'], ['Game Fishing', 'Game'], ['Reef Fishing', 'Reef'],
  ['Sportfishing', 'Sportfishing'], ['Barramundi Fishing', 'Barra'], ['Estuary Fishing', 'Estuary'], ['River Fishing', 'River'],
  ['Fly Fishing', 'Fly'], ['Offshore', 'Offshore'], ['Multi-Day', 'Multi-day']];
export function compareRows(items) {
  return (items || []).map((c) => ({
    slug: c.slug, name: c.name,
    from: (c.location || '').split(',')[0].trim(),
    styles: STYLE_SHORT.filter(([t]) => (c.trip_type_tags || []).includes(t)).map(([, s]) => s).slice(0, 4).join(', '),
    duration: c.duration || '',
    price: c.price ? `${money(c.price)} / ${/person/.test(c.priceUnit) ? 'person' : 'group'}` : 'On enquiry',
    species: (c.species || []).slice(0, 3).join(', '),
  }));
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
        crumbs(locTrail(key, L)),
        itemList(items),
        ...(isSpecies(L) ? [] : [{
          '@type': 'TouristDestination', '@id': SITE + path + '#destination', name: L.n,
          description: clip((L.intro || [])[0] || '', 300),
          ...(L.state ? { containedInPlace: { '@type': 'State', name: STATE_NAMES[L.state] || L.state } } : {}),
          touristType: 'Recreational fishing',
        }]),
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

// ── charter page guide content (shared by the SSR worker and the app) ───────
// Everything here is derived from the verified listing record, so it can be
// shown to people, search engines and AI assistants without extra checking.
const STYLE_ORDER = ['Game Fishing', 'Reef Fishing', 'Sportfishing', 'Barramundi Fishing', 'Estuary Fishing', 'River Fishing',
  'Fly Fishing', 'Lure Fishing', 'Offshore', 'Deep Sea', 'Bay Fishing', 'Harbour Fishing', 'Light Tackle', 'Great Barrier Reef'];
const hrs = (h) => (h >= 24 ? `${Math.round(h / 24)} ${Math.round(h / 24) === 1 ? 'day' : 'days'}` : `${h} ${h === 1 ? 'hour' : 'hours'}`);
function durationRange(trips) {
  const h = trips.map((t) => t.duration_hours).filter((x) => x > 0);
  if (!h.length) return '';
  const lo = Math.min(...h), hi = Math.max(...h);
  return lo === hi ? hrs(lo) : `${hrs(lo).replace(/ hours?$/, hi < 24 ? '' : ' hours')}${hi < 24 ? '–' : ' – '}${hrs(hi)}`;
}
const an = (w) => (/^[aeiou]/i.test(w) ? 'an' : 'a');
const capacityOf = (op) => Math.max(0, op.max_capacity || 0, ...(op.trips || []).map((t) => t.max_group || 0));
function townOf(op) {
  const t = (op.primary_location || '').split(',')[0].trim();
  return t;
}
// The destination page a charter belongs to (city/region page if it has one).
function charterPlace(op, cards) {
  const card = (cards || []).find((c) => c.slug === op.slug) || { location: op.primary_location, state: op.state, hotspot: op.hotspot };
  const lf = locFor(card);
  const L = lf && !lf[1].st ? lf[1] : null;
  return { key: L ? lf[0] : null, L, in: L ? L.in : `in ${STATE_NAMES[op.state] === 'Northern Territory' ? 'the Northern Territory' : STATE_NAMES[op.state] || op.state}`, short: L ? L.short : '' };
}
function styleWords(op) {
  const tags = op.trip_type_tags || [];
  const mode = tags.includes('Private Charter') && tags.includes('Shared Charter') ? 'private and shared'
    : tags.includes('Private Charter') ? 'private' : tags.includes('Shared Charter') ? 'shared' : '';
  const kinds = STYLE_ORDER.filter((t) => tags.includes(t)).slice(0, 2)
    .map((t) => ({ Sportfishing: 'sport', 'Light Tackle': 'light-tackle', 'Deep Sea': 'deep-sea', 'Great Barrier Reef': 'Great Barrier Reef' })[t]
      || t.replace(/ Fishing$/, '').toLowerCase());
  return { mode, kinds };
}
const MONTHS = /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i;
// Lower-case a list item's first letter for mid-sentence use, but leave
// acronyms ("BYO"), proper nouns we can spot and month names alone.
const lc = (x) => (/^[A-Z][a-z]/.test(x) && !MONTHS.test(x) ? x[0].toLowerCase() + x.slice(1) : x);
function seasonOf(op, name) {
  const s = (op.all_species || []).find((x) => x.name === name);
  return s && s.season ? s.season : '';
}

export function charterGuide(op, cards) {
  const place = charterPlace(op, cards);
  const trips = op.trips || [];
  const ct = cheapestTrip(op);
  const cap = capacityOf(op);
  const town = townOf(op);
  const tags = op.trip_type_tags || [];
  const exp = op.experience_tags || [];
  const areas = op.areas_fished || [];

  const facts = [];
  facts.push(['Location', [town, place.L ? place.L.n : ''].filter((x, i, a) => x && a.indexOf(x) === i).join(', ') + (op.state ? `, ${op.state}` : '')]);
  if (op.departure_address) facts.push(['Departs from', op.departure_address]);
  if (areas.length) facts.push(['Fishing grounds', list(areas.slice(0, 6))]);
  const styles = tags.filter((t) => t !== 'Half Day' && t !== 'Full Day' && t !== 'Family Friendly');
  if (styles.length) facts.push(['Trip styles', styles.join(', ')]);
  if (trips.length) facts.push(['Trips', `${trips.length} ${plural(trips.length, 'trip', 'trips')}${durationRange(trips) ? ` · ${durationRange(trips)}` : ''}`]);
  facts.push(['Price', ct ? `From ${money(ct.price)} ${unitText(ct.price_model)}` : 'Price on enquiry']);
  if (cap) facts.push(['Group size', `Up to ${cap} guests`]);
  if ((op.primary_species || []).length) facts.push(['Target species', op.primary_species.join(', ')]);
  if (exp.length) facts.push(['Suits', exp.join(', ')]);
  const boat = [op.boat_name, [op.boat_length_m && `${op.boat_length_m}m`, op.boat_type].filter(Boolean).join(' ')].filter(Boolean);
  if (boat.length) facts.push(['Boat', boat.join(' — ')]);
  if (op.years_in_business) facts.push(['In business', `${op.years_in_business}+ years`]);

  const N = op.name;
  const faq = [];
  // Where
  {
    const base = [town, place.L && !town.includes(place.short) ? place.L.n : ''].filter(Boolean).join(', ');
    let a = `${N} departs from ${base || (STATE_NAMES[op.state] || op.state)}.`;
    if (op.departure_address) a += ` Meeting point: ${op.departure_address.replace(/\.$/, '')}.`;
    if (areas.length) a += ` Trips fish ${list(areas.slice(0, 6))}.`;
    if (place.L) a += ` See all fishing charters ${place.in} on Hooked Trips to compare nearby operators.`;
    faq.push([`Where does ${N} depart from?`, a]);
  }
  // Price
  {
    const priced = trips.filter((t) => t.price > 0).sort((a, b) => a.price - b.price).slice(0, 4);
    const a = priced.length
      ? `${list(priced.map((t) => `${t.name}${t.duration_hours ? ` (${hrs(t.duration_hours)})` : ''} is ${money(t.price)} ${unitText(t.price_model)}`))}. Prices are as published by the operator — confirm the current price when you enquire.`
      : `${N} doesn't publish prices online. Send an enquiry through Hooked Trips with your dates and group size for a quote.`;
    faq.push([`How much does a fishing charter with ${N} cost?`, a]);
  }
  // Species
  if ((op.primary_species || []).length) {
    const sp = (op.species_tags && op.species_tags.length ? op.species_tags : op.primary_species).slice(0, 8)
      .map((x) => (seasonOf(op, x) ? `${x} (${lc(seasonOf(op, x))})` : x));
    faq.push([`What fish can you catch with ${N}?`, `${N} targets ${list(sp)}. What's biting depends on the season and conditions on the day.`]);
  }
  // Group size / private vs shared
  {
    const bits = [];
    if (cap) bits.push(`Trips take up to ${cap} guests.`);
    if (tags.includes('Private Charter')) bits.push('Private charters book the whole boat for your group.');
    if (tags.includes('Shared Charter')) bits.push('Shared trips let individuals and small groups join other anglers.');
    if (bits.length) faq.push([`How many people can go on ${an(N)} ${N} trip?`, bits.join(' ')]);
  }
  // Suitability
  {
    const ok = ['Beginner Friendly', 'Families', 'Kids Welcome'].filter((t) => exp.includes(t));
    if (ok.length) {
      const who = ok.map((t) => ({ 'Beginner Friendly': 'beginners', Families: 'families', 'Kids Welcome': 'kids' })[t]);
      faq.push([`Is ${N} suitable for ${list(who)}?`, `Yes. ${N} welcomes ${list(who)}${exp.includes('Experienced Anglers') ? ', and also suits experienced anglers' : ''}. Mention who's coming when you enquire so the crew can plan the right trip.`]);
    }
  }
  // Inclusions
  if ((op.whats_included || []).length) {
    let a = `${N} includes ${list(op.whats_included.slice(0, 8).map(lc))}.`;
    if ((op.what_to_bring || []).length) a += ` Bring ${list(op.what_to_bring.slice(0, 6).map(lc))}.`;
    faq.push([`What's included on ${an(N)} ${N} trip?`, a]);
  }
  // Operator-specific questions (researched and sourced per listing)
  for (const f of op.faqs || []) if (f && f.q && f.a) faq.push([f.q, f.a]);
  if (LICENCE[op.state]) faq.push(LICENCE[op.state]);

  return { facts, faq, place, highlights: op.highlights || [], lead: op.lead || '' };
}

export function charterMeta(op, cards) {
  const place = charterPlace(op, cards);
  const town = townOf(op);
  const nameL = (op.name || '').toLowerCase();
  // Lead with the destination people search for ("Hervey Bay"), not the marina suburb.
  // Only fall back to the departure town when the listing has no destination page.
  const where = place.L ? (nameL.includes(place.short.toLowerCase()) ? '' : place.short) : (town && !nameL.includes(town.toLowerCase()) ? town : '');
  let t;
  if (!where) t = `${op.name} – ${/fishing|charter/i.test(op.name) ? 'Trips & Prices' : 'Fishing Charter Trips & Prices'}`;
  else if (/fishing|charter/i.test(op.name)) t = `${op.name}, ${where}`;
  else t = `${op.name} – ${where} Fishing Charter`;
  // Long operator names: drop the brand suffix rather than truncate the useful part.
  const title = `${t} | ${BRAND}`.length <= 65 ? `${t} | ${BRAND}` : t;

  const sp = (op.primary_species || []).slice(0, 3);
  const ct = cheapestTrip(op);
  const { mode, kinds } = styleWords(op);
  const what = [mode, kinds.length ? list(kinds) : '', 'fishing charters'].filter(Boolean).join(' ');
  const from = town && place.short && !place.short.toLowerCase().includes(town.toLowerCase()) && !town.toLowerCase().includes(place.short.toLowerCase()) ? ` from ${town}` : '';
  const mk = (fromTxt, nSp) => `${op.name} runs ${what} ${place.L ? place.in : town ? `from ${town}` : place.in}${place.L ? fromTxt : ''}`
    + (nSp ? `, targeting ${list(sp.slice(0, nSp))}` : '') + '.' + (ct ? ` From ${money(ct.price)} ${unitText(ct.price_model)}.` : '');
  // Keep it to ~160 characters: drop the suburb, then trim the species list.
  let desc = [[from, 3], ['', 3], ['', 2], ['', 1], ['', 0]].map(([f, k]) => mk(f, Math.min(k, sp.length))).find((d) => d.length <= 160) || mk('', 0);
  const tail = ' Compare trips and enquire direct.';
  if ((desc + tail).length <= 160) desc += tail;

  const path = '/charters/' + op.slug;
  const url = SITE + path;
  const imgs = charterImages(op);
  const image = op.og_image
    ? { url: SITE + op.og_image, width: 1200, height: 630, alt: op.name }
    : imgs[0] ? { url: imgs[0], alt: op.name } : DEFAULT_IMAGE;

  const trips = op.trips || [];
  const prices = trips.map((x) => x.price).filter((x) => x > 0);
  const g = charterGuide(op, cards);
  const sameAs = [op.website, op.facebook, op.instagram, ...(op.same_as || [])].filter((u) => /^https?:\/\//.test(u || ''));
  const areas = [place.L && place.L.n, ...(op.areas_fished || []), ...(op.location_tags || [])].filter((x, i, a) => x && a.indexOf(x) === i);
  const biz = {
    '@type': 'LocalBusiness',
    '@id': url + '#business',
    name: op.name,
    description: clip(op.lead || op.description, 300),
    url,
    address: {
      '@type': 'PostalAddress',
      ...(op.departure_address ? { streetAddress: op.departure_address } : {}),
      addressLocality: town || undefined,
      addressRegion: STATE_NAMES[op.state] || op.state,
      addressCountry: 'AU',
    },
    areaServed: areas.map((n) => ({ '@type': 'Place', name: n })),
  };
  if (sameAs.length) biz.sameAs = sameAs;
  if ((op.species_tags || op.primary_species || []).length) biz.knowsAbout = [...new Set([...(op.species_tags || []), ...(op.primary_species || [])])].map((s) => `${s} fishing`);
  if (op.latitude && op.longitude) biz.geo = { '@type': 'GeoCoordinates', latitude: op.latitude, longitude: op.longitude };
  if (imgs.length) biz.image = imgs;
  if (prices.length) {
    const lo = Math.min(...prices), hi = Math.max(...prices);
    biz.priceRange = lo === hi ? money(lo) : `${money(lo)}–${money(hi)}`;
  }
  if (trips.length) {
    biz.makesOffer = trips.map((x) => {
      const d = [x.duration_hours && hrs(x.duration_hours), x.departure_time && `departs ${x.departure_time}`,
        x.max_group && `up to ${x.max_group} guests`, (x.target_species || []).length && `targets ${list(x.target_species.slice(0, 4))}`].filter(Boolean).join(', ');
      const o = { '@type': 'Offer', name: x.name, itemOffered: { '@type': 'TouristTrip', name: x.name, ...(d ? { description: d } : {}), provider: { '@id': url + '#business' } } };
      if (x.price > 0) {
        o.price = x.price;
        o.priceCurrency = 'AUD';
        o.priceSpecification = { '@type': 'UnitPriceSpecification', price: x.price, priceCurrency: 'AUD', unitText: unitText(x.price_model) };
      }
      return o;
    });
  }
  const trail = charterTrail(op, cards);
  const faqLd = { '@type': 'FAQPage', '@id': url + '#faq', mainEntity: g.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) };

  return {
    title, desc, path, robots: ROBOTS_INDEX, image,
    ld: { '@context': 'https://schema.org', '@graph': [biz, crumbs(trail), faqLd] },
  };
}

// Up to `max` other charters for internal linking: same city page first, then same state.
// Breadcrumb trail for a charter page: Home › Fishing Charters › <city or state> › <operator>
export function charterTrail(op, cards) {
  const card = (cards || []).find((c) => c.slug === op.slug) || { location: op.primary_location, state: op.state };
  const lf = locFor(card);
  const trail = lf ? locTrail(lf[0], lf[1]) : [['Home', '/'], ['Fishing Charters', '/charters']];
  trail.push([op.name, '/charters/' + op.slug]);
  return trail;
}
export function locTrail(key, L) {
  const t = [['Home', '/'], ['Fishing Charters', '/charters']];
  if (L.parent && LOCS[L.parent]) t.push([LOCS[L.parent].n, '/fishing-charters/' + L.parent]);
  t.push([L.n, '/fishing-charters/' + key]);
  return t;
}

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
  // Works on a full record or a listing card (cards carry max_capacity + whole).
  const trips = op.trips || [];
  if (size === 'whole') return op.whole ?? (trips.some((t) => !/person/.test(t.price_model || '')) || (op.trip_type_tags || []).some((t) => /private/i.test(t)));
  const need = parseInt(String(size).split('-').pop(), 10) || 1;
  const cap = Math.max(0, ...trips.map((t) => t.max_group || 0), op.max_capacity || 0);
  // Unknown capacity: keep the listing rather than hide a possible fit.
  return cap === 0 || cap >= need;
}

export const FILTER_SPECIES = ['Barramundi', 'Marlin', 'Kingfish', 'Snapper', 'Golden Snapper', 'Coral Trout', 'Red Emperor', 'Giant Trevally', 'Spanish Mackerel', 'Mahi Mahi', 'Tuna', 'Mangrove Jack', 'Flathead'];
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
