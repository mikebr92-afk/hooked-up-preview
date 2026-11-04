# Queensland: state knowledge (agent: state-qld)

Big state. When the orchestrator gives a scope, run as **south** (Gold Coast → Agnes Water/1770 + Yeppoon) or
**north** (Mackay → Cape York / Gulf).

## Hot spots
| Key | Name | Notes |
|---|---|---|
| gold-coast | Gold Coast | Main Beach / Mariners Cove, Runaway Bay; Seaway bar |
| brisbane | Brisbane & Moreton Bay | Manly, Sandstone Point; South Passage bar; snapper closure 15 Jul–15 Aug |
| sunshine-coast | Sunshine Coast | Mooloolaba, Noosa, Caloundra |
| rainbow-beach | Rainbow Beach & Tin Can Bay | Full days, Double Island Point |
| hervey-bay | Hervey Bay & K'gari | Urangan; sportfishing flats |
| bundaberg | Bundaberg | Burnett Heads, no bar |
| agnes-water | Agnes Water & 1770 | **min 1 (high demand)**; Round Hill Creek bar; Bunker Group |
| gladstone | Gladstone | Liveaboards to Bunker Group, Swains, Coral Sea |
| yeppoon | Yeppoon & Capricorn Coast | Rosslyn Bay; Keppels, Swains liveaboards |
| mackay | Mackay | |
| whitsundays | Whitsundays | Airlie Beach, Hamilton Island, Cape Gloucester |
| townsville | Townsville | + Magnetic Island |
| hinchinbrook | Hinchinbrook & Lucinda | Barra channel; crocodiles |
| cairns | Cairns | Marlin Marina; giant black marlin Sep–Dec; reef tax |
| port-douglas | Port Douglas | |
| daintree | Daintree | |
| weipa | Weipa & Cape York | |
| karumba | Karumba & the Gulf | |
| bowen / mission-beach / cooktown | — | **no listings yet** (gaps) |

## Held, and leads to confirm by phone
- **Held:**
  - Reef Fish & Dive 1770 (07 4974 7906): site down; boat advertised for sale in 2024.
  - Gone Fishing Cooktown (0409 942 597).
  - Big Fish Down Under (Cairns; newest content 2023).
  - Deep End Fishing Charters (Mooloolaba).
  - Hot Reels Pro Fish (Hervey Bay).
  - Reef & River Charters (Gold Coast; FishingBooker only).
- **Leads:**
  - Fishing Offshore 1770 (Facebook only).
  - Kurrimine Boat Hire & Fishing Charters (Mission Beach area): 0411 845 345.
  - Gladstone Fishing Charters & Eco Tours (day charter).
  - Pegasus Fishing Charter (Bowen): 0409 662 750.
  - South Pacific II (Lizard Island mothership).
- **Closed:**
  - Hooked Up Fishing Adventures (Mission Beach; account suspended).
  - 1770 Creek2Reef.
  - Tura Charters.
  - Norval Reef Charters.
  - Cooktown Reef / Barra / Bluewater Charters (dead domains).

## Watchlist
- Daintree River Fishing (David Patterson): rates valid only to Mar 2026; inner pages 404.
- Fish's Fly & Sportfishing (Weipa): fly side rebranded Flux Fly Fishing (fluxflyfishing.com), new owner Kurt
  Rowlands. Owner to decide whether to rename the listing.
- Hooked On 1770: "restructuring" from Dec 2026; dates released at short notice. No photos yet (site images <500px).
- Night Crossing and Eastern Voyager (Gladstone) share a booking phone.
- Frenzy Charters: under new management. Hooker 1 and Kanimbla: no 2025–26 dated content.
- Mackay Fly & Sportfishing: nothing dated after 2023. Carpentaria Barra: inner pages 404.
- Norseman (Port Douglas): site $300 vs listing $350.
- Ian Moody Sportfishing: third-party evidence only; site "under construction".

## Rules notes
- **Closures:**
  - Barramundi (east coast): 1 Nov–31 Jan per the fisheries department (DAF); some councils and operators say midday
    1 Nov to midday 1 Feb.
  - Snapper and pearl perch: 15 Jul–15 Aug.
  - Coral reef fin fish spawning closures in Oct/Nov (2026: 8–12 Oct, 6–10 Nov).
  - Northern Spanish mackerel closures (2026: 8–29 Oct, 6–27 Nov; from operator sites, so check).
