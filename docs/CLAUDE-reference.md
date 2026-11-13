# Technical reference

The detailed technical handoff for this repository. Start with `AGENTS.md` and `CLAUDE.md` at the repo root; this file holds the depth behind them.

> **Frontend skill:** before writing or editing frontend code, invoke `impeccable` **if it is installed on the machine you are on**, otherwise `frontend-design:frontend-design` — never both. See **Frontend Skill** at the end. Product truth lives in [PRODUCT.md](PRODUCT.md) — read it before design decisions, and keep it current rather than re-deriving it.

---

## Current Status — Handoff (last updated 2026-11-04)

**The live site is now Ver3.** The active, deployable site root is **`Ver3/`** (not `archive/legacy/Ver2/`). `netlify.toml` publishes `Ver3`. `archive/legacy/Ver2/` is kept as legacy/reference only — do not edit it.

**Where we are:**
- Ver3 is a full redesign of the whole site. Recently completed milestones (see `git log`): M2.2 rooms rebuild, M3.1 interactive SVG neighbourhood map, M3.2 booking-trust block, site-wide Lenis smooth-scroll, contact/faqs pass, GSAP scroll-reveal pass, homepage luxuries/rooms reorder + always-scrolling hero marquee, the breakfast **coffee→Danube** sequence (180 scrubbed webp frames), the green-wall site loader, sweep page transitions, the right-edge chapter rail, the new font pairing, the **alma-style mobile room selector**, and the **tresmares-style intro scroll-fill**.
- All pages (`index, rooms, pleasures, breakfast, neighbourhood, contact, faqs`) exist in `Ver3/` and are on the Ver3 design language.
- **Production = `main` branch.** A push to `main` is a live deploy to https://secrethotel.netlify.app/ — **always ask first.**

**Branches:**
- `main` — production (Netlify deploys this) **and the branch current work happens on**. Since 2026-11-04 work is committed straight to `main`, always after asking.
- `feature/room-service` (stops at `91b4767`) and `claude/wonderful-mclaren-d67b3f` (stops at `74b300c`) — older working branches, both behind `main`. Don't resume work on them.

**Two machines work on this repo:** Pavlo's MacBook and the hotel's reception PC (Windows, user `Recepcio-2`, checkout in OneDrive). Each has its own local-only files (see **Repository Layout**), so always `git fetch` and check `git status` / `git log origin/main` before starting — the other machine may have pushed.

**Open / not-yet-done:**
- **Booking runs through SabeeApp** — all 21 booking CTAs and the homepage reserve form open `https://ibe.sabeeapp.com/v3/p/Stories-Boutique-Hotel?p=063b197ca9a16951` in a new tab. The form opens it via JS, **not** a GET action: the inputs carry no `name`, and a GET submit would rebuild the query string and drop the engine's own `?p=` token. Dates and the chosen room are **not** passed through yet — that needs SabeeApp's parameter names.
- **contact.html now posts to Netlify Forms** (2026-08-24) — real `<form data-netlify>` with a honeypot and a hidden `language` field; it submits natively with JS off, and the inline script only upgrades it to an in-page confirmation. Netlify strips `data-netlify` from the served HTML once it has parsed the form, so its absence in the deployed source is the sign that detection worked. **Email delivery is configured**: the site's Netlify form notification sends every form's submissions to info@storiesbudapest.com (checked in the dashboard 2026-11-04).
- **Room service page is live, English only** (`Ver3/room-service.html`, shipped 2026-11-03, reworked 2026-11-04) — the in-house ordering page for Twenty Six room service; full notes under **Room service** in Architecture Notes. Orders arrive at info@storiesbudapest.com — the client confirmed on 2026-11-04 that real order emails arrive, including the simplified single-summary format, and that it reads well. Still open: the **Hungarian copy** (`hu/room-service.html` does not exist yet), the **payment wording** (the page deliberately says nothing about how guests pay — not confirmed), and **switching the room QR cards** from the Wix form "Guest - 26 Menu" to this page — until then Wix stays the one in use.
- contact: optional left-edge runlabel + a mini SVG map inset (rhymes with M3.1).

- **Room service is priced at Erste Bank's euro buying rate plus 2%** —
  management's decision, 2026-11-13, which also settled the 2% buffer
  (`SPREAD = 1.02` in `room-service.html`) as permanent rather than a
  placeholder. Because the buying rate already sits ~3.5% under the market,
  the euro price is now ~5.8% above the forint menu price converted at the
  MNB middle rate (buying-rate margin, plus the buffer, plus the round-up to
  €0.10). **SabeeApp converts at the MNB rate**, so a euro total converted
  back to forint there will not land on the menu's forint price — management
  **accepted that difference** on 2026-11-13, and confirmed the same day that
  the hotel may rely on Erste's public feed and that the cash table
  ("Valuta", the lowest buying rate) is the one meant. See
  [FACT-CHECK.md](FACT-CHECK.md) item 5.
- **Before the release on storiesbudapest.com** (planned, date not set): the
  production domain is hardcoded **205 times in 21 files** under `Ver3/` —
  every `canonical`, `hreflang`, `og:url`/`og:image`, the JSON-LD `url` and
  `image`, `sitemap.xml`, `robots.txt` and `llms.txt`. All of them must move to
  `https://www.storiesbudapest.com/` in one commit, together with 301 redirects
  from the old Wix URLs. `grep -rl secrethotel.netlify.app Ver3/` lists them.
  Until then the Netlify site self-canonicalises and competes with the Wix
  site in search; the Wix site also still shows the old telephone, +36 1 808 0981.
