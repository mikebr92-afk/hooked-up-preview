# Hooked Trips listings playbook (all state agents)

Hooked Trips (hookedtrips.com) is an Australian fishing charter directory. Customers find it through Google and AI
assistants, compare operators and send enquiries, which the owner passes on to the operator. **Every listing must be a
real, currently operating business with correct details.** Accuracy beats volume. A wrong or dead listing costs a
customer and the site's credibility.

Read this file, then your state file in `ops/states/<code>.md`. The orchestrator gives you an **output folder**; write
all deliverables there. Never edit site files (index.html, site-seo.js, worker.js, data/, images/).

## 1. The verification standard

A business can be listed only if:
- it is a commercial **fishing** charter or fishing-guide business, where fishing is the product or a clearly sold
  product. No boat hire, sightseeing cruises, booking agents or tackle shops;
- you have seen its **own website or socials**, or its own tourism listing (ATDW / state tourism site);
- there is **evidence it is trading now**: something dated 2025–26 (posts, reviews, current-season prices, a calendar,
  © year), or a 2024–26 government licence register entry. With no evidence since 2024, put it in `held.json` with
  what you found and a phone number. Don't list it;
- every fact comes from those sources. **Never guess or fill in.** If it isn't published, use null, "" or [].

If an existing listing now looks closed, wrong or rebranded, report it (`_flag`) rather than silently dropping it.

## 2. Listing record (`listings.json`: an array of these)

```jsonc
{
  "slug": "kebab-case-unique",            // keep the existing slug for listed operators
  "name": "Trading name exactly as used",
  "status": "active",
  "description": "90–170 words, ORIGINAL wording, third person, factual: where they fish, boat, trip styles, species, who it suits. No 'best'/'#1'.",
  "primary_location": "<departure town/suburb>, <hot spot name>",   // e.g. "Hillarys, Perth & Rottnest"
  "state": "NSW|QLD|NT|WA|TAS|VIC|SA",
  "location_tags": ["…"], "region_tags": ["…"],
  "departure_address": "as published or ''",
  "latitude": -31.82, "longitude": 115.74, // departure point, 4 decimals
  "primary_species": ["2–5 canonical species, most important first"],
  "all_species": [{ "name": "Snapper", "season": "Year-round or ''", "notes": "short, original" }],
  "species_tags": ["every species targeted"],
  "trip_type_tags": ["from TRIP TYPES"], "experience_tags": ["from EXPERIENCE"],
  "trips": [{ "name": "", "duration_hours": 5, "departure_time": "", "max_group": 10, "price": 140,
              "price_model": "per_person|per_group", "what_included": [], "target_species": [], "suitability_notes": "" }],
  "boat_name": "", "boat_type": "", "boat_length_m": null, "max_capacity": null, "comfortable_capacity": null,
  "survey_certification": "", "boat_features": [],
  "captains": [{ "name": "", "bio": "short, factual", "years_experience": null }],
  "whats_included": [], "what_to_bring": [], "cancellation_policy": "", "weather_policy": "",
  "years_in_business": null, "accreditations": [],
  "website": "https://…", "facebook": "", "instagram": "",
  "search_keywords": ["5–8 phrases customers type"],

  // SEO / GEO fields: shown on the page, in structured data and to AI assistants
  "lead": "1–2 sentences, ≤45 words, quotable: business, town/departure point, trip styles, main species, who it suits.",
  "highlights": ["3–5 factual bullets ≤15 words: what sets them apart"],
  "areas_fished": ["named reefs/islands/rivers/lakes they say they fish, ≤8"],
  "faqs": [{ "q": "operator-specific question", "a": "sourced answer ≤60 words", "source": "https://…" }],  // 1–3
  "same_as": ["other official profiles: Tripadvisor, tourism listing, Google Maps, FishingBooker, YouTube"],

  "_hotspot": "<hot spot key from your state file>",
  "_verification": "verified|third_party_only",
  "_sources": ["pages used"], "_checked": "YYYY-MM",
  "_photos": { "hero": { "file": "images/candidates/<slug>/c03.webp", "source_url": "", "reason": "" }, "extras": [] },
  "_notes": "anything uncertain"
}
```

**Canonical species** (use these spellings):
- Barramundi, Snapper, Golden Snapper, Kingfish, Coral Trout, Red Emperor, Nannygai, Sweetlip
- Giant Trevally, Golden Trevally, Trevally, Spanish Mackerel, Mackerel, Mahi Mahi, Wahoo, Cobia
- Yellowfin Tuna, Southern Bluefin Tuna, Longtail Tuna, Dogtooth Tuna, Tuna
- Black Marlin, Blue Marlin, Striped Marlin, Marlin, Sailfish
- Flathead, Jewfish, Mangrove Jack, Fingermark, Threadfin Salmon, Saratoga, Queenfish, Pearl Perch
- Bream, Whiting, King George Whiting, Tailor, Amberjack, Samsonfish, Australian Salmon, Morwong, John Dory
- Teraglin, Mud Crab, Squid, Black Jewfish, Sooty Grunter, Tarpon, Permit, Bonefish, Shark, Gummy Shark
- Dhufish, Baldchin Groper, Striped Trumpeter, Murray Cod, Golden Perch, Brown Trout, Rainbow Trout, Trout

