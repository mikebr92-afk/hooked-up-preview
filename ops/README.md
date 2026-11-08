# Hooked Trips listings operations

This folder and `scripts/listings/` are the toolkit for keeping listings real, current and well optimised. Neither is
published on the website (both are excluded in `.assetsignore`).

## Contents

- **`.claude/agents/state-*.md`** — the six state specialist agents (NSW, QLD, NT, WA, TAS, VIC).
- **`ops/PLAYBOOK.md`** — the rules every state agent follows: verification, schema, photos, guides, pipeline.
- **`ops/states/<code>.md`** — knowledge per state: hot spots, current listings (auto section), held operators, phone
  leads, watchlist, rules.
- **`ops/research/`** — sourced hot-spot facts from earlier research rounds.
- **`scripts/listings/`:**

  | Script | What it does |
  |---|---|
  | `validate-listings.mjs` | validate an agent's `listings.json` (`--seo` requires SEO fields) |
  | `validate-seo.mjs` | validate SEO patch folders (`seo-patches.json` + `guides.json`) |
  | `photos_review.py` | pull an agent's chosen photos from its pipeline branch and make review sheets |
  | `process_photos.py` | turn approved photos into `images/operators/<slug>/` (gallery, card, og) |
  | `build_listings.mjs` | merge agents' `listings.json` into `data/operators.json` and the bundle's listing cards |
  | `apply_seo.mjs` | merge SEO patches and guides into `data/operators.json` and `data/guides.json` |
  | `hold.mjs` | remove listings from the live data (held for a phone check) |
  | `state_kb.mjs` | refresh the auto "Current listings" section of each state file |
  | `qa.mjs` | content QA over the live data |
  | `serve.mjs` | run the site locally (Worker + assets) |
  | `linkcheck.mjs` | check the locally served site: links, head tags and JSON-LD |
  | `crawl.mjs` | compare raw and rendered pages (needs Playwright) |
  | `enquiry.mjs` | test the enquiry form end to end (needs Playwright) |
  | `count-check.mjs` | check every count shown on the site against the live data (needs Playwright) |
  | `indexnow.mjs` | tell Bing/Yandex (IndexNow) which pages changed; runs automatically after each deploy (`.github/workflows/indexnow.yml`) |

## Running a state agent (orchestrator steps)

1. **Brief:** start the agent (`state-<code>`, or a general agent told to act as it). Give it:
   - the task;
   - an output folder outside the repo;
   - a WebSearch allocation (the budget is 200 per turn, shared across agents);
   - its pipeline branch `operator-images/<code>-<task>`;
   - the commit attribution lines.
2. **Check:** run `node scripts/listings/validate-listings.mjs <out>/listings.json --seo`. Read its `held.json` and
   `knowledge-updates.txt`.
3. **Photos:**
   - `python3 -I scripts/listings/photos_review.py <repo> <outParent> <group>` (the branch must be
     `operator-images/state-<group>`), then look at the sheets.
   - Write `approved-photos.json`.
   - Run `python3 -I scripts/listings/process_photos.py <repo> <approved.json…>`.
4. **Build:** `node scripts/listings/build_listings.mjs <repo> <outParent>`. This merges every `<group>/listings.json`
   under `<outParent>` and keeps all other listings unchanged.
5. **Destinations:** add any new hot spot to `LOCS` in `site-seo.js` (n, short, in, parent, c, state, intro,
   season). Merge `guides.json` into `data/guides.json` with `apply_seo.mjs`. Its `summary` (the "In short" answer) and `sources` (URLs) are published, and `reviewed` is stamped with the merge date.
6. **Verify:**
   - serve locally;
   - run `qa.mjs`, `linkcheck.mjs` and `count-check.mjs`;
   - run the crawl and the enquiry test;
   - visual check.
7. **Ship:** commit to the working branch, fast-forward `main` (Cloudflare deploys), then run `state_kb.mjs` and
   update the state file with the agent's knowledge updates.

## Data model (short)

- **`data/operators.json`:** full records, also `lead`, `highlights`, `areas_fished`, `faqs`, `same_as`,
  `also_serves`, `verified_at`.
  - The worker inlines one record per charter page.
  - The app fetches the full file on demand.
- **Listing cards (`Rr` in `index.html`):** drive lists, filters and destination pages. They're rebuilt by
  `build_listings.mjs` / `apply_seo.mjs`.
- **`data/guides.json`:** destination guide sections, FAQs and optional improved intro/season, merged into `LOCS` at
  request time.
- **Destination liveness:**
  - a destination page needs 2+ listings, or `LOCS[key].min`;
  - state pages need 1+;
  - `also_serves` lets an operator appear on extra destination pages when its own site shows trips there.