- **Licence:** no general saltwater licence. A Stocked Impoundment Permit is needed for some dams.
- **Marine park:** GBR Marine Park zoning (green zones).
- **Sources:** DAF pages block the pipeline, so cite and verify carefully.

## Research files
- `ops/research/r1-qld_south-hotspots.json`
- `ops/research/r1-qld_north-hotspots.json`
- `ops/research/r2-gap_capricorn-hotspots.json`
- `ops/research/r2-gap_nq-hotspots.json`


## Research notes, round 4 SEO/GEO (qld_south, Nov 2026)

```
QLD SOUTH - ROUND 4 SEO/GEO KNOWLEDGE UPDATES (checked 2026-11-04)
For ops/states/qld.md. Research text is on branch operator-images/state-qld-south-r4 under research/<slug>/.

WATCHLIST: RESOLVED OR UPDATED
- Hooked On 1770: still trading. The calendar (1770tours.com/hooked/calendar.php) shows current prices of $450 full day and $320 half day, bookings open to 28-02-2027, and "from December 2026, charter dates will be released at short notice while we restructure". The older Pricing and Charters pages still show $400/$300 and private $2,800/$2,100, so private prices stay null. Site images are still under 500 px, so there are no photos yet. Keep it on the watchlist through the restructure.
- Frenzy Charters (Brisbane): confirmed "UNDER NEW MANAGEMENT". New booking phone 0421 922 713, email mickdragt@gmail.com. OWNER ACTION: update the stored phone/email (not agent-correctable). Prices unchanged. Fishing reports run to 17 Sep 2025. Inclusions now list lunch, afternoon tea and drinks; tea/toast on arrival is no longer mentioned, so the patch corrects this.
- Night Crossing / Eastern Voyager (Gladstone): both sites use the same booking phone, 0436 640 197. Eastern Voyager is very active (posts Feb and Jun 2026, "2027 Trips Open", owner Tony Quaill). Night Crossing's site still says "Fully booked 2023, book 2024 / 2025 now", (c) 2016, with no 2025-26 content anywhere (one web search). Patched with _flag "stale?". OWNER ACTION: phone 0436 640 197 and ask whether MV Night Crossing still runs Swains trips; if not, move it to held.
- Hooker 1 (Gold Coast): weak but current evidence (site images uploaded May 2025, live FareHarbor booking); reviews on the site are dated only to Feb 2024. Keep it listed; a phone check is optional.
- Kanimbla (Yeppoon): only the footer reads (c) 2026 (it auto-updates); trip reports stop in 2016, and the availability page just says to call 0429 159 233. One web search found nothing dated. Patched with _flag "stale?". OWNER ACTION: phone 0429 159 233.

NEW CONCERNS
- MV Mikat (Gladstone): site footer (c) 2023, trip reports undated, newest dated item 2024; one web search found nothing for 2025-26. Patched with _flag "stale?". OWNER ACTION: phone +61 400 697 242 (mikatchartersqld@gmail.com). Add to the watchlist.
- If Night Crossing, Kanimbla and MV Mikat all prove inactive, Gladstone falls to 1 listing (Eastern Voyager) and Yeppoon to 1 (Double Threat). Gap risk for the southern GBR liveaboard market.

CORRECTIONS MADE (in seo-patches.json)
- brisbane-fishing-tour: trip prices set to the one-angler tier (4 h $300, 6 h $400), so the "from" price is $300 not $400; tiers kept in the notes.
- bks-gold-coast-fishing-charters: calm-water trip price set to $450 (one person), with tiers in the notes.
- frenzy-charters-brisbane: whats_included, trip inclusions and description (meals) corrected under new management; private trip note "$2,720 for 8 + $260 per extra guest, max 12".
- noosa-bluewater-charters: added the three published private whole-boat trips ($2,695 / $3,245 / $3,795 for 5/7/9 h); added YouTube @noosafishing to same_as.
- rainbow-beach-fishing-charters: boat_type set to "Cougar catamaran" (renovated for 2026), max_capacity 10, trip max_group 10.
- All other listings: prices, trips, departure points and boats re-checked; no change needed.
- All 75 listing FAQs now carry a source URL to the exact operator page (the validator requires this).
- Empty areas_fished filled with generic but true values where the operator names no specific grounds (Gold Coast offshore reefs, Noosa offshore reefs, Mooloolaba offshore reefs, Rainbow Beach offshore reefs). Gold Coast boats only publish distances (half day 10-20 km, full day 10-35 km).

EASTERN VOYAGER DETAIL
- Swains trips are now described as Saturday to Saturday (they were Friday-based before). Prices unchanged: $3,900 for six nights, $4,350 for seven.

LEADS AND HELD (held.json)
- Fishing Offshore 1770: still QICA/Bookeasy listing only. 1770 Marina, 741 Captain Cook Dr; 8.2 m boat; since 1996; no phone, website or dated content. Keep it held.
- Australiana Charters (Rosslyn Bay / Gladstone liveaboard, Michael and Helen Ross): 0427 599 832. Its domain auscharters.com.au now redirects to a change.org petition. NEW LEAD: phone to confirm.
- Reef Fish & Dive 1770 / "Reef Fishing Charters 1770" (Southern Comfort, Noosa Cat): only directory pages, plus a boatsonline Noosa Cat 3100 commercial-vessel sale listing. Keep it held.
- Other Yeppoon Swains liveaboards seen in search (not verified): Capricorn Star, Carlo II (bnbfishing articles, undated), Bluewater Sail "Persephone" fish-and-sail (a sailing trip, not fishing-first; don't list).

RULES AND SOURCES
- Coral reef fin fish closure dates for 2027 were not found in search; the DAF page is said to list dates to 2028, but it blocks the pipeline. The guides give the 2026 dates (8-12 Oct, 6-10 Nov) and tell readers to check DAF or the Qld Fishing 2.0 app for later years. Hooked On 1770's calendar independently marks 6-10 Nov 2026 as "Reef Closure" (useful corroboration).
- Per news results, the GBR World Heritage Area gillnet ban takes effect by mid-2027 (commercial). Possible future note for the Capricorn/Yeppoon guides; not added.
- Official: https://www.daf.qld.gov.au/business-priorities/fisheries/closures/tidal/seasons ; https://www.gbrmpa.gov.au/know-your-zones

NEW REGION HUBS (regions.json)
- south-east-queensland: "South East Queensland" (gold-coast, brisbane, sunshine-coast)
- fraser-coast-bundaberg: "Fraser Coast & Bundaberg" (rainbow-beach, hervey-bay, bundaberg)
- southern-great-barrier-reef: "Southern Great Barrier Reef & Capricorn Coast" (agnes-water, gladstone, yeppoon)
- Add these keys to the state file and existing-keys once published.

GUIDES
- All 10 guides are complete objects: intro, season, sections, faq, sources. Every existing section and FAQ is kept. Each destination gets a sourced "Trip lengths and prices" section (Agnes Water: "Charter options and prices"), plus FAQs where there was room.
- State page: the intro no longer claims Cooktown listings (there are none; Gone Fishing Cooktown is held). It adds a "Northern Queensland fishing regions" section, a licence and Stocked Impoundment Permit line, a closure-dates note and two FAQs. The north agent may want to review the northern items.

SEARCH BUDGET: 11 of 25 WebSearches used.
```

