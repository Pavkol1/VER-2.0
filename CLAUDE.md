# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **RULE #1: Always invoke the `impeccable` skill before writing or editing any frontend code. Every session. No exceptions.**
>
> It supersedes `frontend-design:frontend-design`, which is no longer the lead skill here. Product truth lives in [PRODUCT.md](PRODUCT.md) — read it before design decisions, and keep it current rather than re-deriving it.

---

## Current Status — Handoff (last updated 2026-07-20)

**The live site is now Ver3.** The active, deployable site root is **`Ver3/`** (not `Ver2/`). `netlify.toml` publishes `Ver3`. `Ver2/` is kept as legacy/reference only — do not edit it.

**Where we are:**
- Ver3 is a full redesign of the whole site. Recently completed milestones (see `git log`): M2.2 rooms rebuild, M3.1 interactive SVG neighbourhood map, M3.2 booking-trust block, site-wide Lenis smooth-scroll, contact/faqs pass, GSAP scroll-reveal pass, homepage luxuries/rooms reorder + always-scrolling hero marquee, the breakfast **coffee→Danube** sequence (180 scrubbed webp frames), the green-wall site loader, sweep page transitions, the right-edge chapter rail, the new font pairing, the **alma-style mobile room selector**, and the **tresmares-style intro scroll-fill**.
- All pages (`index, rooms, pleasures, breakfast, neighbourhood, contact, faqs`) exist in `Ver3/` and are on the Ver3 design language.
- **Production = `main` branch.** A push to `main` is a live deploy to https://secrethotel.netlify.app/ — **always ask first.**

**Branches:**
- `main` — production (Netlify deploys this).
- `claude/wonderful-mclaren-d67b3f` — working/feature branch (current work happens here). `main` and this branch are normally kept at the same commit.

**Open / not-yet-done:**
- **Booking runs through SabeeApp** — all 21 booking CTAs and the homepage reserve form open `https://ibe.sabeeapp.com/v3/p/Stories-Boutique-Hotel?p=063b197ca9a16951` in a new tab. The form opens it via JS, **not** a GET action: the inputs carry no `name`, and a GET submit would rebuild the query string and drop the engine's own `?p=` token. Dates and the chosen room are **not** passed through yet — that needs SabeeApp's parameter names.
- **contact.html's form is still inert** — `onsubmit="event.preventDefault()"`, posts nowhere, while its copy promises a same-day reply. Netlify Forms is the obvious destination.
- contact: optional left-edge runlabel + a mini SVG map inset (rhymes with M3.1).
- **Truthfulness pass still open** — the homepage trust grid publishes a review score and stay count ("Four point eight" / "1200+ stays") plus "From €55 each way" and "Lowest rate, guaranteed"; PRODUCT.md lists all of these as absent and forbidden to invent, and faqs.html contradicts the rate claim. Breakfast hours disagree too: 07:30 on index, 07:00 in breakfast.html's body, 07:30 in its own meta description.
- Homepage frame sets are 1280×720 sources — slightly soft on large retina screens (grain + vignette mask it). Re-generate at 1080p if the client complains.

**To resume on a fresh machine / account:** `git clone https://github.com/Pavkol1/VER-2.0.git`, `git checkout claude/wonderful-mclaren-d67b3f`, then `python3 -m http.server 8000` → http://localhost:8000/Ver3/. Note: chat history and Claude memory do NOT transfer between accounts — only the code (and this file) travels via git.

---

## Project

**Stories Hotel Budapest** — a static multi-page boutique hotel website. No build step, no framework, no package manager. Each page is a self-contained HTML file with all CSS and JS inlined; the `<script>` block lives at the bottom of every page.

**No build, no linter, no test suite.** All edits go directly into HTML files and are verified visually in a browser. Do not attempt `npm install`, `pytest`, or similar — there is nothing to run.

**To run locally** (Safari blocks `file://` with relative asset paths, so an HTTP server is required):

```bash
python3 -m http.server 8000
# then open http://localhost:8000/Ver3/   (Ver3 is the live site; Ver2 is legacy)
```

Per user preference, ask Claude to start the server rather than running it yourself.

---

## Repository Layout

