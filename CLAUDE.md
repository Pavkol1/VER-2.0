# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **RULE #1: Always invoke the `frontend-design:frontend-design` skill before writing or editing any frontend code. Every session. No exceptions.**

---

## Current Status — Handoff (last updated 2026-06-11)

**The live site is now Ver3.** The active, deployable site root is **`Ver3/`** (not `Ver2/`). `netlify.toml` publishes `Ver3`. `Ver2/` is kept as legacy/reference only — do not edit it.

**Where we are:**
- Ver3 is a full redesign of the whole site. Recently completed milestones (see `git log`): M2.2 rooms rebuild, M3.1 interactive SVG neighbourhood map (homepage + neighbourhood), M3.2 booking-trust block, site-wide Lenis smooth-scroll, contact/faqs pass, GSAP scroll-reveal pass across all pages, homepage luxuries/rooms reorder + always-scrolling hero marquee, and the breakfast coffee-noir sequence (scroll-scrubbed 69-frame canvas animation).
- All pages (`index, rooms, pleasures, breakfast, neighbourhood, contact, faqs`) exist in `Ver3/` and are on the Ver3 design language.
- **Production = `main` branch.** A push to `main` is a live deploy to https://secrethotel.netlify.app/ — **always ask first.**

**Branches:**
- `main` — production (Netlify deploys this).
- `claude/wonderful-mclaren-d67b3f` — working/feature branch (current work happens here).

**Open / not-yet-done (deferred during the contact/faqs pass):**
- contact: optional left-edge runlabel + a mini SVG map inset (rhymes with M3.1).
- faqs: accessibility upgrade — turn `.faq-q` `<div>`s into `<button>` with `aria-expanded`, add smooth open/close animation, make the sticky category nav real `<a href="#id">` links.

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
│       ├── brand/        Hero/plate backgrounds + logos (hero.jpg, breakfast-new.jpg, danube-budapest.jpg, loader-wall.mp4/-poster.jpg, …)
│       ├── coffee/       frame_001…120.webp + coffee-final.webp — coffee spill scroll sequence (cropped to 3:2, no bars)
│       ├── danube/       frame_001…060.webp — coffee→Danube morph sequence (ends crossfading into danube-budapest.jpg)
│       ├── photos/       Per-room and amenity galleries (presidential-suite/, king-suite/, …)
│       └── vendor/       lenis.min.js · gsap.min.js · ScrollTrigger.min.js
└── Ver2/                 legacy / reference only — do NOT edit
```

Asset URLs in the HTML use `assets/...` (relative from `Ver3/`). When adding photos, place them inside `Ver3/assets/`.

Favicon is suppressed with `<link rel="icon" href="data:,">` on every page (no favicon file exists — this silences the 404).

---

## Third-Party Libraries

| Library | Source | Used on |
|---|---|---|
| **Lenis** (smooth-scroll) | `assets/vendor/lenis.min.js` | All pages |
| **GSAP** (scroll reveals, timeline animations) | `assets/vendor/gsap.min.js` | All pages |
| **ScrollTrigger** (GSAP plugin) | `assets/vendor/ScrollTrigger.min.js` | All pages |
| **Leaflet** (interactive map) | CDN (unpkg, no key) | `index.html`, `neighbourhood.html` only |

GSAP + ScrollTrigger load as `<script>` tags just before the inline `<script>` block on every page; Lenis is initialised inside the inline script.

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
--text-2:  #6A6A5C
--text-3:  #9A9A8C   /* mono labels */
--primary: #123524   /* deep emerald */
--accent:  #B9904E   /* gold */
--ease:    cubic-bezier(0.22, 0.61, 0.36, 1)
```

**Typography** (Google Fonts, same `<link>` on every page):
- Headings: `Lora` (serif), often with italic `em` in `--primary` or `--accent`
- Body/UI: `Inter`
- Labels/overlines/mono: `JetBrains Mono`, 10–11px, `letter-spacing: 0.18em–0.28em`, uppercase
- `Playfair Display` + `Pinyon Script` are used by the hero logo wordmark system