## Current listings

<!-- AUTO:listings:start -->

_Generated 2026-11-04 from data/operators.json: 51 live listings._

### Cairns (`cairns`) — 6 listings, page live
- `cairns-reef-fishing` — Cairns Reef Fishing · Marlin Marina, Cairns · https://www.cairnsreeffishing.com.au/ · checked 2026-10-29
- `cairns-sportfishing` — Cairns Sportfishing · Portsmith, Cairns · https://www.cairnssportfishing.com.au/ · checked 2026-10-29
- `fish-tales-charters-cairns` — Fish Tales Charters · Marlin Marina, Cairns · https://fishtales.com.au/ · checked 2026-10-29
- `fnq-fishing-adventures-cairns` — FNQ Fishing Adventures · Cairns · https://www.fnqfishingadventures.com.au/ · checked 2026-10-29
- `tropic-barra-adventures-cairns` — Tropic Barra Adventures · Cairns · https://www.tropicbarraadventures.com.au/ · checked 2026-10-29
- `tropical-sportfisher-cairns` — Tropical Sportfisher · Cairns · https://www.tropicalsportfisher.com/ · checked 2026-10-29

### Gold Coast (`gold-coast`) — 5 listings, page live
- `bks-gold-coast-fishing-charters` — BKs Gold Coast Fishing Charters · Runaway Bay, Gold Coast · https://bksfishing.com.au/ · checked 2026-10-29
- `fish-the-deep-charters` — Fish The Deep Charters · Main Beach, Gold Coast · https://www.fishthedeep.com/ · checked 2026-10-29
- `hooker-1-fishing-charters-gold-coast` — Hooker 1 Fishing Charters · Main Beach, Gold Coast · https://goldcoastfishingtrips.net.au/ · checked 2026-10-29
- `top-gear-fishing-charters` — Top Gear Fishing Charters · Main Beach, Gold Coast · https://topgearfishingcharters.com.au/ · checked 2026-10-29
- `true-blue-fishing-charters` — True Blue Fishing Charters · Main Beach, Gold Coast · https://truebluefishing.com.au/ · checked 2026-10-29

