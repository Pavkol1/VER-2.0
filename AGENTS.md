# Repository Instructions

- Active website: `Ver3/`; production configuration: `netlify.toml`.
- Static HTML, inline CSS and JavaScript. No build step or package installation.
- English pages and their Hungarian equivalents in `Ver3/hu/` must stay aligned.
- Read `docs/PRODUCT.md`, `docs/FACT-CHECK.md`, and `docs/CLAUDE-reference.md`
  before product or design changes. Preserve the established design system.
- Before frontend edits, invoke `impeccable` if it is installed on this machine,
  otherwise `frontend-design:frontend-design` (never both).
- Preserve DOM safety: use `textContent`, never `innerHTML`.
- Respect reduced motion, keyboard access, visible focus, and mobile tap targets.
- Verify frontend changes in a browser. Do not infer success from syntax alone.
- `archive/` contains historical files and source material, never active code.
- Two machines (MacBook, reception PC) push to this repo. `git fetch` first.
- `.claude/worktrees/`, where present, contains independent checkouts. Inspect
  their Git state first. Never blindly copy a worktree over this checkout.
- Run `./start-server.sh`; preview http://localhost:8000/Ver3/.
- A push to `main` deploys production. Commit or push only when requested.
- Do not discard unrelated local changes or delete archived material.
