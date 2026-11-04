# New South Wales: state knowledge (agent: state-nsw)

Hot-spot keys are the page slugs (`/fishing-charters/<key>`). `primary_location` must end with the hot-spot name.
A destination page goes live at 2+ listings.

## Hot spots
| Key | Name | Notes |
|---|---|---|
| sydney | Sydney | Harbour, Manly, Rose Bay, Cronulla, Port Botany. Kingfish, jewfish, snapper; marlin offshore in summer |
| central-coast | Central Coast | Terrigal Haven, Hardys Bay / Broken Bay |
| newcastle | Newcastle & Lake Macquarie | Hunter River, Lake Macquarie, Swansea offshore reefs |
| port-stephens | Port Stephens | d'Albora Nelson Bay, Soldiers Point, Corlette; marlin grand-slam port |
| port-macquarie | Port Macquarie | Hastings estuary guides + offshore reefs |
| south-west-rocks | South West Rocks | Shelf close in; snapper/pearl perch, summer pelagics |
| coffs-harbour | Coffs Harbour | **1 listing, page not live**; Solitary Islands Marine Park zoning |
| yamba | Yamba & Iluka | Clarence River bar |
| ballina-byron | Ballina & Byron Bay | Brunswick Heads, Evans Head (pearl perch) |
| tweed | Tweed Coast | **1 listing, page not live** |
| wollongong | Wollongong | Wollongong Harbour, Kiama |
| jervis-bay | Jervis Bay & Shoalhaven | Huskisson, Greenwell Point; marine park |
| batemans-bay | Batemans Bay & Narooma | + Bermagui (tuna, deep water) |
| eden | Merimbula & Eden | Twofold Bay (no bar), shelf ~19 nm; game season Nov–Jul |
| lord-howe-island | Lord Howe Island | Kingfish, Balls Pyramid; marine park |

## Held, and leads to confirm by phone
- **B & L Fishing Charters (Swansea, Lake Macquarie offshore):** news stops in 2021. Strong candidate for Newcastle.
- **Solitary Island Fishing Charters (Wooli):** 0484 952 543. Wix site broken; Clarence Valley.
- **Reel Fishn (Tweed Marina):** 0411 151 755. Blank website; licence CFB22252 published.
- **Closed / not suitable:** KC's Fishing Charters (Coffs, reported closed), RU4Reel (dead domain), Headland Fishing Charters.

## Watchlist (verify on the next refresh)
- Fish Port Stephens Estuary Charters: newest post June 2023, tourism listing 404.
- Cushy Fishing Charters (Tweed): ©2023, VisitNSW 404.
- Escape Fishing Charters and Five Island Charters: sites not updated since 2019/2020, but on the DPI register (Apr 2024).
- Central Coast Reef & Game: little dated content.
- Byron Bay Charters: site says drinks only; the listing previously said lunch.
- Prices only on Rezdy (blocked): Coffs Harbour Fishing Charters, Cronulla Reef (also capacity 6 vs 9), Game On.
- Deep Blue Charters: third boat, Avalon IV, and a full-day game trip not yet listed.
- JB Fishing Charters: departure point not published.
- Reel Adventure Fishing: NSW licence NOT included (its FAQ).

## Rules notes
- Anglers on a boat with a NSW charter fishing licence are covered by the operator's licence. Otherwise the NSW
  recreational fishing fee applies.
- NSW DPI pages and the charter licence register block the fetch pipeline, so reuse facts already sourced in
  `ops/research/`.
- Marine parks: Jervis Bay, Solitary Islands, Cape Byron, Port Stephens–Great Lakes, Batemans; check zoning.

## Research files
- `ops/research/r1-nsw-hotspots.json`
- `ops/research/r2-gap_nsw-hotspots.json`


## Research notes, round 4 SEO/GEO (nsw, Nov 2026)