- **Legal pages — Terms are approved, Privacy is still a draft.**
  - `terms.html` carries management's **General Terms & Conditions, Version 1.0** (received 2026-11-09), applied verbatim. The draft banner is gone and no `.legal-todo` markers remain. Changes management made against the earlier draft, worth knowing because other pages must not contradict them: smoking fee **EUR 200**, card pre-authorisation **200 EUR**, unaccompanied-child age **16** (was 14), invoices issued **in the currency of payment** (EUR or HUF, no longer forint-only), refusal of service extended to **declining the house rules at check-in**, an **American Express** note on refund timing, and the "we can make an exception in a real emergency" sentence removed from the cancellation section — and, since 2026-11-13, from the FAQ's cancellation answer in both languages, where it had survived. **Do not reintroduce it anywhere** without management changing the Terms first.
  - `hu/terms.html` mirrors it, but management supplied **English only** — the Hungarian is an **in-house translation, not legally verified**. It reuses the terminology the page already established (`Cégjegyzékszám`, `idegenforgalmi adó`, `VIZA rendszer`, `szobaszéf`, `kártyás előengedélyezés`) and carries a quiet `.legal-note` saying the English version governs. **A native legal reader must check it** before the Hungarian text is relied on; see `FACT-CHECK.md` ⚠️ OPEN.
  - `privacy.html` / `hu/privacy.html` carry **Version 1.1**, reconciled on 2026-11-09 with management's `Adatkezelési Tájékoztató` / `Privacy Policy` (one document: Hungarian original plus English translation, both effective 1 August 2020). No draft banner and no `.legal-todo` markers remain anywhere on the site.
  - **The document is authoritative for the hotel's legal position, not for what this website does.** Its section 11 states the site runs Google Analytics, a Facebook pixel and remarketing, sets cookies and web beacons, and shows a consent banner — Ver3 does none of that, so the pages keep their own accurate cookie section. It also names ROOMZ as the booking engine (the site uses SabeeApp), omits Netlify entirely, and carries a Covid-era temperature-screening section, a camera inventory listed by room number, and ten named service providers. Those were left out on purpose. **Every omission and conflict is listed in `FACT-CHECK.md` item 7 — read it before touching these pages, and do not "restore" anything from the PDFs without management's answer.**
  - Taken from the document: privacy officer (Marton Andrea), accounting processor (K+J Számviteli Szolgáltató Kft.), the fuller security and rights sections, the oral-complaint procedure, camera retention of 8 days, and `§ 17/A(7)` for complaints. The pages' **NAIH address is deliberately newer than the document's** (Falk Miksa utca, not Szilágyi Erzsébet fasor) and the document's named NAIH president is not published.
  - Structure follows the group's Wonder Budapest documents, but every factual statement was written for this hotel — in particular the cookie section describes what Ver3 actually does (no analytics, no pixel, three functional storage keys), not what the sister site does.
- **Fact-check outstanding** — see [FACT-CHECK.md](FACT-CHECK.md), a full audit of every claim on the site with the open questions numbered. The invented ones (review score, stay count, transfer price, best-rate guarantee) were **removed 2026-08-06** and only return if the client confirms real figures. Two internal contradictions are still unresolved and flagged there: whether the King Suite has a private sauna (`rooms.html` says yes, `faqs.html` implies only the Presidential does), and whether GoActive is in the building or a five-minute walk away.
- Homepage frame sets are 1280×720 sources — slightly soft on large retina screens (grain + vignette mask it). Re-generate at 1080p if the client complains.

**To resume on a fresh machine / account:** `git clone https://github.com/Pavkol1/VER-2.0.git` (lands on `main`), then `./start-server.sh` (or `python3 -m http.server 8000`; on the reception PC `python`) → http://localhost:8000/Ver3/. Note: chat history and Claude memory do NOT transfer between accounts or machines — only the code (and these notes) travel via git.

---

## Project

**Stories Hotel Budapest** — a static multi-page boutique hotel website. No build step, no framework, no package manager. Each page is a self-contained HTML file with all CSS and JS inlined; the `<script>` block lives at the bottom of every page.

**No build, no linter, no test suite.** All edits go directly into HTML files and are verified visually in a browser. Do not attempt `npm install`, `pytest`, or similar — there is nothing to run.

**To run locally** (Safari blocks `file://` with relative asset paths, so an HTTP server is required):

```bash
./start-server.sh        # = python3 -m http.server 8000 from the repo root
# then open http://localhost:8000/Ver3/
```

Per user preference, ask Claude to start the server rather than running it yourself.

---

## Repository Layout

```
.
├── AGENTS.md / CLAUDE.md / README.md   short entry points for agents and people
├── start-server.sh       local preview server on port 8000
├── netlify.toml          publish = "Ver3", functions dir, /api/rate redirect
├── netlify/functions/
│   └── rate.mjs          Erste Bank euro buying rate for room service (the only server code)
├── Ver3/                 ← ACTIVE, deployable site root (edit here)
│   ├── index.html        Homepage: loader + hero + intro-strip + luxuries + rooms rail + coffee→Danube scene + neighbourhood + reserve
│   ├── rooms.html        6 rooms, top-nav + sticky info, 5–6 photos per room
│   ├── pleasures.html    Bar & Lounge, Gym (GoActive), Coworking as full-width feature sections
│   ├── breakfast.html    Plate + intro grid + 3-column menu (no prices — see fact-check)
│   ├── neighbourhood.html  Plate + neighbourhood list + interactive SVG map (M3.1)
│   ├── contact.html      60vh hero + 2-column contact info/form
│   ├── faqs.html         Paper bg (no plate), sticky nav sidebar, accordion FAQ
│   ├── privacy.html      Privacy Policy — paper bg, sticky section rail (faqs shell)
│   ├── terms.html        General Terms & Conditions — same shell as privacy
│   ├── room-service.html In-house room-service ordering (menu → tray → details → sent); noindex, not in nav, EN only
│   ├── robots.txt / sitemap.xml   allow all crawlers, AI ones included; sitemap lists all 18 public pages (nine in each language)
│   ├── llms.txt          plain-text fact sheet for AI assistants (llmstxt.org format) — see SEO and AI below
│   └── assets/
│       ├── brand/        Hero/plate backgrounds, logos, danube-budapest.webp, sky-evening.webp, sky-rise.mp4 (crane to sky)
│       ├── coffee/       frame_001…120.webp (the scrubbed pour) + coffee-loop.mp4 (ping-pong surface)
│       │                 + coffee-danube.mp4 (the morph, plays once)
│       ├── photos/       Per-room and amenity galleries (presidential-suite/, king-suite/, …)
│       └── vendor/       lenis.min.js · gsap.min.js · ScrollTrigger.min.js
├── docs/                 PRODUCT.md, FACT-CHECK.md, this file, client .docx documents,
│   └── email/            room-service email design (an unused HTML alternative + text sample)
├── tools/                check_site.py (pre-commit page check) · test_rate.mjs (rate function) · test_rate_client.mjs (the page's rate cache)
└── archive/
    ├── README.md
    └── legacy/           Ver2/ and the pre-2026-11-04 agent notes — reference only, do NOT edit
```

