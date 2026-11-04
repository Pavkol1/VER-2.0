# Stories Hotel Budapest

The active website is in `Ver3/`. Netlify publishes this directory from `main`.
This is a static site with inline CSS and JavaScript and no build step.

## Local Preview

Run `./start-server.sh` from this checkout, then visit
http://localhost:8000/Ver3/. If port 8000 is already occupied, first check which
checkout its server serves.

## Layout

| Path | Purpose |
| --- | --- |
| `Ver3/` | Active English and Hungarian website and deploy assets |
| `docs/` | Product record, fact checks, agent reference, client documents, email design |
| `archive/legacy/` | Earlier versions, retained for reference |

Some folders are kept out of git on purpose and exist on only one machine —
for example `archive/source-assets/` (original photos) on the MacBook. See
`docs/CLAUDE-reference.md` → Repository Layout.

Read `docs/PRODUCT.md` and `docs/FACT-CHECK.md` before changing product claims.
Do not copy archived HTML over active pages.

## Git and Deployment

`main` is both the working branch and production: pushing it deploys the
public site within seconds. Older branches (`feature/room-service`,
`claude/wonderful-mclaren-d67b3f`) are behind `main` and not in use.