Rules: tropical "snapper" is Golden Snapper; mulloway is Jewfish; yellowtail kingfish is Kingfish.

**TRIP TYPES**:
- Private Charter, Shared Charter
- Reef Fishing, Offshore, Game Fishing, Sportfishing, Deep Sea
- Estuary Fishing, River Fishing, Bay Fishing, Harbour Fishing, Lake Fishing, Freshwater Fishing
- Lure Fishing, Fly Fishing, Light Tackle, Barramundi Fishing, Great Barrier Reef
- Half Day, Full Day, Multi-Day, Overnight, Family Friendly

**EXPERIENCE**: Beginner Friendly, Families, Kids Welcome, Experienced Anglers, Corporate Groups, Wheelchair Accessible.

Validate: `node scripts/listings/validate-listings.mjs <output>/listings.json` must show **0 errors**.

## 3. Photos

Take one strong hero, plus up to 3 extras, from the operator's own website or socials, or their own tourism listing.
The owner has permission to use operators' images. Use real photos of their boat, their clients with fish, or action on
their charter. Prefer landscape, sharp and at least 1000px wide (800px is acceptable). Never use:
- logos, text graphics or flyers;
- stock or AI-generated images;
- watermarked images;
- another business's photos;
- photos where a child is the main subject.

## 4. Destination guides (`guides.json`)

For every hot spot you cover, write a guide that makes the page the most useful answer to "fishing charters <place>".
Use original wording, and source every fact.

```jsonc
{ "<key>": {
  "intro": ["paragraph 1 (≤90 words)", "paragraph 2"],            // required for new hot spots
  "season": "best-time answer ≤70 words",                           // required for new hot spots
  "sections": [ { "h": "Where the charters fish", "p": ["…"], "items": [["Rottnest Island", "detail"]] },
                { "h": "When to go", "p": [], "items": [["Dhufish", "Open outside the demersal closure (check dates)"]] },
                { "h": "Departure points", "p": [], "items": [] },
                { "h": "Good to know", "p": ["rules, closures, marine parks, safety, getting there"] } ],   // 3–5
  "faq": [["Question a visitor asks?", "Sourced answer ≤70 words"]],   // 2–5, not duplicating the automatic ones
  "sources": ["https://…"] } }
```

The site already generates these automatic FAQs, so don't duplicate them:
- **Destination pages:** price, what fish, best time, licence.
- **Charter pages:** departure, price, species, group size, suitability, inclusions, licence.

State pages also get a short guide: an overview of the regions and seasons across the state, 2–3 sections.

Where you can't confirm an exact government rule (bag limits, closure dates) from the official page, say "check the
current <agency> rules" instead of giving numbers.

## 5. Tools: the GitHub fetch pipeline

The container can't reach the web except GitHub. `WebSearch` works but is **shared and limited**: 200 searches per
turn across all agents. Use only your allocation. Never query search engines (Google, Bing, DuckDuckGo…) through the
pipeline or any other route.

The pipeline runs on branches named `operator-images/**`:

```bash
git fetch origin claude/charter-operator-email-template-4XKGG
git checkout -B operator-images/<your-branch> origin/claude/charter-operator-email-template-4XKGG
git push -u origin operator-images/<your-branch>
```

- Write `image-requests/<name>.json`: `{"requests":[{"slug":"<slug>","pages":["https://…"],"text":true,"max":16,"follow":true}]}`.
  - `text:true` saves readable page text, contact links and links to `research/<slug>/pNN.txt`, following trip,
    price and about pages (up to 12).
  - `max:0` means text only. `max:16` also saves candidate images to `images/candidates/<slug>/` with a `sheet.jpg`.
  - Add `"force": true` to redo a request.
- Push, then wait for the `collect` check and pull:
  ```bash
  SHA=$(git rev-parse HEAD)
  until [ "$(gh api repos/mikebr92-afk/hooked-up-preview/commits/$SHA/check-runs --jq '[.check_runs[]|select(.name=="collect")|.status][0]' 2>/dev/null)" = "completed" ]; do sleep 20; done
  git pull --ff-only origin operator-images/<your-branch>
  ```
- **Discovery trick:** one search finds a tourism body's "fishing charters" page. Fetch it with text and read operator
  names and links from the saved text. This saves most of your search budget.
- Only commit files under `image-requests/` on your branch. Never push anywhere else. End commit messages with the
  attribution lines the orchestrator gives you.
- Use `Grep`, and `Read` with offset/limit, on research files. Look at `sheet.jpg` contact sheets before picking photos.

## 6. Deliverables (in your output folder)

Save progress after each hot spot.

1. `listings.json`: new and corrected listings, validator 0 errors.
2. `guides.json`: guides for your hot spots (and your state page, if asked).
3. `held.json`: real businesses you couldn't confirm are trading, with what you found and a phone number.
4. `knowledge-updates.txt`: things to add to your state file:
   - new leads and phone numbers;
   - closures and changes;
   - gaps;
   - official rule sources;
   - anything the owner should check.

   Use `.txt`, because `.md` writes may be blocked.
5. Final reply: a summary table (hot spot → listings → notes) and key concerns.