**In git vs. local only.** Everything above is in git. A few things are deliberately **not** (see `.gitignore`) and exist only on the machine that made them:
- **MacBook only:** `archive/legacy/Ver1/`, `archive/source-assets/` (original photos, incl. the source logo), `archive/local-state-2026-11-04/`, the git stash "Before repository organization 2026-11-04", and `.claude/worktrees/`.
- **Reception PC only:** `.claude/launch.json` (preview config) and `.claude/settings.local.json`.

If a note points at one of these and it isn't there, you are on the other machine — don't recreate it.

Asset URLs in the HTML use `assets/...` (relative from `Ver3/`). When adding photos, place them inside `Ver3/assets/`.

**Hungarian mirror (`Ver3/hu/`)** — the site ships in two languages as **14 files, not 7**. `Ver3/hu/` holds a full translated copy of every page; `Ver2`-style client-side string swapping was deliberately not used, because separate URLs are what Google needs to index and rank the Hungarian version. Consequences to respect:

- **Every content or markup change must be made twice** — once in `Ver3/X.html`, once in `Ver3/hu/X.html`. There is no build step to generate one from the other. A structural change (new section, renamed class, new script) applies to both; only the visible copy differs.
- **`hu/` pages reference assets one level up** (`../assets/…`). Absolute `https://…/assets/…` URLs inside `og:image`/`twitter:image`/JSON-LD stay absolute — don't rewrite those.
- Internal page links inside `hu/` stay bare (`rooms.html`), so HU pages link to HU pages.
- Each page declares `hreflang` **en / hu / x-default** and a per-language `canonical`; index carries `inLanguage` in its JSON-LD. Adding a page means adding both copies plus the hreflang pair.
- The language switch is real in three places: the nav `.lang-toggle` (index only, hidden ≤560px), the `.mnav-lang` line in the mobile menu, and `.foot-lang` in the shared footer — the footer one is the only switch the subpages have on desktop. `.foot-legal` sits beside it with the two legal pages.
- Room type names (Presidential Suite, King Suite, …), "Twenty Six", "Create 26", "GoActive" and "Onyx" are treated as proper nouns and stay untranslated in HU.

**SEO and AI assistants** (added 2026-11-13) — three places state the hotel's facts for machines, and **they must agree with the pages and with each other**, because an assistant that finds two versions trusts neither:

- **JSON-LD `Hotel`** in `index.html` and `hu/index.html` (amenity names translated in HU, everything else identical). Carries `alternateName` "Stories Boutique Hotel" — the name on TripAdvisor and in SabeeApp — the room count, check-in/out, `petsAllowed: false`, and ten amenities. **Gym and coworking are named with their qualification inside the name** ("…access sold at reception, not included in the rate"), because machines quote the name alone; the old plain "GoActive Gym" read as a hotel gym. No `aggregateRating`, ever — review numbers are on the must-not-invent list.
- **`Ver3/llms.txt`** — a Markdown fact sheet in the [llmstxt.org](https://llmstxt.org) format. It is a proposed convention; there is no confirmation that the major assistants read it, so it is cheap insurance, not a ranking lever. Every sentence in it is lifted from a page or from `PRODUCT.md` in the same wording, each one written to stand on its own when quoted ("Stories Hotel Budapest is a four-star, 44-room boutique hotel at Király utca 26…"). **Update it whenever a fact on the site changes** — opening hours, policies, room details, contact numbers — and never put a price, a rating or anything from the FACT-CHECK open list in it.
- **The pages themselves**, above all `faqs.html`, which already answers in the plain question-and-answer shape assistants lift from.

**Images** — every gallery photo ships as `NAME.webp` (1600w) plus generated `NAME-800.webp` and `NAME-1200.webp`, wired through `<picture><source srcset="… 800w, … 1200w, … 1600w" sizes="(max-width: 880px) 100vw, 50vw">` with a single-size `.jpg` fallback on the `<img>`. **Regenerate the variants whenever a source photo is replaced** (Pillow, quality 74/76, `method=6`) or the `srcset` will 404. Every image on every page is `loading="lazy"` — there are no eager images left.

**Favicon** — a monogram S in gold `#B9904E` on the emerald tile `#123524`, drawn from the Palatino Bold outline (Palatino and the brand's referenced Optima are both Zapf faces, so the warmth matches). Cap height 66% of the tile, nudged up 1% for optical centring, corner radius 18%. It was chosen by rasterising every candidate at **16px** and judging there — the address mark "26" and every regular-weight serif failed at that size, and a circular tile needs transparent corners and so picks up the tab background. Files live at the site root: `favicon.svg`, `favicon.ico` (16/32/48), `apple-touch-icon.png` (**full bleed, no rounding** — iOS applies its own mask), `icon-192/512.png`, `icon-maskable-512.png` (mark pulled in to survive Android's circular crop) and `site.webmanifest`. Declared with root-absolute paths so `hu/` shares them. Regenerate from the outline rather than editing the raster files.

---

## Third-Party Libraries

| Library | Source | Used on |
|---|---|---|
| **Lenis** (smooth-scroll) | `assets/vendor/lenis.min.js` | All pages |
| **GSAP** (scroll reveals, timeline animations) | `assets/vendor/gsap.min.js` | All pages |
| **ScrollTrigger** (GSAP plugin) | `assets/vendor/ScrollTrigger.min.js` | All pages |
| **Leaflet** (interactive map) | CDN (unpkg, no key) | `index.html`, `neighbourhood.html` only |

GSAP + ScrollTrigger load **deferred** just before the inline `<script>` block on every page; Lenis is initialised inside the inline script. Because `defer` scripts run before `DOMContentLoaded`, any consumer that executes at parse time must go through the `window.whenLibsReady(fn)` helper defined immediately above those tags (index only — every other page already gates its GSAP work on `DOMContentLoaded`). On index that helper wraps the intro scroll-fill and the whole coffee→Danube IIFE. **Leaflet is not in the markup at all**: `loadLeaflet()` injects its CSS + JS (with the SRI hashes) once the map section comes within two viewports, then builds the map — it used to block first paint for a map far below the fold.

---

## Design System (Ver3 — Emerald Boutique) — CURRENT

**Cinematic "plate + body" architecture** — most pages open with a full-bleed photo plate (`.plate`), followed by a content body. `contact.html` uses a shorter 60vh hero; `faqs.html` has no plate (paper background throughout).

**Design tokens** (CSS variables on `:root` in every Ver3 page):
```css
--ink:     #0B1410   /* near-black green-tinted */
--ink-2:   #1A1F1A   /* dark section bg (index uses greener #0E2017 + --ink-3: #081A12) */
--paper:   #EDE7DA   /* warm off-white base */
--paper-2: #E5DECE
--rule:    #C9C1B0   /* hairline borders */
--text:    #2A2A22
--text-2:  #5A5A4E   /* 5.67:1 on paper — retuned 2026-08-05 for WCAG AA */
--text-3:  #5F5F52   /* mono labels · 5.25:1 — was #9A9A8C at 2.31:1, an AA fail */
--primary: #123524   /* deep emerald */
--accent:  #B9904E   /* gold — for text this is only safe on DARK surfaces (5.7-6.4:1) */
--accent-ink: #123524 /* the accent for text on LIGHT surfaces · 10.92:1 */
--ease:    cubic-bezier(0.22, 0.61, 0.36, 1)
```

**Typography** (Google Fonts, same `<link>` on every page):
- Headings: `Libre Caslon Text` (serif), often with italic `em` in `--primary` or `--accent` — free stand-in for the commercial **Gangster** the client referenced
- Body/UI: `Schibsted Grotesk` — free stand-in for **ABC Monument Grotesk**; if the client buys licences, swap to self-hosted originals
- Labels/overlines/mono: `JetBrains Mono`, 10–11px, `letter-spacing: 0.18em–0.28em`, uppercase
- `Playfair Display` + `Pinyon Script` are used by the hero logo wordmark system

**Accessibility** — WCAG AA is a confirmed product requirement (see PRODUCT.md). `faqs.html` was rebuilt 2026-08-05: the 19 accordion triggers are real `<button aria-expanded aria-controls>`, answers carry matching `id`s, the 5 category items are real anchors routed through Lenis (native `scrollIntoView` fights it), toggles are independent, and below 1024px the category sidebar becomes a sticky horizontal bar instead of `display: none`. On index, `.bk-coffee-content`, `.dn-content` and `.dn-detail` get `inert` mirrored onto their `pointer-events` writes so keyboard focus cannot land in a transparent layer of the sticky scene.

**Ver3-specific systems** (present in every page, near-identical CSS/JS blocks):
- **Logo stage** (`.logo-stage` / `.logo-mover`) — wordmark that scales/moves into the nav slot; flips ink⇄paper via `body.logo-on-light` as you cross light/dark sections.
- **No custom cursor** — the boutique dot+ring cursor was removed site-wide (2026-06-12); native cursor only. Inert `.magnet` classes remain in markup.
- **Lenis smooth-scroll** — `assets/vendor/lenis.min.js`, `lerp: 0.085`; skipped under `prefers-reduced-motion`.
- **Nav** — `.scrolled` state once `scrollY > 40`. On `index.html` only, a direction-tracking scroll handler toggles `body.nav-hidden`, which hides the nav via `translate3d(0, -110%, 0)` (a pure transform slide — no `opacity`, because the blurred backdrop + opacity repaints glitch on Safari).
- **Prefetch on intent** — `mouseover`/`focusin`/`touchstart` on any transitionable link appends a `<link rel="prefetch">` once per URL, so the 520ms exit sweep usually covers a page that is already in cache.
- **Page transitions** — a "page push" illusion, not just a covering panel. All real page content (everything except `nav`, the `.mnav` mobile overlay, `.site-grain`, `.page-sweep`, and the index-only loader) is wrapped in `.page-view`. **Exit** (a CSS `transition`, triggered synchronously by the click handler adding `body.page-leaving` — no timing risk): `.page-view` slides -4% and dims (0.38s) while `.page-sweep` — a gradient panel with the vector wordmark centred, gold hairline edges — slides in from the right (0.52s), then navigates. **Entry** is a pure CSS `@keyframes` animation (`sweepRetreat` / `pageViewOpen`) gated on `html.pt-in` alone (set synchronously in a `<head>` script from a `sessionStorage('pt')` flag, before first paint) — **not** a second class (`pt-go`) added later via `requestAnimationFrame`, which is what the first version did and which caused intermittent stuck-hidden pages (the double-rAF callback could be delayed behind other script execution and simply never land before the user noticed a blank/dark screen — confirmed via `Animation.playState`: with the old JS-driven approach there was a real window where nothing had started; with `@keyframes` triggered by a single class, `getAnimations()` reports `"running"` the instant the class is applied, no JS involved). `animation-fill-mode: both` holds the covered/hidden state pre-animation and the fully-open state after. The JS's only remaining job is removing `pt-in` ~900ms later for hygiene (and on bfcache `pageshow`). **Entry deliberately never uses `transform`** on `.page-view` — a transform would make it a new containing block for its `position:fixed` descendant (`.chapter-rail` on index), skewing every `offsetTop` measurement (rail's `measure()`, ScrollTrigger setup) that runs during page load; `opacity`/`clip-path` don't have that side effect. (A pure-CSS View Transitions version was tried 2026-06-12 and reverted — it didn't fire reliably in the client's Chrome — this hand-rolled `@keyframes` approach is unrelated to that API and unaffected by its reliability issues.) Disabled under reduced motion.
- **Premium shared layer** (bottom `<script>` on every page) — blur-up image loading (`img.lz` → `.ld` on decode); `.site-grain` fixed film-grain overlay; `:focus-visible` accent outlines. (The loader controller lives here on index only.)
- **Film grade** — one warm "film stock" over all photography: `:root { --film-grade: saturate(0.92) sepia(0.07) contrast(1.045) brightness(0.985) }` applied to every `img` (Leaflet tiles excluded). The blur-up `.lz`/`.ld` rules carry the same var so the grade survives the decode transition — if you retune the grade, retune it in all four places (base rule + 3 blur-up states). Tune the token, not per-image filters.
- **Site loader** (`index.html`, **first visit only** — gated on `localStorage.storiesWelcomed`, decided in the `<head>` script so a returning visitor never sees a flash) — a self-drawing lounge interior: 663 traced polyline strokes drawn by animating `stroke-dashoffset` at one constant pen speed over 3s, with the wall's STORIES sign flashing white as the pass lands. Stroke lengths are baked exactly offline (the tracer's own values were up to 10.6% off), so nothing calls `getTotalLength`. It is a **real gate**: the progress line tracks three readiness signals (hero image decoded, `document.fonts.ready`, `window.load`) and hand-off waits for the drawing *and* all three, capped at 8s. Exits by evaporating (opacity + `blur(18px)` + drift, 1.15s). Replaced the 470KB `loader-wall.mp4` + 182KB poster, which are now unreferenced. Skipped under reduced motion.
- **Chapter rail** (`index.html` only, `.chapter-rail`) — right-edge segmented scroll timeline (lukebaffait.fr-style): 6 chapters, segment heights ∝ chapter scroll span (pow-0.78 damped), per-segment fill, static vertical spine label (`writing-mode: vertical-rl`, centred beside the bar — only the fill animates; a riding label was tried and reverted), click scrolls to the chapter via Lenis. Dims to 22% when idle, hidden ≤1024px. The 04→05 boundary sits at the coffee scene's internal p=0.62 handover. Colors flip via `body.logo-on-light` and follow `--room-ink` inside the rooms cinema (`body.in-cinema`). Replaced the old rotated `.runlabel` (subpages still have runlabels).
- Shared dark `<footer>` grid across all pages.