**Ver3-specific systems** (present in every page, near-identical CSS/JS blocks):
- **Logo stage** (`.logo-stage` / `.logo-mover`) — wordmark that scales/moves into the nav slot; flips ink⇄paper via `body.logo-on-light` as you cross light/dark sections.
- **Boutique cursor** (`.cursor` — gold dot + lagging ring + magnetic `.magnet` CTAs). Disabled on touch + reduced-motion.
- **Lenis smooth-scroll** — `assets/vendor/lenis.min.js`, `lerp: 0.085`; skipped under `prefers-reduced-motion`.
- **Nav** — `.scrolled` state once `scrollY > 40`. On `index.html` only, a direction-tracking scroll handler toggles `body.nav-hidden`, which hides the nav via `translate3d(0, -110%, 0)` (a pure transform slide — no `opacity`, because the blurred backdrop + opacity repaints glitch on Safari).
- **Page transitions** — fade-through-dark on every internal link: click sets `body.page-leaving` (`.page-fade` overlay fades to `--ink`, ~0.45s) then navigates; the next page reads a `sessionStorage('pt')` flag in a `<head>` script and starts veiled (`html.pt-in`), fading open after first paint. bfcache handled via `pageshow`.
- **Premium shared layer** (bottom `<script>` on every page) — page transitions + blur-up image loading (`img.lz` → `.ld` on decode); `.site-grain` fixed film-grain overlay; `:focus-visible` gold outlines.
- **Site loader** (`index.html` only, every visit) — fullscreen green-wall video (`loader-wall.mp4`, 470KB) with wordmark + gold progress line; min 1.9s, max 4.5s, exits with an upward `clip-path` wipe. Skipped under reduced-motion.
- Shared dark `<footer>` grid across all pages.

**Animations**
- Plate bg zoom: `scale(1.06)` → `scale(1.0)` when section gains `.visible` (1.6s `--ease`)
- GSAP scroll reveals: `gsap.from()` + ScrollTrigger entries for staggered text, image curtains, and section reveals; structural sections (stage, cinema, coffee scene, plates, footer…) are listed in a `SKIP` selector and excluded from the generic reveal pass.
- IntersectionObserver still used for: running-label updates (`data-label`), `.in-view` on `.rf` photo frames, and Leaflet `invalidateSize` timing.
- Running label (`.runlabel`): rotated −90° on the left edge; section name/number updated via IntersectionObserver reading `data-label` attributes.
- `prefers-reduced-motion` is respected everywhere — scripts check `matchMedia('(prefers-reduced-motion: reduce)')` before registering ScrollTriggers; animate only `transform` and `opacity`.

### Design System (Ver2) — LEGACY (do not use for new work)

Old tokens were `--ivory #F2EDE4 / --ink #0D0B08 / --gold #B9904E / --green #2A5C45`, headings in `Playfair Display`. This applies only to the frozen `Ver2/` folder.

---

## Architecture Notes

**Navigation** — fixed; `rgba(13,11,8,0.85)` + `backdrop-filter: blur(14px)` activated by adding `.scrolled` once `window.scrollY > 40`. Mobile uses a hamburger → full-screen overlay.

**Booking panel** — `<aside>` slides from right via `translateX(100%) → 0`. Form submits to `mailto:hello@storiesbudapest.com`.

**Rooms** (6 total, in display order):
1. Presidential Suite — 165–180 m², 2 bed/2.5 bath, Jacuzzi & Sauna
2. King Suite with Jacuzzi — 85 m², Jacuzzi, Sauna, Green Wall Shower
3. Junior Suite — 65–75 m², King Bed, Living Room, Sofa-Bed
4. Deluxe Room — 34–45 m², King Bed, Living Room, Designer Art
5. Deluxe Queen Room — 30 m², Queen Bed, Inner Courtyard View
6. Superior Room — 17 m², Queen Bed, Intimate & Cosy