```
.
├── netlify.toml          publish = "Ver3"  (the only config — no build command)
├── Ver3/                 ← ACTIVE, deployable site root (edit here)
│   ├── index.html        Homepage: loader + hero + intro-strip + luxuries + rooms rail + coffee→Danube scene + neighbourhood + reserve
│   ├── rooms.html        6 rooms, top-nav + sticky info, 5–6 photos per room
│   ├── pleasures.html    Bar & Lounge, Gym (GoActive), Coworking as full-width feature sections
│   ├── breakfast.html    Plate + intro grid + 3-column menu + sourcing block
│   ├── neighbourhood.html  Plate + neighbourhood list + interactive SVG map (M3.1)
│   ├── contact.html      60vh hero + 2-column contact info/form
│   ├── faqs.html         Paper bg (no plate), sticky nav sidebar, accordion FAQ
│   └── assets/
│       ├── brand/        Hero/plate backgrounds, logos, danube-budapest.webp, sky-evening.webp, sky-rise.mp4 (crane to sky)
│       ├── coffee/       frame_001…120.webp (the scrubbed pour) + coffee-loop.mp4 (ping-pong surface)
│       │                 + coffee-danube.mp4 (the morph, plays once)
│       ├── photos/       Per-room and amenity galleries (presidential-suite/, king-suite/, …)
│       └── vendor/       lenis.min.js · gsap.min.js · ScrollTrigger.min.js
└── Ver2/                 legacy / reference only — do NOT edit
```

Asset URLs in the HTML use `assets/...` (relative from `Ver3/`). When adding photos, place them inside `Ver3/assets/`.

**Images** — every gallery photo ships as `NAME.webp` (1600w) plus generated `NAME-800.webp` and `NAME-1200.webp`, wired through `<picture><source srcset="… 800w, … 1200w, … 1600w" sizes="(max-width: 880px) 100vw, 50vw">` with a single-size `.jpg` fallback on the `<img>`. **Regenerate the variants whenever a source photo is replaced** (Pillow, quality 74/76, `method=6`) or the `srcset` will 404. Every image on every page is `loading="lazy"` — there are no eager images left.

Favicon is suppressed with `<link rel="icon" href="data:,">` on every page (no favicon file exists — this silences the 404).

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

Old tokens were `--ivory #F2EDE4 / --ink #0D0B08 / --gold #B9904E / --green #2A5C45`, headings in `Playfair Display`. This applies only to the frozen `Ver2/` folder.

---

## Architecture Notes