**Animations**
- Plate bg zoom: `scale(1.06)` → `scale(1.0)` when section gains `.visible` (1.6s `--ease`)
- GSAP scroll reveals: `gsap.from()` + ScrollTrigger entries for staggered text, image curtains, and section reveals; structural sections (stage, cinema, coffee scene, plates, footer…) are listed in a `SKIP` selector and excluded from the generic reveal pass.
- IntersectionObserver still used for: `body.logo-on-light` flips, `.in-view` on `.rf` photo frames, and Leaflet `invalidateSize` timing.
- `prefers-reduced-motion` is respected everywhere — scripts check `matchMedia('(prefers-reduced-motion: reduce)')` before registering ScrollTriggers; animate only `transform` and `opacity`.

### Design System (Ver2) — LEGACY (do not use for new work)

Old tokens were `--ivory #F2EDE4 / --ink #0D0B08 / --gold #B9904E / --green #2A5C45`, headings in `Playfair Display`. This applies only to the frozen `archive/legacy/Ver2/` folder.

---

## Architecture Notes

**Navigation** — fixed; `rgba(13,11,8,0.85)` + `backdrop-filter: blur(14px)` activated by adding `.scrolled` once `window.scrollY > 40`. Nav height is ~92px; other sticky UI docks below that. **Mobile menu** (≤1024px, all pages): `.nav-links` hides and a `.m-burger` button (44×44, morphs to an X) opens the `.mnav` full-screen emerald overlay — numbered serif links with staggered rise-in, gold active/current page, Reserve CTA + contact meta at the bottom. `body.menu-open` locks scroll (`overflow: hidden` + `__lenis.stop()`) and forces the nav visible over the index auto-hide. **Focus is contained** (2026-11-04): the overlay is `inert` while closed; on open, every sibling along the burger's ancestor path (skip link, page sweep, `.page-view`…) is made `inert`, Tab/Shift+Tab cycle between the burger and the overlay's links, and focus returns to where it was on close. Closes instantly on tap of any overlay link (so the transition panel doesn't animate in over a still-open menu), on Esc, on bfcache `pageshow`, and when the viewport widens past 1024px; menu links are also intercepted by the page-sweep layer like any internal link (sweep z 190 covers overlay z 78). The same block is copied into every page, `hu/` and `404.html` included — change it everywhere at once. Burger is paper-colored; `faqs.html` overrides it to ink (paper nav).

**Reserve** — an inline `.reserve-plate` section at the bottom of `index.html` (anchor `#reserve`), **not** a slide-out panel. Its `.reserve-form` opens the SabeeApp booking engine in a new tab via JS (see Current Status) — it is no longer a mock.

**Rooms** (6 total, in display order):
1. Presidential Suite — 165–180 m², 2 bed/2.5 bath, Jacuzzi & Sauna
2. King Suite with Jacuzzi — 85 m², Jacuzzi, Sauna, Green Wall Shower
3. Junior Suite — 65–75 m², King Bed, Living Room, Sofa-Bed
4. Deluxe Room — 34–45 m², King Bed, Living Room, Designer Art
5. Deluxe Queen Room — 30 m², Queen Bed, Inner Courtyard View
6. Superior Room — 17 m², Queen Bed, Intimate & Cosy

**Rooms layout** (`rooms.html`): alternating dark/light split; even-indexed rooms use `direction: rtl` for reversed image/text layout.

**Pleasures layout** (`pleasures.html`): `.pleasure-feature` sections with `.reverse` modifier for alternating image sides.

**Index rooms cinema** (`.rooms-cinema` / `#roomStage`) — the homepage room browser. **Desktop**: a 2-column grid — sticky `.room-panel` on the left (intro + vertical `.room-list` + CTAs), all six `.room-gallery` blocks stacked vertically on the right; you scroll through 18 photos continuously. An IntersectionObserver with `rootMargin: '-50% 0px -50% 0px'` tracks which gallery crosses the viewport centre and swaps `--room-bg` / `--room-ink` on `body` to repaint the whole section per room (`ROOM_COLORS` map; active slug in `stage.dataset.active`). A 750ms `scrollLockUntil` debounce stops the observer fighting programmatic scrolls.

**Mobile room selector** (≤880px, alma-style) — the side panel dissolves via `display: contents` so `.room-list` can become a **sticky horizontal pill bar** riding the top across the whole cinema; order becomes intro → selector → galleries → CTAs. The active pill inverts to the room palette and auto-centres itself (horizontal `scrollTo` only — never moves the page); tapping scrolls to that gallery with an offset clearing nav + bar. Two non-obvious constraints, both previously bugs:
- `.room-stage` must get `align-items: stretch` in the mobile rule — desktop sets `align-items: start` (a sticky-in-grid requirement), and under flex that collapses the galleries to **zero width**, because `.rf` figures hold `position: absolute` imgs and have no intrinsic width.
- The bar's sticky `top` is `86px` (under the ~92px fixed nav) and drops to `0` via `body.nav-hidden .room-list`, staying in sync as the nav slides away on scroll-down. A plain `top: 0` hides it behind the nav.

Note: `.room-rail` (a horizontal `scroll-snap-type: x mandatory` strip) is **dead CSS** — no markup uses it. It's a leftover of the pre-cinema design; don't extend it.

**Homepage coffee→Danube scene** (`.bk-coffee-scene`, `index.html`): one 430vh sticky scene, driven by a GSAP tween of a `playhead` object whose ScrollTrigger has `scrub: 0.85` (inertial catch-up; since 2026-11-04 — before, `onUpdate` read the raw, unsmoothed progress). `setSceneProgress` first remaps progress so the opening copy holds still for the first 6% of the scene (about two-thirds of a viewport of scroll). Timeline: breakfast photo → coffee spill (120 webp frames) → breakfast-facts plateau → coffee swirl morphs into the Danube (60 webp frames) → crossfade into `danube-budapest.jpg` (real photo replaces the AI-looking last frames) → neighbourhood titles (`.dn-content`, holds `id="neigh"`). Both frame sets share one `<canvas>`; fractional frame indices are blended via `globalAlpha` so the scrub never steps. A single `.bk-scene-veil` vignette sits above all media layers (no brightness jump between photo/canvas/final). Frames preload via IO at `rootMargin: 300%`; a `painted` flag stops the (black, `alpha:false`) canvas from being revealed before its first draw. On reduced-motion or ≤860px, `body.bk-static` collapses the scene into two static blocks (the whole page gets much shorter on mobile as a result — worth knowing when computing scroll positions). The Breakfast→Neighbourhood handover sits at internal `p=0.62`; the chapter rail reuses that exact split for its 04→05 boundary.

**Homepage intro scroll-fill** (`.intro-strip`, tresmarescapital.com-style) — the headline and both deck paragraphs start dim and **fill word by word, top to bottom, scrubbed to scroll**, staying lit once passed. One ordered GSAP tween over `h1 .w` then `.deck .rw` (65 words), scrubbed off a ScrollTrigger on `.intro-text` (`start: 'top 96%'`, `end: 'bottom 60%'`, `scrub: 1.1`); per-word `sine.inOut` with `duration: 1.4` / `stagger: 0.32` deliberately overlaps ~3 words so the fill front is a soft gradient, not a hard edge. The gold `stories,` underline lights via `--underline` past 30% progress. **Progressive enhancement**: CSS base is `opacity: 1` and GSAP dims to `0.16` at runtime, so with no JS or under reduced motion the text is simply fully readable. This replaced both the old focal-line spotlight (`--reveal`) and the headline rise-in entrance; `.revealed` is still added by an IntersectionObserver because it drives the photo curtain reveals.

**Leaflet map** (index + neighbourhood): tile provider is CARTO Dark Matter (no API key; swap for a keyed Stadia/Mapbox layer before a high-traffic commercial launch). Popup content is built with DOM nodes + `textContent` — never template strings — honoring the project-wide rule. `map.invalidateSize()` fires via IntersectionObserver because Leaflet mismeasures when initialised off-screen.

**Breakfast pricing**: à la carte, **not included** in any room rate — never reintroduce "included" wording. **The price is not published on the site** (client decision 2026-08-06): every mention reads **"ask reception"**, and the old "€18 per person" wording is retired — don't bring it back. **Hours are 07:30 — 11:00** on every page (the 07:00 that used to sit in `breakfast.html`'s body and `faqs.html` was wrong; confirmed 2026-08-06).