### Brisbane & Moreton Bay (`brisbane`) — 4 listings, page live
- `brisbane-fishing-tour` — Brisbane Fishing Tour · Manly, Brisbane & Moreton Bay · https://www.brisbanefishingtour.com.au/ · checked 2026-10-29
- `fish-moreton` — Fish Moreton · Sandstone Point, Brisbane & Moreton Bay · https://www.fishmoreton.com.au/ · checked 2026-10-29
- `frenzy-charters-brisbane` — Frenzy Charters · Manly, Brisbane & Moreton Bay · https://www.frenzycharters.com.au/ · checked 2026-10-29
- `moreton-island-fishing-charters` — Moreton Island Fishing Charters · Manly, Brisbane & Moreton Bay · https://moretonislandfishingcharters.com.au/ · checked 2026-10-29

### Sunshine Coast (`sunshine-coast`) — 4 listings, page live
- `deep-sea-fishing-co-noosa` — Deep Sea Fishing Co. Noosa · Tewantin, Sunshine Coast · https://www.deepseafishingco.com.au/ · checked 2026-10-29
- `noosa-bluewater-charters` — Noosa Bluewater Charters · Noosaville, Sunshine Coast · https://noosabluefishing.com.au/ · checked 2026-10-29
- `saltys-fishing-charters-caloundra` — Salty's Fishing Charters · Caloundra, Sunshine Coast · https://saltyfishingcharters.com.au/ · checked 2026-10-29
- `what-a-catch-deep-sea-fishing` — What A Catch Deep Sea Fishing · Mooloolaba, Sunshine Coast · https://whatacatchfishing.com.au/ · checked 2026-10-29

### Whitsundays (`whitsundays`) — 4 listings, page live
- `airlie-beach-fishing-charters` — Airlie Beach Fishing Charters · Airlie Beach, Whitsundays · https://airliebeachfishingcharters.com.au/ · checked 2026-10-29
- `razorfish-whitsundays-fishing-charters` — Razorfish Whitsundays Fishing Charters · Cape Gloucester, Whitsundays · https://www.razorfishcharters.com.au/ · checked 2026-10-29
- `topnotch-game-fishing-hamilton-island` — Topnotch Game Fishing · Hamilton Island, Whitsundays · https://www.topnotchgamefishing.com.au/ · checked 2026-10-29
- `whitsunday-fishing-charters` — Whitsunday Fishing Charters · Airlie Beach, Whitsundays · https://www.whitsundayfishingcharters.com.au/ · checked 2026-10-29

### Gladstone (`gladstone`) — 3 listings, page live
- `eastern-voyager-gladstone` — Eastern Voyager · Gladstone · https://easternvoyager.com.au/ · checked 2026-10-29
- `mv-mikat-charters-gladstone` — MV Mikat Charters · Gladstone · https://mikatcharters.com.au/ · checked 2026-10-29
- `night-crossing-fishing-adventures-gladstone` — Night Crossing Fishing Adventures · Gladstone · https://nightcrossing.com.au/ · checked 2026-10-29

### Hinchinbrook & Lucinda (`hinchinbrook`) — 3 listings, page live
- `ian-moody-sportfishing-charters` — Ian Moody Sportfishing Charters · Cardwell, Hinchinbrook & Lucinda · https://www.facebook.com/Ian-Moody-Sportfishing-Charters-1906230329651429/ · checked 2026-10-29
- `crackajack-sportfishing-adventures` — Crackajack Sportfishing Adventures · Lucinda · https://crackfish.com/ · checked 2026-10-29
- `full-on-fishn-charters` — Full On Fish'n Charters · Lucinda · https://fullonfishn.com.au/ · checked 2026-10-29

### Port Douglas (`port-douglas`) — 3 listings, page live
- `akula-sportfishing-port-douglas` — Akula Sportfishing · Port Douglas · https://akulasportfishing.com.au/ · checked 2026-10-29
- `norseman-reef-fishing-port-douglas` — Norseman Reef Fishing · Port Douglas · https://mvnorseman.com.au/ · checked 2026-10-29
- `out-n-about-sportfishing-port-douglas` — Out n About Sportfishing · Port Douglas · https://www.outnaboutfishing.com.au/ · checked 2026-10-29

