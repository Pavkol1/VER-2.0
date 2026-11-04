# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

> **RULE #1: Always invoke the `frontend-design:frontend-design` skill before writing or editing any frontend code. Every session. No exceptions.**

---

## Project

**Stories Hotel Budapest** — a static multi-page boutique hotel website. No build step, no framework. Each page is a self-contained HTML file with all CSS and JS inlined.

**No build, no linter, no test suite.** All edits go directly into HTML files and are verified visually in a browser. Do not attempt `npm install`, `pytest`, or similar — there is nothing to run.

**Ver2 is the active production version** — deployed to Netlify via GitHub (`Pavkol1/VER-2.0`). Ver1 is archived; do not modify it.

**To run locally:** `python3 -m http.server 8000` from the project root, then open `http://localhost:8000/Ver2/`. The `start-server.sh` script does the same.

---

## File Locations

```
Ver2/                             ← ACTIVE version (self-contained, deployable)
├── index.html                    Homepage: hero plate + rooms rail + pleasures + breakfast + neighbourhood + reserve
├── rooms.html                    6 rooms in alternating dark/light split layout
├── pleasures.html                Bar & Lounge, Gym, Coworking as full-width feature sections
├── breakfast.html                Plate + intro grid + 3-column menu + sourcing block
├── neighbourhood.html            Plate + neighbourhood list with CSS grid map
├── contact.html                  Plate + 2-column contact info/form
├── faqs.html                     Ivory bg (no plate), sticky nav sidebar, accordion FAQ
└── assets/
    ├── brand/                    Hero/plate background JPGs (4T4B5708.JPG, DorS347, DorSharon341)
    └── photos/
        ├── presidential-suite/
        ├── king-suite/
        ├── junior-suite/
        ├── deluxe/
        ├── deluxe-queen/
        ├── breakfast/
        ├── restaurant/           Bar & lounge photo
        ├── GYM/
        └── Coworking/

Ver1/                             ← Archived. Do not edit.
├── concepts/
│   ├── concept-b.html            WebGL gradient + card-scroll experiment
│   └── main-concept.html         Checkpoint snapshot of concept-b
├── pages/                        Old version of the site
└── assets/                       Original source assets — Ver2/assets/photos/ is a COPY of these
```

Asset paths in Ver2 HTML use `assets/...` (relative from Ver2 root). When editing or adding photos, update files **inside `Ver2/assets/`** — Ver1 is the historical source but Ver2 is what Netlify serves, and the two trees are not symlinked.

---

## Design System (Ver2)

**Cinematic "plate + body" architecture** — every section opens with a `100vh` full-bleed photo plate (`.plate`), followed by a content body (`.body`). Exception: `faqs.html` has no plate.

**Design tokens**
```css
--ivory:  #F2EDE4
--ink:    #0D0B08
--ink-2:  #1A1712
--gold:   #B9904E
--green:  #2A5C45
--ease:   cubic-bezier(0.22, 0.61, 0.36, 1)
```

**Typography**
- Headings: `Playfair Display` (Google Fonts)
- Body/UI: `Inter` (Google Fonts)
- Labels/mono: `JetBrains Mono` (Google Fonts)
- Section labels: 11px, `letter-spacing: 0.2em`, `text-transform: uppercase`

**Logo** — CSS text only, never use the JPG (white background breaks on dark hero):
```html
<div class="logo-text">
  <span class="logo-stories">Stories</span>
  <span class="logo-hotel">Budapest, Hungary</span>
</div>
```

**Animations**
- Plate bg zoom: `scale(1.06)` → `scale(1.0)` on `.visible` (1.6s `--ease`)
- Scroll reveals: IntersectionObserver with `threshold: [0.35, 0.6]`, adds `.visible` class
- Running label (`.runlabel`): rotated −90° on left edge, section name updated via IntersectionObserver using `textContent` (never `innerHTML`)
- `prefers-reduced-motion` respected on all pages
- Animate only `transform` and `opacity`

---

## Architecture Notes

**Navigation** — fixed, `rgba(13,11,8,0.85)` + `backdrop-filter: blur(14px)` after 40px scroll (JS adds `.scrolled`). Mobile: hamburger → full-screen overlay.

**Booking panel** — `<aside>` slides from right via `translateX(100%) → 0`. Form submits to `mailto:hello@storiesbudapest.com`.

**Rooms** (6 total, in display order):
1. Presidential Suite — 165–180 m², 2 bed/2.5 bath, Jacuzzi & Sauna
2. King Suite with Jacuzzi — 85 m², Jacuzzi, Sauna, Green Wall Shower
3. Junior Suite — 65–75 m², King Bed, Living Room, Sofa-Bed
4. Deluxe Room — 34–45 m², King Bed, Living Room, Designer Art
5. Deluxe Queen Room — 30 m², Queen Bed, Inner Courtyard View
6. Superior Room — 17 m², Queen Bed, Intimate & Cosy

**Rooms layout** (`rooms.html`): alternating dark/light split — even-indexed rooms use `direction: rtl` for reversed image/text layout.

**Pleasures layout** (`pleasures.html`): `.pleasure-feature` sections with `.reverse` modifier for alternating image sides.

**Index rooms rail**: native horizontal scroll + `scroll-snap-type: x mandatory`.

**DOM safety**: always use `textContent`, never `innerHTML`. This is a hard rule across all inline JS in Ver2.

---

## Deployment

- **GitHub repo**: `Pavkol1/VER-2.0`
- **Netlify**: `netlify.toml` at project root sets `publish = "Ver2"`. Builds finish in ~4–5 seconds.
- **Production branch is `main`.** Any push to `main` goes **live** on the public hotel site within seconds — there is no staging step. Treat `git push origin main` as a production deploy.
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
