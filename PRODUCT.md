# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

No dominant segment — confirmed by the client as deliberately mixed, and the site must serve both without picking a side:

- **International leisure guests**, mostly couples on a 2–4 night city break, choosing visually between Budapest boutique hotels. They arrive via search or referral, judge on atmosphere, photography and neighbourhood, and decide quickly.
- **Business and longer-stay guests**, for whom the workrooms, the gym and quiet matter more than atmosphere.

Both are addressed in English; a Hungarian audience is served by a language version that does not exist yet (see Capabilities and Constraints).

## Product Purpose

Stories Hotel Budapest is a 44-room boutique hotel at Király utca 26 in District VI. The website exists to convert an undecided browser into a direct booking, and to answer — before anyone has to ask reception — what the house is, where it sits, what a room is like, and what happens in the building.

Success is a completed direct reservation. Every page is in service of that; the reservation route is currently the site's weakest link.

## Positioning

**The address.** Király utca 26 sits on the seam of District VI and District VII, which puts the ruin-bar quarter, the Jewish Quarter, the Opera and the courtyards inside a short walk. A neighbouring boutique hotel can copy a look, a room count or a restaurant concept; it cannot copy this corner of the city or the specific set of places reachable on foot from this door.

The site already carries this as an editorial claim ("a quarter worth the walk", seven walking destinations with times), and it is the claim future work must protect and sharpen rather than dilute into generic boutique-hotel language.

## Operating Context

The hotel occupies the **Twenty Six building**, and the building — not just the bedrooms — is the product:

- **Twenty Six restaurant**, ground floor. Breakfast is served 07:30–11:00, à la carte, ordered at table. Produce from the Hunyadi tér markets, bread baked at dawn.
- **Bar and lounge**, positioned as a living room for the district rather than a hotel bar.
- **GoActive gym** and **Create 26 coworking**, which carry the business and longer-stay case.

Guests evaluate the hotel from a phone or laptop before arrival, and the neighbourhood is part of what they are evaluating.

## Capabilities and Constraints

**Rooms** — six types, 44 keys: Presidential Suite (165–180 m², 2 bed / 2.5 bath, jacuzzi and sauna), King Suite with Jacuzzi (85 m²), Junior Suite (65–75 m²), Deluxe Room (34–45 m²), Deluxe Queen Room (30 m²), Superior Room (17 m²).

**Breakfast is à la carte and is not included in any room rate.** This has been stated explicitly and must never be reworded into "included". Price wording is currently inconsistent across the site — the homepage says "Ask reception" while `breakfast.html` and `faqs.html` state €18 per person. One wording needs to be chosen; until then neither is authoritative.

**Confirmed constraints for all future work:**

- **A real reservation destination is required before launch.** The reserve form on the homepage currently prevents its own submit and posts nowhere; the only working contact route is the footer mail link. A booking engine, a form backend, or mail — but not a mock.
- **A Hungarian version is required.** The EN|HU switch exists in the interface but is decorative. Copy architecture must be able to carry a second language rather than assuming English-only strings.
- **Typography licences are an open commitment.** The design references the commercial *Gangster* and *ABC Monument Grotesk*; the site currently ships free stand-ins (Libre Caslon Text, Schibsted Grotesk). If the licences are bought, the originals replace the stand-ins.
- **WCAG AA is a requirement**, not an aspiration. See Accessibility & Inclusion.

**Technical** — static multi-page site, no build step, framework or package manager; each page is self-contained with its CSS and JS inline. `Ver3/` is the live root and `Ver2/` is frozen legacy. Deployed on Netlify; a push to `main` is a production deploy.

**Undecided, not to be invented:** room rates, cancellation terms beyond what `faqs.html` already states, and the final breakfast price wording.

## Brand Commitments

- **Name:** Stories Hotel Budapest. The wordmark is a vector lockup — layered "STORIES" with a script "hotel" — used in the nav, the loader and the page-transition panel.
- **Voice:** editorial, first person plural, understated. Short declarative sentences, concrete detail over adjectives ("You order, you sit, you talk"), and an explicit rejection of anonymity as the recurring theme.
- **Address and contact** are fixed product facts: Király utca 26, Budapest VI; +36 1 808 0981.

## Evidence on Hand

- **Photography:** per-room galleries for all six types, plus bar, gym, coworking, breakfast and facade imagery, in `Ver3/assets/photos/` and `Ver3/assets/brand/`.
- **Generated motion:** a coffee-pour frame sequence, a coffee→Danube morph clip and a crane-to-sky clip, all AI-generated, in `Ver3/assets/coffee/` and `Ver3/assets/brand/`. Their provenance matters: they are illustrative atmosphere, not documentary photographs of the hotel.
- **Neighbourhood data:** seven walking destinations with names, categories and walking times, plotted on an interactive map. The map coordinates were estimated, not surveyed, and are flagged for verification.

**Absent — must not be fabricated:** guest testimonials, review scores, press coverage, awards, customer counts, occupancy or revenue figures, and room rates. None exist on the site today, and no future work may invent them.

## Product Principles

1. **The address is the argument.** When a page has to earn attention, reach for the neighbourhood and the building before reaching for adjectives.
2. **The building is the product, not just the bedroom.** Restaurant, bar, gym and coworking are reasons to book, not amenities in a list.
3. **Serve both guests without addressing either exclusively.** Atmosphere sells the leisure stay and quiet infrastructure sells the long one; neither may be starved for the other.
4. **Never claim what the hotel has not earned.** No invented proof, no borrowed prestige, no "included" where it is à la carte.
5. **A booking that cannot be made is a broken promise.** Every persuasive gain is void while the reservation route is a mock.

## Accessibility & Inclusion

**WCAG 2.1 AA is a confirmed requirement.**

Known gaps in the current implementation that future work must close: the FAQ accordion uses non-interactive `div`s where buttons with `aria-expanded` belong, and its category navigation is not real anchor links. Motion is heavy across the site — the homepage carries scrubbed frame sequences, autoplaying clips and a self-drawing loader — so `prefers-reduced-motion` fallbacks are not optional polish but part of the standard, and every new motion feature must ship one.
