# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

No dominant segment — confirmed by the client as deliberately mixed, and the site must serve both without picking a side:

- **International leisure guests**, mostly couples on a 2–4 night city break, choosing visually between Budapest boutique hotels. They arrive via search or referral, judge on atmosphere, photography and neighbourhood, and decide quickly.
- **Business and longer-stay guests**, for whom the workrooms, the gym and quiet matter more than atmosphere.

Both are addressed in English, and since 2026-08-06 in Hungarian as well — `Ver3/hu/` is a full translation, not a partial one.

## Product Purpose

Stories Hotel Budapest is a 44-room boutique hotel at Király utca 26 in District VI. The website exists to convert an undecided browser into a direct booking, and to answer — before anyone has to ask reception — what the house is, where it sits, what a room is like, and what happens in the building.

Success is a completed direct reservation. Every page is in service of that; the reservation route is currently the site's weakest link.

## Positioning

**The address.** Király utca 26 sits on the seam of District VI and District VII, which puts the ruin-bar quarter, the Jewish Quarter, the Opera and the courtyards inside a short walk. A neighbouring boutique hotel can copy a look, a room count or a restaurant concept; it cannot copy this corner of the city or the specific set of places reachable on foot from this door.

The site already carries this as an editorial claim ("a quarter worth the walk", seven walking destinations with times), and it is the claim future work must protect and sharpen rather than dilute into generic boutique-hotel language.

## Operating Context

The hotel occupies the **Twenty Six building**, and the building — not just the bedrooms — is the product:

- **Twenty Six restaurant**, ground floor. Breakfast is served 07:30–11:00, à la carte, ordered at table. Menu prices are **not published** — sourcing claims (named suppliers, Hunyadi tér, "baked at dawn") were removed 2026-08-24 as unverified.
- **Bar and lounge**, 17:00–00:00 daily, positioned as a living room for the district rather than a hotel bar.
- **GoActive gym** (five minutes' walk) and **Create 26 coworking** (in the building), which carry the business and longer-stay case. **Neither is included in any rate** — they are neighbours' businesses and reception arranges access. Confirmed 2026-08-24; the site had wrongly promised both free with every stay.

Guests evaluate the hotel from a phone or laptop before arrival, and the neighbourhood is part of what they are evaluating.

## Capabilities and Constraints

**Rooms** — six types, 44 keys, all verified 2026-08-24: Presidential Suite (165–180 m², **three floors**, 2 king / 2.5 bath, jacuzzi and sauna, sleeps 6, **no terrace**), King Suite (85 m², jacuzzi, private sauna, **rainfall** shower), Junior Suite (65–75 m², sleeps 4), Deluxe Room (34–45 m²), Deluxe Queen Room (30 m², inner courtyard, **not** south-facing), Superior Room (17 m²).

**Breakfast is à la carte and is not included in any room rate.** This has been stated explicitly and must never be reworded into "included". **The price must not appear on the site** — client decision, 2026-08-06. Every mention reads "ask reception"; the former "€18 per person" wording is retired and must not be reintroduced. Hours are **07:30–11:00**, confirmed the same day, and are now consistent on every page.

**Confirmed constraints for all future work:**

- ~~A real reservation destination is required before launch.~~ **Done** — booking runs through SabeeApp, and `contact.html` posts to Netlify Forms as of 2026-08-24 (delivery to info@storiesbudapest.com still needs the notification configured in the Netlify dashboard).
- ~~A Hungarian version is required.~~ **Done 2026-08-06** — `Ver3/hu/` carries a full translation of all seven pages, with `hreflang` en/hu/x-default, per-language canonicals and a working EN|HU switch in the nav, mobile menu and footer. The trade-off accepted: two copies of every page, kept in sync by hand (no build step). Register is *magázó* throughout.
- **Typography licences are an open commitment.** The design references the commercial *Gangster* and *ABC Monument Grotesk*; the site currently ships free stand-ins (Libre Caslon Text, Schibsted Grotesk). If the licences are bought, the originals replace the stand-ins.
- **WCAG AA is a requirement**, not an aspiration. See Accessibility & Inclusion.

**Technical** — static multi-page site, no build step, framework or package manager; each page is self-contained with its CSS and JS inline. `Ver3/` is the live root and `Ver2/` is frozen legacy. Deployed on Netlify; a push to `main` is a production deploy.

**Undecided, not to be invented:** room rates and cancellation terms beyond what `faqs.html` already states.

## Brand Commitments

- **Name:** Stories Hotel Budapest. The wordmark is a vector lockup — layered "STORIES" with a script "hotel" — used in the nav, the loader and the page-transition panel.
- **Voice:** editorial, first person plural, understated. Short declarative sentences, concrete detail over adjectives ("You order, you sit, you talk"), and an explicit rejection of anonymity as the recurring theme.
- **Address and contact** are fixed product facts: Király utca 26, Budapest VI; +36 1 808 0981; WhatsApp +36 20 318 0027; info@storiesbudapest.com. The house opened in **2019**.

## Evidence on Hand

- **Photography:** per-room galleries for all six types, plus bar, gym, coworking, breakfast and facade imagery, in `Ver3/assets/photos/` and `Ver3/assets/brand/`.
- **Generated motion:** a coffee-pour frame sequence, a coffee→Danube morph clip and a crane-to-sky clip, all AI-generated, in `Ver3/assets/coffee/` and `Ver3/assets/brand/`. Their provenance matters: they are illustrative atmosphere, not documentary photographs of the hotel.
- **Neighbourhood data:** seven walking destinations with names, categories and walking times, plotted on an interactive map. The map coordinates were estimated, not surveyed, and are flagged for verification.

**Absent — must not be fabricated:** guest testimonials, review scores, press coverage, awards, customer counts, occupancy or revenue figures, and room rates. No future work may invent them.

A previous pass had put an invented "4.8 / 5 · 1200+ stays" rating, a "From €55 each way" transfer price and a "Lowest rate, guaranteed" claim on the homepage; all were **removed 2026-08-06**. [FACT-CHECK.md](FACT-CHECK.md) tracks them, plus every other unverified claim on the site, as numbered questions for the client. Nothing from that list goes back without a confirmed source.

## Product Principles

1. **The address is the argument.** When a page has to earn attention, reach for the neighbourhood and the building before reaching for adjectives.
2. **The building is the product, not just the bedroom.** Restaurant, bar, gym and coworking are reasons to book, not amenities in a list.
3. **Serve both guests without addressing either exclusively.** Atmosphere sells the leisure stay and quiet infrastructure sells the long one; neither may be starved for the other.
4. **Never claim what the hotel has not earned.** No invented proof, no borrowed prestige, no "included" where it is à la carte.
5. **A booking that cannot be made is a broken promise.** Every persuasive gain is void while the reservation route is a mock.

## Accessibility & Inclusion

**WCAG 2.1 AA is a confirmed requirement.**

Known gaps in the current implementation that future work must close: the FAQ accordion uses non-interactive `div`s where buttons with `aria-expanded` belong, and its category navigation is not real anchor links. Motion is heavy across the site — the homepage carries scrubbed frame sequences, autoplaying clips and a self-drawing loader — so `prefers-reduced-motion` fallbacks are not optional polish but part of the standard, and every new motion feature must ship one.
