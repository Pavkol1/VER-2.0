# Stories Hotel Budapest

The active website is in `Ver3/`. Netlify publishes this directory from `main`.
This is a static site with inline CSS and JavaScript and no build step.

## Local Preview

Run `./start-server.sh` from this checkout, then visit
http://localhost:8000/Ver3/. If port 8000 is already occupied, first check which
checkout its server serves; an existing server may belong to a Claude worktree.

## Layout

| Path | Purpose |
| --- | --- |
| `Ver3/` | Active English and Hungarian website and deploy assets |
| `docs/` | Product record, fact checks, agent reference, and client documents |
| `archive/legacy/` | Earlier versions, retained for reference |
| `archive/source-assets/` | Original photos and superseded source artwork, local only |
| `archive/local-state-2026-11-04/` | Preserved local instructions and uncommitted patch, local only |
| `.claude/worktrees/` | Separate Claude checkouts with their own Git state, local only |

Read `docs/PRODUCT.md` and `docs/FACT-CHECK.md` before changing product claims.
Do not copy archived HTML over active pages.

## Git and Deployment

Pushing `main` deploys the public site. Repository organization on 2026-11-04
updated this checkout to `91b4767` without publishing the cleanup.

The existing Claude worktree was left intact at
`.claude/worktrees/wonderful-mclaren-d67b3f`. It is a separate checkout and may
lag behind `main`; check its status and revision before continuing there.
Use this root checkout for the latest synchronized website.

The pre-cleanup tracked local changes are also retained in Git stash under
`Before repository organization 2026-11-04`. Inspect them selectively rather
than applying the entire stash over the newly organized paths.