**Navigation** — fixed; `rgba(13,11,8,0.85)` + `backdrop-filter: blur(14px)` activated by adding `.scrolled` once `window.scrollY > 40`. Nav height is ~92px; other sticky UI docks below that. **Mobile menu** (≤1024px, all pages): `.nav-links` hides and a `.m-burger` button (44×44, morphs to an X) opens the `.mnav` full-screen emerald overlay — numbered serif links with staggered rise-in, gold active/current page, Reserve CTA + contact meta at the bottom. `body.menu-open` locks scroll (`overflow: hidden` + `__lenis.stop()`) and forces the nav visible over the index auto-hide. Closes instantly on tap of any `.mnav-links`/`.mnav-cta` link (so the transition panel doesn't animate in over a still-open menu) and on Esc/bfcache `pageshow`; menu links are also intercepted by the page-sweep layer like any internal link (sweep z 190 covers overlay z 78). Burger is paper-colored; `faqs.html` overrides it to ink (paper nav).

**Reserve** — an inline `.reserve-plate` section at the bottom of `index.html` (anchor `#reserve`), **not** a slide-out panel. Its `.reserve-form` is currently a **non-functional mock**: `onsubmit="event.preventDefault()"` and no action/endpoint. The only real contact route on the page is the footer `mailto:hello@storiesbudapest.com`.

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

**Homepage coffee→Danube scene** (`.bk-coffee-scene`, `index.html`): one 430vh sticky scene, one `ScrollTrigger` with `scrub: 0.85` (inertial catch-up). Timeline: breakfast photo → coffee spill (120 webp frames) → breakfast-facts plateau → coffee swirl morphs into the Danube (60 webp frames) → crossfade into `danube-budapest.jpg` (real photo replaces the AI-looking last frames) → neighbourhood titles (`.dn-content`, holds `id="neigh"`). Both frame sets share one `<canvas>`; fractional frame indices are blended via `globalAlpha` so the scrub never steps. A single `.bk-scene-veil` vignette sits above all media layers (no brightness jump between photo/canvas/final). Frames preload via IO at `rootMargin: 300%`; a `painted` flag stops the (black, `alpha:false`) canvas from being revealed before its first draw. On reduced-motion or ≤860px, `body.bk-static` collapses the scene into two static blocks (the whole page gets much shorter on mobile as a result — worth knowing when computing scroll positions). The Breakfast→Neighbourhood handover sits at internal `p=0.62`; the chapter rail reuses that exact split for its 04→05 boundary.

**Homepage intro scroll-fill** (`.intro-strip`, tresmarescapital.com-style) — the headline and both deck paragraphs start dim and **fill word by word, top to bottom, scrubbed to scroll**, staying lit once passed. One ordered GSAP tween over `h1 .w` then `.deck .rw` (65 words), scrubbed off a ScrollTrigger on `.intro-text` (`start: 'top 96%'`, `end: 'bottom 60%'`, `scrub: 1.1`); per-word `sine.inOut` with `duration: 1.4` / `stagger: 0.32` deliberately overlaps ~3 words so the fill front is a soft gradient, not a hard edge. The gold `stories,` underline lights via `--underline` past 30% progress. **Progressive enhancement**: CSS base is `opacity: 1` and GSAP dims to `0.16` at runtime, so with no JS or under reduced motion the text is simply fully readable. This replaced both the old focal-line spotlight (`--reveal`) and the headline rise-in entrance; `.revealed` is still added by an IntersectionObserver because it drives the photo curtain reveals.

**Leaflet map** (index + neighbourhood): tile provider is CARTO Dark Matter (no API key; swap for a keyed Stadia/Mapbox layer before a high-traffic commercial launch). Popup content is built with DOM nodes + `textContent` — never template strings — honoring the project-wide rule. `map.invalidateSize()` fires via IntersectionObserver because Leaflet mismeasures when initialised off-screen.

**Breakfast pricing**: à la carte, **not included** in any room rate — never reintroduce "included" wording. Price wording differs by page: the **homepage** (`index.html`) breakfast facts now read **"Ask reception"** (per the coffee-noir redesign); `breakfast.html` and `faqs.html` still state **"€18 per person"**. If syncing later, decide on one wording across all three. Homepage breakfast **Hours** are **07:30 — 11:00**.

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
- **Production branch is `main`.** Any push to `main` goes **live** on the public hotel site within seconds — there is no staging step. Treat `git push origin main` as a production deploy and ask before pushing.
- For work-in-progress, use a feature branch and open a PR — Netlify auto-generates a deploy preview at a separate URL, leaving production untouched.
- To roll back: `git revert <bad-sha>` on `main` and push; Netlify redeploys the reverted state.

---

## Frontend Skill

**ALWAYS invoke the `impeccable` skill FIRST** — before writing or editing any frontend code, every session, no exceptions. It replaced `frontend-design:frontend-design` as the lead skill on 2026-08-05; don't run both.

It is installed globally at `~/.claude/skills/impeccable/`, so it travels with the machine, **not** with this repo — a fresh clone on another machine needs `npx impeccable install` first. It also installs a detector hook (`~/.claude/settings.local.json`) that checks UI files after each edit and does a deeper pass at the end of a turn; `/impeccable hooks off` disables it.

Useful sub-commands: `/impeccable document` records the incumbent design system into DESIGN.md, `/impeccable audit <target>` runs accessibility/performance/responsive checks, `/impeccable critique <target>` is a UX review, `/impeccable polish <target>` is a pre-ship pass.

**Product context:** [PRODUCT.md](PRODUCT.md) at the repo root holds the confirmed product record — users, positioning, constraints, what must never be fabricated. Written 2026-08-05 from a client interview. Read it before design decisions; update it when product truth changes.

**Anti-generic guardrails:**
- Never use the same font for headings and body
- Every clickable element needs hover, focus-visible, and active states
- Minimum 44px tap targets on mobile
- Surfaces use a layering system (base → elevated → floating)
