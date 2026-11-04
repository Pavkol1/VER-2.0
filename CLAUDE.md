# Claude Code Handoff

Read `AGENTS.md` and `README.md` first.

The active site is `Ver3/`, including the Hungarian pages in `Ver3/hu/`.
Netlify publishes `Ver3` from `main`, and `main` is also the working branch.
A push to `main` is a production deploy — ask first.

Two machines work on this repo: Pavlo's MacBook and the hotel's reception PC
(Windows). Before starting, `git fetch` and compare with `origin/main` — the
other machine may have pushed since. Some folders exist on only one machine;
`docs/CLAUDE-reference.md` → Repository Layout lists which.

Detailed product and technical context:

- `docs/PRODUCT.md` — confirmed product facts and what must never be invented
- `docs/FACT-CHECK.md` — open questions to the client
- `docs/CLAUDE-reference.md` — design system, page architecture, room service,
  deployment, and how to verify scroll work in a browser

Old versions are under `archive/legacy/`. Do not edit them as if they were the
live site.