**Room service** (`room-service.html`) — a shop-style ordering page for guests already in the house. Reached **only by a QR card in the rooms** (client decision 2026-11-03): `noindex, nofollow`, not in the nav, mobile menu, footer or sitemap — don't add it to any of them. It replaces the Wix Forms form "Guest - 26 Menu" on the hotel's Wix site; keep the two in step until Wix is retired.
- **Menu data** is the `MENU` array in the page's last `<script>`. Prices are stored in **forint exactly as printed on the Twenty Six menu** and converted to euro by `eur()`, **rounded UP to the next €0.10**; the page shows **euro only** (client decision — no Ft on screen). The rate is live — see **Room service euro rate** below. A new menu = edit `MENU` (and `AFTERNOON_ORDER`), nothing else. Room-service prices equal restaurant prices; the only extra is a flat **€6 room service charge per order** (`FEE_EUR`). The printed menu's "+15% service charge" is **not** applied to room service.
- **Room service euro rate** (added 2026-11-09, source changed 2026-11-13) — the euro figure follows **Erste Bank's euro buying rate** ("vétel", cash table), management's decision of 2026-11-13; the page adds its 2% buffer on top. Until that date it followed MNB, because SabeeApp converts at MNB; the page and SabeeApp no longer agree, and management accepted that on 2026-11-13. The page fetches **`/api/rate`**, served by **`netlify/functions/rate.mjs`** — the site's only server-side code.
  - **Why a function and not a fetch from the page**: no source is reachable from a browser — none sends a CORS header. Going through the function also means a guest's browser makes **no third-party request**, which is what `privacy.html` claims and must keep claiming.
  - **Erste's feed** is the public JSON behind erstebank.hu/hu/arfolyamok-table: `https://openbankapi.erstebank.hu/public/api/v1/fxRatesList?rateType=Banknote&currencies=EUR[&date=YYYY-MM-DD]`, HTTPS, no key. **Management confirmed on 2026-11-13 that the hotel may rely on it**, but it is not formally documented and can change shape without notice. Each table quotes buy / middle / sell; the cash table runs a steady **3.5% either side of its middle** (352.75 / 365.54 / 378.33 on 2026-11-13) and publishes at **08:00**, before MNB. **There is no cash quote on weekends or public holidays** — the dated query returns `{"fx":[]}` — so `fromErste()` falls back to asking the previous six days at once and keeps the most recent. The table is one setting, `ERSTE` at the top of the file; the account-conversion (`ip_banknote` / `ipInterBank`) and commercial (`ip_exchange` / `ipCommercial`) tables quote several times a day, which `parseErste()` handles by keeping the latest.
  - **How Erste's answer is checked** before it prices anything: the buying rate must sit below Erste's own middle, by at most `MAX_SPREAD` (8%); and **Erste's middle — not the buying rate, which is meant to sit low — must agree with the market witness within `TOLERANCE`** (2%). A feed that swaps fields, halves its numbers or starts quoting something else is refused rather than believed.
  - **MNB and the ECB are the witness, never the price.** `witness()` keeps the old rule: MNB counts only when the ECB corroborates it, because MNB arrives over plain `http://`.
  - **MNB answers over plain `http://` only** — the identical POST to `https://` returns 404. Its payload is a SOAP envelope wrapping **XML escaped as text**, with a **Hungarian decimal comma** and a `unit` attribute. Hence the parse in `parseMnb()`. MNB and the ECB normally sit ~0.05% apart.
  - **Chain** (`pick()`): Erste missing or malformed → `null`; a witness exists and Erste's middle agrees → **Erste's buying rate**; a witness exists and Erste disagrees → `null`; no witness → Erste only if its middle is within **±5% of `REFERENCE`**. On `null` the page keeps its cached rate, else its `FALLBACK`. **There is deliberately no fall-back to MNB's own number**: it is a middle rate, 3.5% above the buying rate, so prices would drop during an Erste outage and jump back after it. A guest never sees a blank or a zero price.
  - **The page applies the same 250–500 Ft guard** (`sane()`), because a rate also reaches it from `localStorage`, which the page does not control — a corrupted entry would otherwise price every dish from a nonsense number. The guard covers both the cached value and whatever `/api/rate` returns.
  - **Two hardcoded numbers drift together** and should be refreshed in the same sitting: `REFERENCE` in the function is a **middle** rate (365, bounding an uncorroborated middle) and `FALLBACK` in the page is a **buying** rate (353, used when nothing better is known). They sit ~3.5% apart by design.
  - **Caching**: a successful answer is held an hour at the Netlify edge and may be served stale for a day while it refreshes, so the sources are hit roughly once an hour at most. A failure is cached for a minute only. In the browser the last rate is kept in `localStorage` under **`rs-eur-rate`** as `{rate, date, source, ts}`, and its only job is the **first paint**: a valid entry is on screen at once, and **`/api/rate` is asked on every load regardless**. `readCache()` decides what valid means — a rate inside `BOUNDS`, and a `ts` that is a finite positive number, not in the future and no older than `CACHE_MAX_AGE` (a week). Anything else, including every entry written before 2026-11-10 (they carry `day`, not `ts`), is ignored.
  - **`date` and `ts` are different things and must stay that way.** `date` is the day the source published the rate for; `ts` is when this browser received it. They differ all weekend and on holidays, when the latest quote is days old. The first version stamped the entry with the *visit* day and skipped the request while that stamp said today — so a rate read at 08:00 was kept until midnight, and an entry rejected for pricing (`rate: 0`) still silenced the request. **Do not reintroduce a "today is already known" shortcut**; the edge cache already makes the request cheap.
  - **The rate freezes once anything is in the tray** (`rateLocked`) — a total that moved under a guest mid-order would be worse than a rate a few hours old. `rate` and `rateInfo` move together or not at all, because `rateInfo` is what the order email reports. An answer that arrives after the first dish is still **written to the cache** — it is the next visit's first paint — but changes nothing about the order in progress.
  - **The order email carries a `PRICING` block** — menu rate, source, the **published** date (`rateLabel()`: "Erste Bank cash buying rate of 2026-11-13", never the day of the visit; the label comes from the function, and the page accepts only letters, spaces and brackets in it), and the applied rate after the buffer — so reception can reconcile a euro figure against SabeeApp. It is deliberately **not** shown on the page (client, 2026-11-09: no rate wording for guests).
  - **Test it without deploying**: `node tools/test_rate.mjs` checks the function — Erste, MNB and ECB parsing, Budapest dates, the sanity bounds, and every branch of `witness()` and `pick()` — offline (59 assertions); `--live` also calls all three sources for real. `node tools/test_rate_client.mjs` checks the page's half (53 assertions): it lifts the code between the `rate-layer:begin` / `rate-layer:end` markers out of `room-service.html` and runs it in a sandbox with a fake `localStorage`, `fetch` and clock, so it tests what ships. **Keep that stretch free of DOM access** — `repaint()` is its only way out — or the test can no longer run it. On `localhost` there is no function, so `/api/rate` 404s and the page quietly uses `FALLBACK` — that is the fallback path working, not a bug.
