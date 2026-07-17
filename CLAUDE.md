# simple-countdown

Self-hostable countdown timer (fork of easy-countdown). React 18 + TypeScript + Vite.
The primary deployment target is a single Docker container configured at **runtime** via env vars.

## Claude Code workflow

- Delegate well-specified, mechanical implementation work (file conversions, config churn, bulk edits,
  test writing from a spec) to subagents on lower-cost models (Haiku/Sonnet) instead of doing everything
  in the main loop. Keep design decisions, cross-cutting changes, and verification in the main session.

## Package management

- **pnpm only** — never npm or yarn. `packageManager` is pinned in package.json; `pnpm-lock.yaml` is the only lockfile.
- Use `pnpm dlx` instead of `npx`.

## Runtime configuration (do not "modernize" this)

`variables.sh <dir>` copies `<dir>/variables.js` to `<dir>/variables-final.js` and substitutes the
`__BACKGROUND__` / `__END__` / `__TITLE__` placeholders from `TIMER_BACKGROUND` / `TIMER_TARGET` / `TIMER_TITLE` env vars.

- It runs before `vite`/`vite build` (`pnpm dev` / `pnpm build`) **and again at Docker container start**
  (`docker-entrypoint.sh` runs it against the nginx html dir), so one prebuilt image is configured per-deployment via docker-compose env.
- **Never replace this with `import.meta.env`** — Vite env vars are baked at build time and would break runtime configuration.
- `index.html` loads `./variables-final.js` as a plain (non-module) script; Vite's "can't be bundled" build warning is expected and correct.
- The typed `Window` globals (`window.background`, `window.target`, `window.title`) are declared in `src/vite-env.d.ts`.
- Known issue: an empty/invalid `TIMER_TARGET` produces `Invalid Date` → NaN countdown (pre-existing; TODO).

## Build

- `build.outDir` is `build/` (not Vite's default `dist/`) — the Dockerfile, `variables.sh build`, and the Pages deploy all depend on it.
- `vite.config.ts` uses `base: './'` so the app works on GitHub Pages subpaths; keep asset references relative.

## Code standards

- TypeScript strict mode everywhere in `src/`; `@typescript-eslint/no-explicit-any` is an **error** — no `any`, ever.
- ESLint 9 flat config (`eslint.config.js`) with typescript-eslint `strictTypeChecked`; Prettier is the only formatter.
- `scripts/export-issues.js` and `public/variables.js` are intentionally plain JS (Node utility / pre-bundle template) with relaxed lint rules.
- All text files are LF (`.gitattributes` `* text=auto eol=lf`). Shell scripts especially must stay LF or sed/bash breaks in alpine.

## Git & releases

- Default branch: `master`.
- Conventional commits (`feat:`, `fix:`, `chore:`, …); branch naming `<type>/<short-description>` in kebab-case.
- Cloud/CI agent sessions: the auto-created `claude/...` working branch must never be the PR branch.
  Before opening a PR, move the work to a conventionally named branch and push that instead:
  `git checkout -b <type>/<short-description> && git push -u origin <type>/<short-description>`.
  A branch ruleset blocks creation of branches outside `<type>/**`, `dependabot/**`, and `claude/**`.
- **Versioning is automated** — never bump `package.json` version by hand. semantic-release runs on every push
  to master (`.github/workflows/release.yml`): `fix:` → patch, `feat:` → minor, `BREAKING CHANGE:` → major.
  It commits the bump + CHANGELOG.md with `chore(release): x.y.z [skip ci]`, tags, and creates a GitHub Release.

## CI gates (all must pass)

`.github/workflows/ci.yml` on push/PR to master: `pnpm lint`, `pnpm format:check`, `pnpm typecheck`,
`pnpm test` (Vitest), `pnpm build`, `pnpm audit --audit-level high` (high/critical CVEs fail CI), and
gitleaks secret scanning over full git history (any committed secret fails CI).
CodeQL (`codeql.yml`) scans JS/TS + Actions. Dependabot opens weekly bump PRs (npm, docker, github-actions).
Published releases trigger `docker-publish.yml`, pushing `yiddy/simple-countdown:<semver>` and `:latest`.

## Testing

- Vitest; unit tests co-located as `__tests__/<Subject>.test.ts` next to the module (see `src/service/__tests__/Date.test.ts`).
- Test behavior, not implementation. Run `pnpm test` before reporting any task complete.
- `describe()` in `src/service/date.ts` must keep key insertion order day → hour → minute → second; `Home` renders blocks from `Object.entries` order.

## Docker

- Multi-stage `Dockerfile`: `base` (node:24-alpine, deps + source) → `build` (`pnpm build`) → runtime
  (nginx:alpine-slim serving `build/` on :3000 — no node or node_modules in the final image, keeping it
  small and CVE-free).
- `docker-compose.dev.yml` targets the `base` stage (`build.target: base`) and runs `pnpm dev -- --host`
  with `src/`+`public/` mounted for live dev.
- `docker-entrypoint.sh` (JSON-form ENTRYPOINT) injects TIMER_* env at container start, then execs nginx.
- `variables.sh` is POSIX sh (`#!/bin/sh`) so the runtime image needs no bash — keep it POSIX.
- Shell scripts carry the git executable bit (set via `git update-index --chmod=+x`); preserve it when
  editing them from Windows.
