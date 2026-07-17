# Issue & PR triage — 2026-07-17 (post-modernization)

Full triage of all 43 open issues and the one open non-Dependabot PR, against the modernized
codebase (PR #137: CRA→Vite, React 18, TypeScript strict, pnpm, new CI with audit/gitleaks/CodeQL,
semantic-release, multi-stage nginx Docker image).

> **Note on execution:** this session's GitHub credentials allow code push + PR creation only —
> every issue-comment / issue-close / PR-close API call returned `403 Resource not accessible by
integration`. The verdicts and ready-to-paste comment text below are therefore delivered as this
> document instead of applied directly. Each section says exactly what to do (close vs. keep open)
> and gives the comment to post.

## Summary table

| #            | Title (short)                              | Verdict                                       | Action             |
| ------------ | ------------------------------------------ | --------------------------------------------- | ------------------ |
| PR #129      | Copilot cleanup of dev artifacts           | (c→a) Obsolete                                | Close with comment |
| #112–#116    | Epic + subs: migrate to Vite / Docker / CI | (a) Resolved by #137                          | Close as completed |
| #25, #54–#60 | Epic + subs: TypeScript migration          | (a) Resolved by #137 (#57 dup of #58)         | Close as completed |
| #2, #44–#49  | Epic + subs: Tailwind CSS v4 migration     | (c) Unclear — Tailwind was _not_ adopted      | Keep open, ask     |
| #43          | Master epic: modernization & code quality  | (b) Mostly done, blocked on Tailwind decision | Keep open, comment |
| #105–#108    | Epic + subs: default UI fixes (responsive) | (b) Still valid                               | Keep open, comment |
| #21, #4–#19  | Epic + subs: env-driven UI customization   | (b) Still valid                               | Keep open, comment |
| #20          | Multi-page countdown support               | (c) Unclear — needs architecture decision     | Keep open, ask     |

---

## PR #129 — "Cleanup: Remove development artifacts…" → **close**

Ready-to-paste comment:

> **Triage: obsolete after the modernization (PR #137) — closing.**
>
> This PR targets the pre-modernization feature branch
> `feature/issue-43-project-modernization-code-quality`, which was superseded when the
> CRA→Vite/React 18/TypeScript/pnpm rewrite landed on `master` via #137. Checking its diff against
> current `master`:
>
> - `.babelrc`, `.env`, `DOCKER_MODERNIZATION.md`, `Dockerfile.remote-test`,
>   `ISSUE_50_PROGRESS.md`, `issues.json` — already gone from `master`.
> - The `.gitignore` additions are covered by the modernized `.gitignore`.
> - `TODO.md` still exists on `master`, but it now serves as the feature backlog; removing it
>   should be a deliberate follow-up, not part of this stale cleanup.
>
> Nothing in the diff still applies, and the base branch itself is defunct, so this can never
> reach `master` as-is.

---

## Vite migration — #112 (epic), #113, #114, #115, #116 → **close all as completed**

- **#113 (Add Vite configuration and replace existing bundler)**

  > Resolved by #137. `vite.config.ts` is in place (`base: './'`, `outDir: build/`),
  > `pnpm dev`/`pnpm build` run Vite with HMR, TypeScript is integrated via
  > `@vitejs/plugin-react` + `tsconfig.json`, and the legacy CRA/react-scripts bundler is fully
  > removed. (The Tailwind portion mentioned in the body was not adopted — see #2.) Closing.

- **#114 (Update Docker setup to support Vite builds)**

  > Resolved by #137. The Dockerfile is multi-stage: `base` (node:24-alpine, pnpm deps + source)
  > → `build` (`pnpm build`) → runtime (nginx:alpine-slim serving `build/` on :3000 — no node or
  > node_modules in the final image). Layer caching is optimized (deps before source), and
  > `docker-compose.dev.yml` targets the `base` stage for live dev. Closing.

- **#115 (Configure Docker environment variables for Vite)**

  > Resolved by #137, but with a deliberately different design than the `VITE_*` approach this
  > issue proposed: Vite env vars are baked at **build** time, which would break the
  > one-image-many-deployments model. Instead, `variables.sh` + `docker-entrypoint.sh` substitute
  > `TIMER_BACKGROUND`/`TIMER_TARGET`/`TIMER_TITLE` into `variables-final.js` at **container
  > start**, and `index.html` loads it as a plain script. Same config works in local dev, Docker,
  > and CI. This is now a documented invariant in CLAUDE.md ("never replace with
  > `import.meta.env`"). Closing.

- **#116 (Update CI/CD pipelines to support Vite with Docker)**

  > Resolved by #137. `ci.yml` runs `pnpm lint`, `format:check`, `typecheck`, `test` (Vitest),
  > `pnpm build`, `pnpm audit --audit-level high`, and gitleaks on every push/PR to master, with
  > pnpm store caching. Releases are automated by semantic-release (`release.yml`), and published
  > releases trigger `docker-publish.yml` pushing `yiddy/simple-countdown:<semver>` + `:latest`.
  > GitHub Pages deploy also runs the Vite build. Closing.

- **#112 (Epic: Migrate build system to Vite)**
  > All sub-issues (#113–#116) are resolved by #137 — see individual closing comments. The
  > project builds with Vite locally, in CI, and in Docker; docs (README/CLAUDE.md) reflect the
  > new tooling. Closing the epic.

---

## TypeScript migration — #25 (epic), #54, #55, #56, #57, #58, #59, #60 → **close all as completed**

- **#54 (Initialize TypeScript)**

  > Resolved by #137: `tsconfig.json` with `strict: true` and `jsx: react-jsx`; `typescript` +
  > `@types/react`/`@types/react-dom` installed (via pnpm, which replaced npm). Closing.

- **#55 (Convert .js/.jsx to .ts/.tsx)**

  > Resolved by #137: everything under `src/` is `.ts`/`.tsx` (`App.tsx`, `index.tsx`,
  > `scenes/Home/**`, `service/date.ts`). The only intentional plain-JS files are
  > `public/variables.js` (pre-bundle runtime template) and `scripts/export-issues.js` (Node
  > utility), per CLAUDE.md. Closing.

- **#56 (Add types for props and state)**

  > Resolved by #137: all components use typed props (e.g. `NumberDisplayProps`,
  > `BlockProps`) and typed state; runtime globals are declared on `Window` in
  > `src/vite-env.d.ts`. PropTypes are gone. Closing.

- **#57 (Update utility and helper functions with types)**

  > Duplicate of #58 (identical body), and both are resolved by #137 — `src/service/date.ts` is
  > fully typed (`DurationLabel`, `Record<DurationLabel, number>`). Closing as duplicate.

- **#58 (Add TypeScript types to utility functions)**

  > Resolved by #137: `src/service/date.ts` is fully typed with `const`-derived unions and
  > `Record` types; `@typescript-eslint/no-explicit-any` is an **error**, so no `any` remains.
  > Closing.

- **#59 (Update ESLint and Prettier configurations)**

  > Resolved by #137: ESLint 9 flat config (`eslint.config.js`) with typescript-eslint
  > `strictTypeChecked`, react/react-hooks/jsx-a11y plugins, `eslint-config-prettier`, and
  > Prettier as the only formatter (`pnpm format:check` gates CI). Closing.

- **#60 (Verify build and deployment pipelines)**

  > Resolved by #137: CI runs `pnpm typecheck` and `pnpm build` on every push/PR; Docker,
  > Pages deploy, and semantic-release all build from the TypeScript codebase. Closing.

- **#25 (Epic: Convert project to TypeScript)**
  > All sub-issues (#54–#60) resolved by #137: strict-mode TypeScript everywhere in `src/`,
  > typed tooling, updated lint/build/test pipelines, tests passing under Vitest. Closing the
  > epic.

---

## Tailwind migration — #2 (epic), #44, #45, #46, #47, #48, #49 → **keep open, needs a decision**

The modernization did **not** adopt Tailwind: styling landed as plain CSS + CSS modules
(`src/App.css`, `src/scenes/Home/*.module.css`). These issues are neither resolved nor clearly
still wanted — that's a product decision.

Suggested comment on **#2** (and a one-liner on #44–#49 pointing to it):

> **Triage: needs a decision.** The modernization (PR #137) landed with plain CSS + CSS modules,
> not Tailwind — this epic was never implemented. Two options:
>
> 1. **Close as superseded**: the app's styling surface is tiny (4 small CSS files); CSS modules
>    are already typed-checked into the build and the planned env-driven customization (#21)
>    works fine via CSS custom properties. Tailwind would add a dependency for little gain.
> 2. **Still migrate**: if so, this needs re-scoping against the Vite setup (Tailwind v4 has a
>    first-party Vite plugin; sub-issues #44/#45 as written reference npm and PostCSS steps that
>    no longer apply — pnpm and the Vite plugin would be used instead).
>
> Recommendation: option 1 (close), and fold the layout fixes referenced here into the
> UI epic #105. Sub-issues #44–#49 follow whatever is decided here.

---

## Master epic #43 (Project Modernization & Code Quality) → **keep open, comment**

> **Triage update.** Status of the sub-epics after PR #137:
>
> - TypeScript migration (#25) — ✅ done.
> - Package management (#3) — ✅ done, though the outcome is **pnpm**, not npm (pinned via
>   `packageManager`, `pnpm-lock.yaml` is the only lockfile).
> - Code quality & standards (#42) — ✅ done: ESLint 9 strictTypeChecked, Prettier, conventional
>   commits enforced by semantic-release, CI gates (lint/format/typecheck/test/build/audit/
>   gitleaks), CodeQL, Dependabot.
> - Styling modernization (#2) — ❓ not implemented; needs a keep-or-close decision (see #2).
>
> Keeping this open only until #2 is decided; then it can close.

---

## Default-UI epic — #105 (epic), #106, #107, #108 → **keep open, still valid**

These are visual/responsive bugs that predate the modernization but are independent of the build
system, so they carry over. Suggested comment on each (adjust per issue):

> **Triage: still valid post-modernization (PR #137).** The styling now lives in CSS modules
> (`src/scenes/Home/index.module.css` and per-component modules), so the fix should be re-verified
> and implemented there. Note the digit animation uses fixed 100px offsets in
> `src/scenes/Home/NumberDisplay/index.tsx`, which constrains responsive scaling of the
> number containers (#108) — scaling likely means moving to `em`-based transforms or a CSS
> variable. If the Tailwind epic (#2) is closed as recommended, these fixes proceed in CSS
> modules. Blocked on nothing; good candidates for the first post-modernization UI milestone.

Per-issue notes:

- **#106 (title sizing)** — `clamp()`-based responsive font size on the title class in
  `index.module.css`; also on the roadmap under UX polish.
- **#107 (background centering on mobile)** — `background-position: center` /
  `background-size: cover` on the root; verify with dev-tools device emulation.
- **#108 (number-container sizing/alignment)** — see the 100px-offset note above; highest-effort
  of the three.
- **#105 (epic)** — remains open as the tracking issue for the above.

---

## Env-driven customization epic — #21 (epic), #4–#19 → **keep open, still valid**

All still-relevant feature requests. Suggested comment on **#21** (one-liner on subs pointing
here):

> **Triage: still valid post-modernization (PR #137), with one important constraint.** Runtime
> configuration now works exclusively through `variables.sh` placeholder substitution
> (`TIMER_*` env → `public/variables.js` → `variables-final.js` → typed `window.*` globals in
> `src/vite-env.d.ts`), executed both pre-build and at Docker container start. **Do not implement
> any of these via `import.meta.env`** — Vite env vars are build-time and would break the
> one-image-per-deployment model (documented in CLAUDE.md). Each new variable therefore needs:
> a placeholder in `public/variables.js`, a substitution line in `variables.sh` (POSIX sh),
> a typed `Window` declaration, and a README table row. Naming should follow the existing
> `TIMER_*` prefix (several issue bodies propose unprefixed names like `ALIGN`/`BORDER_COLOR` —
> prefix them). Styling values are best applied as CSS custom properties set on the root
> element. #16 (auto-reload) and #17 (redirect) overlap with the countdown-zero behavior
> being designed in the post-modernization roadmap — coordinate there.

Sub-issue one-liner:

> Still valid after PR #137 — see the triage comment on epic #21 for the required
> implementation pattern (runtime `variables.sh` injection, `TIMER_*` naming, no
> `import.meta.env`).

Applies to: #4 (logo), #5 (digit color), #6 (digit font size), #7 (font family), #8 (title
color), #9 (title font size), #10 (show seconds), #11 (alignment), #12 (border color),
#13 (border radius), #14 (format string), #15 (labels toggle), #16 (auto-reload),
#17 (redirect URL), #18 (contrast overlays/shadows), #19 (favicon).

---

## #20 (Multi-page countdown support) → **keep open, question**

> **Triage: unclear — needs an architecture decision before work starts.** The current design is
> a static nginx site with a single runtime-injected config (`variables-final.js`); there is no
> router and no server-side logic, which keeps the image ~21 MB and CVE-free. Multi-page support
> as described (per-page config file, `/page1` routes, admin page, `DEFAULT_PAGE`) implies either
> (a) client-side routing + a JSON config mounted as a volume and injected the same way
> `variables.sh` works today (feasible, keeps nginx-only), or (b) a real backend (rejects the
> current zero-runtime model). If this is still wanted, recommend scoping it to (a) and dropping
> the admin page into a separate issue. Is (a) acceptable, or should this be closed as
> out-of-scope for a "simple" countdown?