- **Two menus**, switched in the hero: *Lunch & dinner* (12:30–15:00, 17:00–22:30: cold mezze, hot mezze incl. "Choose 4", signature plates, mains, bread, desserts) and *Afternoon* (15:00–17:00: the sharing plates flagged `aft: true` in `AFTERNOON_ORDER`'s order, plus bread and desserts). Hours live in `HOURS`, evaluated in **Europe/Budapest** time; the page opens on whichever menu is being served now.
- **No delivery time** (client removed it 2026-11-03): an order means "now", so the send button is disabled while the chosen menu is not being served, with the next start time shown underneath. Dishes not on the afternoon menu are flagged in the tray and block checkout until removed.
- **No dish pictures** (client decision 2026-11-03 — neither the hotel nor the restaurant has photos of every dish). Cards are text-only; don't add illustrations or stock food photos. The hero uses the existing restaurant/lounge photos, crossfading per menu.
- **"Choose 4"** opens a picker of the cold + hot mezze; each chosen set is its own tray line (`choose4:<sorted ids>`), and its four dishes go into the order text.
- **Order delivery** (reworked 2026-11-04): the details step is a real `<form name="room-service" data-netlify>`, but it submits **only two fields**: `subject` and `order`. The visible inputs (room, name, notes, cutlery `fCut`) deliberately have **no `name`** — `orderText()` folds them into the one plain-text `order` summary (room, guest, menu, cutlery, dishes with Choose-4 picks, dishes subtotal, €6 room service, total, allergies/requests), so the email reads as a single block. The hidden `subject` is rewritten on send to `Room 204 · Room service · €22.00`; Netlify uses it as the email subject. Sample body: `docs/email/room-service.txt`. If you add a field, give it a `name` only if it should appear in the email as its own row. There is **no order reference** (dropped on purpose).
- **Sending**: JS posts the form to `/` (Netlify Forms) with a 30 s timeout. While it is sending, `sending` locks the whole drawer (adding dishes, steps, menu switch, close). If the post fails, the button reads "Try again" and the guest is told to call reception first and give the room number, so a retry doesn't make a duplicate order. On success the sent screen says "Request submitted… For confirmation or changes, call reception on +36 1 808 0980". It makes no promise that reception will call the guest. There is also a 25 ms phone vibration when the check finishes drawing, skipped under reduced motion.
- **Localhost is a preview** (`previewOnly`): nothing is posted, the menu-hours lock is lifted so any time can be tested, and every label says "Preview". Test a real send only on the live site, and only with the hotel's knowledge — it lands in the real inbox.
- **Email design**: the built-in Netlify email can't be styled. `docs/email/room-service.html` is a branded HTML design kept as an **unused alternative**. Using it would need a Netlify Function plus an email provider (account and API key), and turning off the standard notification.
- **Motion**: "+1" chip flies from the Add button into the tray button, tray bumps, totals tween, drawer steps slide, the sent screen draws a check and "prints" a ticket. All skipped under reduced motion. The tray is not persisted in storage on purpose — the privacy page lists exactly three functional storage keys and the tray is not one of them.
- Drawer and picker are `role="dialog"` with focus trap, Esc to close, Lenis stopped while open (`data-lenis-prevent` on their scroll areas). The generic GSAP reveal pass is deliberately not loaded on this page.

**DOM safety**: always use `textContent`, never `innerHTML`. This is a hard rule across all inline JS (Ver2 and Ver3) and is currently enforced (grep finds zero occurrences).

---

## Verifying scroll work in a browser (read this before debugging animations)

These cost real time more than once — the animations are fine, the *measurements* mislead:

- **Scrubbed ScrollTriggers lag on purpose.** After jumping the scroll programmatically, reading CSS vars or computed opacity immediately returns stale values — `scrub: 0.85`–`1.1` eases over ~1s, and calling `ScrollTrigger.update()` does **not** snap it. A reading of `--bk-canvas-opacity: 0` mid-scene usually means "not settled yet", not "broken". Let it settle, then trust a **screenshot** over a number.
- **Lenis owns the scroll position.** `window.scrollTo()` gets fought/overridden. Use `window.__lenis.scrollTo(target, { immediate: true })`.
- **Lazy images collapse geometry.** Room gallery `<img>`s are `loading="lazy"` and `.rf` figures take their height from `aspect-ratio: 3/2` applied to their width (the imgs are `position: absolute`, contributing no intrinsic size). Jump into an unloaded region and every offset you measure is wrong — force `loading='eager'` first when scripting checks.
- **`display: contents` breaks `offsetParent` chains**, so hand-rolled `offsetTop` walking is unreliable inside the mobile rooms cinema.
- The homepage repaints continuously (film grain + Lenis rAF + canvas), which can make screenshot capture time out even though the page is healthy — confirm with a console check and a simple `eval` before assuming a hang. Note the preview `eval` helper does **not** await Promises; keep expressions synchronous.

---

## Deployment

- **GitHub remote**: `Pavkol1/VER-2.0` (origin)
- **Netlify**: `netlify.toml` sets `publish = "Ver3"`. There is no build command — Netlify just serves the directory. Builds finish in seconds.
- **One serverless function**: `netlify/functions/rate.mjs`, exposed at `/api/rate` by a redirect in `netlify.toml`. No `package.json`, no dependencies, no bundler — Netlify runs the file as it is. It is the only part of the site that is not static, and it cannot be exercised by `start-server.sh`; a deploy preview on a feature branch is the way to check it before `main`.
- **Production branch is `main`.** Any push to `main` goes **live** on the public hotel site within seconds — there is no staging step. Treat `git push origin main` as a production deploy and ask before pushing.
- For work-in-progress, use a feature branch and open a PR — Netlify auto-generates a deploy preview at a separate URL, leaving production untouched.
- To roll back: `git revert <bad-sha>` on `main` and push; Netlify redeploys the reverted state.

---

## Frontend Skill

**Invoke a design skill first** — before writing or editing any frontend code, every session. Use `impeccable` where it is installed (it became the lead skill on 2026-08-05); where it isn't, use `frontend-design:frontend-design`. Never run both.

`impeccable` is installed per machine in `~/.claude/skills/impeccable/`, **not** in this repo; a fresh machine needs `npx impeccable install` first. **The reception PC (user `Recepcio-2`) has neither it nor Node.js.** The client chose on 2026-11-03 not to install them for now, so use `frontend-design` there. `room-service.html` was built on that PC to this file's design system. Offer `/impeccable audit` / `polish` on that page once impeccable is available. It also installs a detector hook (`~/.claude/settings.local.json`) that checks UI files after each edit and does a deeper pass at the end of a turn; `/impeccable hooks off` disables it.

Useful sub-commands: `/impeccable document` records the incumbent design system into DESIGN.md, `/impeccable audit <target>` runs accessibility/performance/responsive checks, `/impeccable critique <target>` is a UX review, `/impeccable polish <target>` is a pre-ship pass.

**Product context:** [PRODUCT.md](PRODUCT.md) in docs/ holds the confirmed product record — users, positioning, constraints, what must never be fabricated. Written 2026-08-05 from a client interview. Read it before design decisions; update it when product truth changes.

**Anti-generic guardrails:**
- Never use the same font for headings and body
- Every clickable element needs hover, focus-visible, and active states
- Minimum 44px tap targets on mobile
- Surfaces use a layering system (base → elevated → floating)