**Rooms layout** (`rooms.html`): alternating dark/light split; even-indexed rooms use `direction: rtl` for reversed image/text layout.

**Pleasures layout** (`pleasures.html`): `.pleasure-feature` sections with `.reverse` modifier for alternating image sides.

**Index rooms rail**: native horizontal scroll + `scroll-snap-type: x mandatory`. An IntersectionObserver with `rootMargin: '-50% 0px -50% 0px'` tracks which room gallery is centered and swaps `--room-bg` / `--room-ink` CSS variables on `body` to repaint the surrounding section per room (`ROOM_COLORS` palette map; active slug lives in `stage.dataset.active`). A 750ms `scrollLockUntil` debounce stops the observer from fighting programmatic `scrollIntoView`.

**Homepage coffee→Danube scene** (`.bk-coffee-scene`, `index.html`): one 430vh sticky scene, one `ScrollTrigger` with `scrub: 0.85` (inertial catch-up). Timeline: breakfast photo → coffee spill (120 webp frames) → breakfast-facts plateau → coffee swirl morphs into the Danube (60 webp frames) → crossfade into `danube-budapest.jpg` (real photo replaces the AI-looking last frames) → neighbourhood titles (`.dn-content`, holds `id="neigh"`). Both frame sets share one `<canvas>`; fractional frame indices are blended via `globalAlpha` so the scrub never steps. A single `.bk-scene-veil` vignette sits above all media layers (no brightness jump between photo/canvas/final). Frames preload via IO at `rootMargin: 300%`; a `painted` flag stops the (black, `alpha:false`) canvas from being revealed before its first draw. On reduced-motion or ≤860px, `body.bk-static` collapses the scene into two static blocks. The running label flips 03→04 mid-scene from `setSceneProgress`.

**Leaflet map** (index + neighbourhood): tile provider is CARTO Dark Matter (no API key; swap for a keyed Stadia/Mapbox layer before a high-traffic commercial launch). Popup content is built with DOM nodes + `textContent` — never template strings — honoring the project-wide rule. `map.invalidateSize()` fires via IntersectionObserver because Leaflet mismeasures when initialised off-screen.

**Breakfast pricing**: à la carte, **not included** in any room rate — never reintroduce "included" wording. Price wording differs by page: the **homepage** (`index.html`) breakfast facts now read **"Ask reception"** (per the coffee-noir redesign); `breakfast.html` and `faqs.html` still state **"€18 per person"**. If syncing later, decide on one wording across all three. Homepage breakfast **Hours** are **07:30 — 11:00**.

**DOM safety**: always use `textContent`, never `innerHTML`. This is a hard rule across all inline JS (Ver2 and Ver3) and is currently enforced (grep finds zero occurrences).

---

## Deployment

- **GitHub remote**: `Pavkol1/VER-2.0` (origin)
- **Netlify**: `netlify.toml` sets `publish = "Ver3"`. There is no build command — Netlify just serves the directory. Builds finish in seconds.
- **Production branch is `main`.** Any push to `main` goes **live** on the public hotel site within seconds — there is no staging step. Treat `git push origin main` as a production deploy and ask before pushing.
- For work-in-progress, use a feature branch and open a PR — Netlify auto-generates a deploy preview at a separate URL, leaving production untouched.
- To roll back: `git revert <bad-sha>` on `main` and push; Netlify redeploys the reverted state.

---

## Frontend Skill

**ALWAYS invoke the `frontend-design:frontend-design` skill FIRST** — before writing or editing any frontend code, every session, no exceptions.

**Anti-generic guardrails:**
- Never use the same font for headings and body
- Every clickable element needs hover, focus-visible, and active states
- Minimum 44px tap targets on mobile
- Surfaces use a layering system (base → elevated → floating)
