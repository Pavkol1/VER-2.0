# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **RULE #1: Always invoke the `frontend-design:frontend-design` skill before writing or editing any frontend code. Every session. No exceptions.**

---

## Project

**Stories Hotel Budapest** — a static multi-page boutique hotel website. No build step, no framework, no package manager. Each page is a self-contained HTML file with all CSS and JS inlined; the `<script>` block lives at the bottom of every page.

**No build, no linter, no test suite.** All edits go directly into HTML files and are verified visually in a browser. Do not attempt `npm install`, `pytest`, or similar — there is nothing to run.

**To run locally** (Safari blocks `file://` with relative asset paths, so an HTTP server is required):

```bash
python3 -m http.server 8000
# then open http://localhost:8000/Ver2/
```

Per user preference, ask Claude to start the server rather than running it yourself.

---

## Repository Layout

```
.
├── netlify.toml          publish = "Ver2"  (the only config — no build command)
└── Ver2/                 the deployable site root
    ├── index.html        Homepage: hero plate + rooms rail + pleasures + breakfast + neighbourhood + reserve
    ├── rooms.html        6 rooms in alternating dark/light split layout
    ├── pleasures.html    Bar & Lounge, Gym (GoActive), Coworking as full-width feature sections
    ├── breakfast.html    Plate + intro grid + 3-column menu + sourcing block
    ├── neighbourhood.html  Plate + neighbourhood list with CSS grid map
    ├── contact.html      Plate + 2-column contact info/form
    ├── faqs.html         Ivory bg (no plate), sticky nav sidebar, accordion FAQ
    └── assets/
        ├── brand/        Hero/plate backgrounds (4T4B5708.JPG, 4T4B6940.jpg, DorS347…, DorSharon341…)
        └── photos/       Per-room and amenity galleries (presidential-suite, king-suite, junior-suite, deluxe, deluxe-queen, breakfast, restaurant, GYM, Coworking)
```

Asset URLs in the HTML use `assets/...` (relative from `Ver2/`). When adding photos, place them inside `Ver2/assets/`.

---

## Design System (Ver2)

**Cinematic "plate + body" architecture** — every page section opens with a `100vh` full-bleed photo plate (`.plate`), followed by a content body (`.body`). Exception: `faqs.html` has no plate.

**Design tokens** (defined as CSS variables on `:root` in every page):
```css
--ivory:  #F2EDE4
--ink:    #0D0B08
--ink-2:  #1A1712
--gold:   #B9904E
--green:  #2A5C45
--ease:   cubic-bezier(0.22, 0.61, 0.36, 1)
```

**Typography** (all Google Fonts, loaded via the same `<link>` tag on every page):
- Headings: `Playfair Display`
- Body/UI: `Inter`
- Labels/mono: `JetBrains Mono`
- Section overlines/meta labels: 11px, `letter-spacing: 0.2em–0.28em`, `text-transform: uppercase`

**Animations**
- Plate bg zoom: `scale(1.06)` → `scale(1.0)` when section gains `.visible` (1.6s `--ease`)
- Scroll reveals: `IntersectionObserver` with `threshold: [0.35, 0.6]`, adds `.visible` class
- Running label (`.runlabel`): rotated −90° on the left edge; section name/number is updated via the same `IntersectionObserver` reading `data-label` attributes
- `prefers-reduced-motion` is respected — animate only `transform` and `opacity`

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

**Index rooms rail**: native horizontal scroll + `scroll-snap-type: x mandatory`.

**Breakfast pricing**: €18 per person, à la carte. Not included in any room rate. Do not reintroduce "included" wording.

**DOM safety**: always use `textContent`, never `innerHTML`. This is a hard rule across all inline JS in Ver2 and is currently enforced (grep finds zero occurrences).

---

## Deployment

- **GitHub remote**: `Pavkol1/VER-2.0` (origin)
- **Netlify**: `netlify.toml` sets `publish = "Ver2"`. There is no build command — Netlify just serves the directory. Builds finish in seconds.
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