### Bundaberg (`bundaberg`) — 2 listings, page live
- `bundaberg-river-fishing-charters` — Bundaberg River Fishing Charters · Burnett Heads, Bundaberg · https://bundabergriverfishing.com.au/ · checked 2026-10-29
- `truansea-charters-bundaberg` — Truansea Charters · Burnett Heads, Bundaberg · https://truansea.com.au/ · checked 2026-10-29

### Daintree (`daintree`) — 2 listings, page live
- `daintree-river-fishing-david-patterson` — Daintree River Fishing and Photography Tours · Lower Daintree, Daintree · https://daintreefishing.com.au/ · checked 2026-10-29
- `sublime-sportfishing-adventures` — Sublime Sportfishing Adventures · Lower Daintree, Daintree · https://www.sublimesportfishing.com.au/ · checked 2026-10-29

### Hervey Bay & K'gari (`hervey-bay`) — 2 listings, page live
- `hervey-bay-fly-and-sportfishing` — Hervey Bay Fly and Sportfishing · Urangan, Hervey Bay & K'gari · https://herveybaysportfishing.com.au/ · checked 2026-10-29
- `saltwater-playground-hervey-bay` — Saltwater Playground Co. · Urangan, Hervey Bay & K'gari · https://www.saltwaterplayground.com.au/ · checked 2026-10-29

### Karumba & the Gulf (`karumba`) — 2 listings, page live
- `carpentaria-barra-sport-fishing-charters` — Carpentaria Barra & Sport Fishing Charters · Karumba · https://www.carpentariabarra.com.au/ · checked 2026-10-29
- `kerry-d-fishing-charters-karumba` — Kerry D Fishing Charters · Karumba · https://kerrydfishing.com.au/ · checked 2026-10-29

### Mackay (`mackay`) — 2 listings, page live
- `cast-and-catch-fishing-charters` — Cast and Catch Fishing Charters · Hay Point, Mackay · https://castandcatch.com.au/ · checked 2026-10-29
- `mackay-fly-sportfishing` — Mackay Fly & Sportfishing · Seaforth, Mackay · https://www.mackaysportfishing.com.au/ · checked 2026-10-29

### Rainbow Beach & Tin Can Bay (`rainbow-beach`) — 2 listings, page live
- `keely-rose-fishing-charters` — Keely Rose Fishing Charters · Rainbow Beach · https://keelyrosefishingcharters.com.au/ · checked 2026-10-29
- `rainbow-beach-fishing-charters` — Rainbow Beach Fishing Charters · Tin Can Bay · https://www.rainbowbeachfishing.com/ · checked 2026-10-29

### Townsville (`townsville`) — 2 listings, page live
- `audacity-charters-townsville` — Audacity Charters · Breakwater Marina, Townsville · https://audacitymarine.com.au/ · checked 2026-10-29
- `magnetic-island-fishing-charters` — Magnetic Island Fishing Charters · Horseshoe Bay, Townsville · https://www.magneticislandfishingcharters.com.au/ · checked 2026-10-29

### Weipa & Cape York (`weipa`) — 2 listings, page live
- `far-north-fishing-weipa` — Far North Fishing Weipa · Weipa · https://www.farnorthfishingweipa.com.au/ · checked 2026-10-29
- `fishs-fly-sportfishing-weipa` — Fish's Fly & Sportfishing · Weipa · https://www.weipaflyfish.com.au/ · checked 2026-10-29

### Yeppoon & Capricorn Coast (`yeppoon`) — 2 listings, page live
- `double-threat-charters-yeppoon` — Double Threat Charters Yeppoon · Rosslyn Bay, Yeppoon & Capricorn Coast · https://www.doublethreatchartersyeppoon.com.au/ · checked 2026-10-29
- `kanimbla-charters-yeppoon` — Kanimbla Charters · Rosslyn Bay, Yeppoon & Capricorn Coast · https://www.kanimblacharters.net.au/ · checked 2026-10-29

### Agnes Water & 1770 (`agnes-water`) — 1 listing, page live
- `hooked-on-1770-agnes-water` — Hooked On 1770 · Town of 1770, Agnes Water & 1770 · https://www.1770tours.com/ · checked 2026-10-29

<!-- AUTO:listings:end -->