```
NSW round 4 (SEO/GEO) - knowledge updates for ops/states/nsw.md
Checked 2026-11-04. Pipeline branch: operator-images/state-nsw-r4 (research/r4-*, images/candidates/calm-water-fishing-tweed).
WebSearch used: 18 of 25.

== New listing (Tweed) ==
- Calm Water Fishing (slug calm-water-fishing-tweed), Pottsville / Tweed River (+ Gold Coast Broadwater tours).
  Estuary lure/soft-plastic charter, skipper Dan, 0411 400 124, dan@calmwaterfishing.com, https://www.calmwaterfishing.com/
  Half day 5 h $450 / full day 8 h $600 per boat, up to 4. Quintrex 540 Topender (5.7 m).
  Trading evidence: sitemap lastmod 2026-08-11 (booking services) and 2026-10-06 (store). Departure ramp not published.
  With Cushy this brings the Tweed to 2 listings (page can go live), but Cushy itself is on the watchlist (see below).

== Coffs Harbour: still 1 listing ==
- No new operator could be verified. Leads now in held.json:
  - Coffs Coast Sport Fishing Adventures ("Black N Blue", bluewater game/sport, estuary and eco tours, Coffs Harbour Intl Marina,
    $1,800 full day max 6). Own domain coffscoastsportfishing.com.au does not resolve; only an accommodation site (Beachfront Escapes)
    describes it. Needs phone/Facebook check.
  - Solitary Island Fishing Charters (Wooli) 0484 952 543, solitaryislandfc@outlook.com - Wix domain still dead.
- CLOSED: KC's Fishing Charters (Coffs) - Facebook post 18 Sep 2025 says it was forced to cease operations (marina costs). Confirms "closed".
- Coffs Coast tourism moved from coffscoast.com.au to coffscoast.com; its fishing article lists only Coffs Harbour Fishing Charters.
- Coffs Harbour Fishing Charters now lists three boats: A-Game (10 m Leisurecat), Ten-Men (11 m Leisurecat), 12 m Steber Custom Flybridge.
  Tripadvisor review Feb 2025 (added to same_as). Rezdy: 8 h Sport & Game Mixed $399 pp (added), South Solitary $350, whole-boat full day $3,050.
  Rezdy language versions conflict on half/3-4 day prices ($185-$299): owner to confirm.

== Tweed leads ==
- Northern Rivers Sportfishing (bass, Tweed River/Clarrie Hall Dam) 0409 760 380 - newest post Oct 2023, VisitNSW 404. Held.
- Reel Fishn (Tweed Marina) 0411 151 755 - domain no longer resolves. Held.
- RU4 Reel still appears in directories (dead domain per state file) - not listed.

== Watchlist results ==
- Fish Port Stephens Estuary Charters: blog still ends 2023; old portstephens.org.au 404, but the CURRENT tourism page is
  https://www.portstephens.com.au/products/fish-port-stephens-estuary-charters (fresh description, Book Now). Facebook added:
  https://www.facebook.com/fishportstephens. Email paul.lennon.fishing@gmail.com, 0434 370 687. Still no dated 2025-26 item -> _flag check-trading.
- Cushy Fishing Charters: still (c) 2023, VisitNSW page still 404 (but indexed in search), prices unchanged. No dated review found. _flag check-trading; phone.
- Escape Fishing Charters: still (c) 2019, nothing online since; only the DPI register (Apr 2024). _flag check-trading; phone 0407 891 688.
- Five Island Charters: content dated 2018-2020, prices unchanged; PlaySport shows even older prices. DPI register Apr 2024. _flag check-trading.
- Central Coast Reef & Game: prices unchanged, no dated content; VisitNSW hire page now 404, AGFG blocked. _flag check-trading; phone 0427 66 55 44.
- Byron Bay Charters: RESOLVED - price list lists Lunch for the full-day fishing charter (fishing page mentions drinks). Site now behind a bot check.
- Cronulla Reef: RESOLVED - capacity is 6 (Romanda "up to 6 people"); prices now on own site (Stripe links): private $1,750 (was $1,440),
  afternoon & sunset $1,050, kingfish & sports $1,750, boat hire/club rate 7 h $1,350, shared $250 pp. Fishing reports to 22 Oct 2026.
- Game On: Rezdy shows afternoon shared reef $230 (stored $195 corrected), morning shared $240, Twilight reef $220 (length unknown), private $3,200-$3,300.
- Deep Blue Charters: RESOLVED - three boats (Mahi Mahi II 25 pax, Avalon IV 23 pax, Mystery Bay 60 ft 28 pax) and a full-day Mahi Mahi II
  game trip ($3,000 up to 10). Trips added; max_capacity 28.
- JB Fishing Charters: site now states "8 hours on the water" and 20+ years. Departure point still not published; site has placeholder text. Latest date 2024.
- Reel Adventure Fishing: licence still NOT included (FAQ).
- Hammerhead (not on watchlist): footer (c) 2015, but embedded Facebook feed offers Fri 30 Oct / Sun 1 Nov dates (=2026). Trading. Phone 0498 479 420.

== Other corrections in seo-patches.json ==
- Blue Reef: added full-day game trip ($550 pp x 6 = $3,300, up to 8, all year).
- Sydney Premium: 6.5 h private from $1,740 (was $1,760).
- Evans Head: VisitNSW URL is now /things-to-do/tours/evans-head-fishing-charters (same_as updated).

== Bot checks (pipeline) ==
- These sites now serve a "One moment, please" bot check to the pipeline: byronbaycharters.com.au, sydneypremiumcharters.com.au,
  pacificbluecharters.com.au, wildsidesportfishing.com, kiamafishing.com.au, capnschartersnewcastle.com.au (partly). Facts came from the
  2026-10-29 fetch (operator-images/seo-nsw_north / seo-nsw_south). Next refresh may need WebSearch or a phone check for these.
- FishingBooker (403), localsearch (405), Tripadvisor (403), Instagram (429), Facebook (400) block the pipeline.

== Regions written (regions.json) ==
- nsw-north-coast (tweed, ballina-byron, yamba); mid-north-coast-nsw (coffs-harbour, south-west-rocks, port-macquarie);
  hunter-central-coast (port-stephens, newcastle, central-coast); nsw-south-coast (wollongong, jervis-bay, batemans-bay, eden).
  Sydney and Lord Howe stand alone.

== Guide fixes worth noting ==
- Jervis Bay intro previously said charters leave Huskisson on Currambene Creek - not published by JB Fishing; removed.
- Sydney intro previously listed Rozelle - no listed operator departs there; replaced with real departure points.
- Newcastle guide relied on B&L Fishing (Swansea, held since 2021) for offshore trips; offshore item/FAQ reworded around the DPI artificial reef.

== Gaps ==
- Coffs Harbour needs a 2nd operator (phone the held leads).
- Newcastle has no offshore operator listed (B&L still held).
- Several listings depend on 2019-2024 evidence plus the DPI register; a phone sweep of the check-trading flags is recommended.

== Official rule sources used ==
- https://www.dpi.nsw.gov.au/fishing/marine-protected-areas/marine-parks (Cape Byron, Solitary Islands, Port Stephens-Great Lakes, Jervis Bay, Batemans, Lord Howe)
- https://www.dpi.nsw.gov.au/fishing/recreational/resources/artificial-reef/ballina-offshore-artificial-reef
- https://www.dpi.nsw.gov.au/fishing/recreational/resources/artificial-reef/newcastle-offshore-artificial-reef
- https://www.dpi.nsw.gov.au/fishing/closures/location-closures/boambee-creek,-bonville-creek-and-pine-creek (Coffs creeks closure - check before fishing)
```

## Current listings

<!-- AUTO:listings:start -->

_Generated 2026-11-04 from data/operators.json: 43 live listings._

### Sydney (`sydney`) — 10 listings, page live
- `ambition-charters-sydney` — Ambition Game Fishing Charters · Watsons Bay, Sydney · https://ambitioncharters.com.au/ · checked 2026-10-29
- `blue-reef-fishing-charters-sydney` — Blue Reef Fishing Charters · Balmain, Sydney · https://www.bluereefcharters.info/ · checked 2026-10-29
- `cronulla-reef-fishing-charters` — Cronulla Reef Fishing Charters · Cronulla, Sydney · https://cronullareeffishingcharters.com/ · checked 2026-10-29
- `deep-blue-charters-sydney` — Deep Blue Charters · Rose Bay, Sydney · https://deepbluecharters.com.au/ · checked 2026-10-29
- `fishabout-tours-sydney` — Fishabout Tours · The Spit, Sydney · https://www.fishaboutsydney.com.au/ · checked 2026-10-29
- `reel-adventure-fishing-sydney` — Reel Adventure Fishing · Port Botany, Sydney · https://www.fishsydney.com.au/ · checked 2026-10-29
- `sydney-charter-fishing-manly` — Sydney Charter Fishing · Manly, Sydney · https://sydneycharterfishing.com.au/ · checked 2026-10-29
- `sydney-fly-fishing` — Sydney Flyfishing Tours · The Spit, Sydney · https://www.sydneyflyfishing.com.au/ · checked 2026-10-29
- `sydney-premium-charters-cronulla` — Sydney Premium Charters · Cronulla, Sydney · https://www.sydneypremiumcharters.com.au/ · checked 2026-10-29
- `wahoo-fishing-charters-sydney` — Wahoo Fishing Charters · Sydney Harbour, Sydney · https://wahoocharters.com.au/ · checked 2026-10-29

### Port Stephens (`port-stephens`) — 5 listings, page live
- `calypso-fishing-adventures` — Calypso Fishing Adventures · Corlette, Port Stephens · https://www.marlinfishingaustralia.com.au/ · checked 2026-10-29
- `fish-port-stephens-estuary-charters` — Fish Port Stephens Estuary Charters · Nelson Bay, Port Stephens · https://fishportstephensestuarycharters.com/ · checked 2026-10-29
- `hammerhead-charters-nelson-bay` — Hammerhead Fishing Charters · Nelson Bay, Port Stephens · https://hammerheadcharters.com.au/ · checked 2026-10-29
- `pacific-blue-fishing-charters-nelson-bay` — Pacific Blue Fishing Charters · Nelson Bay, Port Stephens · https://pacificbluecharters.com.au/ · checked 2026-10-29
- `reel-contagious-charters-port-stephens` — Reel Contagious Charters · Soldiers Point, Port Stephens · https://www.reelcontagiouscharters.com.au/ · checked 2026-10-29

### Batemans Bay & Narooma (`batemans-bay`) — 3 listings, page live
- `fishbermi-charters` — FishBermi Bermagui Fishing Charters · Bermagui, Batemans Bay & Narooma · https://www.fishbermicharters.com.au/ · checked 2026-10-29
- `game-on-charters-batemans-bay` — Game On Charters Batemans Bay · Batemans Bay · https://gameoncharters.net.au/ · checked 2026-10-29
- `narooma-charters` — Narooma Charters · Narooma · https://naroomacharters.com.au/ · checked 2026-10-29

### Merimbula & Eden (`eden`) — 3 listings, page live
- `freedom-charters-eden` — Freedom Charters · Eden · https://freedomcharters.com.au/ · checked 2026-10-29
- `fishpen-charters-merimbula` — Fishpen Charters · Merimbula · https://fishpen-charters.squarespace.com/ · checked 2026-10-29
- `sapphire-coastal-adventures-merimbula` — Sapphire Coastal Adventures · Merimbula · https://www.sapphirecoastaladventures.com.au/ · checked 2026-10-29

### Wollongong (`wollongong`) — 3 listings, page live
- `aquilla-fishing-charters-wollongong` — Aquilla Fishing Charters · Wollongong · https://www.aquillacharters.com.au/ · checked 2026-10-29
- `five-island-charters-wollongong` — Five Island Charters · Wollongong · https://www.fiveislandcharters.com.au/ · checked 2026-10-29
- `kiama-charter-service` — Kiama Charter Service · Kiama, Wollongong · https://kiamafishing.com.au/ · checked 2026-10-29

### Ballina & Byron Bay (`ballina-byron`) — 2 listings, page live
- `byron-bay-charters` — Byron Bay Charters · Brunswick Heads, Ballina & Byron Bay · https://byronbaycharters.com.au/ · checked 2026-10-29
- `evans-head-deep-sea-fishing-charters` — Evans Head Deep Sea Fishing Charters · Evans Head, Ballina & Byron Bay · https://www.evansheadfishingcharters.com.au/ · checked 2026-10-29

### Central Coast (`central-coast`) — 2 listings, page live
- `central-coast-reef-and-game-fishing-charters` — Central Coast Reef & Game Fishing Charters · Terrigal, Central Coast · http://www.reefandgamefishing.com/ · checked 2026-10-29
- `terrigal-fishing-tours` — Terrigal Fishing Tours · Hardys Bay, Central Coast · https://terrigalfishingtours.com.au/ · checked 2026-10-29

### Jervis Bay & Shoalhaven (`jervis-bay`) — 2 listings, page live
- `escape-fishing-charters-greenwell-point` — Escape Fishing Charters · Greenwell Point, Jervis Bay & Shoalhaven · https://www.escapefishingcharters.com.au/ · checked 2026-10-29
- `jervis-bay-fishing-charters-huskisson` — JB Fishing Charters · Huskisson, Jervis Bay & Shoalhaven · https://jbfishingcharters.com.au/ · checked 2026-10-29

### Lord Howe Island (`lord-howe-island`) — 2 listings, page live
- `sea-buoys-ocean-charters` — Sea Buoys Ocean Charters · Lord Howe Island · https://seabuoys.com.au/ · checked 2026-10-29
- `sea-to-summit-lord-howe-fishing` — Sea to Summit Expeditions · Lord Howe Island · https://www.lordhoweislandtours.net/charter-fishing · checked 2026-10-29

### Newcastle & Lake Macquarie (`newcastle`) — 2 listings, page live
- `capns-charters-newcastle` — Capn's Charters Newcastle · Tomago, Newcastle & Lake Macquarie · https://www.capnschartersnewcastle.com.au/ · checked 2026-10-29
- `day-trippin-charters` — Day Trippin Charters · Kilaben Bay, Newcastle · https://day-trippin-charters.squarespace.com/ · checked 2026-10-29

### Port Macquarie (`port-macquarie`) — 2 listings, page live
- `castaway-estuary-fishing-charters` — Castaway Estuary Fishing Charters · Port Macquarie · https://www.castawayfishing.com.au/ · checked 2026-10-29
- `port-macquarie-fishing-charters` — Port Macquarie Fishing Charters · Port Macquarie · https://www.portmacquariefishingcharters.com.au/ · checked 2026-10-29

### South West Rocks (`south-west-rocks`) — 2 listings, page live
- `south-west-rocks-fishing-charters` — The Rocks Fishing Charters · South West Rocks · https://www.southwestrocksfishcharters.com.au/ · checked 2026-10-29
- `wildside-sportfishing` — Wildside Sportfishing · South West Rocks · https://www.wildsidesportfishing.com/ · checked 2026-10-29

### Tweed Coast (`tweed`) — 2 listings, page live
- `calm-water-fishing-tweed` — Calm Water Fishing · Pottsville, Tweed Coast · https://www.calmwaterfishing.com/ · checked 2026-11-04
- `cushy-fishing-charters` — Cushy Fishing Charters · Tweed Heads · https://cushyfishingcharters.com.au/ · checked 2026-10-29

### Yamba & Iluka (`yamba`) — 2 listings, page live
- `go-fish-yamba-charters` — Go Fish Yamba Charters · Yamba · https://www.gofishyamba.com.au/ · checked 2026-10-29
- `yamba-fishing-and-charters` — Yamba Fishing and Charters · Yamba · https://www.yambafishingandcharters.com.au/ · checked 2026-10-29

### Coffs Harbour (`coffs-harbour`) — 1 listing, page NOT live (needs more listings)
- `coffs-harbour-fishing-charters` — Coffs Harbour Fishing Charters · Coffs Harbour · https://coffsharbourfishing.com.au/ · checked 2026-10-29

<!-- AUTO:listings:end -->
